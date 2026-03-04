const { string, ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    // name: {
    //     type: String,
    //     min:1,
    //     max:50
    // },
    comment: {
        type: String,
        min: 1,
        max: 150
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    image: {
        data:{
            type: Buffer
        }
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("Review", reviewSchema);