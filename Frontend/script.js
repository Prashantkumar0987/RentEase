// ======================================================
// RENT EASE - COMPLETE SCRIPT.JS
// DAY 2 TO DAY 14
// ======================================================


// ======================================================
// DAY 2 - HOME PROPERTY SEARCH
// ======================================================

const propertySearch = document.querySelector("#propertySearch");

if (propertySearch) {

    propertySearch.addEventListener("submit", function (event) {

        event.preventDefault();

        const location =
            document.querySelector("#location").value.trim();

        const propertyType =
            document.querySelector("#propertyType").value;

        const budget =
            document.querySelector("#budget").value;

        const searchData = {
            location: location,
            propertyType: propertyType,
            budget: budget
        };

        localStorage.setItem(
            "renteaseSearch",
            JSON.stringify(searchData)
        );

        window.location.href = "properties.html";

    });

}


// ======================================================
// DAY 3 - STATIC PROPERTY DATA
// ======================================================

const properties = [

    {
        id: 1,
        title: "Modern 2BHK Apartment",
        location: "Kolkata",
        type: "Apartment",
        rent: 15000,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
    },

    {
        id: 2,
        title: "Premium Family House",
        location: "Haldia",
        type: "House",
        rent: 12000,
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"
    },

    {
        id: 3,
        title: "Affordable Student PG",
        location: "Durgapur",
        type: "PG",
        rent: 7000,
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5"
    },

    {
        id: 4,
        title: "Single Room Near College",
        location: "Kolkata",
        type: "Room",
        rent: 8000,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
    },

    {
        id: 5,
        title: "Luxury 3BHK Apartment",
        location: "New Town",
        type: "Apartment",
        rent: 20000,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
    },

    {
        id: 6,
        title: "Budget Friendly House",
        location: "Haldia",
        type: "House",
        rent: 9000,
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
    }

];


// ======================================================
// DAY 14 - LOAD OWNER PROPERTIES
// ======================================================

const savedOwnerProperties =
    localStorage.getItem("renteaseProperties");

if (savedOwnerProperties) {

    try {

        const ownerProperties =
            JSON.parse(savedOwnerProperties);

        if (Array.isArray(ownerProperties)) {

            ownerProperties.forEach(function (property) {

                const alreadyExists =
                    properties.some(function (existingProperty) {

                        return existingProperty.id === property.id;

                    });

                if (!alreadyExists) {

                    properties.push(property);

                }

            });

        }

    } catch (error) {

        console.log(
            "Error loading saved properties:",
            error
        );

    }

}


// ======================================================
// DAY 3 - PROPERTY LIST
// ======================================================

const propertyList =
    document.querySelector("#propertyList");


// ======================================================
// DISPLAY PROPERTIES
// ======================================================

function displayProperties(propertyArray) {

    if (!propertyList) {

        return;

    }

    propertyList.innerHTML = "";

    if (propertyArray.length === 0) {

        propertyList.innerHTML = `
            <p class="no-property">
                No properties found.
            </p>
        `;

        return;

    }

    propertyArray.forEach(function (property) {

        const card =
            document.createElement("div");

        card.classList.add("property-card");

        card.innerHTML = `

            <img
                src="${property.image}"
                alt="${property.title}"
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6';"
            >

            <div class="property-info">

                <h3>
                    ${property.title}
                </h3>

                <p class="property-location">
                    📍 ${property.location}
                </p>

                <p class="property-rent">
                    ₹${property.rent.toLocaleString("en-IN")}
                    / month
                </p>

                <span class="property-type">
                    ${property.type}
                </span>

                <a
                    href="property-details.html?id=${property._id || property.id}"
                    class="details-btn"
                >
                    View Details
                </a>

            </div>

        `;

        propertyList.appendChild(card);

    });

}


// ======================================================
// DAY 3 - FILTER ELEMENTS
// ======================================================

const searchLocation =
    document.querySelector("#searchLocation");

const filterType =
    document.querySelector("#filterType");

const filterBudget =
    document.querySelector("#filterBudget");


// ======================================================
// DAY 11 - SORT
// ======================================================

const sortProperties =
    document.querySelector("#sortProperties");

    // ==========================================
// DAY 35 - BACKEND PROPERTY SEARCH
// ==========================================

const API_BASE_URL = "http://localhost:5000";

let currentPage = 1;
const propertiesPerPage = 6;

const prevPageBtn = document.querySelector("#prevPage");
const nextPageBtn = document.querySelector("#nextPage");
const pageInfo = document.querySelector("#pageInfo");

