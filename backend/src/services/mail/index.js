const { sendMail, isConfigured } = require("./transporter");
const templates = require("./templates");

const sendVerificationOtp = ({ to, name, otp, expiresInMinutes }) =>
  sendMail({ to, ...templates.verificationOtp({ name, otp, expiresInMinutes }) });

const sendPasswordResetOtp = ({ to, name, otp, expiresInMinutes }) =>
  sendMail({ to, ...templates.passwordResetOtp({ name, otp, expiresInMinutes }) });

const sendPasswordChanged = ({ to, name }) =>
  sendMail({ to, ...templates.passwordChanged({ name }) });

module.exports = {
  sendMail,
  isConfigured,
  sendVerificationOtp,
  sendPasswordResetOtp,
  sendPasswordChanged,
  templates,
};
