const review = require("../models/reviews.js");
const List = require("../models/listings.js");

module.exports.newReview = async (req,res)=>{
    let {id} = req.params;
    let listing = await List.findById(id);
    let newReview = new review(req.body.review);
    newReview.author = req.user._id;
    
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
    req.flash("addReview", "Review Added Successfully");
    res.redirect(`/listings/${id}`);
}

module.exports.delete = async(req,res)=>{
    let{id, reviewId} = req.params;
    await List.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
    await review.findByIdAndDelete(reviewId);
    req.flash("deleteReview", "Review Removed Successfully");
    res.redirect(`/listings/${id}`);
}