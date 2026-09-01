/* ============================================
BRIGHTSIDE HOUSTON DETAILING
BOOKING + MAPBOX + FORMSPREE
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

const bookingPage =
document.getElementById("booking-page");

if (!bookingPage) {

```
console.log(
    "BrightSide: not on booking page."
);
```

} else {

/* ============================================
MAPBOX SETTINGS
============================================ */

const MAPBOX_TOKEN =
"pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyZWF0In0.Usd3fiKRnZq1oE6cYy1Jg";

const SERVICE_LAT = 29.70254;
const SERVICE_LNG = -95.58891;

const SERVICE_RADIUS = 30;

/* ============================================
FORMSPREE
============================================ */

const FORMSPREE_ENDPOINT =
"https://formspree.io/f/mwlkokaa";

/* ============================================
CALENDLY
============================================ */

/*
IMPORTANT:
Replace these URLs with your actual Calendly
event links if they are different.
*/

const CALENDLY_URLS = {

```
express:
    "https://calendly.com/brightsidemdetails/express-exterior",

interior:
    "https://calendly.com/brightsidemdetails/full-interior",

"full-detail":
    "https://calendly.com/brightsidemdetails/30min"
```

};

/* ============================================
ELEMENTS
============================================ */

const bookingForm =
document.getElementById("booking-form");

const addressInput =
document.getElementById("address");

const suggestionsBox =
document.getElementById("address-suggestions");

const serviceStatus =
document.getElementById("service-status");

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
document.getElementById("vehicle-size");

const vehiclePrice =
document.getElementById("vehicle-price");

const selectedPriceInput =
document.getElementById("selected-price");

const serviceAreaStatus =
document.getElementById(
"service-area-status"
);

const serviceDistance =
document.getElementById(
"service-distance"
);

const formStatus =
document.getElementById("form-status");

/* ============================================
VEHICLE PRICING
============================================ */

const prices = {

```
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
```

};

/* ============================================
UPDATE PRICES
============================================ */

function updatePrices() {

```
if (!vehicleSize) {
    return;
}


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


    if (selectedPriceInput) {
        selectedPriceInput.value = "";
    }


    return;
}


const selected =
    prices[vehicle];


const selectedService =
    document.querySelector(
        "input[name='service']:checked"
    );


if (vehiclePrice) {

    vehiclePrice.innerHTML =
        `<strong>Estimated pricing:</strong>
        Express $${selected.express}
        • Interior $${selected.interior}
        • Full Detail $${selected["full-detail"]}`;

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


    if (
        radio.value ===
        "full-detail"
    ) {

        element.textContent =
            `$${selected["full-detail"]}`;

    }

});


if (
    selectedPriceInput &&
    selectedService
) {

    const price =
        selected[
            selectedService.value
        ];


    selectedPriceInput.value =
        price
            ? `$${price}`
            : "";

}
```

}

if (vehicleSize) {

```
vehicleSize.addEventListener(
    "change",
    updatePrices
);
```

}

/* ============================================
SERVICE CARD SELECTION
============================================ */

const serviceRadios =
document.querySelectorAll(
"input[name='service']"
);

serviceRadios.forEach(radio => {

```
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


        updatePrices();

    }
);
```

});

/* ============================================
PACKAGE FROM URL
Example:
booking/?service=express
============================================ */

function selectPackageFromURL() {

```
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
        `input[name="service"][value="${CSS.escape(selectedService)}"]`
    );


if (!serviceRadio) {
    return;
}


serviceRadio.checked = true;


document
    .querySelectorAll(
        ".service-card"
    )
    .forEach(card => {

        card.classList.remove(
            "selected-service"
        );

    });


const selectedCard =
    serviceRadio.closest(
        ".service-card"
    );


if (selectedCard) {

    selectedCard.classList.add(
        "selected-service"
    );

}
```

}

selectPackageFromURL();

/* ============================================
MAPBOX
============================================ */

let map = null;
let marker = null;

/* ============================================
START MAP
============================================ */

function startMap() {

```
if (!mapElement) {
    return;
}


if (
    !MAPBOX_TOKEN ||
    !MAPBOX_TOKEN.startsWith("pk.")
) {

    console.error(
        "Mapbox public token is missing or invalid."
    );


    mapElement.innerHTML =
        `<div class="map-error">
            Map cannot load because the Mapbox public token is invalid.
        </div>`;


    return;
}


if (
    typeof mapboxgl ===
    "undefined"
) {

    console.error(
        "Mapbox GL JS did not load."
    );


    mapElement.innerHTML =
        `<div class="map-error">
            Mapbox could not load. Please refresh the page.
        </div>`;


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

    console.log(
        "Mapbox map loaded successfully."
    );

});


map.on("error", event => {

    console.error(
        "Mapbox map error:",
        event
    );

});
```

}

