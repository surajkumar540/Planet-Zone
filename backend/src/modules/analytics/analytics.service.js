const Order = require("../../models/OrderModel");
const Product = require("../../models/ProductModel");
const User = require("../../models/UserModel");
const productRepository = require("../product/product.repository");
const { REVENUE_STATUSES, ORDER_STATUS } = require("../../constants/orderStatus");
const { ROLES } = require("../../constants/roles");
const { LOW_STOCK_EXPR, ACTIVE_FILTER } = require("../../constants/inventory");

/** Orders that count towards revenue. */
const revenueMatch = (from, to) => ({
  status: { $in: REVENUE_STATUSES },
  ...(from || to
    ? { createdAt: { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) } }
    : {}),
});

/** Percentage change from `previous` to `current`, guarding division by zero. */
const percentChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const sumRevenue = async (from, to) => {
  const [result] = await Order.aggregate([
    { $match: revenueMatch(from, to) },
    { $group: { _id: null, revenue: { $sum: "$pricing.grandTotal" }, orders: { $sum: 1 } } },
  ]);
  return { revenue: result?.revenue || 0, orders: result?.orders || 0 };
};

/**
 * Headline KPI tiles with period-over-period deltas.
 *
 * The comparison window is the equally sized period immediately before the
 * requested one, so "last 30 days" is compared against the 30 days before it.
 */
const getSummary = async ({ from, to }) => {
  const end = to || new Date();
  const start = from || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const spanMs = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - spanMs);

  const [current, previous, customers, previousCustomers, productCount, lowStockCount] =
    await Promise.all([
      sumRevenue(start, end),
      sumRevenue(previousStart, start),
      User.countDocuments({ role: ROLES.CUSTOMER, createdAt: { $gte: start, $lte: end } }),
      User.countDocuments({
        role: ROLES.CUSTOMER,
        createdAt: { $gte: previousStart, $lt: start },
      }),
      Product.countDocuments(ACTIVE_FILTER),
      Product.countDocuments({ ...ACTIVE_FILTER, $expr: LOW_STOCK_EXPR }),
    ]);

  return {
    period: { from: start, to: end },
    revenue: {
      value: current.revenue,
      change: percentChange(current.revenue, previous.revenue),
    },
    orders: {
      value: current.orders,
      change: percentChange(current.orders, previous.orders),
    },
    customers: {
      value: customers,
      change: percentChange(customers, previousCustomers),
    },
    averageOrderValue: {
      value: current.orders ? Math.round((current.revenue / current.orders) * 100) / 100 : 0,
      change: percentChange(
        current.orders ? current.revenue / current.orders : 0,
        previous.orders ? previous.revenue / previous.orders : 0
      ),
    },
    products: { value: productCount },
    lowStock: { value: lowStockCount },
  };
};

/**
 * Revenue and order counts bucketed by day, week or month.
 *
 * Buckets with no orders are filled in with zeros so the chart draws a
 * continuous line rather than skipping empty days.
 */
const getSalesTrend = async ({ from, to, interval = "day" }) => {
  const end = to || new Date();
  const start = from || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const formats = { day: "%Y-%m-%d", week: "%Y-%V", month: "%Y-%m" };
  const format = formats[interval] || formats.day;

  const rows = await Order.aggregate([
    { $match: revenueMatch(start, end) },
    {
      $group: {
        _id: { $dateToString: { format, date: "$createdAt" } },
        revenue: { $sum: "$pricing.grandTotal" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, bucket: "$_id", revenue: 1, orders: 1 } },
  ]);

  if (interval !== "day") return rows;

  const byBucket = new Map(rows.map((row) => [row.bucket, row]));
  const series = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    series.push(byBucket.get(key) || { bucket: key, revenue: 0, orders: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
};

/** Order counts per lifecycle status, for the distribution donut. */
const getStatusDistribution = async ({ from, to }) => {
  const rows = await Order.aggregate([
    {
      $match:
        from || to
          ? { createdAt: { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) } }
          : {},
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const counts = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  // Every status is present so the legend does not reshuffle between reloads.
  return Object.values(ORDER_STATUS).map((status) => ({
    status,
    count: counts[status] || 0,
  }));
};

/** Best sellers by units sold, with the revenue each generated. */
const getTopProducts = async ({ from, to, limit = 5 }) =>
  Order.aggregate([
    { $match: revenueMatch(from, to) },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        name: { $first: "$orderItems.name" },
        image: { $first: "$orderItems.image" },
        category: { $first: "$orderItems.category" },
        unitsSold: { $sum: "$orderItems.qty" },
        revenue: { $sum: "$orderItems.lineTotal" },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: limit },
    { $project: { _id: 0, productId: "$_id", name: 1, image: 1, category: 1, unitsSold: 1, revenue: 1 } },
  ]);

/** Revenue split by product category, for the category breakdown chart. */
const getRevenueByCategory = async ({ from, to, limit = 8 }) =>
  Order.aggregate([
    { $match: revenueMatch(from, to) },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.category",
        revenue: { $sum: "$orderItems.lineTotal" },
        unitsSold: { $sum: "$orderItems.qty" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    { $project: { _id: 0, category: "$_id", revenue: 1, unitsSold: 1 } },
  ]);

const getRecentOrders = ({ limit = 5 }) =>
  Order.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("orderNumber status paymentStatus pricing.grandTotal createdAt orderItems")
    .populate("User", "firstName lastName email avatar")
    .lean();

const getRecentCustomers = ({ limit = 5 }) =>
  User.find({ role: ROLES.CUSTOMER })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("firstName lastName email avatar createdAt")
    .lean();

const getLowStockProducts = ({ limit = 5 }) => productRepository.findLowStock(limit);

/**
 * Single round trip powering the overview screen, so the dashboard renders
 * from one request instead of eight.
 */
const getDashboard = async ({ from, to, interval }) => {
  const [
    summary,
    salesTrend,
    statusDistribution,
    topProducts,
    revenueByCategory,
    recentOrders,
    recentCustomers,
    lowStockProducts,
  ] = await Promise.all([
    getSummary({ from, to }),
    getSalesTrend({ from, to, interval }),
    getStatusDistribution({ from, to }),
    getTopProducts({ from, to }),
    getRevenueByCategory({ from, to }),
    getRecentOrders({ limit: 6 }),
    getRecentCustomers({ limit: 5 }),
    getLowStockProducts({ limit: 5 }),
  ]);

  return {
    summary,
    salesTrend,
    statusDistribution,
    topProducts,
    revenueByCategory,
    recentOrders,
    recentCustomers,
    lowStockProducts,
  };
};

module.exports = {
  getSummary,
  getSalesTrend,
  getStatusDistribution,
  getTopProducts,
  getRevenueByCategory,
  getRecentOrders,
  getRecentCustomers,
  getLowStockProducts,
  getDashboard,
};
