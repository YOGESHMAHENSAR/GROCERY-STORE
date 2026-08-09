const express = require("express");
const Order = require("../models/order.js");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwnerRole, isOwner, isAnyOwner} = require("../middleware.js");

router.get("/insights",isLoggedIn, isAnyOwner, (req, res)=>{
    res.render("insights/index");
})

router.get("/insights/data", isAnyOwner, isLoggedIn, wrapAsync(async (req, res) => {
    const orders = await Order.find().populate("items.product");

    const monthlySales = {};
    const monthlyProfit = {};
    const productSales = {};
    const categorySales = {};

    orders.forEach(order => {
        const month = order.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlySales[month] = (monthlySales[month] || 0) + order.totalAmount;

        order.items.forEach(item => {
            if (!item.product) return;

            const variant = item.variantId ? item.product.variants.id(item.variantId) : null;
            const costPrice = parseFloat(variant?.costPrice) || 0;
            const sellingPrice = parseFloat(item.price ?? variant?.sellingPrice ?? item.product?.sellingPrice ?? 0) || 0;
            const taxRate = item.product && item.product.Tax ? parseFloat(item.product.Tax) / 100 : 0;

            // ─── Matches order-delivery.ejs exactly: tax applied on top of BOTH selling and cost ───
            const taxAdjustedSelling = sellingPrice * (1 + taxRate);
            const taxAdjustedCost = costPrice * (1 + taxRate);

            const profit = (taxAdjustedSelling - taxAdjustedCost) * item.quantity;
            monthlyProfit[month] = (monthlyProfit[month] || 0) + profit;

            const title = item.product.title;
            productSales[title] = (productSales[title] || 0) + item.quantity;

            const revenue = taxAdjustedSelling * item.quantity;
            const cat = item.product.category;
            if (cat) {
                categorySales[cat] = (categorySales[cat] || 0) + revenue;
            }
        });
    });

    const top5 = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    res.json({ monthlySales, monthlyProfit, top5Products: top5, categorySales });
}));


module.exports = router;