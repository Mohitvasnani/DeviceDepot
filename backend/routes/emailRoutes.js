const express = require('express')
const {sendEmail, verifyOTP, changePassword}= require('../controller/emailCtrl')

const router = express.Router()

router.post('/send-otp', sendEmail);
router.post('/verify-otp', verifyOTP);
router.post('/change-password', changePassword);

module.exports = router;