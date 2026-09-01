// ============================================
// BRIGHTSIDE HOUSTON DETAILING
// SHARED JAVASCRIPT
// ============================================

// ============================================
// MAPBOX PUBLIC TOKEN
// ============================================

const MAPBOX_TOKEN =
"pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5a3FuMDUwNHVlMndweWFzNXAwMG5rIn0.HYTbUgwvgO3_fn7f0mHCDg";

// ============================================
// MOBILE MENU
// ============================================

const menuButton =
document.getElementById("menuButton");

const navLinks =
document.querySelector(".nav-links");

if (menuButton && navLinks) {

```
menuButton.addEventListener("click", () => {

    navLinks.classList.toggle(
        "mobile-open"
    );

});
```

}

// ============================================
// BOOKING PAGE
// ============================================

const bookingPage =
document.getElementById("booking-page");

if (bookingPage) {

```
// ========================================
// SERVICE AREA
// ========================================

const SERVICE_LAT =
    29.70254;

const SERVICE_LNG =
    -95.58891;

const SERVICE_RADIUS =
    30;


// ========================================
// ELEMENTS
// ========================================

const addressInput =
    document.getElementById("address");

const suggestionsBox =
    document.getElementById(
        "address-suggestions"
    );

const serviceStatus =
    document.getElementById(
        "service-status"
    );

const availability =
    document.getElementById(
        "availability-container"
    );

const availabilityButton =
    document.getElementById(
        "availability-button"
    );

const mapElement =
    document.getElementById("map");

const vehicleSize =
    document.getElementById(
        "vehicle-size"
    );

const vehiclePrice =
    document.getElementById(
        "vehicle-price"
    );

const makeInput =
    document.getElementById(
        "vehicle-make"
    );

const modelInput =
    document.getElementById(
        "vehicle-model"
    );

const yearInput =
    document.getElementById(
        "vehicle-year"
    );

const conditionInput =
    document.getElementById(
        "condition"
    );


// ========================================
// PRICING
// ========================================

const prices = {

    sedan: {
        express: 75,
        interior: 100,
        full: 150
    },

    suv: {
        express: 90,
        interior: 115,
        full: 175
    },

    truck: {
        express: 100,
        interior: 130,
        full: 200
    }

};


// ========================================
// CALENDLY LINKS
// ========================================

const calendlyLinks = {

    express:
        "https://calendly.com/brightsidemdetails/express-exterior",

    interior:
        "https://calendly.com/brightsidemdetails/full-interior",

    "full-detail":
        "https://calendly.com/brightsidemdetails/30min"

};


// ========================================
// BOOKING STATE
// ========================================

let selectedCoordinates =
    null;

let addressIsEligible =
    false;


// ========================================
// URL PACKAGE SELECTION
// ========================================

function selectPackageFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const requestedService =
        params.get("service");


    if (!requestedService) {
        return;
    }


    const radio =
        document.querySelector(
            `input[name="service"][value="${requestedService}"]`
        );


    if (radio) {

        radio.checked =
            true;

        radio.dispatchEvent(
            new Event("change")
        );

    }

}


// ========================================
// VEHICLE PRICING
// ========================================

function updatePrices() {

    const vehicle =
        vehicleSize?.value;


    const priceElements =
        document.querySelectorAll(
            ".service-price"
        );


    if (!vehicle) {

        if (vehiclePrice) {

            vehiclePrice.textContent =
                "Choose your vehicle type to see your price.";

        }


        priceElements.forEach(
            element => {

                element.textContent =
                    "Select Vehicle";

            }
        );

        updateAvailabilityState();

        return;

    }


    const selected =
        prices[vehicle];


    if (!selected) {
        return;
    }


    if (vehiclePrice) {

        vehiclePrice.innerHTML =
            `
            <strong>Starting pricing:</strong>
            Exterior $${selected.express}
            • Interior $${selected.interior}
            • Full Detail $${selected.full}
            `;

    }


    priceElements.forEach(
        element => {

            const card =
                element.closest(
                    ".service-card"
                );


            const radio =
                card?.querySelector(
                    "input[name='service']"
                );


            if (!radio) {
                return;
            }


            if (
                radio.value ===
                "express"
            ) {

                element.textContent =
                    `$${selected.express}`;

            }


            if (
                radio.value ===
                "interior"
            ) {

                element.textContent =
                    `$${selected.interior}`;

            }


            if (
                radio.value ===
                "full-detail"
            ) {

                element.textContent =
                    `$${selected.full}`;

            }

        }
    );


    updateAvailabilityState();

}


if (vehicleSize) {

    vehicleSize.addEventListener(
        "change",
        updatePrices
    );

}


// ========================================
// MAPBOX MAP
// ========================================

let map =
    null;

let marker =
    null;


function startMap() {

    if (!mapElement) {
        return;
    }


    if (
        !MAPBOX_TOKEN ||
        !MAPBOX_TOKEN.startsWith("pk.")
    ) {

        console.error(
            "Mapbox requires a public pk... token."
        );

        mapElement.innerHTML = `
            <div class="map-error">
                Map is temporarily unavailable.
                Please check the Mapbox public token.
            </div>
        `;

        return;

    }


    if (
        typeof mapboxgl ===
        "undefined"
    ) {

        console.error(
            "Mapbox GL JS did not load."
        );

        return;

    }


    mapboxgl.accessToken =
        MAPBOX_TOKEN;


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
        new mapboxgl.NavigationControl()
    );

}


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


// ========================================
// MAPBOX SEARCH SESSION
// ========================================

const sessionToken =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"

        ? crypto.randomUUID()

        : String(
            Date.now()
        );


let searchTimer;


// ========================================
// ADDRESS INPUT
// ========================================

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
                    350
                );

        }
    );

}


// ========================================
// MAPBOX SUGGEST
// ========================================

async function getSuggestions(
    query
) {

    try {

        const url =
            "https://api.mapbox.com/search/searchbox/v1/suggest" +

            "?q=" +
            encodeURIComponent(
                query
            ) +

            "&country=US" +

            "&language=en" +

            "&limit=6" +

            "&proximity=" +
            SERVICE_LNG +
            "," +
            SERVICE_LAT +

            "&session_token=" +
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

            throw new Error(
                "Mapbox suggestion request failed: " +
                response.status
            );

        }


        const data =
            await response.json();


        showSuggestions(
            data.suggestions || []
        );


    } catch (error) {

        console.error(
            "Mapbox suggestion error:",
            error
        );

        hideSuggestions();

    }

}


// ========================================
// SHOW SUGGESTIONS
// ========================================

function showSuggestions(
    suggestions
) {

    if (!suggestionsBox) {
        return;
    }


    suggestionsBox.innerHTML =
        "";


    if (
        suggestions.length === 0
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


            button.innerHTML =
                `
                <strong>
                    ${escapeHTML(
                        suggestion.name ||
                        ""
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        suggestion.full_address ||
                        suggestion.place_formatted ||
                        ""
                    )}
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


// ========================================
// RETRIEVE ADDRESS
// ========================================

async function retrieveAddress(
    suggestion
) {

    if (
        !suggestion ||
        !suggestion.mapbox_id
    ) {

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

            throw new Error(
                "Mapbox retrieve failed: " +
                response.status
            );

        }


        const data =
            await response.json();


        const feature =
            data.features?.[0];


        if (!feature) {

            throw new Error(
                "No address feature returned."
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


        addressInput.value =
            address;


        selectedCoordinates = {

            latitude:
                latitude,

            longitude:
                longitude

        };


        hideSuggestions();


        updateMap(
            longitude,
            latitude,
            address
        );


        checkServiceArea(
            latitude,
            longitude
        );

    } catch (error) {

        console.error(
            "Address retrieval error:",
            error
        );

        if (serviceStatus) {

            serviceStatus.className =
                "service-status not-eligible";

            serviceStatus.innerHTML =
                `
                <strong>
                    We couldn't verify this address.
                </strong>

                <span>
                    Please select an address directly
                    from the Mapbox suggestions.
                </span>
                `;

        }

        lockAvailability();

    }

}


// ========================================
// UPDATE MAP
// ========================================

function updateMap(
    longitude,
    latitude,
    address
) {

    if (!map) {
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


// ========================================
// DISTANCE
// ========================================

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


// ========================================
// CHECK SERVICE AREA
// ========================================

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

        addressIsEligible =
            true;


        serviceStatus.className =
            "service-status eligible";


        serviceStatus.innerHTML =
            `
            <strong>
                ✓ You're within our service area
            </strong>

            <span>
                Approximately ${miles}
                miles from the Alief Community Center.
            </span>
            `;


        updateAvailabilityState();

    } else {

        addressIsEligible =
            false;


        serviceStatus.className =
            "service-status not-eligible";


        serviceStatus.innerHTML =
            `
            <strong>
                ✕ Outside our current service area
            </strong>

            <span>
                This address is approximately
                ${miles} miles from the Alief Community Center.
                Our current service radius is 30 miles.
            </span>
            `;


        lockAvailability();

    }

}


// ========================================
// REQUIRED FIELD CHECK
// ========================================

function getSelectedService() {

    const selected =
        document.querySelector(
            "input[name='service']:checked"
        );


    return selected
        ? selected.value
        : "";

}


function findFirstMissingField() {

    if (
        !makeInput ||
        !makeInput.value.trim()
    ) {

        return makeInput;

    }


    if (
        !modelInput ||
        !modelInput.value.trim()
    ) {

        return modelInput;

    }


    if (
        !yearInput ||
        !yearInput.value.trim()
    ) {

        return yearInput;

    }


    if (
        !vehicleSize ||
        !vehicleSize.value
    ) {

        return vehicleSize;

    }


    const service =
        getSelectedService();


    if (!service) {

        return document.querySelector(
            ".service-card input[name='service']"
        );

    }


    if (
        !addressInput ||
        !selectedCoordinates
    ) {

        return addressInput;

    }


    if (!addressIsEligible) {

        return addressInput;

    }


    return null;

}


// ========================================
// SCROLL TO MISSING INFORMATION
// ========================================

function focusMissingField(
    field
) {

    if (!field) {
        return;
    }


    let target =
        field;


    const serviceCard =
        field.closest(
            ".service-card"
        );


    if (serviceCard) {

        target =
            serviceCard;

    }


    target.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });


    setTimeout(
        () => {

            if (
                typeof field.focus ===
                "function"
            ) {

                field.focus();

            }

        },
        500
    );


    target.classList.add(
        "field-attention"
    );


    setTimeout(
        () => {

            target.classList.remove(
                "field-attention"
            );

        },
        1800
    );

}


