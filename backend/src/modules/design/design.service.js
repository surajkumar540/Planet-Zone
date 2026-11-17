const prisma = require("../../db/client");
const env = require("../../config/env");
const AppError = require("../../core/AppError");
const { round } = require("../../utils/money");
const { hasAtLeastRole, ROLES } = require("../../constants/roles");
const {
  CUSTOM_TEE_SKU,
  TEE_COLORS,
  TEE_SIZES,
  PRINT_FEE_PER_SIDE,
  GST,
  SIDES,
  PRINT_AREA,
} = require("../../constants/customTee");

const num = (value) => (value === null || value === undefined ? 0 : Number(value));

/** Public address of this API, for preview images in the bag, orders and emails. */
const apiBase = () =>
  (env.PUBLIC_API_URL || env.RENDER_EXTERNAL_URL || `http://localhost:${env.PORT}`).replace(/\/$/, "");

const previewUrl = (id, side = "front") => `${apiBase()}/api/designs/${id}/preview/${side}`;

/** The custom T-shirt product with its variants, or null if it isn't set up yet. */
const findTeeProduct = () =>
  prisma.product.findFirst({
    where: { sku: CUSTOM_TEE_SKU },
    include: { variants: { orderBy: { position: "asc" } } },
  });

/** Sides with at least one visible element: these are charged for printing. */
const printedSides = (layers) =>
  SIDES.filter((side) => (layers?.[side] || []).some((layer) => !layer.hidden));

/**
 * Everything the studio needs to draw and price a shirt: colours, sizes with
 * their prices and stock, and the print charge. Prices include GST, like the
 * rest of the shop.
 */
const getConfig = async () => {
  const product = await findTeeProduct();
  if (!product || !product.isActive) return { available: false };

  const withGst = (amount) => round(amount + (amount * GST) / 100);
  const variants = product.variants
    .filter((variant) => variant.isActive)
    .map((variant) => ({
      _id: variant.id,
      sku: variant.sku,
      color: variant.sku.split("-")[1].toLowerCase(),
      size: variant.sku.split("-").slice(2).join("-"),
      price: num(variant.price),
      discount: num(variant.discount),
      gst: num(variant.gst),
      totalPrice: num(variant.totalPrice),
      countInStock: variant.countInStock,
    }));

  return {
    available: true,
    productId: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    gst: GST,
    printFeePerSide: PRINT_FEE_PER_SIDE,
    printFeePerSideWithGst: withGst(PRINT_FEE_PER_SIDE),
    printArea: PRINT_AREA,
    colors: TEE_COLORS.filter((color) => variants.some((variant) => variant.color === color.code)),
    sizes: TEE_SIZES.filter((size) => variants.some((variant) => variant.size === size.code)),
    variants,
  };
};

/** Saves a new design. Designs are never edited in place (see the schema). */
const createDesign = async (userId, body) => {
  const product = await findTeeProduct();
  if (!product || !product.isActive) throw AppError.conflict("The T-shirt studio is closed right now");

  const sides = printedSides(body.layers);
  const design = await prisma.customDesign.create({
    data: {
      userId,
      productId: product.id,
      name: body.name || "My design",
      color: body.color,
      layers: body.layers,
      sides,
      printFee: PRINT_FEE_PER_SIDE * sides.length,
      previewFront: body.previewFront,
      previewBack: sides.includes("back") ? body.previewBack : "",
    },
    select: { id: true, name: true, color: true, sides: true, printFee: true, createdAt: true },
  });
  return toSummary(design);
};

const toSummary = (row) => ({
  _id: row.id,
  name: row.name,
  color: row.color,
  sides: row.sides,
  printFee: num(row.printFee),
  previewFront: previewUrl(row.id, "front"),
  previewBack: row.sides.includes("back") ? previewUrl(row.id, "back") : "",
  createdAt: row.createdAt,
});

const listMine = async (userId) => {
  const rows = await prisma.customDesign.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: { id: true, name: true, color: true, sides: true, printFee: true, createdAt: true, _count: { select: { orderItems: true } } },
  });
  return rows.map((row) => ({ ...toSummary(row), ordered: row._count.orderItems > 0 }));
};

/** The full design (layers included), for its owner or for staff printing it. */
const getDesign = async (id, auth) => {
  const row = await prisma.customDesign.findUnique({
    where: { id },
    select: { id: true, userId: true, name: true, color: true, sides: true, printFee: true, layers: true, createdAt: true },
  });
  const isStaff = hasAtLeastRole(auth.role, ROLES.STAFF);
  if (!row || (row.userId !== auth.userId && !isStaff)) throw AppError.notFound("Design not found");
  return { ...toSummary(row), layers: row.layers };
};

/** Deletes a saved design, unless it has been ordered (the print shop still needs it). */
const deleteDesign = async (id, userId) => {
  const row = await prisma.customDesign.findFirst({
    where: { id, userId },
    select: { id: true, _count: { select: { orderItems: true } } },
  });
  if (!row) throw AppError.notFound("Design not found");
  if (row._count.orderItems > 0) throw AppError.conflict("This design is part of an order, so it is kept");
  await prisma.customDesign.delete({ where: { id } });
};

/** The mockup image of one side, as bytes. Public: ids are unguessable. */
const getPreview = async (id, side) => {
  const row = await prisma.customDesign.findUnique({
    where: { id },
    select: { previewFront: true, previewBack: true },
  });
  const dataUrl = row && (side === "back" ? row.previewBack : row.previewFront);
  if (!dataUrl) throw AppError.notFound("Preview not found");
  const [, type, payload] = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/) || [];
  if (!payload) throw AppError.notFound("Preview not found");
  return { type, body: Buffer.from(payload, "base64") };
};

/**
 * Loads the designs a cart refers to, for pricing. Every design must belong
 * to the shopper; a missing or foreign id fails the whole quote.
 */
const designsForCart = async (ids, userId) => {
  if (ids.length === 0) return new Map();
  if (!userId) throw AppError.unauthorized("Sign in to buy a custom design");
  const rows = await prisma.customDesign.findMany({
    where: { id: { in: ids }, userId },
    select: { id: true, productId: true, name: true, color: true, sides: true, printFee: true },
  });
  if (rows.length !== ids.length) throw AppError.badRequest("A custom design in your bag is no longer available");
  return new Map(rows.map((row) => [row.id, { ...row, printFee: num(row.printFee) }]));
};

module.exports = {
  getConfig,
  createDesign,
  listMine,
  getDesign,
  deleteDesign,
  getPreview,
  designsForCart,
  previewUrl,
  findTeeProduct,
};
