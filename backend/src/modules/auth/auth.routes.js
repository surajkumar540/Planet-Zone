const express = require("express");
const controller = require("./auth.controller");
const schemas = require("./auth.validation");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../middlewares/auth");
const { authLimiter, otpLimiter } = require("../../middlewares/rateLimit");

const router = express.Router();

router.post("/signup", otpLimiter, validate({ body: schemas.signupSchema }), controller.signup);
router.post("/login", authLimiter, validate({ body: schemas.loginSchema }), controller.login);
router.post(
  "/otpVerify",
  authLimiter,
  validate({ body: schemas.verifyOtpSchema }),
  controller.verifyEmail
);
router.post(
  "/forgetOtp",
  otpLimiter,
  validate({ body: schemas.requestOtpSchema }),
  controller.requestPasswordReset
);
router.post(
  "/changePassword",
  authLimiter,
  validate({ body: schemas.resetPasswordSchema }),
  controller.resetPassword
);

router.post("/tokenVerification", authenticate, controller.verifySession);
router.post(
  "/account/password",
  authenticate,
  validate({ body: schemas.changePasswordSchema }),
  controller.changePassword
);

module.exports = router;
