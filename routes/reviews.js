const express = require("express");
const router = express.Router({mergeParams: true});
const review = require("../models/reviews.js");
const wrapAsync = require("../utils/wrapAsync.js");
const List = require("../models/listings.js");
const { isLoggedIn,validateReview,isReviewOwner } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js")

//for adding new reviews
router.post("/",isLoggedIn,validateReview ,wrapAsync(reviewController.newReview))

//delete reviews
router.delete("/:reviewId", isLoggedIn,isReviewOwner, wrapAsync(reviewController.delete))

module.exports = router;