const Product=require('../models/ProductModel')

const allProductsController= async(req,res)=>{
    try{

        const allProducts= await Product.find()
        res.status(200).json({
            data:allProducts,
            status:true
        })
    }catch(error)
    {
        res.status(400).json({
            message:"Bad request",
            status:false
        });
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
        res.status(400).json({
            message:"Bad request",
            status:false
        });
    }
}

module.exports={
    allProductsController,
    singleProductController
}