const Order = require('../models/OrderModel');

const createOrderController = async(req,res)=>{   
    
    try{
        const user=req.userId;
        const {
            cart,
            shippingAddress,
            paymentMethod
        } = req.body;

        const cartArr=cart.map((item)=>{
            item.Product=item._id
            delete item._id
            console.log(item);
            return item
        })
        console.log(user)
        const response=await Order.create({
            User:user,
            orderItems:cartArr,
            shippingAddress:shippingAddress,
            paymentMethod:paymentMethod
        })

        console.log(response,"order db ka")
        res.send(req.body)        
    }
    catch(error){
        console.log(error)
        res.status(400).json({
            message:"Bad request",
            status:false
        });
    }
}

module.exports = {createOrderController};