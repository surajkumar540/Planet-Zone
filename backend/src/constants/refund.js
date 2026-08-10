/** Lifecycle of a refund request. */
const REFUND_STATUS = Object.freeze({
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
});

const REFUND_STATUS_VALUES = Object.values(REFUND_STATUS);

/** Statuses from which a refund may still be acted on. */
const REFUND_OPEN_STATUSES = Object.freeze([
  REFUND_STATUS.REQUESTED,
  REFUND_STATUS.APPROVED,
  REFUND_STATUS.PROCESSING,
]);

module.exports = { REFUND_STATUS, REFUND_STATUS_VALUES, REFUND_OPEN_STATUSES };
