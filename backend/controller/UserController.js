const bcrypt=require("bcryptjs");
const User=require("../models/UserModel");
const asyncHandler=require("express-async-handler");
const jwt=require("jsonwebtoken")

const loginController=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;

    const existingUser=await User.findOne({email:email})

    if(!existingUser)
    {
        res.status(404).json({
            message:"User not found",
            status:false
        })
        return;
    }

    const matchPassword=await bcrypt.compare(password,existingUser.password);
    if(!matchPassword)
    {
        res.status(400).json({
            message:"Invalid credentials",
            status:false
        })
        return;
    }

    const token=await jwt.sign({email:existingUser.email,id:existingUser._id},process.env.SECRET_KEY)

    res.status(200).json({
        message:"User login successfully",
        user:existingUser,
        token:token,
        status:true
    })
})


const signupController=asyncHandler(async(req,res)=>{
    const {name,email,password,confirm_password}=req.body;

    //Validate
    //Email validation & verification
    //Already exist
    //Password Cap,small,Number,Speal
    
    //Check if already exist in db
    const existingUser=await User.findOne({email:email})
    if(existingUser)
    { 
        res.status(409).json({
            message:"User already exist",
            status:false
        })
        return;
    }

    if(password!==confirm_password)
    {
        res.status(409).json({
            message:"Password and confirm password not matched",
            status:false
        })
        return; 
    }

    const hashedPassword=await bcrypt.hash(password,10);

    const result=await User.create({
        name:name,
        email:email,
        password:hashedPassword
    })
    
    res.status(201).json({
        message:"User registered successfully",
        status:true,
    })
})

module.exports={
    loginController,
    signupController
}
