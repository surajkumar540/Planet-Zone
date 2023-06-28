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

  async function main() {

    const info = await transporter.sendMail({
      from: "no-reply@gmail.com", // sender address
      to: "jai.singh.corporate@gmail.com", // list of receivers
      subject: "Hello Jai Singh", // Subject line
      text: "Hello world? How are you", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
  
    console.log("Message sent: %s", info.messageId);
      
}
  
 module.exports= main;
  