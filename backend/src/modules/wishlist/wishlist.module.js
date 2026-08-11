const { z } = require("zod");
const express = require("express");
const User = require("../../models/UserModel");
const AppError = require("../../core/AppError");
const asyncHandler = require("../../core/asyncHandler");
const { ok } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const Product = require("../../models/ProductModel");
const { objectId, idParam } = require("../../utils/schemas");

/* -------------------------------- Validation ------------------------------- */

const addBody = z.object({ productId: objectId });

/**
 * The fields a wishlist card renders. Selecting explicitly keeps the payload
 * small and, more importantly, stops embedded `reviews` arrays from riding
 * along on every request.
 */
const CARD_FIELDS = "name slug image price totalPrice discount countInStock hasVariants rating numReviews brand category isActive";

/* --------------------------------- Service --------------------------------- */

const listWishlist = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "wishlist",
    select: CARD_FIELDS,
  });
  if (!user) throw AppError.notFound("User not found");

  // A product deleted after being saved populates as null; drop those rather
  // than handing the client holes to defend against.
  return (user.wishlist || []).filter(Boolean);
};

const addToWishlist = async (userId, productId) => {
  const exists = await Product.exists({ _id: productId, isActive: { $ne: false } });
  if (!exists) throw AppError.notFound("Product not found");

  // `$addToSet` makes a repeated add idempotent instead of duplicating.
  await User.updateOne({ _id: userId }, { $addToSet: { wishlist: productId } });
  return listWishlist(userId);
};

const removeFromWishlist = async (userId, productId) => {
  await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } });
  return listWishlist(userId);
};

/* -------------------------------- Controllers ------------------------------ */

const router = express.Router();

router.get(
  "/wishlist",
  authenticate,
  asyncHandler(async (req, res) => ok(res, { data: await listWishlist(req.auth.userId) }))
);

router.post(
  "/wishlist",
  authenticate,
  validate({ body: addBody }),
  asyncHandler(async (req, res) =>
    ok(res, {
      data: await addToWishlist(req.auth.userId, req.body.productId),
      message: "Added to wishlist",
    })
  )
);

router.delete(
  "/wishlist/:id",
  authenticate,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) =>
    ok(res, {
      data: await removeFromWishlist(req.auth.userId, req.params.id),
      message: "Removed from wishlist",
    })
  )
);

router.delete(
  "/wishlist",
  authenticate,
  asyncHandler(async (req, res) => {
    await User.updateOne({ _id: req.auth.userId }, { $set: { wishlist: [] } });
    return ok(res, { data: [], message: "Wishlist cleared" });
  })
);

module.exports = router;
