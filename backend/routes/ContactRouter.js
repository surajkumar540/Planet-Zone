const express=require('express');
const router=express.Router();
const ContactController = require("../controller/ContactController")


router.route('/contactUs').post(ContactController.createContactController)

module.exports = router;