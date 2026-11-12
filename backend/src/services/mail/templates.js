const env = require("../../config/env");

const BRAND = "Planet Zone";
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

/* --------------------------------- Orders --------------------------------- */

const rupees = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Escapes text from the database before it is placed in HTML. */
const escape = (text) =>
  String(text ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const button = (href, label) => `
  <div style="margin:22px 0 6px;">
    <a href="${href}" style="display:inline-block;padding:12px 22px;background:${ACCENT};color:#ffffff;
       text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">${label}</a>
  </div>`;

const itemsTable = (order) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:14px 0;border-collapse:collapse;">
    ${(order.orderItems || [])
      .map(
        (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f1f3;width:52px;">
          <img src="${escape(item.image)}" width="44" height="44" alt="" style="border-radius:8px;object-fit:cover;background:#f3f4f6;display:block;">
        </td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f1f3;font-size:14px;color:#111827;">
          ${escape(item.name)}<br><span style="color:#6b7280;font-size:12px;">Qty ${item.qty}${item.variantLabel ? ` · ${escape(item.variantLabel)}` : ""}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f1f3;font-size:14px;color:#111827;text-align:right;white-space:nowrap;">${rupees(item.lineTotal)}</td>
      </tr>`
      )
      .join("")}
    <tr>
      <td></td>
      <td style="padding:12px 10px 0;font-size:14px;font-weight:700;color:#111827;">Total</td>
      <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#111827;text-align:right;">${rupees(order.pricing?.grandTotal)}</td>
    </tr>
  </table>`;

const orderLink = (order) => `${env.APP_URL.replace(/\/$/, "")}/order/${order._id}`;

const deliveryWindow = (order) => {
  const min = order.shipping?.minDeliveryDays;
  const max = order.shipping?.maxDeliveryDays;
  return min && max ? `${min}–${max} days` : "3–7 days";
};

const orderConfirmed = ({ name, order }) => ({
  subject: `Order ${order.orderNumber} confirmed`,
  html: layout({
    title: "Thanks for your order!",
    body:
      paragraph(`Hi ${escape(name) || "there"}, we've received order <b>${order.orderNumber}</b> and we're getting it ready.`) +
      itemsTable(order) +
      (order.onlinePayment
        ? paragraph("Payment received online. Nothing more to pay.")
        : paragraph(`<b>Cash on delivery:</b> please keep <b>${rupees(order.pricing?.grandTotal)}</b> ready (cash or UPI) when it arrives.`)) +
      paragraph(
        `Delivering to ${escape(order.shippingAddress?.fullName)}, ${escape(order.shippingAddress?.city)}. Expected in ${deliveryWindow(order)}.`
      ) +
      button(orderLink(order), "Track your order"),
  }),
});

const STATUS_COPY = {
  shipped: {
    subject: "is on its way",
    title: "Your order has shipped",
    line: "Good news: your order has left our warehouse.",
  },
  out_for_delivery: {
    subject: "is out for delivery",
    title: "Arriving today",
    line: "Your order is out for delivery and should reach you today.",
  },
  delivered: {
    subject: "was delivered",
    title: "Delivered!",
    line: "Your order has been delivered. We hope you love it. You can now review what you bought.",
  },
  cancelled: {
    subject: "was cancelled",
    title: "Order cancelled",
    line: "Your order has been cancelled. If you paid online, the refund will follow.",
  },
  refunded: {
    subject: "was refunded",
    title: "Refund processed",
    line: "Your refund has been processed. It can take 5–7 working days to show in your account.",
  },
};

const orderStatus = ({ name, order }) => {
  const copy = STATUS_COPY[order.status] || { subject: "was updated", title: "Order update", line: "Your order status has changed." };
  const tracking = order.shipping?.trackingNumber
    ? paragraph(`Tracking: <b>${escape(order.shipping.trackingNumber)}</b>${order.shipping.carrier ? ` via ${escape(order.shipping.carrier)}` : ""}`)
    : "";
  const cashReminder =
    !order.onlinePayment && ["shipped", "out_for_delivery"].includes(order.status)
      ? paragraph(`Please keep <b>${rupees(order.pricing?.grandTotal)}</b> ready for the delivery person (cash or UPI).`)
      : "";
  return {
    subject: `Order ${order.orderNumber} ${copy.subject}`,
    html: layout({
      title: copy.title,
      body:
        paragraph(`Hi ${escape(name) || "there"}, ${copy.line}`) +
        tracking +
        cashReminder +
        itemsTable(order) +
        button(orderLink(order), order.status === "delivered" ? "Rate your products" : "View your order"),
    }),
  };
};

module.exports = {
  verificationOtp,
  passwordResetOtp,
  passwordChanged,
  orderConfirmed,
  orderStatus,
  layout,
  paragraph,
};
