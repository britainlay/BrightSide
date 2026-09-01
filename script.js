```javascript
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

const bookingPage = document.getElementById("booking-page");


// ============================================
// PACKAGE SELECTION FROM URL
// ============================================

function selectPackageFromURL() {

    if (!bookingPage) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const selectedService = params.get("service");

    if (!selectedService) {
        return;
    }

    const serviceRadio = document.querySelector(
        `input[name="service"][value="${selectedService}"]`
    );

    if (!serviceRadio) {
        console.warn("Package not found:", selectedService);
        return;
    }

    serviceRadio.checked = true;

    const selectedCard = serviceRadio.closest(".service-card");

    document.querySelectorAll(".service-card").forEach(card => {
        card.classList.remove("selected-service");
    });

    if (selectedCard) {
        selectedCard.classList.add("selected-service");
    }
}


// Run package selection after page loads

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        selectPackageFromURL
    );

} else {

    selectPackageFromURL();

}


// ============================================
// IF THIS IS NOT BOOKING PAGE
// ============================================

if (!bookingPage) {

    // No booking functionality needed.

} else {


    // ========================================
    // FORMSPREE
    // ========================================

    const FORMSPREE_URL =
        "https://formspree.io/f/mwlkokaa";


    // ========================================
    // CALENDLY LINKS
    // ========================================

    const CALENDLY_LINKS = {

        express:
            "https://calendly.com/brightsidemdetails/express-exterior",

        interior:
            "https://calendly.com/brightsidemdetails/full-interior",

        "full-detail":
            "https://calendly.com/brightsidemdetails/30min"

    };


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


    // Customer information

    const customerName =
        document.getElementById(
            "customer-name"
        );

    const customerEmail =
        document.getElementById(
            "customer-email"
        );

    const customerPhone =
        document.getElementById(
            "customer-phone"
        );

    const condition =
        document.getElementById(
            "condition"
        );


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

        if (!vehicleSize) {
            return;
        }

        const vehicle = vehicleSize.value;

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


        const selected = prices[vehicle];


        if (vehiclePrice) {

            vehiclePrice.innerHTML =
                `<strong>Estimated pricing:</strong>
                 Express $${selected.express}
                 • Interior $${selected.interior}
                 • Full Detail $${selected.full}`;

        }


        priceElements.forEach(element => {

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

    }


    if (vehicleSize) {

        vehicleSize.addEventListener(
            "change",
            updatePrices
        );

    }


    // ========================================
    // SERVICE CARD SELECTION
    // ========================================

    const serviceRadios =
        document.querySelectorAll(
            "input[name='service']"
        );


    serviceRadios.forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                document
                    .querySelectorAll(
                        ".service-card"
                    )
                    .forEach(card => {

                        card.classList.remove(
                            "selected-service"
                        );

                    });


                const card =
                    radio.closest(
                        ".service-card"
                    );


                if (card) {

                    card.classList.add(
                        "selected-service"
                    );

                }

            }
        );

    });


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
            "PASTE_YOUR_PK_TOKEN_HERE"
        ) {

            console.error(
                "Mapbox public token is missing."
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


    if (document.readyState === "loading") {

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


                if (query.length < 3) {

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

    async function getSuggestions(query) {

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

    function showSuggestions(suggestions) {

        if (!suggestionsBox) {
            return;
        }


        suggestionsBox.innerHTML = "";


        if (suggestions.length === 0) {

            hideSuggestions();

            return;

        }


        suggestions.forEach(suggestion => {

            const button =
                document.createElement(
                    "button"
                );


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

        const radius = 3958.8;


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
                    Complete your information and
                    continue to choose an appointment.
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


    // ========================================
    // GET SELECTED SERVICE
    // ========================================

    function getSelectedService() {

        const selected =
            document.querySelector(
                "input[name='service']:checked"
            );


        if (!selected) {
            return null;
        }


        return selected.value;

    }


    // ========================================
    // GET SERVICE NAME
    // ========================================

    function getServiceName(service) {

        const names = {

            express:
                "Exterior Detail",

            interior:
                "Interior Detail",

            "full-detail":
                "Full Detail"

        };


        return names[service] || service;

    }


    // ========================================
    // GET ESTIMATED PRICE
    // ========================================

    function getEstimatedPrice() {

        if (
            !vehicleSize ||
            !vehicleSize.value
        ) {

            return "";

        }


        const vehicle =
            vehicleSize.value;


        const service =
            getSelectedService();


        if (
            !service ||
            !prices[vehicle]
        ) {

            return "";

        }


        if (service === "express") {

            return `$${prices[vehicle].express}`;

        }


        if (service === "interior") {

            return `$${prices[vehicle].interior}`;

        }


        if (service === "full-detail") {

            return `$${prices[vehicle].full}`;

        }


        return "";

    }


    // ========================================
    // VALIDATE BOOKING INFORMATION
    // ========================================

    function validateBooking() {

        const fields = [

            {
                element: customerName,
                name: "your name"
            },

            {
                element: customerEmail,
                name: "your email"
            },

            {
                element: customerPhone,
                name: "your phone number"
            },

            {
                element:
                    document.getElementById(
                        "vehicle-make"
                    ),
                name: "vehicle make"
            },

            {
                element:
                    document.getElementById(
                        "vehicle-model"
                    ),
                name: "vehicle model"
            },

            {
                element:
                    document.getElementById(
                        "vehicle-year"
                    ),
                name: "vehicle year"
            },

            {
                element: vehicleSize,
                name: "vehicle type"
            },

            {
                element: addressInput,
                name: "service address"
            }

        ];


        for (const field of fields) {

            if (
                !field.element ||
                !field.element.value.trim()
            ) {

                alert(
                    `Please enter ${field.name} before continuing.`
                );


                field.element?.focus();


                return false;

            }

        }


        const selectedService =
            getSelectedService();


        if (!selectedService) {

            alert(
                "Please select a detailing service before continuing."
            );


            document
                .getElementById(
                    "service-section"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


            return false;

        }


        if (
            !serviceStatus ||
            !serviceStatus.classList.contains(
                "eligible"
            )
        ) {

            alert(
                "Please select an address within our service area before continuing."
            );


            addressInput?.focus();


            return false;

        }


        return true;

    }


    // ========================================
    // SEND BOOKING TO FORMSPREE
    // ========================================

    async function sendToFormspree() {

        const selectedService =
            getSelectedService();


        const vehicleMake =
            document.getElementById(
                "vehicle-make"
            )?.value.trim();


        const vehicleModel =
            document.getElementById(
                "vehicle-model"
            )?.value.trim();


        const vehicleYear =
            document.getElementById(
                "vehicle-year"
            )?.value.trim();


        const vehicleType =
            vehicleSize?.options[
                vehicleSize.selectedIndex
            ]?.textContent.trim();


        const conditionText =
            condition?.value.trim() ||
            "No additional comments";


        const formData =
            new FormData();


        formData.append(
            "Name",
            customerName.value.trim()
        );


        formData.append(
            "Email",
            customerEmail.value.trim()
        );


        formData.append(
            "Phone",
            customerPhone.value.trim()
        );


        formData.append(
            "Vehicle Make",
            vehicleMake
        );


        formData.append(
            "Vehicle Model",
            vehicleModel
        );


        formData.append(
            "Vehicle Year",
            vehicleYear
        );


        formData.append(
            "Vehicle Type",
            vehicleType
        );


        formData.append(
            "Service",
            getServiceName(
                selectedService
            )
        );


        formData.append(
            "Estimated Price",
            getEstimatedPrice()
        );


        formData.append(
            "Service Address",
            addressInput.value.trim()
        );


        formData.append(
            "Vehicle Condition / Comments",
            conditionText
        );


        formData.append(
            "_subject",
            "New BrightSide Detailing Booking Request"
        );


        const response =
            await fetch(
                FORMSPREE_URL,
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Formspree submission failed."
            );

        }


        return true;

    }


    // ========================================
    // CHECK AVAILABILITY BUTTON
    // ========================================

    if (availabilityButton) {

        availabilityButton.addEventListener(
            "click",
            async event => {

                event.preventDefault();


                if (
                    availabilityButton.classList.contains(
                        "disabled-button"
                    )
                ) {

                    return;

                }


                // Validate all information

                if (!validateBooking()) {
                    return;
                }


                const selectedService =
                    getSelectedService();


                const calendlyURL =
                    CALENDLY_LINKS[
                        selectedService
                    ];


                if (!calendlyURL) {

                    alert(
                        "There was a problem selecting the booking calendar. Please try again."
                    );

                    return;

                }


                // Temporarily disable button

                availabilityButton.style.pointerEvents =
                    "none";

                availabilityButton.classList.add(
                    "disabled-button"
                );


                const originalText =
                    availabilityButton.innerHTML;


                availabilityButton.innerHTML =
                    "Sending Details...";


                try {

                    // Send vehicle information to BrightSide

                    await sendToFormspree();


                    // Tell customer we're moving to Calendly

                    availabilityButton.innerHTML =
                        "Opening Calendar...";


                    // Small delay so Formspree finishes cleanly

                    setTimeout(
                        () => {

                            window.location.href =
                                calendlyURL;

                        },
                        500
                    );


                } catch (error) {

                    console.error(
                        "Booking submission error:",
                        error
                    );


                    availabilityButton.innerHTML =
                        originalText;


                    availabilityButton.classList.remove(
                        "disabled-button"
                    );


                    availabilityButton.style.pointerEvents =
                        "auto";


                    alert(
                        "We couldn't send your booking information. Please check your internet connection and try again."
                    );

                }

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

}
```