// ========================================
// VALIDATE BOOKING
// ========================================

function validateBooking() {

    const missing =
        findFirstMissingField();


    if (missing) {

        focusMissingField(
            missing
        );


        return false;

    }


    return true;

}


// ========================================
// AVAILABILITY STATE
// ========================================

function updateAvailabilityState() {

    const missing =
        findFirstMissingField();


    if (
        !missing &&
        addressIsEligible
    ) {

        unlockAvailability();

    } else {

        lockAvailability();

    }

}


function unlockAvailability() {

    if (
        !availability ||
        !availabilityButton
    ) {
        return;
    }


    const selectedService =
        getSelectedService();


    const calendlyURL =
        calendlyLinks[
            selectedService
        ];


    if (!calendlyURL) {

        lockAvailability();

        return;

    }


    availability.className =
        "availability-unlocked";


    availabilityButton.classList.remove(
        "disabled-button"
    );


    availabilityButton.style.pointerEvents =
        "auto";


    availabilityButton.setAttribute(
        "aria-disabled",
        "false"
    );


    availabilityButton.href =
        calendlyURL;


    const message =
        availability.querySelector(
            ".availability-message"
        );


    if (message) {

        message.innerHTML =
            `
            <strong>
                ✓ Ready to check availability
            </strong>

            <p>
                Your information and service area
                are confirmed. Continue to Calendly
                to choose your appointment.
            </p>
            `;

    }

}


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


    availabilityButton.setAttribute(
        "aria-disabled",
        "true"
    );


    availabilityButton.href =
        "#";


    const message =
        availability.querySelector(
            ".availability-message"
        );


    if (message) {

        message.innerHTML =
            `
            <strong>
                Check Availability
            </strong>

            <p>
                Complete the required information
                and confirm your service area first.
            </p>
            `;

    }

}


