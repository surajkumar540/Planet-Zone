const app = require("./app");
const env = require("./config/env");
const logger = require("./core/logger");
const { connectDatabase, disconnectDatabase } = require("./config/database");

let server;

const start = async () => {
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
};

/**
 * Stops accepting new connections, lets in-flight requests finish, then closes
 * the database. A hard exit after the grace period prevents a stuck socket
 * from blocking a deploy indefinitely.
 */
const shutdown = async (signal) => {
  logger.info(`${signal} received, shutting down`);

  const forceExit = setTimeout(() => {
    logger.error("Graceful shutdown timed out, forcing exit");
    process.exit(1);
  }, 10000);
  forceExit.unref();

  try {
    if (server) await new Promise((resolve) => server.close(resolve));
    await disconnectDatabase();
    logger.info("Shutdown complete");
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// An unhandled rejection or uncaught exception leaves the process in an
// unknown state; log it and let the supervisor restart cleanly.
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled rejection: ${reason instanceof Error ? reason.stack : reason}`);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught exception: ${error.stack}`);
  process.exit(1);
});

start().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
