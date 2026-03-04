const express = require("express");
const User = require("../models/user.js");
const router = express.Router();
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/user.js")
const wrapAsync = require("../utils/wrapAsync.js")

//local auth

// signup for local

router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signup));

// login for local

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, userController.localLogin);


//for logout

router.get("/logout",userController.logout)

//google auth 

router.get("/auth/google",userController.googleIntent);

router.get("/auth/google/callback",userController.googleUserWelcome)

module.exports = router;