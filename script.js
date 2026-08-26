// ========================================
// BRIGHTSIDE DETAILING
// MAIN JAVASCRIPT
// ========================================


// ========================================
// MOBILE NAVIGATION
// ========================================

const menuButton = document.getElementById("menuButton");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {

    menuButton.addEventListener("click", function () {

        navLinks.classList.toggle("mobile-open");

    });

}



// ========================================
// MAPBOX
// ========================================

const MAPBOX_TOKEN =
    "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5am9xNnkwMzByMnhva2wzY2V2OTI0In0.l7UZcYuBUSQn6gaaBaminQ";


// Your service-area reference point

const SERVICE_ADDRESS =
    "71 E Park W Dr, Houston, TX";


// Service radius

const SERVICE_RADIUS_MILES = 30;


// Mapbox session

const SESSION_TOKEN =
    crypto.randomUUID();


// Coordinates

let serviceCoordinates = null;

let selectedCustomerCoordinates = null;

let addressIsEligible = false;



// ========================================
// BOOKING ELEMENTS
// ========================================

const vehicleSize =
    document.getElementById("vehicle-size");

const addressInput =
    document.getElementById("address");

const addressSuggestions =
    document.getElementById("address-suggestions");

const serviceAreaResult =
    document.getElementById("service-area-result");

const serviceMap =
    document.getElementById("service-map");

const calendlyButton =
    document.getElementById("calendly-button");

const calendlyHelp =
    document.getElementById("calendly-help");



// ========================================
// PRICING
// ========================================

const prices = {

    sedan: {

        express: 75,

        interior: 100,

        "full-detail": 150

    },

    suv: {

        express: 90,

        interior: 115,

        "full-detail": 175

    },

    truck: {

        express: 100,

        interior: 130,

        "full-detail": 200

    }

};



if (vehicleSize) {

    vehicleSize.addEventListener(
        "change",
        function () {

            const vehicle =
                this.value;

            const priceElements =
                document.querySelectorAll(
                    ".dynamic-price"
                );


            priceElements.forEach(
                function (priceElement) {

                    const service =
                        priceElement.dataset.service;


                    if (!vehicle) {

                        priceElement.textContent =
                            "Choose vehicle";

                        return;

                    }


                    priceElement.textContent =
                        `$${prices[vehicle][service]}`;

                }
            );


            updateCalendlyButton();

        }
    );

}



// ========================================
// MAPBOX SERVICE LOCATION
// ========================================

async function getServiceLocation() {

    try {

        const response =
            await fetch(

                `https://api.mapbox.com/search/searchbox/v1/forward?` +
                `q=${encodeURIComponent(SERVICE_ADDRESS)}` +
                `&limit=1` +
                `&country=US` +
                `&access_token=${MAPBOX_TOKEN}`

            );


        const data =
            await response.json();


        if (
            data.features &&
            data.features.length > 0
        ) {

            const coordinates =
                data.features[0]
                    .geometry
                    .coordinates;


            serviceCoordinates = {

                longitude:
                    coordinates[0],

                latitude:
                    coordinates[1]

            };

        }

    }

    catch (error) {

        console.error(
            "Unable to load service location:",
            error
        );

    }

}


getServiceLocation();



// ========================================
// AUTOCOMPLETE
// ========================================

let autocompleteTimeout;


if (addressInput) {

    addressInput.addEventListener(
        "input",
        function () {

            const query =
                this.value.trim();


            addressIsEligible =
                false;


            selectedCustomerCoordinates =
                null;


            updateCalendlyButton();


            clearTimeout(
                autocompleteTimeout
            );


            if (query.length < 3) {

                addressSuggestions.innerHTML =
                    "";

                addressSuggestions.classList.remove(
                    "show"
                );

                return;

            }


            autocompleteTimeout =
                setTimeout(
                    function () {

                        searchAddresses(
                            query
                        );

                    },
                    250
                );

        }
    );

}



// ========================================
// SEARCH MAPBOX ADDRESSES
// ========================================

