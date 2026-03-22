const joi = require("joi");
const user = require("./models/user");

module.exports.listingSchema = joi.object({
        listing: joi.object({
                title: joi.string().required(),
                description: joi.string().required(),
                location: joi.string().allow("",null),
                image: joi.string().allow("",null),  
                category: joi.string().required(),
                costPrice: joi.string().required().min(0),
                sellingPrice: joi.string().min(0),
                margin: joi.string().required().min(0),
                Tax: joi.string().required().min(0),
        }).required()
})

module.exports.reviewSchema = joi.object({
        review:  joi.object({
                // name: joi.string().required(),
                comment: joi.string().min(1).max(400).allow("",null),
                rating: joi.number().required().min(0).max(5),
        }).required()
})