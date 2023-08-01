const Razorpay = require("razorpay");
const Payment = require("../models/PaymentModel");
const Order = require("../models/OrderModel");

// First we init payment to generate order id
//Order id razorpay ki taraf se generate karne ke liye 
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




// Then if payment is successful then this will store payment details to payment collection/document
const paymentSuccessController = async (req, res) => {

  try {
    const { orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderCreationId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      res.status(409).json({
        message: "All fields are required",
        status: false
      })
    }

    const paymentObj = await Payment.find({ _id: orderCreationId })
    if (!paymentObj) {
      res.status(401).json({
        message: "Unauthorize access",
        status: false
      })
    }

    const updatedPaymentObj = await Payment.findOneAndUpdate({ _id: orderCreationId }, {
      summary: { orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature },
      amount_paid: paymentObj[0]?.amount
    })

    if (!updatedPaymentObj) {
      res.status(404).json({
        message: "Something went wrong",
        status: false
      })
    }

    res.status(200).json({
      data: updatedPaymentObj,
      status: true,
    });
  } catch (error) {
    res.send(error);
  }
};




// If payment details store in payment table then it will store cart,shipping,payment details in order collection
const createOrderController = async (req, res) => {
  try {
    const user = req.userId;
    const { cart, shippingAddress, paymentId, onlinePayment } = req.body;

    let response;
    if (onlinePayment) {
      const paymentObj = await Payment.find({ _id: paymentId });
      response = await Order.create({
        User: user,
        orderItems: cart,
        shippingAddress: shippingAddress,
        payment: paymentObj && paymentObj[0],
        onlinePayment: true
      });
    } else {
      response = await Order.create({
        User: user,
        orderItems: cart,
        shippingAddress: shippingAddress,
        onlinePayment: false
      });

    }


    res.status(200).json({
      message: "Order created successfully",
      orderId: response._id,
      status: true
    })

  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: "Bad request",
      status: false,
    });
  }
};





//Get any order full details
const getAllOrdersController = async (req, res) => {
  try {
    const userId = req.userId;
    const allOrders = await Order.find({ User: userId });

    res.status(200).json({
      data: allOrders,
      status: true
    })
  } catch (error) {
    console.log(error)
    res.send("Problem")
  }
}




//Get any order full details
const getSingleOrderController = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const orderObj = await Order.findOne({ _id: orderId });
    delete orderObj.User;

    res.status(200).json({
      data: orderObj,
      status: true
    })
  } catch (error) {
    console.log(error)
    res.send("Problem")
  }
}

module.exports = { paymentInitController, paymentSuccessController, createOrderController, getAllOrdersController, getSingleOrderController };
