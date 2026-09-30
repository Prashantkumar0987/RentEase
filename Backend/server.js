require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const Property = require("./models/Property");
const User = require("./models/User");
const Maintenance = require("./models/Maintenance");
const RentalApplication = require("./models/RentalApplication");
const Rent = require("./models/rent");


const verifyToken = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


// ==========================
// MIDDLEWARE
// ==========================
app.use(cors());
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


 // GET PROPERTIES WITH LOCATION FILTER

app.get("/api/properties", async function (req, res) {
    try {
        const {
            location,
            type,
            minRent,
            maxRent,
            sort,
            page = "1",
            limit = "10"
        } = req.query;
        
        const currentPage = Number(page);
        const pageLimit = Number(limit);

        if (
            !Number.isInteger(currentPage) ||
            currentPage < 1 ||
            !Number.isInteger(pageLimit) ||
            pageLimit < 1 ||
            pageLimit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "page must be a positive integer and limit must be between 1 and 100"
            });
        }

        const skip = (currentPage - 1) * pageLimit;

        const filter = {};

        if (location && location.trim() !== "") {
            filter.location = {
                $regex: location.trim(),
                $options: "i"
            };
        }
        // Filter by property type
        if (type && type.trim() !== "") {
            filter.type = {
                $regex: type.trim(),
                $options: "i"
            };
        }
        
        // Minimum rent filter
        if (minRent !== undefined && minRent !== "") {
            const min = Number(minRent);

            if (!Number.isFinite(min) || min < 0) {
                return res.status(400).json({
                    success: false,
                    message: "minRent must be a valid non-negative number"
                });
            }

            filter.rent = {
                ...filter.rent,
                $gte: min
            };
        }

        // Maximum rent filter
        if (maxRent !== undefined && maxRent !== "") {
            const max = Number(maxRent);

            if (!Number.isFinite(max) || max < 0) {
                return res.status(400).json({
                    success: false,
                    message: "maxRent must be a valid non-negative number"
                });
            }

            filter.rent = {
                ...filter.rent,
                $lte: max
            };
        }

        // Check that minimum rent is not greater than maximum rent
        if (
            filter.rent?.$gte !== undefined &&
            filter.rent?.$lte !== undefined &&
            filter.rent.$gte > filter.rent.$lte
        ) {
            return res.status(400).json({
                success: false,
                message: "minRent cannot be greater than maxRent"
            });
        }

        
        const sortOptions = {};

        if (sort === "low") {
            sortOptions.rent = 1;   // Low to high
        } else if (sort === "high") {
            sortOptions.rent = -1;  // High to low
        }

        const properties = await Property.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageLimit);

        const totalProperties = await Property.countDocuments(filter);

       res.status(200).json({
            success: true,
            count: properties.length,
            pagination: {
                currentPage: currentPage,
                limit: pageLimit,
                totalProperties: totalProperties,
                totalPages: Math.ceil(totalProperties / pageLimit)
            },
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
    "/api/owner/applications",
    verifyToken,
    authorizeRoles("owner"),
    async function(req, res) {

        try {

            const applications = await RentalApplication.find()
                .populate("property")
                .populate("tenant", "-password");

            const ownerApplications = applications.filter(function(application) {
                return application.property &&
                       application.property.owner &&
                       application.property.owner.toString() === req.user.id.toString();
            });

            res.status(200).json({
                success: true,
                applications: ownerApplications
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Failed to fetch applications",
                error: error.message
            });

        }
    }
);
app.put(
    "/api/applications/:id/status",
    verifyToken,
    authorizeRoles("owner"),
    async function(req, res) {

        try {

            const { status } = req.body;

            // Check valid status
            if (!["approved", "rejected"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Status must be approved or rejected"
                });
            }

            // Find application
            const application = await RentalApplication.findById(req.params.id)
                .populate("property");

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found"
                });
            }

            // Check property ownership
            if (
                !application.property.owner ||
                application.property.owner.toString() !== req.user.id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not allowed to update this application"
                });
            }

            // Update status
            application.status = status;

            await application.save();

            res.status(200).json({
                success: true,
                message: `Application ${status} successfully`,
                application: application
            });

        } catch (error) {

            res.status(400).json({
                success: false,
                message: "Failed to update application status",
                error: error.message
            });

        }
    }
);
app.post(
    "/api/rents",
    verifyToken,
    authorizeRoles("owner"),
    async function(req, res) {

        try {

            const { propertyId, tenantId, amount, dueDate } = req.body;

            // Check property belongs to logged-in owner
            const property = await Property.findOne({
                _id: propertyId,
                owner: req.user.id
            });

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found or not owned by you"
                });
            }

            // Check tenant
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

            // Create rent record
            const rent = await Rent.create({
                property: propertyId,
                tenant: tenantId,
                amount: amount,
                dueDate: dueDate
            });

            res.status(201).json({
                success: true,
                message: "Rent record created successfully",
                rent: rent
            });

        } catch (error) {

            res.status(400).json({
                success: false,
                message: "Failed to create rent record",
                error: error.message
            });

        }
    }
);
app.get(
    "/api/tenant/rents",
    verifyToken,
    authorizeRoles("tenant"),
    async function(req, res) {

        try {

            const rents = await Rent.find({
                tenant: req.user.id
            })
            .populate("property");

            res.status(200).json({
                success: true,
                rents: rents
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Failed to fetch rent records",
                error: error.message
            });

        }
    }
);

