const { z } = require("zod");

/** Primary keys are UUIDs, except Payment, which uses the gateway's order id. */
const uuid = z.uuid("Invalid identifier");

const isUuid = (value) => uuid.safeParse(value).success;

/** `{ id }` route params, e.g. `/products/:id`. */
const idParam = (key = "id") => z.object({ [key]: uuid });

/**
 * Shared list-endpoint query contract: page, limit, free-text search, and a
 * `sort` string in the `field:asc|desc` form.
 */
const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sort: z
    .string()
    .regex(/^[a-zA-Z0-9_.]+:(asc|desc)$/, "Sort must look like field:asc or field:desc")
    .optional(),
});

/**
 * Translates a `field:direction` query string into a Prisma `orderBy`.
 *
 * `allowed` maps API sort keys to columns, so a client can only sort on what a
 * list explicitly exposes; anything else falls back to the default rather than
 * reaching the database. The `id` tie-break keeps paging stable when values
 * repeat.
 *
 * @param {string|undefined} sort
 * @param {Record<string, string>} allowed API sort key to column name
 * @param {string} [fallback]
 */
const parseSort = (sort, allowed, fallback = "createdAt:desc") => {
  const [field, direction] = (sort || fallback).split(":");
  const column = Object.hasOwn(allowed, field) ? allowed[field] : null;
  if (!column) {
    const [fallbackField, fallbackDirection] = fallback.split(":");
    return [{ [allowed[fallbackField] || fallbackField]: fallbackDirection }, { id: "asc" }];
  }
  return [{ [column]: direction }, { id: "asc" }];
};

/** Turns a list of column names into a `parseSort` allow-list. */
const sortable = (...columns) => Object.fromEntries(columns.map((column) => [column, column]));

/** Escapes LIKE wildcards so `%` and `_` in a search match literally. */
const escapeLike = (value) => String(value).replace(/[\\%_]/g, "\\$&");

/** Case-insensitive "contains" matcher across the given columns. */
const searchFilter = (search, fields) => {
  if (!search || fields.length === 0) return {};
  const pattern = escapeLike(search);
  return { OR: fields.map((field) => ({ [field]: { contains: pattern, mode: "insensitive" } })) };
};

/** Peels `.default()` and `.optional()` wrappers off a field schema. */
const withoutDefault = (schema) => {
  let inner = schema;
  while (inner instanceof z.ZodDefault || inner instanceof z.ZodOptional) {
    inner = inner._zod.def.innerType;
  }
  return inner.optional();
};

/**
 * Builds the body schema for a partial update.
 *
 * Use this instead of `.partial()`: in Zod 4, `.partial()` still applies each
 * field's `.default()`, so a PATCH that sends only `price` would also reset
 * every defaulted field it omitted (and `variants: []` deletes variants).
 * Here an omitted field stays absent and is left untouched.
 *
 * @param {import('zod').ZodObject} schema
 */
const patchSchema = (schema) =>
  z.object(
    Object.fromEntries(
      Object.entries(schema.shape).map(([key, field]) => [key, withoutDefault(field)])
    )
  );

const email = z.string().trim().toLowerCase().email("Enter a valid email address");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

module.exports = {
  uuid,
  isUuid,
  idParam,
  listQuery,
  parseSort,
  sortable,
  escapeLike,
  searchFilter,
  patchSchema,
  email,
  password,
};
