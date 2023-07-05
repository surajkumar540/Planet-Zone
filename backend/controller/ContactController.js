
const ContactUs = require("../models/ContactUsModal");

const createContactController = async (req, res) => {

    try {
        const { name, email, phoneNo, address, city,message } = req.body;

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
        else {
            console.log(req.body);
            res.status(200).json({
                message: "message send succussfully",
                status: true
            });
        }

        //Create ContactUs in Database

        const result = await ContactUs.create({
            name: name,
            email: email,
            phoneNo: phoneNo,
            address: address,
            city: city,
            message:message
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

module.exports = { createContactController };