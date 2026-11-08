/**
 * Translates database rows into the JSON shape the API has always returned.
 *
 * The frontend reads `_id`, `User`, `pricing.grandTotal` and nested
 * `shippingAddress` objects, while the tables use `id`, `userId` and flat
 * columns. Keeping that translation here means neither side has to know about
 * the other. Services work with these mapped objects, so DECIMAL columns are
 * already plain numbers by the time any business logic sees them.
 */

const { ROLES } = require("../constants/roles");

/** DECIMAL columns arrive as Decimal objects; absent values stay absent. */
const num = (value) => (value === null || value === undefined ? value : Number(value));

/** A relation that may be loaded (renamed row) or just its foreign key. */
const ref = (row, foreignKey) => {
  if (!row) return foreignKey ?? null;
  const { id, ...rest } = row;
  return { _id: id, ...rest };
};

const toUser = (row, { withPassword = false } = {}) => {
  if (!row) return null;
  const { id, password, ...rest } = row;
  return {
    _id: id,
    ...rest,
    isAdmin: row.role === ROLES.ADMIN,
    ...(withPassword ? { password } : {}),
  };
};

const toAddress = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    User: row.userId,
    label: row.label,
    shippingAddress: {
      fullName: row.fullName,
      phoneNo: Number(row.phoneNo),
      state: row.state,
      address: row.address,
      city: row.city,
      pinCode: row.pinCode,
      landMark: row.landMark,
    },
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const toCategory = (row) => {
  if (!row) return null;
  const { id, parentId, ...rest } = row;
  return { _id: id, parent: parentId, ...rest };
};

const toAttribute = (row) => {
  if (!row) return null;
  const { id, ...rest } = row;
  return { _id: id, ...rest };
};

const toVariant = (row) => {
  const { id, productId, ...rest } = row;
  return {
    _id: id,
    ...rest,
    price: num(row.price),
    discount: num(row.discount),
    gst: num(row.gst),
    totalPrice: num(row.totalPrice),
  };
};

