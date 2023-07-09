const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_ID,
      pass: "cukpwrzdwtoifakk"
    }
  });

  /*
const mailOptions = {
  from: 'your-email@gmail.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'This is a test email sent using Nodemailer and Gmail.'
};


  */
module.exports.sendEmail = (mailOptions)=>{
    return new Promise((resolve, reject)=>{
      console.log("Sending email")
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Emaik sending failked error =====>", error)
              return reject({error})
            } else {
                console.log("Email sending successful ", info)
              return resolve({info})
            }
          });
    })
}