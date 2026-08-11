const express = require("express");

const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/user/user.routes");
const productRoutes = require("../modules/product/product.routes");
const categoryRoutes = require("../modules/category/category.routes");
const attributeRoutes = require("../modules/attribute/attribute.routes");
const inventoryRoutes = require("../modules/inventory/inventory.routes");
const orderRoutes = require("../modules/order/order.routes");
const couponRoutes = require("../modules/coupon/coupon.routes");
const refundRoutes = require("../modules/refund/refund.routes");
const reviewRoutes = require("../modules/review/review.routes");
const wishlistRoutes = require("../modules/wishlist/wishlist.module");
const addressRoutes = require("../modules/address/address.module");
const contactRoutes = require("../modules/contact/contact.module");
const settingsRoutes = require("../modules/settings/settings.routes");
const analyticsRoutes = require("../modules/analytics/analytics.routes");

const router = express.Router();

/**
 * Single registry of API modules.
 *
 * Every module owns its own routes, validation and auth requirements. Nothing
 * here applies cross-cutting authentication — module routers are mounted
 * without a path prefix, so a router-level guard would leak across modules.
 */
router.use(authRoutes);
router.use(userRoutes);
router.use(categoryRoutes);
router.use(attributeRoutes);
router.use(productRoutes);
router.use(inventoryRoutes);
router.use(reviewRoutes);
router.use(wishlistRoutes);
router.use(orderRoutes);
router.use(couponRoutes);
router.use(refundRoutes);
router.use(addressRoutes);
router.use(contactRoutes);
router.use(settingsRoutes);
router.use(analyticsRoutes);

module.exports = router;
