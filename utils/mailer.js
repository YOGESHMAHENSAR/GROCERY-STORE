const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "yogajm8@gmail.com",
        pass: process.env.MAILER_TOKEN
    }
})

module.exports = transporter;