const mongoose = require("mongoose");
const Reviews = require("./reviews.js");
const { string, required, boolean } = require("joi");

main().then()
.catch((err)=>console.log("ERROR: ",err));

async function main(){
    await mongoose.connect(process.env.ATLASDB_URL);
}

const listingSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    image:{
        url: String,
        filename: String
    },
    price:{
        type: String
    },
    location:{
        type: String
    },
    reviews:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    // allow multiple owners by storing an array of user references
    owners:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    costPrice: {
        type: String,
        required: true
    },
    sellingPrice: {
        type: String,
    },
    margin:{
        type: String,
        required: false,
        default: "0"
    },
    Tax: {
        type: String,
        required: true
    },
    inStock: {
        type: Boolean,
        required: true,
        default: true
    },
    stockCount:{
        type: Number,
        required: true
    },
    quantityType: {
        type: String,
        enum: ["loose_weight", "count", "fixed_pack", "single_variant"],
        required: true
    },
    variants: [
        {
            label: { type: String },// e.g. "500g", "1 Dozen", "10kg Sack"
            value: { type: Number },// e.g. 0.5, 12, 10
            unit: { type: String },// "kg", "g", "dozen", "piece", "sack"
            price: { type: Number },
            stock: { type: Number }
        }
    ],
    pricePerUnit: {// used only for loose_weight
        type: Number
    },
    baseUnit: {// used only for loose_weight, e.g. "kg"
        type: String
    },
    category:[
        {
            type: String,
            enum: ["Beverages", "Snacks", "Dairy", "Grocery", "Normal"],
            required: true
        }
    ],
}, { timestamps: true })

listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Reviews.deleteMany({_id: {$in: listing.reviews}});
    }
})

const List = new mongoose.model("List",listingSchema);

module.exports = List;
