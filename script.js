// ============================================
// BRIGHTSIDE DETAILING
// MAIN JAVASCRIPT
// ============================================


// ============================================
// MOBILE NAVIGATION
// ============================================

const menuButton = document.getElementById("menuButton");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}


// ============================================
// BOOKING PAGE ONLY
// Everything below this point only runs when
// the booking page elements exist.
// ============================================

const addressInput = document.getElementById("address");

if (addressInput) {

    // ========================================
    // MAPBOX SETTINGS
    // ========================================

    const MAPBOX_TOKEN = "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyYWV0In0.Usd3fiKRnMZq1oE6cYy1Jg";

    // Alief Community Center
    // 11903 Bellaire Blvd, Houston, TX 77072

    const SERVICE_LAT = 29.70254;
    const SERVICE_LNG = -95.58891;

    const SERVICE_RADIUS = 30;


    // ========================================
    // BOOKING ELEMENTS
    // ========================================

    const addressSuggestions =
        document.getElementById("address-suggestions");

    const serviceStatus =
        document.getElementById("service-status");

    const mapElement =
        document.getElementById("map");

    const availabilityContainer =
        document.getElementById("availability-container");

    const availabilityButton =
        document.getElementById("availability-button");

    const vehicleSize =
        document.getElementById("vehicle-size");

    const vehiclePrice =
        document.getElementById("vehicle-price");

    const servicePrices =
        document.querySelectorAll(".service-price");


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


    function updatePrices() {

        if (!vehicleSize || !vehiclePrice) {
            return;
        }

        const vehicle = vehicleSize.value;

        if (!vehicle) {

            vehiclePrice.textContent =
                "Choose your vehicle type to see your price.";

            servicePrices.forEach(price => {
                price.textContent = "Select Vehicle";
            });

            return;
        }

        const selectedPrices = prices[vehicle];


        vehiclePrice.innerHTML = `
            <strong>Estimated pricing:</strong>
            Express $${selectedPrices.express}
            • Interior $${selectedPrices.interior}
            • Full Detail $${selectedPrices.full}
        `;


        servicePrices.forEach(priceElement => {

            const card =
                priceElement.closest(".service-card");

            if (!card) return;

            const service =
                card.querySelector(
                    "input[name='service']"
                );

            if (!service) return;


            if (service.value === "express") {

                priceElement.textContent =
                    `$${selectedPrices.express}`;

            }

            if (service.value === "interior") {

                priceElement.textContent =
                    `$${selectedPrices.interior}`;

            }

            if (service.value === "full-detail") {

                priceElement.textContent =
                    `$${selectedPrices.full}`;

            }

        });

    }


    if (vehicleSize) {

        vehicleSize.addEventListener(
            "change",
            updatePrices
        );

    }


    // ========================================
    // DISTANCE CALCULATOR
    // ========================================

    function calculateDistance(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const earthRadius = 3958.8;

        const latDifference =
            (lat2 - lat1) * Math.PI / 180;

        const lonDifference =
            (lon2 - lon1) * Math.PI / 180;


        const a =
            Math.sin(latDifference / 2) ** 2 +

            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *

            Math.sin(lonDifference / 2) ** 2;


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return earthRadius * c;

    }


    // ========================================
    // MAP VARIABLES
    // ========================================

    let map = null;
    let marker = null;


    // ========================================
    // INITIALIZE MAP
    // ========================================

    function initializeMap() {

        if (!mapElement) {
            return;
        }

        if (
            !MAPBOX_TOKEN ||
            MAPBOX_TOKEN === "PASTE_YOUR_PK_TOKEN_HERE"
        ) {

            console.error(
                "Mapbox token has not been added."
            );

            return;
        }


        if (typeof mapboxgl === "undefined") {

            console.error(
                "Mapbox GL JS has not loaded."
            );

            return;
        }


        mapboxgl.accessToken =
            MAPBOX_TOKEN;


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
            new mapboxgl.NavigationControl()
        );

    }


    // ========================================
    // START MAP AFTER PAGE LOAD
    // ========================================

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeMap
        );

    } else {

        initializeMap();

    }


    // ========================================
    // ADDRESS SEARCH
    // ========================================

    let searchTimer = null;


    addressInput.addEventListener(
        "input",
        function () {

            clearTimeout(searchTimer);

            resetLocationStatus();


            const query =
                addressInput.value.trim();


            if (query.length < 3) {

                hideSuggestions();

                return;

            }


            searchTimer = setTimeout(
                () => {

                    searchAddress(query);

                },
                350
            );

        }
    );


    // ========================================
    // SEARCH MAPBOX
    // ========================================

    async function searchAddress(query) {

        try {

            if (
                !MAPBOX_TOKEN ||
                MAPBOX_TOKEN === "PASTE_YOUR_PK_TOKEN_HERE"
            ) {

                console.error(
                    "Mapbox token is missing."
                );

                return;
            }


            const url =
                "https://api.mapbox.com/search/geocode/v6/forward" +
                "?q=" +
                encodeURIComponent(query) +
                "&country=US" +
                "&language=en" +
                "&limit=5" +
                "&access_token=" +
                MAPBOX_TOKEN;


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Mapbox returned ${response.status}`
                );

            }


            const data =
                await response.json();


            displayAddressSuggestions(
                data.features || []
            );


        } catch (error) {

            console.error(
                "Address search error:",
                error
            );

            hideSuggestions();

        }

    }


    // ========================================
    // DISPLAY SUGGESTIONS
    // ========================================

    function displayAddressSuggestions(features) {

        if (!addressSuggestions) {
            return;
        }


        addressSuggestions.innerHTML = "";


        if (features.length === 0) {

            hideSuggestions();

            return;

        }


        features.forEach(feature => {

            const button =
                document.createElement("button");


            button.type = "button";

            button.className =
                "address-suggestion";


            const properties =
                feature.properties || {};


            const name =
                properties.name ||
                feature.text ||
                "Address";


            const fullAddress =
                properties.full_address ||
                properties.place_formatted ||
                feature.place_name ||
                "";


            button.innerHTML = `
                <strong>
                    ${escapeHTML(name)}
                </strong>

                <span>
                    ${escapeHTML(fullAddress)}
                </span>
            `;


            button.addEventListener(
                "click",
                function () {

                    selectAddress(feature);

                }
            );


            addressSuggestions.appendChild(
                button
            );

        });


        addressSuggestions.style.display =
            "block";

    }


    // ========================================
    // SELECT ADDRESS
    // ========================================

    function selectAddress(feature) {

        if (
            !feature ||
            !feature.geometry ||
            !feature.geometry.coordinates
        ) {

            return;

        }


        const coordinates =
            feature.geometry.coordinates;


        const longitude =
            coordinates[0];

        const latitude =
            coordinates[1];


        const properties =
            feature.properties || {};


        const address =
            properties.full_address ||
            properties.place_formatted ||
            feature.place_name ||
            properties.name ||
            "";


        // Put address into input

        addressInput.value =
            address;


        // Hide suggestions

        hideSuggestions();


        // Calculate service area

        checkServiceArea(
            latitude,
            longitude
        );


        // Move map

        moveMap(
            latitude,
            longitude,
            address
        );

    }


    // ========================================
    // SERVICE AREA CHECK
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


        const roundedDistance =
            Math.round(
                distance * 10
            ) / 10;


        if (distance <= SERVICE_RADIUS) {

            serviceStatus.className =
                "service-status eligible";


            serviceStatus.innerHTML = `
                <strong>
                    ✓ You're within our service area
                </strong>

                <span>
                    Approximately ${roundedDistance}
                    miles from the Alief Community Center.
                </span>
            `;


            enableAvailability();

        } else {

            serviceStatus.className =
                "service-status not-eligible";


            serviceStatus.innerHTML = `
                <strong>
                    ✕ Outside our current service area
                </strong>

                <span>
                    This address is approximately
                    ${roundedDistance}
                    miles from the Alief Community Center.
                    Our current service radius is 30 miles.
                </span>
            `;


            disableAvailability();

        }

    }


    // ========================================
    // ENABLE CALENDLY
    // ========================================

    function enableAvailability() {

        if (
            !availabilityContainer ||
            !availabilityButton
        ) {

            return;

        }


        availabilityContainer.className =
            "availability-unlocked";


        availabilityButton.classList.remove(
            "disabled-button"
        );


        availabilityButton.setAttribute(
            "aria-disabled",
            "false"
        );


        availabilityButton.style.pointerEvents =
            "auto";


        const message =
            availabilityContainer.querySelector(
                ".availability-message"
            );


        if (message) {

            message.innerHTML = `
                <strong>
                    ✓ Location confirmed
                </strong>

                <p>
                    You're within our service area.
                    You can now check our available
                    appointments.
                </p>
            `;

        }

    }


    // ========================================
    // DISABLE CALENDLY
    // ========================================

    function disableAvailability() {

        if (
            !availabilityContainer ||
            !availabilityButton
        ) {

            return;

        }


        availabilityContainer.className =
            "availability-locked";


        availabilityButton.classList.add(
            "disabled-button"
        );


        availabilityButton.setAttribute(
            "aria-disabled",
            "true"
        );


        availabilityButton.style.pointerEvents =
            "none";


        const message =
            availabilityContainer.querySelector(
                ".availability-message"
            );


        if (message) {

            message.innerHTML = `
                <strong>
                    Check Availability
                </strong>

                <p>
                    Confirm that your address is
                    within our service area to continue.
                </p>
            `;

        }

    }


    // ========================================
    // RESET LOCATION
    // ========================================

    function resetLocationStatus() {

        if (serviceStatus) {

            serviceStatus.className =
                "service-status";

            serviceStatus.innerHTML =
                "";

        }


        disableAvailability();

    }


    // ========================================
    // MOVE MAP
    // ========================================

    function moveMap(
        latitude,
        longitude,
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
                    }).setText(address)

                )
                .addTo(map);


        marker.togglePopup();

    }


    // ========================================
    // HIDE SUGGESTIONS
    // ========================================

    function hideSuggestions() {

        if (!addressSuggestions) {
            return;
        }


        addressSuggestions.innerHTML =
            "";

        addressSuggestions.style.display =
            "none";

    }


    // ========================================
    // ESCAPE HTML
    // ========================================

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ========================================
    // CLICK OUTSIDE ADDRESS BOX
    // ========================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                !addressInput ||
                !addressSuggestions
            ) {

                return;

            }


            if (
                !addressInput.contains(event.target) &&
                !addressSuggestions.contains(event.target)
            ) {

                hideSuggestions();

            }

        }
    );

}
