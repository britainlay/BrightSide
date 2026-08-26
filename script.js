document.addEventListener("DOMContentLoaded", function () {

    const vehicleType = document.getElementById("vehicle-size");

    const serviceCards = document.querySelectorAll(
        'input[name="service"]'
    );

    if (!vehicleType) {
        return;
    }


    const prices = {

        express: {
            sedan: 75,
            suv: 85,
            truck: 95
        },

        interior: {
            sedan: 100,
            suv: 115,
            truck: 130
        },

        "full-detail": {
            sedan: 150,
            suv: 175,
            truck: 200
        }

    };


    function updatePrices() {

        const vehicle = vehicleType.value;

        if (!vehicle) {
            return;
        }

        serviceCards.forEach(function (radio) {

            const service = radio.value;

            const priceElement =
                radio.parentElement.querySelector(
                    ".service-card-content strong"
                );

            if (
                priceElement &&
                prices[service] &&
                prices[service][vehicle]
            ) {

                priceElement.textContent =
                    "From $" + prices[service][vehicle];

            }

        });

    }


    vehicleType.addEventListener(
        "change",
        updatePrices
    );
    // ========================================
// BOOKING PAGE - DYNAMIC PRICING
// ========================================

const vehicleSize = document.getElementById("vehicle-size");

if (vehicleSize) {

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


    vehicleSize.addEventListener("change", function () {

        const selectedVehicle = this.value;

        const priceElements =
            document.querySelectorAll(".dynamic-price");


        // Nothing selected yet
        if (!selectedVehicle) {

            priceElements.forEach(function (price) {

                price.textContent = "Choose vehicle";

            });

            return;

        }


        // Update each service price
        priceElements.forEach(function (price) {

            const service = price.dataset.service;

            const amount =
                prices[selectedVehicle][service];

            price.textContent = `From $${amount}`;

        });

    });

}

});
