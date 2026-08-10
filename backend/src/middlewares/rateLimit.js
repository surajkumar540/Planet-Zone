const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const buildLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // Rate limiting would make local development and tests painful.
    skip: () => !env.isProduction,
    handler: (req, res) => {
      res.status(429).json({ status: false, message });
    },
  });

/** Baseline ceiling applied to the whole API surface. */
const apiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests, please try again later",
});

/** Tight ceiling for credential endpoints to blunt brute-force attempts. */
const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts, please try again later",
});

/** OTP and mail delivery are expensive and abusable, so they are stricter still. */
const otpLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many OTP requests, please try again later",
});

module.exports = { apiLimiter, authLimiter, otpLimiter };
