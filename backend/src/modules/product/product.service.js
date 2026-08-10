const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const Category = require("../../models/CategoryModel");
const productRepository = require("./product.repository");
const inventoryService = require("../inventory/inventory.service");
const { parseSort, searchFilter } = require("../../utils/schemas");
const { LOW_STOCK_EXPR } = require("../../constants/inventory");

/** Translates the validated list query into a Mongo filter. */
const buildFilter = ({
  search,
  category,
  categoryRef,
  brand,
  minPrice,
  maxPrice,
  inStock,
  lowStock,
  minRating,
  isFeatured,
  hasVariants,
  includeInactive,
}) => {
  const filter = {};

  // Inactive products are hidden from the storefront; the dashboard opts in.
  // Matched with `$ne: false` rather than `true` so products created before
  // this field existed are still returned.
  if (!includeInactive) filter.isActive = { $ne: false };

  if (search) Object.assign(filter, searchFilter(search, ["name", "brand", "category", "sku"]));
  if (category) filter.category = category;
  if (categoryRef) filter.categoryRef = categoryRef;
  if (brand) filter.brand = brand;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured;
  if (hasVariants !== undefined) filter.hasVariants = hasVariants;
  if (minRating !== undefined) filter.rating = { $gte: minRating };

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.totalPrice = {};
    if (minPrice !== undefined) filter.totalPrice.$gte = minPrice;
    if (maxPrice !== undefined) filter.totalPrice.$lte = maxPrice;
  }

  if (inStock === true) filter.countInStock = { $gt: 0 };
  if (inStock === false) filter.countInStock = { $lte: 0 };
  if (lowStock) filter.$expr = LOW_STOCK_EXPR;

  return filter;
};

const listProducts = async (query) => {
  const filter = buildFilter(query);
  return productRepository.paginate(filter, {
    page: query.page,
    limit: query.limit,
    sort: parseSort(query.sort),
    // Review bodies are large and unused in list views.
    select: "-reviews",
  });
};

const getProductById = async (id) => {
  const product = await productRepository.findById(id, {
    populate: { path: "reviews.User", select: "firstName lastName avatar" },
  });
  if (!product) throw AppError.notFound("Product not found");
  return product;
};

/**
 * Keeps the denormalised `category` name aligned with `categoryRef`.
 *
 * The string field is what the storefront filters on and what order snapshots
 * copy, so it must never disagree with the linked category.
 */
const syncCategoryName = async (payload) => {
  if (!payload.categoryRef) return payload;

  const category = await Category.findById(payload.categoryRef).select("name").lean();
  if (!category) throw AppError.badRequest("Category not found");
  return { ...payload, category: category.name };
};

const createProduct = async (userId, payload) => {
  // totalPrice is derived by the model, never accepted from the client.
  const body = await syncCategoryName(payload);
  const product = await productRepository.model.create({ ...body, User: userId });

  // Give the new product an inventory row so it is immediately sellable.
  await inventoryService
    .syncInventoryFromProduct(product)
    .catch((error) => logger.error(`Failed to seed inventory: ${error.message}`));

  return product.toObject();
};

/**
 * Applies a partial update.
 *
 * Uses a document save rather than an atomic update so the model's pre-validate
 * hook recomputes `totalPrice` and `slug` from the new inputs.
 */
const updateProduct = async (id, payload) => {
  const product = await productRepository.model.findById(id);
  if (!product) throw AppError.notFound("Product not found");

  const body = await syncCategoryName(payload);
  Object.assign(product, body);
  await product.save();

  await inventoryService
    .syncInventoryFromProduct(product)
    .catch((error) => logger.error(`Failed to sync inventory: ${error.message}`));

  return product.toObject();
};

const deleteProduct = async (id) => {
  const product = await productRepository.deleteById(id);
  if (!product) throw AppError.notFound("Product not found");
  return product;
};

/** Adds or replaces the caller's review and refreshes the rating summary. */
const upsertReview = async ({ productId, user, rating, comment }) => {
  const product = await productRepository.model.findById(productId);
  if (!product) throw AppError.notFound("Product not found");

  const existing = product.reviews.find(
    (review) => String(review.User) === String(user._id)
  );

  if (existing) {
    existing.rating = rating;
    existing.comment = comment;
  } else {
    product.reviews.push({
      User: user._id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" "),
      rating,
      comment,
    });
  }

  product.recalculateRating();
  await product.save();
  return { rating: product.rating, numReviews: product.numReviews };
};

const deleteReview = async ({ productId, reviewUserId }) => {
  const product = await productRepository.model.findById(productId);
  if (!product) throw AppError.notFound("Product not found");

  const before = product.reviews.length;
  product.reviews = product.reviews.filter(
    (review) => String(review.User) !== String(reviewUserId)
  );
  if (product.reviews.length === before) throw AppError.notFound("Review not found");

  product.recalculateRating();
  await product.save();
  return { rating: product.rating, numReviews: product.numReviews };
};

const getFilterOptions = async () => {
  const [categories, brands] = await Promise.all([
    productRepository.listCategories(),
    productRepository.listBrands(),
  ]);
  return { categories: categories.filter(Boolean).sort(), brands: brands.filter(Boolean).sort() };
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upsertReview,
  deleteReview,
  getFilterOptions,
};
