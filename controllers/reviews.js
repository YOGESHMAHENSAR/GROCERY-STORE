const Review = require("../models/reviews.js");
const { reviewSchema } = require("../schema.js");
const List = require("../models/listings.js");

module.exports.newReview = async (req,res)=>{
    let {id} = req.params;
    let listing = await List.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
    req.flash("addReview", "Review Added Successfully");
    res.redirect(`/listings/${id}`);
}

// module.exports.renderEditReviewForm = async (req,res)=>{
//     let {id, reviewId} = req.params;
//     let review = await Review.findById(reviewId);
//     if(!review){
//         req.flash("error", "Review You requested for Does not Exist");
//         res.redirect("/listings");
//     }else{
//         res.render("reviews/edit",{review});
//     }
// }

module.exports.updateReview = async (req,res)=>{
    let result = reviewSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    let {id, reviewId} = req.params;
    let review = await Review.findByIdAndUpdate(reviewId, {...req.body.review});
    
    await review.save();
    req.flash("addReview", "Review Edited Successfully");
    res.redirect(`/listings/${id}`);
}

module.exports.delete = async(req,res)=>{
    let{id, reviewId} = req.params;
    await List.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("deleteReview", "Review Removed Successfully");
    res.redirect(`/listings/${id}`);
}