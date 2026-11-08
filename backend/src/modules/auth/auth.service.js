const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const AppError = require("../../core/AppError");
const logger = require("../../core/logger");
const userRepository = require("../user/user.repository");
const otpService = require("../../services/otp.service");
const mailService = require("../../services/mail");
const { ROLES } = require("../../constants/roles");

const OTP_PURPOSE = { REGISTER: "register", RESET: "reset" };

const PASSWORD_HASH_ROUNDS = 12;

/** Every password write must go through this; nothing stores plaintext. */
const hashPassword = (password) => bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

/** Signs an access token carrying the caller's identity and role. */
const signToken = (user) =>
  jwt.sign(
    { id: String(user._id), role: user.role, admin: user.role === ROLES.ADMIN },
    env.SECRET_KEY,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

/** The user projection safe to hand to a client. */
const toPublicUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone || "",
  avatar: user.avatar || "",
  role: user.role,
  isAdmin: user.role === ROLES.ADMIN,
  emailVerify: user.emailVerify,
  createdAt: user.createdAt,
});

/**
 * Registers an account, or refreshes the pending registration when the email
 * exists but was never verified. In both cases a verification code is sent.
 */
const signup = async ({ firstName, lastName, email, password }) => {
  const existing = await userRepository.findByEmail(email);

  if (existing && existing.emailVerify) {
    throw AppError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(password);

  // An unverified signup being retried refreshes its details and credentials.
  const user = existing
    ? await userRepository.updateById(existing._id, {
        firstName,
        lastName,
        password: passwordHash,
      })
    : await userRepository.create({
        firstName,
        lastName,
        email,
        password: passwordHash,
        role: ROLES.CUSTOMER,
      });

  const { otp, expiresInMinutes } = await otpService.issue(email, OTP_PURPOSE.REGISTER);
  await mailService.sendVerificationOtp({ to: email, name: firstName, otp, expiresInMinutes });

  return { email: user.email };
};

/** Confirms ownership of the email address and returns a session token. */
const verifyEmail = async ({ email, otp }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw AppError.notFound("No account found for this email");
  }
  if (user.emailVerify) {
    return { token: signToken(user), user: toPublicUser(user), alreadyVerified: true };
  }

  await otpService.verify(email, OTP_PURPOSE.REGISTER, otp);

  const verified = await userRepository.updateById(user._id, { emailVerify: true });

  return { token: signToken(verified), user: toPublicUser(verified), alreadyVerified: false };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email, { withPassword: true });

  // A single generic message for both unknown email and wrong password, so the
  // endpoint cannot be used to enumerate registered addresses.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw AppError.unauthorized("Invalid email or password");
  }

  if (!user.emailVerify) {
    throw AppError.forbidden("Please verify your email address to continue");
  }
  if (!user.isActive) {
    throw AppError.forbidden("This account has been deactivated");
  }

  await userRepository.updateById(user._id, { lastLoginAt: new Date() });

  return { token: signToken(user), user: toPublicUser(user) };
};

/**
 * Starts the password reset flow.
 *
 * Always resolves successfully: revealing whether the address is registered
 * would leak account existence to an unauthenticated caller.
 */
const requestPasswordReset = async ({ email }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    logger.warn("Password reset requested for unknown email", { email });
    return { sent: true };
  }

  const { otp, expiresInMinutes } = await otpService.issue(email, OTP_PURPOSE.RESET);
  await mailService.sendPasswordResetOtp({
    to: email,
    name: user.firstName,
    otp,
    expiresInMinutes,
  });

  return { sent: true };
};

/** Completes the reset flow by exchanging a valid code for a new password. */
const resetPassword = async ({ email, otp, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw AppError.badRequest("This code is no longer valid. Please request a new one.");
  }

  await otpService.verify(email, OTP_PURPOSE.RESET, otp);

  await userRepository.updateById(user._id, {
    password: await hashPassword(password),
    // Completing a reset also proves ownership of the address.
    emailVerify: true,
  });

  await mailService.sendPasswordChanged({ to: email, name: user.firstName });
  return { updated: true };
};

/** Changes the password of an already authenticated user. */
const changePassword = async ({ userId, currentPassword, password }) => {
  const user = await userRepository.findByIdWithPassword(userId);
  if (!user) throw AppError.notFound("User not found");

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw AppError.badRequest("Your current password is incorrect");
  }

  await userRepository.updateById(userId, { password: await hashPassword(password) });

  await mailService.sendPasswordChanged({ to: user.email, name: user.firstName });
  return { updated: true };
};

/**
 * Confirms the bearer token is still valid and returns the live user record.
 *
 * The caller's role comes from the database rather than the token, so a
 * revoked or downgraded account loses access immediately.
 */
const verifySession = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) {
    throw AppError.unauthorized("Unauthorized user");
  }
  return { user: toPublicUser(user) };
};

module.exports = {
  signup,
  verifyEmail,
  login,
  requestPasswordReset,
  resetPassword,
  changePassword,
  verifySession,
  signToken,
  toPublicUser,
  hashPassword,
};
