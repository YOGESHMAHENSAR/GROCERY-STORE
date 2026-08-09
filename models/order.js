const { required } = require("joi");
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
    paymentMethod: {
        type: String,
        enum: ["Razorpay", "COD"],
        default: "Razorpay"
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
            variantId: {
                type: mongoose.Schema.Types.ObjectId
            },
            variantLabel: {
                type: String
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