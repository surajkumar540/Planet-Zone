const AppError = require("../core/AppError");
const { ROLES, hasAtLeastRole } = require("../constants/roles");

/**
 * Allows the request only when the caller holds one of the listed roles.
 * Must run after `authenticate`.
 */
const requireRole =
  (...allowed) =>
  (req, res, next) => {
    if (!req.auth) return next(AppError.unauthorized());
    if (!allowed.includes(req.auth.role)) {
      return next(AppError.forbidden());
    }
    return next();
  };

/** Allows the request when the caller sits at or above `minimum` in the hierarchy. */
const requireMinimumRole = (minimum) => (req, res, next) => {
  if (!req.auth) return next(AppError.unauthorized());
  if (!hasAtLeastRole(req.auth.role, minimum)) {
    return next(AppError.forbidden());
  }
  return next();
};

/** Convenience guards for the two boundaries used most often. */
const requireAdmin = requireMinimumRole(ROLES.ADMIN);
const requireStaff = requireMinimumRole(ROLES.STAFF);

/**
 * Passes when the caller owns the resource or holds an elevated role.
 * `getOwnerId` receives the request and returns the owning user id.
 */
const requireOwnershipOr =
  (minimumRole, getOwnerId) =>
  async (req, res, next) => {
    try {
      if (!req.auth) return next(AppError.unauthorized());
      if (hasAtLeastRole(req.auth.role, minimumRole)) return next();

      const ownerId = await getOwnerId(req);
      if (!ownerId) return next(AppError.notFound());
      if (String(ownerId) !== String(req.auth.userId)) {
        return next(AppError.forbidden());
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };

module.exports = {
  requireRole,
  requireMinimumRole,
  requireAdmin,
  requireStaff,
  requireOwnershipOr,
};
