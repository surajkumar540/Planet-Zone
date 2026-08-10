const crypto = require("crypto");
const Otp = require("../models/OtpModel");
const AppError = require("../core/AppError");
const {
  OTP_TTL_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_SENDS,
  OTP_LENGTH,
} = require("../constants/otp");

/** Cryptographically random numeric code of the configured length. */
const generateOtp = () => {
  const max = 10 ** OTP_LENGTH;
  return String(crypto.randomInt(0, max)).padStart(OTP_LENGTH, "0");
};

/**
 * Issues a fresh code for `email`/`purpose`, replacing any live challenge.
 *
 * Resends are capped within a single TTL window; the counter resets whenever
 * the previous challenge has expired.
 *
 * @returns {Promise<{otp: string, expiresInMinutes: number}>} the plaintext
 *   code, which exists only long enough to be emailed and is never stored.
 */
const issue = async (email, purpose) => {
  const existing = await Otp.findOne({ email, purpose });

  if (existing && !existing.isExpired() && existing.sendCount >= OTP_MAX_SENDS) {
    throw AppError.tooManyRequests(
      "Too many codes requested. Please wait a few minutes and try again."
    );
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  const stillValid = existing && !existing.isExpired();

  await Otp.findOneAndUpdate(
    { email, purpose },
    {
      $set: {
        otpHash: Otp.hashOtp(otp),
        expiresAt,
        attempts: 0,
        consumedAt: null,
      },
      $inc: { sendCount: stillValid ? 1 : 0 },
      $setOnInsert: { email, purpose },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // A brand new window starts its counter at one.
  if (!stillValid) {
    await Otp.updateOne({ email, purpose }, { $set: { sendCount: 1 } });
  }

  return { otp, expiresInMinutes: OTP_TTL_MINUTES };
};

/**
 * Validates a submitted code and consumes it on success so it cannot be
 * replayed. Wrong guesses are counted and burn the challenge once exhausted.
 */
const verify = async (email, purpose, candidate) => {
  const record = await Otp.findOne({ email, purpose });

  if (!record || record.consumedAt) {
    throw AppError.badRequest("This code is no longer valid. Please request a new one.");
  }
  if (record.isExpired()) {
    throw AppError.badRequest("This code has expired. Please request a new one.");
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id });
    throw AppError.tooManyRequests("Too many incorrect attempts. Please request a new code.");
  }

  if (!record.matches(candidate)) {
    record.attempts += 1;
    await record.save();
    throw AppError.badRequest("The code you entered is incorrect.");
  }

  await Otp.deleteOne({ _id: record._id });
  return true;
};

module.exports = { issue, verify, generateOtp };
