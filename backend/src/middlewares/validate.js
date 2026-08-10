const AppError = require("../core/AppError");

/**
 * Builds a middleware that validates and *replaces* the named request
 * segments with their parsed output, so handlers receive coerced, trimmed,
 * defaulted values and nothing else.
 *
 * @param {{body?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny}} schemas
 */
const validate = (schemas) => (req, res, next) => {
  const issues = [];

  for (const segment of ["params", "query", "body"]) {
    const schema = schemas[segment];
    if (!schema) continue;

    const result = schema.safeParse(req[segment]);
    if (result.success) {
      // req.query is a getter on some Express versions; assign defensively.
      Object.defineProperty(req, segment, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      issues.push(
        ...result.error.issues.map((issue) => ({
          field: [segment, ...issue.path].join("."),
          message: issue.message,
        }))
      );
    }
  }

  if (issues.length > 0) {
    return next(AppError.unprocessable("Validation failed", issues));
  }
  return next();
};

module.exports = validate;
