/**
 * `npm run data:natural`: imports the natural & organic products saved in
 * backend/data/natural-products.json (built by `npm run data:natural:fetch`).
 *
 * - Creates "Natural Foods" and "Personal Care" departments, one shelf per group.
 * - Names, brands, sizes, labels, origins, ingredients and photos are the
 *   products' real data from Open Food Facts / Open Beauty Facts. Prices and
 *   stock are sample values (those databases have no prices), within
 *   realistic ranges per shelf.
 * - Skips any product whose name already exists, so it is safe to re-run.
 * - Development only, like the other sample-data scripts.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const env = require("../config/env");
const logger = require("../core/logger");
const prisma = require("../db/client");
const { connectDatabase, disconnectDatabase } = require("../config/database");
const productService = require("../modules/product/product.service");
const categoryService = require("../modules/category/category.service");
const { ROLES } = require("../constants/roles");

const SOURCE = path.resolve(__dirname, "../../data/natural-products.json");
/** Food shelves and personal-care shelves live in separate departments. */
const DEPARTMENTS = { food: "Natural Foods", beauty: "Personal Care" };

/** Price range in rupees (before GST) per shelf, for sample pricing. */
const PRICE_RANGES = {
  "Honey & Spreads": [249, 899],
  "Herbal & Green Tea": [149, 599],
  "Nuts & Seeds": [299, 1299],
  "Dried Fruits": [199, 899],
  "Spices & Herbs": [79, 399],
  "Oats & Granola": [199, 699],
  "Natural Oils": [349, 1499],
  "Soaps & Cleansers": [99, 449],
  "Hair Care": [249, 899],
  "Body & Lip Care": [149, 999],
};

/** A stable number in [0, 1) per product, so re-running gives the same prices. */
const seeded = (code, salt) => parseInt(crypto.createHash("md5").update(`${code}:${salt}`).digest("hex").slice(0, 8), 16) / 0xffffffff;

const priceFor = (item) => {
  const [low, high] = PRICE_RANGES[item.shelf] || [149, 799];
  const raw = low + seeded(item.code, "price") * (high - low);
  return Math.max(low, Math.round(raw / 10) * 10 - 1); // ends in 9, like shop prices
};

/** "500 g", "1 kg", "250ml" → grams (millilitres counted as grams). */
const gramsFrom = (quantity) => {
  const match = String(quantity).toLowerCase().match(/(\d+(?:[.,]\d+)?)\s*(kg|g|gr|ml|l|cl)\b/);
  if (!match) return 0;
  const value = Number(match[1].replace(",", "."));
  return Math.round(value * ({ kg: 1000, l: 1000, cl: 10, g: 1, gr: 1, ml: 1 }[match[2]] || 0));
};

const describe = (item) => {
  const parts = [];
  parts.push(item.generic ? `${item.generic}.` : `${item.name} by ${item.brand}.`);
  if (item.labels.length) parts.push(`${item.labels.join(", ")}.`);
  if (item.quantity) parts.push(`Pack size: ${item.quantity}.`);
  if (item.origin) parts.push(`Origin: ${item.origin}.`);
  if (item.ingredients) parts.push(`Ingredients: ${item.ingredients}${item.ingredients.length >= 300 ? "…" : ""}`);
  return parts.join(" ");
};

const toPayload = (item, category, featured) => {
  const credit = item.site === "beauty" ? "Open Beauty Facts" : "Open Food Facts";
  const attributes = [
    item.quantity && { code: "quantity", name: "Pack size", value: item.quantity },
    item.labels.length && { code: "labels", name: "Labels", value: item.labels.join(", ") },
    item.origin && { code: "origin", name: "Origin", value: item.origin },
    { code: "source", name: "Product data & photo", value: `${credit} (photo CC BY-SA)` },
  ].filter(Boolean);
  return {
    name: item.name,
    brand: item.brand.slice(0, 100),
    category: category.name,
    categoryRef: category.id,
    description: describe(item).slice(0, 5000),
    shortDescription: [item.quantity, ...item.labels.slice(0, 2)].filter(Boolean).join(" · ").slice(0, 500),
    image: item.image,
    images: [],
    price: priceFor(item),
    discount: Math.round(seeded(item.code, "discount") * 20),
    gst: item.site === "food" ? 5 : 18,
    countInStock: 12 + Math.round(seeded(item.code, "stock") * 120),
    lowStockThreshold: 5,
    sku: `NAT-${String(item.code).slice(-8)}`,
    weightGrams: gramsFrom(item.quantity),
    attributes,
    isActive: true,
    isFeatured: featured,
  };
};

/** Each department and its shelves, created if missing. `shelves` is [{ shelf, site }]. */
const ensureShelves = async (shelves) => {
  const existing = await prisma.category.findMany({ select: { id: true, name: true, parentId: true, position: true } });
  let nextTop = Math.max(0, ...existing.filter((category) => !category.parentId).map((category) => category.position || 0)) + 1;
  const departments = new Map();
  const map = new Map();
  for (const { shelf, site } of shelves) {
    const deptName = DEPARTMENTS[site];
    if (!departments.has(deptName)) {
      const found = existing.find((category) => category.name === deptName && !category.parentId);
      const dept = found || (await categoryService.create({ name: deptName, position: nextTop++, isActive: true }));
      departments.set(deptName, { id: dept.id || dept._id, position: 0 });
    }
    const dept = departments.get(deptName);
    const found = existing.find((category) => category.name === shelf && category.parentId === dept.id);
    const leaf = found || (await categoryService.create({ name: shelf, parent: dept.id, position: dept.position, isActive: true }));
    dept.position += 1;
    map.set(shelf, { id: leaf.id || leaf._id, name: shelf });
  }
  return map;
};

const run = async () => {
  if (env.isProduction) {
    logger.error("Sample data is for development only; refusing to run in production");
    process.exit(1);
  }
  if (!fs.existsSync(SOURCE)) {
    logger.error("data/natural-products.json not found. Run `npm run data:natural:fetch` first.");
    process.exit(1);
  }
  await connectDatabase();
  try {
    const owner = await prisma.user.findFirst({ where: { role: ROLES.ADMIN }, orderBy: { createdAt: "asc" } });
    if (!owner) throw new Error("No admin user found. Run `npm run data:import` first.");

    const { products } = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
    const shelfList = [...new Map(products.map((item) => [item.shelf, { shelf: item.shelf, site: item.site }])).values()];
    const shelves = await ensureShelves(shelfList);
    const existingNames = new Set((await prisma.product.findMany({ select: { name: true } })).map((product) => product.name.toLowerCase()));

    const featuredShelves = new Set();
    let created = 0;
    let skipped = 0;
    for (const item of products) {
      if (existingNames.has(item.name.toLowerCase())) {
        skipped += 1;
        continue;
      }
      const featured = !featuredShelves.has(item.shelf) && featuredShelves.size < 4;
      if (featured) featuredShelves.add(item.shelf);
      try {
        await productService.createProduct(owner.id, toPayload(item, shelves.get(item.shelf), featured));
        existingNames.add(item.name.toLowerCase());
        created += 1;
        if (created % 25 === 0) logger.info(`Imported ${created} natural products…`);
      } catch (error) {
        skipped += 1;
        logger.warn(`Skipped "${item.name}": ${error.message}`);
      }
    }
    logger.info(`Done: ${created} natural products imported, ${skipped} skipped, ${shelves.size} shelves under "${Object.values(DEPARTMENTS).join('" and "')}"`);
    process.exitCode = 0;
  } catch (error) {
    logger.error(`Natural import failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
};

run();
