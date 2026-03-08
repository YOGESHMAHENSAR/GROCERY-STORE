const express = require("express");
const List = require("../models/listings.js");
const User = require("../models/user.js");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

router.get("/cart", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate("cart.product");
        
        const cart = user.cart.filter(item => item.product !== null);        
        res.render("cart/index", { cart });
    } catch(err) {
        console.error("GET cart error:", err.message);
        next(err);
    }
});

// add item to cart

router.post("/cart/:id", isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const productId = req.params.id;

        const existingItem = user.cart.find(item => 
            item.product.toString() === productId
        );

        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cart.push({ product: productId, quantity: 1 });
        }

        const saved = await user.save();

        req.flash("success", "Item added to cart!");
        res.redirect("/cart");
    } catch(err) {
        console.error("ERROR:", err.message);
        req.flash("err", err.message);
        res.redirect("back");
    }
});

router.delete("/cart/:id",isLoggedIn ,async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $pull: {cart: {product: req.params.id}} //remove by product id
    });
    req.flash("success", "Item removed from Cart!");
    res.redirect('/cart');
})
// router.delete("/cart",isLoggedIn ,async(req,res)=>{
//     await User.deleteMany({});
//     req.flash("success", "Cart Emptied!");
//     res.redirect('/cart');
// })

module.exports = router;