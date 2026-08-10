const AuditLog = require("../models/AuditLogModel");
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
    await AuditLog.create({
      actor: req?.auth?.userId,
      actorEmail: req?.auth?.email || "",
      actorRole: req?.auth?.role || "",
      action,
      entityType,
      entityId: entityId ? String(entityId) : undefined,
      changes: changes || null,
      ip: req?.ip || "",
      userAgent: req?.headers?.["user-agent"] || "",
      status,
    });
  } catch (error) {
    logger.error(`Audit write failed for ${action}: ${error.message}`);
  }
};

module.exports = { record, diff };
