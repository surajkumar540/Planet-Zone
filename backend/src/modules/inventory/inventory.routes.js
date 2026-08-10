const express = require("express");
const { z } = require("zod");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created, paginated } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");
const audit = require("../../services/audit.service");
const service = require("./inventory.service");
const Warehouse = require("../../models/WarehouseModel");
const AppError = require("../../core/AppError");
const { listQuery, idParam, objectId } = require("../../utils/schemas");
const { MOVEMENT_REASON_VALUES } = require("../../constants/inventory");

/* -------------------------------- Validation ------------------------------- */

const listInventoryQuery = listQuery.extend({
  warehouse: objectId.optional(),
  lowStock: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

const movementsQuery = listQuery.extend({
  product: objectId.optional(),
  warehouse: objectId.optional(),
  reason: z.enum(MOVEMENT_REASON_VALUES).optional(),
});

const adjustSchema = z.object({
  product: objectId,
  variantSku: z.string().trim().optional().default(""),
  warehouse: objectId.optional(),
  // Signed: negative removes stock, positive adds it.
  quantity: z.coerce.number().int().refine((value) => value !== 0, "Quantity cannot be zero"),
  reason: z.enum(MOVEMENT_REASON_VALUES).optional(),
  note: z.string().trim().max(500).optional(),
});

const setStockSchema = z.object({
  product: objectId,
  variantSku: z.string().trim().optional().default(""),
  warehouse: objectId.optional(),
  onHand: z.coerce.number().int().min(0),
  note: z.string().trim().max(500).optional(),
});

const warehouseBody = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  code: z.string().trim().min(1, "Code is required").max(20),
  address: z
    .object({
      line1: z.string().trim().max(200).optional().default(""),
      line2: z.string().trim().max(200).optional().default(""),
      city: z.string().trim().max(120).optional().default(""),
      state: z.string().trim().max(120).optional().default(""),
      pinCode: z.string().trim().max(20).optional().default(""),
      country: z.string().trim().max(120).optional().default("India"),
    })
    .optional(),
  contactName: z.string().trim().max(120).optional().default(""),
  contactPhone: z.string().trim().max(30).optional().default(""),
  isDefault: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
  fulfilsOnlineOrders: z.coerce.boolean().optional().default(true),
});

const router = express.Router();
const staffOnly = [authenticate, requireStaff];

/* -------------------------------- Warehouses ------------------------------- */

router.get(
  "/warehouses",
  staffOnly,
  asyncHandler(async (req, res) =>
    ok(res, { data: await Warehouse.find({}).sort({ isDefault: -1, name: 1 }).lean() })
  )
);

router.post(
  "/warehouses",
  staffOnly,
  validate({ body: warehouseBody }),
  asyncHandler(async (req, res) => {
    const warehouse = await Warehouse.create(req.body);
    // Only one location can be the default.
    if (warehouse.isDefault) {
      await Warehouse.updateMany(
        { _id: { $ne: warehouse._id } },
        { $set: { isDefault: false } }
      );
    }
    await audit.record({
      req,
      action: "warehouse.create",
      entityType: "Warehouse",
      entityId: warehouse._id,
    });
    return created(res, { data: warehouse.toObject(), message: "Warehouse created" });
  })
);

router.patch(
  "/warehouses/:id",
  staffOnly,
  validate({ params: idParam("id"), body: warehouseBody.partial() }),
  asyncHandler(async (req, res) => {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!warehouse) throw AppError.notFound("Warehouse not found");

    if (req.body.isDefault) {
      await Warehouse.updateMany({ _id: { $ne: warehouse._id } }, { $set: { isDefault: false } });
    }
    return ok(res, { data: warehouse, message: "Warehouse updated" });
  })
);

/* --------------------------------- Stock ----------------------------------- */

router.get(
  "/inventory",
  staffOnly,
  validate({ query: listInventoryQuery }),
  asyncHandler(async (req, res) => paginated(res, await service.list(req.query)))
);

router.get(
  "/inventory/movements",
  staffOnly,
  validate({ query: movementsQuery }),
  asyncHandler(async (req, res) => paginated(res, await service.movements(req.query)))
);

/** Applies a relative change, e.g. receiving a delivery or writing off damage. */
router.post(
  "/inventory/adjust",
  staffOnly,
  validate({ body: adjustSchema }),
  asyncHandler(async (req, res) => {
    const data = await service.adjustStock({
      productId: req.body.product,
      variantSku: req.body.variantSku,
      warehouseId: req.body.warehouse,
      quantity: req.body.quantity,
      reason: req.body.reason,
      note: req.body.note,
      performedBy: req.auth.userId,
    });
    await audit.record({
      req,
      action: "inventory.adjust",
      entityType: "Inventory",
      entityId: data._id,
      changes: { quantity: req.body.quantity, reason: req.body.reason },
    });
    return ok(res, { data, message: "Stock adjusted" });
  })
);

/** Sets stock to a counted figure, recording the difference as a stocktake. */
router.post(
  "/inventory/set",
  staffOnly,
  validate({ body: setStockSchema }),
  asyncHandler(async (req, res) => {
    const data = await service.setStockLevel({
      productId: req.body.product,
      variantSku: req.body.variantSku,
      warehouseId: req.body.warehouse,
      onHand: req.body.onHand,
      note: req.body.note,
      performedBy: req.auth.userId,
    });
    await audit.record({
      req,
      action: "inventory.stocktake",
      entityType: "Inventory",
      entityId: data._id,
      changes: { onHand: req.body.onHand },
    });
    return ok(res, { data, message: "Stock level updated" });
  })
);

module.exports = router;
