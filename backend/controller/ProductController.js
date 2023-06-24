const Product=require('../models/ProductModel')
const asyncHandler = require('express-async-handler')

const allProductsController= async(req,res)=>{
    try{

        const allProducts= await Product.find()
        res.status(200).json({
            data:allProducts,
            status:true
        })
    }catch(error)
    {
        console.log(error,"all")
    }

}

const singleProductController=async(req,res)=>{
    try{
        const product=await Product.findOne({_id:req.params.productId});
        
        res.status(200).json({
            data:product,
            status:true
        })
    }catch(error)
    {

    }
}

module.exports={
    allProductsController,
    singleProductController
}