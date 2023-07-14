const express=require('express');
const router=express.Router();
const orderController = require("../controller/OrderController");

router.route("/paymentInit").post(orderController.paymentInitController);

router.route("/paymentSuccess").post(orderController.paymentSuccessController);

router.route('/createOrder').post(orderController.createOrderController)

module.exports = router;