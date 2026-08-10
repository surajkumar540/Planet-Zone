const mongoose = require("mongoose");
const { ZodError } = require("zod");
const AppError = require("../core/AppError");
const logger = require("../core/logger");
const env = require("../config/env");

/** Terminal 404 for any route that did not match. */
const notFoundHandler = (req, res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

/** Translates known error shapes into an AppError. */
const normalize = (error) => {
  if (error instanceof AppError) return error;

  if (error instanceof ZodError) {
    return AppError.unprocessable(
      "Validation failed",
      error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }))
    );
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return AppError.unprocessable(
      "Validation failed",
      Object.values(error.errors).map((fieldError) => ({
        field: fieldError.path,
        message: fieldError.message,
      }))
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return AppError.badRequest(`Invalid value for ${error.path}`);
  }

  // Duplicate key on a unique index.
  if (error.code === 11000) {
    const fields = Object.keys(error.keyValue || {});
    return AppError.conflict(
      fields.length ? `${fields.join(", ")} already in use` : "Resource already exists"
    );
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return AppError.unauthorized("Unauthorized user");
  }

  return null;
};

/**
 * Single exit point for every failed request.
 *
 * Operational errors report their own message; anything unrecognised is logged
 * with its stack and reported generically so internals never leak to clients.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies handlers by arity.
const errorHandler = (error, req, res, next) => {
  const normalized = normalize(error);
  const appError = normalized || AppError.internal();

  const context = {
    method: req.method,
    path: req.originalUrl,
    statusCode: appError.statusCode,
    userId: req.auth?.userId,
  };

  if (!normalized || appError.statusCode >= 500) {
    logger.error(error.message || "Unhandled error", { ...context, stack: error.stack });
  } else {
    logger.warn(appError.message, context);
  }

  const body = {
    status: false,
    message: appError.message,
  };
  if (appError.details) body.errors = appError.details;
  if (!env.isProduction && (!normalized || appError.statusCode >= 500)) {
    body.stack = error.stack;
  }

  res.status(appError.statusCode).json(body);
};

module.exports = { errorHandler, notFoundHandler };
