// ==========================================
// RENT EASE - JAVASCRIPT
// ==========================================


// ==========================================
// DAY 1 - LOGIN BUTTON
// ==========================================

const loginBtn = document.querySelector("#loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", function () {

        alert("Login page coming soon!");

    });

}


// ==========================================
// DAY 1 - SIGNUP BUTTON
// ==========================================

const signupBtn = document.querySelector("#signupBtn");

if (signupBtn) {

    signupBtn.addEventListener("click", function () {

        alert("Signup page coming soon!");

    });

}


// ==========================================
// DAY 2 - PROPERTY SEARCH
// ==========================================

const searchForm =
    document.querySelector("#propertySearch");

const locationInput =
    document.querySelector("#location");

const propertyType =
    document.querySelector("#propertyType");

const budget =
    document.querySelector("#budget");

const searchMessage =
    document.querySelector("#searchMessage");


if (searchForm) {

    searchForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const location =
            locationInput.value.trim();

        const type =
            propertyType.value;

        const maxBudget =
            budget.value;


        // Validation

        if (location === "") {

            searchMessage.textContent =
                "Please enter a location.";

            return;
        }


        if (type === "") {

            searchMessage.textContent =
                "Please select a property type.";

            return;
        }


        if (maxBudget === "") {

            searchMessage.textContent =
                "Please select your maximum budget.";

            return;
        }


        // Success Message

        searchMessage.textContent =
            `Searching properties in ${location} for ${type} under ₹${maxBudget}...`;

    });

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

    // Check if property page exists

    if (!propertyList) {
        return;
    }


    // Clear previous cards

    propertyList.innerHTML = "";


    // If no property found

    if (propertyArray.length === 0) {

        propertyList.innerHTML = `
            <p class="no-property">
                No properties found.
            </p>
        `;

        return;
    }


    // Create cards

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

    if (!searchLocation) {
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


    // Display filtered properties

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