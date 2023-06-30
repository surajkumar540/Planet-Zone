const jwt=require("jsonwebtoken")

const authToken=async(req,res,next)=>{
    try{
        const token=req.headers.authorization.split(" ")[1]
        const {id}=jwt.verify(token,process.env.SECRET_KEY)
        req.userId=id
        console.log(id)
        next()
    }catch(error)
    {
        res.status(401).json({
            message:"Unauthorized User",
            status:false
        })
    }
}

module.exports=authToken;