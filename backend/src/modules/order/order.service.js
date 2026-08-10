const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const { withTransaction } = require("../../core/transaction");
const orderRepository = require("./order.repository");
const inventoryService = require("../inventory/inventory.service");
const couponService = require("../coupon/coupon.service");
const pricingService = require("../../services/pricing.service");
const paymentService = require("../../services/payment.service");
const { parseSort, searchFilter } = require("../../utils/schemas");
const { toMinorUnits } = require("../../utils/money");
const { MOVEMENT_REASONS } = require("../../constants/inventory");
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  CUSTOMER_CANCELLABLE,
  canTransition,
} = require("../../constants/orderStatus");

/**
 * Reserves stock for every line, releasing what was already taken if any
 * line cannot be satisfied.
 *
 * Reservations are conditional on unreserved stock existing, so two
 * concurrent checkouts cannot both claim the last unit.
 */
const reserveAll = async (items, orderRef, session) => {
  const reserved = [];
  try {
    for (const item of items) {
      await inventoryService.reserve({
        productId: item.product,
        variantSku: item.variantSku || "",
        qty: item.qty,
        referenceId: orderRef,
        session,
      });
      reserved.push(item);
    }
  } catch (error) {
    // A transaction abort undoes these; without one they must be compensated.
    if (!session) await releaseAll(reserved, orderRef);
    throw error;
  }
  return reserved;
};

const releaseAll = (items, orderRef) =>
  Promise.all(
    (items || []).map((item) =>
      inventoryService
        .release({
          productId: item.product,
          variantSku: item.variantSku || "",
          qty: item.qty,
          referenceId: orderRef,
        })
        .catch((error) =>
          logger.error(`Failed to release reserved stock: ${error.message}`, {
            product: item.product,
          })
        )
    )
  );

/**
 * Prices a cart without placing an order.
 *
 * Backs the cart summary and coupon-preview screens, using the same code path
 * that computes the real charge.
 */
const quote = ({ userId, cart, couponCode, shippingAddress, shippingRateId }) =>
  pricingService.quoteOrder({ cart, userId, couponCode, shippingAddress, shippingRateId });

/**
 * Places an order.
 *
 * Prices, discounts and delivery costs are all recomputed here; an online
 * order is accepted only once its payment has been verified against the
 * gateway signature and matches the computed total.
 */
const createOrder = async ({
  userId,
  cart,
  shippingAddress,
  paymentId,
  onlinePayment,
  couponCode,
  shippingRateId,
}) => {
  const quoted = await pricingService.quoteOrder({
    cart,
    userId,
    couponCode,
    shippingAddress,
    shippingRateId,
  });
  const { items, pricing, coupon, shipping } = quoted;

  let paymentDoc = null;
  if (onlinePayment) {
    if (!paymentId) throw AppError.badRequest("Payment reference is required");

    paymentDoc = await paymentService.getVerifiedPayment(paymentId, userId);

    const expected = toMinorUnits(pricing.grandTotal);
    if (paymentDoc.amount_paid !== expected) {
      logger.error("Payment amount does not match the order total", {
        paymentId,
        paid: paymentDoc.amount_paid,
        expected,
      });
      throw AppError.badRequest("Payment amount does not match the order total");
    }
  }

  return withTransaction(async (session) => {
    const reserved = await reserveAll(items, paymentId || userId, session);

    try {
      const order = await orderRepository.create(
        {
          User: userId,
          orderItems: items,
          shippingAddress,
          pricing,
          coupon: coupon
            ? {
                coupon: coupon._id,
                code: coupon.code,
                type: coupon.type,
                discountAmount: coupon.discountAmount,
              }
            : undefined,
          shipping: shipping
            ? {
                zone: shipping.zone?._id,
                zoneName: shipping.zone?.name || "",
                rateName: shipping.rate?.name || "",
                cost: shipping.cost,
                minDeliveryDays: shipping.rate?.minDeliveryDays || 0,
                maxDeliveryDays: shipping.rate?.maxDeliveryDays || 0,
              }
            : undefined,
          onlinePayment: Boolean(onlinePayment),
          paymentRef: paymentDoc?._id || null,
          paymentStatus: onlinePayment ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
          paidAt: onlinePayment ? new Date() : undefined,
          payment: paymentDoc || undefined,
          status: ORDER_STATUS.CONFIRMED,
          statusHistory: [
            { status: ORDER_STATUS.PENDING, note: "Order placed", changedBy: userId },
            {
              status: ORDER_STATUS.CONFIRMED,
              note: onlinePayment ? "Payment verified" : "Cash on delivery",
              changedBy: userId,
            },
          ],
        },
        session ? { session } : {}
      );

      if (coupon) {
        await couponService.redeem({
          coupon,
          userId,
          orderId: order._id,
          discountAmount: coupon.discountAmount,
          session,
        });
      }

      return order;
    } catch (error) {
      if (!session) await releaseAll(reserved, paymentId || userId);
      throw error;
    }
  });
};

