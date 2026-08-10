const asyncHandler = require("../../core/asyncHandler");
const { ok, created, paginated } = require("../../core/ApiResponse");
const orderService = require("./order.service");
const paymentService = require("../../services/payment.service");
const audit = require("../../services/audit.service");
const { hasAtLeastRole, ROLES } = require("../../constants/roles");

const requesterFrom = (req) => ({
  userId: req.auth.userId,
  isStaff: hasAtLeastRole(req.auth.role, ROLES.STAFF),
});

const initPayment = asyncHandler(async (req, res) => {
  const { order, keyId } = await paymentService.createPaymentIntent({
    amount: req.body.amount,
    userId: req.auth.userId,
  });
  // KEY_ID is the publishable key the checkout widget reads from the top level.
  return res.status(200).json({
    status: true,
    message: "Payment initialised",
    data: order,
    KEY_ID: keyId,
  });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.confirmPayment({
    userId: req.auth.userId,
    ...req.body,
  });
  return ok(res, {
    data: { _id: payment._id, amount_paid: payment.amount_paid, verified: payment.verified },
    message: "Payment verified",
  });
});

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder({ userId: req.auth.userId, ...req.body });
  // `orderId` is repeated at the top level for the existing checkout screen.
  return res.status(201).json({
    status: true,
    message: "Order created successfully",
    orderId: order._id,
    data: order,
  });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.listMyOrders({ userId: req.auth.userId, ...req.query });
  return paginated(res, result);
});

const listAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.listAllOrders(req.query);
  return paginated(res, result);
});

const getOrder = asyncHandler(async (req, res) => {
  const data = await orderService.getOrderById({
    orderId: req.params.id,
    requester: requesterFrom(req),
  });
  return ok(res, { data });
});

const updateStatus = asyncHandler(async (req, res) => {
  const data = await orderService.updateOrderStatus({
    orderId: req.params.id,
    actorId: req.auth.userId,
    ...req.body,
  });
  await audit.record({
    req,
    action: "order.status.update",
    entityType: "Order",
    entityId: req.params.id,
    changes: { status: req.body.status },
  });
  return ok(res, { data, message: "Order status updated" });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const data = await orderService.cancelOrder({
    orderId: req.params.id,
    requester: requesterFrom(req),
    reason: req.body.reason,
  });
  return ok(res, { data, message: "Order cancelled" });
});

module.exports = {
  initPayment,
  confirmPayment,
  createOrder,
  listMyOrders,
  listAllOrders,
  getOrder,
  updateStatus,
  cancelOrder,
};
