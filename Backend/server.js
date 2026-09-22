const express = require("express");

const app = express();

const PORT = 5000;

// Middleware
app.use(express.json());


// HOME ROUTE

app.get("/", function (req, res) {
    res.send("RentEase Backend is Running!");
});


// HEALTH ROUTE

app.get("/api/health", function (req, res) {
    res.json({
        success: true,
        message: "RentEase API is working"
    });
});


// ==========================
// PROPERTIES ROUTE
// ==========================

app.get("/api/properties", function (req, res) {

    const properties = [
        {
            id: 1,
            title: "Modern 2BHK Apartment",
            location: "Kolkata",
            rent: 15000
        },
        {
            id: 2,
            title: "Premium Family House",
            location: "Haldia",
            rent: 12000
        }
    ];

    res.json({
        success: true,
        properties: properties
    });
});


// USERS ROUTE

app.get("/api/users", function (req, res) {

    res.json({
        success: true,
        message: "Users API is working"
    });

});

// START SERVER

app.listen(PORT, function () {
    console.log(`Server running on http://localhost:${PORT}`);
});