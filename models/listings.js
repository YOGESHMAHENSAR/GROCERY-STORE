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
    Tax: {
        type: String,
        required: true
    },
    quantityType: {
        type: String,
        enum: ["count", "fixed_pack"],
        required: true
    },
    variants: [
        {
            label: { type: String, required: true },   // "70g", "1 Dozen", "10kg Sack"
            unit: {
                type: String,
                enum: ["kg", "g", "l", "ml", "dozen", "piece", "pack", "sack"],
                required: true
            },
            costPrice: { type: Number, required: true },
            margin: { type: Number, required: true, default: 0 },
            sellingPrice: { type: Number, required: true },
            stockCount: { type: Number, required: true, default: 0 },
            inStock: { type: Boolean, required: true, default: true }
        }
    ],
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
