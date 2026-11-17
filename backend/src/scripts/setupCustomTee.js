/**
 * `npm run data:custom-tee`: sets up the product the T-shirt studio sells.
 *
 * - A "Custom T-Shirts" shelf under the Fashion department (created if missing).
 * - One product, SKU PZ-CUSTOM-TEE, with a variant per colour and size and
 *   starting stock for each. Printing is charged per side at checkout.
 * - Safe to re-run: an existing product keeps its stock and only gains any
 *   colour or size that is missing.
 */
const logger = require("../core/logger");
const prisma = require("../db/client");
const { connectDatabase, disconnectDatabase } = require("../config/database");
const productService = require("../modules/product/product.service");
const categoryService = require("../modules/category/category.service");
const { ROLES } = require("../constants/roles");
const {
  CUSTOM_TEE_SKU,
  TEE_COLORS,
  TEE_SIZES,
  BASE_PRICE,
  LARGE_SIZE_EXTRA,
  GST,
  variantSku,
} = require("../constants/customTee");

const STARTING_STOCK = 120;

const ensureShelf = async () => {
  const shelfName = "Custom T-Shirts";
  const existing = await prisma.category.findFirst({ where: { name: shelfName } });
  if (existing) return existing;

  let dept = await prisma.category.findFirst({ where: { name: "Fashion", parentId: null } });
  if (!dept) dept = await categoryService.create({ name: "Fashion", isActive: true });
  const created = await categoryService.create({ name: shelfName, parent: dept.id || dept._id, position: 0, isActive: true });
  return { id: created.id || created._id, name: shelfName };
};

const variants = () =>
  TEE_COLORS.flatMap((color) =>
    TEE_SIZES.map((size) => ({
      sku: variantSku(color.code, size.code),
      options: { color: color.name, size: size.code },
      price: BASE_PRICE + (LARGE_SIZE_EXTRA[size.code] || 0),
      discount: 0,
      gst: GST,
      countInStock: STARTING_STOCK,
      lowStockThreshold: 10,
      weightGrams: 180,
      isActive: true,
    }))
  );

const run = async () => {
  await connectDatabase();
  try {
    const owner = await prisma.user.findFirst({ where: { role: ROLES.ADMIN }, orderBy: { createdAt: "asc" } });
    if (!owner) throw new Error("No admin user found. Run `npm run data:import` first.");
    const shelf = await ensureShelf();

    const existing = await prisma.product.findFirst({ where: { sku: CUSTOM_TEE_SKU }, include: { variants: true } });
    if (existing) {
      const have = new Set(existing.variants.map((variant) => variant.sku));
      const missing = variants().filter((variant) => !have.has(variant.sku));
      if (missing.length === 0) {
        logger.info("Custom T-shirt is already set up");
        return;
      }
      const keep = existing.variants.map((variant) => ({
        sku: variant.sku,
        options: variant.options,
        price: Number(variant.price),
        discount: Number(variant.discount),
        gst: Number(variant.gst),
        countInStock: variant.countInStock,
        lowStockThreshold: variant.lowStockThreshold,
        weightGrams: variant.weightGrams,
        isActive: variant.isActive,
      }));
      await productService.updateProduct(existing.id, { variants: [...keep, ...missing] });
      logger.info(`Added ${missing.length} colour/size options to the custom T-shirt`);
      return;
    }

    await productService.createProduct(owner.id, {
      name: "Custom T-Shirt: design your own",
      brand: "Planet Studio",
      category: shelf.name,
      categoryRef: shelf.id,
      sku: CUSTOM_TEE_SKU,
      description:
        "Design it yourself in the Planet T-shirt studio: add your own text, photos and artwork to the front and back, " +
        "pick from 8 colours and sizes S to 3XL, and see exactly how it will look before you order. " +
        "100% combed cotton, 180 GSM, regular fit, printed with water-based inks that stay soft and won't crack.",
      shortDescription: "Your text, photos and art · 8 colours · S–3XL",
      image: "/tee-studio.jpg",
      images: ["/tee-studio.jpg", "/tee-studio-back.jpg"],
      price: BASE_PRICE,
      discount: 0,
      gst: GST,
      countInStock: 0,
      lowStockThreshold: 10,
      weightGrams: 180,
      attributes: [
        { code: "fabric", name: "Fabric", value: "100% combed cotton, 180 GSM" },
        { code: "fit", name: "Fit", value: "Regular" },
        { code: "print", name: "Print", value: "Water-based DTG print, front and/or back" },
      ],
      variants: variants(),
      isActive: true,
      isFeatured: true,
    });
    logger.info("Custom T-shirt created with 48 colour/size options");
  } finally {
    await disconnectDatabase();
  }
};

run().catch((error) => {
  logger.error(`Custom T-shirt setup failed: ${error.message}`);
  process.exit(1);
});
