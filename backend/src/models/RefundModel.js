const mongoose = require("mongoose");
const { REFUND_STATUS, REFUND_STATUS_VALUES } = require("../constants/refund");

/**
 * A request to return money for all or part of an order.
 *
 * Lines are optional: an empty `items` array means the whole order.
 */
const refundSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    orderNumber: { type: String, default: "" },
    User: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        variantSku: { type: String, default: "" },
        name: { type: String, default: "" },
        qty: { type: Number, min: 1, default: 1 },
        amount: { type: Number, min: 0, default: 0 },
        _id: false,
      },
    ],

    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, maxlength: 500 },
    customerNote: { type: String, default: "", maxlength: 1000 },
    staffNote: { type: String, default: "", maxlength: 1000 },

    status: {
      type: String,
      enum: REFUND_STATUS_VALUES,
      default: REFUND_STATUS.REQUESTED,
      index: true,
    },
    /** Whether returned goods should go back into sellable stock. */
    restock: { type: Boolean, default: true },

    method: { type: String, enum: ["original", "manual", "store_credit"], default: "original" },
    gatewayRefundId: { type: String, default: "" },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

refundSchema.index({ status: 1, createdAt: -1 });
refundSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Refund", refundSchema);