// Fetch properties from backend
async function fetchPropertiesFromAPI() {
    if (!propertyList) return;

    const message = document.querySelector("#propertyMessage");

    try {
        if (message) {
            message.textContent = "Loading properties...";
        }

        const params = new URLSearchParams();

        const location = searchLocation?.value.trim();
        const type = filterType?.value;
        const budget = filterBudget?.value;
        const sort = sortProperties?.value;

        if (location) {
            params.set("location", location);
        }

        if (type) {
            params.set("type", type);
        }

        if (budget) {
            params.set("maxRent", budget);
        }

        // Map frontend values to backend values
        if (sort === "lowToHigh") {
            params.set("sort", "low");
        } else if (sort === "highToLow") {
            params.set("sort", "high");
        }

        params.set("page", currentPage);
        params.set("limit", propertiesPerPage);

        const response = await fetch(
            `${API_BASE_URL}/api/properties?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Failed to load properties"
            );
        }

        // Render backend properties using existing card function
        displayProperties(data.properties || []);

        const pagination = data.pagination || {};

        if (pageInfo) {
            pageInfo.textContent =
                `Page ${pagination.currentPage || currentPage} of ${pagination.totalPages || 0}`;
        }

        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage <= 1;
        }

        if (nextPageBtn) {
            nextPageBtn.disabled =
                currentPage >= (pagination.totalPages || 0);
        }

        if (message) {
            message.textContent =
                data.count === 0
                    ? "No properties found. Try changing your filters."
                    : `${pagination.totalProperties ?? data.count} properties found.`;
        }

    } catch (error) {
        console.error("Property API error:", error);

        propertyList.innerHTML = `
            <p class="no-property">
                Unable to load properties.
                Please check whether the backend is running.
            </p>
        `;

        if (message) {
            message.textContent = error.message;
        }
    }
}
// ==========================================
// DAY 35 - PAGINATION EVENTS
// ==========================================

if (prevPageBtn) {
    prevPageBtn.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            fetchPropertiesFromAPI();
        }
    });
}

if (nextPageBtn) {
    nextPageBtn.addEventListener("click", function () {
        currentPage++;
        fetchPropertiesFromAPI();
    });
}


// ======================================================
// FILTER + SORT FUNCTION
// ======================================================

function filterProperties() {
        // Day 35: Use backend API on Properties page
    if (propertyList) {
        currentPage = 1;
        fetchPropertiesFromAPI();
        return;
    }

    if (
        !searchLocation ||
        !filterType ||
        !filterBudget
    ) {

        return;

    }

    const locationValue =
        searchLocation.value
            .toLowerCase()
            .trim();

    const typeValue =
        filterType.value;

    const budgetValue =
        filterBudget.value;


    let filteredProperties =
        properties.filter(function (property) {

            const locationMatch =
                property.location
                    .toLowerCase()
                    .includes(locationValue);

            const typeMatch =
                typeValue === "" ||
                property.type === typeValue;

            const budgetMatch =
                budgetValue === "" ||
                property.rent <= Number(budgetValue);

            return (
                locationMatch &&
                typeMatch &&
                budgetMatch
            );

        });


    // SORT LOW TO HIGH

    if (
        sortProperties &&
        sortProperties.value === "lowToHigh"
    ) {

        filteredProperties.sort(function (a, b) {

            return a.rent - b.rent;

        });

    }


    // SORT HIGH TO LOW

    if (
        sortProperties &&
        sortProperties.value === "highToLow"
    ) {

        filteredProperties.sort(function (a, b) {

            return b.rent - a.rent;

        });

    }


    displayProperties(filteredProperties);

}


// ======================================================
// SHOW PROPERTIES
// ======================================================

if (propertyList) {
    fetchPropertiesFromAPI();
} else {
    displayProperties(properties);
}


// ======================================================
// FILTER EVENTS
// ======================================================

if (searchLocation) {

    searchLocation.addEventListener(
        "input",
        filterProperties
    );

}

if (filterType) {

    filterType.addEventListener(
        "change",
        filterProperties
    );

}

if (filterBudget) {

    filterBudget.addEventListener(
        "change",
        filterProperties
    );

}


// ========================================
// DAY 36 - PROPERTY DETAILS API
// ========================================

const propertyDetails = document.querySelector("#propertyDetails");

if (propertyDetails) {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get("id");

    const PROPERTY_DETAILS_API_URL = "http://localhost:5000";
    const fallbackImage =
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";

    // Show error message
    function showPropertyError(message) {
        propertyDetails.innerHTML = `
            <div class="no-property">
                <h2>Property not found</h2>
                <p>${message}</p>
                <a href="properties.html">Back to Properties</a>
            </div>
        `;
    }

    // Display selected property
    function renderPropertyDetails(selectedProperty) {
        if (!selectedProperty) {
            showPropertyError(
                "Please select a valid property from the Properties page."
            );
            return;
        }

        const rent = Number(selectedProperty.rent) || 0;

        const image =
            selectedProperty.image ||
            selectedProperty.imageUrl ||
            fallbackImage;

        const amenities = Array.isArray(selectedProperty.amenities)
            ? selectedProperty.amenities
            : ["Parking", "WiFi", "Security", "Lift"];

        propertyDetails.innerHTML = `
            <div class="details-card">

                <img
                    src="${image}"
                    alt="${selectedProperty.title || "Rental property"}"
                    class="details-image"
                    onerror="this.onerror=null; this.src='${fallbackImage}';"
                >

                <div class="details-content">

                    <span class="property-type">
                        ${selectedProperty.type || "Property"}
                    </span>

                    <h1>
                        ${selectedProperty.title || "Rental Property"}
                    </h1>

                    <p class="property-location">
                        📍 ${selectedProperty.location || "Location not specified"}
                    </p>

                    <h2 class="details-rent">
                        ₹${rent.toLocaleString("en-IN")} / month
                    </h2>

                    <div class="property-features">

                        <div>
                            🛏️
                            <strong>${selectedProperty.bedrooms || 2}</strong>
                            Bedrooms
                        </div>

                        <div>
                            🚿
                            <strong>${selectedProperty.bathrooms || 2}</strong>
                            Bathrooms
                        </div>

                        <div>
                            📐
                            <strong>${selectedProperty.area || "1200 sq.ft"}</strong>
                        </div>

                        <div>
                            🛋️
                            <strong>${selectedProperty.furnished || "Semi-Furnished"}</strong>
                        </div>

                    </div>

                    <h2>About Property</h2>

                    <p>
                        ${
                            selectedProperty.description ||
                            "This is a comfortable property available for rent."
                        }
                    </p>

                    <h2>Amenities</h2>

                    <div class="amenities">
                        ${
                            amenities.map(function (amenity) {
                                return `<span>${amenity}</span>`;
                            }).join("")
                        }
                    </div>

                    <button
                        type="button"
                        class="contact-owner-btn"
                    >
                        Contact Owner
                    </button>
                    
                    <div class="application-form">
                        <h2>Apply for Rent</h2>

                        <label for="applicationMessage">
                            Message to Owner (optional)
                        </label>

                        <textarea
                            id="applicationMessage"
                            rows="4"
                            maxlength="1000"
                            placeholder="Introduce yourself and tell the owner why you're interested..."
                        ></textarea>

                        <button
                            type="button"
                            id="applyForRentBtn"
                            class="apply-rent-btn"
                        >
                            Apply for Rent
                        </button>

                        <p
                            id="applicationMessageStatus"
                            role="status"
                            aria-live="polite"
                        ></p>
                    </div>

                </div>
            </div>
        `;
        
        const applyButton = document.querySelector("#applyForRentBtn");
        const applicationInput = document.querySelector("#applicationMessage");
        const applicationStatus = document.querySelector("#applicationMessageStatus");

        if (applyButton && applicationInput && applicationStatus) {
            applyButton.addEventListener("click", async function () {
                const token = localStorage.getItem("renteaseToken");
                const userData = JSON.parse(
                    localStorage.getItem("renteaseUser") || "null"
                );

                if (!token) {
                    applicationStatus.textContent =
                        "Please log in first to apply for this property.";
                    return;
                }

                if (!userData || String(userData.role).toLowerCase() !== "tenant") {
                    applicationStatus.textContent =
                        "Only tenant accounts can apply for rent.";
                    return;
                }

                // Applications require a real MongoDB property ID.
                if (!/^[a-f\d]{24}$/i.test(propertyId || "")) {
                    applicationStatus.textContent =
                        "Please select a property from the database-backed listing.";
                    return;
                }

                const message = applicationInput.value.trim();

                try {
                    applyButton.disabled = true;
                    applicationStatus.textContent = "Submitting application...";

                    const response = await fetch(
                        "http://localhost:5000/api/applications",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                propertyId: propertyId,
                                message: message
                            })
                        }
                    );

                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        throw new Error(
                            data.message || "Failed to submit application."
                        );
                    }

                    applicationStatus.textContent =
                        "Application submitted successfully!";

                    applicationInput.value = "";

                } catch (error) {
                    console.error("Rental application error:", error);
                    applicationStatus.textContent = error.message;
                } finally {
                    applyButton.disabled = false;
                }
            });
        }
    }

    // Load property details
    async function loadPropertyDetails() {
        if (!propertyId) {
            showPropertyError("No property ID was provided in the URL.");
            return;
        }

        propertyDetails.innerHTML = `
            <p class="no-property">Loading property details...</p>
        `;

        // MongoDB ObjectId is normally a 24-character hexadecimal string
        const isMongoId = /^[a-f\d]{24}$/i.test(propertyId);

        if (isMongoId) {
            try {
                const response = await fetch(
                    `${PROPERTY_DETAILS_API_URL}/api/properties/${encodeURIComponent(propertyId)}`
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Unable to load this property."
                    );
                }

                renderPropertyDetails(data.property);

            } catch (error) {
                console.error("Property details API error:", error);

                showPropertyError(
                    error.message ||
                    "Unable to connect to the backend. Please try again."
                );
            }

        } else {
            // Preserve old static/localStorage property support
            const numericId = Number(propertyId);

            const selectedProperty = properties.find(function (property) {
                return Number(property.id) === numericId;
            });

            renderPropertyDetails(selectedProperty);
        }
    }

    loadPropertyDetails();
}

//LOGIN AND SIGNUP

const loginForm = document.querySelector("#loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.querySelector("#loginEmail").value.trim();
        const password = document.querySelector("#loginPassword").value.trim();
        const loginMessage = document.querySelector("#loginMessage");

        if (!email || !password) {
            loginMessage.textContent = "Please enter email and password.";
            return;
        }

        try {
            loginMessage.textContent = "Logging in...";

            const response = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.token) {
                throw new Error(data.message || "Login failed.");
            }

            // Save the real backend JWT
            localStorage.setItem("renteaseToken", data.token);

            // Preserve user details for existing frontend features
            localStorage.setItem("renteaseUser", JSON.stringify(data.user));

            loginMessage.textContent = "Login successful! Redirecting...";

            const role = String(data.user.role || "").toLowerCase();

            setTimeout(function () {
                if (role === "owner" || role === "property owner") {
                    window.location.href = "owner-dashboard.html";
                } else {
                    window.location.href = "tenant-dashboard.html";
                }
            }, 700);

        } catch (error) {
            console.error("Login error:", error);
            loginMessage.textContent = error.message ||
                "Unable to connect to the backend.";
        }
    });
}

const signupForm =
    document.querySelector("#signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document.querySelector("#signupName")
                    .value
                    .trim();

            const email =
                document.querySelector("#signupEmail")
                    .value
                    .trim();

            const password =
                document.querySelector("#signupPassword")
                    .value
                    .trim();

            const confirmPassword =
                document.querySelector("#confirmPassword")
                    .value
                    .trim();

            const role =
                document.querySelector("#userRole")
                    .value;

            const signupMessage =
                document.querySelector("#signupMessage");


            if (name === "") {

                signupMessage.textContent =
                    "Please enter your name.";

                return;

            }


            if (name.length < 3) {

                signupMessage.textContent =
                    "Name must be at least 3 characters.";

                return;

            }


            if (email === "") {

                signupMessage.textContent =
                    "Please enter your email.";

                return;

            }


            if (!email.includes("@")) {

                signupMessage.textContent =
                    "Please enter a valid email.";

                return;

            }


            if (password === "") {

                signupMessage.textContent =
                    "Please enter a password.";

                return;

            }


            if (password.length < 6) {

                signupMessage.textContent =
                    "Password must be at least 6 characters.";

                return;

            }


            if (password !== confirmPassword) {

                signupMessage.textContent =
                    "Passwords do not match.";

                return;

            }


            if (role === "") {

                signupMessage.textContent =
                    "Please select your role.";

                return;

            }


            const userData = {

                name: name,
                email: email,
                password: password,
                role: role

            };


            localStorage.setItem(
                "renteaseUser",
                JSON.stringify(userData)
            );


            signupMessage.textContent =
                "Account created successfully!";

        }
    );

}


// ======================================================
// DAY 8 - DOM PRACTICE
// ======================================================

const domButton =
    document.querySelector("#domButton");

if (domButton) {

    domButton.addEventListener(
        "click",
        function () {

            const domMessage =
                document.querySelector("#domMessage");

            if (domMessage) {

                domMessage.textContent =
                    "DOM successfully changed the webpage!";

            }

        }
    );

}


// ======================================================
// DAY 8 - SHOW TENANT NAME
// ======================================================

const nameButton =
    document.querySelector("#nameButton");

if (nameButton) {

    nameButton.addEventListener(
        "click",
        function () {

            const tenantName =
                document.querySelector("#tenantName")
                    .value
                    .trim();

            const nameOutput =
                document.querySelector("#nameOutput");


            if (tenantName === "") {

                nameOutput.textContent =
                    "Please enter your name.";

                return;

            }


            nameOutput.textContent =
                "Welcome, " + tenantName + "!";

        }
    );

}


// ======================================================
// DAY 9 - LOAD SAVED SEARCH
// ======================================================

if (
    searchLocation &&
    filterType &&
    filterBudget
) {

    const savedSearch =
        localStorage.getItem(
            "renteaseSearch"
        );


    if (savedSearch) {

        try {

            const searchData =
                JSON.parse(savedSearch);


            searchLocation.value =
                searchData.location || "";

            filterType.value =
                searchData.propertyType || "";

            filterBudget.value =
                searchData.budget || "";


            filterProperties();

        } catch (error) {

            console.log(
                "Error loading saved search:",
                error
            );

        }

    }

}


// ======================================================
// DAY 10 - RESET FILTERS
// ======================================================

const resetFilters =
    document.querySelector("#resetFilters");

if (resetFilters) {

    resetFilters.addEventListener(
        "click",
        function () {

            if (searchLocation) {

                searchLocation.value = "";

            }

            if (filterType) {

                filterType.value = "";

            }

            if (filterBudget) {

                filterBudget.value = "";

            }

            if (sortProperties) {

                sortProperties.value = "";

            }


            localStorage.removeItem(
                "renteaseSearch"
            );


            filterProperties();

        }
    );

}


// ======================================================
// DAY 11 - SORT
// ======================================================

if (sortProperties) {

    sortProperties.addEventListener(
        "change",
        function () {

            filterProperties();

        }
    );

}


// ======================================================
// DAY 14 - CRUD
// ======================================================

const propertyForm =
    document.querySelector("#propertyForm");

const ownerPropertyList =
    document.querySelector("#ownerPropertyList");

const propertyMessage =
    document.querySelector("#propertyMessage");


// ======================================================
// CREATE PROPERTY - BACKEND
// ======================================================

if (propertyForm) {

    propertyForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const title =
                document.querySelector("#propertyTitle")
                    .value
                    .trim();

            const location =
                document.querySelector("#propertyLocation")
                    .value
                    .trim();

            const type =
                document.querySelector("#propertyType")
                    .value;

            const rent =
                document.querySelector("#propertyRent")
                    .value;

            const image =
                document.querySelector("#propertyImage")
                    .value
                    .trim();

            const statusElement =
                document.querySelector("#propertyStatus");

            const status =
                statusElement
                    ? statusElement.value
                    : "Available";


            // ==========================================
            // VALIDATION
            // ==========================================

            if (title === "") {

                propertyMessage.textContent =
                    "Please enter property title.";

                return;
            }


            if (location === "") {

                propertyMessage.textContent =
                    "Please enter location.";

                return;
            }


            if (type === "") {

                propertyMessage.textContent =
                    "Please select property type.";

                return;
            }


            if (rent === "") {

                propertyMessage.textContent =
                    "Please enter rent.";

                return;
            }


            if (Number(rent) <= 0) {

                propertyMessage.textContent =
                    "Rent must be greater than 0.";

                return;
            }


            // ==========================================
            // GET JWT TOKEN
            // ==========================================

            const token =
                localStorage.getItem(
                    "renteaseToken"
                );


            if (!token) {

                propertyMessage.textContent =
                    "Please login as an owner first.";

                return;
            }


            // ==========================================
            // DEFAULT IMAGE
            // ==========================================

            const defaultImage =
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";


            // ==========================================
            // PROPERTY DATA
            // ==========================================

            const propertyData = {

                title: title,

                location: location,

                type: type,

                rent: Number(rent),

                image: image || defaultImage,

                status: status || "Available"

            };


            // ==========================================
            // SEND TO BACKEND
            // ==========================================

            try {

                propertyMessage.textContent =
                    "Adding property...";


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/properties`,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify(
                                    propertyData
                                )
                        }
                    );


                const data =
                    await response.json();


                // ======================================
                // HANDLE ERROR
                // ======================================

                if (!response.ok || !data.success) {

                    propertyMessage.textContent =
                        data.message ||
                        "Failed to add property.";

                    console.error(
                        "Add property error:",
                        data
                    );

                    return;
                }


                // ======================================
                // SUCCESS
                // ======================================

                propertyMessage.textContent =
                    "Property added successfully!";


                propertyForm.reset();


                // ======================================
                // RELOAD OWNER PROPERTIES
                // ======================================

                if (
                    typeof loadOwnerPropertiesFromAPI ===
                    "function"
                ) {

                    await loadOwnerPropertiesFromAPI();

                } else {

                    displayOwnerProperties();

                }


                // ======================================
                // REFRESH OWNER DASHBOARD
                // ======================================

                if (
                    typeof refreshOwnerDashboard ===
                    "function"
                ) {

                    refreshOwnerDashboard();

                }


            } catch (error) {

                console.error(
                    "Add property failed:",
                    error
                );


                propertyMessage.textContent =
                    "Unable to connect to backend.";

            }

        }
    );

}


