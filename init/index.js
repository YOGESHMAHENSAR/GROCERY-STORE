require('dotenv').config({ path: "../.env" });
const dbUrl = process.env.ATLASDB_URL;
const mongoose = require("mongoose");
const listing = require("../models/listings.js");
const User = require("../models/user.js");
const initData = require("./data.js");

main().then((res)=>console.log("connection successful"))
.catch((err)=>console.log("ERROR: ",err));

async function main(){
    await mongoose.connect(dbUrl);
}

const initDb = async()=>{
    // clear existing documents so we can start fresh
    await listing.deleteMany({});
    await User.deleteMany({});

    // create a couple of owner users and register them
    const owner1 = new User({ username: "YOGESH_SINGH", email: "abc@gmail.com" });
    await User.register(owner1, "1111");
    const owner2 = new User({ username: "Manish", email: "manish@gmail.com" });
    await User.register(owner2, "1111");

    const ownerIds = [owner1._id, owner2._id]; // both will be owners of each listing

    // attach owners array to each listing in the sample data
    initData.data = initData.data.map((obj) => ({ ...obj, owners: ownerIds }));
    await listing.insertMany(initData.data);
    console.log("data inserted successfully");
}

initDb();