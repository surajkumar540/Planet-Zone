const express=require('express');
const products=require('../data/product') // Static product json data
const router=express.Router();

router.get("/products",(req,res)=>{
    
    res.status(200).json({
        data:products,
        status:true
    })
})


router.get("/products/:price",(req,res)=>{
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