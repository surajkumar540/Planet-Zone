const mongoose=require("mongoose");

const otpSchema=mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    registerOtpCount:{
        type:Number,
        required:true,
        default:0
    },
    forgetOtpCount:{
        type:Number,
        required:true,
        default:0
    },
    dateLimit:{
        type:Date,
        require:true,
        default:Date.now()
    }
},{timestamps:true})


const Otp=mongoose.model("Otp",otpSchema);

module.exports=Otp;