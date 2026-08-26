// ============================================
// BRIGHTSIDE DETAILING - MAIN SCRIPT
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
// MAPBOX ADDRESS CHECKER
// ============================================


const MAPBOX_TOKEN = "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5a3FuMDUwNHVlMndweWFzNXAwMG5rIn0.HYTbUgwvgO3_fn7f0mHCDg";

const addressInput = document.getElementById("address");
const addressSuggestions = document.getElementById("address-suggestions");
const mapContainer = document.getElementById("map");
const serviceStatus = document.getElementById("service-status");


// Your service center
// 71 E Park W Dr, Houston, TX

const SERVICE_LAT = 29.6567;
const SERVICE_LNG = -95.5967;

// Service radius
const SERVICE_RADIUS_MILES = 30;


// ============================================
// CALCULATE DISTANCE
// ============================================

function calculateDistance(lat1, lon1, lat2, lon2) {

    const earthRadius = 3958.8;

    const latDifference = (lat2 - lat1) * Math.PI / 180;
    const lonDifference = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(latDifference / 2) *
        Math.sin(latDifference / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(lonDifference / 2) *
        Math.sin(lonDifference / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}


// ============================================
// SEARCH ADDRESS
// ============================================

let searchTimeout;

if (addressInput) {

    addressInput.addEventListener("input", () => {

        clearTimeout(searchTimeout);

        const query = addressInput.value.trim();

        if (query.length < 3) {

            if (addressSuggestions) {
                addressSuggestions.innerHTML = "";
                addressSuggestions.style.display = "none";
            }

            return;
        }

        searchTimeout = setTimeout(() => {

            searchAddress(query);

        }, 400);

    });
}


// ============================================
// MAPBOX SEARCH
// ============================================

async function searchAddress(query) {

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === "PASTE_YOUR_NEW_TOKEN_HERE") {

        console.error("Mapbox token has not been added.");

        return;
    }

    try {

        const url =
            `https://api.mapbox.com/search/geocode/v6/forward` +
            `?q=${encodeURIComponent(query)}` +
            `&country=US` +
            `&limit=5` +
            `&access_token=${MAPBOX_TOKEN}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Mapbox request failed.");
        }

        const data = await response.json();

        displaySuggestions(data.features);

    } catch (error) {

        console.error("Address search error:", error);

    }
}


// ============================================
// DISPLAY ADDRESS SUGGESTIONS
// ============================================

function displaySuggestions(features) {

    if (!addressSuggestions) return;

    addressSuggestions.innerHTML = "";

    if (!features || features.length === 0) {

        addressSuggestions.style.display = "none";

        return;
    }

    features.forEach(feature => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "address-suggestion";

        button.textContent =
            feature.properties?.full_address ||
            feature.properties?.name ||
            "Address";

        button.addEventListener("click", () => {

            selectAddress(feature);

        });

        addressSuggestions.appendChild(button);

    });

    addressSuggestions.style.display = "block";
}


// ============================================
// SELECT ADDRESS
// ============================================

function selectAddress(feature) {

    const coordinates = feature.geometry.coordinates;

    const longitude = coordinates[0];
    const latitude = coordinates[1];

    const address =
        feature.properties?.full_address ||
        feature.properties?.name ||
        "";

    if (addressInput) {
        addressInput.value = address;
    }

    if (addressSuggestions) {
        addressSuggestions.innerHTML = "";
        addressSuggestions.style.display = "none";
    }

    checkServiceArea(latitude, longitude);

    showMap(latitude, longitude, address);
}


// ============================================
// CHECK SERVICE AREA
// ============================================

function checkServiceArea(latitude, longitude) {

    const distance = calculateDistance(
        SERVICE_LAT,
        SERVICE_LNG,
        latitude,
        longitude
    );

    const roundedDistance = Math.round(distance * 10) / 10;

    if (!serviceStatus) return;

    if (distance <= SERVICE_RADIUS_MILES) {

        serviceStatus.className = "service-status eligible";

        serviceStatus.innerHTML = `
            <strong>✓ You're within our service area</strong>
            <span>
                Approximately ${roundedDistance} miles from our service area.
            </span>
        `;

    } else {

        serviceStatus.className = "service-status not-eligible";

        serviceStatus.innerHTML = `
            <strong>✕ Outside our current service area</strong>
            <span>
                This address is approximately ${roundedDistance} miles away.
                Brightside currently services locations within 30 miles.
            </span>
        `;

    }
}


// ============================================
// SHOW MAP
// ============================================

function showMap(latitude, longitude, address) {

    if (!mapContainer) return;

    mapContainer.innerHTML = "";

    const iframe = document.createElement("iframe");

    iframe.width = "100%";
    iframe.height = "100%";
    iframe.style.border = "0";
    iframe.style.borderRadius = "16px";

    iframe.loading = "lazy";

    iframe.src =
        `https://www.mapbox.com/` +
        `?center=${longitude},${latitude}` +
        `&zoom=13`;

    /*
        NOTE:
        Mapbox's interactive map requires the Mapbox GL JS
        library for a fully interactive map.

        The address checking itself works independently.
    */

    mapContainer.appendChild(iframe);
}
