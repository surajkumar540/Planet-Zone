const { z } = require("zod");
const express = require("express");
const prisma = require("../../db/client");
const { toAddress } = require("../../db/mappers");
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

const PREFERRED_FIRST = [{ isDefault: "desc" }, { updatedAt: "desc" }];

/** Clears the default flag from every other address of the same user. */
const clearOtherDefaults = (userId, keepId) =>
  prisma.address.updateMany({
    where: { userId, ...(keepId ? { id: { not: keepId } } : {}) },
    data: { isDefault: false },
  });

const listAddresses = async (userId) => {
  const rows = await prisma.address.findMany({ where: { userId }, orderBy: PREFERRED_FIRST });
  return rows.map(toAddress);
};

const createAddress = async (userId, { isDefault, phoneNo, ...fields }) => {
  const isFirst = (await prisma.address.count({ where: { userId } })) === 0;
  // The first address a customer saves becomes their default automatically.
  const shouldDefault = isDefault || isFirst;

  const row = await prisma.address.create({
    data: { ...fields, userId, phoneNo: String(phoneNo), isDefault: shouldDefault },
  });
  if (shouldDefault) await clearOtherDefaults(userId, row.id);

  return toAddress(row);
};

const updateAddress = async (userId, id, { isDefault, phoneNo, ...fields }) => {
  const existing = await prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw AppError.notFound("Address not found");

  const row = await prisma.address.update({
    where: { id },
    data: { ...fields, phoneNo: String(phoneNo), ...(isDefault !== undefined ? { isDefault } : {}) },
  });

  if (isDefault) await clearOtherDefaults(userId, id);
  return toAddress(row);
};

const deleteAddress = async (userId, id) => {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw AppError.notFound("Address not found");

  await prisma.address.delete({ where: { id } });

  // Promote another address so the customer always has a default.
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  return toAddress(existing);
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
    const row = await prisma.address.findFirst({
      where: { userId: req.auth.userId },
      orderBy: PREFERRED_FIRST,
    });
    const preferred = toAddress(row);

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
    const existing = await prisma.address.findFirst({
      where: { userId: req.auth.userId },
      orderBy: { isDefault: "desc" },
      select: { id: true },
    });
    const data = existing
      ? await updateAddress(req.auth.userId, existing.id, { ...req.body, isDefault: true })
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
