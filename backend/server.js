const express=require("express");
const connectDb=require("./config/config") 
const dotenv=require("dotenv");
const productRouter=require('./routes/ProductRouter');
const userRouter=require('./routes/UserRouter')
var bodyParser = require('body-parser')
const PORT=4000;
dotenv.config();

connectDb()//Connecting to mongo db database
const app=express(); // To make server from express use only one time at server file
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(userRouter);
app.use(productRouter);


app.listen(process.env.PORT||PORT,()=>{
    console.log(`${process.env.NODE_ENV} Server is working on ${process.env.PORT} `);
})