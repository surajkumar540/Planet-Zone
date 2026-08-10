const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const env = require("./config/env");
const logger = require("./core/logger");
const apiRoutes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const { apiLimiter } = require("./middlewares/rateLimit");

const app = express();

// Correct client IPs behind a proxy, which rate limiting and audit logs need.
app.set("trust proxy", 1);
app.disable("x-powered-by");

/* --------------------------------- Security -------------------------------- */

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin and non-browser callers (curl, health checks) send no Origin.
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

/* --------------------------------- Parsing --------------------------------- */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(compression());

// Strips `$`-prefixed and dotted keys so a request body cannot inject operators
// into a query.
app.use(mongoSanitize());
// Collapses duplicated query parameters, which otherwise arrive as arrays.
app.use(hpp());

/* --------------------------------- Logging --------------------------------- */

app.use(
  morgan(env.isProduction ? "combined" : "dev", {
    stream: logger.stream,
    skip: () => env.isTest,
  })
);

/* ---------------------------------- Health --------------------------------- */

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const healthy = dbState === 1;
  res.status(healthy ? 200 : 503).json({
    status: healthy,
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    database: healthy ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

/* ----------------------------------- API ----------------------------------- */

app.use("/api", apiLimiter, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
