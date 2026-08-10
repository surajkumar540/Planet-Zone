const asyncHandler = require("../../core/asyncHandler");
const { ok } = require("../../core/ApiResponse");
const authService = require("./auth.service");

/**
 * Controllers stay thin: they translate between HTTP and the service layer and
 * hold no business logic. Top-level keys such as `token` and `isAdmin` are
 * preserved alongside `data` for the clients already reading them.
 */

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  return ok(res, {
    statusCode: 201,
    message: "Verification code sent to your email",
    data: result,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token, user, alreadyVerified } = await authService.verifyEmail(req.body);
  return res.status(200).json({
    status: true,
    message: alreadyVerified ? "Email already verified" : "Email verified successfully",
    token,
    userId: user._id,
    isAdmin: user.isAdmin,
    data: user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body);
  return res.status(200).json({
    status: true,
    message: "User login successfully",
    token,
    userId: user._id,
    isAdmin: user.isAdmin,
    data: user,
  });
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body);
  return ok(res, {
    message: "If an account exists for this email, a reset code has been sent",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return ok(res, { message: "Password updated successfully" });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword({ userId: req.auth.userId, ...req.body });
  return ok(res, { message: "Password updated successfully" });
});

const verifySession = asyncHandler(async (req, res) => {
  const { user } = await authService.verifySession(req.auth.userId);
  return res.status(200).json({
    status: true,
    message: "Token is valid",
    isAdmin: user.isAdmin,
    data: user,
  });
});

module.exports = {
  signup,
  verifyEmail,
  login,
  requestPasswordReset,
  resetPassword,
  changePassword,
  verifySession,
};
