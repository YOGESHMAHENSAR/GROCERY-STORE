const List = require("./models/listings.js");
const reviews = require("./models/reviews.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req,res,next)=>{
    // console.log(req);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "PLease login to make to Place order");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
    let listing = await List.findById(id);
    // allow any user in the owners array to pass
    const isOwner = listing.owners && listing.owners.some(o => o.equals(res.locals.currUser._id));
    if(!isOwner){
        req.flash("error", "You are not one of the owners.");
        return res.redirect(`/listings/${id}`); //takes you to the same page which shows edit button
    }
    next();
}

module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

//for validating the reviews
module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

//for reviews auth
module.exports.isReviewOwner = async (req,res,next)=>{
    let { id , reviewId} = req.params;
    let review = await reviews.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You Are not the author of this comment.");
        return res.redirect(`/listings/${id}`); //takes you to the same page which shows edit button
    }
    next();
}

//is owner role means => user not allowed to do tasks of the owner of the website

module.exports.isOwnerRole = async(req,res,next)=>{
    let { id } = req.params;
    const listing = await List.findById(id);
    const isowner = listing.owners && listing.owners.some(o => o.equals(res.locals.currUser._id));
    if(!isowner){
        req.flash("error", "You don't have permission to access this page!");
        return res.redirect("/listings");
    }
    next();
}

module.exports.isAnyOwner = async(req,res,next)=>{
    try{
        const list = await List.findOne({
            owners: res.locals.currUser._id
        });

        if(!list){
            req.flash("error","You don't have permission to access this page!");
            return res.redirect("/listings");
        }
        next();
    }catch(err){
        req.flash("error", "Something went wrong.");
        return res.redirect("/listings");
    }
}