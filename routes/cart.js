const express = require("express");
const List = require("../models/listings.js");
const User = require("../models/user.js");
const router = express.Router();

// ─── VIEW CART ────────────────────────────────────────────────
router.get("/cart", async (req, res, next) => {
    try {
        let cart = [];
        let currentUser = "";
        if (req.user) {
            const user = await User.findById(req.user._id).populate("cart.product");
            cart = user.cart.filter(item => item.product !== null).reverse();
            currentUser = user; 
        } else {
            const sessionCart = req.session.cart || [];
            console.log("Guest session cart:", sessionCart);

            if (sessionCart.length > 0) {
                const productIds = sessionCart.map(item => item.product);
                const products = await List.find({ _id: { $in: productIds } });

                cart = sessionCart.map(item => ({
                    product: products.find(p => p._id.toString() === item.product),
                    quantity: item.quantity
                })).filter(item => item.product !== null);
            }
        }

        // if (cart.length === 0) {
        //     req.flash("warning", "Please Add a product to view cart!");
        //     return res.redirect("/listings");
        // }

        res.render("cart/index", { cart, currentUser });
    } catch (err) {
        next(err);
    }
});

// ─── ADD TO CART ──────────────────────────────────────────────
router.post("/cart/:id", async (req, res) => {
    const productId = req.params.id;
    const returnTo = req.body.returnTo || "/listings";
    try {
        let cartCount = 0;
        if (req.user) {
            // ✅ Logged in — save to DB
            const user = await User.findById(req.user._id);
            const existingItem = user.cart.find(item =>
                item.product.toString() === productId
            );
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                user.cart.push({ product: productId, quantity: 1 });
            }
            await user.save();
            cartCount = user.cart.length;
        } else {
            // ✅ Guest — save to session
            if (!req.session.cart) req.session.cart = [];

            const existingItem = req.session.cart.find(
                item => item.product === productId
            );
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                req.session.cart.push({ product: productId, quantity: 1 });
            }

            // ✅ Force session save — critical for guests
            await new Promise((resolve, reject) => {
                req.session.save(err => err ? reject(err) : resolve());
            });
            cartCount = req.session.cart.length;

            // console.log("Guest cart saved:", req.session.cart);
        }

        if(!req.session.addedToCart) req.session.addedToCart = [];
        if(!req.session.addedToCart.includes(productId)){
            req.session.addedToCart.push(productId);
        }

        // ✅ Force session save for addedToCart tracking
        await new Promise((resolve, reject) => {
            req.session.save(err => err ? reject(err) : resolve());
        });

        req.flash("login", "Item added to cart!");
        res.redirect(returnTo);
        // res.json({success: true, message: "Item Added to Cart", cartCount}); // cartcount passed as the varible 
    } catch (err) {
        console.error("ERROR:", err.message);
        req.flash("error", err.message);
        res.redirect(`/listings/${productId}`);
        // res.status(400).json({error: err.message});
    }
});
router.post("/cart/:id/fetch", async (req, res) => {
    const productId = req.params.id;
    const returnTo = req.body.returnTo || "/listings";
    try {
        let cartCount = 0;
        if (req.user) {
            // ✅ Logged in — save to DB
            const user = await User.findById(req.user._id);
            const existingItem = user.cart.find(item =>
                item.product.toString() === productId
            );
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                user.cart.push({ product: productId, quantity: 1 });
            }
            await user.save();
            cartCount = user.cart.length;
        } else {
            // ✅ Guest — save to session
            if (!req.session.cart) req.session.cart = [];

            const existingItem = req.session.cart.find(
                item => item.product === productId
            );
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                req.session.cart.push({ product: productId, quantity: 1 });
            }

            // ✅ Force session save — critical for guests
            await new Promise((resolve, reject) => {
                req.session.save(err => err ? reject(err) : resolve());
            });
            cartCount = req.session.cart.length;

            // console.log("Guest cart saved:", req.session.cart);
        }

        if(!req.session.addedToCart) req.session.addedToCart = [];
        if(!req.session.addedToCart.includes(productId)){
            req.session.addedToCart.push(productId);
        }

        // ✅ Force session save for addedToCart tracking
        await new Promise((resolve, reject) => {
            req.session.save(err => err ? reject(err) : resolve());
        });

        // req.flash("login", "Item added to cart!");
        // res.redirect(returnTo);
        res.json({success: true, message: "Item Added to Cart", cartCount}); // cartcount passed as the varible 
    } catch (err) {
        console.error("ERROR:", err.message);
        // req.flash("error", err.message);
        // res.redirect(`/listings/${productId}`);
        res.status(400).json({error: err.message});
    }
});

