const Product=require('../../models/ProductModel')

const allProductsController=async(req,res)=>{

    const allProducts= await Product.find()
    res.status(200).json({
        data:allProducts,
        status:true
    })

}

module.exports=allProductsController;