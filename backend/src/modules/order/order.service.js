const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const { withTransaction } = require("../../core/transaction");
const orderRepository = require("./order.repository");
const inventoryService = require("../inventory/inventory.service");
const couponService = require("../coupon/coupon.service");
const pricingService = require("../../services/pricing.service");
const paymentService = require("../../services/payment.service");
const notifications = require("../../services/orderNotifications");
const { parseSort, escapeLike, sortable } = require("../../utils/schemas");
const { toMinorUnits } = require("../../utils/money");
const { MOVEMENT_REASONS } = require("../../constants/inventory");
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  CUSTOMER_CANCELLABLE,
  canTransition,
} = require("../../constants/orderStatus");

const { WITH_LINES } = orderRepository;

const SORTABLE = {
  ...sortable("createdAt", "orderNumber", "status", "paymentStatus"),
  "pricing.grandTotal": "grandTotal",
};

const USER_SUMMARY = { id: true, firstName: true, lastName: true, email: true };

/** Sortable, human-readable reference; the random suffix avoids collisions. */
const generateOrderNumber = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `ORD-${stamp}${suffix}`;
};

/**
 * Reserves stock for every line.
 *
 * Reservations are conditional on unreserved stock existing, so two concurrent
 * checkouts cannot both claim the last unit, and a failure rolls back the
 * whole transaction. Lines are locked in a fixed order so two carts holding
 * the same products cannot deadlock.
 */
const reserveAll = async (items, orderRef, tx) => {
  const ordered = [...items].sort((a, b) =>
    `${a.product}:${a.variantSku}`.localeCompare(`${b.product}:${b.variantSku}`)
  );
  for (const item of ordered) {
    await inventoryService.reserve({
      productId: item.product,
      variantSku: item.variantSku || "",
      qty: item.qty,
      referenceId: orderRef,
      tx,
    });
  }
};

/**
 * Runs a stock change that should not block the order's status change.
 *
 * A shortfall is an operational problem to investigate, not a reason to refuse
 * a dispatch that has already happened. Only application errors are tolerated:
 * a database error has already aborted the transaction, so it must propagate.
 */
const tolerateStockConflict = async (work, message, context) => {
  try {
    await work();
  } catch (error) {
    if (!(error instanceof AppError)) throw error;
    logger.error(`${message}: ${error.message}`, context);
  }
};

/** Maps a priced cart line onto its order_items row. */
const toItemRow = (item, position) => ({
  position,
  productId: item.product,
  variantSku: item.variantSku || "",
  variantLabel: item.variantLabel || "",
  name: item.name,
  qty: item.qty,
  image: item.image,
  price: item.price,
  gst: item.gst,
  discount: item.discount,
  totalPrice: item.totalPrice,
  lineTotal: item.lineTotal,
  brand: item.brand || "",
  category: item.category || "",
  categoryRefId: item.categoryRef || null,
});

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

  const placed = await withTransaction(async (tx) => {
    await reserveAll(items, paymentId || userId, tx);

    const order = await orderRepository.create(
      {
        orderNumber: generateOrderNumber(),
        userId,
        shippingAddress,
        ...pricing,
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
              zone: shipping.zone?._id ?? null,
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
        // Round-tripped so dates in the snapshot become valid JSON.
        payment: paymentDoc ? JSON.parse(JSON.stringify(paymentDoc)) : undefined,
        status: ORDER_STATUS.CONFIRMED,
        items: { create: items.map(toItemRow) },
        history: {
          create: [
            { sequence: 0, status: ORDER_STATUS.PENDING, note: "Order placed", changedById: userId },
            {
              sequence: 1,
              status: ORDER_STATUS.CONFIRMED,
              note: onlinePayment ? "Payment verified" : "Cash on delivery",
              changedById: userId,
            },
          ],
        },
      },
      { tx }
    );

    if (coupon) {
      await couponService.redeem({
        coupon,
        userId,
        orderId: order._id,
        discountAmount: coupon.discountAmount,
        tx,
      });
    }

    return order;
  });

  // Only once the transaction has committed: never email about a rolled-back order.
  notifications.orderPlaced(placed);
  return placed;
};

/** The signed-in customer's own orders. */
const listMyOrders = async ({ userId, page, limit, sort, status }) => {
  const where = { userId, ...(status ? { status } : {}) };
  return orderRepository.paginate(where, {
    page,
    limit,
    orderBy: parseSort(sort, SORTABLE),
  });
};

