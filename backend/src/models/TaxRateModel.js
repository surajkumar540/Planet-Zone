const mongoose = require("mongoose");

/**
 * A named tax rate that products can be assigned to.
 *
 * Products still carry their own `gst` percentage; these classes let a store
 * manage rates centrally and reprice a whole class at once.
 */
const taxRateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    code: { type: String, required: true, uppercase: true, trim: true, unique: true },
    rate: { type: Number, required: true, min: 0, max: 100 },

    /** Empty means the rate applies everywhere. */
    country: { type: String, default: "India", trim: true },
    states: { type: [String], default: [] },

    /**
     * When true the product price already contains the tax, so tax is
     * extracted from the price rather than added on top.
     */
    isInclusive: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    description: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

taxRateSchema.index({ isDefault: -1, name: 1 });

module.exports = mongoose.model("TaxRate", taxRateSchema);
