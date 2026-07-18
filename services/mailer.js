const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

transporter.verify(function (error, sucess) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email Server is ready to take our messages");
  }
});
const sendEmail = async ({ to, subject, message }) => {
  await transporter.sendMail({
    from: `"Buildme AI" <no-reply@bulild.ai>`,
    to,
    subject,
    html: message,
  });
};

module.exports = { sendEmail };