async function searchAddresses(query) {

    try {

        const response =
            await fetch(

                `https://api.mapbox.com/search/searchbox/v1/suggest?` +
                `q=${encodeURIComponent(query)}` +
                `&limit=5` +
                `&country=US` +
                `&types=address` +
                `&session_token=${SESSION_TOKEN}` +
                `&access_token=${MAPBOX_TOKEN}`

            );


        const data =
            await response.json();


        if (
            !data.suggestions ||
            data.suggestions.length === 0
        ) {

            addressSuggestions.innerHTML =
                `
                <div class="address-no-results">
                    No matching addresses found.
                </div>
                `;

            addressSuggestions.classList.add(
                "show"
            );

            return;

        }


        addressSuggestions.innerHTML =
            "";


        data.suggestions.forEach(
            function (suggestion) {


                const option =
                    document.createElement(
                        "button"
                    );


                option.type =
                    "button";


                option.className =
                    "address-suggestion";


                option.innerHTML =
                    `

                    <strong>
                        ${escapeHTML(
                            suggestion.name
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            suggestion.place_formatted || ""
                        )}
                    </span>

                    `;


                option.addEventListener(
                    "click",
                    function () {

                        selectAddress(
                            suggestion
                        );

                    }
                );


                addressSuggestions.appendChild(
                    option
                );

            }
        );


        addressSuggestions.classList.add(
            "show"
        );

    }

    catch (error) {

        console.error(
            "Mapbox autocomplete error:",
            error
        );

    }

}



// ========================================
// SELECT ADDRESS
// ========================================

async function selectAddress(
    suggestion
) {

    addressInput.value =
        suggestion.full_address ||
        `${suggestion.name}, ${suggestion.place_formatted}`;


    addressSuggestions.innerHTML =
        "";


    addressSuggestions.classList.remove(
        "show"
    );


    showAddressLoading();


    try {

        const response =
            await fetch(

                `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?` +
                `session_token=${SESSION_TOKEN}` +
                `&access_token=${MAPBOX_TOKEN}`

            );


        const data =
            await response.json();


        if (
            !data.features ||
            data.features.length === 0
        ) {

            throw new Error(
                "Address could not be retrieved."
            );

        }


        const feature =
            data.features[0];


        const coordinates =
            feature.geometry.coordinates;


        selectedCustomerCoordinates = {

            longitude:
                coordinates[0],

            latitude:
                coordinates[1]

        };


        checkServiceArea();


    }

    catch (error) {

        console.error(
            "Address retrieval error:",
            error
        );


        showAddressError(
            "We couldn't verify that address. Please try selecting the address again."
        );

    }

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

    const earthRadius =
        3958.8;


    const latDifference =
        (lat2 - lat1) *
        Math.PI / 180;


    const lonDifference =
        (lon2 - lon1) *
        Math.PI / 180;


    const a =
        Math.sin(
            latDifference / 2
        ) ** 2
        +
        Math.cos(
            lat1 * Math.PI / 180
        )
        *
        Math.cos(
            lat2 * Math.PI / 180
        )
        *
        Math.sin(
            lonDifference / 2
        ) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;

}



// ========================================
// CHECK SERVICE AREA
// ========================================

function checkServiceArea() {

    if (
        !serviceCoordinates ||
        !selectedCustomerCoordinates
    ) {

        return;

    }


    const distance =
        calculateDistance(

            serviceCoordinates.latitude,

            serviceCoordinates.longitude,

            selectedCustomerCoordinates.latitude,

            selectedCustomerCoordinates.longitude

        );


    const roundedDistance =
        distance.toFixed(1);


    // ====================================
    // ELIGIBLE
    // ====================================

    if (
        distance <=
        SERVICE_RADIUS_MILES
    ) {

        addressIsEligible =
            true;


        showAddressSuccess(
            roundedDistance
        );

    }


    // ====================================
    // OUTSIDE AREA
    // ====================================

    else {

        addressIsEligible =
            false;


        showAddressOutside(
            roundedDistance
        );

    }


    updateMap();


    updateCalendlyButton();

}



// ========================================
// SUCCESS MESSAGE
// ========================================

function showAddressSuccess(
    distance
) {

    serviceAreaResult.className =
        "service-area-result success";


    serviceAreaResult.innerHTML =
        `

        <div class="result-icon">
            ✓
        </div>

        <div>

            <strong>
                You're within our service area
            </strong>

            <p>
                Your selected location is approximately
                ${distance} miles away.
            </p>

        </div>

        `;

}



// ========================================
// OUTSIDE SERVICE AREA
// ========================================

function showAddressOutside(
    distance
) {

    serviceAreaResult.className =
        "service-area-result outside";


    serviceAreaResult.innerHTML =
        `

        <div class="result-icon">
            ×
        </div>

        <div>

            <strong>
                Outside our current service area
            </strong>

            <p>
                Your selected location is approximately
                ${distance} miles away. Brightside currently
                services locations within approximately
                ${SERVICE_RADIUS_MILES} miles.
            </p>

        </div>

        `;

}



// ========================================
// LOADING
// ========================================

function showAddressLoading() {

    serviceAreaResult.className =
        "service-area-result loading";


    serviceAreaResult.innerHTML =
        `

        <div class="result-icon">
            ...
        </div>

        <div>

            <strong>
                Checking your service area...
            </strong>

            <p>
                We're verifying your selected address.
            </p>

        </div>

        `;

}



