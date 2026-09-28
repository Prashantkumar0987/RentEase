require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Property = require("./models/Property");
const User = require("./models/User");
const RentalApplication = require("./models/RentalApplication");

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
app.get(
    "/api/tenants",
    verifyToken,
    authorizeRoles("owner", "admin"),
    async function (req, res) {

        try {

            const tenants = await User.find({
                role: "tenant"
            }).select("-password");

            res.status(200).json({
                success: true,
                tenants: tenants
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Failed to fetch tenants",
                error: error.message
            });

        }
    }
);
app.get(
    "/api/tenants/:id",
    verifyToken,
    authorizeRoles("owner", "admin"),
    async function (req, res) {

        try {

            const tenant = await User.findOne({
                _id: req.params.id,
                role: "tenant"
            }).select("-password");

            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    message: "Tenant not found"
                });
            }

            res.status(200).json({
                success: true,
                tenant: tenant
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Failed to fetch tenant",
                error: error.message
            });

        }
    }
);
app.post(
    "/api/applications",
    verifyToken,
    authorizeRoles("tenant"),
    async function(req, res) {

        try {

            const { propertyId, message } = req.body;

            // Check property
            const property = await Property.findById(propertyId);

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found"
                });
            }

            // Check if already applied
            const existingApplication = await RentalApplication.findOne({
                property: propertyId,
                tenant: req.user.id
            });

            if (existingApplication) {
                return res.status(400).json({
                    success: false,
                    message: "You have already applied for this property"
                });
            }

            // Create application
            const application = await RentalApplication.create({
                property: propertyId,
                tenant: req.user.id,
                message: message || ""
            });

            res.status(201).json({
                success: true,
                message: "Rental application submitted successfully",
                application: application
            });

        } catch (error) {

            res.status(400).json({
                success: false,
                message: "Failed to submit rental application",
                error: error.message
            });

        }
    }
);
app.put(
    "/api/properties/:propertyId/assign-tenant",
    verifyToken,
    authorizeRoles("owner"),
    async function (req, res) {

        try {

            const property = await Property.findOne({
                _id: req.params.propertyId,
                owner: req.user.id
            });

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found or not owned by you"
                });
            }

            const { tenantId } = req.body;

            const tenant = await User.findOne({
                _id: tenantId,
                role: "tenant"
            });

            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    message: "Tenant not found"
                });
            }

            property.tenant = tenant._id;

            await property.save();

            res.status(200).json({
                success: true,
                message: "Tenant assigned successfully",
                property: property
            });

        } catch (error) {

            res.status(400).json({
                success: false,
                message: "Failed to assign tenant",
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

        console.log(
            "MongoDB connection state:",
            mongoose.connection.readyState
        );

        // Start server only after MongoDB connects
        app.listen(PORT, function () {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    })
    .catch(function (error) {

        console.log("MongoDB connection error:", error);

    });


// MongoDB connection events

mongoose.connection.on("error", function (error) {
    console.log("MongoDB runtime error:", error);
});

mongoose.connection.on("disconnected", function () {
    console.log("MongoDB disconnected");
});