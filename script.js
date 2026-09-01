// ============================================
// BRIGHTSIDE HOUSTON DETAILING
// BOOKING + MAPBOX + CALENDLY JAVASCRIPT
// ============================================


// ============================================
// MOBILE MENU
// ============================================

const menuButton = document.getElementById("menuButton");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-open");
    });
}


// ============================================
// BOOKING PAGE DETECTION
// ============================================

const bookingPage = document.getElementById("booking-page");


// ============================================
// PACKAGE FROM URL
// ============================================

function selectPackageFromURL() {

    if (!bookingPage) return;

    const params = new URLSearchParams(window.location.search);
    const selectedService = params.get("service");

    if (!selectedService) return;

    const serviceRadio = document.querySelector(
        `input[name="service"][value="${selectedService}"]`
    );

    if (!serviceRadio) return;

    serviceRadio.checked = true;

    document.querySelectorAll(".service-card").forEach(card => {
        card.classList.remove("selected-service");
    });

    const selectedCard = serviceRadio.closest(".service-card");

    if (selectedCard) {
        selectedCard.classList.add("selected-service");
    }
}


// Run package selection
selectPackageFromURL();


// ============================================
// STOP IF NOT BOOKING PAGE
// ============================================

if (!bookingPage) {

    console.log("BrightSide: Non-booking page loaded.");

} else {


// ============================================
// MAPBOX SETTINGS
// ============================================


const MAPBOX_TOKEN =
    "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5a3FuMDUwNHVlMndweWFzNXAwMG5rIn0.HYTbUgwvgO3_fn7f0mHCDg";


// Alief Community Center
const SERVICE_LAT = 29.70254;
const SERVICE_LNG = -95.58891;


// Service radius in miles
const SERVICE_RADIUS = 30;


// ============================================
// CALENDLY SETTINGS
// ============================================

const CALENDLY_URLS = {

    express:
        "https://calendly.com/brightsidemdetails/express-exterior",

    interior:
        "https://calendly.com/brightsidemdetails/full-interior",

    "full-detail":
        "https://calendly.com/brightsidemdetails/30min"

};


// ============================================
// ELEMENTS
// ============================================

const addressInput =
    document.getElementById("address");

const suggestionsBox =
    document.getElementById("address-suggestions");

const serviceStatus =
    document.getElementById("service-status");

const availability =
    document.getElementById("availability-container");

const availabilityButton =
    document.getElementById("availability-button");

const mapElement =
    document.getElementById("map");

const vehicleMake =
    document.getElementById("vehicle-make");

const vehicleModel =
    document.getElementById("vehicle-model");

const vehicleYear =
    document.getElementById("vehicle-year");

const vehicleSize =
    document.getElementById("vehicle-size");

const vehiclePrice =
    document.getElementById("vehicle-price");

const conditionInput =
    document.getElementById("condition");


// ============================================
// VEHICLE PRICING
// ============================================

const prices = {

    sedan: {
        express: 75,
        interior: 100,
        full: 150
    },

    suv: {
        express: 95,
        interior: 120,
        full: 180
    },

    truck: {
        express: 110,
        interior: 140,
        full: 200
    }

};


// ============================================
// UPDATE PRICES
// ============================================

function updatePrices() {

    if (!vehicleSize) return;

    const vehicle = vehicleSize.value;

    const priceElements =
        document.querySelectorAll(".service-price");


    // No vehicle selected
    if (!vehicle) {

        if (vehiclePrice) {

            vehiclePrice.textContent =
                "Choose your vehicle type to see your price.";

        }

        priceElements.forEach(element => {

            element.textContent =
                "Select Vehicle";

        });

        updateAvailabilityState();

        return;
    }


    const selected = prices[vehicle];


    if (!selected) return;


    if (vehiclePrice) {

        vehiclePrice.innerHTML = `
            <strong>Estimated pricing:</strong>
            Express $${selected.express}
            • Interior $${selected.interior}
            • Full Detail $${selected.full}
        `;

    }


    priceElements.forEach(element => {

        const card =
            element.closest(".service-card");

        const radio =
            card?.querySelector(
                "input[name='service']"
            );

        if (!radio) return;


        if (radio.value === "express") {

            element.textContent =
                `$${selected.express}`;

        }


        if (radio.value === "interior") {

            element.textContent =
                `$${selected.interior}`;

        }


        if (radio.value === "full-detail") {

            element.textContent =
                `$${selected.full}`;

        }

    });


    updateAvailabilityState();

}


// Vehicle size changed
if (vehicleSize) {

    vehicleSize.addEventListener(
        "change",
        updatePrices
    );

}


// ============================================
// SERVICE CARD SELECTION
// ============================================

const serviceRadios =
    document.querySelectorAll(
        "input[name='service']"
    );


serviceRadios.forEach(radio => {

    radio.addEventListener(
        "change",
        () => {

            document
                .querySelectorAll(".service-card")
                .forEach(card => {

                    card.classList.remove(
                        "selected-service"
                    );

                });


            const card =
                radio.closest(".service-card");


            if (card) {

                card.classList.add(
                    "selected-service"
                );

            }


            updateAvailabilityState();

        }
    );

});


// ============================================
// GET SELECTED SERVICE
// ============================================

function getSelectedService() {

    const selected =
        document.querySelector(
            "input[name='service']:checked"
        );

    return selected
        ? selected.value
        : "";

}


// ============================================
// GET SERVICE NAME
// ============================================

function getServiceName(service) {

    if (service === "express") {
        return "Exterior Detail";
    }

    if (service === "interior") {
        return "Interior Detail";
    }

    if (service === "full-detail") {
        return "Full Detail";
    }

    return "";

}


// ============================================
// VEHICLE INFORMATION COMPLETE?
// ============================================

function vehicleInformationComplete() {

    if (
        !vehicleMake ||
        !vehicleModel ||
        !vehicleYear ||
        !vehicleSize
    ) {
        return false;
    }


    const make =
        vehicleMake.value.trim();

    const model =
        vehicleModel.value.trim();

    const year =
        vehicleYear.value.trim();

    const size =
        vehicleSize.value;


    return (
        make !== "" &&
        model !== "" &&
        year !== "" &&
        size !== ""
    );

}


// ============================================
// SERVICE COMPLETE?
// ============================================

function serviceSelectionComplete() {

    return getSelectedService() !== "";

}


// ============================================
// LOCATION COMPLETE?
// ============================================

let addressEligible = false;


// ============================================
// UPDATE AVAILABILITY STATE
// ============================================

function updateAvailabilityState() {

    if (
        !availability ||
        !availabilityButton
    ) {
        return;
    }


    const vehicleComplete =
        vehicleInformationComplete();

    const serviceComplete =
        serviceSelectionComplete();


    if (
        addressEligible &&
        vehicleComplete &&
        serviceComplete
    ) {

        unlockAvailability();

    } else {

        lockAvailability();

    }

}


// ============================================
// MAPBOX
// ============================================

let map = null;
let marker = null;


// ============================================
// START MAP
// ============================================

function startMap() {

    if (!mapElement) {
        return;
    }


    // Check token
    if (
        !MAPBOX_TOKEN ||
        MAPBOX_TOKEN ===
        "PASTE_YOUR_NEW_PUBLIC_PK_TOKEN_HERE"
    ) {

        console.error(
            "BrightSide: Mapbox public token is missing."
        );


        mapElement.innerHTML = `
            <div class="map-error">
                <strong>Mapbox token is missing.</strong>
                <br>
                Add your new public Mapbox token
                to script.js.
            </div>
        `;


        return;

    }


    // Check token type
    if (
        !MAPBOX_TOKEN.startsWith("pk.")
    ) {

        console.error(
            "BrightSide: Mapbox token must be a public pk token."
        );


        mapElement.innerHTML = `
            <div class="map-error">
                <strong>Invalid Mapbox token.</strong>
                <br>
                Your website needs a public
                Mapbox token beginning with
                <strong>pk.</strong>
            </div>
        `;


        return;

    }


    // Check Mapbox library
    if (
        typeof mapboxgl === "undefined"
    ) {

        console.error(
            "BrightSide: Mapbox GL JS did not load."
        );


        mapElement.innerHTML = `
            <div class="map-error">
                <strong>Mapbox could not load.</strong>
                <br>
                Please refresh the page.
            </div>
        `;


        return;

    }


    // Set token
    mapboxgl.accessToken =
        MAPBOX_TOKEN;


    try {

        map =
            new mapboxgl.Map({

                container:
                    mapElement,

                style:
                    "mapbox://styles/mapbox/streets-v12",

                center: [
                    SERVICE_LNG,
                    SERVICE_LAT
                ],

                zoom: 11

            });


        map.addControl(
            new mapboxgl.NavigationControl(),
            "top-right"
        );


        map.on(
            "load",
            () => {

                console.log(
                    "BrightSide: Mapbox loaded successfully."
                );

            }
        );


        map.on(
            "error",
            event => {

                console.error(
                    "BrightSide: Mapbox map error:",
                    event
                );


                // Don't replace the map immediately
                // because Mapbox can produce non-fatal errors.

            }
        );


    } catch (error) {

        console.error(
            "BrightSide: Mapbox initialization error:",
            error
        );


        mapElement.innerHTML = `
            <div class="map-error">
                <strong>Map could not load.</strong>
                <br>
                Please check your Mapbox token.
            </div>
        `;

    }

}


// ============================================
// START MAP AFTER PAGE LOAD
// ============================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startMap
    );

} else {

    startMap();

}


