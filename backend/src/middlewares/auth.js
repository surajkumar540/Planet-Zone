const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../core/AppError");
const asyncHandler = require("../core/asyncHandler");
const { ROLES } = require("../constants/roles");

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return null;
};

/**
 * Verifies the bearer token and attaches the caller identity to the request.
 *
 * Authority comes from the signed token only — never from a client supplied
 * body field or header.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw AppError.unauthorized("Unauthorized user");
  }

  let payload;
  try {
    payload = jwt.verify(token, env.SECRET_KEY);
  } catch (error) {
    throw AppError.unauthorized("Unauthorized user");
  }

  req.auth = {
    userId: payload.id,
    role: payload.role || (payload.admin ? ROLES.ADMIN : ROLES.CUSTOMER),
    isAdmin: Boolean(payload.admin) || payload.role === ROLES.ADMIN,
  };

  // Preserved for handlers written against the original middleware contract.
  req.userId = payload.id;

  next();
});

/**
 * Attaches identity when a valid token is present but allows anonymous access.
 * Used by endpoints that return richer data to signed-in callers.
 */
const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.SECRET_KEY);
    req.auth = {
      userId: payload.id,
      role: payload.role || (payload.admin ? ROLES.ADMIN : ROLES.CUSTOMER),
      isAdmin: Boolean(payload.admin) || payload.role === ROLES.ADMIN,
    };
    req.userId = payload.id;
  } catch {
    // An invalid token is treated the same as no token here.
  }
  return next();
});

module.exports = { authenticate, optionalAuthenticate, extractToken };
