const mongoose = require("mongoose");

/**
 * A saved customer address. Replaces the previous one-address-per-user
 * Shipping collection while keeping the same `shippingAddress` field names,
 * so existing clients continue to read the shape they expect.
 */
const addressSchema = new mongoose.Schema(
  {
    User: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, enum: ["home", "work", "other"], default: "home" },
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phoneNo: { type: Number, required: true },
      state: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      pinCode: { type: Number, required: true },
      landMark: { type: String, default: "", trim: true },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.index({ User: 1, isDefault: -1, updatedAt: -1 });

// Reuses the existing `shippings` collection so saved addresses survive.
module.exports = mongoose.model("Shipping", addressSchema);
