const prisma = require("../db/client");
const logger = require("../core/logger");

/** Connects eagerly so a bad DATABASE_URL fails at boot, not on the first request. */
const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info("PostgreSQL connected");
  } catch (error) {
    logger.error(`PostgreSQL connection failed: ${error.message}`);
    throw error;
  }
};

const disconnectDatabase = () => prisma.$disconnect();

module.exports = { connectDatabase, disconnectDatabase };
