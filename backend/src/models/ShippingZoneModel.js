const mongoose = require("mongoose");

/**
 * A price band inside a zone.
 *
 * Bands are matched on order value, so a zone can offer standard delivery
 * below a threshold and free delivery above it.
 */
const shippingRateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 300 },

    price: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, min: 0, default: 0 },
    /** Zero means no upper bound. */
    maxOrderAmount: { type: Number, min: 0, default: 0 },
    /** Order value at or above which this rate becomes free. Zero disables it. */
    freeAboveAmount: { type: Number, min: 0, default: 0 },

    minDeliveryDays: { type: Number, min: 0, default: 2 },
    maxDeliveryDays: { type: Number, min: 0, default: 7 },
    isActive: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  { _id: true }
);

/**
 * A delivery region, matched against the shipping address.
 *
 * Matching runs most specific first: pin code, then state, then country.
 */
const shippingZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 500 },

    country: { type: String, default: "India", trim: true },
    states: { type: [String], default: [] },
    /** Leading digits of a pin code, e.g. "110" covers all 110xxx codes. */
    pinCodePrefixes: { type: [String], default: [] },

    rates: { type: [shippingRateSchema], default: [] },

    /** Applied when no other zone matches the address. */
    isFallback: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

shippingZoneSchema.index({ isActive: 1, position: 1 });
shippingZoneSchema.index({ states: 1 });

module.exports = mongoose.model("ShippingZone", shippingZoneSchema);
