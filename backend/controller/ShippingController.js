const Shipping=require("../models/ShippingModel");
const User=require("../models/UserModel")

const getShippingAdd=async(req,res)=>{
    try{
        const userId=req.userId;
        console.log(userId)
        const result=await Shipping.findOne({User:userId})
        
        res.status(200).json({
            data:result.shippingAddress,
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
        const {address,state,city,pinCode}=req.body;
        const user=req.userId;

        //Find if user exists or not
        const userObj=await User.findOne({_id:user})
        const shippingAddExist=await Shipping.findOne({User:user})

        if((userObj&&Object.keys(userObj).length===0)||(shippingAddExist&&Object.keys(shippingAddExist).length>0))
        { 
            res.status(200).json({
                message:"Already shipping address available",
                status:true
            })
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

        
        res.status(200).json({
            message:"Shipping address successfully added",
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