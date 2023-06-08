const express=require('express');
const router=express.Router();
const userController=require('../controller/UserController')

router.route('/login').get(userController.loginController)

router.route('/signup').post(userController.registerController)

module.exports=router;
