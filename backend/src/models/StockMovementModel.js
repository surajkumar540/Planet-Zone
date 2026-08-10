const mongoose = require("mongoose");
const { MOVEMENT_REASONS } = require("../constants/inventory");

/**
 * Append-only ledger of every stock change.
 *
 * Inventory rows hold the current balance; this collection explains how that
 * balance was reached, which is what makes a discrepancy investigable.
 */
const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantSku: { type: String, default: "", trim: true, uppercase: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", index: true },

    /** Signed change: negative removes stock, positive adds it. */
    quantity: { type: Number, required: true },
    /** Balance after this movement, so history reads without re-summing. */
    balanceAfter: { type: Number, required: true },

    reason: {
      type: String,
      enum: Object.values(MOVEMENT_REASONS),
      required: true,
      index: true,
    },
    note: { type: String, default: "", maxlength: 500 },

    /** Originating document, e.g. an order id. */
    referenceType: { type: String, default: "" },
    referenceId: { type: String, default: "", index: true },

    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ createdAt: -1 });

module.exports = mongoose.model("StockMovement", stockMovementSchema);