app.get(
    "/api/tenant/rent-history",
    verifyToken,
    authorizeRoles("tenant"),
    async function (req, res) {
        try {
            const rents = await Rent.find({
                tenant: req.user.id
            })
                .populate("property", "title location")
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: rents.length,
                history: rents
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch rent history",
                error: error.message
            });
        }
    }
);

app.get(
    "/api/tenant/rent-summary",
    verifyToken,
    authorizeRoles("tenant"),
    async function (req, res) {
        try {
            const rents = await Rent.find({
                tenant: req.user.id
            });

            let totalRent = 0;
            let paidRent = 0;
            let pendingRent = 0;
            let paidCount = 0;
            let pendingCount = 0;

            rents.forEach(function (rent) {
                totalRent += rent.amount;

                if (rent.status === "paid") {
                    paidRent += rent.amount;
                    paidCount++;
                } else if (rent.status === "pending") {
                    pendingRent += rent.amount;
                    pendingCount++;
                }
            });

            res.status(200).json({
                success: true,
                summary: {
                    totalRent: totalRent,
                    paidRent: paidRent,
                    pendingRent: pendingRent,
                    paidCount: paidCount,
                    pendingCount: pendingCount,
                    totalRecords: rents.length
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to calculate rent summary",
                error: error.message
            });
        }
    }
);
app.put(
    "/api/rents/:id/pay",
    verifyToken,
    authorizeRoles("tenant"),
    async function(req, res) {

        try {

            const rent = await Rent.findOne({
                _id: req.params.id,
                tenant: req.user.id
            });

            if (!rent) {
                return res.status(404).json({
                    success: false,
                    message: "Rent record not found"
                });
            }

            if (rent.status === "paid") {
                return res.status(400).json({
                    success: false,
                    message: "Rent is already paid"
                });
            }

            rent.status = "paid";
            rent.paidAt = new Date();

            await rent.save();

            res.status(200).json({
                success: true,
                message: "Rent marked as paid successfully",
                rent: rent
            });

        } catch (error) {

            res.status(400).json({
                success: false,
                message: "Failed to update rent",
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
app.post(
    "/api/maintenance",
    verifyToken,
    authorizeRoles("tenant"),
    async function(req, res) {
        try {
            const { propertyId, title, description } = req.body;

            const property = await Property.findOne({
                _id: propertyId,
                tenant: req.user.id
            });

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found or not assigned to you"
                });
            }

            const complaint = await Maintenance.create({
                property: propertyId,
                tenant: req.user.id,
                title: title,
                description: description
            });

            res.status(201).json({
                success: true,
                message: "Maintenance complaint submitted successfully",
                complaint: complaint
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to submit maintenance complaint",
                error: error.message
            });
        }
    }
);
// ==========================
// TENANT - VIEW OWN MAINTENANCE COMPLAINTS
// ==========================

app.get(
    "/api/tenant/maintenance",
    verifyToken,
    authorizeRoles("tenant"),
    async function (req, res) {

        try {

            const complaints = await Maintenance.find({
                tenant: req.user.id
            })
            .populate("property");

            res.status(200).json({
                success: true,
                complaints: complaints
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Failed to fetch maintenance complaints",
                error: error.message
            });

        }
    }
);

 // OWNER - VIEW MAINTENANCE COMPLAINTS

app.get(
    "/api/owner/maintenance",
    verifyToken,
    authorizeRoles("owner"),
    async function (req, res) {
        try {
            // Find properties belonging to this owner
            const properties = await Property.find({
                owner: req.user.id
            }).select("_id");

            // Extract property IDs
            const propertyIds = properties.map(function (property) {
                return property._id;
            });

            // Find complaints for those properties
            const complaints = await Maintenance.find({
                property: { $in: propertyIds }
            })
                .populate("property")
                .populate("tenant", "-password");

            res.status(200).json({
                success: true,
                complaints: complaints
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch maintenance complaints",
                error: error.message
            });
        }
    }
);

app.put(
    "/api/maintenance/:id/status",
    verifyToken,
    authorizeRoles("owner"),
    async function (req, res) {
        try {
            const { status } = req.body;

            // Validate status
            const allowedStatuses = [
                "pending",
                "in-progress",
                "resolved"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status"
                });
            }

            // Find complaint and its property
            const complaint = await Maintenance.findById(
                req.params.id
            ).populate("property");

            if (!complaint) {
                return res.status(404).json({
                    success: false,
                    message: "Maintenance complaint not found"
                });
            }

            // Check whether the logged-in owner owns the property
            if (
                !complaint.property ||
                complaint.property.owner.toString() !== req.user.id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not allowed to update this complaint"
                });
            }

            // Update status
            complaint.status = status;
            await complaint.save();

            res.status(200).json({
                success: true,
                message: "Maintenance status updated successfully",
                complaint: complaint
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to update maintenance status",
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