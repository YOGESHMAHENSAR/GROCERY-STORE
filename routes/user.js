const express = require("express");
const User = require("../models/user.js");
const router = express.Router();
const {saveRedirectUrl, isLoggedIn} = require("../middleware.js");
const userController = require("../controllers/user.js")
const wrapAsync = require("../utils/wrapAsync.js")
const passport = require("passport");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const sendOTP = require('../utils/mailer.js'); // your mailer file

const transporter = require("../utils/mailer.js");
const { date } = require("joi");

//local auth

// signup for local

router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signup));

router.post('/getotp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit OTP

    const sent = await sendOTP(email, otp);

    if (!sent) {
        return res.json({ success: false, message: "Failed to send OTP" });
    }

    // store OTP in session
    req.session.otp = otp;
    req.session.expiryOtp = Date.now() + 5 * 60 * 1000; //session form for the expiry of otp (time in mili_second)
    req.session.save((err) =>{
        if(err) res.json({success: false, message: "ERROR: SESSION ERROR"})
        else res.json({ success: true, message: "OTP sent successfully"})
    })
    req.session.otpEmail = email;
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

//for address of the user

router.get("/profile/address", isLoggedIn, async (req,res)=>{
    // let response = await geocodingClient.reverseGeocode({
    //     query: [75.7878, 26.9196 ]
    //     // longitude: -73.990593,
    //     // latitude: 40.740121
    // })
    // .send();

    // console.log(response.body.features);
    // res.send("done!");
    res.render("users/address");
})

router.post("/profile/address", async(req,res)=>{
    try{
        const { street, state, pincode, city } = req.body;
        await User.findByIdAndUpdate(req.user._id, {address: { street, state, pincode, city }});
        req.flash("login", "Address Saved successfully!");
        res.redirect("/cart");
     }catch(err) {
        req.flash("error", err.message);
        res.redirect("/profile/address");
     }
})

router.post("/profile/address/detect",isLoggedIn, async (req,res)=>{
    // console.log("req.body: ", req.body);
    const {lat, lng} = req.body;
    // console.log("recieved: ", lat,lng);

    if(!lat || !lng){
        console.log("missing cordes");
        return res.json({success: false, message: "Co-ordinates missing"});
    }
    try{
        const geoResponse = await geocodingClient.reverseGeocode({
            query: [parseFloat(lng), parseFloat(lat)]
        }).send();

        const features = geoResponse.body.features;

        if(!features || features.length === 0){
            return res.json({success: false, message: "Address Not Found!"});
        }

        const context = features[0].context;

        const address = {
            street: features[0].text || "",
            pincode: context.find(c => c.id.startsWith("postcode"))?.text || "",
            city: context.find(c => c.id.startsWith("place"))?.text || "",
            state: context.find(c => c.id.startsWith("region"))?.text || "",
        }

        res.json({success: true, address});

    }catch(err){
        console.log(err);
        res.json({success: false, message: err.message});
    }
})

module.exports = router;