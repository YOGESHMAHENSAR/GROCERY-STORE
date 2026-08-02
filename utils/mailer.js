const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (toEmail, otp) => {
    try {
        const { error } = await resend.emails.send({
            from: '"YOGESH SINGH" <onboarding@resend.dev>',  // free tier, no domain needed
            to: toEmail,
            subject: `OTP - for SignUp at <b>GROCERY-STORE</b>`,
            html: `
                <h2>GROCERY-STORE</h2>
                <p>Your OTP code is:</p>
                <h1 style="color: green;">${otp}</h1>
                <p>This OTP is valid for 5 minutes. <b>Do Not Share</b> with anyone.</p>
            `
        });

        if (error) {
            console.error("Resend error:", error);
            return false;
        }

        console.log("OTP sent ✅");
        return true;

    } catch (err) {
        console.error("sendOTP error:", err.message);
        return false;
    }
};

module.exports = sendOTP;