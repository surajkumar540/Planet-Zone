const prisma = require("../../db/client");
const { toCoupon, toRedemption } = require("../../db/mappers");
const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const { DISCOUNT_TYPES } = require("../../constants/discount");
const { round } = require("../../utils/money");
const { parseSort, searchFilter, sortable } = require("../../utils/schemas");

const SORTABLE = sortable("createdAt", "code", "value", "usedCount", "startsAt", "expiresAt");

/** Adds the derived status flags, which are computed rather than stored. */
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
    const descendants = await prisma.category.findMany({
      where: { ancestors: { hasSome: scoped } },
      select: { id: true },
    });
    allowedCategories = new Set([...scoped, ...descendants.map((c) => c.id)]);
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
  const row = await prisma.coupon.findUnique({
    where: { code: String(code).toUpperCase().trim() },
  });
  if (!row) throw AppError.notFound("This coupon code is not valid");
  const coupon = withStatus(toCoupon(row));

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
    const used = await prisma.couponRedemption.count({
      where: { couponId: coupon._id, userId },
    });
    if (used >= coupon.usageLimitPerUser) {
      throw AppError.badRequest("You have already used this coupon");
    }
  }

  if (coupon.firstOrderOnly) {
    const previousOrders = await prisma.order.count({ where: { userId } });
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

  return { coupon, discountAmount: round(discountAmount), freeShipping };
};

/**
 * Records a redemption once an order is confirmed.
 *
 * The counter increment is conditional on the limit not yet being reached, so
 * simultaneous checkouts cannot push a coupon past its cap.
 */
const redeem = async ({ coupon, userId, orderId, discountAmount, tx }) => {
  const { count } = await tx.coupon.updateMany({
    where: {
      id: coupon._id,
      ...(coupon.usageLimit > 0 ? { usedCount: { lt: coupon.usageLimit } } : {}),
    },
    data: { usedCount: { increment: 1 } },
  });

  if (count === 0) throw AppError.conflict("This coupon has reached its usage limit");

  await tx.couponRedemption.create({
    data: { couponId: coupon._id, code: coupon.code, userId, orderId, discountAmount },
  });
};

/** Reverses a redemption when the order it belonged to is cancelled. */
const revoke = async ({ orderId, tx }) => {
  const redemptions = await tx.couponRedemption.findMany({ where: { orderId } });

  for (const redemption of redemptions) {
    await tx.coupon.update({
      where: { id: redemption.couponId },
      data: { usedCount: { decrement: 1 } },
    });
    await tx.couponRedemption.delete({ where: { id: redemption.id } });
  }

  if (redemptions.length) logger.info("Coupon redemptions revoked", { orderId });
  return { revoked: redemptions.length };
};

/* -------------------------------- Management ------------------------------- */

const list = async ({ page, limit, sort, search, isActive, status }) => {
  const now = new Date();
  const where = {
    ...searchFilter(search, ["code", "description"]),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  if (status === "expired") {
    where.expiresAt = { not: null, lt: now };
  } else if (status === "scheduled") {
    where.startsAt = { gt: now };
  } else if (status === "active") {
    where.isActive = true;
    where.startsAt = { lte: now };
    where.AND = [{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }];
  }

  const [rows, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: parseSort(sort, SORTABLE),
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  return { items: rows.map((row) => withStatus(toCoupon(row))), total, page, limit };
};

const create = async (payload, actorId) => {
  const existing = await prisma.coupon.count({ where: { code: payload.code.toUpperCase() } });
  if (existing) throw AppError.conflict("A coupon with this code already exists");

  return toCoupon(await prisma.coupon.create({ data: { ...payload, createdById: actorId } }));
};

const update = async (id, payload) => {
  const exists = await prisma.coupon.count({ where: { id } });
  if (!exists) throw AppError.notFound("Coupon not found");

  return toCoupon(await prisma.coupon.update({ where: { id }, data: payload }));
};

const remove = async (id) => {
  const exists = await prisma.coupon.count({ where: { id } });
  if (!exists) throw AppError.notFound("Coupon not found");

  const used = await prisma.couponRedemption.count({ where: { couponId: id } });
  if (used > 0) {
    // Historic orders reference it, so it is retired rather than deleted.
    await prisma.coupon.update({ where: { id }, data: { isActive: false } });
    return { deactivated: true, redemptions: used };
  }

  await prisma.coupon.delete({ where: { id } });
  return { deleted: true };
};

const getById = async (id) => {
  const row = await prisma.coupon.findUnique({ where: { id } });
  if (!row) throw AppError.notFound("Coupon not found");

  const rows = await prisma.couponRedemption.findMany({
    where: { couponId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  const redemptions = rows.map(toRedemption);

  const totalDiscount = redemptions.reduce((sum, r) => sum + r.discountAmount, 0);
  return { ...withStatus(toCoupon(row)), redemptions, stats: { totalDiscount } };
};

module.exports = { validateForCart, redeem, revoke, list, create, update, remove, getById };
