const express = require("express");
const { z } = require("zod");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created, paginated } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");
const audit = require("../../services/audit.service");
const service = require("./refund.service");
const { listQuery, idParam, objectId } = require("../../utils/schemas");
const { REFUND_STATUS_VALUES } = require("../../constants/refund");
const { hasAtLeastRole, ROLES } = require("../../constants/roles");

const requestSchema = z.object({
  orderId: objectId,
  amount: z.coerce.number().min(0).optional(),
  reason: z.string().trim().min(1, "Reason is required").max(500),
  customerNote: z.string().trim().max(1000).optional(),
  items: z
    .array(
      z.object({
        product: objectId,
        variantSku: z.string().trim().optional().default(""),
        name: z.string().trim().optional().default(""),
        qty: z.coerce.number().int().min(1),
        amount: z.coerce.number().min(0).optional().default(0),
      })
    )
    .optional()
    .default([]),
});

const reviewSchema = z.object({
  approve: z.coerce.boolean(),
  staffNote: z.string().trim().max(1000).optional(),
});

const processSchema = z.object({
  gatewayRefundId: z.string().trim().max(120).optional(),
});

const listRefundsQuery = listQuery.extend({
  status: z.enum(REFUND_STATUS_VALUES).optional(),
});

const requesterFrom = (req) => ({
  userId: req.auth.userId,
  isStaff: hasAtLeastRole(req.auth.role, ROLES.STAFF),
});

const router = express.Router();
const staffOnly = [authenticate, requireStaff];

router.post(
  "/refunds",
  authenticate,
  validate({ body: requestSchema }),
  asyncHandler(async (req, res) => {
    const data = await service.request({ ...req.body, requester: requesterFrom(req) });
    return created(res, { data, message: "Refund requested" });
  })
);

router.get(
  "/refunds",
  authenticate,
  validate({ query: listRefundsQuery }),
  asyncHandler(async (req, res) =>
    paginated(res, await service.list({ ...req.query, ...requesterFrom(req) }))
  )
);

router.get(
  "/refunds/:id",
  authenticate,
  validate({ params: idParam("id") }),
  asyncHandler(async (req, res) =>
    ok(res, {
      data: await service.getById({ refundId: req.params.id, requester: requesterFrom(req) }),
    })
  )
);

router.patch(
  "/refunds/:id/review",
  staffOnly,
  validate({ params: idParam("id"), body: reviewSchema }),
  asyncHandler(async (req, res) => {
    const data = await service.review({
      refundId: req.params.id,
      actorId: req.auth.userId,
      ...req.body,
    });
    await audit.record({
      req,
      action: "refund.review",
      entityType: "Refund",
      entityId: req.params.id,
      changes: { approve: req.body.approve },
    });
    return ok(res, { data, message: `Refund ${data.status}` });
  })
);

router.post(
  "/refunds/:id/process",
  staffOnly,
  validate({ params: idParam("id"), body: processSchema }),
  asyncHandler(async (req, res) => {
    const data = await service.process({
      refundId: req.params.id,
      actorId: req.auth.userId,
      ...req.body,
    });
    await audit.record({
      req,
      action: "refund.process",
      entityType: "Refund",
      entityId: req.params.id,
    });
    return ok(res, { data, message: "Refund completed" });
  })
);

module.exports = router;
