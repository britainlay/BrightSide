/* ============================================
BRIGHTSIDE HOUSTON DETAILING
BOOKING + MAPBOX JAVASCRIPT
============================================ */

/* ============================================
MOBILE MENU
============================================ */

const menuButton = document.getElementById("menuButton");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {

```
menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("mobile-open");
});
```

}

/* ============================================
BOOKING PAGE
============================================ */

const bookingPage = document.getElementById("booking-page");

if (bookingPage) {

```
/* ============================================
   MAPBOX CONFIGURATION
============================================ */

const MAPBOX_TOKEN =
    "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5a3FuMDUwNHVlMndweWFzNXAwMG5rIn0.HYTbUgwvgO3_fn7f0mHCDg";


const SERVICE_LAT = 29.70254;
const SERVICE_LNG = -95.58891;

const SERVICE_RADIUS = 30;


/* ============================================
   ELEMENTS
============================================ */

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


/* ============================================
   PACKAGE FROM URL
   Example:
   booking/?service=express
============================================ */

function selectPackageFromURL() {

    const params =
        new URLSearchParams(window.location.search);

    const selectedService =
        params.get("service");

    if (!selectedService) return;


    const serviceRadio =
        document.querySelector(
            `input[name="service"][value="${selectedService}"]`
        );

    if (!serviceRadio) return;


    serviceRadio.checked = true;


    document
        .querySelectorAll(".service-card")
        .forEach(card => {
            card.classList.remove(
                "selected-service"
            );
        });


    const selectedCard =
        serviceRadio.closest(".service-card");


    if (selectedCard) {

        selectedCard.classList.add(
            "selected-service"
        );

    }

}


selectPackageFromURL();


/* ============================================
   VEHICLE PRICING
============================================ */

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


function updatePrices() {

    if (!vehicleSize) return;


    const vehicle =
        vehicleSize.value;


    const priceElements =
        document.querySelectorAll(
            ".service-price"
        );


    if (!vehicle) {

        if (vehiclePrice) {

            vehiclePrice.textContent =
                "Choose your vehicle type to see your price.";

        }


        priceElements.forEach(element => {

            element.textContent =
                "Select Vehicle";

        });

        return;
    }


    const selected =
        prices[vehicle];


    if (!selected) return;


    if (vehiclePrice) {

        vehiclePrice.innerHTML = `
            <strong>Estimated pricing:</strong>
            Express $${selected.express}
            • Interior $${selected.interior}
            • Full Detail $${selected["full-detail"]}
        `;

    }


    priceElements.forEach(element => {

        const card =
            element.closest(".service-card");

        if (!card) return;


        const radio =
            card.querySelector(
                "input[name='service']"
            );

        if (!radio) return;


        const price =
            selected[radio.value];


        if (price) {

            element.textContent =
                `$${price}`;

        }

    });

}


if (vehicleSize) {

    vehicleSize.addEventListener(
        "change",
        updatePrices
    );

}


/* ============================================
   SERVICE CARD SELECTION
============================================ */

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

        }
    );

});


/* ============================================
   MAPBOX
============================================ */

let map = null;
let marker = null;


function showMapError(message) {

    if (!mapElement) return;


    mapElement.innerHTML = `
        <div class="map-error">
            <strong>Mapbox couldn't load.</strong>
            <br>
            ${message}
        </div>
    `;

}


function startMap() {

    if (!mapElement) return;


    if (
        !MAPBOX_TOKEN ||
        MAPBOX_TOKEN === "YOUR_NEW_PUBLIC_MAPBOX_TOKEN"
    ) {

        console.error(
            "Mapbox token has not been added."
        );


        showMapError(
            "Add your new public Mapbox token to script.js."
        );

        return;

    }


    if (typeof mapboxgl === "undefined") {

        console.error(
            "Mapbox GL JS did not load."
        );


        showMapError(
            "Mapbox's JavaScript library did not load. Check your internet connection and refresh the page."
        );

        return;

    }


    mapboxgl.accessToken =
        MAPBOX_TOKEN;


    try {

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


        map.on(
            "load",
            () => {

                console.log(
                    "Mapbox loaded successfully."
                );

            }
        );


        map.on(
            "error",
            event => {

                console.error(
                    "Mapbox error:",
                    event
                );

            }
        );


    } catch (error) {

        console.error(
            "Map initialization error:",
            error
        );


        showMapError(
            "There was a problem initializing the map."
        );

    }

}


/* ============================================
   MAPBOX SEARCH SESSION
============================================ */

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


/* ============================================
   SEARCH TIMER
============================================ */

let searchTimer = null;


/* ============================================
   ADDRESS INPUT
============================================ */

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
                setTimeout(
                    () => {
                        getSuggestions(query);
                    },
                    300
                );

        }
    );

}


/* ============================================
   MAPBOX ADDRESS SUGGESTIONS
============================================ */

async function getSuggestions(query) {

    try {

        const url =
            "https://api.mapbox.com/search/searchbox/v1/suggest" +
            "?q=" +
            encodeURIComponent(query) +
            "&country=US" +
            "&language=en" +
            "&limit=6" +
            "&session_token=" +
            encodeURIComponent(sessionToken) +
            "&proximity=" +
            SERVICE_LNG +
            "," +
            SERVICE_LAT +
            "&access_token=" +
            encodeURIComponent(MAPBOX_TOKEN);


        console.log(
            "Searching Mapbox..."
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Mapbox search error:",
                response.status,
                errorText
            );


            throw new Error(
                `Mapbox search failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Mapbox suggestions:",
            data
        );


        showSuggestions(
            data.suggestions || []
        );


    } catch (error) {

        console.error(
            "Address search error:",
            error
        );


        hideSuggestions();

    }

}


