const express=require('express');
const router=express.Router();
const userController=require('../controller/UserController')
const authToken=require("../middlewares/authToken")

router.route('/login').post(userController.loginController)

router.route('/signup').post(userController.signupController)

router.route('/tokenVerification').get(userController.tokenController)

router.route('/otpVerify').post(userController.otpController);

router.route('/forgetOtp').post(userController.forgetOtpController);

router.route('/changePassword').post(userController.changePasswordController);

router.route('/profile').get(authToken,userController.getProfileController);

router.route('/profile').post(authToken,userController.setProfileController);

module.exports=router;
