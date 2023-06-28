const nodemailer=require("nodemailer")
const dotenv=require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });

async function main({mail,subject,text}) {
    const otp=generateOTP()
    try{

        const info = await transporter.sendMail({
        from: "jaibhandari804@gmail.com", // sender address
        to: String(mail), // list of receivers
        subject: String(subject), // Subject line
        text: `${text} ${otp}`, // plain text body
        html: `${text} ${otp}`, // html body
    });
    
    console.log("Message sent: %s", info.messageId);
    }catch(error)
    {
        console.log(error);
    }
        
}


function generateOTP() {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}  
  
 module.exports= main;
  