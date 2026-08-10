const mongoose = require("mongoose");
const { z } = require("zod");

/** A 24-character hex Mongo ObjectId. */
const objectId = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), "Invalid identifier");

/** `{ id }` route params, e.g. `/products/:id`. */
const idParam = (key = "id") => z.object({ [key]: objectId });

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

/** Translates the `field:direction` query string into a Mongoose sort object. */
const parseSort = (sort, fallback = { createdAt: -1 }) => {
  if (!sort) return fallback;
  const [field, direction] = sort.split(":");
  return { [field]: direction === "asc" ? 1 : -1 };
};

/**
 * Escapes user input before it is used inside a RegExp so that characters
 * like `(` or `*` cannot alter the query or cause catastrophic backtracking.
 */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Case-insensitive "contains" matcher across the given fields. */
const searchFilter = (search, fields) => {
  if (!search || fields.length === 0) return {};
  const pattern = new RegExp(escapeRegex(search), "i");
  return { $or: fields.map((field) => ({ [field]: pattern })) };
};

const email = z.string().trim().toLowerCase().email("Enter a valid email address");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

module.exports = {
  objectId,
  idParam,
  listQuery,
  parseSort,
  escapeRegex,
  searchFilter,
  email,
  password,
};
