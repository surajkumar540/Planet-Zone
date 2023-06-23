const Shipping=require("../models/ShippingModel");
const User=require("../models/UserModel")

const getShippingAdd=async(req,res)=>{
    try{
        const userId=req.params.userId;
        console.log(userId)
        res.status(200).json({
            message:"Shipping",
            status:true
        })
    }catch(error)
    {
        res.status(500).json({
            message:"Something is wrong",
            status:false
        })
    }
}

const addNewShippingAdd=async(req,res)=>{
    try{
        const {user,address,state,city,pinCode}=req.body;

        //Find if user exists or not
        const userObj=await User.findOne({_id:user})
        const shippingAddExist=await Shipping.findOne({User:user})
        if(Object.keys(userObj).length===0||Object.keys(shippingAddExist).length>0)
        { 
            return;
        }
        
        const response=await Shipping.create({
            User:user,
            shippingAddress:[
                {
                    address,
                    state,
                    city,
                    pinCode
                }
            ]
        })

        console.log(response)
        
        res.status(200).json({
            message:"Shipping",
            status:true
        })
    }catch(error)
    {
        res.status(500).json({
            message:"Something is wrong",
            status:false
        })
    }
}


module.exports={
    getShippingAdd,
    addNewShippingAdd
}