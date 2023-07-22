const mongoose= require("mongoose");
 
const shippingSchema=mongoose.Schema({
    User:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    shippingAddress:{
        fullName:{           
            type:String,
            required:true
        },
        phoneNo:{           
            type:Number,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        address:{           
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        pinCode:{
            type:Number,
            required:true
        },
        landMark:{           
            type:String,
            required:true
        }
    }
},{timestamps:true})

const Shipping=mongoose.model("Shipping",shippingSchema);
module.exports = Shipping;