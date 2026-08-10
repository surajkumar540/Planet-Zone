const mongoose = require("mongoose");

/** A physical stocking location that inventory records are attached to. */
const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    code: { type: String, required: true, uppercase: true, trim: true, unique: true },

    address: {
      line1: { type: String, default: "", trim: true },
      line2: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
      pinCode: { type: String, default: "", trim: true },
      country: { type: String, default: "India", trim: true },
    },
    contactName: { type: String, default: "", trim: true },
    contactPhone: { type: String, default: "", trim: true },

    /** Orders draw from the default location unless told otherwise. */
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    /** Excluded from customer-facing availability when false. */
    fulfilsOnlineOrders: { type: Boolean, default: true },
  },
  { timestamps: true }
);

warehouseSchema.index({ isDefault: -1, name: 1 });

module.exports = mongoose.model("Warehouse", warehouseSchema);
