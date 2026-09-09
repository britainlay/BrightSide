document.addEventListener("DOMContentLoaded", () => {

    const bookingPage = document.getElementById("booking-page");

    if (!bookingPage) {
        return;
    }


    /* =====================================================
       MAPBOX SETTINGS
    ===================================================== */

    const MAPBOX_TOKEN = "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyYWV0In0.Usd3fiKRnMZq1oE6cYy1Jg";

    const SERVICE_LAT = 29.70254;
    const SERVICE_LNG = -95.58891;
    const SERVICE_RADIUS = 30;


    /* =====================================================
       CAL.COM LINKS
    ===================================================== */

    const CAL_LINKS = {
        express: "https://cal.com/brightsidehouston/exteriordetail",
        interior: "https://cal.com/brightsidehouston/interiordetail",
        "full-detail": "https://cal.com/brightsidehouston/fulldetail"
    };


    /* =====================================================
       PRICING
    ===================================================== */

    const prices = {
        sedan: {
            express: 75,
            interior: 100,
            "full-detail": 150
        },

        suv: {
            express: 95,
            interior: 120,
            "full-detail": 180
        },

        truck: {
            express: 110,
            interior: 140,
            "full-detail": 200
        }
    };


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const form = document.getElementById("booking-form");

    const vehicleSize = document.getElementById("vehicle-size");
    const vehiclePrice = document.getElementById("vehicle-price");
    const startingPrice = document.getElementById("starting-price");

    const serviceAreaStatus =
        document.getElementById("service-area-status");

    const distanceFromAlief =
        document.getElementById("distance-from-alief");

    const serviceStatus =
        document.getElementById("service-status");

    const addressInput =
        document.getElementById("address");

    const addressSuggestions =
        document.getElementById("address-suggestions");

    const availabilityContainer =
        document.getElementById("availability-container");

    const availabilityButton =
        document.getElementById("availability-button");

    const formStatus =
        document.getElementById("form-status");


    /* =====================================================
       MAP VARIABLES
    ===================================================== */

    let map = null;
    let marker = null;
    let mapInitialized = false;

    let searchSessionToken = createSessionToken();
    let debounceTimer = null;


    /* =====================================================
       SESSION TOKEN
    ===================================================== */

    function createSessionToken() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {
            return window.crypto.randomUUID();
        }

        return (
            Date.now().toString(36) +
            Math.random().toString(36).substring(2)
        );
    }


    /* =====================================================
       MAPBOX INITIALIZATION
    ===================================================== */

    function initializeMap() {

        if (mapInitialized) {
            return;
        }

        if (typeof mapboxgl === "undefined") {

            setTimeout(
                initializeMap,
                300
            );

            return;
        }

        if (
            !MAPBOX_TOKEN ||
            !MAPBOX_TOKEN.startsWith("pk.")
        ) {

            console.error(
                "Mapbox public token is missing or invalid."
            );

            serviceStatus.textContent =
                "Mapbox is not configured yet.";

            serviceStatus.className =
                "service-status not-eligible";

            return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;

        map = new mapboxgl.Map({

            container: "map",

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

        map.on("load", () => {

            mapInitialized = true;

            map.resize();

        });

        map.on("error", (event) => {

            console.error(
                "Mapbox map error:",
                event
            );

        });

    }


    initializeMap();


    /* =====================================================
       SERVICE SELECTION
    ===================================================== */

    function getSelectedService() {

        const selected =
            document.querySelector(
                'input[name="service"]:checked'
            );

        return selected
            ? selected.value
            : null;
    }


    /* =====================================================
       UPDATE PRICES
    ===================================================== */

    function updatePrices() {

        const size = vehicleSize.value;
        const service = getSelectedService();


        document
            .querySelectorAll(".service-card")
            .forEach(card => {

                card.classList.remove(
                    "selected-service"
                );

            });


        const selectedRadio =
            document.querySelector(
                'input[name="service"]:checked'
            );


        if (selectedRadio) {

            const selectedCard =
                selectedRadio.closest(
                    ".service-card"
                );

            if (selectedCard) {

                selectedCard.classList.add(
                    "selected-service"
                );

            }

        }


        document
            .querySelectorAll(".service-card")
            .forEach(card => {

                const radio =
                    card.querySelector(
                        'input[name="service"]'
                    );

                const priceElement =
                    card.querySelector(
                        ".service-price"
                    );


                if (!radio || !priceElement) {
                    return;
                }


                if (
                    !size ||
                    !prices[size] ||
                    prices[size][radio.value] === undefined
                ) {

                    priceElement.textContent =
                        "Select Vehicle";

                    return;
                }


                priceElement.textContent =
                    `$${prices[size][radio.value]}`;

            });


        if (
            size &&
            service &&
            prices[size] &&
            prices[size][service] !== undefined
        ) {

            const price =
                prices[size][service];

            vehiclePrice.textContent =
                `Starting price: $${price}`;

            startingPrice.value =
                price;

        } else {

            vehiclePrice.textContent =
                "Choose your vehicle size";

            startingPrice.value =
                "";

        }

    }


    vehicleSize.addEventListener(
        "change",
        updatePrices
    );


    document
        .querySelectorAll(
            'input[name="service"]'
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                updatePrices
            );

        });


    /* =====================================================
       SERVICE FROM URL
       Example:
       booking/?service=full-detail
    ===================================================== */

    function selectServiceFromURL() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const service =
            params.get("service");


        if (
            !service ||
            !CAL_LINKS[service]
        ) {
            return;
        }


        const input =
            document.querySelector(
                `input[name="service"][value="${service}"]`
            );


        if (input) {

            input.checked = true;

        }

    }


    selectServiceFromURL();
    updatePrices();


    /* =====================================================
       ADDRESS INPUT
    ===================================================== */

    addressInput.addEventListener(
        "input",
        () => {

            clearTimeout(
                debounceTimer
            );

            resetLocation();


            const query =
                addressInput.value.trim();


            if (query.length < 3) {

                addressSuggestions.innerHTML =
                    "";

                return;
            }


            debounceTimer =
                setTimeout(() => {

                    getSuggestions(query);

                }, 350);

        }
    );


    /* =====================================================
       MAPBOX ADDRESS SUGGESTIONS
    ===================================================== */

    async function getSuggestions(query) {

        if (
            !MAPBOX_TOKEN ||
            !MAPBOX_TOKEN.startsWith("pk.")
        ) {
            return;
        }


        try {

            const url =
                new URL(
                    "https://api.mapbox.com/search/searchbox/v1/suggest"
                );


            url.searchParams.set(
                "q",
                query
            );

            url.searchParams.set(
                "country",
                "US"
            );

            url.searchParams.set(
                "language",
                "en"
            );

            url.searchParams.set(
                "limit",
                "6"
            );

            url.searchParams.set(
                "session_token",
                searchSessionToken
            );

            url.searchParams.set(
                "proximity",
                `${SERVICE_LNG},${SERVICE_LAT}`
            );

            url.searchParams.set(
                "access_token",
                MAPBOX_TOKEN
            );


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Mapbox suggest request failed: ${response.status}`
                );

            }


            const data =
                await response.json();


            showSuggestions(
                data.suggestions || []
            );


        } catch (error) {

            console.error(
                "Mapbox suggestions error:",
                error
            );

            addressSuggestions.innerHTML =
                "";

        }

    }


    /* =====================================================
       DISPLAY SUGGESTIONS
    ===================================================== */

    function showSuggestions(
        suggestions
    ) {

        addressSuggestions.innerHTML =
            "";


        if (!suggestions.length) {
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
                    suggestion.name || "";

                const details =
                    suggestion.full_address ||
                    suggestion.place_formatted ||
                    "";


                button.innerHTML = `
                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    <span>
                        ${escapeHTML(details)}
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


                addressSuggestions.appendChild(
                    button
                );

            }
        );

    }


    /* =====================================================
       RETRIEVE SELECTED ADDRESS
    ===================================================== */

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
                new URL(
                    `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
                        suggestion.mapbox_id
                    )}`
                );


            url.searchParams.set(
                "session_token",
                searchSessionToken
            );

            url.searchParams.set(
                "access_token",
                MAPBOX_TOKEN
            );


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Mapbox retrieve request failed: ${response.status}`
                );

            }


            const data =
                await response.json();


            const feature =
                data.features &&
                data.features[0];


            if (
                !feature ||
                !feature.geometry ||
                !feature.geometry.coordinates
            ) {

                throw new Error(
                    "Mapbox did not return coordinates."
                );

            }


            const coordinates =
                feature.geometry.coordinates;


            const longitude =
                Number(coordinates[0]);

            const latitude =
                Number(coordinates[1]);


            const properties =
                feature.properties || {};


            const fullAddress =
                properties.full_address ||
                [
                    properties.address,
                    properties.place_formatted
                ]
                    .filter(Boolean)
                    .join(", ");


            addressInput.value =
                fullAddress ||
                suggestion.full_address ||
                suggestion.name;


            addressSuggestions.innerHTML =
                "";


            updateMap(
                longitude,
                latitude,
                fullAddress
            );


            checkServiceArea(
                latitude,
                longitude
            );


            searchSessionToken =
                createSessionToken();


        } catch (error) {

            console.error(
                "Address retrieval error:",
                error
            );


            serviceStatus.textContent =
                "We couldn't verify that address. Please select an address from the suggestions.";

            serviceStatus.className =
                "service-status not-eligible";


            serviceAreaStatus.value =
                "";

            distanceFromAlief.value =
                "";


            lockAvailability();

        }

    }


    /* =====================================================
       UPDATE MAP
    ===================================================== */

    function updateMap(
        longitude,
        latitude,
        address
    ) {

        if (!map) {

            console.warn(
                "Map is not ready yet."
            );

            return;
        }


        map.resize();


        map.flyTo({

            center: [
                longitude,
                latitude
            ],

            zoom: 13,

            speed: 1.1,

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
                        address ||
                        "Selected service address"
                    )
                )
                .addTo(map);


        marker.togglePopup();

    }


    /* =====================================================
       DISTANCE CALCULATION
    ===================================================== */

    function calculateDistanceMiles(
        lat1,
        lng1,
        lat2,
        lng2
    ) {

        const earthRadius =
            3958.8;


        const dLat =
            toRadians(
                lat2 - lat1
            );

        const dLng =
            toRadians(
                lng2 - lng1
            );


        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(
                toRadians(lat1)
            ) *
            Math.cos(
                toRadians(lat2)
            ) *
            Math.sin(dLng / 2) ** 2;


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return earthRadius * c;

    }


    function toRadians(
        degrees
    ) {

        return degrees *
            (Math.PI / 180);

    }


    /* =====================================================
       SERVICE AREA CHECK
    ===================================================== */

    function checkServiceArea(
        latitude,
        longitude
    ) {

        const distance =
            calculateDistanceMiles(
                SERVICE_LAT,
                SERVICE_LNG,
                latitude,
                longitude
            );


        distanceFromAlief.value =
            `${distance.toFixed(1)} miles`;


        if (
            distance <= SERVICE_RADIUS
        ) {

            serviceStatus.textContent =
                `You're within our service area — approximately ${distance.toFixed(1)} miles away.`;

            serviceStatus.className =
                "service-status eligible";


            serviceAreaStatus.value =
                "Eligible";


            unlockAvailability();

        } else {

            serviceStatus.textContent =
                `This address is approximately ${distance.toFixed(1)} miles away and is outside our 30-mile service area.`;

            serviceStatus.className =
                "service-status not-eligible";


            serviceAreaStatus.value =
                "Outside service area";


            lockAvailability();

        }

    }


    /* =====================================================
       UNLOCK BUTTON
    ===================================================== */

    function unlockAvailability() {

        availabilityContainer.classList.remove(
            "availability-locked"
        );

        availabilityContainer.classList.add(
            "availability-unlocked"
        );


        availabilityButton.disabled =
            false;


        availabilityButton.classList.remove(
            "disabled-button"
        );


        availabilityButton.removeAttribute(
            "aria-disabled"
        );


        const message =
            availabilityContainer.querySelector(
                ".availability-message"
            );


        if (message) {

            message.innerHTML = `
                <strong>
                    Location Confirmed
                </strong>

                <p>
                    Your address is within our service area.
                    Continue to choose your appointment.
                </p>
            `;

        }

    }


    /* =====================================================
       LOCK BUTTON
    ===================================================== */

    function lockAvailability() {

        availabilityContainer.classList.add(
            "availability-locked"
        );

        availabilityContainer.classList.remove(
            "availability-unlocked"
        );


        availabilityButton.disabled =
            true;


        availabilityButton.classList.add(
            "disabled-button"
        );


        availabilityButton.setAttribute(
            "aria-disabled",
            "true"
        );

    }


    /* =====================================================
       RESET LOCATION
    ===================================================== */

    function resetLocation() {

        serviceStatus.textContent =
            "";

        serviceStatus.className =
            "service-status";


        serviceAreaStatus.value =
            "";

        distanceFromAlief.value =
            "";


        lockAvailability();

    }


    /* =====================================================
       FORM VALIDATION
    ===================================================== */

    function validateBookingForm() {

        if (!form.checkValidity()) {

            form.reportValidity();

            return false;

        }


        const service =
            getSelectedService();


        if (!service) {

            showFormStatus(
                "Please select a service."
            );

            return false;

        }


        if (
            serviceAreaStatus.value !==
            "Eligible"
        ) {

            showFormStatus(
                "Please select your exact address from the Mapbox suggestions and confirm that it is within our service area."
            );

            return false;

        }


        if (!CAL_LINKS[service]) {

            showFormStatus(
                "The selected service is not configured correctly."
            );

            return false;

        }


        return true;

    }


    /* =====================================================
       CONTINUE TO APPOINTMENT
    ===================================================== */

    availabilityButton.addEventListener(
        "click",
        () => {

            if (!validateBookingForm()) {
                return;
            }


            const service =
                getSelectedService();


            const calUrl =
                CAL_LINKS[service];


            /*
             * Save the information locally.
             * This does not send the information anywhere.
             */

            const bookingData = {

                name:
                    document
                        .getElementById("customer-name")
                        .value
                        .trim(),

                email:
                    document
                        .getElementById("customer-email")
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById("customer-phone")
                        .value
                        .trim(),

                make:
                    document
                        .getElementById("vehicle-make")
                        .value
                        .trim(),

                model:
                    document
                        .getElementById("vehicle-model")
                        .value
                        .trim(),

                year:
                    document
                        .getElementById("vehicle-year")
                        .value
                        .trim(),

                vehicleSize:
                    vehicleSize.value,

                service:
                    service,

                address:
                    addressInput.value.trim(),

                price:
                    startingPrice.value,

                condition:
                    document
                        .getElementById("condition")
                        .value
                        .trim(),

                distance:
                    distanceFromAlief.value

            };


            try {

                localStorage.setItem(
                    "brightsideBooking",
                    JSON.stringify(
                        bookingData
                    )
                );

            } catch (error) {

                console.warn(
                    "Could not save booking information:",
                    error
                );

            }


            /*
             * Send the customer directly to the
             * correct Cal.com booking page.
             */

            window.location.href =
                calUrl;

        }
    );


    /* =====================================================
       FORM STATUS
    ===================================================== */

    function showFormStatus(
        message
    ) {

        if (!formStatus) {
            return;
        }


        formStatus.textContent =
            message;

        formStatus.className =
            "form-status";

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

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


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    lockAvailability();
    updatePrices();

});
