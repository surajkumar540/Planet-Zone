const express = require("express");
const controller = require("./order.controller");
const schemas = require("./order.validation");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");

const router = express.Router();

/**
 * Every route here is authenticated, but the guard is attached per route
 * rather than with `router.use`: these routers are mounted without a path
 * prefix, so a router-level guard would also protect other modules' public
 * endpoints.
 */

/* --------------------------------- Payments -------------------------------- */

router.post(
  "/paymentInit",
  authenticate,
  validate({ body: schemas.paymentInitSchema }),
  controller.initPayment
);
router.post(
  "/paymentSuccess",
  authenticate,
  validate({ body: schemas.paymentSuccessSchema }),
  controller.confirmPayment
);

/* --------------------------------- Customer -------------------------------- */

router.post(
  "/createOrder",
  authenticate,
  validate({ body: schemas.createOrderSchema }),
  controller.createOrder
);
router.get(
  "/orders",
  authenticate,
  validate({ query: schemas.listOrdersQuery }),
  controller.listMyOrders
);
router.get(
  "/order/:id",
  authenticate,
  validate({ params: schemas.orderIdParam }),
  controller.getOrder
);
router.post(
  "/order/:id/cancel",
  authenticate,
  validate({ params: schemas.orderIdParam, body: schemas.cancelOrderSchema }),
  controller.cancelOrder
);

/* -------------------------------- Management ------------------------------- */

router.get(
  "/admin/orders",
  authenticate,
  requireStaff,
  validate({ query: schemas.listOrdersQuery }),
  controller.listAllOrders
);
router.patch(
  "/order/:id/status",
  authenticate,
  requireStaff,
  validate({ params: schemas.orderIdParam, body: schemas.updateStatusSchema }),
  controller.updateStatus
);

module.exports = router;
