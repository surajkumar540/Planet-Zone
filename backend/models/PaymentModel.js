const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    entity: {
      type: String,
    },
    amount: {
      type: Number,
    },
    amount_paid: {
      type: Number,
    },
    amount_due: {
      type: Number,
    },
    currency: {
      type: String,
    },
    attempts: {
      type: Number,
    },
    receipt: {
      type: String,
    },
    offer_id: {
      type: String,
    },
    status: {
      type: String,
    },
    created_at: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;

//   id: 'order_MCNOPThvcmvJrA',
//   entity: 'order',
//   amount: 100,
//   amount_paid: 0,
//   amount_due: 100,
//   currency: 'INR',
//   receipt: 'txn_1689052768554',
//   offer_id: null,
//   status: 'created',
//   attempts: 0,
//   notes: [],
//   created_at: 1689052768
