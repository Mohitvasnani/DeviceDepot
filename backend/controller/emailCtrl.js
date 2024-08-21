const nodemailer = require('nodemailer')
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/userModels')
const {setOtp, getOtp, deleteOtp } = require('../otpStore')
require('dotenv').config()

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP as a string
};
const sendEmail = async(req,res)=>{
    const {email} = req.body
    const otp = generateOTP()
    const otpExpiry = Date.now() + 15*60*1000
    setOtp(email,otp,otpExpiry)


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "demouser2002call2@gmail.com",
          pass: "cbyb cgcl wqin szdf"
        }
      });
    
      const mailOptions = {
        from: "demouser2002call2@gmail.com",
        to: email,
        subject: 'Your OTP for Password Reset',
        text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`
      };
    
      try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to email' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

    const verifyOTP = (req, res) => {
      const { email, otp } = req.body;
      const storedOtp = getOtp(email);
    
      if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiry < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
    
      res.status(200).json({ message: 'OTP verified' });
    };
    
    const changePassword = async (req, res) => {
      const { email, otp, newPassword } = req.body;
      const storedOtp = getOtp(email);
    
      if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiry < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
    
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Hash the new password before saving it
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    
        user.password = hashedPassword;
        await user.save();
    
        deleteOtp(email);
    
        res.status(200).json({ message: 'Password changed successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

    
    
    module.exports = {sendEmail, verifyOTP, changePassword}


    
