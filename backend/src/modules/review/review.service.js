const mongoose = require("mongoose");
const AppError = require("../../core/AppError");
const Product = require("../../models/ProductModel");
const { parseSort, escapeRegex } = require("../../utils/schemas");

/**
 * Reviews are embedded in products rather than stored in their own
 * collection, so every read here unwinds `products.reviews` and reshapes the
 * result into a flat, review-shaped document. Doing it in the database keeps
 * paging honest: the alternative — loading products and slicing in Node —
 * pages over products, not over reviews.
 */

/** Reviews written before moderation existed carry no flag; treat them as approved. */
const APPROVED_MATCH = { $ne: false };

const statusMatch = (status) => {
  if (status === "approved") return { "reviews.isApproved": APPROVED_MATCH };
  if (status === "pending") return { "reviews.isApproved": false };
  return {};
};

/** The flat shape returned to clients, identical for both listings. */
const REVIEW_PROJECTION = {
  _id: "$reviews._id",
  rating: "$reviews.rating",
  comment: "$reviews.comment",
  name: "$reviews.name",
  isApproved: { $ne: ["$reviews.isApproved", false] },
  createdAt: "$reviews.createdAt",
  updatedAt: "$reviews.updatedAt",
  user: "$reviews.User",
  product: {
    _id: "$_id",
    name: "$name",
    image: "$image",
    slug: "$slug",
  },
};

/**
 * Runs the shared unwind/sort/paginate pipeline.
 *
 * `$facet` keeps the page and its total count in a single round trip, so the
 * two can never disagree about the state of the data.
 */
const runReviewPipeline = async ({ preMatch, postMatch, sort, page, limit }) => {
  const [result] = await Product.aggregate([
    { $match: preMatch },
    { $unwind: "$reviews" },
    ...(Object.keys(postMatch).length > 0 ? [{ $match: postMatch }] : []),
    { $project: REVIEW_PROJECTION },
    {
      $facet: {
        items: [{ $sort: sort }, { $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "value" }],
      },
    },
  ]);

  return {
    items: result?.items ?? [],
    total: result?.total?.[0]?.value ?? 0,
    page,
    limit,
  };
};

/** Approved reviews for one product, newest first by default. */
const listProductReviews = async (productId, { page, limit, sort, rating }) => {
  const exists = await Product.exists({ _id: productId });
  if (!exists) throw AppError.notFound("Product not found");

  return runReviewPipeline({
    preMatch: { _id: new mongoose.Types.ObjectId(productId) },
    postMatch: {
      "reviews.isApproved": APPROVED_MATCH,
      ...(rating !== undefined ? { "reviews.rating": rating } : {}),
    },
    sort: parseSort(sort, { createdAt: -1 }),
    page,
    limit,
  });
};

/** The rating histogram a product page shows next to its average. */
const getProductReviewSummary = async (productId) => {
  const buckets = await Product.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(productId) } },
    { $unwind: "$reviews" },
    { $match: { "reviews.isApproved": APPROVED_MATCH } },
    { $group: { _id: "$reviews.rating", count: { $sum: 1 } } },
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let weighted = 0;
  for (const bucket of buckets) {
    distribution[bucket._id] = bucket.count;
    total += bucket.count;
    weighted += bucket._id * bucket.count;
  }

  return {
    total,
    average: total > 0 ? Math.round((weighted / total) * 10) / 10 : 0,
    distribution,
  };
};

/** Moderation queue: every review across every product, including inactive ones. */
const listAllReviews = async ({ page, limit, sort, search, status, rating, productId }) => {
  const postMatch = {
    ...statusMatch(status),
    ...(rating !== undefined ? { "reviews.rating": rating } : {}),
  };

  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    postMatch.$or = [{ "reviews.comment": pattern }, { "reviews.name": pattern }, { name: pattern }];
  }

  return runReviewPipeline({
    preMatch: {
      "reviews.0": { $exists: true },
      ...(productId ? { _id: new mongoose.Types.ObjectId(productId) } : {}),
    },
    postMatch,
    sort: parseSort(sort, { createdAt: -1 }),
    page,
    limit,
  });
};

/** Loads the parent product and the embedded review, or fails with 404. */
const locateReview = async (productId, reviewId) => {
  const product = await Product.findById(productId);
  if (!product) throw AppError.notFound("Product not found");

  const review = product.reviews.id(reviewId);
  if (!review) throw AppError.notFound("Review not found");

  return { product, review };
};

/**
 * Approves or hides a review.
 *
 * The rating summary is recomputed because `recalculateRating` counts only
 * approved reviews — hiding one has to move the product's average with it.
 */
const moderateReview = async ({ productId, reviewId, isApproved }) => {
  const { product, review } = await locateReview(productId, reviewId);

  review.isApproved = isApproved;
  product.recalculateRating();
  await product.save();

  return { rating: product.rating, numReviews: product.numReviews, isApproved };
};

/** Removes a review outright. Used by staff; customers delete their own elsewhere. */
const removeReview = async ({ productId, reviewId }) => {
  const { product, review } = await locateReview(productId, reviewId);

  review.deleteOne();
  product.recalculateRating();
  await product.save();

  return { rating: product.rating, numReviews: product.numReviews };
};

module.exports = {
  listProductReviews,
  getProductReviewSummary,
  listAllReviews,
  moderateReview,
  removeReview,
};
