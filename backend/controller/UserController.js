const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const mail = require("../config/mail");
const Otp = require("../models/OtpModel");
const functions=require("../utils/functions")

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      res.status(404).json({
        message: "User not found",
        status: false,
      });
      return;
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      res.status(400).json({
        message: "Invalid credentials",
        status: false,
      });
      return;
    }

    const token = await jwt.sign(
      { id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "User login successfully",
      user: existingUser,
      token: token,
      status: true,
    });
  } catch (error) {
    res.status(400).json({
      message: "Something is wrong",
      status: false,
    });
  }
};

const signupController = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    //Check if user already signup
    const existingUser = await User.findOne({ email: email });
    if (existingUser?.email && existingUser?.emailVerify) {
      res.status(409).json({
        message: "User already exist",
        status: false,
      });
      return;
    }

    //Check for password and confirmPassword
    if (password !== confirmPassword) {
      res.status(409).json({
        message: "Password and confirm password not matched",
        status: false,
      });
      return;
    }

    //Check if otp already exist
    const otpExist = await Otp.findOne({ email: email });
    const otp = functions.generateOTP()

    if (!otpExist) {
      const response = await Otp.create({
        email: email,
        otp: otp,
        count: 1,
      });

      
      //Create User in Database
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
      });

    } else {

      if (otpExist.count >= 3) {
        

        const dateLimit=new Date(otpExist.dateLimit).getTime()
        const todayDate=new Date().getTime()

        //86400000 represent 1 day in millisecond if time is more than a day then reset count
        if(todayDate-dateLimit>86400000)
        {
          const response = await Otp.findOneAndUpdate({email: email},{otp:otp,count: 1});
        }
        else{
          res.status(404).json({
            message: "Email limit exceed",
            status: false,
          });
          return;
        }     
        
      } else {
        const response = await Otp.findOneAndUpdate({email: email},{otp:otp,count: otpExist.count + 1});
      }
    }

    //Send mail to User
    
    const mailObj = {
      mail: email,
      subject: "Email verification",
      text: `Your Email verification Code is ${otp}`,
    };

    mail(mailObj);


    res.status(201).json({
      message: "Otp sent successfully",
      status: true,
    });

  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: "Error in signup",
      status: false,
    });
  }
};

const otpController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    
    

    res.status(201).json({
      message: "User Registered successfully",
      status: true,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error in token verification",
      status: false,
    });
  }
};

module.exports = {
  loginController,
  signupController,
  otpController,
};