// ========================================
// ERROR
// ========================================

function showAddressError(
    message
) {

    addressIsEligible =
        false;


    serviceAreaResult.className =
        "service-area-result outside";


    serviceAreaResult.innerHTML =
        `

        <div class="result-icon">
            ×
        </div>

        <div>

            <strong>
                Address couldn't be verified
            </strong>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

        `;


    updateCalendlyButton();

}



// ========================================
// MAP PREVIEW
// ========================================

function updateMap() {

    if (
        !serviceMap ||
        !selectedCustomerCoordinates
    ) {

        return;

    }


    const latitude =
        selectedCustomerCoordinates.latitude;


    const longitude =
        selectedCustomerCoordinates.longitude;


    /*
        We use a Mapbox static map image here.

        This gives us a clean map preview without
        requiring another Mapbox JavaScript library.
    */

    const mapURL =

        `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +

        `pin-s+1f78b4(${longitude},${latitude})/` +

        `${longitude},${latitude},11,0/` +

        `900x350?access_token=${MAPBOX_TOKEN}`;


    serviceMap.innerHTML =
        `

        <img
            src="${mapURL}"
            alt="Map showing selected service location"
        >

        <div class="map-overlay">
            <span>
                SERVICE LOCATION
            </span>
        </div>

        `;

}



// ========================================
// CALENDLY
// ========================================

function updateCalendlyButton() {

    if (!calendlyButton) {

        return;

    }


    const name =
        document.getElementById(
            "name"
        );


    const email =
        document.getElementById(
            "email"
        );


    const phone =
        document.getElementById(
            "phone"
        );


    const make =
        document.getElementById(
            "vehicle-make"
        );


    const model =
        document.getElementById(
            "vehicle-model"
        );


    const year =
        document.getElementById(
            "vehicle-year"
        );


    const selectedVehicle =
        vehicleSize
            ? vehicleSize.value
            : "";


    const selectedService =
        document.querySelector(
            'input[name="service"]:checked'
        );


    const ready =

        name &&
        name.value.trim() !== "" &&

        email &&
        email.value.trim() !== "" &&

        phone &&
        phone.value.trim() !== "" &&

        make &&
        make.value.trim() !== "" &&

        model &&
        model.value.trim() !== "" &&

        year &&
        year.value.trim() !== "" &&

        selectedVehicle !== "" &&

        selectedService !== null &&

        addressIsEligible;


    if (!ready) {

        calendlyButton.href =
            "#";


        calendlyButton.classList.add(
            "disabled-button"
        );


        if (calendlyHelp) {

            calendlyHelp.textContent =
                "Complete your information and select an eligible service address first.";

        }


        return;

    }



    // ====================================
    // GET PRICE
    // ====================================

    const service =
        selectedService.value;


    const price =
        prices[
            selectedVehicle
        ][service];



    // ====================================
    // CREATE CALENDLY LINK
    // ====================================

    const params =
        new URLSearchParams();


    params.set(
        "name",
        name.value.trim()
    );


    params.set(
        "email",
        email.value.trim()
    );


    /*
        These values are included in the URL
        as tracking information.

        You can later add matching Calendly
        custom questions if desired.
    */

    params.set(
        "utm_source",
        "brightside-website"
    );


    params.set(
        "utm_campaign",
        `${service}-${selectedVehicle}`
    );


    params.set(
        "utm_content",
        `starting-price-${price}`
    );


    calendlyButton.href =
        "https://calendly.com/brightsidemdetails/30min"
        +
        "?"
        +
        params.toString();


    calendlyButton.classList.remove(
        "disabled-button"
    );


    if (calendlyHelp) {

        calendlyHelp.textContent =
            "You're ready. Continue to Calendly to choose your available weekend appointment.";

    }

}



// ========================================
// FORM LISTENERS
// ========================================

const formInputs =
    document.querySelectorAll(
        "#name, #email, #phone, #vehicle-make, #vehicle-model, #vehicle-year"
    );


formInputs.forEach(
    function (input) {

        input.addEventListener(
            "input",
            updateCalendlyButton
        );

    }
);



const serviceOptions =
    document.querySelectorAll(
        'input[name="service"]'
    );


serviceOptions.forEach(
    function (option) {

        option.addEventListener(
            "change",
            updateCalendlyButton
        );

    }
);



// ========================================
// PREVENT DISABLED CALENDLY
// ========================================

if (calendlyButton) {

    calendlyButton.addEventListener(
        "click",
        function (event) {

            if (
                calendlyButton.classList.contains(
                    "disabled-button"
                )
            ) {

                event.preventDefault();

            }

        }
    );

}



// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}