// ─── INCREMENT / DECREMENT ────────────────────────────────────
// router.put("/cart/:id", async (req, res) => {
//     const productId = req.params.id;
//     try {
//         const { action } = req.body;

//         if (req.user) {
//             // ✅ Logged in
//             const user = await User.findById(req.user._id);
//             const cartItem = user.cart.find(item =>
//                 item.product.toString() === productId
//             );

//             if (!cartItem) {
//                 req.flash("error", "Item not found in cart!");
//                 return res.redirect("/cart");
//             }

//             if (action === "plus") {
//                 cartItem.quantity++;
//             } else if (action === "minus") {
//                 if (cartItem.quantity <= 1) {
//                     user.cart = user.cart.filter(item =>
//                         item._id.toString() !== cartItem._id.toString()
//                     );
//                     req.flash("warning", "Item removed from cart!");
//                     await user.save();
//                     return res.redirect("/cart");
//                 } else {
//                     cartItem.quantity--;
//                 }
//             }
//             await user.save();
//         } else {
//             // ✅ Guest
//             if (!req.session.cart) return res.redirect("/cart");

//             const existingItem = req.session.cart.find(
//                 item => item.product === productId
//             );

//             if (!existingItem) {
//                 req.flash("error", "Item not found in cart!");
//                 return res.redirect("/cart");
//             }

//             if (action === "plus") {
//                 existingItem.quantity++;
//             } else if (action === "minus") {
//                 if (existingItem.quantity <= 1) {
//                     req.session.cart = req.session.cart.filter(
//                         item => item.product !== productId
//                     );
//                     req.flash("warning", "Item removed from cart!");
//                 } else {
//                     existingItem.quantity--;
//                 }
//             }

//             await new Promise((resolve, reject) => {
//                 req.session.save(err => err ? reject(err) : resolve());
//             });
//         }

//         res.redirect("/cart");
//     } catch (err) {
//         console.error("ERROR:", err.message);
//         req.flash("error", err.message);
//         res.redirect("/cart");
//     }
// });

router.patch("/cart/:id/quantity", async (req, res) => {
    const productId = req.params.id;
    const { quantity } = req.body;

    if (quantity < 1 || quantity > 3) {
        return res.json({ success: false, message: "Invalid quantity" });
    }

    try {
        if (req.user) {
            const user = await User.findById(req.user._id);
            const item = user.cart.find(i => i.product.toString() === productId);
            if (item) item.quantity = quantity;
            await user.save();
        } else {
            const item = req.session.cart?.find(i => i.product === productId);
            if (item) item.quantity = quantity;
            await new Promise((resolve, reject) => {
                req.session.save(err => err ? reject(err) : resolve());
            });
        }
        res.json({ success: true });
    } catch(err) {
        res.json({ success: false, message: err.message });
    }
});

// ─── REMOVE ITEM ──────────────────────────────────────────────
router.delete("/cart/:id", async (req, res) => {
    const productId = req.params.id;
    try {
        if (req.user) {
            // ✅ Logged in
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { cart: { product: productId } }
            });
        } else {
            // ✅ Guest
            req.session.cart = (req.session.cart || []).filter(
                item => item.product !== productId
            );
            await new Promise((resolve, reject) => {
                req.session.save(err => err ? reject(err) : resolve());
            });
        }

        if(req.session.addedToCart){
            req.session.addedToCart = req.session.addedToCart.filter(id => id!==productId);
        }

        req.flash("login", "Item removed from cart!");
        res.redirect("/cart");
    } catch (err) {
        console.error("ERROR:", err.message);
        req.flash("error", err.message);
        res.redirect("/cart");
    }
});

module.exports = router;