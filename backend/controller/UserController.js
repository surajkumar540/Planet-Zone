const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const mail = require("../config/mail");
const Otp = require("../models/OtpModel");
const functions = require("../utils/functions");

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password)
    {
      res.status(404).json({
        message: "Something is missing",
        status: false,
      });
      return;
    }


    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      res.status(404).json({
        message: "User not found",
        status: false,
      });
      return;
    }

    //Check for user email verification
    if (!existingUser.emailVerify) {
      res.status(409).json({
        message: "Sign up to verify your account",
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

    if(!name||!email||!password||!confirmPassword)
    {
      res.status(404).json({
        message: "Something is missing",
        status: false,
      });
      return;
    }

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
    const otp = functions.generateOTP();

    if (!otpExist) {
      const response = await Otp.create({
        email: email,
        otp: otp,
        registerOtpCount: 1,
      });

      //Create User in Database
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
      });
    } else {
      if (otpExist.registerOtpCount >= 3) {
        const dateLimit = new Date(otpExist.dateLimit).getTime();
        const todayDate = new Date().getTime();

        //86400000 represent 1 day in millisecond if time is more than a day then reset count
        if (todayDate - dateLimit > 86400000) {
          const response = await Otp.findOneAndUpdate(
            { email: email },
            { otp: otp, registerOtpCount: 1 }
          );
        } else {
          res.status(404).json({
            message: "Email limit exceed",
            status: false,
          });
          return;
        }
      } else {
        const response = await Otp.findOneAndUpdate(
          { email: email },
          { otp: otp, registerOtpCount: otpExist.registerOtpCount + 1 }
        );
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
    res.status(400).json({
      message: "Error in signup",
      status: false,
    });
  }
};


// Otp send to verify email
const otpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if(!email||!otp)
    {
      res.status(404).json({
        message: "Something is missing",
        status: false,
      });
      return;
    }

    const existingUser = await User.findOne({ email: email });
    //Check if person email already verified
    if (existingUser?.emailVerify) {
      res.status(200).json({
        message: "Email already verified",
        status: true,
      });
      return;
    }

    const userOtpObj = await Otp.findOne({ email: email });

    //if otp object and api otp didn't matched
    if (userOtpObj.otp !== String(otp)) {
      res.status(404).json({
        message: "Otp did not matched",
        status: true,
      });
      return;
    }

    if (userOtpObj.otp === String(otp)) {
      const user = await User.findOneAndUpdate({ email: email },{ emailVerify: true });
      const otp = await Otp.findOneAndUpdate({ email: email },{ otp: "" });
      res.status(200).json({
        message: "Email verified successfully",
        status: true,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Error in OTP verification",
      status: false,
    });
  }
};


// Otp sent for forget password
const forgetOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    
    if(!email)
    {
      res.status(404).json({
        message: "Enter email ",
        status: false,
      });
      return;
    }


    const existingUser = await User.findOne({ email: email });

    //Check if user not found
    if (!existingUser) {
      res.status(404).json({
        message: "User not found",
        status: false,
      });
      return;
    }

    //Check if user account is verified
    if (!existingUser.emailVerify) {
      res.status(409).json({
        message: "Sign up to verify your account",
        status: false,
      });
    }

    //Check if otp already exist
    const otpExist = await Otp.findOne({ email: email });
    const otp = functions.generateOTP();

    if (!otpExist) {

      const response = await Otp.create({
        email: email,
        otp: otp,
        forgetOtpCount: 1,
        registerOtpCount: 0,
      });
    
    } else {
      if (otpExist.forgetOtpCount >= 4) {
        
        const dateLimit = new Date(otpExist.dateLimit).getTime();
        const todayDate = new Date().getTime();

        //86400000 represent 1 day in millisecond if time is more than a day then reset count
        if (todayDate - dateLimit > 86400000) {
          
          const response = await Otp.findOneAndUpdate(
            { email: email },
            { otp: otp, forgetOtpCount: 1 }
          );

        } 
        else {
          res.status(404).json({
            message: "Email limit exceed",
            status: false,
          });
          return;
        }
      } 
      else {

        const response = await Otp.findOneAndUpdate({ email: email },{ otp: otp, forgetOtpCount: otpExist.forgetOtpCount + 1 });

      }
    }

    //Send mail to User to forget your account
    const mailObj = {
      mail: email,
      subject: "Email verification",
      text: `Your Forget Email verification Code is ${otp}`,
    };

    mail(mailObj);

    
    res.status(201).json({
      message: "Forget Otp sent successfully",
      status: true,
    });


  } 
  catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something is wrong in Forget otp",
      status: false,
    });
  }
};


// Make new password
const changePasswordController = async (req, res) => {
  try {
    const { email,otp,password,confirmPassword } = req.body;
    
    if(!email || !otp|| !password|| !confirmPassword)
    {
      res.status(404).json({
        message: "Something is missing",
        status: false,
      });
      return;
    }

    const existingUser = await User.findOne({ email: email });
    //Check if user not found
    if (!existingUser) {
      res.status(404).json({
        message: "User not found",
        status: false,
      });
      return;
    }

    //Check if user account is verified
    if (!existingUser.emailVerify) {
      res.status(409).json({
        message: "Sign up to verify your account",
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
    if(!otpExist.otp)
    {
      //If otp not exists on collection
      res.status(404).json({
        message: "Please try again",
        status: false,
      });
      return;
    }
    else if(otpExist.otp!==String(otp))
    {
      //If otp didn't matched
      res.status(404).json({
        message: "Otp not matched",
        status: false,
      });
      return;
    }
    
    //If everything is good then change password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user=await User.findOneAndUpdate({email:email},{password:hashedPassword})

    res.status(201).json({
      message: "Password changed successfully",
      status: true,
    });


  } 
  catch (error) {

    res.status(404).json({
      message: "Something is wrong while changing password",
      status: false,
    });
  }
};





//Get details of User Profile
const getProfileController = async (req, res) => {
  try {
    const userId=req.userId;
    console.log(userId)
    
    if(!userId)
    {
      res.status(404).json({
        message: "Something is wrong",
        status: false,
      });
      return;
    }

    const existingUser = await User.findOne({ _id: userId });
    const userDetailsObj={
      name:existingUser.name,
      email:existingUser.email
    }

    res.status(201).json({
      data:userDetailsObj,
      status: true,
    });


  } 
  catch (error) {

    res.status(404).json({
      message: "Something is wron",
      status: false,
    });
  }
};

module.exports = {
  loginController,
  signupController,
  otpController,
  forgetOtpController,
  changePasswordController,
  getProfileController
};
