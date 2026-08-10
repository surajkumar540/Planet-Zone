const asyncHandler = require("../../core/asyncHandler");
const { ok, paginated, created } = require("../../core/ApiResponse");
const productService = require("./product.service");
const userRepository = require("../user/user.repository");
const audit = require("../../services/audit.service");

const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  return paginated(res, result);
});

const getFilterOptions = asyncHandler(async (req, res) => {
  const data = await productService.getFilterOptions();
  return ok(res, { data });
});

const getProduct = asyncHandler(async (req, res) => {
  const data = await productService.getProductById(req.params.id);
  return ok(res, { data });
});

const createProduct = asyncHandler(async (req, res) => {
  const data = await productService.createProduct(req.auth.userId, req.body);
  await audit.record({
    req,
    action: "product.create",
    entityType: "Product",
    entityId: data._id,
  });
  return created(res, { data, message: "Product created successfully" });
});

const updateProduct = asyncHandler(async (req, res) => {
  const data = await productService.updateProduct(req.params.id, req.body);
  await audit.record({
    req,
    action: "product.update",
    entityType: "Product",
    entityId: req.params.id,
    changes: req.body,
  });
  return ok(res, { data, message: "Product updated successfully" });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  await audit.record({
    req,
    action: "product.delete",
    entityType: "Product",
    entityId: req.params.id,
  });
  return ok(res, { message: "Deleted successfully" });
});

const upsertReview = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.auth.userId);
  const data = await productService.upsertReview({
    productId: req.params.id,
    user,
    ...req.body,
  });
  return ok(res, { data, message: "Review saved" });
});

const deleteOwnReview = asyncHandler(async (req, res) => {
  const data = await productService.deleteReview({
    productId: req.params.id,
    reviewUserId: req.auth.userId,
  });
  return ok(res, { data, message: "Review removed" });
});

module.exports = {
  listProducts,
  getFilterOptions,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  upsertReview,
  deleteOwnReview,
};
