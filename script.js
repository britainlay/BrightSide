// ============================================
// BRIGHTSIDE DETAILING
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


// If this is NOT the booking page,
// don't run the Mapbox / booking code.

if (bookingPage) {


    // ========================================
    // MAPBOX
    // ========================================

    const MAPBOX_TOKEN =
        "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyYWV0In0.Usd3fiKRnMZq1oE6cYy1Jg";


    // Alief Community Center
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


    // ========================================
    // SERVICE / CALENDLY LINKS
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
    // VEHICLE PRICING
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
    // PACKAGE SELECTION
    // ========================================

    const serviceRadios =
        document.querySelectorAll(
            "input[name='service']"
        );


    // Get package from URL
    //
    // Examples:
    //
    // booking/?service=express
    // booking/?service=interior
    // booking/?service=full-detail

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const requestedService =
        urlParams.get("service");


    function selectService(
        serviceName
    ) {

        if (!serviceName) {
            return;
        }


        const radio =
            document.querySelector(
                `input[name="service"][value="${serviceName}"]`
            );


        if (!radio) {
            return;
        }


        radio.checked = true;


        // Update visual card

        document
            .querySelectorAll(".service-card")
            .forEach(card => {

                card.classList.remove(
                    "selected"
                );

            });


        const card =
            radio.closest(
                ".service-card"
            );


        if (card) {

            card.classList.add(
                "selected"
            );

        }


        updateCalendlyLink();

    }


    // ========================================
    // UPDATE CALENDLY LINK
    // ========================================

    function updateCalendlyLink() {

        if (!availabilityButton) {
            return;
        }


        const selectedService =
            document.querySelector(
                "input[name='service']:checked"
            );


        if (!selectedService) {

            availabilityButton.href =
                calendlyLinks["full-detail"];

            return;

        }


        const service =
            selectedService.value;


        if (
            calendlyLinks[service]
        ) {

            availabilityButton.href =
                calendlyLinks[service];

        }

    }


    // ========================================
    // SERVICE RADIO EVENTS
    // ========================================

    serviceRadios.forEach(
        radio => {

            radio.addEventListener(
                "change",
                () => {

                    // Update selected card

                    document
                        .querySelectorAll(
                            ".service-card"
                        )
                        .forEach(card => {

                            card.classList.remove(
                                "selected"
                            );

                        });


                    const card =
                        radio.closest(
                            ".service-card"
                        );


                    if (card) {

                        card.classList.add(
                            "selected"
                        );

                    }


                    // Update Calendly

                    updateCalendlyLink();

                }
            );

        }
    );


    // ========================================
    // VEHICLE PRICING
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


            priceElements.forEach(
                element => {

                    element.textContent =
                        "Select Vehicle";

                }
            );


            return;

        }


        const selected =
            prices[vehicle];


        if (!selected) {
            return;
        }


        // Main pricing message

        if (vehiclePrice) {

            vehiclePrice.innerHTML = `

                <strong>
                    Estimated pricing:
                </strong>

                Express $${selected.express}

                • Interior $${selected.interior}

                • Full Detail $${selected.full}

            `;

        }


        // Update individual service cards

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
                    radio.value === "express"
                ) {

                    element.textContent =
                        `$${selected.express}`;

                }


                if (
                    radio.value === "interior"
                ) {

                    element.textContent =
                        `$${selected.interior}`;

                }


                if (
                    radio.value === "full-detail"
                ) {

                    element.textContent =
                        `$${selected.full}`;

                }

            }
        );

    }


    if (vehicleSize) {

        vehicleSize.addEventListener(
            "change",
            updatePrices
        );

    }


    // ========================================
    // INITIAL PACKAGE SELECTION
    // ========================================

    if (
        requestedService &&
        calendlyLinks[requestedService]
    ) {

        selectService(
            requestedService
        );

    }


    // ========================================
    // MAPBOX MAP
    // ========================================

    let map = null;

    let marker = null;


    function startMap() {

        if (!mapElement) {
            return;
        }


        if (
            !MAPBOX_TOKEN ||
            MAPBOX_TOKEN ===
                "PASTE_YOUR_CURRENT_PK_TOKEN_HERE"
        ) {

            console.error(
                "Add your Mapbox pk. token to script.js"
            );

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
    // SEARCH SESSION
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
                    "Mapbox request failed: " +
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
    // DISPLAY SUGGESTIONS
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


                button.innerHTML = `

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
    // RETRIEVE SELECTED ADDRESS
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
                sessionToken +

                "&access_token=" +
                MAPBOX_TOKEN;


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
                suggestion.name;


            addressInput.value =
                address;


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


            unlockAvailability();


        } else {

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

        }

    }


    // ========================================
    // AVAILABILITY
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


        // Make sure Calendly matches
        // the selected package.

        updateCalendlyLink();


        const message =
            availability.querySelector(
                ".availability-message"
            );


        if (message) {

            message.innerHTML = `

                <strong>
                    ✓ Location confirmed
                </strong>

                <p>
                    Your address is within our
                    service area. Check the available
                    appointments for your selected service.
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
                    Confirm that your address
                    is within our service area
                    to continue.
                </p>

            `;

        }

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
    // CLICK OUTSIDE
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

}
