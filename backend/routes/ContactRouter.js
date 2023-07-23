const express=require('express');
const router=express.Router();
const ContactController = require("../controller/ContactController")


router.route('/contactUs').post(ContactController.createContactController)
router.route('/contactUs').get(ContactController.getContactUs)

module.exports = router;