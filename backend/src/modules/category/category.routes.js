const express = require("express");
const asyncHandler = require("../../core/asyncHandler");
const { ok, created } = require("../../core/ApiResponse");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { requireStaff } = require("../../middlewares/rbac");
const audit = require("../../services/audit.service");
const service = require("./category.service");
const schemas = require("./category.validation");

const router = express.Router();
const staffOnly = [authenticate, requireStaff];

/* ---------------------------------- Public --------------------------------- */

router.get(
  "/categories",
  validate({ query: schemas.listCategoriesQuery }),
  asyncHandler(async (req, res) => ok(res, { data: await service.list(req.query) }))
);

router.get(
  "/categories/tree",
  validate({ query: schemas.listCategoriesQuery }),
  asyncHandler(async (req, res) => ok(res, { data: await service.tree(req.query) }))
);

router.get(
  "/categories/:id",
  validate({ params: schemas.categoryIdParam }),
  asyncHandler(async (req, res) => ok(res, { data: await service.getById(req.params.id) }))
);

/* -------------------------------- Management ------------------------------- */

router.post(
  "/categories",
  staffOnly,
  validate({ body: schemas.createCategorySchema }),
  asyncHandler(async (req, res) => {
    const data = await service.create(req.body);
    await audit.record({
      req,
      action: "category.create",
      entityType: "Category",
      entityId: data._id,
    });
    return created(res, { data, message: "Category created" });
  })
);

router.patch(
  "/categories/reorder",
  staffOnly,
  validate({ body: schemas.reorderSchema }),
  asyncHandler(async (req, res) =>
    ok(res, { data: await service.reorder(req.body.items), message: "Order updated" })
  )
);

router.patch(
  "/categories/:id",
  staffOnly,
  validate({ params: schemas.categoryIdParam, body: schemas.updateCategorySchema }),
  asyncHandler(async (req, res) => {
    const data = await service.update(req.params.id, req.body);
    await audit.record({
      req,
      action: "category.update",
      entityType: "Category",
      entityId: req.params.id,
      changes: req.body,
    });
    return ok(res, { data, message: "Category updated" });
  })
);

router.delete(
  "/categories/:id",
  staffOnly,
  validate({ params: schemas.categoryIdParam, query: schemas.deleteCategoryQuery }),
  asyncHandler(async (req, res) => {
    const data = await service.remove(req.params.id, req.query);
    await audit.record({
      req,
      action: "category.delete",
      entityType: "Category",
      entityId: req.params.id,
    });
    return ok(res, { data, message: "Category deleted" });
  })
);

module.exports = router;
