const express=require('express');
const router=express.Router();
const userController=require('../controller/UserController')

router.route('/login').post(userController.loginController)

router.route('/signup').post(userController.signupController)

router.route('/otpVerify').post(userController.otpController);

router.route('/forgetOtp').post(userController.forgetOtpController);

module.exports=router;
