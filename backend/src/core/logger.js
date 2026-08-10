const winston = require("winston");
const env = require("../config/env");

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const developmentFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts} ${level}: ${stack || message}${extra}`;
  })
);

const productionFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.isProduction ? productionFormat : developmentFormat,
  defaultMeta: { service: "planet-api" },
  transports: [new winston.transports.Console()],
  silent: env.isTest,
});

// Adapter so morgan can stream HTTP access logs through the same sink.
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
