const express=require('express');
const router=express.Router();
const asyncHandler = require('express-async-handler')
const allProductsController=require('../controller/products/allProductsController')
const singleProductController=require('../controller/products/singleProductController')
// const products=require('../data/product') // Static product json data

router.get("/products",asyncHandler(allProductsController))

router.get("/product/:productId",asyncHandler(singleProductController))


module.exports=router;