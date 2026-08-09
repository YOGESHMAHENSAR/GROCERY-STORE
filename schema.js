const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    location: joi.string().allow("", null),
    image: joi.any(), // file, handled by multer, not validated here

    // raw form sends a single string — controller wraps it into an array before saving to Mongo
    category: joi.string().valid("Beverages", "Normal", "Grocery", "Snacks", "Dairy").required(),

    quantityType: joi.string().valid("count", "fixed_pack").required(),

    // fixed_pack only
    costPrice: joi.number().min(0).when("quantityType", {
      is: "fixed_pack",
      then: joi.required(),
      otherwise: joi.optional().allow("", null),
    }),
    margin: joi.number().min(0).when("quantityType", {
      is: "fixed_pack",
      then: joi.required(),
      otherwise: joi.optional().allow("", null),
    }),
    stockCount: joi.number().min(0).when("quantityType", {
      is: "fixed_pack",
      then: joi.required(),
      otherwise: joi.optional().allow("", null),
    }),

    // present in both modes (main input for fixed_pack, inner input for count)
    Tax: joi.number().min(0).required(),

    // count only
    variants: joi.array().items(
      joi.object({
        label: joi.string().required(),
        unit: joi.string().valid("kg", "g", "l", "ml", "dozen", "piece", "pack", "sack").required(),
        costPrice: joi.number().min(0).required(),
        margin: joi.number().min(0).required(),
        stockCount: joi.number().min(0).required(),
      })
    ).when("quantityType", {
      is: "count",
      then: joi.required(),
      otherwise: joi.optional(),
    }),
  }).required(),
});

module.exports.reviewSchema = joi.object({
  review: joi.object({
    comment: joi.string().min(1).max(400).allow("", null),
    rating: joi.number().required().min(1).max(5),
  }).required(),
});