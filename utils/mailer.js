const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILER_MAIL,
        pass: process.env.MAILER_TOKEN
    },
    socketOptions: { family: 4 } //forces for IPv4
});

module.exports = transporter;