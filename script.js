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

});
