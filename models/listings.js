const mongoose = require("mongoose");
const Reviews = require("./reviews.js");
const { ref } = require("joi");

main().then((res)=>console.log("connection successful"))
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
    category:[
        {
            type: String,
            enum: ["Beverages", "Snacks", "Dairy", "Normal"],
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
