const express=require("express");
const products=require("./data/product")
const path=require("path")

const app=express();
const port=4000||port.env;

app.get("/",(req,res)=>{
    res.send("<h5>Hello boi</h5>")
})

app.get("/products",(req,res)=>{
    res.json(products)
})


app.listen(port,()=>{
    console.log("Server is working on port ",port);
})