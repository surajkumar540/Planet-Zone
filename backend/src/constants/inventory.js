/** Threshold applied to products saved before the field existed. */
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

/**
 * Aggregation expression matching products at or below their reorder point.
 *
 * `$ifNull` supplies the default so legacy documents without the field are
 * still evaluated rather than silently excluded.
 */
const LOW_STOCK_EXPR = {
  $lte: [
    { $ifNull: ["$countInStock", 0] },
    { $ifNull: ["$lowStockThreshold", DEFAULT_LOW_STOCK_THRESHOLD] },
  ],
};

/** Matches products visible on the storefront, including pre-`isActive` rows. */
const ACTIVE_FILTER = { isActive: { $ne: false } };

module.exports = { DEFAULT_LOW_STOCK_THRESHOLD, LOW_STOCK_EXPR, ACTIVE_FILTER };
