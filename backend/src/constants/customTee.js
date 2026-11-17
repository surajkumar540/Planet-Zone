/**
 * The custom T-shirt the studio sells.
 *
 * One catalogue product (SKU `PZ-CUSTOM-TEE`) with a variant per colour and
 * size, so stock, reservations and reports work exactly like any other
 * product. Printing is charged on top, per printed side.
 */
const CUSTOM_TEE_SKU = "PZ-CUSTOM-TEE";

/** Shirt colours: code (used in variant options and SKUs), name, fabric hex. */
const TEE_COLORS = [
  { code: "white", name: "White", hex: "#f7f7f5" },
  { code: "black", name: "Black", hex: "#1c1c1e" },
  { code: "navy", name: "Navy", hex: "#1f2a44" },
  { code: "heather", name: "Heather grey", hex: "#b9bcc2" },
  { code: "red", name: "Red", hex: "#c62828" },
  { code: "forest", name: "Forest green", hex: "#2f5d3a" },
  { code: "mustard", name: "Mustard", hex: "#e0a526" },
  { code: "lavender", name: "Lavender", hex: "#b9a7e0" },
];

/** Sizes with chest / length in inches (shown in the size guide). */
const TEE_SIZES = [
  { code: "S", chest: 38, length: 27 },
  { code: "M", chest: 40, length: 28 },
  { code: "L", chest: 42, length: 29 },
  { code: "XL", chest: 44, length: 30 },
  { code: "XXL", chest: 46, length: 31 },
  { code: "3XL", chest: 48, length: 32 },
];

/**
 * Blank shirt price before GST, chosen so shoppers see round prices with 5%
 * GST: ₹399 (S–XL), ₹449 (XXL), ₹479 (3XL). The largest sizes use more fabric.
 */
const BASE_PRICE = 380;
const LARGE_SIZE_EXTRA = { XXL: 47.62, "3XL": 76.19 };

/** Print charge per printed side before GST (₹147 with GST). */
const PRINT_FEE_PER_SIDE = 140;

const GST = 5;

const SIDES = ["front", "back"];

/** The print area in design units (3:4, about 12 x 16 inches on the shirt). */
const PRINT_AREA = { width: 300, height: 400, inchesWide: 12 };

const variantSku = (color, size) => `TEE-${color.toUpperCase()}-${size}`;

module.exports = {
  CUSTOM_TEE_SKU,
  TEE_COLORS,
  TEE_SIZES,
  BASE_PRICE,
  LARGE_SIZE_EXTRA,
  PRINT_FEE_PER_SIDE,
  GST,
  SIDES,
  PRINT_AREA,
  variantSku,
};
