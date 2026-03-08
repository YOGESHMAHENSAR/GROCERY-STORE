const User = require("../models/user.js");
const passport = require("passport");

module.exports.signup = async(req,res,next)=>{
    try{
        let{username, email,otp, password} = req.body;

        if(otp !== req.session.currOtp || email !== req.session.emailOtp){
            req.flash("err", "Invalid OTP or E-MAIL");
            return res.redirect("/signup");
        }
        console.log("user verified");
        let newUser = new User({email, username});
        let registeredUser = await User.register(newUser, password);
        // console.log(registeredUser);
        req.login(registeredUser,(err)=>{ // for keep login after the signup
            if(err){
                return next(err);
            }
            req.flash("signup",`Welcome ${req.body.username} to GROCERY-STORE!`);
            res.redirect("/listings");
        })
        delete req.session.currOtp;
    }catch(err){
        req.flash("err", err.message);
        res.redirect("/signup");
    }
}

module.exports.renderSignUpForm = (req,res)=>{
    // res.send("form");
    res.render("users/signup");
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login");
}

// local authentication handler
module.exports.localLogin = [
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    (req, res) => {
        try {
            req.flash("login", `Welcome back ${req.user.username} to GROCERY-STORE !`);
            const redirectUrl = res.locals.redirectUrl || "/listings";
            res.redirect(redirectUrl);
        } catch (err) {
            req.flash("err", err.message);
            res.redirect("/login");
        }
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