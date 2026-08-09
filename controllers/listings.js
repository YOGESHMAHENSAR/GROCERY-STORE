const List = require("../models/listings.js");
const User = require("../models/user.js");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req,res)=>{
    const { category } = req.query;
    let filter = {};
    if(category){
        filter = {category: category}
    }
    // const allListings = await List.find(filter);
    const lists = await List.find(filter).populate("owners").sort({ _id: -1 });
    
    // ✅ For logged-in users, get cart from database; for guests, use session
    let addedToCart = [];
    if(req.user) {
        const user = await User.findById(req.user._id);
        addedToCart = user.cart.map(item => item.product.toString());
    } else {
        addedToCart = req.session.addedToCart || [];
    }
    
    res.render("listings/index",{lists, category, addedToCart});
}

module.exports.validate = async (req, res) => {
    const url = req.file.url;
    const filename = req.file.filename;

    const { quantityType, category, Tax, costPrice, margin, stockCount, variants, ...rest } = req.body.listing;

    const newListing = new List({
        ...rest,
        category,
        quantityType,
        Tax,
        image: { url, filename },
    });

    if (process.env.OWNER_IDS) {
        newListing.owners = process.env.OWNER_IDS.split(',').map(id => id.trim());
    }

    const computeSellingPrice = (cost, marginPct, taxPct) =>
        parseFloat((cost * (1 + marginPct / 100) * (1 + taxPct / 100)).toFixed(2));

    if (quantityType === "fixed_pack") {
        const cp = parseFloat(costPrice);
        const mg = parseFloat(margin);
        const tx = parseFloat(Tax);

        newListing.variants = [{
            label: "Standard",
            value: 1,              // schema requires this — see note below
            unit: "piece",         // pick a sensible default unit for fixed_pack
            costPrice: cp,
            margin: mg,
            sellingPrice: computeSellingPrice(cp, mg, tx),
            stockCount: parseInt(stockCount, 10),
        }];
    } else if (quantityType === "count" && Array.isArray(variants)) {
        const tx = parseFloat(Tax);
        newListing.variants = variants.map(v => {
            const cp = parseFloat(v.costPrice);
            const mg = parseFloat(v.margin);
            return {
                label: v.label,
                value: parseFloat(v.value) || 1, // see note below — form doesn't collect this yet
                unit: v.unit,
                costPrice: cp,
                margin: mg,
                sellingPrice: computeSellingPrice(cp, mg, tx),
                stockCount: parseInt(v.stockCount, 10),
            };
        });
    }
    console.log(JSON.stringify(newListing.toObject(), null, 2));
    await newListing.save();
    req.flash("new", `New Product Added Successfully`);
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    let list = await List.findById(id).populate("owners");
    if(!list){
        req.flash("error", "Listing You requested for Does not Exist");
        res.redirect("/listings");
    }else{
        req.flash("edit" ,"Product Details Edited Successfully");
        res.render("listings/edit",{list, lists: list});
    }
}

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const { quantityType, category, Tax, costPrice, margin, stockCount, variants, location, title, description } = req.body.listing;

    const computeSellingPrice = (cost, marginPct, taxPct) =>
        parseFloat((cost * (1 + marginPct / 100) * (1 + taxPct / 100)).toFixed(2));

    let builtVariants = [];

    if (quantityType === "fixed_pack") {
        const cp = parseFloat(costPrice);
        const mg = parseFloat(margin);
        const tx = parseFloat(Tax);

        builtVariants = [{
            label: "Standard",
            value: 1,
            unit: "piece",
            costPrice: cp,
            margin: mg,
            sellingPrice: computeSellingPrice(cp, mg, tx),
            stockCount: parseInt(stockCount, 10),
        }];
    } else if (quantityType === "count" && Array.isArray(variants)) {
        const tx = parseFloat(Tax);
        builtVariants = variants.map(v => {
            const cp = parseFloat(v.costPrice);
            const mg = parseFloat(v.margin);
            return {
                label: v.label,
                value: parseFloat(v.value) || 1,
                unit: v.unit,
                costPrice: cp,
                margin: mg,
                sellingPrice: computeSellingPrice(cp, mg, tx),
                stockCount: parseInt(v.stockCount, 10),
            };
        });
    }

    const updateData = {
        title,
        description,
        location,
        category: Array.isArray(category) ? category : [category],
        quantityType,
        Tax,
        variants: builtVariants,
    };

    let listing = await List.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (typeof req.file !== "undefined") {
        listing.image = { url: req.file.url, filename: req.file.filename };
        await listing.save();
    }

    req.flash("edit", "Product Details Updated Successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.show = async (req,res)=>{
    let {id} = req.params;
    // console.log("id:", id);
    let cart = [];
    let addedToCart = [];
    if(req.user){
        const user = await User.findById(req.user._id).populate("cart.product");
        cart = user.cart.filter(item => item.product !== null);
        addedToCart = cart.map(item => item.product._id.toString());
    } else {
        const sessionCart = req.session.cart || [];
        cart = sessionCart.map(item => ({
            product: item.product,
            quantity: item.quantity
        }));
        addedToCart = req.session.addedToCart || [];
    }
    let lists = await List.findById(id)
      .populate({path: "reviews",  populate: {path: "author"}})
      .populate("owners");
    if(!lists){
        req.flash("error", "Product You requested for Does not Exist");
        return res.redirect("/listings");
    }else{
        res.render("listings/show",{lists, cart, addedToCart});
    }
}

// module.exports.cart = async(req,res)=>{
//     let {id} = req.body;
// }

module.exports.delete = async (req,res)=>{
    let {id} = req.params;
    // let lists = await List.findById(id);
    await List.findByIdAndDelete(id);
    req.flash("delete", "Product Removed Successfully");
    res.redirect("/listings");
}