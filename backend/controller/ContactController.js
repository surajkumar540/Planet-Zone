
const ContactUs = require("../models/ContactUsModal");
const User=require("../models/UserModel")

const createContactController = async (req, res) => {

    try {
        const { name, email, city,message } = req.body;

        if(!name || !email || !city || !message)
        {
            res.status(404).json({
                message: "All fields are required",
                status: false,
            });
            return;
        }

        const existingUser = await ContactUs.findOne({ email: email });

        console.log(existingUser, "exist")
        //Check if user already send 
        if (existingUser) {
            res.status(409).json({
                message: "message already sent",
                status: false,
            });
            return;
        }

        //Create ContactUs in Database

        const result = await ContactUs.create({
            name: name,
            email: email,
            city: city,
            message:message
        });

        res.status(200).json({
            message: "message send succussfully",
            status: true
        });

    }
    catch (error) {
        console.log(error)
        res.status(400).json({
            message: "Bad request",
            status: false
        });
    }
}



const getContactUs=async(req,res)=>{ 
    try{
        const user=req.userId;
        const adminUser=await User.findOne({_id:user});
        if(!adminUser.isAdmin)
        {
            res.status(401).json({
                message:"Unauthorized User",
                status:false
            })
            return;
        }
        const result=await ContactUs.find()
        
        res.status(200).json({
            data:result,
            status:true
        })
    }catch(error)
    {
        res.status(500).json({
            message:"Something is wrong",
            status:false
        })
    }
}


const deleteContactEmail=async(req,res)=>{ 
    
    try{
        const emailId=req.params.emailId
        const user=req.userId;
        const adminUser=await User.findOne({_id:user});
        if(!adminUser.isAdmin)
        {
            res.status(401).json({
                message:"Unauthorized User",
                status:false
            })
            return;
        }
        
        const emailObj=await ContactUs.findOneAndRemove({_id:emailId})
        if(emailObj)
        {            
            console.log(emailObj)
            res.status(200).json({
                message:"Message deleted successfully",
                status:true
            })
        }else{

            res.status(409).json({
                message:"Message already deleted",
                status:true
            })
        }
    }catch(error)
    {
        res.status(500).json({
            message:"Something is wrong",
            status:false
        })
    }
}


module.exports={
    createContactController,
    getContactUs,
    deleteContactEmail
}