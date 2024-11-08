import axios from 'axios';
// form fields
const form = document.querySelector('.form-data');
const regionFields = document.querySelectorAll('.region-name');
const apiKeyField = document.querySelector('.api-key');
// results
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const resultContainers = document.querySelectorAll('.result-container');
const usageFields = [
    document.querySelector('.carbon-usage1'),
    document.querySelector('.carbon-usage2'),
    document.querySelector('.carbon-usage3')
];
const fossilFuelFields = [
    document.querySelector('.fossil-fuel1'),
    document.querySelector('.fossil-fuel2'),
    document.querySelector('.fossil-fuel3')
];
const regionDisplayFields = [
    document.querySelector('.my-region1'),
    document.querySelector('.my-region2'),
    document.querySelector('.my-region3')
];
const clearBtn = document.querySelector('.clear-btn');

const calculateColor = async (value) => {
    let co2Scale = [0, 150, 600, 750, 800];
    let colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02'];
    let closestNum = co2Scale.sort((a, b) => {
        return Math.abs(a - value) - Math.abs(b - value);
    })[0];
    let num = (element) => element > closestNum;
    let scaleIndex = co2Scale.findIndex(num);
    let closestColor = colors[scaleIndex];
    chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: closestColor } });
};

const displayCarbonUsage = async (apiKey, region, index) => {
    try {
        await axios
            .get('https://api.co2signal.com/v1/latest', {
                params: { countryCode: region },
                headers: { 'auth-token': apiKey },
            })
            .then((response) => {
                let CO2 = Math.floor(response.data.data.carbonIntensity);
                calculateColor(CO2);
                loading.style.display = 'none';
                form.style.display = 'none';
                regionDisplayFields[index].textContent = region;
                usageFields[index].textContent =
                    Math.round(response.data.data.carbonIntensity) + ' grams (grams C02 emitted per kilowatt hour)';
                fossilFuelFields[index].textContent =
                    response.data.data.fossilFuelPercentage.toFixed(2) +
                    '% (percentage of fossil fuels used to generate electricity)';
                resultContainers[index].style.display = 'block';
            });
    } catch (error) {
        console.log(error);
        loading.style.display = 'none';
        resultContainers[index].style.display = 'none';
        errors.textContent = `Sorry, we have no data for ${region}.`;
    }
};

function setUpUser(apiKey, regions) {
    localStorage.setItem('apiKey', apiKey);
    regions.forEach((region, index) => localStorage.setItem(`region${index + 1}`, region));
    loading.style.display = 'block';
    errors.textContent = '';
    clearBtn.style.display = 'block';

    regions.forEach((region, index) => {
        if (region) displayCarbonUsage(apiKey, region, index);
    });
}

function handleSubmit(e) {
    e.preventDefault();
    const apiKey = apiKeyField.value;
    const regions = Array.from(regionFields).map((field) => field.value);
    setUpUser(apiKey, regions);
}

function init() {
    const storedApiKey = localStorage.getItem('apiKey');
    const storedRegions = [
        localStorage.getItem('region1'),
        localStorage.getItem('region2'),
        localStorage.getItem('region3')
    ];

    if (!storedApiKey || storedRegions.every((region) => !region)) {
        form.style.display = 'block';
        resultContainers.forEach((container) => (container.style.display = 'none'));
        loading.style.display = 'none';
        clearBtn.style.display = 'none';
        errors.textContent = '';
    } else {
        storedRegions.forEach((region, index) => {
            if (region) displayCarbonUsage(storedApiKey, region, index);
        });
        form.style.display = 'none';
        clearBtn.style.display = 'block';
    }

    chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: 'green' } });
}

function reset(e) {
    e.preventDefault();
    localStorage.clear();
    init();
}

form.addEventListener('submit', handleSubmit);
clearBtn.addEventListener('click', reset);

init();
