const propertySearch =
    document.querySelector("#propertySearch");

if (propertySearch) {

    propertySearch.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const location =
                document.querySelector("#location").value.trim();

            const propertyType =
                document.querySelector("#propertyType").value;

            const budget =
                document.querySelector("#budget").value;


            // Save search data
            const searchData = {
                location: location,
                propertyType: propertyType,
                budget: budget
            };


            localStorage.setItem(
                "renteaseSearch",
                JSON.stringify(searchData)
            );


            window.location.href =
                "properties.html";

        }
    );

}


// ==========================================
// DAY 3 - PROPERTY DATA
// ==========================================

const properties = [

    {
        id: 1,
        title: "Modern 2BHK Apartment",
        location: "Kolkata",
        type: "Apartment",
        rent: 15000,
        image:
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
    },

    {
        id: 2,
        title: "Premium Family House",
        location: "Haldia",
        type: "House",
        rent: 12000,
        image:
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"
    },

    {
        id: 3,
        title: "Affordable Student PG",
        location: "Durgapur",
        type: "PG",
        rent: 7000,
        image:
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5"
    },

    {
        id: 4,
        title: "Single Room Near College",
        location: "Kolkata",
        type: "Room",
        rent: 8000,
        image:
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
    },

    {
        id: 5,
        title: "Luxury 3BHK Apartment",
        location: "New Town",
        type: "Apartment",
        rent: 20000,
        image:
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
    },

    {
        id: 6,
        title: "Budget Friendly House",
        location: "Haldia",
        type: "House",
        rent: 9000,
        image:
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
    }

];


// ==========================================
// DAY 3 - SELECT PROPERTY CONTAINER
// ==========================================

const propertyList =
    document.querySelector("#propertyList");