// ============================================
// SEARCH SESSION
// ============================================

let sessionToken =
    createSessionToken();


function createSessionToken() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
        "function"
    ) {

        return window.crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );

}


// ============================================
// SEARCH TIMER
// ============================================

let searchTimer = null;


// ============================================
// ADDRESS INPUT
// ============================================

if (addressInput) {

    addressInput.addEventListener(
        "input",
        () => {

            clearTimeout(
                searchTimer
            );


            resetLocation();


            const query =
                addressInput.value.trim();


            if (
                query.length < 3
            ) {

                hideSuggestions();

                return;

            }


            searchTimer =
                setTimeout(
                    () => {

                        getSuggestions(
                            query
                        );

                    },
                    300
                );

        }
    );

}


// ============================================
// GET MAPBOX SUGGESTIONS
// ============================================

async function getSuggestions(
    query
) {

    try {

        const url =
            "https://api.mapbox.com/search/searchbox/v1/suggest" +

            "?q=" +
            encodeURIComponent(query) +

            "&country=US" +

            "&language=en" +

            "&limit=6" +

            "&session_token=" +
            encodeURIComponent(
                sessionToken
            ) +

            "&proximity=" +
            SERVICE_LNG +
            "," +
            SERVICE_LAT +

            "&access_token=" +
            encodeURIComponent(
                MAPBOX_TOKEN
            );


        console.log(
            "BrightSide: Searching Mapbox..."
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Mapbox Search Error:",
                response.status,
                errorText
            );


            throw new Error(
                `Mapbox search failed (${response.status})`
            );

        }


        const data =
            await response.json();


        console.log(
            "BrightSide: Mapbox suggestions received.",
            data
        );


        showSuggestions(
            data.suggestions || []
        );


    } catch (error) {

        console.error(
            "BrightSide: Address search error:",
            error
        );


        hideSuggestions();

    }

}


