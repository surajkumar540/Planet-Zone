/**
 * Operational error carrying an HTTP status.
 *
 * Anything thrown as an AppError is considered expected and is safe to report
 * back to the client. Every other thrown value is treated as a programmer error
 * and reported generically by the error handler.
 */
class AppError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details) {
    return new AppError(400, message, details);
  }

  static unauthorized(message = "Unauthorized user", details) {
    return new AppError(401, message, details);
  }

  static forbidden(message = "You do not have access to this resource", details) {
    return new AppError(403, message, details);
  }

  static notFound(message = "Resource not found", details) {
    return new AppError(404, message, details);
  }

  static conflict(message = "Resource already exists", details) {
    return new AppError(409, message, details);
  }

  static unprocessable(message = "Validation failed", details) {
    return new AppError(422, message, details);
  }

  static tooManyRequests(message = "Too many requests", details) {
    return new AppError(429, message, details);
  }

  static internal(message = "Something went wrong", details) {
    return new AppError(500, message, details);
  }
}

module.exports = AppError;
