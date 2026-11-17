const express = require("express");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const service = require("./design.service");
const { createDesignSchema, previewParams, designIdParam } = require("./design.validation");

/**
 * Custom T-shirt studio.
 *
 *   GET    /designs/config               colours, sizes, prices, print area (public)
 *   POST   /designs                      save a design (body up to 8 MB, see app.js)
 *   GET    /designs/mine                 the shopper's saved designs
 *   GET    /designs/:id                  full design: owner, or staff printing it
 *   DELETE /designs/:id                  remove a saved design that was never ordered
 *   GET    /designs/:id/preview/:side    mockup image (public, cached)
 */
const router = express.Router();

router.get(
  "/designs/config",
  asyncHandler(async (req, res) => ok(res, { data: await service.getConfig() }))
);

router.post(
  "/designs",
  authenticate,
  validate({ body: createDesignSchema }),
  asyncHandler(async (req, res) =>
    created(res, { data: await service.createDesign(req.auth.userId, req.body), message: "Design saved" })
  )
);

router.get(
  "/designs/mine",
  authenticate,
  asyncHandler(async (req, res) => ok(res, { data: await service.listMine(req.auth.userId) }))
);

router.get(
  "/designs/:id/preview/:side",
  validate({ params: previewParams }),
  asyncHandler(async (req, res) => {
    const { type, body } = await service.getPreview(req.params.id, req.params.side);
    res.set({ "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" });
    res.send(body);
  })
);

router.get(
  "/designs/:id",
  authenticate,
  validate({ params: designIdParam }),
  asyncHandler(async (req, res) => ok(res, { data: await service.getDesign(req.params.id, req.auth) }))
);

router.delete(
  "/designs/:id",
  authenticate,
  validate({ params: designIdParam }),
  asyncHandler(async (req, res) => {
    await service.deleteDesign(req.params.id, req.auth.userId);
    return ok(res, { message: "Design deleted" });
  })
);

module.exports = router;
