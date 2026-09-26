require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Property = require("./models/Property");
const User = require("./models/User");

const verifyToken = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");

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
// REGISTER USER - POST
// ==========================

app.post("/api/users/register", async function (req, res) {

    try {

        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({
            email: email
        });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "User already exists"
            });

        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: role
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: "Registration failed",
            error: error.message
        });

    }

});


// ==========================
// LOGIN USER - POST
// ==========================

app.post("/api/users/login", async function (req, res) {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
});
// ==========================
// PROTECTED PROFILE API
// ==========================

app.get("/api/profile", verifyToken, async function (req, res) {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Protected profile accessed",
            user: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message
        });
    }
});
// ==========================
// OWNER ONLY API
// ==========================

app.get(
    "/api/owner/dashboard",
    verifyToken,
    authorizeRoles("owner"),
    function (req, res) {

        res.status(200).json({
            success: true,
            message: "Welcome to Owner Dashboard",
            user: req.user
        });

    }
);


// ==========================
// UPDATE PROPERTY - PUT
// ==========================

app.put(
    "/api/properties/:id",
    verifyToken,
    authorizeRoles("owner"),
    async function (req, res) {

        try {

            const updatedProperty = await Property.findOneAndUpdate(
                {
                    _id: req.params.id,
                    owner: req.user.id
                },
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!updatedProperty) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found or not owned by you"
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
    }
);


// ==========================
// DELETE PROPERTY - DELETE
// ==========================

app.delete(
    "/api/properties/:id",
    verifyToken,
    authorizeRoles("owner"),
    async function (req, res) {

        try {

            const deletedProperty = await Property.findOneAndDelete({
                _id: req.params.id,
                owner: req.user.id
            });

            if (!deletedProperty) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found or not owned by you"
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
    }
);


// ==========================
// ADD PROPERTY - POST
// ==========================

app.post(
    "/api/properties",
    verifyToken,
    authorizeRoles("owner"),
    async function (req, res) {

        try {

            const { title, location, type, rent } = req.body;

            const property = await Property.create({
                title: title,
                location: location,
                type: type,
                rent: rent,
                owner: req.user.id
            });

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
    }
);
app.get(
    "/api/owner/properties",
    verifyToken,
    authorizeRoles("owner"),
    async function (req, res) {

        try {

            const properties = await Property.find({
                owner: req.user.id
            });

            res.status(200).json({
                success: true,
                properties: properties
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Failed to fetch properties",
                error: error.message
            });

        }
    }
);


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