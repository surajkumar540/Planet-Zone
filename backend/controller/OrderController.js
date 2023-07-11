const Order = require("../models/OrderModel");
const Razorpay = require("razorpay");
const Payment = require("../models/PaymentModel");

const paymentInitController = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount.lenght === 0) {
      res.status(409).json({
        message: "Amount is required",
        status: false,
      });
      return;
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `txn_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    console.log(order);

    const paymentObj = {
      _id: order.id,
      entity: order.entity,
      amount: order.amount,
      amount_due: order.amount_due,
      amount_paid: order.amount_paid,
      currency: order.currency,
      receipt: order.receipt,
      offer_id: order.offer_id,
      status: order.status,
      attempts: order.attempts,
      notes: order.notes,
      created_at: order.created_at,
    };

    const result = await Payment.create(paymentObj);

    if (!result) return res.status(500).send("Some error occured");

    res.status(200).json({
      data: order,
      KEY_ID: process.env.RAZORPAY_KEY_ID,
      status: true,
    });
  } catch (error) {
    res.send(error);
  }
};

const createOrderController = async (req, res) => {
  try {
    const user = req.userId;
    const { cart, shippingAddress, paymentMethod } = req.body;

    const cartArr = cart.map((item) => {
      item.Product = item._id;
      delete item._id;
      console.log(item);
      return item;
    });
    console.log(user);
    const response = await Order.create({
      User: user,
      orderItems: cartArr,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
    });

    console.log(response, "order db ka");
    res.send(req.body);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Bad request",
      status: false,
    });
  }
};

module.exports = { paymentInitController, createOrderController };
