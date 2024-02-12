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
    try{

        const info = await transporter.sendMail({
        from: "jaibhandari804@gmail.com", // sender address
        to: String(mail), // list of receivers
        subject: String(subject), // Subject line
        text: `${text}`, // plain text body
        html: `${text}`, // html body
    });
    
    console.log("Message sent: %s", info.messageId);
    }catch(error)
    {
        console.log(error);
    }
        
}

 
  
 module.exports= main;
  