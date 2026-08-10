const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const Refund = require("../../models/RefundModel");
const Order = require("../../models/OrderModel");
const Payment = require("../../models/PaymentModel");
const inventoryService = require("../inventory/inventory.service");
const { REFUND_STATUS, REFUND_OPEN_STATUSES } = require("../../constants/refund");
const { PAYMENT_STATUS, ORDER_STATUS } = require("../../constants/orderStatus");
const { MOVEMENT_REASONS } = require("../../constants/inventory");
const { round } = require("../../utils/money");
const { parseSort, searchFilter } = require("../../utils/schemas");

/** Amount already refunded or awaiting processing against an order. */
const committedAmount = async (orderId, excludeId) => {
  const open = await Refund.find({
    order: orderId,
    _id: { $ne: excludeId },
    status: { $in: [...REFUND_OPEN_STATUSES, REFUND_STATUS.COMPLETED] },
  })
    .select("amount")
    .lean();

  return round(open.reduce((sum, refund) => sum + refund.amount, 0));
};

/**
 * Opens a refund request.
 *
 * The requested amount is capped at what remains refundable on the order, so
 * repeated partial requests can never exceed what was actually paid.
 */
const request = async ({ orderId, requester, items = [], amount, reason, customerNote }) => {
  const order = await Order.findById(orderId);
  if (!order) throw AppError.notFound("Order not found");

  if (!requester.isStaff && String(order.User) !== String(requester.userId)) {
    throw AppError.forbidden();
  }

  if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
    throw AppError.badRequest("This order has not been paid, so there is nothing to refund");
  }

  const alreadyCommitted = await committedAmount(orderId);
  const refundable = round(order.pricing.grandTotal - alreadyCommitted);

  if (refundable <= 0) {
    throw AppError.badRequest("This order has already been fully refunded");
  }

  // An unspecified amount refunds everything still outstanding.
  const requested = amount === undefined ? refundable : round(amount);
  if (requested <= 0) throw AppError.badRequest("Refund amount must be greater than zero");
  if (requested > refundable) {
    throw AppError.badRequest(`At most ₹${refundable} can still be refunded on this order`);
  }

  const refund = await Refund.create({
    order: order._id,
    orderNumber: order.orderNumber,
    User: order.User,
    items,
    amount: requested,
    reason,
    customerNote: customerNote || "",
  });

  return refund.toObject();
};

/**
 * Approves or rejects a request. Approval alone does not move money; that
 * happens in `process`, which keeps the decision and the payout auditable
 * as separate steps.
 */
const review = async ({ refundId, approve, staffNote, actorId }) => {
  const refund = await Refund.findById(refundId);
  if (!refund) throw AppError.notFound("Refund not found");

  if (refund.status !== REFUND_STATUS.REQUESTED) {
    throw AppError.badRequest(`This refund has already been ${refund.status}`);
  }

  refund.status = approve ? REFUND_STATUS.APPROVED : REFUND_STATUS.REJECTED;
  refund.staffNote = staffNote || "";
  refund.reviewedBy = actorId;
  refund.reviewedAt = new Date();
  await refund.save();

  return refund.toObject();
};

/**
 * Completes an approved refund: records the payout, returns stock if the
 * goods came back, and updates the order's payment status.
 *
 * The gateway call itself is left to an operator for now — the record is
 * marked complete so the money movement is tracked either way.
 */
const process = async ({ refundId, gatewayRefundId, actorId }) => {
  const refund = await Refund.findById(refundId);
  if (!refund) throw AppError.notFound("Refund not found");

  if (refund.status !== REFUND_STATUS.APPROVED) {
    throw AppError.badRequest("Only an approved refund can be processed");
  }

  const order = await Order.findById(refund.order);
  if (!order) throw AppError.notFound("Order not found");

  refund.status = REFUND_STATUS.COMPLETED;
  refund.gatewayRefundId = gatewayRefundId || "";
  refund.completedAt = new Date();
  await refund.save();

  if (refund.restock && refund.items?.length) {
    for (const item of refund.items) {
      await inventoryService
        .adjustStock({
          productId: item.product,
          variantSku: item.variantSku || "",
          quantity: item.qty,
          reason: MOVEMENT_REASONS.RETURN,
          note: `Refund ${refund._id}`,
          referenceType: "Refund",
          referenceId: refund._id,
          performedBy: actorId,
        })
        .catch((error) =>
          logger.error(`Failed to restock refunded item: ${error.message}`, {
            refund: refund._id,
            product: item.product,
          })
        );
    }
  }

  const totalRefunded = await committedAmount(order._id);
  const fullyRefunded = totalRefunded >= order.pricing.grandTotal;

  order.paymentStatus = fullyRefunded
    ? PAYMENT_STATUS.REFUNDED
    : PAYMENT_STATUS.PARTIALLY_REFUNDED;

  // A fully refunded order is closed out, when the lifecycle permits it.
  if (fullyRefunded && [ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED].includes(order.status)) {
    order.status = ORDER_STATUS.REFUNDED;
    order.statusHistory.push({
      status: ORDER_STATUS.REFUNDED,
      note: `Refund ${refund._id} completed`,
      changedBy: actorId,
    });
  }
  await order.save();

  if (order.paymentRef) {
    await Payment.updateOne(
      { _id: order.paymentRef },
      { $inc: { refundedAmount: refund.amount } }
    ).catch((error) => logger.error(`Failed to update payment refund total: ${error.message}`));
  }

  return refund.toObject();
};

const list = async ({ page, limit, sort, search, status, userId, isStaff }) => {
  const filter = {
    ...(status ? { status } : {}),
    ...searchFilter(search, ["orderNumber", "reason"]),
    // Customers only ever see their own requests.
    ...(isStaff ? {} : { User: userId }),
  };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Refund.find(filter)
      .sort(parseSort(sort))
      .skip(skip)
      .limit(limit)
      .populate("User", "firstName lastName email")
      .lean(),
    Refund.countDocuments(filter),
  ]);

  return { items, total, page, limit };
};

const getById = async ({ refundId, requester }) => {
  const refund = await Refund.findById(refundId)
    .populate("User", "firstName lastName email")
    .populate("order", "orderNumber pricing status")
    .lean();

  if (!refund) throw AppError.notFound("Refund not found");

  const ownerId = refund.User?._id || refund.User;
  if (!requester.isStaff && String(ownerId) !== String(requester.userId)) {
    throw AppError.forbidden();
  }
  return refund;
};

module.exports = { request, review, process, list, getById };
