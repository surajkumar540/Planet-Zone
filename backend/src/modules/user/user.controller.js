const asyncHandler = require("../../core/asyncHandler");
const { ok, paginated } = require("../../core/ApiResponse");
const userService = require("./user.service");
const audit = require("../../services/audit.service");

const getProfile = asyncHandler(async (req, res) => {
  const data = await userService.getProfile(req.auth.userId);
  return ok(res, { data });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await userService.updateProfile(req.auth.userId, req.body);
  return ok(res, { data, message: "Profile updated successfully" });
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  return paginated(res, result);
});

const getUserById = asyncHandler(async (req, res) => {
  const data = await userService.getUserById(req.params.id);
  return ok(res, { data });
});

const updateUser = asyncHandler(async (req, res) => {
  const data = await userService.updateUser(req.auth.userId, req.params.id, req.body);
  await audit.record({
    req,
    action: "user.update",
    entityType: "User",
    entityId: req.params.id,
    changes: req.body,
  });
  return ok(res, { data, message: "User updated successfully" });
});

module.exports = { getProfile, updateProfile, listUsers, getUserById, updateUser };
