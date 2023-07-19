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







const paymentSuccessController = async (req, res) => {
  try {
    const {orderCreationId,razorpayPaymentId,razorpayOrderId,razorpaySignature}=req.body;

    if(!orderCreationId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature)
    {
        res.status(409).json({
            message:"All fields are required",
            status:false
        })
    }

    const paymentObj=await Payment.find({_id:orderCreationId})
    if(!paymentObj)
    {
        res.status(401).json({
            message:"Unauthorize access",
            status:false
        }) 
    }

    const updatedPaymentObj=await Payment.findOneAndUpdate({_id:orderCreationId},{
      summary:{orderCreationId,razorpayPaymentId,razorpayOrderId,razorpaySignature},
      amount_paid:paymentObj[0]?.amount
    })

    if(!updatedPaymentObj)
    {
        res.status(404).json({
            message:"Something went wrong",
            status:false
        }) 
    }

    res.status(200).json({
      data:updatedPaymentObj,
      status: true,
    });
  } catch (error) {
    res.send(error);
  }
};








const createOrderController = async (req, res) => {
  try {
    const user = req.userId;
    const { cart, shippingAddress,paymentId } = req.body;


    const paymentObj=await Payment.find({_id:paymentId});
    console.log(paymentObj[0],"check")

    console.log(user);
    
    const response = await Order.create({
      User: user,
      orderItems: cart,
      shippingAddress: shippingAddress,
      payment: paymentObj&&paymentObj[0],
    });

    // console.log(response, "order db ka");
    res.send(req.body);
  
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Bad request",
      status: false,
    });
  }
};

module.exports = { paymentInitController,paymentSuccessController ,createOrderController };
