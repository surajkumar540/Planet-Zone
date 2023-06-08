const Product=require('../models/ProductModel')
const asyncHandler = require('express-async-handler')

const allProductsController= asyncHandler(async(req,res)=>{
    
    const allProducts= await Product.find()
    res.status(200).json({
        data:allProducts,
        status:true
    })

})

const singleProductController= asyncHandler(async(req,res)=>{
    const product=await Product.findOne({_id:req.params.productId});
    
    res.status(200).json({
        data:product,
        status:true
    })
})

module.exports={
    allProductsController,
    singleProductController
}