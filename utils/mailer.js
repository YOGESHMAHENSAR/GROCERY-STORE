const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "yogajm8@gmail.com",
        pass: "dnygcfoywyqmstao"
    }
})

module.exports = transporter;