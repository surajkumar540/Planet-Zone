const loginController=(req,res)=>{
    res.json({
        status:true,
        message:"You are login successfully"
    })
}


const registerController=(req,res)=>{
    const {name,email,password,confirm_password}=req.body;
    console.log(name,email,password,confirm_password)
    //Validate
    //Email verification
    //Already exist
    //Password Cap,small,Number,Special
    res.json({
        status:true,
        message:"Sign up successfully"
    })
}

module.exports={
    loginController,
    registerController
}