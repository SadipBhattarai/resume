const nodemailer = require("nodemailer");
const events = require("events");

const mailEvents = new events.EventEmitter();

const transporter = nodemailer.createTransport({
  // service: process.env.SMTP_SERVICE,
  // auth: {
  //   user: process.env.SMTP_EMAIL,
  //   pass: process.env.SMTP_PASSWORD,
  // },

  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "2d35f11e41035a",
    pass: "7941c171af2695",
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

mailEvents.on("sendEmail", async ( to, subject, message ) => {
  await sendEmail({ to, subject, message });
});

module.exports = { sendEmail, mailEvents };
