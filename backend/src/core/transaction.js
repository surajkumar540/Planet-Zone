const mongoose = require("mongoose");
const logger = require("./logger");

let transactionsSupported = null;

/**
 * Multi-document transactions require a replica set or sharded cluster.
 * A standalone mongod (common in local development) rejects them, so support
 * is probed once and cached.
 */
const supportsTransactions = async () => {
  if (transactionsSupported !== null) return transactionsSupported;

  try {
    const status = await mongoose.connection.db.admin().command({ hello: 1 });
    transactionsSupported = Boolean(status.setName || status.msg === "isdbgrid");
  } catch {
    transactionsSupported = false;
  }

  if (!transactionsSupported) {
    logger.warn(
      "MongoDB is running standalone; transactional writes fall back to compensating updates"
    );
  }
  return transactionsSupported;
};

/**
 * Runs `work` inside a transaction when the deployment supports one.
 *
 * Callers receive a session (or null) and must be written so that the
 * non-transactional path still leaves consistent data — see the order service,
 * which compensates by returning reserved stock on failure.
 *
 * @param {(session: import('mongoose').ClientSession | null) => Promise<T>} work
 * @returns {Promise<T>}
 */
const withTransaction = async (work) => {
  if (!(await supportsTransactions())) {
    return work(null);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = { withTransaction, supportsTransactions };