/* ============================================
WAIT FOR MAPBOX SCRIPT
============================================ */

function initializeMapWhenReady() {

```
if (
    typeof mapboxgl !==
    "undefined"
) {

    startMap();

    return;
}


setTimeout(
    initializeMapWhenReady,
    100
);
```

}

initializeMapWhenReady();

/* ============================================
SEARCH SESSION
============================================ */

let sessionToken =
createSessionToken();

function createSessionToken() {

```
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
```

}

/* ============================================
SEARCH TIMER
============================================ */

let searchTimer = null;

/* ============================================
ADDRESS INPUT
============================================ */

if (addressInput) {

```
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
            setTimeout(() => {

                getSuggestions(
                    query
                );

            }, 350);

    }
);
```

}

/* ============================================
GET MAPBOX SUGGESTIONS
============================================ */

async function getSuggestions(
query
) {

```
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
        encodeURIComponent(
            sessionToken
        ) +
        "&proximity=" +
        SERVICE_LNG +
        "," +
        SERVICE_LAT +
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
            "Mapbox Search Error:",
            response.status,
            errorText
        );


        throw new Error(
            `Mapbox search failed (${response.status})`
        );

    }


    const data =
        await response.json();


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
```

}

/* ============================================
DISPLAY SUGGESTIONS
============================================ */

function showSuggestions(
suggestions
) {

```
if (!suggestionsBox) {
    return;
}


suggestionsBox.innerHTML =
    "";


if (
    !suggestions.length
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


        const name =
            suggestion.name ||
            suggestion.name_preferred ||
            "";


        const address =
            suggestion.full_address ||
            suggestion.place_formatted ||
            "";


        button.innerHTML =
            `<strong>
                ${escapeHTML(name)}
            </strong>
            <span>
                ${escapeHTML(address)}
            </span>`;


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
```

}

/* ============================================
RETRIEVE SELECTED ADDRESS
============================================ */

async function retrieveAddress(
suggestion
) {

```
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
            "Mapbox Retrieve Error:",
            response.status,
            errorText
        );


        throw new Error(
            `Mapbox retrieve failed (${response.status})`
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


        serviceStatus.innerHTML =
            `<strong>
                Unable to verify this address
            </strong>

            <span>
                Please select an address directly
                from the suggestions.
            </span>`;

    }


    lockAvailability();

}
```

}

/* ============================================
UPDATE MAP
============================================ */

function updateMap(
longitude,
latitude,
address
) {

```
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
            }).setText(
                address
            )
        )
        .addTo(map);


marker.togglePopup();
```

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

```
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
```

}

/* ============================================
CHECK SERVICE AREA
============================================ */

function checkServiceArea(
latitude,
longitude
) {

```
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


if (serviceDistance) {

    serviceDistance.value =
        `${miles} miles`;

}


if (
    distance <=
    SERVICE_RADIUS
) {

    serviceStatus.className =
        "service-status eligible";


    serviceStatus.innerHTML =
        `<strong>
            ✓ You're within our service area
        </strong>

        <span>
            Approximately ${miles}
            miles from the Alief Community Center.
        </span>`;


    if (serviceAreaStatus) {

        serviceAreaStatus.value =
            "Eligible";

    }


    unlockAvailability();

} else {

    serviceStatus.className =
        "service-status not-eligible";


    serviceStatus.innerHTML =
        `<strong>
            ✕ Outside our current service area
        </strong>

        <span>
            This address is approximately
            ${miles} miles from the
            Alief Community Center.
            Our service radius is 30 miles.
        </span>`;


    if (serviceAreaStatus) {

        serviceAreaStatus.value =
            "Outside service area";

    }


    lockAvailability();

}
```

}

/* ============================================
UNLOCK AVAILABILITY
============================================ */

function unlockAvailability() {

```
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


availabilityButton.disabled =
    false;


availabilityButton.setAttribute(
    "aria-disabled",
    "false"
);


const message =
    availability.querySelector(
        ".availability-message"
    );


if (message) {

    message.innerHTML =
        `<strong>
            ✓ Location confirmed
        </strong>

        <p>
            Your address is within our
            service area. Continue to
            choose an available appointment.
        </p>`;

}
```

}

/* ============================================
LOCK AVAILABILITY
============================================ */

function lockAvailability() {

```
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


availabilityButton.disabled =
    true;


availabilityButton.setAttribute(
    "aria-disabled",
    "true"
);


const message =
    availability.querySelector(
        ".availability-message"
    );


if (message) {

    message.innerHTML =
        `<strong>
            Check Availability
        </strong>

        <p>
            Confirm that your address
            is within our service area
            to continue.
        </p>`;

}
```

}