// ======================================================
// READ - DISPLAY OWNER PROPERTIES FROM BACKEND
// ======================================================

async function loadOwnerPropertiesFromAPI() {

    if (!ownerPropertyList) {
        return;
    }

    const token =
        localStorage.getItem("renteaseToken");

    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!token) {

        ownerPropertyList.innerHTML =
            "<p>Please login as an owner.</p>";

        return;
    }


    // ==========================================
    // LOADING
    // ==========================================

    ownerPropertyList.innerHTML =
        "<p>Loading your properties...</p>";


    try {

        // ======================================
        // GET OWNER PROPERTIES
        // ======================================

        const response =
            await fetch(
                `${API_BASE_URL}/api/owner/properties`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        // ======================================
        // ERROR HANDLING
        // ======================================

        if (!response.ok || !data.success) {

            if (response.status === 401) {

                ownerPropertyList.innerHTML =
                    "<p>Your session has expired. Please login again.</p>";

                return;
            }


            if (response.status === 403) {

                ownerPropertyList.innerHTML =
                    "<p>Only owner accounts can view these properties.</p>";

                return;
            }


            throw new Error(
                data.message ||
                "Failed to load properties."
            );
        }


        // ======================================
        // GET PROPERTY ARRAY
        // ======================================

        const ownerProperties =
            Array.isArray(data.properties)
                ? data.properties
                : [];


        // ======================================
        // NO PROPERTIES
        // ======================================

        if (ownerProperties.length === 0) {

            ownerPropertyList.innerHTML =
                "<p>No properties added yet.</p>";

            return;
        }


        // ======================================
        // CLEAR OLD CONTENT
        // ======================================

        ownerPropertyList.innerHTML = "";


        // ======================================
        // DISPLAY PROPERTIES
        // ======================================

        ownerProperties.forEach(
            function (property) {

                const card =
                    document.createElement("div");


                card.classList.add(
                    "owner-property-card"
                );


                // MongoDB ID
                const propertyId =
                    property._id;


                // Default image
                const propertyImage =
                    property.image ||
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";


                // Property status
                const propertyStatus =
                    property.status ||
                    "Available";


                card.innerHTML = `

                    <img
                        src="${propertyImage}"
                        alt="${property.title}"
                        onerror="
                            this.onerror=null;
                            this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6';
                        "
                    >

                    <h3>
                        ${property.title}
                    </h3>

                    <p>
                        📍 ${property.location}
                    </p>

                    <p>
                        🏠 ${property.type}
                    </p>

                    <p>
                        ₹${Number(property.rent).toLocaleString("en-IN")}
                        / month
                    </p>

                    <p>
                        🔑 Status:
                        ${propertyStatus}
                    </p>


                    <button
                        type="button"
                        onclick="editProperty('${propertyId}')"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        onclick="deleteProperty('${propertyId}')"
                    >
                        Delete
                    </button>

                `;


                ownerPropertyList.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Load owner properties error:",
            error
        );


        ownerPropertyList.innerHTML = `

            <p>
                Unable to load properties from backend.
            </p>

            <small>
                ${error.message}
            </small>

        `;

    }

}


// ======================================================
// BACKWARD COMPATIBILITY
// ======================================================

function displayOwnerProperties() {

    loadOwnerPropertiesFromAPI();

}


// ======================================================
// UPDATE PROPERTY - BACKEND
// ======================================================

async function editProperty(propertyId) {

    const token =
        localStorage.getItem("renteaseToken");


    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!token) {

        alert("Please login as an owner.");

        return;
    }


    // ==========================================
    // GET CURRENT PROPERTY FROM BACKEND
    // ==========================================

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/properties/${propertyId}`
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Unable to load property."
            );

            return;
        }


        const property =
            data.property;


        // ======================================
        // EDIT TITLE
        // ======================================

        const newTitle =
            prompt(
                "Enter property title:",
                property.title || ""
            );


        if (newTitle === null) {

            return;

        }


        // ======================================
        // EDIT LOCATION
        // ======================================

        const newLocation =
            prompt(
                "Enter location:",
                property.location || ""
            );


        if (newLocation === null) {

            return;

        }


        // ======================================
        // EDIT RENT
        // ======================================

        const newRent =
            prompt(
                "Enter monthly rent:",
                property.rent || ""
            );


        if (newRent === null) {

            return;

        }


        // ======================================
        // EDIT STATUS
        // ======================================

        const currentStatus =
            property.status ||
            "Available";


        const newStatus =
            prompt(
                "Enter status (Available / Occupied):",
                currentStatus
            );


        if (newStatus === null) {

            return;

        }


        // ======================================
        // VALIDATION
        // ======================================

        if (
            newTitle.trim() === "" ||
            newLocation.trim() === "" ||
            newRent.trim() === ""
        ) {

            alert(
                "All fields are required."
            );

            return;
        }


        if (Number(newRent) <= 0) {

            alert(
                "Rent must be greater than 0."
            );

            return;
        }


        // ======================================
        // NORMALIZE STATUS
        // ======================================

        const normalizedStatus =
            newStatus.trim().toLowerCase() ===
            "occupied"
                ? "Occupied"
                : "Available";


        // ======================================
        // UPDATE DATA
        // ======================================

        const updatedProperty = {

            title:
                newTitle.trim(),

            location:
                newLocation.trim(),

            rent:
                Number(newRent),

            status:
                normalizedStatus

        };


        // ======================================
        // SEND PUT REQUEST
        // ======================================

        const updateResponse =
            await fetch(
                `${API_BASE_URL}/api/properties/${propertyId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            updatedProperty
                        )

                }
            );


        const updateData =
            await updateResponse.json();


        // ======================================
        // HANDLE ERROR
        // ======================================

        if (
            !updateResponse.ok ||
            !updateData.success
        ) {

            alert(
                updateData.message ||
                "Failed to update property."
            );

            console.error(
                "Update property error:",
                updateData
            );

            return;
        }


        // ======================================
        // SUCCESS
        // ======================================

        alert(
            "Property updated successfully!"
        );


        // ======================================
        // RELOAD FROM MONGODB
        // ======================================

        await loadOwnerPropertiesFromAPI();


        // ======================================
        // REFRESH OWNER DASHBOARD
        // ======================================

        if (
            typeof refreshOwnerDashboard ===
            "function"
        ) {

            refreshOwnerDashboard();

        }


    } catch (error) {

        console.error(
            "Edit property error:",
            error
        );


        alert(
            "Unable to connect to backend."
        );

    }

}


