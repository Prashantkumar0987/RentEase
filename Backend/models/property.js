const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    rent: {
        type: Number,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }

});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;