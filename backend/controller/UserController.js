const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const mail = require("../config/mail");
const Otp = require("../models/OtpModel");
const functions = require("../utils/functions");

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
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
        isVerified: false,
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

    const token = await jwt.sign({ id: existingUser._id, admin: existingUser.isAdmin }, process.env.SECRET_KEY, { expiresIn: "7d" });

    res.status(200).json({
      message: "User login successfully",
      isAdmin: existingUser.isAdmin,
      userId: existingUser._id,
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
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !email || !password || !confirmPassword) {
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

      // Date limit at Otp Model will also set represent the time when otp data will create
      const response = await Otp.create({
        email: email,
        otp: otp,
        registerOtpCount: 1,
      });

      //Create User in Database
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
      });

    } else {

      // Limit for one day in otp is 3 times
      if (otpExist.registerOtpCount >= 3) {

        const todayDate = new Date().getTime(); // Today's time
        const dateLimit = new Date(otpExist.dateLimit).getTime(); // Time when otp data created

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

        // Increase registerOtpCount by 1
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

    mail(mailObj); // Send mail by mail function

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












// For token verification
const tokenVerificationController = async (req, res) => {
  try {
    const body = req.body;
    const admin = body.admin === 'true' ? true : false;

    const token = req.headers.authorization.split(" ")[1];
    if (token) {
      const jwtResponse = jwt.verify(token, process.env.SECRET_KEY)

      if (Object.keys(jwtResponse).length > 0 && jwtResponse.admin === admin) {
        res.status(200).json({
          message: "Token is valid",
          status: true
        });
      } else {
        res.status(401).json({
          message: "Unauthorized user",
          status: false,
        });
      }
    }
    else {
      res.status(401).json({
        message: "Unauthorized user",
        status: false,
      });
    }
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized user",
      status: false,
    });
  }
};













// Otp send to verify email
const otpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
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

      //Create token for new user
      const token = await jwt.sign(
        { id: existingUser._id },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
      );

      // Update user email to verified and clear otp document data
      const user = await User.findOneAndUpdate({ email: email }, { emailVerify: true });
      const otp = await Otp.findOneAndUpdate({ email: email }, { otp: "" });
      
      res.status(200).json({
        token: token,
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

    if (!email) {
      res.status(404).json({
        message: "Enter your email",
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
        message: "Please verify your account",
        status: false,
      });
    }

    //Check if otp already exist
    const otpExist = await Otp.findOne({ email: email });
    const otp = functions.generateOTP();

    if (!otpExist) {

      // Date limit at Otp Model will also set represent the time when otp document will create
      const response = await Otp.create({
        email: email,
        otp: otp,
        forgetOtpCount: 1,
        registerOtpCount: 0,
      });

    } else {
      if (otpExist.forgetOtpCount >= 4) {

        const todayDate = new Date().getTime(); // Current time
        const dateLimit = new Date(otpExist.dateLimit).getTime(); // Time at document created 1st time

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

        const response = await Otp.findOneAndUpdate({ email: email }, { otp: otp, forgetOtpCount: otpExist.forgetOtpCount + 1 });

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
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
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
    if (!otpExist.otp) {

      //If otp not exists on collection
      res.status(404).json({
        message: "Please try again",
        status: false,
      });
      return;

    }
    else if (otpExist.otp !== String(otp)) {
      //If otp didn't matched
      res.status(404).json({
        message: "Otp not matched",
        status: false,
      });
      return;
    }

    //If everything is good then change password and update user document
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate({ email: email }, { password: hashedPassword })

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
    const userId = req.userId;

    if (!userId) {
      res.status(404).json({
        message: "Something is wrong",
        status: false,
      });
      return;
    }

    const existingUser = await User.findOne({ _id: userId });
    const userDetailsObj = {
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      gender: existingUser.gender,
      linkedIn: existingUser.linkedIn,
      twitter: existingUser.twitter,
      phoneNo: existingUser.phoneNo,
      address: existingUser.address
    }

    res.status(201).json({
      data: userDetailsObj,
      status: true,
    });


  }
  catch (error) {

    res.status(404).json({
      message: "Something is wrong",
      status: false,
    });
  }
};













//Set details of User Profile
const setProfileController = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName = "", lastName = "", gender = "", phoneNo = "", linkedIn = "", twitter = "", address = "" } = req.body;

    if (!userId) {
      res.status(404).json({
        message: "Something is wrong",
        status: false,
      });
      return;
    }

    const user = await User.findOneAndUpdate({ _id: userId }, {
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      linkedIn: linkedIn,
      twitter: twitter,
      phoneNo: phoneNo,
      address: address
    });

    res.status(200).json({
      message: "Data updated successfully",
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
  tokenVerificationController,
  otpController,
  forgetOtpController,
  changePasswordController,
  getProfileController,
  setProfileController
};