// ======================================================
// DELETE PROPERTY
// ======================================================

async function deleteProperty(propertyId) {
    const token = localStorage.getItem("renteaseToken");

    if (!token) {
        alert("Please login as an owner.");
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this property?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/properties/${propertyId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || "Failed to delete property.");
            console.error("Delete property error:", data);
            return;
        }

        alert("Property deleted successfully!");

        // Reload properties from MongoDB
        await loadOwnerPropertiesFromAPI();

        // Refresh dashboard statistics
        if (typeof refreshOwnerDashboard === "function") {
            refreshOwnerDashboard();
        }

    } catch (error) {
        console.error("Delete property error:", error);
        alert("Unable to connect to backend.");
    }
}


// ======================================================
// LOAD OWNER PROPERTIES
// ======================================================

if (ownerPropertyList) {

    displayOwnerProperties();

}


/* =========================================
   DAY 38 - TENANT APPLICATIONS DASHBOARD
========================================= */

(function initTenantApplicationsDashboard() {
    const applicationsList = document.querySelector(
        "#tenantApplicationsList"
    );

    // Run only on tenant dashboard
    if (!applicationsList) return;

    const API_BASE_URL = "http://localhost:5000";

    const messageElement = document.querySelector(
        "#tenantApplicationsMessage"
    );

    const summaryElement = document.querySelector(
        "#tenantApplicationsSummary"
    );

    const refreshButton = document.querySelector(
        "#refreshTenantApplications"
    );

    // Safely display values received from the API
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[char];
        });
    }

    function renderSummary(applications) {
        const counts = {
            pending: 0,
            approved: 0,
            rejected: 0
        };

        applications.forEach(function (application) {
            const status = String(
                application.status || "pending"
            ).toLowerCase();

            if (Object.prototype.hasOwnProperty.call(counts, status)) {
                counts[status]++;
            }
        });

        summaryElement.innerHTML = `
            <div class="application-summary-card">
                <span>Total Applications</span>
                <strong>${applications.length}</strong>
            </div>

            <div class="application-summary-card">
                <span>Pending</span>
                <strong>${counts.pending}</strong>
            </div>

            <div class="application-summary-card">
                <span>Approved</span>
                <strong>${counts.approved}</strong>
            </div>

            <div class="application-summary-card">
                <span>Rejected</span>
                <strong>${counts.rejected}</strong>
            </div>
        `;
    }

    function renderApplications(applications) {
        if (!applications.length) {
            applicationsList.innerHTML = `
                <div class="tenant-applications-empty">
                    <h3>No applications yet</h3>
                    <p>Explore properties and apply for a home to see your applications here.</p>
                    <a href="properties.html">Explore Properties</a>
                </div>
            `;
            return;
        }

        applicationsList.innerHTML = applications.map(
            function (application) {
                const property = application.property || {};

                const status = String(
                    application.status || "pending"
                ).toLowerCase();

                const allowedStatuses = [
                    "pending",
                    "approved",
                    "rejected"
                ];

                const safeStatus = allowedStatuses.includes(status)
                    ? status
                    : "unknown";

                const statusLabel = safeStatus.charAt(0).toUpperCase()
                    + safeStatus.slice(1);

                const rent = Number(property.rent);

                const rentText = Number.isFinite(rent)
                    ? `₹${rent.toLocaleString("en-IN")}/month`
                    : "Rent not available";

                const dateText = application.createdAt
                    ? new Date(application.createdAt).toLocaleDateString("en-IN")
                    : "Date not available";

                return `
                    <article class="tenant-application-card">
                        <div class="tenant-application-card-top">
                            <span class="application-status status-${safeStatus}">
                                ${escapeHTML(statusLabel)}
                            </span>

                            <span class="application-date">
                                Applied: ${escapeHTML(dateText)}
                            </span>
                        </div>

                        <h3>${escapeHTML(property.title || "Property details unavailable")}</h3>

                        <p class="application-location">
                            📍 ${escapeHTML(property.location || "Location unavailable")}
                        </p>

                        <p class="application-rent">
                            ${escapeHTML(rentText)}
                        </p>

                        <p class="application-type">
                            Type: ${escapeHTML(property.type || "Not specified")}
                        </p>

                        <div class="application-user-message">
                            <strong>Your message</strong>
                            <p>${escapeHTML(application.message || "No message added.")}</p>
                        </div>

                        ${
                            property._id
                                ? `<a class="application-details-link"
                                      href="property-details.html?id=${encodeURIComponent(property._id)}">
                                      View Property
                                   </a>`
                                : ""
                        }
                    </article>
                `;
            }
        ).join("");
    }

    async function loadTenantApplications() {
        const token = localStorage.getItem("renteaseToken");

        let user = null;

        try {
            user = JSON.parse(
                localStorage.getItem("renteaseUser") || "null"
            );
        } catch (error) {
            user = null;
        }

        if (!token) {
            messageElement.textContent =
                "Please log in using your backend account to view applications.";

            applicationsList.innerHTML = "";
            summaryElement.innerHTML = "";
            return;
        }

        if (!user || String(user.role || "").toLowerCase() !== "tenant") {
            messageElement.textContent =
                "This section is available to tenant accounts only.";

            applicationsList.innerHTML = "";
            summaryElement.innerHTML = "";
            return;
        }

        try {
            if (refreshButton) refreshButton.disabled = true;

            messageElement.textContent = "Loading your applications...";
            applicationsList.innerHTML = "";

            const response = await fetch(
                `${API_BASE_URL}/api/tenant/applications`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                if (response.status === 401) {
                    throw new Error(
                        "Your session has expired. Please log in again."
                    );
                }

                if (response.status === 403) {
                    throw new Error(
                        "Your account is not authorized to view tenant applications."
                    );
                }

                throw new Error(
                    data.message || "Could not load applications."
                );
            }

            const applications = Array.isArray(data.applications)
                ? data.applications
                : [];

            renderSummary(applications);
            renderApplications(applications);

            messageElement.textContent =
                `${applications.length} application(s) found.`;

        } catch (error) {
            console.error("Tenant applications error:", error);

            messageElement.textContent = error.message;
            applicationsList.innerHTML = "";
            summaryElement.innerHTML = "";

        } finally {
            if (refreshButton) refreshButton.disabled = false;
        }
    }

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            loadTenantApplications
        );
    }

    loadTenantApplications();
})();
// =========================================
// DAY 39 - OWNER APPLICATION MANAGEMENT
// =========================================

