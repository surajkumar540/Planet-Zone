const prisma = require("../../db/client");
const BaseRepository = require("../../core/BaseRepository");
const { toProduct } = require("../../db/mappers");
const { ACTIVE_FILTER } = require("../../constants/inventory");

const WITH_VARIANTS = { variants: { orderBy: { position: "asc" } } };

/** Products at or below their own reorder threshold (a column-to-column compare). */
const lowStockFilter = () => ({
  countInStock: { lte: prisma.product.fields.lowStockThreshold },
});

class ProductRepository extends BaseRepository {
  constructor() {
    super("product", toProduct, WITH_VARIANTS);
  }

  /** Distinct category names, for populating catalogue filters. */
  async listCategories() {
    const rows = await this.delegate().findMany({
      where: ACTIVE_FILTER,
      distinct: ["category"],
      select: { category: true },
    });
    return rows.map((row) => row.category);
  }

  /** Distinct brand names, for populating catalogue filters. */
  async listBrands() {
    const rows = await this.delegate().findMany({
      where: ACTIVE_FILTER,
      distinct: ["brand"],
      select: { brand: true },
    });
    return rows.map((row) => row.brand);
  }

  /** Products at or below their low-stock threshold, most urgent first. */
  async findLowStock(limit = 10) {
    const rows = await this.delegate().findMany({
      where: { ...ACTIVE_FILTER, ...lowStockFilter() },
      orderBy: { countInStock: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        image: true,
        countInStock: true,
        lowStockThreshold: true,
        price: true,
        category: true,
      },
    });
    return rows.map(toProduct);
  }

  /** Recomputes the denormalised rating summary from approved reviews. */
  async refreshRating(productId, tx) {
    const client = tx || prisma;
    const { _avg, _count } = await client.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const numReviews = _count._all;
    const rating = numReviews ? Math.round(_avg.rating * 10) / 10 : 0;

    await client.product.update({ where: { id: productId }, data: { numReviews, rating } });
    return { rating, numReviews };
  }
}

module.exports = new ProductRepository();
module.exports.lowStockFilter = lowStockFilter;
module.exports.WITH_VARIANTS = WITH_VARIANTS;
