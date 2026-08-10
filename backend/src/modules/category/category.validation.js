const { z } = require("zod");
const { objectId, idParam } = require("../../utils/schemas");

const seoSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(500).optional().default(""),
  keywords: z.array(z.string().trim().max(60)).max(20).optional().default([]),
});

const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: z.string().trim().max(140).optional(),
  description: z.string().trim().max(2000).optional().default(""),
  image: z.string().trim().max(500).optional().default(""),
  // `null` explicitly means a root category.
  parent: objectId.nullable().optional(),
  position: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.coerce.boolean().optional().default(true),
  isFeatured: z.coerce.boolean().optional().default(false),
  seo: seoSchema.optional(),
});

const updateCategorySchema = createCategorySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

const listCategoriesQuery = z.object({
  search: z.string().trim().max(200).optional(),
  parent: objectId.nullable().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  includeCounts: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

const deleteCategoryQuery = z.object({
  // Where to move products that still reference the category being removed.
  reassignTo: objectId.optional(),
});

const reorderSchema = z.object({
  items: z
    .array(z.object({ id: objectId, position: z.coerce.number().int().min(0) }))
    .min(1, "Provide at least one category"),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuery,
  deleteCategoryQuery,
  reorderSchema,
  categoryIdParam: idParam("id"),
};
