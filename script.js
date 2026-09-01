// ============================================
// BRIGHTSIDE HOUSTON DETAILING
// SHARED JAVASCRIPT
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

const bookingPage =
    document.getElementById("booking-page");


// Everything below this point only runs
// on the booking page.

if (bookingPage) {


    // ========================================
    // MAPBOX
    // ========================================

    const MAPBOX_TOKEN =
        "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyZWF0In0.Usd3fiKRnMZq1oE6cYy1Jg";


    // Alief Community Center
    const SERVICE_LAT = 29.70254;
    const SERVICE_LNG = -95.58891;

    const SERVICE_RADIUS = 30;


    // ========================================
    // ELEMENTS
    // ========================================

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

    const vehicleSize =
        document.getElementById("vehicle-size");

    const vehiclePrice =
        document.getElementById("vehicle-price");

    const vehicleMake =
        document.getElementById("vehicle-make");

    const vehicleModel =
        document.getElementById("vehicle-model");

    const vehicleYear =
        document.getElementById("vehicle-year");

    const condition =
        document.getElementById("condition");


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
    // UPDATE PRICES
    // ========================================

    function updatePrices() {

        if (!vehicleSize) {
            return;
        }


        const vehicle =
            vehicleSize.value;


        const priceElements =
            document.querySelectorAll(
                ".service-price"
            );


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


            validateBooking();

            return;

        }


        const selected =
            prices[vehicle];


        if (!selected) {
            return;
        }


        if (vehiclePrice) {

            vehiclePrice.innerHTML = `
                <strong>Estimated starting prices:</strong>
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


            if (!radio) {
                return;
            }


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


        validateBooking();

    }


    if (vehicleSize) {

        vehicleSize.addEventListener(
            "change",
            updatePrices
        );

    }


    // ========================================
    // SERVICE SELECTION
    // ========================================

    const serviceRadios =
        document.querySelectorAll(
            "input[name='service']"
        );


    serviceRadios.forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                updateCalendlyLink();
                validateBooking();

            }
        );

    });


    // ========================================
    // MAP
    // ========================================

    let map = null;
    let marker = null;


    function startMap() {

        if (!mapElement) {
            return;
        }


        if (
            typeof mapboxgl === "undefined"
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

                container: mapElement,

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


        map.on("load", () => {

            map.resize();

        });

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
        crypto.randomUUID();


    let searchTimer;


    // ========================================
    // ADDRESS INPUT
    // ========================================

    if (addressInput) {

        addressInput.addEventListener(
            "input",
            () => {

                clearTimeout(searchTimer);


                resetLocation();


                const query =
                    addressInput.value.trim();


                if (query.length < 3) {

                    hideSuggestions();

                    return;

                }


                searchTimer =
                    setTimeout(() => {

                        getSuggestions(query);

                    }, 350);

            }
        );

    }


    // ========================================
    // MAPBOX ADDRESS SUGGESTIONS
    // ========================================

    async function getSuggestions(query) {

        try {

            const url =
                "https://api.mapbox.com/search/searchbox/v1/suggest" +

                "?q=" +
                encodeURIComponent(query) +

                "&country=US" +

                "&language=en" +

                "&types=address" +

                "&limit=6" +

                "&session_token=" +
                sessionToken +

                "&proximity=" +
                SERVICE_LNG +
                "," +
                SERVICE_LAT +

                "&access_token=" +
                MAPBOX_TOKEN;


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
    // SHOW ADDRESS SUGGESTIONS
    // ========================================

    function showSuggestions(suggestions) {

        if (!suggestionsBox) {
            return;
        }


        suggestionsBox.innerHTML = "";


        if (
            !suggestions ||
            suggestions.length === 0
        ) {

            hideSuggestions();

            return;

        }


        suggestions.forEach(suggestion => {

            const button =
                document.createElement("button");


            button.type = "button";

            button.className =
                "address-suggestion";


            button.innerHTML = `

                <strong>
                    ${escapeHTML(
                        suggestion.name || ""
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

        });


        suggestionsBox.style.display =
            "block";

    }


    // ========================================
    // RETRIEVE SELECTED ADDRESS
    // ========================================

    async function retrieveAddress(suggestion) {

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
                sessionToken +

                "&access_token=" +
                MAPBOX_TOKEN;


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    "Mapbox retrieve request failed: " +
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


            // Put selected address into search box
            addressInput.value =
                address;


            hideSuggestions();


            // Show selected address on map
            updateMap(
                longitude,
                latitude,
                address
            );


            // Check eligibility
            checkServiceArea(
                latitude,
                longitude
            );


            // Re-check complete booking
            validateBooking();


        } catch (error) {

            console.error(
                "Address retrieval error:",
                error
            );

            if (serviceStatus) {

                serviceStatus.className =
                    "service-status not-eligible";

                serviceStatus.innerHTML = `

                    <strong>
                        We couldn't verify this address.
                    </strong>

                    <span>
                        Please select an address
                        from the suggestions.
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

            console.error(
                "Map is not initialized."
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
                    }).setText(address)

                )
                .addTo(map);


        marker.togglePopup();


        // Helps prevent the map from rendering
        // incorrectly after moving to the address.
        setTimeout(() => {

            map.resize();

        }, 300);

    }


    // ========================================
    // DISTANCE CALCULATION
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
            return false;
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
            distance <= SERVICE_RADIUS
        ) {

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


            validateBooking();


            return true;

        }


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


        lockAvailability();


        return false;

    }


    // ========================================
    // GET SELECTED SERVICE
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


    // ========================================
    // UPDATE CALENDLY LINK
    // ========================================

    function updateCalendlyLink() {

        if (!availabilityButton) {
            return;
        }


        const selectedService =
            getSelectedService();


        if (
            calendlyLinks[selectedService]
        ) {

            availabilityButton.href =
                calendlyLinks[selectedService];

        } else {

            availabilityButton.href =
                calendlyLinks["full-detail"];

        }

    }


    // ========================================
    // CHECK REQUIRED INFORMATION
    // ========================================

    function getMissingFields() {

        const missing = [];


        if (
            !vehicleMake ||
            !vehicleMake.value.trim()
        ) {

            missing.push({
                element: vehicleMake,
                label: "Vehicle make"
            });

        }


        if (
            !vehicleModel ||
            !vehicleModel.value.trim()
        ) {

            missing.push({
                element: vehicleModel,
                label: "Vehicle model"
            });

        }


        if (
            !vehicleYear ||
            !vehicleYear.value
        ) {

            missing.push({
                element: vehicleYear,
                label: "Vehicle year"
            });

        }


        if (
            !vehicleSize ||
            !vehicleSize.value
        ) {

            missing.push({
                element: vehicleSize,
                label: "Vehicle type"
            });

        }


        if (!getSelectedService()) {

            const firstService =
                document.querySelector(
                    ".service-card"
                );


            missing.push({
                element: firstService,
                label: "Service"
            });

        }


        if (
            !addressInput ||
            !addressInput.value.trim()
        ) {

            missing.push({
                element: addressInput,
                label: "Service address"
            });

        }


        return missing;

    }


    // ========================================
    // VALIDATE BOOKING
    // ========================================

    function validateBooking() {

        if (
            !availability ||
            !availabilityButton
        ) {

            return;

        }


        updateCalendlyLink();


        const missing =
            getMissingFields();


        const locationConfirmed =
            serviceStatus?.classList.contains(
                "eligible"
            );


        if (
            missing.length === 0 &&
            locationConfirmed
        ) {

            unlockAvailability();

            return;

        }


        lockAvailability();

    }


    // ========================================
    // AVAILABILITY UNLOCK
    // ========================================

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


        availabilityButton.setAttribute(
            "aria-disabled",
            "false"
        );


        const message =
            availability.querySelector(
                ".availability-message"
            );


        if (message) {

            message.innerHTML = `

                <strong>
                    ✓ You're ready to check availability
                </strong>

                <p>
                    Your vehicle, service, and location
                    information are complete.
                </p>

            `;

        }

    }


    // ========================================
    // LOCK AVAILABILITY
    // ========================================

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
                    Complete the required information
                    and confirm your address is within
                    our service area to continue.
                </p>

            `;

        }

    }


    // ========================================
    // REQUIRED FIELD EVENTS
    // ========================================

    [
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleSize,
        condition
    ].forEach(element => {

        if (!element) {
            return;
        }


        element.addEventListener(
            "input",
            validateBooking
        );


        element.addEventListener(
            "change",
            validateBooking
        );

    });


    // ========================================
    // PRESELECT PACKAGE FROM URL
    // ========================================

    function preselectPackage() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const packageName =
            params.get("service");


        if (!packageName) {
            return;
        }


        const matchingRadio =
            document.querySelector(
                `input[name="service"][value="${packageName}"]`
            );


        if (!matchingRadio) {
            return;
        }


        matchingRadio.checked =
            true;


        // Visually scroll toward the service
        // section so the selection is obvious.
        const serviceBlock =
            matchingRadio.closest(
                ".form-block"
            );


        if (serviceBlock) {

            setTimeout(() => {

                serviceBlock.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }, 250);

        }


        updateCalendlyLink();
        validateBooking();

    }


    // ========================================
    // CLICK CHECK AVAILABILITY
    // ========================================

    if (availabilityButton) {

        availabilityButton.addEventListener(
            "click",
            event => {

                const missing =
                    getMissingFields();


                const locationConfirmed =
                    serviceStatus?.classList.contains(
                        "eligible"
                    );


                if (
                    missing.length > 0 ||
                    !locationConfirmed
                ) {

                    event.preventDefault();


                    if (missing.length > 0) {

                        const firstMissing =
                            missing[0];


                        if (
                            firstMissing.element
                        ) {

                            firstMissing.element
                                .scrollIntoView({
                                    behavior: "smooth",
                                    block: "center"
                                });


                            setTimeout(() => {

                                try {

                                    firstMissing.element.focus();

                                } catch (error) {

                                    // Ignore focus errors
                                }

                            }, 500);

                        }

                    }


                    return;

                }


                updateCalendlyLink();

            }
        );

    }


    // ========================================
    // RESET LOCATION
    // ========================================

    function resetLocation() {

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

    function escapeHTML(value) {

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
    // CLICK OUTSIDE SUGGESTIONS
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
    updateCalendlyLink();
    lockAvailability();

    setTimeout(() => {

        preselectPackage();

    }, 100);

}
