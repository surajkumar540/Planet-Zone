const express=require("express");
const products=require("./data/product")
const connectDb=require("./config/config")
const dotenv=require("dotenv");
dotenv.config();

// connectDb()//Connecting to mongo db database
const app=express();

app.get("/",(req,res)=>{
    res.send("<h5>Hello boi</h5>")
})

app.get("/products",(req,res)=>{
    res.json({
        data:products,
        status:true
    })
})

const PORT=4000;
app.listen(process.env.PORT||PORT,()=>{
    console.log(`${process.env.NODE_ENV} Server is working on ${process.env.PORT} `);
})