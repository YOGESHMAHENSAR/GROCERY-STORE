const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = (require("passport-local-mongoose").default || require("passport-local-mongoose"));

const userSchema = new Schema({
    email: {
        type: String,
    },
    googleId:{
        type: String
    },
    username:{
       type: String
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    role: {
        type: String,
        enum: ["Customer", "Owner"],
        default: "Customer"
    },
    cart:[
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "List"
                },
                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ]
},{ timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);