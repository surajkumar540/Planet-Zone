/**
 * Canonical response envelope.
 *
 * The shape intentionally matches what the existing frontend already reads
 * (`{ status, message, data }`) so this layer can be adopted without touching
 * any caller. `meta` is additive and used for pagination.
 */

const ok = (res, { data = undefined, message = undefined, meta = undefined, statusCode = 200 } = {}) => {
  const payload = { status: true };
  if (message !== undefined) payload.message = message;
  if (data !== undefined) payload.data = data;
  if (meta !== undefined) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const created = (res, options = {}) => ok(res, { ...options, statusCode: 201 });

const paginated = (res, { items, page, limit, total, message }) =>
  ok(res, {
    data: items,
    message,
    meta: {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  });

const noContent = (res) => res.status(204).send();

module.exports = { ok, created, paginated, noContent };
