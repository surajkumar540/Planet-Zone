/** Fulfilment lifecycle of an order. */
const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  PACKED: "packed",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
  REFUNDED: "refunded",
});

/**
 * Legal transitions. Anything not listed here is rejected by the order
 * service, so an order can never jump from, say, delivered back to pending.
 */
const ORDER_STATUS_TRANSITIONS = Object.freeze({
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.PACKED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PACKED]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.RETURNED],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.RETURNED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURNED],
  [ORDER_STATUS.RETURNED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.CANCELLED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.REFUNDED]: [],
});

/** Statuses at which stock has been consumed and revenue is recognised. */
const REVENUE_STATUSES = Object.freeze([
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.PACKED,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
]);

/** Statuses from which a customer may still cancel without support. */
const CUSTOMER_CANCELLABLE = Object.freeze([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
]);

const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
});

const canTransition = (from, to) =>
  (ORDER_STATUS_TRANSITIONS[from] || []).includes(to);

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_VALUES: Object.values(ORDER_STATUS),
  ORDER_STATUS_TRANSITIONS,
  REVENUE_STATUSES,
  CUSTOMER_CANCELLABLE,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES: Object.values(PAYMENT_STATUS),
  canTransition,
};