(function initOwnerApplicationsDashboard() {
    const applicationsList = document.querySelector(
        "#ownerApplicationsList"
    );

    // Run only on Owner Dashboard
    if (!applicationsList) return;

    const API_URL = "http://localhost:5000";
    const messageElement = document.querySelector(
        "#ownerApplicationsMessage"
    );
    const refreshButton = document.querySelector(
        "#refreshOwnerApplications"
    );

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[char];
        });
    }

    // Fetch applications belonging to the logged-in owner
    async function loadOwnerApplications() {
        const token = localStorage.getItem("renteaseToken");

        let user = null;

        try {
            user = JSON.parse(
                localStorage.getItem("renteaseUser") || "null"
            );
        } catch (error) {
            user = null;
        }

        if (!token) {
            messageElement.textContent =
                "Please log in as an owner to view applications.";
            applicationsList.innerHTML = "";
            return;
        }

        const role = String(user?.role || "").toLowerCase();

        if (!user || !["owner", "property owner"].includes(role)) {
            messageElement.textContent =
                "This section is available to owner accounts only.";
            applicationsList.innerHTML = "";
            return;
        }

        try {
            if (refreshButton) refreshButton.disabled = true;

            messageElement.textContent =
                "Loading rental applications...";

            applicationsList.innerHTML = "";

            const response = await fetch(
                `${API_URL}/api/owner/applications`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to load applications."
                );
            }

            const applications = Array.isArray(data.applications)
                ? data.applications
                : [];

            renderOwnerApplications(applications);

            messageElement.textContent =
                `${applications.length} rental application(s) found.`;

        } catch (error) {
            console.error("Owner applications error:", error);

            messageElement.textContent = error.message;
            applicationsList.innerHTML = "";

        } finally {
            if (refreshButton) refreshButton.disabled = false;
        }
    }

    // Render application cards
    function renderOwnerApplications(applications) {
        if (!applications.length) {
            applicationsList.innerHTML = `
                <div class="owner-application-empty">
                    <h3>No rental applications yet</h3>
                    <p>Applications from tenants will appear here.</p>
                </div>
            `;
            return;
        }

        applicationsList.innerHTML = applications.map(
            function (application) {
                const property = application.property || {};
                const tenant = application.tenant || {};

                const status = String(
                    application.status || "pending"
                ).toLowerCase();

                const allowedStatuses = [
                    "pending",
                    "approved",
                    "rejected"
                ];

                const safeStatus = allowedStatuses.includes(status)
                    ? status
                    : "unknown";

                const rent = Number(property.rent);

                const rentText = Number.isFinite(rent)
                    ? `₹${rent.toLocaleString("en-IN")}/month`
                    : "Rent not available";

                return `
                    <article class="owner-application-item">
                        <div class="owner-application-header">
                            <h3>
                                ${escapeHTML(
                                    property.title ||
                                    "Property details unavailable"
                                )}
                            </h3>

                            <span class="application-status status-${safeStatus}">
                                ${escapeHTML(
                                    safeStatus.charAt(0).toUpperCase() +
                                    safeStatus.slice(1)
                                )}
                            </span>
                        </div>

                        <p>
                            <strong>Location:</strong>
                            ${escapeHTML(property.location || "Not available")}
                        </p>

                        <p>
                            <strong>Property type:</strong>
                            ${escapeHTML(property.type || "Not specified")}
                        </p>

                        <p>
                            <strong>Monthly rent:</strong>
                            ${escapeHTML(rentText)}
                        </p>

                        <p>
                            <strong>Tenant:</strong>
                            ${escapeHTML(tenant.name || "Tenant")}
                        </p>

                        <p>
                            <strong>Tenant email:</strong>
                            ${escapeHTML(tenant.email || "Not available")}
                        </p>

                        <p>
                            <strong>Application message:</strong>
                            ${escapeHTML(application.message || "No message provided")}
                        </p>

                        <div class="owner-application-actions">
                            <button
                                type="button"
                                class="owner-approve-btn"
                                data-application-id="${escapeHTML(application._id)}"
                                data-status="approved"
                                ${!application._id ? "disabled" : ""}
                            >
                                Approve
                            </button>

                            <button
                                type="button"
                                class="owner-reject-btn"
                                data-application-id="${escapeHTML(application._id)}"
                                data-status="rejected"
                                ${!application._id ? "disabled" : ""}
                            >
                                Reject
                            </button>
                        </div>
                    </article>
                `;
            }
        ).join("");
    }

    // Handle Approve / Reject clicks
    applicationsList.addEventListener("click", async function (event) {
        const button = event.target.closest(
            "button[data-application-id][data-status]"
        );

        if (!button || button.disabled) return;

        const applicationId = button.dataset.applicationId;
        const status = button.dataset.status;

        if (!["approved", "rejected"].includes(status)) return;

        const confirmed = window.confirm(
            `Are you sure you want to ${status} this application?`
        );

        if (!confirmed) return;

        const token = localStorage.getItem("renteaseToken");

        if (!token) {
            messageElement.textContent =
                "Please log in again to update the application.";
            return;
        }

        try {
            button.disabled = true;

            messageElement.textContent =
                `Updating application to ${status}...`;

            const response = await fetch(
                `${API_URL}/api/applications/${encodeURIComponent(applicationId)}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: status })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to update application."
                );
            }

            messageElement.textContent =
                data.message || `Application ${status} successfully.`;

            // Reload the list to display the latest status
            await loadOwnerApplications();

        } catch (error) {
            console.error("Application status update error:", error);
            messageElement.textContent = error.message;
            button.disabled = false;
        }
    });

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            loadOwnerApplications
        );
    }

    // Initial load
    loadOwnerApplications();
})();
// Owner Dashboard: Quick Add Property action
(function connectQuickAddPropertyButton() {
    const button = document.querySelector("#quickAddPropertyBtn");
    const formSection = document.querySelector("#add-property-section");
    const titleInput = document.querySelector("#propertyTitle");

    if (!button || !formSection) return;

    button.addEventListener("click", function () {
        formSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        if (titleInput) {
            window.setTimeout(function () {
                titleInput.focus({ preventScroll: true });
            }, 400);
        }
    });
})();
// ==========================================
// DAY 43 - OWNER DASHBOARD DATA FROM MONGODB
// ==========================================

(function syncOwnerDashboardDataFromAPI() {

    const totalPropertiesElement =
        document.querySelector("#totalPropertiesCount");

    const monthlyRentElement =
        document.querySelector("#monthlyRentTotal");

    const vacantPropertiesElement =
        document.querySelector("#vacantPropertiesCount");

    const dashboardPropertyPreview =
        document.querySelector("#dashboardPropertyPreview");

    // Run only on Owner Dashboard
    if (
        !totalPropertiesElement &&
        !monthlyRentElement &&
        !vacantPropertiesElement &&
        !dashboardPropertyPreview
    ) {
        return;
    }

    async function updateDashboard() {

        const token =
            localStorage.getItem("renteaseToken");

        if (!token) {
            return;
        }

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/owner/properties`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Failed to load owner properties."
                );
            }

            const properties =
                Array.isArray(data.properties)
                    ? data.properties
                    : [];


            // ==========================================
            // TOTAL PROPERTIES
            // ==========================================

            if (totalPropertiesElement) {

                totalPropertiesElement.textContent =
                    properties.length;
            }


            // ==========================================
            // TOTAL MONTHLY RENT
            // ==========================================

            const totalRent =
                properties.reduce(
                    function (total, property) {

                        const rent =
                            Number(property.rent);

                        return total +
                            (
                                Number.isFinite(rent)
                                    ? rent
                                    : 0
                            );

                    },
                    0
                );

            if (monthlyRentElement) {

                monthlyRentElement.textContent =
                    `₹${totalRent.toLocaleString("en-IN")}`;
            }


            // ==========================================
            // VACANT PROPERTIES
            // ==========================================

            const vacantProperties =
                properties.filter(
                    function (property) {

                        return (
                            String(
                                property.status ||
                                "Available"
                            ).toLowerCase() ===
                            "available"
                        );

                    }
                ).length;


            if (vacantPropertiesElement) {

                vacantPropertiesElement.textContent =
                    vacantProperties;
            }


            // ==========================================
            // PROPERTY PREVIEW
            // ==========================================

            if (!dashboardPropertyPreview) {
                return;
            }


            if (properties.length === 0) {

                dashboardPropertyPreview.innerHTML = `
                    <div class="dashboard-property-empty">
                        <p>No properties added yet.</p>
                    </div>
                `;

                return;
            }


            // Latest 3 MongoDB properties
            const previewProperties =
                properties
                    .slice(-3)
                    .reverse();


            dashboardPropertyPreview.innerHTML =
                previewProperties.map(
                    function (property) {

                        const rent =
                            Number(property.rent);

                        const rentText =
                            Number.isFinite(rent)
                                ? `₹${rent.toLocaleString("en-IN")}`
                                : "Rent unavailable";

                        const status =
                            property.status ||
                            "Available";


                        return `
                            <div class="owner-property-item">

                                <div>

                                    <h3>
                                        ${
                                            property.title ||
                                            "Untitled Property"
                                        }
                                    </h3>

                                    <p>
                                        📍
                                        ${
                                            property.location ||
                                            "Location unavailable"
                                        }
                                    </p>

                                    <span class="vacant">
                                        ${status}
                                    </span>

                                </div>

                                <strong>
                                    ${rentText}
                                </strong>

                            </div>
                        `;

                    }
                ).join("");


        } catch (error) {

            console.error(
                "Owner dashboard API error:",
                error
            );

        }

    }


    // Initial dashboard load
    updateDashboard();


    // Make available to Add / Edit / Delete
    window.refreshOwnerDashboard =
        updateDashboard;
    
    // ==========================================
