const mongoose = require("mongoose");

/**
 * One record per successful coupon use.
 *
 * Kept separate from the coupon's `usedCount` so per-customer limits can be
 * enforced and redemptions can be reversed when an order is cancelled.
 */
const couponRedemptionSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true,
    },
    code: { type: String, required: true, uppercase: true },
    User: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", index: true },
    discountAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// The per-user limit check reads this pair directly.
couponRedemptionSchema.index({ coupon: 1, User: 1 });

module.exports = mongoose.model("CouponRedemption", couponRedemptionSchema);