/** A review as embedded in a product detail response. */
const toEmbeddedReview = (row) => ({
  _id: row.id,
  User: ref(row.user, row.userId),
  name: row.name,
  rating: row.rating,
  comment: row.comment,
  isApproved: row.isApproved,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const toProduct = (row) => {
  if (!row) return null;
  const { id, userId, user, categoryRefId, categoryRef, variants, reviews, ...rest } = row;
  return {
    _id: id,
    User: userId,
    ...rest,
    categoryRef: categoryRefId,
    price: num(row.price),
    discount: num(row.discount),
    gst: num(row.gst),
    totalPrice: num(row.totalPrice),
    rating: num(row.rating),
    variants: (variants || []).map(toVariant),
    ...(reviews ? { reviews: reviews.map(toEmbeddedReview) } : {}),
  };
};

const toWarehouse = (row) => {
  if (!row) return null;
  const { id, ...rest } = row;
  return { _id: id, ...rest };
};

const toInventory = (row) => {
  if (!row) return null;
  const { id, productId, warehouseId, ...rest } = row;
  return {
    _id: id,
    product: productId,
    warehouse: warehouseId,
    ...rest,
    available: Math.max(0, row.onHand - row.reserved),
    needsReorder: row.onHand - row.reserved <= row.reorderPoint,
  };
};

const toStockMovement = (row) => ({
  _id: row.id,
  product: ref(row.product, row.productId),
  variantSku: row.variantSku,
  warehouse: ref(row.warehouse, row.warehouseId),
  quantity: row.quantity,
  balanceAfter: row.balanceAfter,
  reason: row.reason,
  note: row.note,
  referenceType: row.referenceType,
  referenceId: row.referenceId,
  performedBy: ref(row.performedBy, row.performedById),
  createdAt: row.createdAt,
});

const toOrderItem = (row) => ({
  product: row.productId,
  variantSku: row.variantSku,
  variantLabel: row.variantLabel,
  name: row.name,
  qty: row.qty,
  image: row.image,
  price: num(row.price),
  gst: num(row.gst),
  discount: num(row.discount),
  totalPrice: num(row.totalPrice),
  lineTotal: num(row.lineTotal),
  brand: row.brand,
  category: row.category,
  categoryRef: row.categoryRefId,
});

const EMPTY_COUPON = { coupon: null, code: "", type: "", discountAmount: 0 };
const EMPTY_SHIPPING = {
  zone: null,
  zoneName: "",
  rateName: "",
  cost: 0,
  minDeliveryDays: 0,
  maxDeliveryDays: 0,
  trackingNumber: "",
  carrier: "",
};
const EMPTY_PAYMENT = {
  _id: null,
  entity: "",
  amount: 0,
  amount_paid: 0,
  amount_due: 0,
  currency: "",
  attempts: 0,
  offer_id: "",
  status: "",
  created_at: 0,
  summary: { orderCreationId: "", razorpayPaymentId: "", razorpayOrderId: "", razorpaySignature: "" },
};

const toOrder = (row) => {
  if (!row) return null;
  const items = (row.items || []).map(toOrderItem);
  return {
    _id: row.id,
    orderNumber: row.orderNumber,
    User: ref(row.user, row.userId),
    orderItems: items,
    shippingAddress: row.shippingAddress,
    pricing: {
      itemsTotal: num(row.itemsTotal),
      discountTotal: num(row.discountTotal),
      productDiscountTotal: num(row.productDiscountTotal),
      couponDiscountTotal: num(row.couponDiscountTotal),
      taxTotal: num(row.taxTotal),
      shippingTotal: num(row.shippingTotal),
      grandTotal: num(row.grandTotal),
      currency: row.currency,
    },
    coupon: { ...EMPTY_COUPON, ...(row.coupon || {}) },
    shipping: { ...EMPTY_SHIPPING, ...(row.shipping || {}) },
    stockFulfilled: row.stockFulfilled,
    status: row.status,
    statusHistory: (row.history || []).map((event) => ({
      status: event.status,
      note: event.note,
      changedBy: event.changedById,
      changedAt: event.changedAt,
    })),
    paymentStatus: row.paymentStatus,
    onlinePayment: row.onlinePayment,
    paymentRef: row.paymentRef,
    payment: { ...EMPTY_PAYMENT, ...(row.payment || {}) },
    paidAt: row.paidAt,
    deliveredAt: row.deliveredAt,
    cancelledAt: row.cancelledAt,
    cancellationReason: row.cancellationReason,
    notes: row.notes,
    itemCount: items.reduce((sum, item) => sum + item.qty, 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

/** The signature stays in the database; only disputes ever need it. */
const toPayment = (row) => {
  if (!row) return null;
  const { id, userId, user, summary, ...rest } = row;
  const { razorpaySignature, ...publicSummary } = summary || {};
  return {
    _id: id,
    User: userId,
    ...rest,
    refundedAmount: num(row.refundedAmount),
    summary: publicSummary,
  };
};

const toRefund = (row) => {
  if (!row) return null;
  const { id, orderId, order, userId, user, reviewedById, reviewedBy, ...rest } = row;
  return {
    _id: id,
    ...rest,
    order: order ? toOrderSummary(order) : orderId,
    User: ref(user, userId),
    reviewedBy: reviewedById,
    amount: num(row.amount),
  };
};

const toOrderSummary = (order) => ({
  _id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  pricing: toOrder({ ...order, items: [], history: [] }).pricing,
});

const toCoupon = (row) => {
  if (!row) return null;
  const { id, createdById, createdBy, redemptions, ...rest } = row;
  return {
    _id: id,
    ...rest,
    createdBy: createdById,
    value: num(row.value),
    maxDiscountAmount: num(row.maxDiscountAmount),
    minOrderAmount: num(row.minOrderAmount),
  };
};

const toRedemption = (row) => ({
  _id: row.id,
  coupon: row.couponId,
  code: row.code,
  User: ref(row.user, row.userId),
  order: row.orderId,
  discountAmount: num(row.discountAmount),
  createdAt: row.createdAt,
});

const toContactMessage = (row) => {
  if (!row) return null;
  const { id, handledById, handledBy, ...rest } = row;
  return { _id: id, ...rest, handledBy: handledById };
};

const toSettings = (row) => {
  if (!row) return null;
  const { id, updatedById, updatedBy, ...rest } = row;
  return { _id: id, ...rest, updatedBy: updatedById };
};

const toTaxRate = (row) => {
  if (!row) return null;
  const { id, ...rest } = row;
  return { _id: id, ...rest, rate: num(row.rate) };
};

const toShippingRate = (row) => {
  const { id, zoneId, zone, ...rest } = row;
  return {
    _id: id,
    ...rest,
    price: num(row.price),
    minOrderAmount: num(row.minOrderAmount),
    maxOrderAmount: num(row.maxOrderAmount),
    freeAboveAmount: num(row.freeAboveAmount),
  };
};

const toShippingZone = (row) => {
  if (!row) return null;
  const { id, rates, ...rest } = row;
  return { _id: id, ...rest, rates: (rates || []).map(toShippingRate) };
};

module.exports = {
  num,
  ref,
  toUser,
  toAddress,
  toCategory,
  toAttribute,
  toVariant,
  toProduct,
  toWarehouse,
  toInventory,
  toStockMovement,
  toOrder,
  toPayment,
  toRefund,
  toCoupon,
  toRedemption,
  toContactMessage,
  toSettings,
  toTaxRate,
  toShippingZone,
};
