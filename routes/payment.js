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
        // ✅ Check session first, then query param (mobile fallback)
        const orderId = req.session.lastOrderId || req.query.id;
        // console.log("orderId from session or query:", orderId); // debug

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

        for(let item of order.items){
            if(!item.product) continue;

            const product = await List.findById(item.product._id);
            if(product){
                product.stockCount -= item.quantity;
                if(product.stockCount <= 0){
                    product.inStock = false;
                    product.stockCount = 0;
                }
                await product.save();
                // console.log(`✅ ${product.title} stock reduced to ${product.stockCount}`); // debug
            }
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

// fxn used to push the notification to the owner

function calculateOrderAmount(items = []) {
    const subtotal = (items || []).reduce((sum, item) => {
        const price = parseFloat(item.price ?? item.product?.sellingPrice ?? 0) || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
    }, 0);

    const tax = (items || []).reduce((sum, item) => {
        const price = parseFloat(item.price ?? item.product?.sellingPrice ?? 0) || 0;
        const quantity = item.quantity || 1;
        const taxRate = item.product?.Tax ? parseFloat(item.product.Tax) / 100 : 0;
        return sum + ((price * quantity) * taxRate);
    }, 0);

    return subtotal + tax + 10;
}

async function sendPushToOwners(app, title, body, url) {
    const webpush = app.get("webpush");
    const ownerIds = (process.env.OWNER_IDS || "").split(",").map(id => id.trim());

    for(const ownerId of ownerIds) {
        try {
            const owner = await User.findById(ownerId);
            if(owner && owner.pushSubscription) {
                await webpush.sendNotification(
                    owner.pushSubscription,
                    JSON.stringify({ title, body, url })
                );
                console.log(`✅ Push sent to owner ${ownerId}`);
            }
        } catch(err) {
            console.error(`Push failed for owner ${ownerId}:`, err.message);
            // If subscription expired — clear it
            if(err.statusCode === 410) {
                await User.findByIdAndUpdate(ownerId, { pushSubscription: null });
            }
        }
    }
}

//cod route 

router.post("/create-cod-order", isLoggedIn, async (req, res) => {
    try {
        // Check address
        const user = await User.findById(req.user._id).populate("cart.product");
        if(!user.address || !user.address.pincode || !user.address.city) {
            return res.json({ 
                success: false, 
                message: "Please add a delivery address first!" 
            });
        }

        // Check cart
        if(!user.cart || user.cart.length === 0) {
            return res.json({ 
                success: false, 
                message: "Your cart is empty!" 
            });
        }

        // Create order — no payment ID for COD
        const order = new Order({
            user: req.user._id,
            items: user.cart.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.sellingPrice
            })),
            totalAmount: calculateOrderAmount(user.cart),
            paymentId: "COD",           // ← mark as COD
            orderId: `COD-${Date.now()}`,
            address: user.address,
            paymentMethod: "COD",       // ← add this field to your Order model
            status: "Pending"
        });

        await order.save();

        await sendPushToOwners( // this is used to send the notification to the owner who gets the order via COD
            req.app,
            "🛒 New COD Order!",
            `${user.username} placed a COD order of ₹${order.totalAmount}`,
            "/orders-delivery"
        );

        // Clear cart
        await User.findByIdAndUpdate(req.user._id, { cart: [] });

        // Save to session for order-success page
        req.session.lastOrderId = order._id.toString();
        await new Promise((resolve, reject) => {
            req.session.save(err => err ? reject(err) : resolve());
        });

        res.json({ success: true });

    } catch(err) {
        console.error("COD order error:", err);
        res.json({ success: false, message: err.message });
    }
});

//to verify the payment done by the user

router.post("/verify-payment", async(req,res)=>{
    try{
        const{razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body; // deconstruct the crucial info

        // Ensure razorpay_order_id is a string
        const orderId = typeof razorpay_order_id === "object" ? razorpay_order_id.id : razorpay_order_id;

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
            totalAmount: calculateOrderAmount(user.cart),
            paymentId: razorpay_payment_id,
            paymentMethod: "Razorpay",
            orderId: orderId,
            address: user.address
        })

        await order.save();

        await sendPushToOwners( // used to send the notification when payment using ONLINE method
            req.app,
            "🛒 New Order Received!",
            `${user.username} placed an order of ₹${order.totalAmount} (${order.items.length} items)`,
            "/orders-delivery"
        );

        await User.findByIdAndUpdate(req.user._id, {cart: []});

        req.session.lastOrderId = order._id.toString();
        await new Promise((resolve, reject) => {
            req.session.save(err => err ? reject(err) : resolve());
        });

        // ✅ Return orderId so client can use it as fallback
        res.json({ success: true, message: "Payment Verified!", orderId: order._id.toString() });


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
            .populate("user", "username email phone");
        orders.forEach(order => {
            order.items = order.items.filter(item => item.product !== null); // needed as the product is deelted from the website but in the order placed 
        });
        res.render("payment/order-delivery", { orders });
    } catch (err) {
        console.log(err);
        res.redirect("/listings");
    }
});

//whatsapp route that as soon as the order is created and sent for delivered we send the msg to the client 
// via whatsapp

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

        const subtotal = order.items.reduce((sum, item) => {
            const price = parseFloat(item.price || item.product?.sellingPrice || 0) || 0;
            const quantity = item.quantity || 1;
            return sum + (price * quantity);
        }, 0);

        const tax = order.items.reduce((sum, item) => {
            const price = parseFloat(item.price || item.product?.sellingPrice || 0) || 0;
            const quantity = item.quantity || 1;
            const taxRate = item.product?.Tax ? parseFloat(item.product.Tax) / 100 : 0;
            return sum + ((price * quantity) * taxRate);
        }, 0);

        const resolvedGrandTotal = Number.isFinite(parseFloat(orderGrandTotal)) && parseFloat(orderGrandTotal) > 0
            ? parseFloat(orderGrandTotal)
            : subtotal + tax + 10;

        if(status === "Confirmed"){
            let count = 1;
            let message = `*Order Confirmed!*
━━━━━━━━━━━━━━━━━━━━
★ *Order Summary*

        ${order.items.map((item, index) => `${index + 1}. ${item.product.title} x ${item.quantity}`).join("\n\t")}

━━━━━━━━━━━━━━━━━━━━
★ *Amount to Pay (Inclusive all Taxes):* Rs. ${resolvedGrandTotal.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━

★ *Your order is being prepared!*
We will notify you once it is out for delivery

★ Need help? Call us: +91-77370XXXXX
   Owner_name : *Yogesh Singh*
━━━━━━━━━━━━━━━━━━━━
 _Powered by *★ Grocery-Store ★* `;
            
            let encodedMsg = encodeURIComponent(message);

            let url = `whatsapp://send?phone=91${phone}&text=${encodedMsg}`;

            return res.json({success:true, message: "Order status Updated", status: order.status, whatsappUrl: url });
        }
        if(status === "Placed"){
            let message = `*Order Delivered Successfully!*
━━━━━━━━━━━━━━━━━━━━
★ *Order Summary*

        ${order.items.map((item, index) => `${index + 1}. ${item.product.title} x ${item.quantity}`).join("\n\t")}

━━━━━━━━━━━━━━━━━━━━
★ *Total Paid:* Rs. ${resolvedGrandTotal.toFixed(2)}
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

            let url = `whatsapp://send?phone=91${phone}&text=${encodedMsg}`;

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