/* ============================================
RESET LOCATION
============================================ */

function resetLocation() {

```
if (serviceStatus) {

    serviceStatus.className =
        "service-status";


    serviceStatus.innerHTML =
        "";

}


if (serviceAreaStatus) {

    serviceAreaStatus.value =
        "";

}


if (serviceDistance) {

    serviceDistance.value =
        "";

}


lockAvailability();
```

}

/* ============================================
HIDE SUGGESTIONS
============================================ */

function hideSuggestions() {

```
if (!suggestionsBox) {
    return;
}


suggestionsBox.innerHTML =
    "";


suggestionsBox.style.display =
    "none";
```

}

/* ============================================
ESCAPE HTML
============================================ */

function escapeHTML(value) {

```
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
```

}

/* ============================================
CLICK OUTSIDE ADDRESS SEARCH
============================================ */

document.addEventListener(
"click",
event => {

```
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
```

);

/* ============================================
FORM VALIDATION
============================================ */

function validateBookingForm() {

```
if (!bookingForm) {
    return false;
}


if (
    !bookingForm.checkValidity()
) {

    bookingForm.reportValidity();

    return false;

}


const selectedService =
    document.querySelector(
        "input[name='service']:checked"
    );


if (!selectedService) {

    showFormError(
        "Please choose a detailing service."
    );

    return false;

}


if (
    !addressInput ||
    !addressInput.value.trim()
) {

    showFormError(
        "Please enter your service address."
    );

    return false;

}


if (
    !serviceAreaStatus ||
    serviceAreaStatus.value !==
    "Eligible"
) {

    showFormError(
        "Please select an address from the Mapbox suggestions and confirm that it is within our service area."
    );

    return false;

}


return true;
```

}

/* ============================================
FORM ERROR
============================================ */

function showFormError(
message
) {

```
if (!formStatus) {
    return;
}


formStatus.className =
    "form-status error";


formStatus.textContent =
    message;


formStatus.scrollIntoView({
    behavior: "smooth",
    block: "center"
});
```

}

/* ============================================
FORM SUCCESS MESSAGE
============================================ */

function showFormLoading() {

```
if (!formStatus) {
    return;
}


formStatus.className =
    "form-status loading";


formStatus.textContent =
    "Saving your booking information...";
```

}

/* ============================================
SUBMIT TO FORMSPREE
============================================ */

async function submitToFormspree() {

```
const formData =
    new FormData(
        bookingForm
    );


const response =
    await fetch(
        FORMSPREE_ENDPOINT,
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

    let errorMessage =
        "Unable to submit your information.";

    try {

        const data =
            await response.json();


        if (
            data.errors &&
            data.errors.length
        ) {

            errorMessage =
                data.errors
                    .map(
                        error =>
                            error.message
                    )
                    .join(" ");

        }

    } catch {

        // Keep default error message.

    }


    throw new Error(
        errorMessage
    );

}


return response;
```

}

/* ============================================
OPEN CALENDLY
============================================ */

function openCalendly() {

```
const selectedService =
    document.querySelector(
        "input[name='service']:checked"
    );


if (!selectedService) {

    showFormError(
        "Please choose a service first."
    );

    return;

}


const calendlyURL =
    CALENDLY_URLS[
        selectedService.value
    ];


if (!calendlyURL) {

    showFormError(
        "The appointment link for this service is not configured yet."
    );

    return;

}


window.location.href =
    calendlyURL;
```

}

/* ============================================
FORM SUBMISSION
============================================ */

if (bookingForm) {

```
bookingForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (
            !validateBookingForm()
        ) {

            return;

        }


        if (availabilityButton) {

            availabilityButton.disabled =
                true;

            availabilityButton.classList.add(
                "disabled-button"
            );

        }


        showFormLoading();


        try {

            await submitToFormspree();


            if (formStatus) {

                formStatus.className =
                    "form-status success";


                formStatus.textContent =
                    "Information saved! Opening appointment availability...";

            }


            /*
                Give Formspree a moment to finish
                before sending the customer to Calendly.
            */

            setTimeout(
                () => {

                    openCalendly();

                },
                700
            );


        } catch (error) {

            console.error(
                "Formspree submission error:",
                error
            );


            if (formStatus) {

                formStatus.className =
                    "form-status error";


                formStatus.textContent =
                    "We couldn't save your information. Please try again.";

            }


            if (availabilityButton) {

                availabilityButton.disabled =
                    false;

                availabilityButton.classList.remove(
                    "disabled-button"
                );

            }

        }

    }
);
```

}

/* ============================================
INITIALIZE
============================================ */

updatePrices();

console.log(
"BrightSide booking JavaScript loaded."
);

}
