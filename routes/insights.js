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

            const profit = (item.price - (parseFloat(item.product.costPrice) || 0)) * item.quantity;
            monthlyProfit[month] = (monthlyProfit[month] || 0) + profit;

            const title = item.product.title;
            productSales[title] = (productSales[title] || 0) + item.quantity;

            const revenue = item.price * item.quantity;
            (item.product.category || []).forEach(cat => {
                categorySales[cat] = (categorySales[cat] || 0) + revenue;
            });
        });
    });

    const top5 = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    res.json({ monthlySales, monthlyProfit, top5Products: top5 , categorySales});
}));


module.exports = router;