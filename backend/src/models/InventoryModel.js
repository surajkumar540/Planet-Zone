const mongoose = require("mongoose");

/**
 * Stock of one sellable unit at one location.
 *
 * `onHand` is what physically sits on the shelf and `reserved` is the part of
 * it already promised to open orders, so availability is `onHand - reserved`.
 * Products without variants use a `variantSku` of `""`.
 */
const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantSku: { type: String, default: "", trim: true, uppercase: true },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      index: true,
    },

    onHand: { type: Number, required: true, min: 0, default: 0 },
    reserved: { type: Number, required: true, min: 0, default: 0 },
    /** Units on a purchase order but not yet received. */
    incoming: { type: Number, min: 0, default: 0 },

    reorderPoint: { type: Number, min: 0, default: 5 },
    reorderQuantity: { type: Number, min: 0, default: 0 },
    binLocation: { type: String, default: "", trim: true },
    lastCountedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

inventorySchema.virtual("available").get(function available() {
  return Math.max(0, this.onHand - this.reserved);
});

inventorySchema.virtual("needsReorder").get(function needsReorder() {
  return this.onHand - this.reserved <= this.reorderPoint;
});

// One row per sellable unit per location; also the lookup used on every
// reservation, so it is both the uniqueness guarantee and the hot path index.
inventorySchema.index({ product: 1, variantSku: 1, warehouse: 1 }, { unique: true });
inventorySchema.index({ warehouse: 1, onHand: 1 });

module.exports = mongoose.model("Inventory", inventorySchema);
