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
// BOOKING PAGE
// ============================================

const bookingPage =
    document.getElementById("booking-page");


if (bookingPage) {


    // ========================================
    // MAPBOX
    // ========================================

    const MAPBOX_TOKEN =
        "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyZWF0In0.Usd3fiKRnMZq1oE6cYy1Jg";


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

    const vehicleMake =
        document.getElementById(
            "vehicle-make"
        );

    const vehicleModel =
        document.getElementById(
            "vehicle-model"
        );

    const vehicleYear =
        document.getElementById(
            "vehicle-year"
        );

    const vehiclePrice =
        document.getElementById(
            "vehicle-price"
        );


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
    // SELECT PACKAGE FROM URL
    // ========================================

    function selectPackageFromURL() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const selectedService =
            params.get("service");


        if (!selectedService) {
            return;
        }


        const serviceRadio =
            document.querySelector(
                `input[name="service"][value="${selectedService}"]`
            );


        if (serviceRadio) {

            serviceRadio.checked = true;


            const selectedCard =
                serviceRadio.closest(
                    ".service-card"
                );


            if (selectedCard) {

                selectedCard.classList.add(
                    "selected-service"
                );

            }

        }

    }


    selectPackageFromURL();



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
    // UPDATE PRICES
    // ========================================

    function updatePrices() {

        const vehicle =
            vehicleSize?.value || "";


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


            // IMPORTANT:
            // If vehicle type is cleared,
            // lock availability again.

            lockAvailability();

            return;

        }


        const selected =
            prices[vehicle];


        if (!selected) {
            lockAvailability();
            return;
        }


        if (vehiclePrice) {

            vehiclePrice.innerHTML =
                `<strong>Estimated pricing:</strong>
                Express $${selected.express}
                • Interior $${selected.interior}
                • Full Detail $${selected.full}`;

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


    serviceRadios.forEach(
        radio => {

            radio.addEventListener(
                "change",
                () => {


                    document
                        .querySelectorAll(
                            ".service-card"
                        )
                        .forEach(
                            card => {

                                card.classList.remove(
                                    "selected-service"
                                );

                            }
                        );


                    const selectedCard =
                        radio.closest(
                            ".service-card"
                        );


                    if (selectedCard) {

                        selectedCard.classList.add(
                            "selected-service"
                        );

                    }


                    validateBooking();

                }
            );

        }
    );



    // ========================================
    // INPUT LISTENERS
    // ========================================

    [
        vehicleMake,
        vehicleModel,
        vehicleYear
    ].forEach(
        input => {

            if (!input) {
                return;
            }


            input.addEventListener(
                "input",
                () => {

                    validateBooking();

                }
            );

        }
    );



    // ========================================
    // BOOKING VALIDATION
    // ========================================

    function validateBooking(
        shouldScroll = false
    ) {


        // -------------------------------
        // MAKE
        // -------------------------------

        if (
            !vehicleMake ||
            !vehicleMake.value.trim()
        ) {

            lockAvailability(
                "Please enter your vehicle make."
            );


            if (shouldScroll) {

                scrollToField(
                    vehicleMake
                );

            }


            return false;

        }


        // -------------------------------
        // MODEL
        // -------------------------------

        if (
            !vehicleModel ||
            !vehicleModel.value.trim()
        ) {

            lockAvailability(
                "Please enter your vehicle model."
            );


            if (shouldScroll) {

                scrollToField(
                    vehicleModel
                );

            }


            return false;

        }


        // -------------------------------
        // YEAR
        // -------------------------------

        if (
            !vehicleYear ||
            !vehicleYear.value
        ) {

            lockAvailability(
                "Please enter your vehicle year."
            );


            if (shouldScroll) {

                scrollToField(
                    vehicleYear
                );

            }


            return false;

        }


        const year =
            Number(
                vehicleYear.value
            );


        if (
            year < 1980 ||
            year > 2030
        ) {

            lockAvailability(
                "Please enter a valid vehicle year."
            );


            if (shouldScroll) {

                scrollToField(
                    vehicleYear
                );

            }


            return false;

        }


        // -------------------------------
        // VEHICLE TYPE
        // -------------------------------

        if (
            !vehicleSize ||
            !vehicleSize.value
        ) {

            lockAvailability(
                "Please choose your vehicle type."
            );


            if (shouldScroll) {

                scrollToField(
                    vehicleSize
                );

            }


            return false;

        }


        // -------------------------------
        // SERVICE
        // -------------------------------

        const selectedService =
            getSelectedService();


        if (!selectedService) {

            lockAvailability(
                "Please choose a detailing service."
            );


            if (shouldScroll) {

                const serviceSection =
                    document.querySelector(
                        ".service-cards"
                    );


                scrollToField(
                    serviceSection
                );

            }


            return false;

        }


        // -------------------------------
        // ADDRESS
        // -------------------------------

        if (
            !addressInput ||
            !addressInput.value.trim()
        ) {

            lockAvailability(
                "Please enter your service address."
            );


            if (shouldScroll) {

                scrollToField(
                    addressInput
                );

            }


            return false;

        }


        // -------------------------------
        // LOCATION
        // -------------------------------

        if (
            !serviceStatus ||
            !serviceStatus.classList.contains(
                "eligible"
            )
        ) {

            lockAvailability(
                "Please select a valid address within our service area."
            );


            if (shouldScroll) {

                scrollToField(
                    addressInput
                );

            }


            return false;

        }


        // -------------------------------
        // EVERYTHING IS VALID
        // -------------------------------

        unlockAvailability();

        return true;

    }



    // ========================================
    // SCROLL TO MISSING FIELD
    // ========================================

    function scrollToField(
        element
    ) {

        if (!element) {
            return;
        }


        element.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });


        setTimeout(
            () => {

                element.focus?.();

                element.classList.add(
                    "field-error"
                );


                setTimeout(
                    () => {

                        element.classList.remove(
                            "field-error"
                        );

                    },
                    1800
                );

            },
            400
        );

    }



    // ========================================
    // AVAILABILITY BUTTON
    // ========================================

    if (availabilityButton) {

        availabilityButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const valid =
                    validateBooking(true);


                if (!valid) {
                    return;
                }


                const selectedService =
                    getSelectedService();


                const calendlyURL =
                    calendlyLinks[
                        selectedService
                    ];


                if (!calendlyURL) {

                    return;

                }


                window.open(
                    calendlyURL,
                    "_blank"
                );

            }
        );

    }



    // ========================================
    // UPDATE CALENDLY LINK
    // ========================================

    function updateAvailabilityLink() {

        if (!availabilityButton) {
            return;
        }


        const selectedService =
            getSelectedService();


        if (
            !selectedService
        ) {

            availabilityButton.href =
                "#";

            return;

        }


        const url =
            calendlyLinks[
                selectedService
            ];


        if (url) {

            availabilityButton.href =
                url;

        }

    }



    // ========================================
    // MAPBOX
    // ========================================

    let map = null;

    let marker = null;


    function startMap() {

        if (!mapElement) {
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

        }


        validateBooking();

    }



    // ========================================
    // UNLOCK AVAILABILITY
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


        updateAvailabilityLink();


        const message =
            availability.querySelector(
                ".availability-message"
            );


        if (message) {

            message.innerHTML = `

                <strong>
                    ✓ Everything looks good
                </strong>

                <p>
                    Your information is complete
                    and your address is within our
                    service area.
                </p>

            `;

        }

    }



    // ========================================
    // LOCK AVAILABILITY
    // ========================================

    function lockAvailability(
        messageText
    ) {

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

            message.innerHTML = `

                <strong>
                    ${messageText || "Complete the required information"}
                </strong>

                <p>
                    Complete the required information
                    above before checking availability.
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


        lockAvailability(
            "Please select your service address."
        );

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



    // ========================================
    // INITIAL STATE
    // ========================================

    updatePrices();

    validateBooking();

}
