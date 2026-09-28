const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
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

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "in-progress", "resolved"],
        default: "pending"
    }
}, { timestamps: true });

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

module.exports = Maintenance;