const { z } = require("zod");
const { listQuery, idParam, objectId } = require("../../utils/schemas");
const { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES } = require("../../constants/orderStatus");

/**
 * Only identity and quantity are accepted from the client. Prices are looked
 * up server-side, so any money fields the client sends are ignored.
 */
const cartLineSchema = z.object({
  _id: objectId.optional(),
  product: objectId.optional(),
  qty: z.coerce.number().int().min(1).max(100),
});

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  phoneNo: z.coerce.number().int().positive(),
  state: z.string().trim().min(1, "State is required"),
  address: z.string().trim().min(1, "Address is required").max(500),
  city: z.string().trim().min(1, "City is required"),
  pinCode: z.coerce.number().int().positive(),
  landMark: z.string().trim().max(200).optional().default(""),
});

const createOrderSchema = z
  .object({
    cart: z.array(cartLineSchema).min(1, "Your cart is empty"),
    shippingAddress: shippingAddressSchema,
    onlinePayment: z.coerce.boolean().default(false),
    // The checkout screen sends `{}` for cash on delivery; normalise any
    // non-string placeholder to "absent".
    paymentId: z.preprocess(
      (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
      z.string().optional()
    ),
  })
  .refine((value) => !value.onlinePayment || Boolean(value.paymentId), {
    message: "Payment reference is required for online payments",
    path: ["paymentId"],
  });

const paymentInitSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
});

const paymentSuccessSchema = z.object({
  orderCreationId: z.string().trim().min(1),
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

const listOrdersQuery = listQuery.extend({
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUS_VALUES).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
  note: z.string().trim().max(500).optional(),
});

const cancelOrderSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

module.exports = {
  createOrderSchema,
  paymentInitSchema,
  paymentSuccessSchema,
  listOrdersQuery,
  updateStatusSchema,
  cancelOrderSchema,
  orderIdParam: idParam("id"),
};
