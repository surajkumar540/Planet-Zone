const prisma = require("../db/client");

/**
 * Runs `work` in a database transaction; any throw rolls everything back.
 *
 * In Postgres, a failed SQL statement aborts the whole transaction, so a
 * caller cannot catch a database error inside `work` and carry on. Only errors
 * raised by application code (such as a conflict after a zero-row update) may
 * be caught and tolerated there.
 *
 * @param {(tx: import('@prisma/client').Prisma.TransactionClient) => Promise<T>} work
 * @returns {Promise<T>}
 */
const withTransaction = (work) => prisma.$transaction(work, { maxWait: 5000, timeout: 15000 });

/** Joins the caller's transaction when there is one, otherwise starts its own. */
const inTransaction = (tx, work) => (tx ? work(tx) : withTransaction(work));

module.exports = { withTransaction, inTransaction };
