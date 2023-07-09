const mongoose=require("mongoose");

const contactUsSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNo:{
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
    message:{
    type:String,
    required:true
    }
},{timestamps:true})


const ContactUs=mongoose.model("ContactUs",contactUsSchema);

module.exports=ContactUs;