const mongoose= require("mongoose");
 
const shippingSchema=mongoose.Schema({
    User:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    shippingAddress:[{
        address:{           
            type:String,
            required:true
        },
        state:{
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
        }
    }]
},{timestamps:true})

const Shipping=mongoose.model("Shipping",shippingSchema);
module.exports = Shipping;