// ========================================
// SERVICE SELECTION
// ========================================

const serviceRadios =
    document.querySelectorAll(
        "input[name='service']"
    );


serviceRadios.forEach(
    radio => {

        radio.addEventListener(
            "change",
            () => {

                updatePrices();

                updateAvailabilityState();

            }
        );

    }
);


// ========================================
// VEHICLE FIELD LISTENERS
// ========================================

[
    makeInput,
    modelInput,
    yearInput
].forEach(
    field => {

        if (!field) {
            return;
        }


        field.addEventListener(
            "input",
            () => {

                updateAvailabilityState();

            }
        );

    }
);


// ========================================
// AVAILABILITY BUTTON
// ========================================

if (availabilityButton) {

    availabilityButton.addEventListener(
        "click",
        event => {

            if (
                !validateBooking()
            ) {

                event.preventDefault();

                return;

            }

            const selectedService =
                getSelectedService();


            const calendlyURL =
                calendlyLinks[
                    selectedService
                ];


            if (!calendlyURL) {

                event.preventDefault();

                return;

            }


            availabilityButton.href =
                calendlyURL;

        }
    );

}


// ========================================
// RESET LOCATION
// ========================================

function resetLocation() {

    selectedCoordinates =
        null;

    addressIsEligible =
        false;


    if (serviceStatus) {

        serviceStatus.className =
            "service-status";

        serviceStatus.innerHTML =
            "";

    }


    lockAvailability();

}


// ========================================
// HIDE SUGGESTIONS
// ========================================

function hideSuggestions() {

    if (!suggestionsBox) {
        return;
    }


    suggestionsBox.innerHTML =
        "";

    suggestionsBox.style.display =
        "none";

}


// ========================================
// ESCAPE HTML
// ========================================

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


// ========================================
// CLICK OUTSIDE ADDRESS SUGGESTIONS
// ========================================

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


// ========================================
// INITIALIZE
// ========================================

updatePrices();

selectPackageFromURL();

updatePrices();

updateAvailabilityState();
```

}
