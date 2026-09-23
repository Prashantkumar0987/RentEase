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
    }

});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;