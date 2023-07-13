const express=require('express');
const router=express.Router();
const productController=require('../controller/ProductController');
const authToken=require("../middlewares/authToken")

router.route('/products').get(productController.allProductsController)

router.route('/product/:productId').get(productController.singleProductController)

router.route('/product').post(authToken,productController.addNewProduct)

router.route('/product/:productId').delete(authToken,productController.deleteSingleProduct)


module.exports=router;