// ============================================
// DISPLAY SUGGESTIONS
// ============================================

function showSuggestions(
    suggestions
) {

    if (!suggestionsBox) {
        return;
    }


    suggestionsBox.innerHTML =
        "";


    if (
        !suggestions.length
    ) {

        hideSuggestions();

        return;

    }


    suggestions.forEach(
        suggestion => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "address-suggestion";


            const name =
                suggestion.name ||
                suggestion.name_preferred ||
                "";


            const address =
                suggestion.full_address ||
                suggestion.place_formatted ||
                "";


            button.innerHTML = `
                <strong>
                    ${escapeHTML(name)}
                </strong>

                <span>
                    ${escapeHTML(address)}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    retrieveAddress(
                        suggestion
                    );

                }
            );


            suggestionsBox.appendChild(
                button
            );

        }
    );


    suggestionsBox.style.display =
        "block";

}


// ============================================
// RETRIEVE SELECTED ADDRESS
// ============================================

async function retrieveAddress(
    suggestion
) {

    if (
        !suggestion ||
        !suggestion.mapbox_id
    ) {

        console.error(
            "BrightSide: Invalid Mapbox suggestion.",
            suggestion
        );


        return;

    }


    try {

        const url =
            "https://api.mapbox.com/search/searchbox/v1/retrieve/" +

            encodeURIComponent(
                suggestion.mapbox_id
            ) +

            "?session_token=" +
            encodeURIComponent(
                sessionToken
            ) +

            "&access_token=" +
            encodeURIComponent(
                MAPBOX_TOKEN
            );


        const response =
            await fetch(url);


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Mapbox Retrieve Error:",
                response.status,
                errorText
            );


            throw new Error(
                `Mapbox retrieve failed (${response.status})`
            );

        }


        const data =
            await response.json();


        const feature =
            data.features?.[0];


        if (!feature) {

            throw new Error(
                "Mapbox did not return a location."
            );

        }


        const coordinates =
            feature.geometry.coordinates;


        const longitude =
            coordinates[0];

        const latitude =
            coordinates[1];


        const address =
            feature.properties?.full_address ||
            feature.properties?.place_formatted ||
            suggestion.full_address ||
            suggestion.name ||
            "Selected address";


        // Put selected address in input
        if (addressInput) {

            addressInput.value =
                address;

        }


        // Hide suggestions
        hideSuggestions();


        // Show address on map
        updateMap(
            longitude,
            latitude,
            address
        );


        // Check service area
        checkServiceArea(
            latitude,
            longitude
        );


        // New session after retrieval
        sessionToken =
            createSessionToken();


    } catch (error) {

        console.error(
            "BrightSide: Address retrieval error:",
            error
        );


        addressEligible =
            false;


        if (serviceStatus) {

            serviceStatus.className =
                "service-status not-eligible";


            serviceStatus.innerHTML = `
                <strong>
                    ✕ Unable to verify this address
                </strong>

                <span>
                    Please select your exact address
                    from the suggestions.
                </span>
            `;

        }


        updateAvailabilityState();

    }

}


// ============================================
// UPDATE MAP
// ============================================

function updateMap(
    longitude,
    latitude,
    address
) {

    if (!map) {

        console.error(
            "BrightSide: Map is not initialized."
        );


        return;

    }


    map.flyTo({

        center: [
            longitude,
            latitude
        ],

        zoom: 14,

        essential: true

    });


    if (marker) {

        marker.remove();

    }


    marker =
        new mapboxgl.Marker()
            .setLngLat([
                longitude,
                latitude
            ])
            .setPopup(
                new mapboxgl.Popup({
                    offset: 25
                }).setText(
                    address
                )
            )
            .addTo(map);


    marker.togglePopup();

}


// ============================================
// DISTANCE CALCULATOR
// ============================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const radius =
        3958.8;


    const latDifference =
        (
            lat2 - lat1
        ) *
        Math.PI /
        180;


    const lonDifference =
        (
            lon2 - lon1
        ) *
        Math.PI /
        180;


    const a =
        Math.sin(
            latDifference / 2
        ) ** 2 +

        Math.cos(
            lat1 *
            Math.PI /
            180
        ) *

        Math.cos(
            lat2 *
            Math.PI /
            180
        ) *

        Math.sin(
            lonDifference / 2
        ) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return radius * c;

}


// ============================================
// CHECK SERVICE AREA
// ============================================

function checkServiceArea(
    latitude,
    longitude
) {

    if (!serviceStatus) {
        return;
    }


    const distance =
        calculateDistance(
            SERVICE_LAT,
            SERVICE_LNG,
            latitude,
            longitude
        );


    const miles =
        Math.round(
            distance * 10
        ) / 10;


    if (
        distance <=
        SERVICE_RADIUS
    ) {

        addressEligible =
            true;


        serviceStatus.className =
            "service-status eligible";


        serviceStatus.innerHTML = `
            <strong>
                ✓ You're within our service area
            </strong>

            <span>
                Approximately ${miles}
                miles from the Alief Community Center.
            </span>
        `;


    } else {

        addressEligible =
            false;


        serviceStatus.className =
            "service-status not-eligible";


        serviceStatus.innerHTML = `
            <strong>
                ✕ Outside our current service area
            </strong>

            <span>
                This address is approximately
                ${miles} miles from the
                Alief Community Center.
                Our service radius is 30 miles.
            </span>
        `;

    }


    updateAvailabilityState();

}


// ============================================
// AVAILABILITY UNLOCK
// ============================================

function unlockAvailability() {

    if (
        !availability ||
        !availabilityButton
    ) {
        return;
    }


    availability.className =
        "availability-unlocked";


    availabilityButton.classList.remove(
        "disabled-button"
    );


    availabilityButton.style.pointerEvents =
        "auto";


    availabilityButton.style.cursor =
        "pointer";


    availabilityButton.setAttribute(
        "aria-disabled",
        "false"
    );


    availabilityButton.removeAttribute(
        "tabindex"
    );


    const message =
        availability.querySelector(
            ".availability-message"
        );


    if (message) {

        message.innerHTML = `
            <strong>
                ✓ Ready to book
            </strong>

            <p>
                Your vehicle and location are confirmed.
                Continue to choose your weekend appointment.
            </p>
        `;

    }

}


// ============================================
// AVAILABILITY LOCK
// ============================================

function lockAvailability() {

    if (
        !availability ||
        !availabilityButton
    ) {
        return;
    }


    availability.className =
        "availability-locked";


    availabilityButton.classList.add(
        "disabled-button"
    );


    availabilityButton.style.pointerEvents =
        "none";


    availabilityButton.style.cursor =
        "not-allowed";


    availabilityButton.setAttribute(
        "aria-disabled",
        "true"
    );


    availabilityButton.setAttribute(
        "tabindex",
        "-1"
    );


    const message =
        availability.querySelector(
            ".availability-message"
        );


    if (message) {

        message.innerHTML = `
            <strong>
                Check Availability
            </strong>

            <p>
                Complete your vehicle information,
                service selection, and service-area check
                to continue.
            </p>
        `;

    }

}


// ============================================
// RESET LOCATION
// ============================================

function resetLocation() {

    addressEligible =
        false;


    if (serviceStatus) {

        serviceStatus.className =
            "service-status";


        serviceStatus.innerHTML =
            "";

    }


    updateAvailabilityState();

}


// ============================================
// BUILD CALENDLY URL
// ============================================

function buildCalendlyURL() {

    const service =
        getSelectedService();


    if (!service) {
        return null;
    }


    const baseURL =
        CALENDLY_URLS[service];


    if (!baseURL) {
        return null;
    }


    const params =
        new URLSearchParams();


    // Vehicle information
    if (vehicleMake) {

        params.set(
            "make",
            vehicleMake.value.trim()
        );

    }


    if (vehicleModel) {

        params.set(
            "model",
            vehicleModel.value.trim()
        );

    }


    if (vehicleYear) {

        params.set(
            "year",
            vehicleYear.value.trim()
        );

    }


    if (vehicleSize) {

        params.set(
            "vehicle_type",
            vehicleSize.value
        );

    }


    // Service
    params.set(
        "service",
        getServiceName(service)
    );


    // Address
    if (addressInput) {

        params.set(
            "address",
            addressInput.value.trim()
        );

    }


    // Condition/comments
    if (conditionInput) {

        const condition =
            conditionInput.value.trim();


        if (condition) {

            params.set(
                "comments",
                condition
            );

        }

    }


    return (
        baseURL +
        "?" +
        params.toString()
    );

}


// ============================================
// CALENDLY BUTTON CLICK
// ============================================

if (availabilityButton) {

    availabilityButton.addEventListener(
        "click",
        event => {

            event.preventDefault();


            // Recheck everything
            const vehicleComplete =
                vehicleInformationComplete();


            const serviceComplete =
                serviceSelectionComplete();


            if (
                !addressEligible ||
                !vehicleComplete ||
                !serviceComplete
            ) {

                updateAvailabilityState();

                return;

            }


            const calendlyURL =
                buildCalendlyURL();


            if (!calendlyURL) {

                console.error(
                    "BrightSide: Could not build Calendly URL."
                );


                return;

            }


            console.log(
                "BrightSide: Opening Calendly."
            );


            // Open selected Calendly event
            window.location.href =
                calendlyURL;

        }
    );

}


// ============================================
// LIVE FORM VALIDATION
// ============================================

[
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleSize,
    conditionInput
].forEach(input => {

    if (!input) return;


    input.addEventListener(
        "input",
        updateAvailabilityState
    );


    input.addEventListener(
        "change",
        updateAvailabilityState
    );

});


// ============================================
// HIDE SUGGESTIONS
// ============================================

function hideSuggestions() {

    if (!suggestionsBox) {
        return;
    }


    suggestionsBox.innerHTML =
        "";


    suggestionsBox.style.display =
        "none";

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================
// CLICK OUTSIDE ADDRESS SEARCH
// ============================================

document.addEventListener(
    "click",
    event => {

        if (
            addressInput &&
            suggestionsBox &&
            !addressInput.contains(
                event.target
            ) &&
            !suggestionsBox.contains(
                event.target
            )
        ) {

            hideSuggestions();

        }

    }
);


// ============================================
// INITIALIZE
// ============================================

updatePrices();

updateAvailabilityState();


// ============================================
// CONSOLE MESSAGE
// ============================================

console.log(
    "BrightSide booking JavaScript loaded successfully."
);

}
