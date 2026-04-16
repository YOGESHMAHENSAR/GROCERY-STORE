const express = require("express");
const List = require("../models/listings.js");
const User = require("../models/user.js");
const Order = require("../models/order.js");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isAnyOwner} = require("../middleware.js");

const Razorpay = require("razorpay");
const crypto = require("crypto");
const { findByIdAndUpdate } = require("../models/reviews.js");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

//Add order success page
router.get('/order-success', isLoggedIn, async (req, res) => {
    try {
        const orderId = req.session.lastOrderId;
        // console.log("lastOrderId from session:", orderId); // debug

        if (!orderId) {
            req.flash("error", "No recent order found!");
            return res.redirect("/listings");
        }

        const order = await Order.findById(orderId).populate("items.product");
        // console.log("order found:", order); // debug

        if (!order) {
            req.flash("error", "Order not found!");
            return res.redirect("/listings");
        }

        // ✅ Clear session after using it
        delete req.session.lastOrderId;
        req.session.addedToCart = []; //to clear the whole addedToCart so that we can see the cart btn as usual.

        res.render('payment/order-success', { order });
    } catch (err) {
        console.error("Order success error:", err.message);
        res.redirect("/listings");
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

        // Ensure razorpay_order_id is a string
        const orderId = razorpay_order_id.id || razorpay_order_id;

        //signature created on our  own side.
        const body = orderId + "|" + razorpay_payment_id;
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
            orderId: orderId,
            address: user.address
        })

        await order.save();
        await User.findByIdAndUpdate(req.user._id, {cart: []});

        req.session.lastOrderId = order._id.toString();
        await new Promise((resolve, reject) => {
            req.session.save(err => err ? reject(err) : resolve());
        });

        res.json({ success: true, message: "Payment Verified!" });


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
        res.render("payment/order", { orders });
    } catch (err) {
        res.redirect("/listings");
    }
});

//order page route for the owner so that he can deliver the order and mark it as done.
router.get("/orders-delivery",isAnyOwner, isLoggedIn,async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 }) // ✅ newest first
            .populate({
                path: "items.product",
                match: {_id: {$exists: true}}
            })
            .populate("user", "username email phone")
        res.render("payment/order-delivery", { orders });
    } catch (err) {
        res.redirect("/listings");
    }
});

router.patch("/order/:id/status", isAnyOwner, isLoggedIn, async (req,res)=>{
    try{
        const orderId = req.params.id;
        const {status, orderGrandTotal} = req.body;
        const order = await Order.findOneAndUpdate({orderId: orderId}, {status},{new: true})
            .populate("user")
            .populate("items.product");

        if(!order){
            return res.json({success: false, message: "404 order Not found"});
        }

        const phone = order.user.phone;

        if(status === "Confirmed"){
            let count = 1;
            let message = `*Order Confirmed!*
━━━━━━━━━━━━━━━━━━━━
★ *Order Summary*

        ${order.items.map((item, index) => `${index + 1}. ${item.product.title} x ${item.quantity}`).join("\n\t")}

━━━━━━━━━━━━━━━━━━━━
★ *Amount to Pay (Inclusive all Taxes):* Rs. ${parseFloat(orderGrandTotal).toFixed(2)}
━━━━━━━━━━━━━━━━━━━━

★ *Your order is being prepared!*
We will notify you once it is out for delivery

★ Need help? Call us: +91-77370XXXXX
   Owner_name : *Yogesh Singh*
━━━━━━━━━━━━━━━━━━━━
 _Powered by *★ Grocery-Store ★* `;
            
            let encodedMsg = encodeURIComponent(message);

            let url = `https://wa.me/91${phone}?text=${encodedMsg}`;

            return res.json({success:true, message: "Order status Updated", status: order.status, whatsappUrl: url });
        }
        if(status === "Placed"){
            let message = `*Order Delivered Successfully!*
━━━━━━━━━━━━━━━━━━━━
★ *Order Summary*

        ${order.items.map((item, index) => `${index + 1}. ${item.product.title} x ${item.quantity}`).join("\n\t")}

━━━━━━━━━━━━━━━━━━━━
★ *Total Paid:* Rs. ${parseFloat(orderGrandTotal).toFixed(2)}
━━━━━━━━━━━━━━━━━━━━

★ *Thank you for shopping with us!*
We hope you enjoy your order

★ *Your feedback matters!*
Rate your experience & help us improve:
★ https://grocery-store-r5o0.onrender.com/listings

★ Need help? Call us: +91-7737XXXXXX
   Owner_Name: *Yogesh Singh*
━━━━━━━━━━━━━━━━━━━━
 _Powered by *★ Grocery-Store ★* `;
            
            let encodedMsg = encodeURIComponent(message);

            let url = `https://wa.me/91${phone}?text=${encodedMsg}`;

            return res.json({success:true, message: "Order status Updated", status: order.status, whatsappUrl: url });
        }

        res.json({ success: true, message: "Order status Updated", status: order.status });
    }
    catch(e){
        res.json({success: false, message: e.message});
    }
})

//Invoice
router.get("/orders/:id/invoice",isLoggedIn, async (req,res)=>{
    try{
        const order = await Order.findOne({ orderId: req.params.id }).populate("user").populate("items.product");
        res.render("listings/invoice", {order});
    }catch(e){
        req.flash("error","Error in Inventory");
        res.redirect("/listings");
    }
})

//Invoice
router.get("/orders/:id/invoice",isLoggedIn, async (req,res)=>{
    try{
        const order = await Order.findOne({ orderId: req.params.id })
            .populate("user")
            .populate({
                path: "items.product",
                populate: { path: "owners" }  // Populate owners for store details
            });
        res.render("listings/invoice", {order});
    }catch(e){
        req.flash("error","Error generating invoice");
        res.redirect("/listings");
    }
})

module.exports = router;