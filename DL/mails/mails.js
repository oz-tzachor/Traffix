const nodemailer = require("nodemailer");
const htmlTemplates = require("./templates");
let senderDetails = "ozi380node@gmail.com <oz-tzuch>";
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
let mail = async () => {
  sendMail({
    to: "oz@umoove.me",
    subject: "Test Mail",
    text: "Hello from Test",
    html: htmlTemplates.greeting("oz"),
  });
};
let resetPassMail = async ({
  encryptedExpiry,
  encryptedUserId,
  firstName,
  email,
}) => {
  sendMail({
    to: email,
    subject: "Reset Password",
    text: "Hello from Test",
    html: htmlTemplates.resetPass({
      firstName,
      encryptedExpiry,
      encryptedUserId,
    }),
  });
};

const sendMail = async (emailDetails) => {
  await transporter.sendMail({
    from: senderDetails, // sender address
    to: emailDetails.to, // list of receivers
    subject: emailDetails.subject, // Subject line
    text: emailDetails.text, // plain text body
    html: emailDetails.html, // html body
  });
};

const mails = { mail, resetPassMail };
module.exports = mails;
