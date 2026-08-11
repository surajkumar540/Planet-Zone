const { z } = require("zod");
const { objectId, listQuery } = require("../../utils/schemas");

/** `/product/:id/reviews` — public listing for one product. */
const productReviewsQuery = listQuery.extend({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

/**
 * `/reviews` — moderation queue across every product.
 *
 * `status` filters on the embedded `isApproved` flag. Reviews written before
 * moderation existed have no flag at all, so "approved" must also match a
 * missing field rather than a literal `true`.
 */
const moderationQuery = listQuery.extend({
  status: z.enum(["all", "approved", "pending"]).default("all"),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  productId: objectId.optional(),
});

const reviewParams = z.object({ productId: objectId, reviewId: objectId });

const moderateBody = z.object({ isApproved: z.boolean() });

module.exports = {
  productReviewsQuery,
  moderationQuery,
  reviewParams,
  moderateBody,
};
