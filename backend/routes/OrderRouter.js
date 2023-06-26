const express=require('express');
const router=express.Router();
const orderController = require("../controller/OrderController");


router.route('/createOrder').post(orderController.createOrderController)

module.exports = router;