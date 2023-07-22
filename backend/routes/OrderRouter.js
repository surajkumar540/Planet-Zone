const express=require('express');
const router=express.Router();
const orderController = require("../controller/OrderController");

router.route("/paymentInit").post(orderController.paymentInitController);

router.route("/paymentSuccess").post(orderController.paymentSuccessController);

router.route('/createOrder').post(orderController.createOrderController)

router.route('/orders').get(orderController.getAllOrdersController)

router.route('/order/:orderId').get(orderController.getSingleOrderController)

module.exports = router;