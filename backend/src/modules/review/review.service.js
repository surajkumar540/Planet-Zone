const prisma = require("../../db/client");
const AppError = require("../../core/AppError");
const { withTransaction } = require("../../core/transaction");
const productRepository = require("../product/product.repository");
const { parseSort, escapeLike, sortable } = require("../../utils/schemas");

const SORTABLE = sortable("createdAt", "updatedAt", "rating", "name");

const WITH_PRODUCT = {
  product: { select: { id: true, name: true, image: true, slug: true } },
};

/** The flat shape returned to clients, identical for both listings. */
const toFlatReview = (row) => ({
  _id: row.id,
  rating: row.rating,
  comment: row.comment,
  name: row.name,
  isApproved: row.isApproved,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  user: row.userId,
  product: {
    _id: row.product.id,
    name: row.product.name,
    image: row.product.image,
    slug: row.product.slug,
  },
});

const paginate = async (where, { sort, page, limit }) => {
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: WITH_PRODUCT,
      orderBy: parseSort(sort, SORTABLE),
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);
  return { items: rows.map(toFlatReview), total, page, limit };
};

/** Approved reviews for one product, newest first by default. */
const listProductReviews = async (productId, { page, limit, sort, rating }) => {
  const exists = await productRepository.count({ id: productId });
  if (!exists) throw AppError.notFound("Product not found");

  return paginate(
    { productId, isApproved: true, ...(rating !== undefined ? { rating } : {}) },
    { sort, page, limit }
  );
};

/** The rating histogram a product page shows next to its average. */
const getProductReviewSummary = async (productId) => {
  const buckets = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId, isApproved: true },
    _count: { _all: true },
  });

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let weighted = 0;
  for (const bucket of buckets) {
    distribution[bucket.rating] = bucket._count._all;
    total += bucket._count._all;
    weighted += bucket.rating * bucket._count._all;
  }

  return {
    total,
    average: total > 0 ? Math.round((weighted / total) * 10) / 10 : 0,
    distribution,
  };
};

/** Moderation queue: every review across every product, including inactive ones. */
const listAllReviews = async ({ page, limit, sort, search, status, rating, productId }) => {
  const where = {
    ...(status === "approved" ? { isApproved: true } : {}),
    ...(status === "pending" ? { isApproved: false } : {}),
    ...(rating !== undefined ? { rating } : {}),
    ...(productId ? { productId } : {}),
  };

  if (search) {
    const contains = { contains: escapeLike(search), mode: "insensitive" };
    where.OR = [{ comment: contains }, { name: contains }, { product: { name: contains } }];
  }

  return paginate(where, { sort, page, limit });
};

/** Confirms the review belongs to the product, or fails with 404. */
const assertReviewExists = async (productId, reviewId) => {
  const exists = await productRepository.count({ id: productId });
  if (!exists) throw AppError.notFound("Product not found");

  const review = await prisma.review.findFirst({
    where: { id: reviewId, productId },
    select: { id: true },
  });
  if (!review) throw AppError.notFound("Review not found");
};

/**
 * Approves or hides a review.
 *
 * The rating summary is recomputed because it counts only approved reviews —
 * hiding one has to move the product's average with it.
 */
const moderateReview = async ({ productId, reviewId, isApproved }) => {
  await assertReviewExists(productId, reviewId);

  return withTransaction(async (tx) => {
    await tx.review.update({ where: { id: reviewId }, data: { isApproved } });
    const summary = await productRepository.refreshRating(productId, tx);
    return { ...summary, isApproved };
  });
};

/** Removes a review outright. Used by staff; customers delete their own elsewhere. */
const removeReview = async ({ productId, reviewId }) => {
  await assertReviewExists(productId, reviewId);

  return withTransaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });
    return productRepository.refreshRating(productId, tx);
  });
};

module.exports = {
  listProductReviews,
  getProductReviewSummary,
  listAllReviews,
  moderateReview,
  removeReview,
};
