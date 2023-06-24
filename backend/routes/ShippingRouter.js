const express=require('express');
const router=express.Router();
const ShippingController=require("../controller/ShippingController")

router.route("/shipping").get(ShippingController.getShippingAdd);

router.route("/shipping").post(ShippingController.addNewShippingAdd);

module.exports=router;