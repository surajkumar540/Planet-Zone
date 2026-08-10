const crypto = require("crypto");
const Razorpay = require("razorpay");
const env = require("../config/env");
const AppError = require("../core/AppError");
const logger = require("../core/logger");
const Payment = require("../models/PaymentModel");
const { PAYMENT_STATUS } = require("../constants/orderStatus");

let cachedClient = null;

const isConfigured = () => Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_SECRET);

const getClient = () => {
  if (!isConfigured()) {
    throw AppError.internal("Online payments are not configured");
  }
  if (!cachedClient) {
    cachedClient = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_SECRET,
    });
  }
  return cachedClient;
};

/**
 * Creates a gateway order for `amount` (major currency units) and mirrors it
 * locally so the callback can be matched against a known intent.
 */
const createPaymentIntent = async ({ amount, userId }) => {
  if (!(amount > 0)) throw AppError.badRequest("Amount must be greater than zero");

  const client = getClient();
  const order = await client.orders.create({
    // The gateway works in the smallest currency unit.
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `txn_${Date.now()}`,
  });

  await Payment.create({
    _id: order.id,
    User: userId,
    entity: order.entity,
    amount: order.amount,
    amount_due: order.amount_due,
    amount_paid: order.amount_paid,
    currency: order.currency,
    receipt: order.receipt,
    offer_id: order.offer_id,
    status: order.status,
    attempts: order.attempts,
    created_at: order.created_at,
    paymentStatus: PAYMENT_STATUS.PENDING,
  });

  return { order, keyId: env.RAZORPAY_KEY_ID };
};

/**
 * Recomputes the HMAC the gateway signs its callback with.
 *
 * Without this check any caller could post arbitrary identifiers and have a
 * payment marked as settled.
 */
const isSignatureValid = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(String(razorpaySignature));

  return (
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  );
};

/**
 * Verifies and settles a payment callback.
 *
 * The intent must exist, belong to the caller, and carry a signature that
 * matches the gateway secret before the payment is marked paid.
 */
const confirmPayment = async ({
  userId,
  orderCreationId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const intent = await Payment.findById(orderCreationId);
  if (!intent) throw AppError.notFound("Unknown payment reference");

  if (intent.User && String(intent.User) !== String(userId)) {
    logger.warn("Payment confirmation attempted by a different user", {
      paymentId: orderCreationId,
      userId,
    });
    throw AppError.forbidden();
  }

  // Already settled: return the existing result instead of double-processing.
  if (intent.verified) {
    return intent;
  }

  if (orderCreationId !== razorpayOrderId) {
    throw AppError.badRequest("Payment reference mismatch");
  }

  if (!isSignatureValid({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
    intent.paymentStatus = PAYMENT_STATUS.FAILED;
    intent.failureReason = "Signature verification failed";
    await intent.save();

    logger.error("Razorpay signature verification failed", {
      paymentId: orderCreationId,
      userId,
    });
    throw AppError.badRequest("Payment verification failed");
  }

  intent.verified = true;
  intent.verifiedAt = new Date();
  intent.paymentStatus = PAYMENT_STATUS.PAID;
  intent.amount_paid = intent.amount;
  intent.amount_due = 0;
  intent.status = "paid";
  intent.summary = {
    orderCreationId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  };
  await intent.save();

  return intent;
};

/** Fetches a settled, verified intent belonging to the caller. */
const getVerifiedPayment = async (paymentId, userId) => {
  const payment = await Payment.findById(paymentId).lean();
  if (!payment) throw AppError.notFound("Unknown payment reference");
  if (payment.User && String(payment.User) !== String(userId)) throw AppError.forbidden();
  if (!payment.verified) throw AppError.badRequest("This payment has not been verified");
  return payment;
};

module.exports = {
  isConfigured,
  createPaymentIntent,
  confirmPayment,
  getVerifiedPayment,
  isSignatureValid,
};
