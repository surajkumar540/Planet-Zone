const { Prisma } = require("@prisma/client");
const prisma = require("../../db/client");
const { num, toOrder, toUser } = require("../../db/mappers");
const productRepository = require("../product/product.repository");
const { REVENUE_STATUSES, ORDER_STATUS } = require("../../constants/orderStatus");
const { ROLES } = require("../../constants/roles");
const { ACTIVE_FILTER } = require("../../constants/inventory");

const { lowStockFilter } = productRepository;

/** Orders that count towards revenue. */
const revenueWhere = (from, to) => ({
  status: { in: [...REVENUE_STATUSES] },
  ...(from || to
    ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
    : {}),
});

/** The same rule as `revenueWhere`, for raw SQL over an aliased orders table `o`. */
const revenueSql = (start, end) =>
  Prisma.sql`o.status::text = ANY(${[...REVENUE_STATUSES]})
    AND o."createdAt" >= ${start} AND o."createdAt" <= ${end}`;

const DEFAULT_RANGE_DAYS = 30;

/**
 * Resolves an optional range into concrete dates.
 *
 * Every panel resolves the range through here so a dashboard request without
 * explicit dates reports the same window everywhere, rather than mixing a
 * 30-day summary with all-time top sellers.
 */
const resolveRange = ({ from, to } = {}) => {
  const end = to || new Date();
  const start = from || new Date(end.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000);
  return { start, end };
};

/** Percentage change from `previous` to `current`, guarding division by zero. */
const percentChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const sumRevenue = async (from, to) => {
  const result = await prisma.order.aggregate({
    where: revenueWhere(from, to),
    _sum: { grandTotal: true },
    _count: { _all: true },
  });
  return { revenue: num(result._sum.grandTotal) || 0, orders: result._count._all };
};

/**
 * Headline KPI tiles with period-over-period deltas.
 *
 * The comparison window is the equally sized period immediately before the
 * requested one, so "last 30 days" is compared against the 30 days before it.
 */
const getSummary = async (range) => {
  const { start, end } = resolveRange(range);
  const spanMs = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - spanMs);

  const [current, previous, customers, previousCustomers, productCount, lowStockCount] =
    await Promise.all([
      sumRevenue(start, end),
      sumRevenue(previousStart, start),
      prisma.user.count({
        where: { role: ROLES.CUSTOMER, createdAt: { gte: start, lte: end } },
      }),
      prisma.user.count({
        where: { role: ROLES.CUSTOMER, createdAt: { gte: previousStart, lt: start } },
      }),
      prisma.product.count({ where: ACTIVE_FILTER }),
      prisma.product.count({ where: { ...ACTIVE_FILTER, ...lowStockFilter() } }),
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

/** Bucket labels by interval. Timestamps are stored in UTC, so buckets are UTC days. */
const BUCKET_FORMATS = { day: "YYYY-MM-DD", week: "IYYY-IW", month: "YYYY-MM" };

/**
 * Revenue and order counts bucketed by day, week or month.
 *
 * Buckets with no orders are filled in with zeros so the chart draws a
 * continuous line rather than skipping empty days.
 */
const getSalesTrend = async ({ interval = "day", ...range } = {}) => {
  const { start, end } = resolveRange(range);
  const format = BUCKET_FORMATS[interval] || BUCKET_FORMATS.day;

  const rows = await prisma.$queryRaw`
    SELECT to_char(o."createdAt", ${format}) AS bucket,
           SUM(o."grandTotal")::float8 AS revenue,
           COUNT(*)::int AS orders
    FROM orders o
    WHERE ${revenueSql(start, end)}
    GROUP BY bucket
    ORDER BY bucket ASC`;

  if (interval !== "day") return rows;

  const byBucket = new Map(rows.map((row) => [row.bucket, row]));
  const series = [];
  // UTC throughout, matching the buckets; local midnight would drop today's
  // orders on any server east of Greenwich.
  const cursor = new Date(start);
  cursor.setUTCHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    series.push(byBucket.get(key) || { bucket: key, revenue: 0, orders: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return series;
};

/** Order counts per lifecycle status, for the distribution donut. */
const getStatusDistribution = async (range) => {
  const { start, end } = resolveRange(range);
  const rows = await prisma.order.groupBy({
    by: ["status"],
    where: { createdAt: { gte: start, lte: end } },
    _count: { _all: true },
  });

  const counts = Object.fromEntries(rows.map((row) => [row.status, row._count._all]));
  // Every status is present so the legend does not reshuffle between reloads.
  return Object.values(ORDER_STATUS).map((status) => ({
    status,
    count: counts[status] || 0,
  }));
};

/** Best sellers by units sold, with the revenue each generated. */
const getTopProducts = async ({ limit = 5, ...range } = {}) => {
  const { start, end } = resolveRange(range);
  return prisma.$queryRaw`
    SELECT i."productId"::text AS "productId",
           MIN(i.name) AS name,
           MIN(i.image) AS image,
           MIN(i.category) AS category,
           SUM(i.qty)::int AS "unitsSold",
           SUM(i."lineTotal")::float8 AS revenue
    FROM order_items i
    JOIN orders o ON o.id = i."orderId"
    WHERE ${revenueSql(start, end)}
    GROUP BY i."productId"
    ORDER BY "unitsSold" DESC
    LIMIT ${limit}::int`;
};

/** Revenue split by product category, for the category breakdown chart. */
const getRevenueByCategory = async ({ limit = 8, ...range } = {}) => {
  const { start, end } = resolveRange(range);
  return prisma.$queryRaw`
    SELECT i.category AS category,
           SUM(i."lineTotal")::float8 AS revenue,
           SUM(i.qty)::int AS "unitsSold"
    FROM order_items i
    JOIN orders o ON o.id = i."orderId"
    WHERE ${revenueSql(start, end)}
    GROUP BY i.category
    ORDER BY revenue DESC
    LIMIT ${limit}::int`;
};

const getRecentOrders = async ({ limit = 5 }) => {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      items: { orderBy: { position: "asc" } },
      user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
    },
  });
  return rows.map(toOrder);
};

const getRecentCustomers = async ({ limit = 5 }) => {
  const rows = await prisma.user.findMany({
    where: { role: ROLES.CUSTOMER },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      createdAt: true,
      role: true,
    },
  });
  return rows.map((row) => toUser(row));
};

const getLowStockProducts = ({ limit = 5 }) => productRepository.findLowStock(limit);

/**
 * Single round trip powering the overview screen, so the dashboard renders
 * from one request instead of eight.
 */
const getDashboard = async (query = {}) => {
  // Resolved once so every panel below reports the identical window.
  const { start: from, end: to } = resolveRange(query);
  const interval = query.interval;

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
