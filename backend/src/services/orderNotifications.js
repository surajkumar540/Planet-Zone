const prisma = require("../db/client");
const logger = require("../core/logger");
const mail = require("./mail");

/**
 * Order emails: a confirmation when an order is placed, and an update when it
 * moves to a stage the customer cares about.
 *
 * Sent in the background: the customer's request never waits for Gmail, and a
 * mail failure is logged rather than failing the order. Each kind honours the
 * store's on/off switch in Settings → Notifications.
 */

/** Stages worth an email. Internal steps (processing, packed) are not. */
const STATUS_EMAILS = new Set(["shipped", "out_for_delivery", "delivered", "cancelled", "refunded"]);

const settingEnabled = async (key) => {
  const settings = await prisma.settings.findUnique({ where: { key: "default" }, select: { notifications: true } });
  // No settings row yet means the defaults, which have every email switched on.
  return settings?.notifications?.[key] !== false;
};

const recipientOf = async (order) => {
  const userId = order.User?._id || order.User;
  return prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true } });
};

const runInBackground = (label, work) => {
  Promise.resolve()
    .then(work)
    .catch((error) => logger.error(`${label} email failed: ${error.message}`));
};

/** After an order is placed. */
const orderPlaced = (order) =>
  runInBackground("Order confirmation", async () => {
    if (!(await settingEnabled("orderConfirmationEmail"))) return;
    const user = await recipientOf(order);
    if (user?.email) await mail.sendOrderConfirmation({ to: user.email, name: user.firstName, order });
  });

/** After an order's status changes. */
const orderStatusChanged = (order) =>
  runInBackground("Order status", async () => {
    if (!STATUS_EMAILS.has(order.status)) return;
    if (!(await settingEnabled("orderStatusEmail"))) return;
    const user = await recipientOf(order);
    if (user?.email) await mail.sendOrderStatus({ to: user.email, name: user.firstName, order });
  });

module.exports = { orderPlaced, orderStatusChanged };
