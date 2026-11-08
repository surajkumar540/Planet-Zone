const crypto = require("crypto");
const prisma = require("../db/client");
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

// Only the digest is stored, so a database leak does not expose live codes.
const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

const isExpired = (record) => record.expiresAt.getTime() <= Date.now();

/** Constant-time comparison avoids leaking the code through response timing. */
const matches = (record, candidate) => {
  const expected = Buffer.from(record.otpHash);
  const actual = Buffer.from(hashOtp(candidate));
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
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
  // Postgres has no TTL index, so expired challenges are cleared as new ones are issued.
  await prisma.otp.deleteMany({
    where: { expiresAt: { lt: new Date() }, NOT: { email, purpose } },
  });

  const existing = await prisma.otp.findUnique({ where: { email_purpose: { email, purpose } } });
  const stillValid = Boolean(existing) && !isExpired(existing);

  if (stillValid && existing.sendCount >= OTP_MAX_SENDS) {
    throw AppError.tooManyRequests(
      "Too many codes requested. Please wait a few minutes and try again."
    );
  }

  const otp = generateOtp();
  const fields = {
    otpHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    attempts: 0,
    consumedAt: null,
    // A brand new window starts its counter at one.
    sendCount: stillValid ? existing.sendCount + 1 : 1,
  };

  await prisma.otp.upsert({
    where: { email_purpose: { email, purpose } },
    create: { email, purpose, ...fields },
    update: fields,
  });

  return { otp, expiresInMinutes: OTP_TTL_MINUTES };
};

/**
 * Validates a submitted code and consumes it on success so it cannot be
 * replayed. Wrong guesses are counted and burn the challenge once exhausted.
 */
const verify = async (email, purpose, candidate) => {
  const record = await prisma.otp.findUnique({ where: { email_purpose: { email, purpose } } });

  if (!record || record.consumedAt) {
    throw AppError.badRequest("This code is no longer valid. Please request a new one.");
  }
  if (isExpired(record)) {
    throw AppError.badRequest("This code has expired. Please request a new one.");
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.otp.delete({ where: { id: record.id } });
    throw AppError.tooManyRequests("Too many incorrect attempts. Please request a new code.");
  }

  if (!matches(record, candidate)) {
    await prisma.otp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    throw AppError.badRequest("The code you entered is incorrect.");
  }

  await prisma.otp.delete({ where: { id: record.id } });
  return true;
};

module.exports = { issue, verify, generateOtp, hashOtp };
