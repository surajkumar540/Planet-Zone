const express=require("express");
const product=require("./data/product");

const PORT=8000;
const app=express();

app.get("/",(req,res)=>{
    res.send("<h1>Howdy mowdy</h1>")
})

app.get("/getAllProducts",(req,res)=>{
    res.json(product)
})

app.listen(PORT,()=>{
    console.log("Server is running on port 8000")
})