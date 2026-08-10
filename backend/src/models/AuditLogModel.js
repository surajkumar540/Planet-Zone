const mongoose = require("mongoose");

/**
 * Append-only record of privileged actions.
 *
 * Written by the audit service; never updated or deleted through the API.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    actorEmail: { type: String, default: "" },
    actorRole: { type: String, default: "" },

    // e.g. "product.create", "order.status.update", "user.role.update"
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, index: true },

    // Field-level before/after snapshot, limited to the fields that changed.
    changes: { type: mongoose.Schema.Types.Mixed, default: null },

    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    status: { type: String, enum: ["success", "failure"], default: "success" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
