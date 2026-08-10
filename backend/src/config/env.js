const path = require("path");
const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Every environment variable the application reads must be declared here.
 * The process refuses to boot with an invalid configuration rather than
 * failing later at an arbitrary request.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  SECRET_KEY: z.string().min(1, "SECRET_KEY is required"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  MAIL_HOST: z.string().default("smtp.gmail.com"),
  MAIL_PORT: z.coerce.number().int().positive().default(587),
  MAIL_USERNAME: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_SECRET: z.string().optional(),

  // Comma separated list of allowed browser origins.
  CORS_ORIGINS: z.string().default("http://localhost:5173"),

  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),
});

const parsed = envSchema
  .superRefine((value, ctx) => {
    // A short signing key is tolerable while developing but never in production.
    if (value.NODE_ENV === "production" && value.SECRET_KEY.length < 32) {
      ctx.addIssue({
        code: "custom",
        path: ["SECRET_KEY"],
        message: "must be at least 32 characters in production",
      });
    }
  })
  .safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  // Logger depends on env, so this one case writes directly to stderr.
  process.stderr.write(`Invalid environment configuration:\n${details}\n`);
  process.exit(1);
}

const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction: parsed.data.NODE_ENV === "production",
  isTest: parsed.data.NODE_ENV === "test",
};

module.exports = env;
