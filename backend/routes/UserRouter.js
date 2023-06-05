const express=require('express');
const router=express.Router();
const loginController=require("../controller/auth/loginController");
const registerController=require("../controller/auth/registerController")

router.get("/login",loginController)
router.get('/signup',registerController)


module.exports=router;
