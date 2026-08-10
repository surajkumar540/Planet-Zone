const { z } = require("zod");
const { listQuery, idParam, objectId } = require("../../utils/schemas");

const percentage = z.coerce.number().min(0).max(100);
const money = z.coerce.number().min(0);

const variantSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(60),
  /** Variant-defining selections keyed by attribute code, e.g. `{ color: "red" }`. */
  options: z.record(z.string(), z.string().trim().max(80)),
  price: money,
  discount: percentage.optional().default(0),
  // Inherits the product's rate when omitted.
  gst: percentage.optional(),
  countInStock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional().default(5),
  image: z.string().trim().max(500).optional().default(""),
  barcode: z.string().trim().max(60).optional().default(""),
  weightGrams: z.coerce.number().min(0).optional().default(0),
  isActive: z.coerce.boolean().optional().default(true),
});

const productAttributeSchema = z.object({
  code: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(80),
  value: z.union([z.string().max(200), z.number(), z.boolean()]),
});

/**
 * Base field set, deliberately unrefined.
 *
 * Zod rejects `.partial()` on a schema carrying refinements, so cross-field
 * rules are attached to the create and update variants separately below.
 */
const productFields = z.object({
  name: z.string().trim().min(2, "Name is required").max(200),
  brand: z.string().trim().min(1, "Brand is required").max(100),
  category: z.string().trim().min(1, "Category is required").max(100),
  categoryRef: objectId.nullable().optional(),
  description: z.string().trim().min(1, "Description is required").max(5000),
  shortDescription: z.string().trim().max(500).optional().default(""),
  image: z.string().trim().min(1, "Image is required"),
  images: z.array(z.string().trim()).max(10).optional().default([]),

  price: money,
  // Zero is a legitimate value for all three of these.
  discount: percentage.default(0),
  gst: percentage.default(0),
  countInStock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),

  sku: z.string().trim().max(60).optional().default(""),
  attributes: z.array(productAttributeSchema).max(50).optional().default([]),
  variants: z.array(variantSchema).max(100).optional().default([]),

  weightGrams: z.coerce.number().min(0).optional().default(0),
  dimensions: z
    .object({
      length: z.coerce.number().min(0).optional().default(0),
      width: z.coerce.number().min(0).optional().default(0),
      height: z.coerce.number().min(0).optional().default(0),
    })
    .optional(),

  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().optional().default(false),
  seo: z
    .object({
      title: z.string().trim().max(200).optional().default(""),
      description: z.string().trim().max(500).optional().default(""),
    })
    .optional(),
});

/** Two variants sharing a SKU would make stock and pricing ambiguous. */
const uniqueVariantSkus = (value) => {
  const skus = (value.variants || []).map((variant) => variant.sku.toUpperCase());
  return skus.length === new Set(skus).size;
};
const uniqueSkuRule = { message: "Variant SKUs must be unique", path: ["variants"] };

const productBodySchema = productFields.refine(uniqueVariantSkus, uniqueSkuRule);

const updateProductSchema = productFields
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  })
  .refine(uniqueVariantSkus, uniqueSkuRule);

// Legacy admin form posts the target id in the body instead of the path.
const legacyUpdateProductSchema = productFields
  .partial()
  .extend({ _id: z.string().trim().min(1, "Product id is required") })
  .refine(uniqueVariantSkus, uniqueSkuRule);

const booleanFlag = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

const listProductsQuery = listQuery.extend({
  category: z.string().trim().optional(),
  categoryRef: objectId.optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: booleanFlag,
  lowStock: booleanFlag,
  isFeatured: booleanFlag,
  hasVariants: booleanFlag,
  includeInactive: booleanFlag,
});

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1, "Comment is required").max(2000),
});

module.exports = {
  productFields,
  productBodySchema,
  updateProductSchema,
  legacyUpdateProductSchema,
  listProductsQuery,
  reviewSchema,
  variantSchema,
  productIdParam: idParam("id"),
};
