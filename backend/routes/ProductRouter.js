const express=require('express');
const router=express.Router();
const asyncHandler = require('express-async-handler')
const allProductsController=require('../controller/products/allProductsController')
// const products=require('../data/product') // Static product json data

router.get("/products",asyncHandler(allProductsController))


router.get("/products/:pid",(req,res)=>{
    const product=products.find((item)=>
    {
        return item.price===Number(req.params.price)
    });
    
    res.status(200).json({
        data:product,
        status:true
    })
})


module.exports=router;