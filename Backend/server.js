const express = require("express");

const app = express();

const PORT = 5000;


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
// GET PROPERTIES
// ==========================

app.get("/api/properties", function (req, res) {

    const properties = [
        {
            id: 1,
            title: "Modern 2BHK Apartment",
            location: "Kolkata",
            type: "Apartment",
            rent: 15000
        },
        {
            id: 2,
            title: "Premium Family House",
            location: "Haldia",
            type: "House",
            rent: 12000
        }
    ];

    res.json({
        success: true,
        properties: properties
    });
});


// ==========================
// ADD PROPERTY - POST
// ==========================

app.post("/api/properties", function (req, res) {

    const property = req.body;

    // Basic validation
    if (
        !property.title ||
        !property.location ||
        !property.type ||
        !property.rent
    ) {
        return res.status(400).json({
            success: false,
            message: "Please provide title, location, type and rent."
        });
    }

    console.log("New Property:", property);

    res.status(201).json({
        success: true,
        message: "Property added successfully",
        property: property
    });
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
// START SERVER
// ==========================

app.listen(PORT, function () {
    console.log(`Server running on http://localhost:${PORT}`);
});