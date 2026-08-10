const express = require("express");
const { z } = require("zod");
const asyncHandler = require("../../core/asyncHandler");
const { ok } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");
const analyticsService = require("./analytics.service");
const cache = require("../../core/cache");

const rangeQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  interval: z.enum(["day", "week", "month"]).default("day"),
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

const router = express.Router();

/**
 * Guards are attached per route: this router is mounted without a path
 * prefix, so a router-level `use` would protect the whole application.
 */
const staffOnly = [authenticate, requireStaff];

/**
 * Aggregations scan the orders collection, so identical requests within a
 * short window are served from memory. The window is short enough that the
 * dashboard still feels live.
 */
const CACHE_TTL_MS = 60 * 1000;

const cached = (key, handler) =>
  asyncHandler(async (req, res) => {
    const cacheKey = `${key}:${JSON.stringify(req.query)}`;
    const data = await cache.remember(cacheKey, CACHE_TTL_MS, () => handler(req));
    return ok(res, { data });
  });

router.get(
  "/analytics/dashboard",
  staffOnly,
  validate({ query: rangeQuery }),
  cached("dashboard", (req) => analyticsService.getDashboard(req.query))
);

router.get(
  "/analytics/summary",
  staffOnly,
  validate({ query: rangeQuery }),
  cached("summary", (req) => analyticsService.getSummary(req.query))
);

router.get(
  "/analytics/sales-trend",
  staffOnly,
  validate({ query: rangeQuery }),
  cached("sales-trend", (req) => analyticsService.getSalesTrend(req.query))
);

router.get(
  "/analytics/status-distribution",
  staffOnly,
  validate({ query: rangeQuery }),
  cached("status-distribution", (req) => analyticsService.getStatusDistribution(req.query))
);

router.get(
  "/analytics/top-products",
  staffOnly,
  validate({ query: rangeQuery }),
  cached("top-products", (req) => analyticsService.getTopProducts(req.query))
);

router.get(
  "/analytics/revenue-by-category",
  staffOnly,
  validate({ query: rangeQuery }),
  cached("revenue-by-category", (req) => analyticsService.getRevenueByCategory(req.query))
);

router.get(
  "/analytics/low-stock",
  staffOnly,
  validate({ query: rangeQuery }),
  asyncHandler(async (req, res) =>
    ok(res, { data: await analyticsService.getLowStockProducts(req.query) })
  )
);

module.exports = router;
