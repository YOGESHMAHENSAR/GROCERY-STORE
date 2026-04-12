const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String
    },
    paymentId: {
        type: String
    },
    totalAmount: {
        type: Number
    },
    status: {
        type: String,
        enum: ["Confirmed", "Placed", "Pending"],
        default: "Pending"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "List"
            },
            quantity: Number,
            price: Number
        }
    ],
    address: {
        pincode: String,
        state: String,
        city: String,
        street: String
    }
},{ timestamps: true })

module.exports = mongoose.model("Order",orderSchema);