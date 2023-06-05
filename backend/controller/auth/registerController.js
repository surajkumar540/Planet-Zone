const registerController=(req,res)=>{
    //Validate
    //Email verification
    //Already exist
    //Password Cap,small,Number,Special
    res.json({
        status:true,
        message:"Sign up successfully"
    })
}

module.exports=registerController;