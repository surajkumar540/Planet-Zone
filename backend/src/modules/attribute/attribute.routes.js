const express = require("express");
const { z } = require("zod");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");
const AppError = require("../../core/AppError");
const Attribute = require("../../models/AttributeModel");
const Product = require("../../models/ProductModel");
const { idParam } = require("../../utils/schemas");

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
    const filter = {
      ...(req.query.variantOnly ? { isVariantAttribute: true } : {}),
      ...(req.query.isActive !== undefined ? { isActive: req.query.isActive } : {}),
    };
    const data = await Attribute.find(filter).sort({ position: 1, name: 1 }).lean();
    return ok(res, { data });
  })
);

router.post(
  "/attributes",
  staffOnly,
  validate({ body: attributeBody }),
  asyncHandler(async (req, res) => {
    const attribute = await Attribute.create(req.body);
    return created(res, { data: attribute.toObject(), message: "Attribute created" });
  })
);

router.patch(
  "/attributes/:id",
  staffOnly,
  validate({ params: idParam("id"), body: attributeBody.partial() }),
  asyncHandler(async (req, res) => {
    const attribute = await Attribute.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!attribute) throw AppError.notFound("Attribute not found");
    return ok(res, { data: attribute, message: "Attribute updated" });
  })
);

router.delete(
  "/attributes/:id",
  staffOnly,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const attribute = await Attribute.findById(req.params.id).lean();
    if (!attribute) throw AppError.notFound("Attribute not found");

    // Removing an attribute still used by variants would orphan those options.
    const inUse = await Product.countDocuments({
      $or: [
        { "attributes.code": attribute.code },
        { [`variants.options.${attribute.code}`]: { $exists: true } },
      ],
    });

    if (inUse > 0) {
      throw AppError.conflict(
        `${inUse} product${inUse === 1 ? "" : "s"} use this attribute. Remove it from them first.`
      );
    }

    await Attribute.findByIdAndDelete(req.params.id);
    return ok(res, { message: "Attribute deleted" });
  })
);

module.exports = router;
