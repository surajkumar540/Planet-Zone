const mongoose=require("mongoose");

const orderSchema=mongoose.Schema({
    User:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    orderItems:[
        {
            _id:{
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

    // {
    //     summary: {
    //       orderCreationId: 'order_MFVblcMTVnT7DS',
    //       razorpayPaymentId: 'pay_MFVbuSFDxUeJat',
    //       razorpayOrderId: 'order_MFVblcMTVnT7DS',
    //       razorpaySignature: 'eacc3e7b6680cd383677a768b184a7f5aa5b4757a32cd4c3393c317fed93e6dc'
    //     },
    //     _id: 'order_MFVblcMTVnT7DS',
    //     entity: 'order',
    //     amount: 1500,
    //     amount_paid: 1500,
    //     amount_due: 1500,
    //     currency: 'INR',
    //     attempts: 0,
    //     receipt: 'txn_1689736719855',
    //     offer_id: null,
    //     status: 'created',
    //     created_at: 1689736720,
    //     createdAt: 2023-07-19T03:18:40.405Z,
    //     updatedAt: 2023-07-19T03:19:00.573Z,
    //     __v: 0
    //   }

    payment:{
        _id:{
            type:String,
            default:null
        },
        entity:{
            type:String,
            default:""
        },
        amount:{
            type:Number, 
            default:0
        },
        amount_paid:{
            type:Number,
            default:0
        },
        amount_due:{
            type:Number,
            default:0
        },
        currency:{
            type:String,
            default:""
        },
        attempts:{
            type:Number,
            default:0
        },
        offer_id:{
            type:String,
            default:""
        },
        status:{
            type:String,
            default:""
        },
        created_at:{
            type:Number,
            default:0
        },
        summary:{
            orderCreationId:{
                type:String,
                default:""
            },
            razorpayPaymentId:{
                type:String,
                default:""
            },
            razorpayOrderId:{
                type:String,
                default:""
            },
            razorpaySignature:{
                type:String,
                default:""
            },
        }
    }
    
},{timestamps:true});

const Order=mongoose.model("Order",orderSchema);

module.exports=Order