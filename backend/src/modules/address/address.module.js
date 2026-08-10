const { z } = require("zod");
const express = require("express");
const Address = require("../../models/AddressModel");
const AppError = require("../../core/AppError");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { idParam } = require("../../utils/schemas");

/* -------------------------------- Validation ------------------------------- */

const addressBody = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  phoneNo: z.coerce.number().int().positive(),
  state: z.string().trim().min(1, "State is required"),
  address: z.string().trim().min(1, "Address is required").max(500),
  city: z.string().trim().min(1, "City is required"),
  pinCode: z.coerce.number().int().positive(),
  landMark: z.string().trim().max(200).optional().default(""),
  label: z.enum(["home", "work", "other"]).optional().default("home"),
  isDefault: z.coerce.boolean().optional().default(false),
});

/* --------------------------------- Service --------------------------------- */

/** Clears the default flag from every other address of the same user. */
const clearOtherDefaults = (userId, keepId) =>
  Address.updateMany(
    { User: userId, ...(keepId ? { _id: { $ne: keepId } } : {}) },
    { $set: { isDefault: false } }
  );

const listAddresses = (userId) =>
  Address.find({ User: userId }).sort({ isDefault: -1, updatedAt: -1 }).lean();

const createAddress = async (userId, { label, isDefault, ...shippingAddress }) => {
  const isFirst = (await Address.countDocuments({ User: userId })) === 0;
  // The first address a customer saves becomes their default automatically.
  const shouldDefault = isDefault || isFirst;

  const doc = await Address.create({
    User: userId,
    label,
    shippingAddress,
    isDefault: shouldDefault,
  });
  if (shouldDefault) await clearOtherDefaults(userId, doc._id);

  return doc.toObject();
};

const updateAddress = async (userId, id, { label, isDefault, ...shippingAddress }) => {
  const doc = await Address.findOneAndUpdate(
    { _id: id, User: userId },
    { label, shippingAddress, ...(isDefault !== undefined ? { isDefault } : {}) },
    { new: true, runValidators: true }
  ).lean();

  if (!doc) throw AppError.notFound("Address not found");
  if (isDefault) await clearOtherDefaults(userId, id);
  return doc;
};

const deleteAddress = async (userId, id) => {
  const doc = await Address.findOneAndDelete({ _id: id, User: userId }).lean();
  if (!doc) throw AppError.notFound("Address not found");

  // Promote another address so the customer always has a default.
  if (doc.isDefault) {
    const next = await Address.findOne({ User: userId }).sort({ updatedAt: -1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }
  return doc;
};

/* -------------------------------- Controllers ------------------------------ */

const router = express.Router();

/**
 * This router is mounted without a path prefix, so `authenticate` is attached
 * per route; a router-level guard would apply to the whole application.
 */

/**
 * Legacy contract: returns the default address as a bare `shippingAddress`
 * object, which is the shape the existing checkout screen reads.
 */
router.get(
  "/shipping",
  authenticate,
  asyncHandler(async (req, res) => {
    const [preferred] = await Address.find({ User: req.auth.userId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .limit(1)
      .lean();

    return res.status(200).json({
      status: Boolean(preferred),
      data: preferred?.shippingAddress || {},
    });
  })
);

/**
 * Legacy contract: upserts the default address rather than failing when one
 * already exists, which is what the previous endpoint did.
 */
router.post(
  "/shipping",
  authenticate,
  validate({ body: addressBody }),
  asyncHandler(async (req, res) => {
    const existing = await Address.findOne({ User: req.auth.userId }).sort({ isDefault: -1 });
    const data = existing
      ? await updateAddress(req.auth.userId, existing._id, { ...req.body, isDefault: true })
      : await createAddress(req.auth.userId, { ...req.body, isDefault: true });

    return ok(res, { data, message: "Shipping address saved successfully" });
  })
);

router.get(
  "/addresses",
  authenticate,
  asyncHandler(async (req, res) => ok(res, { data: await listAddresses(req.auth.userId) }))
);

router.post(
  "/addresses",
  authenticate,
  validate({ body: addressBody }),
  asyncHandler(async (req, res) =>
    created(res, {
      data: await createAddress(req.auth.userId, req.body),
      message: "Address added",
    })
  )
);

router.put(
  "/addresses/:id",
  authenticate,
  validate({ params: idParam("id"), body: addressBody }),
  asyncHandler(async (req, res) =>
    ok(res, {
      data: await updateAddress(req.auth.userId, req.params.id, req.body),
      message: "Address updated",
    })
  )
);

router.delete(
  "/addresses/:id",
  authenticate,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    await deleteAddress(req.auth.userId, req.params.id);
    return ok(res, { message: "Address removed" });
  })
);

module.exports = router;