/** The signed-in customer's own orders. */
const listMyOrders = async ({ userId, page, limit, sort, status }) => {
  const filter = { User: userId, ...(status ? { status } : {}) };
  return orderRepository.paginate(filter, { page, limit, sort: parseSort(sort) });
};

/** Every order, for the dashboard queue. */
const listAllOrders = async ({ page, limit, sort, search, status, paymentStatus, from, to }) => {
  const filter = {
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...searchFilter(search, ["orderNumber", "shippingAddress.fullName", "shippingAddress.city"]),
  };

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) filter.createdAt.$lte = to;
  }

  return orderRepository.paginate(filter, {
    page,
    limit,
    sort: parseSort(sort),
    populate: { path: "User", select: "firstName lastName email avatar" },
  });
};

/**
 * A single order. Customers may only read their own; staff may read any.
 */
const getOrderById = async ({ orderId, requester }) => {
  const order = await orderRepository.findById(orderId, {
    populate: { path: "User", select: "firstName lastName email" },
  });
  if (!order) throw AppError.notFound("Order not found");

  const ownerId = order.User?._id || order.User;
  if (!requester.isStaff && String(ownerId) !== String(requester.userId)) {
    throw AppError.forbidden();
  }

  return order;
};

/**
 * Moves an order along its lifecycle, rejecting illegal transitions.
 *
 * Stock follows the order: dispatch converts reservations into a real
 * decrement, and cancellation returns the reserved units.
 */
const updateOrderStatus = async ({ orderId, status, note, actorId, tracking }) => {
  const order = await orderRepository.model.findById(orderId);
  if (!order) throw AppError.notFound("Order not found");

  if (order.status === status) return order.toObject();

  if (!canTransition(order.status, status)) {
    throw AppError.badRequest(`An order cannot move from ${order.status} to ${status}`);
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || "", changedBy: actorId });

  if (status === ORDER_STATUS.SHIPPED) {
    order.shipping = order.shipping || {};
    order.shipping.shippedAt = new Date();
    if (tracking?.trackingNumber) order.shipping.trackingNumber = tracking.trackingNumber;
    if (tracking?.carrier) order.shipping.carrier = tracking.carrier;

    // The goods have left the building, so the reservation becomes a sale.
    if (!order.stockFulfilled) {
      for (const item of order.orderItems) {
        await inventoryService
          .fulfil({
            productId: item.product,
            variantSku: item.variantSku || "",
            qty: item.qty,
            referenceId: order._id,
          })
          .catch((error) =>
            logger.error(`Failed to fulfil stock on dispatch: ${error.message}`, {
              order: order._id,
              product: item.product,
            })
          );
      }
      order.stockFulfilled = true;
    }
  }

  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = new Date();
    // Cash on delivery is settled at the door.
    if (!order.onlinePayment) order.paymentStatus = PAYMENT_STATUS.PAID;
  }

  if (status === ORDER_STATUS.CANCELLED) {
    order.cancelledAt = new Date();
    order.cancellationReason = note || "";

    // Only unfulfilled stock is still reserved; dispatched stock is gone.
    if (!order.stockFulfilled) await releaseAll(order.orderItems, order._id);
    await couponService.revoke({ orderId: order._id });
  }

  if (status === ORDER_STATUS.RETURNED) {
    // Returned goods come back onto the shelf.
    for (const item of order.orderItems) {
      await inventoryService
        .adjustStock({
          productId: item.product,
          variantSku: item.variantSku || "",
          quantity: item.qty,
          reason: MOVEMENT_REASONS.RETURN,
          referenceType: "Order",
          referenceId: order._id,
          performedBy: actorId,
        })
        .catch((error) =>
          logger.error(`Failed to restock returned item: ${error.message}`, {
            order: order._id,
            product: item.product,
          })
        );
    }
  }

  await order.save();
  return order.toObject();
};

/** Customer-initiated cancellation, allowed only before dispatch. */
const cancelOrder = async ({ orderId, requester, reason }) => {
  const order = await orderRepository.model.findById(orderId);
  if (!order) throw AppError.notFound("Order not found");

  if (!requester.isStaff && String(order.User) !== String(requester.userId)) {
    throw AppError.forbidden();
  }

  if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
    throw AppError.badRequest(
      `This order can no longer be cancelled because it is already ${order.status}`
    );
  }

  return updateOrderStatus({
    orderId,
    status: ORDER_STATUS.CANCELLED,
    note: reason,
    actorId: requester.userId,
  });
};

module.exports = {
  quote,
  createOrder,
  listMyOrders,
  listAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
