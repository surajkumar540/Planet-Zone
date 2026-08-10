const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const { withTransaction } = require("../../core/transaction");
const orderRepository = require("./order.repository");
const productRepository = require("../product/product.repository");
const pricingService = require("../../services/pricing.service");
const paymentService = require("../../services/payment.service");
const { parseSort, searchFilter } = require("../../utils/schemas");
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  CUSTOMER_CANCELLABLE,
  canTransition,
} = require("../../constants/orderStatus");

/**
 * Reserves stock for every line, rolling back the reservations already made
 * if any line cannot be satisfied.
 *
 * Each decrement is conditional on sufficient stock, so two concurrent
 * checkouts for the last unit cannot both succeed.
 */
const reserveStock = async (items, session) => {
  const reserved = [];
  try {
    for (const item of items) {
      const updated = await productRepository.decrementStock(item.product, item.qty, session);
      if (!updated) {
        throw AppError.conflict(`${item.name} is no longer available in the requested quantity`);
      }
      reserved.push(item);
    }
  } catch (error) {
    // Inside a transaction the abort undoes these; without one we must
    // compensate by hand.
    if (!session) {
      await Promise.all(
        reserved.map((item) =>
          productRepository
            .incrementStock(item.product, item.qty)
            .catch((rollbackError) =>
              logger.error(`Failed to release reserved stock: ${rollbackError.message}`, {
                product: item.product,
              })
            )
        )
      );
    }
    throw error;
  }
  return reserved;
};

const releaseStock = (items) =>
  Promise.all(
    (items || []).map((item) =>
      productRepository
        .incrementStock(item.product, item.qty)
        .catch((error) =>
          logger.error(`Failed to return stock: ${error.message}`, { product: item.product })
        )
    )
  );

/**
 * Places an order.
 *
 * Prices come from the catalogue rather than the request, stock is reserved
 * atomically, and an online order is only accepted once its payment has been
 * verified against the gateway signature.
 */
const createOrder = async ({ userId, cart, shippingAddress, paymentId, onlinePayment }) => {
  const { items, pricing } = await pricingService.priceCart(cart);

  let paymentDoc = null;
  if (onlinePayment) {
    if (!paymentId) throw AppError.badRequest("Payment reference is required");

    paymentDoc = await paymentService.getVerifiedPayment(paymentId, userId);

    // The gateway works in the smallest currency unit; compare like for like.
    const expected = Math.round(pricing.grandTotal * 100);
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
    const reserved = await reserveStock(items, session);

    try {
      const order = await orderRepository.create(
        {
          User: userId,
          orderItems: items,
          shippingAddress,
          pricing,
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

      return order;
    } catch (error) {
      if (!session) await releaseStock(reserved);
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
 * This is the check whose absence previously allowed any signed-in user to
 * read any order by guessing its id.
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

/** Moves an order along its lifecycle, rejecting illegal transitions. */
const updateOrderStatus = async ({ orderId, status, note, actorId }) => {
  const order = await orderRepository.model.findById(orderId);
  if (!order) throw AppError.notFound("Order not found");

  if (order.status === status) return order.toObject();

  if (!canTransition(order.status, status)) {
    throw AppError.badRequest(`An order cannot move from ${order.status} to ${status}`);
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || "", changedBy: actorId });

  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = new Date();
    // Cash on delivery is settled at the door.
    if (!order.onlinePayment) order.paymentStatus = PAYMENT_STATUS.PAID;
  }

  if (status === ORDER_STATUS.CANCELLED) {
    order.cancelledAt = new Date();
    order.cancellationReason = note || "";
    await releaseStock(order.orderItems);
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
  createOrder,
  listMyOrders,
  listAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
