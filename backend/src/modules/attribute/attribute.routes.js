const express = require("express");
const { z } = require("zod");
const prisma = require("../../db/client");
const { toAttribute } = require("../../db/mappers");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");
const AppError = require("../../core/AppError");
const { idParam } = require("../../utils/schemas");
const { slugify } = require("../../utils/slug");

const attributeValue = z.object({
  label: z.string().trim().min(1, "Label is required").max(80),
  value: z.string().trim().min(1, "Value is required").max(80),
  swatch: z.string().trim().max(200).optional().default(""),
  position: z.coerce.number().int().min(0).optional().default(0),
});

const attributeBody = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  code: z.string().trim().max(80).optional(),
  inputType: z
    .enum(["select", "multiselect", "text", "number", "boolean", "color"])
    .optional()
    .default("select"),
  values: z.array(attributeValue).optional().default([]),
  isVariantAttribute: z.coerce.boolean().optional().default(false),
  isFilterable: z.coerce.boolean().optional().default(true),
  isRequired: z.coerce.boolean().optional().default(false),
  position: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.coerce.boolean().optional().default(true),
});

const listQuerySchema = z.object({
  variantOnly: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

const router = express.Router();
const staffOnly = [authenticate, requireStaff];

router.get(
  "/attributes",
  validate({ query: listQuerySchema }),
  asyncHandler(async (req, res) => {
    const rows = await prisma.attribute.findMany({
      where: {
        ...(req.query.variantOnly ? { isVariantAttribute: true } : {}),
        ...(req.query.isActive !== undefined ? { isActive: req.query.isActive } : {}),
      },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });
    return ok(res, { data: rows.map(toAttribute) });
  })
);

router.post(
  "/attributes",
  staffOnly,
  validate({ body: attributeBody }),
  asyncHandler(async (req, res) => {
    const code = (req.body.code || slugify(req.body.name)).toLowerCase();
    const row = await prisma.attribute.create({ data: { ...req.body, code } });
    return created(res, { data: toAttribute(row), message: "Attribute created" });
  })
);

router.patch(
  "/attributes/:id",
  staffOnly,
  validate({ params: idParam("id"), body: attributeBody.partial() }),
  asyncHandler(async (req, res) => {
    const exists = await prisma.attribute.count({ where: { id: req.params.id } });
    if (!exists) throw AppError.notFound("Attribute not found");

    const data = { ...req.body };
    if (data.code) data.code = data.code.toLowerCase();

    const row = await prisma.attribute.update({ where: { id: req.params.id }, data });
    return ok(res, { data: toAttribute(row), message: "Attribute updated" });
  })
);

router.delete(
  "/attributes/:id",
  staffOnly,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const attribute = await prisma.attribute.findUnique({ where: { id: req.params.id } });
    if (!attribute) throw AppError.notFound("Attribute not found");

    // Removing an attribute still used by variants would orphan those options.
    const descriptive = JSON.stringify([{ code: attribute.code }]);
    const [{ inUse }] = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT p.id)::int AS "inUse"
      FROM products p
      LEFT JOIN product_variants v ON v."productId" = p.id
      WHERE p.attributes @> ${descriptive}::jsonb
         OR jsonb_exists(v.options::jsonb, ${attribute.code})`;

    if (inUse > 0) {
      throw AppError.conflict(
        `${inUse} product${inUse === 1 ? "" : "s"} use this attribute. Remove it from them first.`
      );
    }

    await prisma.attribute.delete({ where: { id: req.params.id } });
    return ok(res, { message: "Attribute deleted" });
  })
);

module.exports = router;
