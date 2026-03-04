const joi = require("joi");
const user = require("./models/user");

module.exports.listingSchema = joi.object({
        listing: joi.object({
                title: joi.string().required(),
                description: joi.string().required(),
                location: joi.string().required(),
                price: joi.string().required().min(0),
                image: joi.string().allow("",null),  
        }).required()
})

module.exports.reviewSchema = joi.object({
        review:  joi.object({
                // name: joi.string().required(),
                comment: joi.string().required().min(1).max(400),
                rating: joi.number().required().min(0).max(5),
        }).required()
})