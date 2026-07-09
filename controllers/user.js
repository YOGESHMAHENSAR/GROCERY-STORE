const User = require("../models/user.js");
const passport = require("passport");
const mergeGuestCart = require("../utils/mergecart.js");
const admin = require("../utils/firebase.js"); // ← add this at top of file
const { getAuth } = require("../utils/firebase.js")
module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password, 
              street, city, state, pincode, 
              phone, firebaseToken } = req.body;  // ← replace otp with firebaseToken

        // ── Verify Firebase phone token ──────────────────────
        const decoded = await admin.getAuth().verifyIdToken(firebaseToken);

        if (decoded.phone_number !== `+91${phone}`) {
            req.flash("err", "Phone verification failed! Please try again.");
            return res.redirect("/signup");
        }
        // ────────────────────────────────────────────────────

        // ✅ Save guest cart BEFORE registering
        const guestCart = req.session.cart || [];

        let newUser = new User({ 
            email, 
            username, 
            phone, 
            address: { street, city, state, pincode } 
        });
        
        let registeredUser = await User.register(newUser, password);

        req.login(registeredUser, async (err) => {
            if (err) return next(err);

            // ✅ Restore guest cart
            req.session.cart = guestCart;
            await mergeGuestCart(req);

            req.flash("signup", `Welcome ${username} to GROCERY-STORE!`);
            res.redirect("/listings");
        });

        // ✅ Clean up old OTP session vars (no longer needed but safe to keep)
        delete req.session.otp;
        delete req.session.otpEmail;
        delete req.session.expiryOtp;

    } catch (err) {
        req.flash("err", err.message);
        res.redirect("/signup");
    }
};

module.exports.renderSignUpForm = (req,res)=>{
    // res.send("form");
    res.render("users/signup");
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login");
}

// local authentication handler
module.exports.localLogin = [
    (req, res, next) => {
        // ✅ Save guest cart BEFORE passport wipes the session
        const guestCart = req.session.cart || [];
        
        passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }, 
        async (err, user, info) => {
            if (err) {
                // req.flash("error",err.message);
                return next(err);
            }
            if (!user) {
                req.flash("error", info?.message);
                return res.redirect("/login");
            }
            
            req.login(user, async (err) => {
                if (err) return next(err);
                
                // ✅ Restore guest cart after passport regenerates session
                req.session.cart = guestCart;
                
                await mergeGuestCart(req);
                req.flash("login", `Welcome back ${req.user.username} to GROCERY-STORE!`);
                const redirectUrl = res.locals.redirectUrl || "/listings";
                res.redirect(redirectUrl);
            });
        })(req, res, next);
    }
];

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{ // pre-defined fxn of passport for the logout 
        if(err){
            return next(err);
        }
        req.flash("signup","Logged Out!");
        res.redirect("/listings");
    })
}