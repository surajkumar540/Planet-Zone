const express=require('express');
const router=express.Router();
const productController=require('../controller/ProductController');

router.route('/products').get(productController.allProductsController)

router.route('/product/:productId').get(productController.singleProductController)


module.exports=router;