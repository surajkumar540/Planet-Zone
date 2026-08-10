const express = require("express");
const { z } = require("zod");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created, paginated } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");
const audit = require("../../services/audit.service");
const service = require("./coupon.service");
const pricingService = require("../../services/pricing.service");
const { listQuery, idParam, objectId } = require("../../utils/schemas");
const { DISCOUNT_TYPE_VALUES } = require("../../constants/discount");

const couponBody = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Code must be at least 3 characters")
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphens and underscores only")
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().max(500).optional().default(""),
  type: z.enum(DISCOUNT_TYPE_VALUES).default("percentage"),
  value: z.coerce.number().min(0),
  maxDiscountAmount: z.coerce.number().min(0).optional().default(0),
  minOrderAmount: z.coerce.number().min(0).optional().default(0),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  usageLimit: z.coerce.number().int().min(0).optional().default(0),
  usageLimitPerUser: z.coerce.number().int().min(0).optional().default(1),
  appliesToProducts: z.array(objectId).optional().default([]),
  appliesToCategories: z.array(objectId).optional().default([]),
  excludedProducts: z.array(objectId).optional().default([]),
  restrictedToUsers: z.array(objectId).optional().default([]),
  firstOrderOnly: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
});

const couponBodyWithRules = couponBody
  .refine((value) => value.type !== "percentage" || value.value <= 100, {
    message: "A percentage discount cannot exceed 100",
    path: ["value"],
  })
  .refine((value) => !value.expiresAt || !value.startsAt || value.expiresAt > value.startsAt, {
    message: "The expiry date must be after the start date",
    path: ["expiresAt"],
  });

const listCouponsQuery = listQuery.extend({
  status: z.enum(["active", "expired", "scheduled"]).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

/** Cart lines the customer wants a quote for. */
const applyCouponSchema = z.object({
  code: z.string().trim().min(1, "Enter a coupon code"),
  cart: z
    .array(
      z.object({
        _id: objectId.optional(),
        product: objectId.optional(),
        variantSku: z.string().trim().optional(),
        qty: z.coerce.number().int().min(1),
      })
    )
    .min(1, "Your cart is empty"),
});

const router = express.Router();
const staffOnly = [authenticate, requireStaff];

/* -------------------------------- Customer --------------------------------- */

/**
 * Previews a coupon against the caller's cart and returns the recalculated
 * totals. The same validation runs again at checkout, so a stale preview can
 * never be redeemed.
 */
router.post(
  "/coupons/apply",
  authenticate,
  validate({ body: applyCouponSchema }),
  asyncHandler(async (req, res) => {
    const quote = await pricingService.quoteOrder({
      cart: req.body.cart,
      userId: req.auth.userId,
      couponCode: req.body.code,
    });

    return ok(res, {
      data: { coupon: quote.coupon, pricing: quote.pricing },
      message: "Coupon applied",
    });
  })
);

/* -------------------------------- Management ------------------------------- */

router.get(
  "/coupons",
  staffOnly,
  validate({ query: listCouponsQuery }),
  asyncHandler(async (req, res) => paginated(res, await service.list(req.query)))
);

router.get(
  "/coupons/:id",
  staffOnly,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => ok(res, { data: await service.getById(req.params.id) }))
);

router.post(
  "/coupons",
  staffOnly,
  validate({ body: couponBodyWithRules }),
  asyncHandler(async (req, res) => {
    const data = await service.create(req.body, req.auth.userId);
    await audit.record({
      req,
      action: "coupon.create",
      entityType: "Coupon",
      entityId: data._id,
    });
    return created(res, { data, message: "Coupon created" });
  })
);

router.patch(
  "/coupons/:id",
  staffOnly,
  validate({ params: idParam("id"), body: couponBody.partial() }),
  asyncHandler(async (req, res) => {
    const data = await service.update(req.params.id, req.body);
    await audit.record({
      req,
      action: "coupon.update",
      entityType: "Coupon",
      entityId: req.params.id,
      changes: req.body,
    });
    return ok(res, { data, message: "Coupon updated" });
  })
);

router.delete(
  "/coupons/:id",
  staffOnly,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) => {
    const data = await service.remove(req.params.id);
    await audit.record({
      req,
      action: "coupon.delete",
      entityType: "Coupon",
      entityId: req.params.id,
    });
    return ok(res, {
      data,
      message: data.deactivated ? "Coupon deactivated" : "Coupon deleted",
    });
  })
);

module.exports = router;