/* ============================================
   SHOW SUGGESTIONS
============================================ */

function showSuggestions(
    suggestions
) {

    if (!suggestionsBox) return;


    suggestionsBox.innerHTML =
        "";


    if (!suggestions.length) {

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


/* ============================================
   RETRIEVE ADDRESS
============================================ */

async function retrieveAddress(
    suggestion
) {

    if (
        !suggestion ||
        !suggestion.mapbox_id
    ) {

        console.error(
            "Invalid Mapbox suggestion:",
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
                "Mapbox retrieve error:",
                response.status,
                errorText
            );


            throw new Error(
                `Mapbox retrieve failed: ${response.status}`
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


        sessionToken =
            createSessionToken();


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
                    Unable to verify this address
                </strong>

                <span>
                    Please select an address directly
                    from the suggestions.
                </span>
            `;

        }

    }

}


/* ============================================
   UPDATE MAP
============================================ */

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

}


/* ============================================
   DISTANCE CALCULATOR
============================================ */

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


/* ============================================
   CHECK SERVICE AREA
============================================ */

function checkServiceArea(
    latitude,
    longitude
) {

    if (!serviceStatus) return;


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


/* ============================================
   AVAILABILITY
============================================ */

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
                ✓ Location confirmed
            </strong>

            <p>
                Your address is within our
                service area. Continue to
                choose an available appointment.
            </p>
        `;

    }


    updateAvailabilityLink();

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
                Confirm that your address
                is within our service area
                to continue.
            </p>
        `;

    }

}


/* ============================================
   CALENDLY LINK
============================================ */

function updateAvailabilityLink() {

    if (!availabilityButton) return;


    const selectedService =
        document.querySelector(
            "input[name='service']:checked"
        );


    let service =
        selectedService
            ? selectedService.value
            : "";


    let calendlyURL =
        "https://calendly.com/brightsidemdetails/30min";


    if (service === "express") {

        calendlyURL =
            "https://calendly.com/brightsidemdetails/express-exterior";

    }


    if (service === "interior") {

        calendlyURL =
            "https://calendly.com/brightsidemdetails/full-interior";

    }


    if (service === "full-detail") {

        calendlyURL =
            "https://calendly.com/brightsidemdetails/30min";

    }


    const params =
        new URLSearchParams();


    const name =
        document.getElementById(
            "customer-name"
        )?.value.trim();


    const email =
        document.getElementById(
            "customer-email"
        )?.value.trim();


    const phone =
        document.getElementById(
            "customer-phone"
        )?.value.trim();


    const address =
        addressInput?.value.trim();


    if (name) {
        params.set(
            "name",
            name
        );
    }


    if (email) {
        params.set(
            "email",
            email
        );
    }


    if (phone) {
        params.set(
            "a1",
            phone
        );
    }


    if (address) {
        params.set(
            "a2",
            address
        );
    }


    availabilityButton.href =
        params.toString()
            ? `${calendlyURL}?${params.toString()}`
            : calendlyURL;

}


/* ============================================
   UPDATE CALENDLY WHEN FORM CHANGES
============================================ */

document
    .querySelectorAll(
        "#customer-name, #customer-email, #customer-phone"
    )
    .forEach(input => {

        input.addEventListener(
            "input",
            updateAvailabilityLink
        );

    });


serviceRadios.forEach(radio => {

    radio.addEventListener(
        "change",
        updateAvailabilityLink
    );

});


/* ============================================
   RESET LOCATION
============================================ */

function resetLocation() {

    if (serviceStatus) {

        serviceStatus.className =
            "service-status";


        serviceStatus.innerHTML =
            "";

    }


    lockAvailability();

}


/* ============================================
   HIDE SUGGESTIONS
============================================ */

function hideSuggestions() {

    if (!suggestionsBox) return;


    suggestionsBox.innerHTML =
        "";


    suggestionsBox.style.display =
        "none";

}


/* ============================================
   ESCAPE HTML
============================================ */

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


/* ============================================
   CLICK OUTSIDE SEARCH
============================================ */

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


/* ============================================
   START MAP AFTER MAPBOX LOADS
============================================ */

function waitForMapbox() {

    if (
        typeof mapboxgl !==
        "undefined"
    ) {

        startMap();

        return;

    }


    setTimeout(
        waitForMapbox,
        100
    );

}


waitForMapbox();


/* ============================================
   INITIALIZE PRICES
============================================ */

updatePrices();


console.log(
    "BrightSide booking JavaScript loaded."
);
```

}
