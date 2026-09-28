const mongoose = require("mongoose");

const rentSchema = new mongoose.Schema({

    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true
    },

    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 1
    },

    dueDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },

    paidAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

const Rent = mongoose.model("Rent", rentSchema);

module.exports = Rent;