// DAY 44 - OWNER TENANTS COUNT
// ==========================================

    async function loadOwnerTenantCount() {

        const totalTenantsCount =
            document.getElementById("totalTenantsCount");

        if (!totalTenantsCount) {
            return;
        }

        try {

            const token =
                localStorage.getItem("renteaseToken");

            if (!token) {
                totalTenantsCount.textContent = "0";
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/owner/tenants`,
                {
                    method: "GET",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                console.error(
                    "Failed to fetch tenant count:",
                    data
                );

                totalTenantsCount.textContent = "0";

                return;
            }

            totalTenantsCount.textContent = data.count;

        } catch (error) {

            console.error(
                "Owner tenant count error:",
                error
            );

            totalTenantsCount.textContent = "0";
        }
    }
    

})();
/* =========================================
   DAY 41 - TENANT CURRENT PROPERTY
========================================= */

(function initTenantCurrentProperty() {

    const propertyContent = document.querySelector(
        "#currentPropertyContent"
    );

    const viewDetailsLink = document.querySelector(
        "#currentPropertyViewDetails"
    );

    // Run only on tenant dashboard
    if (!propertyContent) return;

    const API_URL = "http://localhost:5000";

    async function loadCurrentProperty() {

        const token = localStorage.getItem(
            "renteaseToken"
        );

        if (!token) {

            propertyContent.innerHTML = `
                <div class="dashboard-property-empty">
                    <p>Please log in to view your current property.</p>
                </div>
            `;

            return;
        }

        try {

            propertyContent.innerHTML = `
                <div class="dashboard-property-empty">
                    <p>Loading current property...</p>
                </div>
            `;

            // --------------------------------
            // STEP 1: GET TENANT APPLICATIONS
            // --------------------------------

            const applicationsResponse = await fetch(
                `${API_URL}/api/tenant/applications`,
                {
                    method: "GET",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const applicationsData =
                await applicationsResponse.json();

            if (
                !applicationsResponse.ok ||
                !applicationsData.success
            ) {

                throw new Error(
                    applicationsData.message ||
                    "Failed to load tenant applications."
                );
            }

            const applications =
                Array.isArray(
                    applicationsData.applications
                )
                    ? applicationsData.applications
                    : [];

            // --------------------------------
            // STEP 2: FIND APPROVED APPLICATION
            // --------------------------------

            const approvedApplication =
                applications.find(function (application) {

                    return String(
                        application.status || ""
                    ).toLowerCase() === "approved";

                });

            if (!approvedApplication) {

                propertyContent.innerHTML = `
                    <div class="dashboard-property-empty">

                        <p>
                            You don't have an approved rental
                            property yet.
                        </p>

                        <a href="properties.html">
                            Browse Properties
                        </a>

                    </div>
                `;

                if (viewDetailsLink) {
                    viewDetailsLink.style.display = "none";
                }

                return;
            }

            // --------------------------------
            // STEP 3: GET PROPERTY ID
            // --------------------------------

            const propertyId =
                approvedApplication.property?._id ||
                approvedApplication.property?.id ||
                approvedApplication.propertyId;

            if (!propertyId) {

                throw new Error(
                    "Property ID not found in approved application."
                );
            }

            // --------------------------------
            // STEP 4: GET PROPERTY DETAILS
            // --------------------------------

            const propertyResponse = await fetch(
                `${API_URL}/api/properties/${encodeURIComponent(propertyId)}`
            );

            const propertyData =
                await propertyResponse.json();

            if (
                !propertyResponse.ok ||
                !propertyData.success
            ) {

                throw new Error(
                    propertyData.message ||
                    "Failed to load property details."
                );
            }

            const property =
                propertyData.property;

            // --------------------------------
            // STEP 5: PROPERTY VALUES
            // --------------------------------

            const title =
                property.title ||
                "Property";

            const location =
                property.location ||
                "Location unavailable";

            const type =
                property.type ||
                "Property";

            const rent =
                Number(property.rent);

            const rentText =
                Number.isFinite(rent)
                    ? `₹${rent.toLocaleString("en-IN")}`
                    : "Rent unavailable";

            const image =
                property.image ||
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267";

            // --------------------------------
            // STEP 6: DISPLAY PROPERTY
            // --------------------------------

            propertyContent.innerHTML = `

                <img
                    src="${image}"
                    alt="${title}"
                    class="dashboard-property-image"
                >

                <div class="dashboard-property-info">

                    <h3>
                        ${title}
                    </h3>

                    <p>
                        📍 ${location}
                    </p>

                    <p>
                        🏠 ${type}
                    </p>

                    <strong>
                        ${rentText} / month
                    </strong>

                </div>

            `;

            // --------------------------------
            // STEP 7: VIEW DETAILS LINK
            // --------------------------------

            if (viewDetailsLink) {

                viewDetailsLink.href =
                    `property-details.html?id=${encodeURIComponent(propertyId)}`;

                viewDetailsLink.style.display = "inline-block";
            }

        } catch (error) {

            console.error(
                "Tenant current property error:",
                error
            );

            propertyContent.innerHTML = `

                <div class="dashboard-property-empty">

                    <p>
                        Unable to load current property.
                    </p>

                    <small>
                        ${error.message}
                    </small>

                </div>

            `;
        }
    }

    // Load current property
    loadCurrentProperty();

})();
// ==========================================
// DAY 44 - OWNER TENANTS COUNT
// ==========================================

async function loadOwnerTenantCount() {

    const totalTenantsCount =
        document.getElementById("totalTenantsCount");

    if (!totalTenantsCount) {
        return;
    }

    try {

        const token =
            localStorage.getItem("renteaseToken");

        if (!token) {
            totalTenantsCount.textContent = "0";
            return;
        }

        const response = await fetch(
            `${API_BASE_URL}/api/owner/tenants`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            console.error(
                "Failed to fetch tenant count:",
                data
            );

            totalTenantsCount.textContent = "0";

            return;
        }

        totalTenantsCount.textContent = data.count;

    } catch (error) {

        console.error(
            "Owner tenant count error:",
            error
        );

        totalTenantsCount.textContent = "0";
    }
}


// Load owner tenant count
loadOwnerTenantCount();
// ==========================================
// DAY 45 - OWNER RENT SUMMARY
// ==========================================

async function loadOwnerRentSummary() {

    const expectedRentTotal =
        document.getElementById("expectedRentTotal");

    const collectedRentTotal =
        document.getElementById("collectedRentTotal");

    const pendingRentTotal =
        document.getElementById("pendingRentTotal");

    if (
        !expectedRentTotal ||
        !collectedRentTotal ||
        !pendingRentTotal
    ) {
        return;
    }

    try {

        const token =
            localStorage.getItem("renteaseToken");

        if (!token) {
            return;
        }

        const response = await fetch(
            `${API_BASE_URL}/api/owner/rent-summary`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            console.error(
                "Failed to fetch owner rent summary:",
                data
            );

            return;
        }

        const summary = data.summary;

        expectedRentTotal.textContent =
            `₹${Number(summary.expectedRent).toLocaleString("en-IN")}`;

        collectedRentTotal.textContent =
            `₹${Number(summary.collectedRent).toLocaleString("en-IN")}`;

        pendingRentTotal.textContent =
            `₹${Number(summary.pendingRent).toLocaleString("en-IN")}`;

    } catch (error) {

        console.error(
            "Owner rent summary error:",
            error
        );

    }
}

loadOwnerRentSummary();
// ==========================================
// DAY 46 - OWNER MAINTENANCE REQUESTS
// ==========================================

async function loadOwnerMaintenance() {

    const maintenanceList =
        document.getElementById("ownerMaintenanceList");

    const maintenanceCount =
        document.getElementById("ownerMaintenanceCount");

    if (!maintenanceList || !maintenanceCount) {
        return;
    }

    const token = localStorage.getItem("renteaseToken");

    if (!token) {

        maintenanceList.innerHTML =
            "<p>Please login as owner.</p>";

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/owner/maintenance`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            maintenanceList.innerHTML =
                `<p>${data.message || "Failed to load maintenance requests."}</p>`;

            return;
        }


        const complaints = data.complaints || [];


        // ======================================
        // COUNT OPEN REQUESTS
        // ======================================

        const openRequests = complaints.filter(function (complaint) {

            return complaint.status !== "resolved";

        }).length;


        maintenanceCount.textContent =
            `${openRequests} Open`;


        // ======================================
        // NO REQUESTS
        // ======================================

        if (complaints.length === 0) {

            maintenanceList.innerHTML =
                "<p>No maintenance requests found.</p>";

            return;
        }


        // ======================================
        // DISPLAY REQUESTS
        // ======================================

        maintenanceList.innerHTML = "";


        complaints.forEach(function (complaint) {

            const item =
                document.createElement("div");

            item.className =
                "owner-maintenance-item";


            const tenantName =
                complaint.tenant?.name ||
                complaint.tenant?.username ||
                "Unknown Tenant";


            const title =
                complaint.title ||
                "Maintenance Request";


            const status =
                complaint.status ||
                "pending";


            let statusClass =
                "owner-pending";

            let statusText =
                "Pending";


            if (status === "in-progress") {

                statusClass =
                    "owner-progress";

                statusText =
                    "In Progress";

            } else if (status === "resolved") {

                statusClass =
                    "owner-completed";

                statusText =
                    "Completed";
            }


            item.innerHTML = `

                <div>

                    <h3>
                        ${title}
                    </h3>

                    <p>
                        Tenant: ${tenantName}
                    </p>

                </div>

                <span class="${statusClass}">
                    ${statusText}
                </span>

            `;


            maintenanceList.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Maintenance loading error:",
            error
        );

        maintenanceList.innerHTML =
            "<p>Unable to load maintenance requests.</p>";
    }
}
loadOwnerMaintenance();
