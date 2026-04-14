const express = require("express");
const List = require("../models/listings.js");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwnerRole, isOwner, validateListing, isAnyOwner} = require("../middleware.js");
const listingController = require("../controllers/listings.js")

const multer = require("multer");

const {storage} = require("../cloudConfig.js");
const { findById } = require("../models/user.js");

const upload = multer({storage});

router.route("/")
    .get(wrapAsync(listingController.index)) //show all listing
    .post(isLoggedIn,validateListing,upload.single("listing[image]") ,wrapAsync(listingController.validate)) //new field route post req

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
router.get("/new",isLoggedIn,isAnyOwner, (req,res)=>{
    res.render("listings/new");
})

//Inventroy
router.get("/inventory",isAnyOwner,isLoggedIn, async (req,res)=>{
    try{
        const lists = await List.find({});
        res.render("listings/inventory", {lists});
    }catch(e){
        req.flash("error","Error in Inventory");
        res.redirect("/listings");
    }
})

router.patch("/inventory/:id/stock", isAnyOwner, isLoggedIn, async (req,res)=>{
    try{
        const {inStock} = req.body;
        const listing = await List.findByIdAndUpdate(
            req.params.id, //finds the product on the basis of the productId
            {inStock}, // save current inStock value either true or false to the db
            {new: true} // return the updated value
        );
        if(!listing) return res.status(404).json({success: false, message: "404 Product not found"});
        res.json({success: true, message: "Stock Updated", inStock: listing.inStock})
        // here the inStock: listing.inStock here the updated inStock value will be sent to the frontend 
    }
    catch(e){
        res.json({success: false, message: e.message});
    }

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