// utils/mergeCart.js — reusable helper
const User = require("../models/user.js");

const mergeGuestCart = async (req) => {
    try {
        const sessionCart = req.session.cart;
        if (!sessionCart || sessionCart.length === 0) return; // nothing to merge

        const user = await User.findById(req.user._id);
        if (!user) return;

        for (let sessionItem of sessionCart) {
            const existingItem = user.cart.find(
                item => item.product.toString() === sessionItem.product
            );
            if (existingItem) {
                // ✅ product already in cart — just increase quantity
                existingItem.quantity += sessionItem.quantity;
            } else {
                // ✅ new product — add to cart
                user.cart.push({
                    product: sessionItem.product,
                    quantity: sessionItem.quantity
                });
            }
        }

        await user.save();
        req.session.cart = []; // ✅ clear guest cart after merging

        console.log("Guest cart merged successfully!");
    } catch (err) {
        console.error("Cart merge error:", err.message);
    }
};

module.exports = mergeGuestCart;