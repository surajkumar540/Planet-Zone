const User=require("../models/UserModel");
const asyncHandler=require("express-async-handler")

const loginController=(req,res)=>{
    res.json({
        status:true,
        message:"You are login successfully"
    })
}


const signupController=asyncHandler(async(req,res)=>{
    const {name,email,password,confirm_password}=req.body;

    //Validate
    //Email validation & verification
    //Already exist
    //Password Cap,small,Number,Speal
    
    //Check if already exist in db
    const existingUser=await User.findOne({email:"jaibhandari804@gmail.com"})
    if(existingUser)
    {
        res.status(409).json({
            message:"User already exist",
            status:false
        })
        return;
    }

    
    res.send("yeah")
})

module.exports={
    loginController,
    signupController
}