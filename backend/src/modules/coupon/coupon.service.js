const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const Coupon = require("../../models/CouponModel");
const CouponRedemption = require("../../models/CouponRedemptionModel");
const Order = require("../../models/OrderModel");
const Category = require("../../models/CategoryModel");
const { DISCOUNT_TYPES } = require("../../constants/discount");
const { round } = require("../../utils/money");
const { parseSort, searchFilter } = require("../../utils/schemas");

/**
 * Decides which cart lines a coupon covers.
 *
 * With no product or category restrictions the whole cart qualifies;
 * otherwise a line qualifies when its product is listed, or its category is
 * listed (including as an ancestor, so a parent category covers its subtree).
 */
const selectEligibleItems = async (coupon, items) => {
  const excluded = new Set((coupon.excludedProducts || []).map(String));
  const candidates = items.filter((item) => !excluded.has(String(item.product)));

  const hasProductScope = (coupon.appliesToProducts || []).length > 0;
  const hasCategoryScope = (coupon.appliesToCategories || []).length > 0;
  if (!hasProductScope && !hasCategoryScope) return candidates;

  const allowedProducts = new Set((coupon.appliesToProducts || []).map(String));

  let allowedCategories = new Set();
  if (hasCategoryScope) {
    const scoped = (coupon.appliesToCategories || []).map(String);
    // A parent category implies its descendants.
    const descendants = await Category.find({ ancestors: { $in: scoped } })
      .select("_id")
      .lean();
    allowedCategories = new Set([...scoped, ...descendants.map((c) => String(c._id))]);
  }

  return candidates.filter(
    (item) =>
      allowedProducts.has(String(item.product)) ||
      (item.categoryRef && allowedCategories.has(String(item.categoryRef)))
  );
};

/**
 * Validates a coupon against a priced cart and computes the discount.
 *
 * Every rule is checked server-side at both quote and checkout time, so a
 * quote cannot be replayed once a limit has been reached.
 *
 * @returns {Promise<{coupon: object, discountAmount: number, freeShipping: boolean}>}
 */
