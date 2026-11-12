const nodemailer = require("nodemailer");
const env = require("../../config/env");
const logger = require("../../core/logger");

let cachedTransporter = null;

const isConfigured = () => Boolean(env.MAIL_USERNAME && env.MAIL_PASSWORD);

const getTransporter = () => {
  if (!isConfigured()) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_PORT === 465,
      auth: { user: env.MAIL_USERNAME, pass: env.MAIL_PASSWORD },
      pool: true,
      maxConnections: 5,
    });
  }
  return cachedTransporter;
};

/**
 * Sends an email. Delivery is best-effort: a mail failure is logged but never
 * fails the surrounding request, because signup and order flows must still
 * complete when the mail provider is unavailable.
 *
 * @returns {Promise<boolean>} whether the message was accepted by the provider
 */
/**
 * Subjects can carry a one-time code ("948378 is your Planet verification
 * code"), so digit runs are masked before a subject reaches the logs.
 */
const redact = (subject) => String(subject).replace(/\d{4,}/g, "******");

const sendMail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  if (!transporter) {
    logger.warn("Mail credentials are not configured; skipping delivery", { subject: redact(subject) });
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: env.MAIL_FROM || env.MAIL_USERNAME,
      to: String(to),
      subject: String(subject),
      text: text || String(html).replace(/<[^>]+>/g, " "),
      html,
    });
    logger.info("Mail sent", { messageId: info.messageId, subject: redact(subject) });
    return true;
  } catch (error) {
    logger.error(`Mail delivery failed: ${error.message}`, { subject: redact(subject) });
    return false;
  }
};

module.exports = { sendMail, isConfigured };
