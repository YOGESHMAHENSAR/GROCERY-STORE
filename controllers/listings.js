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
    const lists = await List.find(filter).sort({ _id: -1 });
    res.render("listings/index",{lists, category});
}

module.exports.validate = async (req,res)=>{
    let url = req.file.url;
    let filename = req.file.filename;
    const newListing = new List(req.body.listing);
    // store as array so multiple owners can be supported
    newListing.image = {url, filename};
     if (process.env.OWNER_IDS) {
        newListing.owners = process.env.OWNER_IDS.split(',').map(id => id.trim());
    }
    await newListing.save();
    req.flash("new", `New Product Added Successfully`);
    res.redirect("/listings");
}

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

module.exports.update = async (req,res)=>{
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    let {id} = req.params;
    let listing = await List.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file!== "undefined"){ // only add the file if changed else only the updated data wouldd be saved
        let url = req.file.url;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    
    // res.redirect("/listings");
    req.flash("edit", "Product Details Updated Successfully");
    res.redirect(`/listings/${id}`); //takes you to the same page which shows edit button
}

module.exports.show = async (req,res)=>{
    let {id} = req.params;
    let cart = [];
    if(req.user){
        const user = await User.findById(req.user._id).populate("cart.product");
        cart = user.cart.filter(item => item.product !== null); 
    }
    
    let lists = await List.findById(id)
      .populate({path: "reviews",  populate: {path: "author"}})
      .populate("owners");
    if(!lists){
        req.flash("error", "Product You requested for Does not Exist");
        res.redirect("/listings");
    }else{
        res.render("listings/show",{lists, cart});
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