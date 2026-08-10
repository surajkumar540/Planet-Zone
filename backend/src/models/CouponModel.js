const mongoose = require("mongoose");
const { DISCOUNT_TYPES, DISCOUNT_TYPE_VALUES } = require("../constants/discount");

const couponSchema = new mongoose.Schema(
  {
    // Stored uppercase so lookups are case-insensitive without a collation.
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
      maxlength: 40,
    },
    description: { type: String, default: "", maxlength: 500 },

    type: { type: String, enum: DISCOUNT_TYPE_VALUES, default: DISCOUNT_TYPES.PERCENTAGE },
    /** Percent when type is percentage, otherwise a currency amount. */
    value: { type: Number, required: true, min: 0 },
    /** Ceiling applied to percentage discounts. Zero means no cap. */
    maxDiscountAmount: { type: Number, min: 0, default: 0 },
    minOrderAmount: { type: Number, min: 0, default: 0 },

    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },

    /** Total redemptions allowed. Zero means unlimited. */
    usageLimit: { type: Number, min: 0, default: 0 },
    usageLimitPerUser: { type: Number, min: 0, default: 1 },
    usedCount: { type: Number, min: 0, default: 0 },

    /** Empty arrays mean the coupon applies to the whole catalogue. */
    appliesToProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    appliesToCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    /** Restricts the coupon to specific customers when non-empty. */
    restrictedToUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    /** Only redeemable by customers who have never ordered before. */
    firstOrderOnly: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

couponSchema.virtual("isExpired").get(function isExpired() {
  return Boolean(this.expiresAt && this.expiresAt.getTime() < Date.now());
});

couponSchema.virtual("isExhausted").get(function isExhausted() {
  return Boolean(this.usageLimit && this.usedCount >= this.usageLimit);
});

couponSchema.virtual("isRedeemable").get(function isRedeemable() {
  const started = !this.startsAt || this.startsAt.getTime() <= Date.now();
  return this.isActive && started && !this.isExpired && !this.isExhausted;
});

couponSchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
