const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,       // ← change from 587 to 465
    secure: true,    // ← change from false to true
    auth: {
        user: "yogajm8@gmail.com",
        pass: process.env.MAILER_TOKEN
    }
});

// verify connection — check your hosted logs for this
transporter.verify((error, success) => {
    if(error) {
        console.error("Mailer error:", error.message);  // ← will show exact reason
    } else {
        console.log("Mailer ready ✅");
    }
});

module.exports = transporter;