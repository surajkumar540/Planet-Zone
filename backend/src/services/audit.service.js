const prisma = require("../db/client");
const logger = require("../core/logger");

/**
 * Computes a compact `{ field: { from, to } }` diff, ignoring unchanged keys.
 * Only keys present in `after` are considered.
 */
const diff = (before = {}, after = {}) => {
  const changes = {};
  for (const key of Object.keys(after)) {
    const from = before?.[key];
    const to = after[key];
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes[key] = { from, to };
    }
  }
  return Object.keys(changes).length ? changes : null;
};

/**
 * Records a privileged action.
 *
 * Auditing must never break the operation it is describing, so a write
 * failure here is logged and swallowed.
 */
const record = async ({ req, action, entityType, entityId, changes, status = "success" }) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: req?.auth?.userId,
        actorEmail: req?.auth?.email || "",
        actorRole: req?.auth?.role || "",
        action,
        entityType,
        entityId: entityId ? String(entityId) : undefined,
        // Round-tripped so Dates and undefined become valid JSON.
        changes: changes ? JSON.parse(JSON.stringify(changes)) : undefined,
        ip: req?.ip || "",
        userAgent: req?.headers?.["user-agent"] || "",
        status,
      },
    });
  } catch (error) {
    logger.error(`Audit write failed for ${action}: ${error.message}`);
  }
};

module.exports = { record, diff };
