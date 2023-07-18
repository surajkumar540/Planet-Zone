const mongoose=require("mongoose");

const orderSchema=mongoose.Schema({
    User:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    orderItems:[
        {
            Product:{
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref:"Product"
            },
            name:{
                type:String,
                required:true
            },
            qty:{
                type:Number,
                required:true
            },
            image:{
                type:String,
                required:true
            },
            price:{
                type:Number,
                required:true
            },
            brand:{
                type:String,
                required:true
            },
            category:{
                type:String,
                required:true
            }
        }
    ],
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
    },

    // paymentMethod:{
    //     payment:{
    //         type:String,
    //         required:true
    //     },
    //     taxPrice:{
    //         type:Number,
    //         required:true,
    //         default:0.0
    //     },
    //     shippingPrice:{
    //         type:Number,
    //         required:true, 
    //         default:0.0
    //     },
    //     totalPrice:{
    //         type:Number,
    //         required:true,
    //         default:0.0
    //     },
    //     isPaid:{
    //         type:Boolean,
    //         required:true,
    //         default:false
    //     },
    //     paidAt:{
    //         type:Date
    //     },
    //     isDelivered:{
    //         type:Boolean,
    //         required:true,
    //         default:false
    //     },
    //     deliveredAt:{
    //         type:Date
    //     }
    
    // }
    
},{timestamps:true});

const Order=mongoose.model("Order",orderSchema);

module.exports=Order