/** Every order, for the dashboard queue. */
const listAllOrders = async ({ page, limit, sort, search, status, paymentStatus, from, to }) => {
  const where = {
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
  };

  if (search) {
    const pattern = escapeLike(search);
    const inAddress = (key) => ({
      shippingAddress: { path: [key], string_contains: pattern, mode: "insensitive" },
    });
    where.OR = [
      { orderNumber: { contains: pattern, mode: "insensitive" } },
      inAddress("fullName"),
      inAddress("city"),
    ];
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  return orderRepository.paginate(where, {
    page,
    limit,
    orderBy: parseSort(sort, SORTABLE),
    include: { ...WITH_LINES, user: { select: { ...USER_SUMMARY, avatar: true } } },
  });
};

/**
 * A single order. Customers may only read their own; staff may read any.
 */
const getOrderById = async ({ orderId, requester }) => {
  const order = await orderRepository.findById(orderId, {
    include: { ...WITH_LINES, user: { select: USER_SUMMARY } },
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
 * decrement, and cancellation returns the reserved units. The row is locked so
 * two staff updating the same order cannot both apply a stock change.
 */
const updateOrderStatus = async (input) => {
  const { order, changed } = await applyStatus(input);
  if (changed) notifications.orderStatusChanged(order);
  return order;
};

const applyStatus = async ({ orderId, status, note, actorId, tracking }) =>
  withTransaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId}::uuid FOR UPDATE`;

    const order = await orderRepository.findById(orderId, { tx });
    if (!order) throw AppError.notFound("Order not found");

    if (order.status === status) return { order, changed: false };

    if (!canTransition(order.status, status)) {
      throw AppError.badRequest(`An order cannot move from ${order.status} to ${status}`);
    }

    const data = {
      status,
      history: {
        create: {
          sequence: order.statusHistory.length,
          status,
          note: note || "",
          changedById: actorId,
        },
      },
    };

    // A line whose product has since been deleted has no stock left to move.
    const stockedItems = order.orderItems.filter((item) => item.product);
    const unitOf = (item) => ({
      productId: item.product,
      variantSku: item.variantSku || "",
      tx,
    });

    if (status === ORDER_STATUS.SHIPPED) {
      data.shipping = {
        ...order.shipping,
        shippedAt: new Date().toISOString(),
        ...(tracking?.trackingNumber ? { trackingNumber: tracking.trackingNumber } : {}),
        ...(tracking?.carrier ? { carrier: tracking.carrier } : {}),
      };

      // The goods have left the building, so the reservation becomes a sale.
      if (!order.stockFulfilled) {
        for (const item of stockedItems) {
          await tolerateStockConflict(
            () => inventoryService.fulfil({ ...unitOf(item), qty: item.qty, referenceId: order._id }),
            "Failed to fulfil stock on dispatch",
            { order: order._id, product: item.product }
          );
        }
        data.stockFulfilled = true;
      }
    }

    if (status === ORDER_STATUS.DELIVERED) {
      data.deliveredAt = new Date();
      // Cash on delivery is settled at the door.
      if (!order.onlinePayment) data.paymentStatus = PAYMENT_STATUS.PAID;
    }

    if (status === ORDER_STATUS.CANCELLED) {
      data.cancelledAt = new Date();
      data.cancellationReason = note || "";

      // Only unfulfilled stock is still reserved; dispatched stock is gone.
      if (!order.stockFulfilled) {
        for (const item of stockedItems) {
          await inventoryService.release({
            ...unitOf(item),
            qty: item.qty,
            referenceId: order._id,
          });
        }
      }
      await couponService.revoke({ orderId: order._id, tx });
    }

    if (status === ORDER_STATUS.RETURNED) {
      // Returned goods come back onto the shelf.
      for (const item of stockedItems) {
        await tolerateStockConflict(
          () =>
            inventoryService.adjustStock({
              ...unitOf(item),
              quantity: item.qty,
              reason: MOVEMENT_REASONS.RETURN,
              referenceType: "Order",
              referenceId: order._id,
              performedBy: actorId,
            }),
          "Failed to restock returned item",
          { order: order._id, product: item.product }
        );
      }
    }

    return { order: await orderRepository.updateById(orderId, data, { tx }), changed: true };
  });

/** Customer-initiated cancellation, allowed only before dispatch. */
const cancelOrder = async ({ orderId, requester, reason }) => {
  const order = await orderRepository.findById(orderId, { include: {} });
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
