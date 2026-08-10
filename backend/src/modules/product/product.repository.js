const BaseRepository = require("../../core/BaseRepository");
const Product = require("../../models/ProductModel");
const { LOW_STOCK_EXPR, ACTIVE_FILTER } = require("../../constants/inventory");

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /** Distinct category names, for populating catalogue filters. */
  listCategories() {
    return this.model.distinct("category", ACTIVE_FILTER);
  }

  /** Distinct brand names, for populating catalogue filters. */
  listBrands() {
    return this.model.distinct("brand", ACTIVE_FILTER);
  }

  /**
   * Products at or below their low-stock threshold, most urgent first.
   * `$expr` is required because the comparison is between two fields.
   */
  findLowStock(limit = 10) {
    return this.model
      .find({ ...ACTIVE_FILTER, $expr: LOW_STOCK_EXPR })
      .sort({ countInStock: 1 })
      .limit(limit)
      .select("name image countInStock lowStockThreshold price category")
      .lean();
  }

  /**
   * Atomically reserves stock, returning null when insufficient units remain.
   * The quantity guard lives in the filter so concurrent checkouts cannot
   * both pass a read-then-write check and oversell.
   */
  decrementStock(productId, qty, session) {
    return this.model.findOneAndUpdate(
      { _id: productId, countInStock: { $gte: qty } },
      { $inc: { countInStock: -qty } },
      { new: true, session }
    );
  }

  /** Returns reserved stock, used when an order is cancelled. */
  incrementStock(productId, qty, session) {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { countInStock: qty } },
      { new: true, session }
    );
  }
}

module.exports = new ProductRepository();