// ==========================================
// DISPLAY PROPERTIES FUNCTION
// ==========================================

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
                    href="property-details.html?id=${property.id}"
                    class="details-btn"
                >
                    View Details
                </a>

            </div>

        `;


        propertyList.appendChild(card);

    });

}


// ==========================================
// SHOW ALL PROPERTIES INITIALLY
// ==========================================

displayProperties(properties);


// ==========================================
// DAY 3 - FILTER ELEMENTS
// ==========================================

const searchLocation =
    document.querySelector("#searchLocation");

const filterType =
    document.querySelector("#filterType");

const filterBudget =
    document.querySelector("#filterBudget");


// ==========================================
// FILTER FUNCTION
// ==========================================

function filterProperties() {

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


    const filteredProperties =
        properties.filter(function (property) {


            // Location matching

            const locationMatch =
                property.location
                    .toLowerCase()
                    .includes(locationValue);


            // Type matching

            const typeMatch =
                typeValue === "" ||
                property.type === typeValue;


            // Budget matching

            const budgetMatch =
                budgetValue === "" ||
                property.rent <= Number(budgetValue);


            return (
                locationMatch &&
                typeMatch &&
                budgetMatch
            );

        });


    displayProperties(filteredProperties);

}


// ==========================================
// SEARCH EVENT
// ==========================================

if (searchLocation) {

    searchLocation.addEventListener(
        "input",
        filterProperties
    );

}


// ==========================================
// TYPE FILTER EVENT
// ==========================================

if (filterType) {

    filterType.addEventListener(
        "change",
        filterProperties
    );

}


// ==========================================
// BUDGET FILTER EVENT
// ==========================================

if (filterBudget) {

    filterBudget.addEventListener(
        "change",
        filterProperties
    );

}


// ==========================================
// DAY 4 - PROPERTY DETAILS
// ==========================================

const propertyDetails =
    document.querySelector("#propertyDetails");


if (propertyDetails) {

    const urlParams =
        new URLSearchParams(window.location.search);


    const propertyId =
        Number(urlParams.get("id"));


    console.log(
        "Property ID:",
        propertyId
    );


    const selectedProperty =
        properties.find(function (property) {

            return property.id === propertyId;

        });


    console.log(
        "Selected Property:",
        selectedProperty
    );


    if (!selectedProperty) {

        propertyDetails.innerHTML = `

            <div class="no-property">

                <h2>
                    Property not found
                </h2>

                <p>
                    Please select a property
                    from the Properties page.
                </p>

            </div>

        `;

    } else {

        propertyDetails.innerHTML = `

            <div class="details-card">

                <img
                    src="${selectedProperty.image}"
                    alt="${selectedProperty.title}"
                    class="details-image"
                >


                <div class="details-content">

                    <span class="property-type">
                        ${selectedProperty.type}
                    </span>


                    <h1>
                        ${selectedProperty.title}
                    </h1>


                    <p class="property-location">
                        📍 ${selectedProperty.location}
                    </p>


                    <h2 class="details-rent">
                        ₹${selectedProperty.rent.toLocaleString("en-IN")}
                        / month
                    </h2>


                    <div class="property-features">

                        <div>
                            🛏️
                            <strong>
                                ${selectedProperty.bedrooms || 2}
                            </strong>
                            Bedrooms
                        </div>


                        <div>
                            🚿
                            <strong>
                                ${selectedProperty.bathrooms || 2}
                            </strong>
                            Bathrooms
                        </div>


                        <div>
                            📐
                            <strong>
                                ${selectedProperty.area || "1200 sq.ft"}
                            </strong>
                        </div>


                        <div>
                            🛋️
                            <strong>
                                ${selectedProperty.furnished || "Semi-Furnished"}
                            </strong>
                        </div>

                    </div>


                    <h2>
                        About Property
                    </h2>


                    <p>
                        ${
                            selectedProperty.description ||
                            "This is a comfortable and well-maintained property suitable for rental."
                        }
                    </p>


                    <h2>
                        Amenities
                    </h2>


                    <div class="amenities">

                        ${
                            (
                                selectedProperty.amenities ||
                                [
                                    "Parking",
                                    "WiFi",
                                    "Security",
                                    "Lift"
                                ]
                            )
                            .map(function (amenity) {

                                return `
                                    <span>
                                        ${amenity}
                                    </span>
                                `;

                            })
                            .join("")
                        }

                    </div>


                    <button class="contact-owner-btn">
                        Contact Owner
                    </button>

                </div>

            </div>

        `;

    }

}


// ==========================================
// DAY 5 + DAY 12 + DAY 13 - LOGIN
// ==========================================

const loginForm =
    document.querySelector("#loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const email =
                document.querySelector("#loginEmail")
                    .value
                    .trim();


            const password =
                document.querySelector("#loginPassword")
                    .value
                    .trim();


            const loginMessage =
                document.querySelector("#loginMessage");


            // ==========================================
            // CHECK EMAIL
            // ==========================================

            if (email === "") {

                loginMessage.textContent =
                    "Please enter your email.";

                return;
            }


            // ==========================================
            // CHECK EMAIL FORMAT
            // ==========================================

            if (!email.includes("@")) {

                loginMessage.textContent =
                    "Please enter a valid email.";

                return;
            }


            // ==========================================
            // CHECK PASSWORD
            // ==========================================

            if (password === "") {

                loginMessage.textContent =
                    "Please enter your password.";

                return;
            }


            // ==========================================
            // CHECK PASSWORD LENGTH
            // ==========================================

            if (password.length < 6) {

                loginMessage.textContent =
                    "Password must be at least 6 characters.";

                return;
            }


            // ==========================================
            // DAY 13 - GET SAVED USER
            // ==========================================

            const savedUser =
                localStorage.getItem("renteaseUser");


            if (!savedUser) {

                loginMessage.textContent =
                    "No account found. Please sign up first.";

                return;
            }


            // Convert String → Object

            const userData =
                JSON.parse(savedUser);


            // ==========================================
            // CHECK EMAIL WITH SAVED USER
            // ==========================================

            if (
                email.toLowerCase() !==
                userData.email.toLowerCase()
            ) {

                loginMessage.textContent =
                    "Email does not match the registered account.";

                return;
            }


            // ==========================================
            // CHECK PASSWORD
            // ==========================================

            if (password !== userData.password) {

                loginMessage.textContent =
                    "Incorrect password.";

                return;
            }


            // ==========================================
            // LOGIN SUCCESS
            // ==========================================

            loginMessage.textContent =
                "Login successful! Redirecting...";


            setTimeout(function () {

                // Check user role

                if (userData.role === "Owner") {

                    window.location.href =
                        "owner-dashboard.html";

                } else {

                    window.location.href =
                        "tenant-dashboard.html";

                }

            }, 1000);

        }
    );

}


// ==========================================
// DAY 5 + DAY 12 + DAY 13 - SIGNUP
// ==========================================

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


            // ==========================================
            // CHECK NAME
            // ==========================================

            if (name === "") {

                signupMessage.textContent =
                    "Please enter your name.";

                return;
            }


            // ==========================================
            // CHECK NAME LENGTH
            // ==========================================

            if (name.length < 3) {

                signupMessage.textContent =
                    "Name must be at least 3 characters.";

                return;
            }


            // ==========================================
            // CHECK EMAIL
            // ==========================================

            if (email === "") {

                signupMessage.textContent =
                    "Please enter your email.";

                return;
            }


            // ==========================================
            // CHECK EMAIL FORMAT
            // ==========================================

            if (!email.includes("@")) {

                signupMessage.textContent =
                    "Please enter a valid email.";

                return;
            }


            // ==========================================
            // CHECK PASSWORD
            // ==========================================

            if (password === "") {

                signupMessage.textContent =
                    "Please enter a password.";

                return;
            }


            // ==========================================
            // CHECK PASSWORD LENGTH
            // ==========================================

            if (password.length < 6) {

                signupMessage.textContent =
                    "Password must be at least 6 characters.";

                return;
            }


            // ==========================================
            // CHECK CONFIRM PASSWORD
            // ==========================================

            if (password !== confirmPassword) {

                signupMessage.textContent =
                    "Passwords do not match.";

                return;
            }


            // ==========================================
            // CHECK ROLE
            // ==========================================

            if (role === "") {

                signupMessage.textContent =
                    "Please select your role.";

                return;
            }


            // ==========================================
            // DAY 13 - SAVE USER DATA
            // ==========================================

            const userData = {

                name: name,
                email: email,
                password: password,
                role: role

            };


            // Convert Object → String
            // and save it in browser

            localStorage.setItem(
                "renteaseUser",
                JSON.stringify(userData)
            );


            signupMessage.textContent =
                "Account created successfully!";


            // ==========================================
            // END SIGNUP
            // ==========================================

        }
    );

}


// ==========================================
// DAY 8 - DOM PRACTICE
// ==========================================


// ==========================================
// 1. CHANGE MESSAGE
// ==========================================

const domButton =
    document.querySelector("#domButton");


if (domButton) {

    domButton.addEventListener(
        "click",
        function () {

            const domMessage =
                document.querySelector("#domMessage");


            domMessage.textContent =
                "DOM successfully changed the webpage!";

        }
    );

}


// ==========================================
// 2. SHOW TENANT NAME
// ==========================================

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


// ==========================================
// DAY 9 - LOAD SAVED SEARCH
// ==========================================

if (
    searchLocation &&
    filterType &&
    filterBudget
) {

    const savedSearch =
        localStorage.getItem("renteaseSearch");


    if (savedSearch) {

        const searchData =
            JSON.parse(savedSearch);


        searchLocation.value =
            searchData.location || "";


        filterType.value =
            searchData.propertyType || "";


        filterBudget.value =
            searchData.budget || "";


        filterProperties();

    }

}


// ==========================================
// DAY 10 - RESET FILTERS
// ==========================================

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


            // Remove saved search

            localStorage.removeItem(
                "renteaseSearch"
            );


            filterProperties();

        }
    );

}


// ==========================================
// DAY 11 - PROPERTY SORTING
// ==========================================

const sortProperties =
    document.querySelector("#sortProperties");


if (sortProperties) {

    sortProperties.addEventListener(
        "change",
        function () {

            const sortValue =
                sortProperties.value;


            // Make a copy of original array

            const sortedProperties =
                [...properties];


            // ==========================================
            // LOW TO HIGH
            // ==========================================

            if (sortValue === "lowToHigh") {

                sortedProperties.sort(
                    function (a, b) {

                        return a.rent - b.rent;

                    }
                );

            }


            // ==========================================
            // HIGH TO LOW
            // ==========================================

            if (sortValue === "highToLow") {

                sortedProperties.sort(
                    function (a, b) {

                        return b.rent - a.rent;

                    }
                );

            }


            // ==========================================
            // DISPLAY SORTED PROPERTIES
            // ==========================================

            displayProperties(
                sortedProperties
            );

        }
    );

}