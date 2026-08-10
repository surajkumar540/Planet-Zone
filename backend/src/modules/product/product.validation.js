const { z } = require("zod");
const { listQuery, idParam } = require("../../utils/schemas");

const percentage = z.coerce.number().min(0).max(100);
const money = z.coerce.number().min(0);

const productBodySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(200),
  brand: z.string().trim().min(1, "Brand is required").max(100),
  category: z.string().trim().min(1, "Category is required").max(100),
  description: z.string().trim().min(1, "Description is required").max(5000),
  image: z.string().trim().min(1, "Image is required"),
  images: z.array(z.string().trim()).max(10).optional().default([]),
  price: money,
  // Zero is a legitimate value for all three of these.
  discount: percentage.default(0),
  gst: percentage.default(0),
  countInStock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  isActive: z.coerce.boolean().default(true),
});

// Every field optional, but at least one must be present.
const updateProductSchema = productBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

// Legacy admin form posts the target id in the body instead of the path.
const legacyUpdateProductSchema = productBodySchema
  .partial()
  .extend({ _id: z.string().trim().min(1, "Product id is required") });

const listProductsQuery = listQuery.extend({
  category: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  lowStock: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  includeInactive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1, "Comment is required").max(2000),
});

module.exports = {
  productBodySchema,
  updateProductSchema,
  legacyUpdateProductSchema,
  listProductsQuery,
  reviewSchema,
  productIdParam: idParam("id"),
};
