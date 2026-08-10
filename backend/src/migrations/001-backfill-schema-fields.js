/**
 * Backfills fields introduced after the initial schema.
 *
 * Documents written before these fields existed would otherwise be excluded by
 * the new queries — an existing administrator would hydrate with the default
 * `customer` role, and existing products would fall outside the `isActive`
 * filter.
 *
 * Safe to run repeatedly: every step only touches documents still missing the
 * field.
 *
 *   npm run db:migrate
 */
const logger = require("../core/logger");
const { connectDatabase, disconnectDatabase } = require("../config/database");
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const Order = require("../models/OrderModel");
const { ROLES } = require("../constants/roles");
const { DEFAULT_LOW_STOCK_THRESHOLD } = require("../constants/inventory");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../constants/orderStatus");

const backfillUsers = async () => {
  const admins = await User.updateMany(
    { isAdmin: true, role: { $ne: ROLES.ADMIN } },
    { $set: { role: ROLES.ADMIN } }
  );
  const customers = await User.updateMany(
    { $or: [{ role: { $exists: false } }, { role: null }] },
    { $set: { role: ROLES.CUSTOMER } }
  );
  const active = await User.updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } }
  );
  // Addresses are their own collection now; drop the stray field if present.
  await User.updateMany({ address: { $exists: true } }, { $unset: { address: "" } });

  logger.info(
    `Users: ${admins.modifiedCount} promoted, ${customers.modifiedCount} defaulted, ${active.modifiedCount} activated`
  );
};

const backfillProducts = async () => {
  const active = await Product.updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } }
  );
  const thresholds = await Product.updateMany(
    { lowStockThreshold: { $exists: false } },
    { $set: { lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD } }
  );
  const ratings = await Product.updateMany(
    { rating: { $exists: false } },
    { $set: { rating: 0 } }
  );
  const reviewCounts = await Product.updateMany(
    { numReviews: { $exists: false } },
    { $set: { numReviews: 0 } }
  );

  // Older rows predate the derived money fields; recompute from their inputs.
  const legacyPricing = await Product.find({
    $or: [{ totalPrice: { $exists: false } }, { discount: { $exists: false } }],
  });
  for (const product of legacyPricing) {
    product.discount = product.discount || 0;
    product.gst = product.gst || 0;
    // Force the pre-validate hook to recompute `totalPrice`.
    product.markModified("price");
    await product.save();
  }

  logger.info(
    `Products: ${active.modifiedCount} activated, ${thresholds.modifiedCount} thresholds, ` +
      `${ratings.modifiedCount} ratings, ${reviewCounts.modifiedCount} review counts, ` +
      `${legacyPricing.length} repriced`
  );
};

const backfillOrders = async () => {
  const status = await Order.updateMany(
    { status: { $exists: false } },
    { $set: { status: ORDER_STATUS.CONFIRMED } }
  );

  /*
   * Historic orders carry no server-side pricing, and their line items stored
   * the product reference under `_id`. The current subdocument schema declares
   * `_id: false`, so hydrating through the model would discard exactly the
   * value this step needs — these documents are read and written raw.
   */
  const collection = Order.collection;
  const legacy = await collection
    .find({ "pricing.grandTotal": { $exists: false } })
    .toArray();

  for (const order of legacy) {
    const items = (order.orderItems || []).map((item) => {
      const qty = item.qty || 1;
      return {
        ...item,
        product: item.product || item._id,
        lineTotal: item.lineTotal ?? (item.totalPrice || 0) * qty,
      };
    });

    const grandTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    await collection.updateOne(
      { _id: order._id },
      {
        $set: {
          orderItems: items,
          pricing: {
            itemsTotal: Math.round(grandTotal * 100) / 100,
            discountTotal: 0,
            taxTotal: 0,
            shippingTotal: 0,
            grandTotal: Math.round(grandTotal * 100) / 100,
            currency: "INR",
          },
          paymentStatus: order.onlinePayment ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
          orderNumber: order.orderNumber || `ORD-${String(order._id).slice(-8).toUpperCase()}`,
        },
      }
    );
  }

  logger.info(`Orders: ${status.modifiedCount} statuses set, ${legacy.length} repriced`);
};

const run = async () => {
  await connectDatabase();
  try {
    await backfillUsers();
    await backfillProducts();
    await backfillOrders();
    logger.info("Migration complete");
    process.exitCode = 0;
  } catch (error) {
    logger.error(`Migration failed: ${error.message}`, { stack: error.stack });
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
};

run();
