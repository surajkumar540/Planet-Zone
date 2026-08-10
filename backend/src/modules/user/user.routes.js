const express = require("express");
const controller = require("./user.controller");
const schemas = require("./user.validation");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff, requireAdmin } = require("../../middlewares/rbac");

const router = express.Router();

/**
 * Authentication is attached per route rather than with a router-level
 * `use`, because these routers are mounted without a path prefix — a
 * router-level guard would then run for every request in the application,
 * including other modules' public endpoints.
 */

// Self-service profile.
router.get("/profile", authenticate, controller.getProfile);
router.post(
  "/profile",
  authenticate,
  validate({ body: schemas.updateProfileSchema }),
  controller.updateProfile
);
router.patch(
  "/profile",
  authenticate,
  validate({ body: schemas.updateProfileSchema }),
  controller.updateProfile
);

// Customer management.
router.get(
  "/users",
  authenticate,
  requireStaff,
  validate({ query: schemas.listUsersQuery }),
  controller.listUsers
);
router.get(
  "/users/:id",
  authenticate,
  requireStaff,
  validate({ params: schemas.userIdParam }),
  controller.getUserById
);
router.patch(
  "/users/:id",
  authenticate,
  requireAdmin,
  validate({ params: schemas.userIdParam, body: schemas.updateUserSchema }),
  controller.updateUser
);

module.exports = router;
