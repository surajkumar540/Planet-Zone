const mongoose = require("mongoose");
const { PAYMENT_STATUS, PAYMENT_STATUS_VALUES } = require("../constants/orderStatus");

/**
 * Mirror of the gateway's order/payment record.
 *
 * `_id` is the gateway order id (a string, not an ObjectId) so the document
 * can be looked up directly from a webhook or client callback.
 */
const paymentSchema = new mongoose.Schema(
  {
    _id: { type: String },
    User: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    provider: { type: String, default: "razorpay" },

    entity: { type: String },
    // Amounts are held in the smallest currency unit, as the gateway reports them.
    amount: { type: Number },
    amount_paid: { type: Number, default: 0 },
    amount_due: { type: Number },
    currency: { type: String, default: "INR" },
    attempts: { type: Number, default: 0 },
    receipt: { type: String },
    offer_id: { type: String },
    status: { type: String },
    created_at: { type: Number },

    // Set once the callback signature has been verified server-side.
    verified: { type: Boolean, default: false, index: true },
    verifiedAt: { type: Date },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    failureReason: { type: String, default: "" },
    refundedAmount: { type: Number, default: 0 },

    summary: {
      orderCreationId: { type: String, default: "" },
      razorpayOrderId: { type: String, default: "" },
      razorpayPaymentId: { type: String, default: "" },
      // Never returned to clients; retained for dispute investigation only.
      razorpaySignature: { type: String, default: "", select: false },
    },
  },
  { timestamps: true, _id: false }
);

paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
