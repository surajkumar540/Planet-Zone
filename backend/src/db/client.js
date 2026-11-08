const { PrismaClient } = require("@prisma/client");
const env = require("../config/env");

/** The single database client. Prisma pools connections internally. */
const prisma = new PrismaClient({
  datasourceUrl: env.DATABASE_URL,
  log: env.isProduction ? ["error"] : ["warn", "error"],
});

module.exports = prisma;
