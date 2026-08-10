const express = require("express");

const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/user/user.routes");
const productRoutes = require("../modules/product/product.routes");
const orderRoutes = require("../modules/order/order.routes");
const addressRoutes = require("../modules/address/address.module");
const contactRoutes = require("../modules/contact/contact.module");
const analyticsRoutes = require("../modules/analytics/analytics.routes");

const router = express.Router();

/**
 * Single registry of API modules.
 *
 * Every module owns its own routes, validation and auth requirements; nothing
 * here applies cross-cutting authentication, so a module can never be made
 * accidentally public by a change to this file.
 */
router.use(authRoutes);
router.use(userRoutes);
router.use(productRoutes);
router.use(orderRoutes);
router.use(addressRoutes);
router.use(contactRoutes);
router.use(analyticsRoutes);

module.exports = router;
