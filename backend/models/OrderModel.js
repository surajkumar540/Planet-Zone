const mongoose=require("mongoose");

//Schema

const orderSchema=new mongoose.Schema({
    oId:String,
    orderName:String,
    price:Number,
    date:Date
})

//Model

const Order=mongoose.model("Order",orderSchema); //orders

// Query

const createOrder=async()=>{
    try{
        const response=new Order({
            oId:String,
            orderName:String,
            price:Number,
            date:Date
        })

        const data=await response.save()
        console.log("Inserted successfully",DataTransferItem)
    }catch(err)
    {
        console.log(err.message)
    }
}