const BRAND = "Planet";
const ACCENT = "#16a34a";

/** Shared chrome so every transactional email looks like it came from one product. */
const layout = ({ title, body, footer }) => `
<div style="margin:0;padding:24px;background:#f4f6f8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="padding:20px 28px;background:${ACCENT};color:#ffffff;font-size:18px;font-weight:600;">${BRAND}</div>
    <div style="padding:28px;color:#111827;">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;">${title}</h1>
      ${body}
    </div>
    <div style="padding:16px 28px;background:#f9fafb;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb;">
      ${footer || `You are receiving this email because of activity on your ${BRAND} account.`}
    </div>
  </div>
</div>`;

const codeBlock = (code) => `
  <div style="margin:20px 0;padding:16px;background:#f3f4f6;border-radius:8px;text-align:center;
              font-size:28px;font-weight:700;letter-spacing:8px;color:#111827;">${code}</div>`;

const paragraph = (text) =>
  `<p style="margin:0 0 12px;font-size:14px;line-height:22px;color:#4b5563;">${text}</p>`;

const verificationOtp = ({ name, otp, expiresInMinutes }) => ({
  subject: `${otp} is your ${BRAND} verification code`,
  html: layout({
    title: "Verify your email address",
    body:
      paragraph(`Hi ${name || "there"}, use the code below to finish creating your account.`) +
      codeBlock(otp) +
      paragraph(
        `This code expires in ${expiresInMinutes} minutes. If you did not request it, you can safely ignore this email.`
      ),
  }),
});

const passwordResetOtp = ({ name, otp, expiresInMinutes }) => ({
  subject: `${otp} is your ${BRAND} password reset code`,
  html: layout({
    title: "Reset your password",
    body:
      paragraph(`Hi ${name || "there"}, use the code below to set a new password.`) +
      codeBlock(otp) +
      paragraph(
        `This code expires in ${expiresInMinutes} minutes. If you did not request a password reset, please secure your account.`
      ),
  }),
});

const passwordChanged = ({ name }) => ({
  subject: `Your ${BRAND} password was changed`,
  html: layout({
    title: "Password updated",
    body:
      paragraph(`Hi ${name || "there"}, your password was changed successfully.`) +
      paragraph("If this wasn't you, reset your password immediately and contact support."),
  }),
});

module.exports = { verificationOtp, passwordResetOtp, passwordChanged, layout, paragraph };
