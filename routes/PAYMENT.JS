const express = require("express");
const List = require("../models/listings.js");
const User = require("../models/user.js");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn} = require("../middleware.js");

const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

//Add order success page
router.get('/order-success', (req, res) => {
    res.render('/payment/order-success', );
});

//to create order id

router.post("/create-order",isLoggedIn, async (req,res)=>{
    try{
        const { amount } = req.body;
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `reciept_${Date.now()}`
        })
        res.json({success: true, order});
    }catch(err){
        res,json({success: false, message: err.message});
    }
})

//to verify the payment done by the user

router.post("/verify-payment", async(req,res)=>{
    try{
        const{razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body; // deconstruct the crucial info

        //signature created on our  own side.
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest(hex);

        //compare both the signature
        if(expected !== razorpay_signature){
            return res.json({success: false, message: "Payment Verification Failed!"});
        }

        //payment passed when signature matched
        const user = await User.findById(req.user._id);
        user.cart = [];
        await user.save();

        res.json({success: true, message: "Payement Verified!"});

    }catch{
        res.json({success: false, message: err.message});
    }
})

module.exports = router;