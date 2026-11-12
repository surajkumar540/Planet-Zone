const { sendMail, isConfigured } = require("./transporter");
const templates = require("./templates");

const sendVerificationOtp = ({ to, name, otp, expiresInMinutes }) =>
  sendMail({ to, ...templates.verificationOtp({ name, otp, expiresInMinutes }) });

const sendPasswordResetOtp = ({ to, name, otp, expiresInMinutes }) =>
  sendMail({ to, ...templates.passwordResetOtp({ name, otp, expiresInMinutes }) });

const sendPasswordChanged = ({ to, name }) =>
  sendMail({ to, ...templates.passwordChanged({ name }) });

const sendOrderConfirmation = ({ to, name, order }) =>
  sendMail({ to, ...templates.orderConfirmed({ name, order }) });

const sendOrderStatus = ({ to, name, order }) =>
  sendMail({ to, ...templates.orderStatus({ name, order }) });

module.exports = {
  sendMail,
  isConfigured,
  sendVerificationOtp,
  sendPasswordResetOtp,
  sendPasswordChanged,
  sendOrderConfirmation,
  sendOrderStatus,
  templates,
};
