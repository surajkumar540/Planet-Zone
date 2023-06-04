const mongoose=require("mongoose");
const dotenv=require("dotenv");
const users=require("./data/users");
const products=require('./data/product');
const User=require("./models/UserModel");
const Product=require("./models/ProductModel");
const connectDb=require("./config/config");
const Order=require("./models/OrderModel");

dotenv.config()
connectDb();

const importData=async()=>{
    try{
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany()

        const createUser=await User.insertMany(users)
        const adminUserId=createUser[0]._id;
        const sampleProductData=products.map((item)=>{
            return {...item,User:adminUserId}
        })
        await Product.insertMany(sampleProductData)
        console.log('Data Imported successfully')
    }catch(error)
    {
        console.log(error)
        process.exit(1)
    }
}

const dataDestroy=async()=>{
    try{
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany()
        console.log("Data destroyed successfully")
    }catch(error)
    {
        console.log(error)
        process.exit(1)
    }
}

if(process.argv[2]==='-d')
{
    dataDestroy()
}else{
    importData()
}


