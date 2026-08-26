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
// MAPBOX
// ============================================

const MAPBOX_TOKEN = "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyYWV0In0.Usd3fiKRnMZq1oE6cYy1Jg";


// ============================================
// SERVICE AREA
// ============================================

const SERVICE_LAT = 29.7047;
const SERVICE_LNG = -95.5903;

const SERVICE_RADIUS = 30;


// ============================================
// BOOKING PAGE ELEMENTS
// ============================================

const addressInput = document.getElementById("address");
const addressSuggestions =
    document.getElementById("address-suggestions");

const serviceStatus =
    document.getElementById("service-status");

const mapElement =
    document.getElementById("map");


// ============================================
// VEHICLE PRICING
// ============================================

const vehicleSize =
    document.getElementById("vehicle-size");

const vehiclePrice =
    document.getElementById("vehicle-price");

const servicePrices =
    document.querySelectorAll(".service-price");


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


// ============================================
// UPDATE PRICES
// ============================================

function updatePrices() {

    if (!vehicleSize) return;

    const vehicle = vehicleSize.value;

    if (!vehicle) {

        vehiclePrice.textContent =
            "Choose your vehicle type to see your price.";

        servicePrices.forEach(price => {

            price.textContent =
                "Select Vehicle";

        });

        return;
    }


    const selectedPrices = prices[vehicle];


    vehiclePrice.innerHTML = `
        <strong>Estimated pricing:</strong>
        Express $${selectedPrices.express} •
        Interior $${selectedPrices.interior} •
        Full Detail $${selectedPrices.full}
    `;


    servicePrices.forEach(priceElement => {

        const card =
            priceElement.closest(".service-card");

        if (!card) return;

        const service =
            card.querySelector("input[name='service']");

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


// ============================================
// DISTANCE CALCULATOR
// ============================================

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
        Math.sin(latDifference / 2) *
        Math.sin(latDifference / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(lonDifference / 2) *
        Math.sin(lonDifference / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;

}


// ============================================
// MAP VARIABLES
// ============================================

let map = null;
let marker = null;


// ============================================
// INITIALIZE MAPBOX
// ============================================

function initializeMap() {

    if (!mapElement) return;


    if (
        !MAPBOX_TOKEN ||
        MAPBOX_TOKEN === "PASTE_YOUR_PK_TOKEN_HERE"
    ) {

        console.error(
            "Mapbox token has not been added."
        );

        mapElement.innerHTML = `
            <div style="
                padding: 20px;
                text-align: center;
            ">
                Map is currently unavailable.
            </div>
        `;

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

        zoom: 10

    });


    map.addControl(
        new mapboxgl.NavigationControl()
    );

}


if (mapElement) {

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeMap
        );

    } else {

        initializeMap();

    }

}


// ============================================
// ADDRESS SEARCH
// ============================================

let searchTimer = null;


if (addressInput) {

    addressInput.addEventListener(
        "input",
        function () {

            clearTimeout(searchTimer);


            const query =
                addressInput.value.trim();


            if (query.length < 3) {

                if (addressSuggestions) {

                    addressSuggestions.innerHTML = "";

                    addressSuggestions.style.display =
                        "none";

                }

                return;
            }


            searchTimer = setTimeout(
                () => {

                    searchAddress(query);

                },
                400
            );

        }
    );

}


// ============================================
// SEARCH MAPBOX
// ============================================

async function searchAddress(query) {

    try {

        const url =
            "https://api.mapbox.com/search/geocode/v6/forward" +

            "?q=" +
            encodeURIComponent(query) +

            "&country=US" +

            "&limit=5" +

            "&access_token=" +
            MAPBOX_TOKEN;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Mapbox address search failed."
            );

        }


        const data =
            await response.json();


        displayAddressSuggestions(
            data.features
        );


    } catch (error) {

        console.error(
            "Mapbox search error:",
            error
        );

    }

}


// ============================================
// DISPLAY SUGGESTIONS
// ============================================

function displayAddressSuggestions(
    features
) {

    if (!addressSuggestions) return;


    addressSuggestions.innerHTML = "";


    if (
        !features ||
        features.length === 0
    ) {

        addressSuggestions.style.display =
            "none";

        return;
    }


    features.forEach(feature => {

        const button =
            document.createElement("button");


        button.type = "button";

        button.className =
            "address-suggestion";


        const name =
            feature.properties?.name ||
            "";

        const address =
            feature.properties?.full_address ||
            feature.properties?.place_formatted ||
            "";


        button.innerHTML = `
            <strong>${name}</strong>
            <span>${address}</span>
        `;


        button.addEventListener(
            "click",
            () => {

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


// ============================================
// SELECT ADDRESS
// ============================================

function selectAddress(feature) {

    const coordinates =
        feature.geometry.coordinates;


    const longitude =
        coordinates[0];

    const latitude =
        coordinates[1];


    const address =
        feature.properties?.full_address ||
        feature.properties?.place_formatted ||
        feature.properties?.name ||
        "";


    // Put address into input

    if (addressInput) {

        addressInput.value =
            address;

    }


    // Hide suggestions

    if (addressSuggestions) {

        addressSuggestions.innerHTML =
            "";

        addressSuggestions.style.display =
            "none";

    }


    // Check distance

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


// ============================================
// CHECK SERVICE AREA
// ============================================

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


    const roundedDistance =
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
                Approximately
                ${roundedDistance}
                miles from our service area.
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
                ${roundedDistance}
                miles away.
                Brightside currently services
                locations within 30 miles.
            </span>
        `;

    }

}


// ============================================
// MOVE MAP TO ADDRESS
// ============================================

function moveMap(
    latitude,
    longitude,
    address
) {

    if (!map) return;


    map.flyTo({

        center: [
            longitude,
            latitude
        ],

        zoom: 14,

        essential: true

    });


    // Remove previous marker

    if (marker) {

        marker.remove();

    }


    // Create new marker

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


// ============================================
// CLOSE SUGGESTIONS WHEN CLICKING ELSEWHERE
// ============================================

document.addEventListener(
    "click",
    function (event) {

        if (
            addressInput &&
            addressSuggestions &&
            !addressInput.contains(event.target) &&
            !addressSuggestions.contains(event.target)
        ) {

            addressSuggestions.style.display =
                "none";

        }

    }
);
