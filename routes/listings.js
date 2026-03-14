const express = require("express");
const List = require("../models/listings.js");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwnerRole, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js")

const multer = require("multer");

const {storage} = require("../cloudConfig.js");
const { findById } = require("../models/user.js");

const upload = multer({storage});

router.route("/")
    .get(wrapAsync(listingController.index)) //show all listing
    .post(isOwnerRole, isLoggedIn,validateListing,upload.single("listing[image]") ,wrapAsync(listingController.validate)) //new field route post req

//PROFILE
router.get("/profile",isLoggedIn,(req,res)=>{
    const user = req.user.username;
    const mail = req.user.email;
    const add = req.user.address
    res.render("listings/profile", {user,mail, add});
})

router.get("/:id/cart",async (req,res)=>{
    let {id} = req.params;
    const a = 1;
    let carts = [];
    let cart = await List.findById(id);
    if(cart){
        carts.push(cart);
    }
    res.render("listings/cart", {carts});
})

//NEW FIELD ROUTE
router.get("/new", isOwnerRole,isLoggedIn,(req,res)=>{
    res.render("listings/new");
})

// Construction page (MUST come before /:id routes)
router.get("/review",(req,res)=>{
    res.render("listings/construction");
})
router.get("/privacy",(req,res)=>{
    res.render("listings/construction");
})
router.get("/terms",(req,res)=>{
    res.render("listings/construction");
})
router.get("/details",(req,res)=>{
    res.render("listings/construction");
})

//EDIT
router.get("/:id/edit",isOwnerRole,isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm))

router.route("/:id")
    .put(isOwnerRole,isLoggedIn,isOwner,validateListing,upload.single("listing[image]") ,wrapAsync(listingController.update)) // update route
    .get(wrapAsync(listingController.show))// SHOW INTERNAL LISTING INFORMATION
    .delete(isOwnerRole,isLoggedIn,isOwner,wrapAsync(listingController.delete))// Deleting listing

module.exports = router;