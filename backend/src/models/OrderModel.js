const mongoose = require("mongoose");
const {
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
} = require("../constants/orderStatus");

/**
 * A line item is a snapshot taken at checkout. Prices are copied from the
 * catalogue by the server at order time so later catalogue edits never
 * rewrite the history of an existing order.
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    /** Empty for products sold without variants. */
    variantSku: { type: String, default: "" },
    /** Human-readable option summary, e.g. "Red / Medium". */
    variantLabel: { type: String, default: "" },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    gst: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0 },
    // Tax-inclusive price of a single unit.
    totalPrice: { type: Number, required: true, min: 0 },
    // Tax-inclusive price of the whole line (`totalPrice * qty`).
    lineTotal: { type: Number, required: true, min: 0 },
    brand: { type: String, default: "" },
    category: { type: String, default: "" },
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phoneNo: { type: Number, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pinCode: { type: Number, required: true },
    landMark: { type: String, default: "" },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUS_VALUES, required: true },
    note: { type: String, default: "" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Human-facing reference shown in the dashboard and emails.
    orderNumber: { type: String, unique: true, index: true },

    User: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderItems: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },

    /**
     * Authoritative money figures, all computed server-side from the
     * catalogue. Client supplied totals are never trusted.
     */
    pricing: {
      itemsTotal: { type: Number, required: true, min: 0, default: 0 },
      /** Product markdowns and coupon savings combined. */
      discountTotal: { type: Number, required: true, min: 0, default: 0 },
      productDiscountTotal: { type: Number, min: 0, default: 0 },
      couponDiscountTotal: { type: Number, min: 0, default: 0 },
      taxTotal: { type: Number, required: true, min: 0, default: 0 },
      shippingTotal: { type: Number, required: true, min: 0, default: 0 },
      grandTotal: { type: Number, required: true, min: 0, default: 0 },
      currency: { type: String, default: "INR" },
    },

    /** Snapshot of the coupon applied, if any. */
    coupon: {
      coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
      code: { type: String, default: "" },
      type: { type: String, default: "" },
      discountAmount: { type: Number, min: 0, default: 0 },
    },

    /** Delivery zone, rate and promised window at the time of ordering. */
    shipping: {
      zone: { type: mongoose.Schema.Types.ObjectId, ref: "ShippingZone", default: null },
      zoneName: { type: String, default: "" },
      rateName: { type: String, default: "" },
      cost: { type: Number, min: 0, default: 0 },
      minDeliveryDays: { type: Number, min: 0, default: 0 },
      maxDeliveryDays: { type: Number, min: 0, default: 0 },
      trackingNumber: { type: String, default: "" },
      carrier: { type: String, default: "" },
      shippedAt: { type: Date },
    },

    /** Set once reserved stock has been converted into a dispatch. */
    stockFulfilled: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },

    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    onlinePayment: { type: Boolean, default: false },
    // Razorpay order id; links to the Payment document.
    paymentRef: { type: String, default: null, index: true },

    // Denormalised payment snapshot retained for the existing order UI.
    payment: {
      _id: { type: String, default: null },
      entity: { type: String, default: "" },
      amount: { type: Number, default: 0 },
      amount_paid: { type: Number, default: 0 },
      amount_due: { type: Number, default: 0 },
      currency: { type: String, default: "" },
      attempts: { type: Number, default: 0 },
      offer_id: { type: String, default: "" },
      status: { type: String, default: "" },
      created_at: { type: Number, default: 0 },
      summary: {
        orderCreationId: { type: String, default: "" },
        razorpayPaymentId: { type: String, default: "" },
        razorpayOrderId: { type: String, default: "" },
        razorpaySignature: { type: String, default: "" },
      },
    },

    paidAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

orderSchema.virtual("itemCount").get(function itemCount() {
  return (this.orderItems || []).reduce((sum, item) => sum + item.qty, 0);
});

/**
 * Assigns a sortable, human-readable order number on first save.
 * The random suffix keeps concurrent inserts from colliding.
 */
orderSchema.pre("validate", function assignOrderNumber(next) {
  if (!this.orderNumber) {
    const stamp = Date.now().toString(36).toUpperCase();
    const suffix = Math.floor(Math.random() * 1296)
      .toString(36)
      .toUpperCase()
      .padStart(2, "0");
    this.orderNumber = `ORD-${stamp}${suffix}`;
  }
  next();
});

// Customer order history, newest first.
orderSchema.index({ User: 1, createdAt: -1 });
// Dashboard queues filtered by status.
orderSchema.index({ status: 1, createdAt: -1 });
// Revenue aggregations bucketed by day.
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
