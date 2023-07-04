
const contact = require("../models/ContactUsModal");


const createContactController = async(req,res)=>{   
    
    try{
        const {name, email, phoneNo, address,city}=req.body;
        console.log(req.body);
    }
    catch(error){
        console.log(error)
        res.status(400).json({
            message:"Bad request",
            status:false
        });
    }
}

module.exports = {createContactController};