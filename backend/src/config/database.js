const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../core/logger");

// Reject queries containing paths not declared in the schema.
mongoose.set("strictQuery", true);

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 20,
      minPoolSize: 2,
    });
    logger.info(`MongoDB connected at ${connection.connection.host}`);
    return connection;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

const disconnectDatabase = () => mongoose.connection.close(false);

mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));

module.exports = { connectDatabase, disconnectDatabase };
