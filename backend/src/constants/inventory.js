/** Threshold applied when a product does not set its own. */
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

/** Matches products visible on the storefront. */
const ACTIVE_FILTER = { isActive: true };

/** Why stock moved. Drives reporting and reconciliation. */
const MOVEMENT_REASONS = Object.freeze({
  PURCHASE: "purchase",
  SALE: "sale",
  RETURN: "return",
  ADJUSTMENT: "adjustment",
  TRANSFER_IN: "transfer_in",
  TRANSFER_OUT: "transfer_out",
  DAMAGE: "damage",
  STOCKTAKE: "stocktake",
  RESERVATION: "reservation",
  RELEASE: "release",
});

const MOVEMENT_REASON_VALUES = Object.values(MOVEMENT_REASONS);

module.exports = {
  DEFAULT_LOW_STOCK_THRESHOLD,
  ACTIVE_FILTER,
  MOVEMENT_REASONS,
  MOVEMENT_REASON_VALUES,
};
