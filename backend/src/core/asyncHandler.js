/**
 * Wraps an async route handler so a rejected promise reaches Express'
 * error pipeline instead of becoming an unhandled rejection.
 */
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = asyncHandler;
