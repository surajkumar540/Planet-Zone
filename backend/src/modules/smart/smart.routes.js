const express = require("express");
const { z } = require("zod");

const asyncHandler = require("../../core/asyncHandler");
const { ok } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { optionalAuthenticate } = require("../../middlewares/auth");
const { uuid } = require("../../utils/schemas");
const service = require("./smart.service");

/**
 * Smart shopping endpoints. All public, all read-only, all computed locally
 * from the store's own data. Personal results use the signed-in user's
 * wishlist and orders when a token is present; recently viewed ids come from
 * the browser on each request and are never stored.
 */
const router = express.Router();

/** Comma-separated product ids, capped and validated. */
const idList = (max) =>
  z
    .string()
    .optional()
    .transform((value) => (value ? value.split(",").map((part) => part.trim()).filter(Boolean) : []))
    .pipe(z.array(uuid).max(max));

const productParam = z.object({ id: uuid });
const limitQuery = z.object({ limit: z.coerce.number().int().min(1).max(12).optional() });

router.get(
  "/smart/assistant",
  validate({ query: z.object({ q: z.string().trim().max(200).default("") }) }),
  asyncHandler(async (req, res) => ok(res, { data: await service.assistant(req.query.q) }))
);

router.get(
  "/smart/products",
  validate({ query: z.object({ ids: idList(24) }) }),
  asyncHandler(async (req, res) => ok(res, { data: await service.getProductsByIds(req.query.ids) }))
);

router.get(
  "/smart/similar/:id",
  validate({ params: productParam, query: limitQuery }),
  asyncHandler(async (req, res) => ok(res, { data: await service.similar(req.params.id, req.query.limit) }))
);

router.get(
  "/smart/alternatives/:id",
  validate({ params: productParam, query: limitQuery }),
  asyncHandler(async (req, res) => ok(res, { data: await service.alternatives(req.params.id, req.query.limit) }))
);

router.get(
  "/smart/bought-together/:id",
  validate({ params: productParam, query: limitQuery }),
  asyncHandler(async (req, res) => ok(res, { data: await service.boughtTogether(req.params.id, req.query.limit) }))
);

router.get(
  "/smart/for-you",
  optionalAuthenticate,
  validate({ query: limitQuery.extend({ seen: idList(20) }) }),
  asyncHandler(async (req, res) =>
    ok(res, { data: await service.forYou({ userId: req.userId, seen: req.query.seen, limit: req.query.limit }) })
  )
);

module.exports = router;
