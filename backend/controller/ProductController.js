const Product=require('../models/ProductModel')
const User=require("../models/UserModel");

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


const addNewProduct=async(req,res)=>{
    try{
        const user = req.userId;
        const productBody=req.body;

        const adminUser=await User.findOne({_id:user});
        if(!adminUser?.isAdmin)
        {
            res.status(401).json({
                message:"Unauthorized User",
                status:false
            })
            return;
        }
    
        const product=await Product.create(productBody);
        res.status(200).json({
            message:"Product created successfully",
            status:true
        })
    }catch(error)
    {
        console.log(error)
        res.status(400).json({
            message:"Bad request",
            status:false
        });
    }
}



const updateSingleProduct=async(req,res)=>{
    try{
        const user = req.userId;
        const {_id,countInStock,price,category,discount,gst,totalPrice,image,description}=req.body;

        if(!_id||!countInStock||!price||!category||!discount||!gst||!totalPrice||!image||!description)
        {
            res.status(409).json({
                message:"Something is missing",
                status:false
            })
            return;
        }

        const adminUser=await User.findOne({_id:user});
        if(!adminUser?.isAdmin)
        {
            res.status(401).json({
                message:"Unauthorized User",
                status:false
            })
            return;
        }
    
        const product=await Product.findOneAndUpdate({_id:_id},{countInStock:countInStock,price:price,discount:discount,gst:gst,totalPrice:totalPrice,image:image,description:description,category:category});


        res.status(200).json({
            message:"Product Updated successfully",
            status:true
        })
    }catch(error)
    {
        console.log(error)
        res.status(400).json({
            message:"Bad request",
            status:false
        });
    }
}



const deleteSingleProduct=async(req,res)=>{
    try{
        const user = req.userId;
        const productId=req.params.productId
        const adminUser=await User.findOne({_id:user});
        if(!adminUser.isAdmin)
        {
            res.status(401).json({
                message:"Unauthorized User",
                status:false
            })
            return;
        }
        const product=await Product.findOne({_id:productId});
        if(!product)
        {
            res.status(409).json({
                message:"Product not exist",
                status:false
            })
            return;
        }

        await Product.findOneAndRemove({_id:productId});
        
        res.status(200).json({
            message:"Deleted successfully",
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
    singleProductController,
    addNewProduct,
    deleteSingleProduct,
    updateSingleProduct
}