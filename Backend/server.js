require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const Property = require("./models/Property");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


// ==========================
// MIDDLEWARE
// ==========================

app.use(express.json());


// ==========================
// HOME ROUTE
// ==========================

app.get("/", function (req, res) {
    res.send("RentEase Backend is Running!");
});


// ==========================
// HEALTH ROUTE
// ==========================

app.get("/api/health", function (req, res) {
    res.json({
        success: true,
        message: "RentEase API is working"
    });
});


// ==========================
// GET PROPERTIES - FROM MONGODB
// ==========================

app.get("/api/properties", async function (req, res) {

    try {

        const properties = await Property.find();

        res.status(200).json({
            success: true,
            source: "MONGODB",
            message: "This is the MongoDB GET route",
            properties: properties
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch properties",
            error: error.message
        });

    }

});
// ==========================
// UPDATE PROPERTY - PUT
// ==========================

app.put("/api/properties/:id", async function (req, res) {
    try {
        const propertyId = req.params.id;

        const updatedProperty = await Property.findByIdAndUpdate(
            propertyId,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProperty) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Property updated successfully",
            property: updatedProperty
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update property",
            error: error.message
        });
    }
});
// ==========================
// DELETE PROPERTY - DELETE
// ==========================

app.delete("/api/properties/:id", async function (req, res) {
    try {
        const propertyId = req.params.id;

        const deletedProperty = await Property.findByIdAndDelete(propertyId);

        if (!deletedProperty) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Property deleted successfully",
            property: deletedProperty
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to delete property",
            error: error.message
        });
    }
});


// ==========================
// ADD PROPERTY - POST
// ==========================

app.post("/api/properties", async function (req, res) {

    try {

        const property = await Property.create(req.body);

        res.status(201).json({
            success: true,
            message: "Property added successfully",
            property: property
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: "Failed to add property",
            error: error.message
        });

    }

});


// ==========================
// USERS ROUTE
// ==========================

app.get("/api/users", function (req, res) {

    res.json({
        success: true,
        message: "Users API is working"
    });

});


// ==========================
// MONGODB CONNECTION
// ==========================

mongoose.connect(MONGO_URI)

    .then(function () {

        console.log("MongoDB connected successfully");

    })

    .catch(function (error) {

        console.log("MongoDB connection error:", error);

    });


// ==========================
// START SERVER
// ==========================

app.listen(PORT, function () {

    console.log(`Server running on http://localhost:${PORT}`);

});