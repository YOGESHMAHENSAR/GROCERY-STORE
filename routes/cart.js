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
            cart = user.cart
                .filter(item => item.product !== null)
                .map(item => ({
                    ...item.toObject(),
                    variant: item.product.variants.id(item.variantId) || null
                }))
                .reverse();
            currentUser = user;
        } else {
            const sessionCart = req.session.cart || [];
            if (sessionCart.length > 0) {
                const productIds = sessionCart.map(item => item.product);
                const products = await List.find({ _id: { $in: productIds } });

                cart = sessionCart.map(item => {
                    const product = products.find(p => p._id.toString() === item.product);
                    return {
                        product,
                        variantId: item.variantId,
                        variant: product ? product.variants.id(item.variantId) : null,
                        quantity: item.quantity
                    };
                }).filter(item => item.product !== null);
            }
        }

        res.render("cart/index", { cart, currentUser });
    } catch (err) {
        next(err);
    }
});

// ─── shared handler for add-to-cart (used by both /cart/:id and /cart/:id/fetch) ──
async function addToCart(req, res, respondJson) {
    const productId = req.params.id;
    const variantId = req.body.variantId;
    const returnTo = req.body.returnTo || "/listings";

    if (!variantId) {
        const msg = "No variant selected.";
        if (respondJson) return res.status(400).json({ error: msg });
        req.flash("error", msg);
        return res.redirect(`/listings/${productId}`);
    }

    try {
        let cartCount = 0;
        if (req.user) {
            const user = await User.findById(req.user._id);
            const existingItem = user.cart.find(item =>
                item.product.toString() === productId &&
                item.variantId.toString() === variantId
            );
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                user.cart.push({ product: productId, variantId, quantity: 1 });
            }
            await user.save();
            cartCount = user.cart.length;
        } else {
            if (!req.session.cart) req.session.cart = [];

            const existingItem = req.session.cart.find(
                item => item.product === productId && item.variantId === variantId
            );
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                req.session.cart.push({ product: productId, variantId, quantity: 1 });
            }

            await new Promise((resolve, reject) => {
                req.session.save(err => err ? reject(err) : resolve());
            });
            cartCount = req.session.cart.length;
        }

        if (!req.session.addedToCart) req.session.addedToCart = [];
        const trackingKey = `${productId}_${variantId}`;
        if (!req.session.addedToCart.includes(trackingKey)) {
            req.session.addedToCart.push(trackingKey);
        }
        await new Promise((resolve, reject) => {
            req.session.save(err => err ? reject(err) : resolve());
        });

        if (respondJson) {
            return res.json({ success: true, message: "Item Added to Cart", cartCount });
        }
        req.flash("login", "Item added to cart!");
        res.redirect(returnTo);
    } catch (err) {
        console.error("ERROR:", err.message);
        if (respondJson) return res.status(400).json({ error: err.message });
        req.flash("error", err.message);
        res.redirect(`/listings/${productId}`);
    }
}

router.post("/cart/:id", (req, res) => addToCart(req, res, false));
router.post("/cart/:id/fetch", (req, res) => addToCart(req, res, true));

// ─── UPDATE QUANTITY ──────────────────────────────────────────
router.patch("/cart/:id/quantity", async (req, res) => {
    const productId = req.params.id;
    const { variantId } = req.body;
    const quantity = parseInt(req.body.quantity); // ← coerce to number before comparing

    if (isNaN(quantity) || quantity < 1 || quantity > 3) {
        return res.json({ success: false, message: "Invalid quantity" });
    }

    try {
        if (req.user) {
            const user = await User.findById(req.user._id);
            const item = user.cart.find(i =>
                i.product.toString() === productId &&
                (!variantId || i.variantId.toString() === variantId)
            );
            if (item) item.quantity = quantity;
            await user.save();
        } else {
            const item = req.session.cart?.find(i =>
                i.product === productId && (!variantId || i.variantId === variantId)
            );
            if (item) item.quantity = quantity;
            await new Promise((resolve, reject) => {
                req.session.save(err => err ? reject(err) : resolve());
            });
        }
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// ─── REMOVE ITEM ──────────────────────────────────────────────
router.delete("/cart/:id", async (req, res) => {
    const productId = req.params.id;
    const variantId = req.body.variantId;
    try {
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                $pull: variantId
                    ? { cart: { product: productId, variantId } }
                    : { cart: { product: productId } }
            });
        } else {
            req.session.cart = (req.session.cart || []).filter(item =>
                !(item.product === productId && (!variantId || item.variantId === variantId))
            );
            await new Promise((resolve, reject) => {
                req.session.save(err => err ? reject(err) : resolve());
            });
        }

        if (req.session.addedToCart) {
            const trackingKey = `${productId}_${variantId}`;
            req.session.addedToCart = req.session.addedToCart.filter(key => key !== trackingKey);
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