const validateForCart = async ({ code, userId, items, itemsSubtotal }) => {
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim() });
  if (!coupon) throw AppError.notFound("This coupon code is not valid");

  if (!coupon.isActive) throw AppError.badRequest("This coupon is no longer active");
  if (coupon.startsAt && coupon.startsAt.getTime() > Date.now()) {
    throw AppError.badRequest("This coupon is not active yet");
  }
  if (coupon.isExpired) throw AppError.badRequest("This coupon has expired");
  if (coupon.isExhausted) throw AppError.badRequest("This coupon has reached its usage limit");

  if ((coupon.restrictedToUsers || []).length > 0) {
    const allowed = coupon.restrictedToUsers.some((id) => String(id) === String(userId));
    if (!allowed) throw AppError.forbidden("This coupon is not available on your account");
  }

  if (coupon.usageLimitPerUser > 0) {
    const used = await CouponRedemption.countDocuments({ coupon: coupon._id, User: userId });
    if (used >= coupon.usageLimitPerUser) {
      throw AppError.badRequest("You have already used this coupon");
    }
  }

  if (coupon.firstOrderOnly) {
    const previousOrders = await Order.countDocuments({ User: userId });
    if (previousOrders > 0) {
      throw AppError.badRequest("This coupon is only valid on your first order");
    }
  }

  if (coupon.minOrderAmount > 0 && itemsSubtotal < coupon.minOrderAmount) {
    throw AppError.badRequest(
      `Add ₹${round(coupon.minOrderAmount - itemsSubtotal)} more to use this coupon`
    );
  }

  const eligible = await selectEligibleItems(coupon, items);
  if (eligible.length === 0) {
    throw AppError.badRequest("This coupon does not apply to the items in your cart");
  }

  const eligibleTotal = eligible.reduce((sum, item) => sum + item.lineTotal, 0);

  let discountAmount = 0;
  let freeShipping = false;

  if (coupon.type === DISCOUNT_TYPES.PERCENTAGE) {
    discountAmount = round((eligibleTotal * coupon.value) / 100);
    if (coupon.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else if (coupon.type === DISCOUNT_TYPES.FIXED) {
    // Never discount more than the qualifying items are worth.
    discountAmount = Math.min(round(coupon.value), eligibleTotal);
  } else {
    freeShipping = true;
  }

  return { coupon: coupon.toObject(), discountAmount: round(discountAmount), freeShipping };
};

/**
 * Records a redemption once an order is confirmed.
 *
 * The counter increment is conditional on the limit not yet being reached, so
 * simultaneous checkouts cannot push a coupon past its cap.
 */
const redeem = async ({ coupon, userId, orderId, discountAmount, session }) => {
  const filter = { _id: coupon._id };
  if (coupon.usageLimit > 0) filter.usedCount = { $lt: coupon.usageLimit };

  const updated = await Coupon.findOneAndUpdate(
    filter,
    { $inc: { usedCount: 1 } },
    { new: true, session }
  );

  if (!updated) throw AppError.conflict("This coupon has reached its usage limit");

  await CouponRedemption.create(
    [
      {
        coupon: coupon._id,
        code: coupon.code,
        User: userId,
        order: orderId,
        discountAmount,
      },
    ],
    session ? { session } : {}
  );

  return updated;
};

/** Reverses a redemption when the order it belonged to is cancelled. */
const revoke = async ({ orderId }) => {
  const redemptions = await CouponRedemption.find({ order: orderId });

  for (const redemption of redemptions) {
    try {
      await Coupon.updateOne({ _id: redemption.coupon }, { $inc: { usedCount: -1 } });
      await CouponRedemption.deleteOne({ _id: redemption._id });
    } catch (error) {
      logger.error(`Failed to revoke coupon redemption: ${error.message}`, { orderId });
    }
  }
  return { revoked: redemptions.length };
};

/**
 * Adds the derived status flags to a plain object.
 *
 * `lean()` skips virtuals, so list endpoints compute them here rather than
 * paying for full document hydration.
 */
const withStatus = (coupon) => {
  const now = Date.now();
  const isExpired = Boolean(coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now);
  const isExhausted = Boolean(coupon.usageLimit && coupon.usedCount >= coupon.usageLimit);
  const hasStarted = !coupon.startsAt || new Date(coupon.startsAt).getTime() <= now;

  return {
    ...coupon,
    isExpired,
    isExhausted,
    isRedeemable: Boolean(coupon.isActive) && hasStarted && !isExpired && !isExhausted,
  };
};

/* -------------------------------- Management ------------------------------- */

const list = async ({ page, limit, sort, search, isActive, status }) => {
  const now = new Date();
  const filter = {
    ...searchFilter(search, ["code", "description"]),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  if (status === "expired") {
    filter.expiresAt = { $ne: null, $lt: now };
  } else if (status === "scheduled") {
    filter.startsAt = { $gt: now };
  } else if (status === "active") {
    filter.isActive = true;
    filter.$and = [
      { $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] },
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Coupon.find(filter).sort(parseSort(sort)).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);

  return { items: items.map(withStatus), total, page, limit };
};

const create = async (payload, actorId) => {
  const existing = await Coupon.findOne({ code: payload.code.toUpperCase() });
  if (existing) throw AppError.conflict("A coupon with this code already exists");

  const coupon = await Coupon.create({ ...payload, createdBy: actorId });
  return coupon.toObject();
};

const update = async (id, payload) => {
  const coupon = await Coupon.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
  if (!coupon) throw AppError.notFound("Coupon not found");
  return coupon;
};

const remove = async (id) => {
  const used = await CouponRedemption.countDocuments({ coupon: id });
  if (used > 0) {
    // Historic orders reference it, so it is retired rather than deleted.
    const coupon = await Coupon.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
    if (!coupon) throw AppError.notFound("Coupon not found");
    return { deactivated: true, redemptions: used };
  }

  const coupon = await Coupon.findByIdAndDelete(id).lean();
  if (!coupon) throw AppError.notFound("Coupon not found");
  return { deleted: true };
};

const getById = async (id) => {
  const coupon = await Coupon.findById(id).lean();
  if (!coupon) throw AppError.notFound("Coupon not found");

  const redemptions = await CouponRedemption.find({ coupon: id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("User", "firstName lastName email")
    .lean();

  const totalDiscount = redemptions.reduce((sum, r) => sum + r.discountAmount, 0);
  return { ...withStatus(coupon), redemptions, stats: { totalDiscount } };
};

module.exports = { validateForCart, redeem, revoke, list, create, update, remove, getById };
