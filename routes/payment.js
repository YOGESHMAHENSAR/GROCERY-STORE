const express = require("express");
const List = require("../models/listings.js");
const User = require("../models/user.js");
const Order = require("../models/order.js");
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
router.get('/order-success', async(req, res) => {
    try{
        const order = await User.findOne({user: req.user._id}).
                    sort({createdAt: -1}).populate("items.product");
        res.render('payment/order-success', {order});
    }
    catch(err){
        res.redirect("/listings")
    }
});

//to create order id

router.post("/create-order",isLoggedIn, async (req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        if(!user.address || !user.address.pincode || !user.address.city){
            return res.json({success: false, message: "Please add a delivery Address before Placing Order!"});
        }
        const { amount } = req.body;
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `reciept_${Date.now()}`
        })
        res.json({success: true, order});
    }catch(err){
        res.json({success: false, message: err.message});
    }
})

//to verify the payment done by the user

router.post("/verify-payment", async(req,res)=>{
    try{
        const{razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body; // deconstruct the crucial info

        //signature created on our  own side.
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");

        //compare both the signature
        if(expected !== razorpay_signature){
            return res.json({success: false, message: "Payment Verification Failed!"});
        }

        //payment passed when signature matched
        const user = await User.findById(req.user._id).populate("cart.product");

        const order = new Order({
            user: req.user._id,
            items: user.cart.map(items => ({
                product: items.product._id,
                quantity: items.quantity,
                price: items.product.sellingPrice,
            })),
            totalAmount: user.cart.reduce((sum,item)=>
                sum + item.product.sellingPrice * item.quantity
            ,0),
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            address: user.address
        })

        await order.save();
        await User.findByIdAndUpdate(req.user._id, {cart: []});

        res.json({success: true, message: "Payement Verified!"});

    }catch(err){
        res.json({success: false, message: err.message});
    }
})

//order page route
router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 }) // ✅ newest first
            .populate("items.product");
        res.render("2/orders", { orders });
    } catch (err) {
        res.redirect("/listings");
    }
});

module.exports = router;