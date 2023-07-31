const express=require('express');
const router=express.Router();
const contactController = require("../controller/ContactController");
const authToken = require('../middlewares/authToken');


router.route('/contactUs').post(contactController.createContactController)

router.route('/contactUs').get(authToken,contactController.getContactUs)

router.route('/contact/:emailId').delete(authToken,contactController.deleteContactEmail)

module.exports = router;