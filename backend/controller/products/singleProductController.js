const Product=require('../../models/ProductModel')

const singleProductController=async(req,res)=>{
    const product=await Product.findOne({_id:req.params.productId});
    
    res.status(200).json({
        data:product,
        status:true
    })
}

module.exports=singleProductController;