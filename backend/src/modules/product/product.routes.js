const express = require("express");
const controller = require("./product.controller");
const schemas = require("./product.validation");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");

const router = express.Router();

/* ---------------------------------- Public --------------------------------- */

router.get("/products", validate({ query: schemas.listProductsQuery }), controller.listProducts);
router.get("/products/filters", controller.getFilterOptions);
router.get("/product/:id", validate({ params: schemas.productIdParam }), controller.getProduct);

/* --------------------------------- Reviews --------------------------------- */

router.post(
  "/product/:id/reviews",
  authenticate,
  validate({ params: schemas.productIdParam, body: schemas.reviewSchema }),
  controller.upsertReview
);
router.delete(
  "/product/:id/reviews",
  authenticate,
  validate({ params: schemas.productIdParam }),
  controller.deleteOwnReview
);

/* ------------------------------- Management -------------------------------- */

router.post(
  "/product",
  authenticate,
  requireStaff,
  validate({ body: schemas.productBodySchema }),
  controller.createProduct
);

router.patch(
  "/product/:id",
  authenticate,
  requireStaff,
  validate({ params: schemas.productIdParam, body: schemas.updateProductSchema }),
  controller.updateProduct
);

router.delete(
  "/product/:id",
  authenticate,
  requireStaff,
  validate({ params: schemas.productIdParam }),
  controller.deleteProduct
);

/**
 * Legacy shape kept for the existing admin UI, which sends the target id in
 * the body rather than the path. Normalised here so the controller only ever
 * sees the canonical form.
 */
router.put(
  "/product",
  authenticate,
  requireStaff,
  validate({ body: schemas.legacyUpdateProductSchema }),
  (req, res, next) => {
    const { _id, ...rest } = req.body;
    req.params.id = _id;
    req.body = rest;
    next();
  },
  controller.updateProduct
);

module.exports = router;
