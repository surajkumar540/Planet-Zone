const express=require("express");
const products=require("./data/product") // Static product json data
const connectDb=require("./config/config") 
const dotenv=require("dotenv");
dotenv.config();
const PORT=4000;

// connectDb()//Connecting to mongo db database
const app=express(); // To make server from express 

app.get("/",(req,res)=>{
    res.send("<h5>Hello boi</h5>")
})

app.get("/products",(req,res)=>{
    res.status(200).json({
        data:products,
        status:true
    })
})

app.listen(process.env.PORT||PORT,()=>{
    console.log(`${process.env.NODE_ENV} Server is working on ${process.env.PORT} `);
})