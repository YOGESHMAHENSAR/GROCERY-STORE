// utils/mergeCart.js — reusable helper
const User = require("../models/user.js");

const mergeGuestCart = async (req) => {
    try {
        const sessionCart = req.session.cart;
        if (!sessionCart || sessionCart.length === 0) return; // nothing to merge

        const user = await User.findById(req.user._id);
        if (!user) return;

        for (let sessionItem of sessionCart) {
            if (!sessionItem.variantId) continue; // skip malformed/legacy session entries

            const existingItem = user.cart.find(
                item => item.product.toString() === sessionItem.product &&
                        item.variantId.toString() === sessionItem.variantId
            );
            if (existingItem) {
                // ✅ same product AND same variant already in cart — increase quantity
                existingItem.quantity = Math.min(existingItem.quantity + sessionItem.quantity, 3); // respect max-3 cap
            } else {
                // ✅ new product/variant combo — add to cart
                user.cart.push({
                    product: sessionItem.product,
                    variantId: sessionItem.variantId,
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