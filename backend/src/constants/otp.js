/** Lifetime of a one-time code, in minutes. */
const OTP_TTL_MINUTES = 10;

/** Verification attempts allowed against a single code before it is burned. */
const OTP_MAX_ATTEMPTS = 5;

/** Codes that may be issued to one address within the resend window. */
const OTP_MAX_SENDS = 5;

/** Length of the numeric code. */
const OTP_LENGTH = 6;

module.exports = { OTP_TTL_MINUTES, OTP_MAX_ATTEMPTS, OTP_MAX_SENDS, OTP_LENGTH };
