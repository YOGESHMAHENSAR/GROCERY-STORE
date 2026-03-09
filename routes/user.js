const express = require("express");
const User = require("../models/user.js");
const router = express.Router();
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/user.js")
const wrapAsync = require("../utils/wrapAsync.js")
const passport = require("passport");

const transporter = require("../utils/mailer.js")

//local auth

// signup for local

router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signup));

router.post("/getotp", async(req, res) => {
    try {
        console.log("req.body:", req.body);
        const { email } = req.body;
        console.log("email:", email);

        const otp = Math.floor(1000 + Math.random() * 9000);
        req.session.currOtp = otp.toString();
        req.session.emailOtp = email;

        const info = await transporter.sendMail({
            from: '"YOGESH SINGH" <yogajm8@gmail.com>',
            to: email,
            subject: 'Welcome - GROCERY STORE',
            html: `<h3>Your OTP for GROCERY STORE is: <b>${otp}</b></h3>`,
        });
        console.log("mail sent:", info.response);
        res.status(200).json({ message: "OTP sent Successfully" });
    } catch(err) {
        console.error("sendMail error:", err.message);  // ← now this will print
        res.status(500).json({ message: err.message });
    }
});

// login for local

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, userController.localLogin);


//for logout

router.get("/logout",userController.logout)

//google auth 

router.get("/auth/google", (req, res, next) => {
    req.session.intent = req.query.intent || "login";
    req.session.save((err) => {
        if(err) return next(err);
        next();
    });
}, passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {
        const intent = req.session.intent || "login";
        if(intent === "signup"){
            req.flash("signup", `Welcome ${req.user.username} to GROCERY-STORE!`);
        } else {
            req.flash("signup", `Welcome back ${req.user.username}!`);
        }
        delete req.session.intent;
        res.redirect("/listings");
    }
);

module.exports = router;