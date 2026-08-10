const mongoose = require("mongoose");
const crypto = require("crypto");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    purpose: {
      type: String,
      enum: ["register", "reset"],
      required: true,
      index: true,
    },
    // Only the digest is stored, so a database leak does not expose live codes.
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    // Number of codes issued in the current window, used for resend throttling.
    sendCount: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One live challenge per email per purpose.
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });
// Mongo removes the document once it expires; no cleanup job needed.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

otpSchema.statics.hashOtp = hashOtp;

otpSchema.methods.matches = function matches(candidate) {
  const expected = Buffer.from(this.otpHash);
  const actual = Buffer.from(hashOtp(candidate));
  // Constant-time comparison avoids leaking the code through response timing.
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

otpSchema.methods.isExpired = function isExpired() {
  return this.expiresAt.getTime() <= Date.now();
};

module.exports = mongoose.model("Otp", otpSchema);
