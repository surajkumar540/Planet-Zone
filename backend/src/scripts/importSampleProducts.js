/**
 * Imports ~100 sample products with real photos from DummyJSON, a public
 * dataset made for testing shops.
 *
 *   npm run data:sample
 *
 * - Images are not downloaded: the database stores their URLs, and the files
 *   stay on DummyJSON's CDN. Real products should use your own image host.
 * - Products are spread evenly across categories and placed in a two-level
 *   category tree (e.g. Fashion → Mens Shoes).
 * - Prices are converted from USD to INR and rounded to a shop-style ₹…9.
 * - Ratings are NOT copied: reviews here come only from verified buyers.
 * - Safe to re-run: products whose name already exists are skipped.
 */
const env = require("../config/env");
const logger = require("../core/logger");
const prisma = require("../db/client");
const { connectDatabase, disconnectDatabase } = require("../config/database");
const productService = require("../modules/product/product.service");
const categoryService = require("../modules/category/category.service");
const { ROLES } = require("../constants/roles");

const SOURCE = "https://dummyjson.com/products?limit=0";
const TARGET_COUNT = 100;
const USD_TO_INR = 83;

/** Top-level groups for DummyJSON's flat categories. */
const GROUPS = {
  "Beauty & Fragrance": ["beauty", "fragrances", "skin-care"],
  "Home & Kitchen": ["furniture", "home-decoration", "kitchen-accessories"],
  Electronics: ["laptops", "smartphones", "tablets", "mobile-accessories"],
  Fashion: [
    "mens-shirts", "mens-shoes", "mens-watches", "womens-dresses", "womens-shoes",
    "womens-watches", "womens-bags", "womens-jewellery", "tops", "sunglasses",
  ],
  Groceries: ["groceries"],
  // Vehicles and motorcycles are left out: they are not shop items and their
  // prices (₹10+ lakh) would distort every price filter.
  "Sports & Outdoors": ["sports-accessories"],
};

/** Essentials attract 5% GST in India; most other goods 18%. */
const gstFor = (category) => (category === "groceries" ? 5 : 18);

const titleCase = (slug) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** USD → INR, rounded to end in 9 (₹1,299 rather than ₹1,302.47). */
const toRupees = (usd) => Math.max(49, Math.round((usd * USD_TO_INR) / 10) * 10 - 1);

/** Round-robin across categories so no single shelf dominates the sample. */
const pickBalanced = (products, count) => {
  const byCategory = new Map();
  for (const product of products) {
    if (!byCategory.has(product.category)) byCategory.set(product.category, []);
    byCategory.get(product.category).push(product);
  }
  const queues = [...byCategory.values()];
  const picked = [];
  while (picked.length < count && queues.some((queue) => queue.length)) {
    for (const queue of queues) {
      if (queue.length && picked.length < count) picked.push(queue.shift());
    }
  }
  return picked;
};

const ensureCategories = async () => {
  const existing = await prisma.category.findMany({ select: { id: true, name: true, parentId: true } });
  const find = (name, parentId) =>
    existing.find((category) => category.name === name && category.parentId === (parentId ?? null));

  const leaves = new Map();
  let position = 0;
  for (const [groupName, slugs] of Object.entries(GROUPS)) {
    const group =
      find(groupName, null) || (await categoryService.create({ name: groupName, position: position++, isActive: true }));
    const groupId = group.id || group._id;

    let childPosition = 0;
    for (const slug of slugs) {
      const name = titleCase(slug);
      const leaf =
        find(name, groupId) ||
        (await categoryService.create({ name, parent: groupId, position: childPosition++, isActive: true }));
      leaves.set(slug, { id: leaf.id || leaf._id, name });
    }
  }
  return leaves;
};

const toPayload = (item, category, featured) => {
  // The thumbnail is a ~300px preview; shown full size it looks blurry, so it
  // is only used when a product has no full-size images at all.
  const fullSize = (item.images || []).filter(Boolean);
  const images = fullSize.length ? [...new Set(fullSize)] : [item.thumbnail].filter(Boolean);
  const firstSentence = (item.description || "").split(/(?<=\.)\s/)[0];

  const attributes = [
    item.warrantyInformation && { code: "warranty", name: "Warranty", value: item.warrantyInformation },
    item.returnPolicy && { code: "returns", name: "Returns", value: item.returnPolicy },
    item.shippingInformation && { code: "shipping", name: "Shipping", value: item.shippingInformation },
    item.minimumOrderQuantity > 1 && { code: "min-order", name: "Minimum order", value: `${item.minimumOrderQuantity} units` },
  ].filter(Boolean);

  return {
    name: item.title,
    brand: item.brand || "Planet Zone",
    category: category.name,
    categoryRef: category.id,
    description: item.description,
    shortDescription: firstSentence.length <= 500 ? firstSentence : "",
    image: images[0],
    images: images.slice(1, 6),
    price: toRupees(item.price),
    discount: Math.min(40, Math.round(item.discountPercentage || 0)),
    gst: gstFor(item.category),
    countInStock: Math.max(0, Math.round(item.stock || 0)),
    lowStockThreshold: 5,
    sku: String(item.sku || "").slice(0, 60),
    attributes,
    dimensions: item.dimensions
      ? { length: item.dimensions.depth || 0, width: item.dimensions.width || 0, height: item.dimensions.height || 0 }
      : undefined,
    isActive: true,
    isFeatured: featured,
  };
};

const run = async () => {
  if (env.isProduction) {
    logger.error("Sample data is for development only; refusing to run in production");
    process.exit(1);
  }
  await connectDatabase();

  try {
    const owner = await prisma.user.findFirst({ where: { role: ROLES.ADMIN }, orderBy: { createdAt: "asc" } });
    if (!owner) throw new Error("No admin user found. Run `npm run data:import` first.");

    const response = await fetch(SOURCE);
    if (!response.ok) throw new Error(`DummyJSON returned HTTP ${response.status}`);
    const { products } = await response.json();

    const wanted = new Set(Object.values(GROUPS).flat());
    const picked = pickBalanced(products.filter((item) => wanted.has(item.category)), TARGET_COUNT);
    const categories = await ensureCategories();

    const existingNames = new Set(
      (await prisma.product.findMany({ select: { name: true } })).map((product) => product.name)
    );

    // The first product of each category is featured, giving the home page a varied shelf.
    const featuredCategories = new Set();
    let created = 0;
    let skipped = 0;

    for (const item of picked) {
      if (existingNames.has(item.title)) {
        skipped += 1;
        continue;
      }
      const category = categories.get(item.category);
      if (!category) {
        skipped += 1;
        continue;
      }
      const featured = !featuredCategories.has(item.category) && featuredCategories.size < 8;
      if (featured) featuredCategories.add(item.category);

      await productService.createProduct(owner.id, toPayload(item, category, featured));
      created += 1;
      if (created % 10 === 0) logger.info(`Imported ${created} products…`);
    }

    logger.info(`Done: ${created} products imported, ${skipped} skipped, ${categories.size} categories ready`);
    process.exitCode = 0;
  } catch (error) {
    logger.error(`Sample import failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
};

run();
