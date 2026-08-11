const express = require("express");
const asyncHandler = require("../../core/asyncHandler");
const { ok, paginated } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");
const audit = require("../../services/audit.service");
const service = require("./review.service");
const schemas = require("./review.validation");
const { idParam } = require("../../utils/schemas");

const router = express.Router();

/* ---------------------------------- Public --------------------------------- */

/**
 * Paged reviews for a product. The product detail endpoint returns only the
 * denormalised `rating`/`numReviews`, so this is what a product page calls to
 * show the reviews themselves without loading every one of them at once.
 */
router.get(
  "/product/:id/reviews",
  validate({ params: idParam(), query: schemas.productReviewsQuery }),
  asyncHandler(async (req, res) => {
    const result = await service.listProductReviews(req.params.id, req.query);
    return paginated(res, result);
  })
);

router.get(
  "/product/:id/reviews/summary",
  validate({ params: idParam() }),
  asyncHandler(async (req, res) => {
    const data = await service.getProductReviewSummary(req.params.id);
    return ok(res, { data });
  })
);

/* -------------------------------- Moderation ------------------------------- */

router.get(
  "/reviews",
  authenticate,
  requireStaff,
  validate({ query: schemas.moderationQuery }),
  asyncHandler(async (req, res) => {
    const result = await service.listAllReviews(req.query);
    return paginated(res, result);
  })
);

router.patch(
  "/reviews/:productId/:reviewId",
  authenticate,
  requireStaff,
  validate({ params: schemas.reviewParams, body: schemas.moderateBody }),
  asyncHandler(async (req, res) => {
    const data = await service.moderateReview({
      productId: req.params.productId,
      reviewId: req.params.reviewId,
      isApproved: req.body.isApproved,
    });
    await audit.record({
      req,
      action: req.body.isApproved ? "review.approve" : "review.hide",
      entityType: "Product",
      entityId: req.params.productId,
      changes: { reviewId: req.params.reviewId },
    });
    return ok(res, { data, message: req.body.isApproved ? "Review approved" : "Review hidden" });
  })
);

router.delete(
  "/reviews/:productId/:reviewId",
  authenticate,
  requireStaff,
  validate({ params: schemas.reviewParams }),
  asyncHandler(async (req, res) => {
    const data = await service.removeReview({
      productId: req.params.productId,
      reviewId: req.params.reviewId,
    });
    await audit.record({
      req,
      action: "review.delete",
      entityType: "Product",
      entityId: req.params.productId,
      changes: { reviewId: req.params.reviewId },
    });
    return ok(res, { data, message: "Review deleted" });
  })
);

module.exports = router;
