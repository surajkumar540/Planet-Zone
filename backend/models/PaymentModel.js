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
    summary:{
      orderCreationId:{
        type:String
      },
      razorpayOrderId:{
        type:String
      },
      razorpayPaymentId:{
        type:String
      },
      razorpaySignature:{
        type:String
      }
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
