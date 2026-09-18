javascript
/* =============================================================
   BRIGHTSIDE HOUSTON DETAILING
   BOOKING PAGE
   -------------------------------------------------------------
   Responsibilities:
   1. Mapbox address search
   2. Mapbox address selection
   3. Calculate distance from Alief Neighborhood Center
   4. Enforce a 20-mile service radius
   5. Show the selected location on the map
   6. Unlock Cal.com when the address is eligible
   7. Keep all actual booking information inside Cal.com
   ============================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       PAGE CHECK
       ========================================================= */

    const bookingPage = document.querySelector(".booking-page");

    if (!bookingPage) {
        return;
    }


    /* =========================================================
       MAPBOX CONFIGURATION
       ========================================================= */


    const MAPBOX_TOKEN = "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5a3FuMDUwNHVlMndweWFzNXAwMG5rIn0.HYTbUgwvgO3_fn7f0mHCDg";


    /*
       Alief Neighborhood Center

       11903 Bellaire Blvd
       Houston, TX 77072

       These coordinates are used as the center point
       for the 20-mile service area.
    */

    const SERVICE_CENTER = {
        latitude: 29.70254,
        longitude: -95.58891
    };



    const SERVICE_RADIUS_MILES = 20;


    /* =========================================================
       CAL.COM CONFIGURATION
       ========================================================= */

    /*
       This should be the Cal.com booking page/profile that
       lets customers choose between your available services.

       Your individual event types are currently:

       Full Detail:
       https://cal.com/brightsidehouston/fulldetail

       Exterior Detail:
       https://cal.com/brightsidehouston/exteriordetail

       Interior Detail:
       https://cal.com/brightsidehouston/interiordetail

       IMPORTANT:
       Replace CAL_BOOKING_LINK below with the Cal.com page
       you want customers to use for choosing their service.

       If you later create one combined Cal.com event/page,
       put that link here.
    */

    const CAL_BOOKING_LINK =
        "brightsidehouston";


    /* =========================================================
       ELEMENT REFERENCES
       ========================================================= */

    const addressInput =
        document.getElementById("address");

    const suggestionsContainer =
        document.getElementById("address-suggestions");

    const serviceStatus =
        document.getElementById("service-status");

    const mapContainer =
        document.getElementById("map");

    const serviceAreaStatus =
        document.getElementById("service-area-status");

    const distanceInformation =
        document.getElementById("distance-information");

    const distanceDisplay =
        document.getElementById("distance-from-alief");

    const calBookingSection =
        document.getElementById("cal-booking-section");

    const calBooking =
        document.getElementById("cal-booking");


    /* =========================================================
       STATE
       ========================================================= */

    let map = null;
    let marker = null;

    let selectedCoordinates = null;
    let selectedAddress = "";

    let searchTimeout = null;
    let sessionToken = null;


    /* =========================================================
       BASIC VALIDATION
       ========================================================= */

    if (!addressInput) {
        console.error(
            "BrightSide Booking: Address input was not found."
        );

        return;
    }


    if (!mapContainer) {
        console.error(
            "BrightSide Booking: Map container was not found."
        );

        return;
    }


    /* =========================================================
       MAPBOX LOAD CHECK
       ========================================================= */

    function waitForMapbox(callback) {

        if (
            typeof mapboxgl !== "undefined"
        ) {
            callback();
            return;
        }

        setTimeout(() => {
            waitForMapbox(callback);
        }, 100);

    }


    /* =========================================================
       MAP INITIALIZATION
       ========================================================= */

    function initializeMap() {

        if (
            typeof mapboxgl === "undefined"
        ) {
            console.error(
                "BrightSide Booking: Mapbox GL JS did not load."
            );

            return;
        }


        if (
            !MAPBOX_TOKEN ||
            MAPBOX_TOKEN === "YOUR_EXISTING_MAPBOX_PUBLIC_TOKEN"
        ) {
            console.error(
                "BrightSide Booking: Add your Mapbox public token to booking.js."
            );

            return;
        }


        mapboxgl.accessToken = MAPBOX_TOKEN;


        map = new mapboxgl.Map({
            container: mapContainer,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [
                SERVICE_CENTER.longitude,
                SERVICE_CENTER.latitude
            ],
            zoom: 9
        });


        map.addControl(
            new mapboxgl.NavigationControl(),
            "top-right"
        );


        /*
           Add a marker showing the service-area center.
        */

        new mapboxgl.Marker()
            .setLngLat([
                SERVICE_CENTER.longitude,
                SERVICE_CENTER.latitude
            ])
            .addTo(map);


        /*
           Draw an approximate 20-mile circle around
           the Alief Neighborhood Center.
        */

        map.on("load", () => {

            drawServiceRadius();

        });

    }


    /* =========================================================
       SERVICE RADIUS
       ========================================================= */

    function drawServiceRadius() {

        if (!map) {
            return;
        }


        const radiusInMiles =
            SERVICE_RADIUS_MILES;

        const points = 96;

        const earthRadiusMiles = 3958.8;

        const latitude =
            SERVICE_CENTER.latitude *
            Math.PI /
            180;

        const longitude =
            SERVICE_CENTER.longitude *
            Math.PI /
            180;

        const angularDistance =
            radiusInMiles /
            earthRadiusMiles;


        const coordinates = [];


        for (
            let i = 0;
            i <= points;
            i++
        ) {

            const bearing =
                2 *
                Math.PI *
                i /
                points;


            const lat2 =
                Math.asin(
                    Math.sin(latitude) *
                    Math.cos(angularDistance) +
                    Math.cos(latitude) *
                    Math.sin(angularDistance) *
                    Math.cos(bearing)
                );


            const lon2 =
                longitude +
                Math.atan2(
                    Math.sin(bearing) *
                    Math.sin(angularDistance) *
                    Math.cos(latitude),
                    Math.cos(angularDistance) -
                    Math.sin(latitude) *
                    Math.sin(lat2)
                );


            coordinates.push([
                lon2 * 180 / Math.PI,
                lat2 * 180 / Math.PI
            ]);

        }


        const geojson = {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [
                    coordinates
                ]
            }
        };


        if (map.getSource("service-radius")) {

            map.getSource(
                "service-radius"
            ).setData(geojson);

            return;
        }


        map.addSource(
            "service-radius",
            {
                type: "geojson",
                data: geojson
            }
        );


        map.addLayer({
            id: "service-radius-fill",
            type: "fill",
            source: "service-radius",
            paint: {
                "fill-opacity": 0.08
            }
        });


        map.addLayer({
            id: "service-radius-line",
            type: "line",
            source: "service-radius",
            paint: {
                "line-width": 2,
                "line-opacity": 0.5
            }
        });

    }


    /* =========================================================
       CREATE MAPBOX SESSION
       ========================================================= */

    function createSessionToken() {

        if (
            typeof crypto !== "undefined" &&
            crypto.randomUUID
        ) {
            return crypto.randomUUID();
        }


        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2)
        );

    }


    /* =========================================================
       ADDRESS SUGGESTIONS
       ========================================================= */

    async function getAddressSuggestions(query) {

        if (
            !query ||
            query.trim().length < 3
        ) {
            clearSuggestions();
            return;
        }


        if (!sessionToken) {
            sessionToken =
                createSessionToken();
        }


        const url =
            "https://api.mapbox.com/search/searchbox/v1/suggest" +
            "?q=" +
            encodeURIComponent(query) +
            "&language=en" +
            "&country=US" +
            "&limit=6" +
            "&session_token=" +
            encodeURIComponent(sessionToken) +
            "&access_token=" +
            encodeURIComponent(MAPBOX_TOKEN);


        try {

            const response =
                await fetch(url);


            if (!response.ok) {
                throw new Error(
                    "Mapbox suggestion request failed."
                );
            }


            const data =
                await response.json();


            displaySuggestions(
                data.suggestions || []
            );

        } catch (error) {

            console.error(
                "BrightSide Booking: Address search error:",
                error
            );

            clearSuggestions();

        }

    }


    /* =========================================================
       DISPLAY SUGGESTIONS
       ========================================================= */

    function displaySuggestions(suggestions) {

        if (!suggestionsContainer) {
            return;
        }


        suggestionsContainer.innerHTML = "";


        if (!suggestions.length) {
            suggestionsContainer.classList.remove(
                "visible"
            );

            return;
        }


        suggestions.forEach(
            (suggestion) => {

                const button =
                    document.createElement("button");


                button.type = "button";

                button.className =
                    "address-suggestion";


                const primaryText =
                    suggestion.name ||
                    suggestion.place_formatted ||
                    "Address";


                const secondaryText =
                    suggestion.place_formatted ||
                    "";


                button.innerHTML = `
                    <span class="suggestion-main">
                        ${escapeHTML(primaryText)}
                    </span>

                    ${
                        secondaryText
                            ? `
                                <span class="suggestion-secondary">
                                    ${escapeHTML(
                                        secondaryText
                                    )}
                                </span>
                            `
                            : ""
                    }
                `;


                button.addEventListener(
                    "click",
                    () => {

                        selectAddress(
                            suggestion
                        );

                    }
                );


                suggestionsContainer.appendChild(
                    button
                );

            }
        );


        suggestionsContainer.classList.add(
            "visible"
        );

    }


    /* =========================================================
       ADDRESS SELECTION
       ========================================================= */

    async function selectAddress(suggestion) {

        clearSuggestions();


        addressInput.value =
            suggestion.full_address ||
            suggestion.place_formatted ||
            suggestion.name ||
            "";


        selectedAddress =
            addressInput.value;


        const mapboxId =
            suggestion.mapbox_id;


        if (!mapboxId) {

            setStatus(
                "error",
                "We couldn't verify that address.",
                "Please try selecting one of the suggested addresses."
            );

            return;
        }


        if (!sessionToken) {
            sessionToken =
                createSessionToken();
        }


        const url =
            "https://api.mapbox.com/search/searchbox/v1/retrieve/" +
            encodeURIComponent(mapboxId) +
            "?session_token=" +
            encodeURIComponent(sessionToken) +
            "&access_token=" +
            encodeURIComponent(MAPBOX_TOKEN);


        try {

            const response =
                await fetch(url);


            if (!response.ok) {
                throw new Error(
                    "Mapbox retrieve request failed."
                );
            }


            const data =
                await response.json();


            const feature =
                data.features &&
                data.features[0];


            if (!feature) {

                setStatus(
                    "error",
                    "We couldn't verify that address.",
                    "Please select another suggested address."
                );

                return;
            }


            const coordinates =
                feature.geometry.coordinates;


            selectedCoordinates = {
                longitude: coordinates[0],
                latitude: coordinates[1]
            };


            /*
               Calculate distance from the
               Alief Neighborhood Center.
            */

            const distance =
                calculateDistanceMiles(
                    SERVICE_CENTER.latitude,
                    SERVICE_CENTER.longitude,
                    selectedCoordinates.latitude,
                    selectedCoordinates.longitude
                );


            showSelectedLocation(
                selectedCoordinates,
                distance
            );


            evaluateServiceArea(
                distance
            );


            sessionToken = null;

        } catch (error) {

            console.error(
                "BrightSide Booking: Address retrieval error:",
                error
            );


            setStatus(
                "error",
                "We couldn't verify that address.",
                "Please try selecting the address again."
            );

        }

    }


    /* =========================================================
       SERVICE AREA EVALUATION
       ========================================================= */

    function evaluateServiceArea(distance) {

        const isEligible =
            distance <=
            SERVICE_RADIUS_MILES;


        if (isEligible) {

            serviceAreaStatus.value =
                "eligible";


            setStatus(
                "eligible",
                "You're within our service area.",
                `Your address is approximately ${distance.toFixed(
                    1
                )} miles from our service-area center.`
            );


            if (distanceInformation) {
                distanceInformation.hidden = false;
            }


            if (distanceDisplay) {
                distanceDisplay.textContent =
                    `${distance.toFixed(1)} miles`;
            }


            unlockCalBooking();

        } else {

            serviceAreaStatus.value =
                "outside";


            setStatus(
                "outside",
                "This address is outside our service area.",
                `Your address is approximately ${distance.toFixed(
                    1
                )} miles away. BrightSide currently serves locations within approximately 20 miles.`
            );


            if (distanceInformation) {
                distanceInformation.hidden = false;
            }


            if (distanceDisplay) {
                distanceDisplay.textContent =
                    `${distance.toFixed(1)} miles`;
            }


            lockCalBooking();

        }

    }


    /* =========================================================
       UNLOCK CAL.COM
       ========================================================= */

    function unlockCalBooking() {

        if (!calBookingSection) {
            return;
        }


        calBookingSection.hidden = false;


        /*
           Only initialize Cal.com once.
        */

        if (
            calBooking.dataset.loaded === "true"
        ) {
            calBookingSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            return;
        }


        initializeCalBooking();


        /*
           Scroll the customer down to the booking
           section after eligibility is confirmed.
        */

        setTimeout(() => {

            calBookingSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 250);

    }


    /* =========================================================
       LOCK CAL.COM
       ========================================================= */

    function lockCalBooking() {

        if (!calBookingSection) {
            return;
        }


        calBookingSection.hidden = true;


        if (calBooking) {
            calBooking.innerHTML = "";
            calBooking.dataset.loaded = "false";
        }

    }


    /* =========================================================
       INITIALIZE CAL.COM
       ========================================================= */

    function initializeCalBooking() {

        if (!calBooking) {
            return;
        }


        /*
           Prevent duplicate initialization.
        */

        if (
            calBooking.dataset.loaded === "true"
        ) {
            return;
        }


        if (
            typeof window.Cal === "undefined"
        ) {

            console.error(
                "BrightSide Booking: Cal.com has not loaded yet."
            );


            calBooking.innerHTML = `
                <div class="cal-error">
                    <strong>
                        Booking system is still loading.
                    </strong>

                    <p>
                        Please wait a moment and try again.
                    </p>
                </div>
            `;


            setTimeout(
                initializeCalBooking,
                1000
            );


            return;
        }


        /*
           Initialize the Cal.com booking page.

           CAL_BOOKING_LINK is intentionally kept as a
           separate constant so you can change the Cal.com
           page without touching the Mapbox code.
        */

        Cal("inline", {
            elementOrSelector:
                "#cal-booking",

            calLink:
                CAL_BOOKING_LINK,

            config: {
                layout: "month_view"
            }
        });


        calBooking.dataset.loaded =
            "true";

    }


    /* =========================================================
       SELECTED LOCATION ON MAP
       ========================================================= */

    function showSelectedLocation(
        coordinates,
        distance
    ) {

        if (!map) {
            return;
        }


        const lngLat = [
            coordinates.longitude,
            coordinates.latitude
        ];


        if (marker) {

            marker
                .setLngLat(lngLat);

        } else {

            marker =
                new mapboxgl.Marker()
                    .setLngLat(lngLat)
                    .addTo(map);

        }


        const zoomLevel =
            distance <= 20
                ? 10
                : 9;


        map.flyTo({
            center: lngLat,
            zoom: zoomLevel,
            duration: 900
        });

    }


    /* =========================================================
       STATUS DISPLAY
       ========================================================= */

    function setStatus(
        statusType,
        heading,
        message
    ) {

        if (!serviceStatus) {
            return;
        }


        serviceStatus.className =
            `service-status ${statusType}`;


        serviceStatus.innerHTML = `
            <div class="status-icon">
                ${
                    statusType === "eligible"
                        ? "✓"
                        : statusType === "outside"
                            ? "!"
                            : "?"
                }
            </div>

            <div class="status-content">

                <strong>
                    ${escapeHTML(heading)}
                </strong>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>
        `;

    }


    /* =========================================================
       ADDRESS INPUT
       ========================================================= */

    addressInput.addEventListener(
        "input",
        () => {

            /*
               Any new typing invalidates the previous
               address selection.
            */

            selectedCoordinates = null;
            selectedAddress = "";

            serviceAreaStatus.value =
                "unchecked";


            lockCalBooking();


            if (distanceInformation) {
                distanceInformation.hidden =
                    true;
            }


            setStatus(
                "unchecked",
                "Enter your address",
                "We'll check whether your location is within our 20-mile service area."
            );


            clearTimeout(
                searchTimeout
            );


            const query =
                addressInput.value.trim();


            searchTimeout =
                setTimeout(
                    () => {

                        getAddressSuggestions(
                            query
                        );

                    },
                    250
                );

        }
    );


    /* =========================================================
       CLOSE SUGGESTIONS WHEN CLICKING ELSEWHERE
       ========================================================= */

    document.addEventListener(
        "click",
        (event) => {

            if (
                !addressInput.contains(event.target) &&
                !suggestionsContainer?.contains(
                    event.target
                )
            ) {

                clearSuggestions();

            }

        }
    );


    /* =========================================================
       CLEAR SUGGESTIONS
       ========================================================= */

    function clearSuggestions() {

        if (!suggestionsContainer) {
            return;
        }


        suggestionsContainer.innerHTML = "";

        suggestionsContainer.classList.remove(
            "visible"
        );

    }


    /* =========================================================
       HAVERSINE DISTANCE
       ========================================================= */

    function calculateDistanceMiles(
        latitude1,
        longitude1,
        latitude2,
        longitude2
    ) {

        const earthRadiusMiles =
            3958.8;


        const latitudeDifference =
            toRadians(
                latitude2 - latitude1
            );


        const longitudeDifference =
            toRadians(
                longitude2 - longitude1
            );


        const a =
            Math.sin(
                latitudeDifference / 2
            ) ** 2 +

            Math.cos(
                toRadians(latitude1)
            ) *

            Math.cos(
                toRadians(latitude2)
            ) *

            Math.sin(
                longitudeDifference / 2
            ) ** 2;


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return (
            earthRadiusMiles * c
        );

    }


    /* =========================================================
       DEGREES TO RADIANS
       ========================================================= */

    function toRadians(degrees) {

        return (
            degrees *
            Math.PI /
            180
        );

    }


    /* =========================================================
       HTML ESCAPING
       ========================================================= */

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


    /* =========================================================
       START MAPBOX
       ========================================================= */

    waitForMapbox(
        initializeMap
    );

});
```
