const { z } = require("zod");
const express = require("express");
const prisma = require("../../db/client");
const { toProduct } = require("../../db/mappers");
const AppError = require("../../core/AppError");
const asyncHandler = require("../../core/asyncHandler");
const { ok } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { uuid, idParam } = require("../../utils/schemas");

/* -------------------------------- Validation ------------------------------- */

const addBody = z.object({ productId: uuid });

/** The fields a wishlist card renders. Selecting explicitly keeps the payload small. */
const CARD_FIELDS = {
  id: true,
  name: true,
  slug: true,
  image: true,
  price: true,
  totalPrice: true,
  discount: true,
  countInStock: true,
  hasVariants: true,
  rating: true,
  numReviews: true,
  brand: true,
  category: true,
  isActive: true,
};

/* --------------------------------- Service --------------------------------- */

const listWishlist = async (userId) => {
  const user = await prisma.user.count({ where: { id: userId } });
  if (!user) throw AppError.notFound("User not found");

  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { product: { select: CARD_FIELDS } },
  });
  return rows.map((row) => toProduct(row.product));
};

const addToWishlist = async (userId, productId) => {
  const exists = await prisma.product.count({ where: { id: productId, isActive: true } });
  if (!exists) throw AppError.notFound("Product not found");

  // skipDuplicates makes a repeated add idempotent.
  await prisma.wishlistItem.createMany({ data: [{ userId, productId }], skipDuplicates: true });
  return listWishlist(userId);
};

const removeFromWishlist = async (userId, productId) => {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
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
    await prisma.wishlistItem.deleteMany({ where: { userId: req.auth.userId } });
    return ok(res, { data: [], message: "Wishlist cleared" });
  })
);

module.exports = router;
