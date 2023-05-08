const mongoose=require("mongoose")

const connectDb=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI)
        console.log(`Mongodb connected ${conn.connection.host}`)
    }catch(error)
    {
        console.log("Server is not connecting to db ...",error.message)
        process.exit(1); //Exit from this process 1 represents failure
    }
}



module.exports=connectDb;