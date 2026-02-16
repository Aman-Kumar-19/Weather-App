// --- Selectors ---
const heroCard = document.querySelector('.hero-card');
const cityOutput = document.querySelector('.city-name');
const tempOutput = document.querySelector('.temp');
const conditionOutput = document.querySelector('.weather-condition');
const iconOutput = document.querySelector('.weather-icon-hero');
const currentDateOutput = document.querySelector('.current-date');
const currentTimeOutput = document.querySelector('.current-time');

const feelsLikeOutput = document.querySelector('.feels-like');
const sunsetOutput = document.querySelector('.sunset-time');
const sunriseOutput = document.querySelector('.sunrise-time');

const humidityOutput = document.querySelector('.humidity-val');
const humidityBar = document.getElementById('humidity-bar');

const windSpeedOutput = document.querySelector('.wind-speed-val');
const windDirText = document.querySelector('.wind-dir-text');
const windArrow = document.getElementById('wind-icon');

const cloudOutput = document.querySelector('.cloud-val');
const cloudBar = document.getElementById('cloud-bar');

const visibilityOutput = document.querySelector('.visibility-val');
const pressureOutput = document.querySelector('.pressure-val');
const dewOutput = document.querySelector('.dew-val');

const forecastContainer = document.getElementById('forecast-scroll');
const suggestionsBox = document.getElementById('suggestionsBox');
const searchInput = document.getElementById('searchInput');
const form = document.getElementById('locationInput');

let cityInput = "London";

// --- SEARCH SUGGESTIONS ---
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length < 3) {
        suggestionsBox.classList.remove('active');
        return;
    }
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`);
        const data = await response.json();
        if (data.results) {
            suggestionsBox.innerHTML = '';
            data.results.forEach(city => {
                const item = document.createElement('div');
                item.classList.add('suggestion-item');
                item.textContent = `${city.name}, ${city.country}`;
                item.addEventListener('click', () => {
                    searchInput.value = city.name;
                    cityInput = city.name;
                    suggestionsBox.classList.remove('active');
                    fetchWeatherData();
                });
                suggestionsBox.appendChild(item);
            });
            suggestionsBox.classList.add('active');
        }
    } catch (error) { console.error("Error fetching suggestions:", error); }
});

document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) suggestionsBox.classList.remove('active');
});

// --- WEATHER LOGIC ---
function getCustomIcon(code) {
    const iconMap = {
        '01d': 'clear-day', '01n': 'clear-night',
        '02d': 'partly-cloudy-day', '02n': 'partly-cloudy-night',
        '03d': 'cloudy', '03n': 'cloudy',
        '04d': 'overcast-day', '04n': 'overcast-night',
        '09d': 'rain', '09n': 'rain',
        '10d': 'partly-cloudy-day-rain', '10n': 'partly-cloudy-night-rain',
        '11d': 'thunderstorms-day', '11n': 'thunderstorms-night',
        '13d': 'snow', '13n': 'snow',
        '50d': 'mist', '50n': 'mist'
    };
    return `https://basmilius.github.io/weather-icons/production/fill/all/${iconMap[code] || 'not-available'}.svg`;
}

function updateDateTime() {
    const date = new Date();
    currentDateOutput.innerHTML = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
    currentTimeOutput.innerHTML = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
setInterval(updateDateTime, 1000);
updateDateTime();

function fetchWeatherData() {
    const apiKey = "dda14ddfd62cf36c86183fe30624b573";
    const currentApi = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${cityInput}&appid=${apiKey}`;
    const forecastApi = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${cityInput}&appid=${apiKey}`;

    fetch(currentApi)
        .then(res => res.ok ? res.json() : Promise.reject('City not found'))
        .then(data => {
            updateCurrentWeather(data);
            return fetch(forecastApi);
        })
        .then(res => res.json())
        .then(data => updateForecast(data))
        .catch(err => alert(err));
}

function updateCurrentWeather(data) {
    cityOutput.innerHTML = data.name;
    tempOutput.innerHTML = `${Math.round(data.main.temp)}°`;
    conditionOutput.innerHTML = data.weather[0].description;

    // ... inside updateCurrentWeather function ...

    // --- 3D Icon for Hero Section (LOCAL) ---
    const iconCode = data.weather[0].icon;

    // CHANGE THIS LINE:
    iconOutput.src = `assets/${iconCode}.png`;

    iconOutput.alt = data.weather[0].description;

// ... rest of code

    // Dynamic Background
    let weatherType = 'Clear';
    if (iconCode.includes('01') || iconCode.includes('02')) weatherType = 'Clear';
    else if (iconCode.includes('03') || iconCode.includes('04')) weatherType = 'Clouds';
    else if (iconCode.includes('09') || iconCode.includes('10')) weatherType = 'Rain';
    else if (iconCode.includes('11')) weatherType = 'Thunder';
    else if (iconCode.includes('13')) weatherType = 'Snow';
    heroCard.setAttribute('data-weather', weatherType);

    feelsLikeOutput.innerHTML = `${Math.round(data.main.feels_like)}°`;

    const sunrise = new Date((data.sys.sunrise + data.timezone) * 1000);
    const sunset = new Date((data.sys.sunset + data.timezone) * 1000);
    sunriseOutput.innerHTML = sunrise.toLocaleTimeString('en-US', {timeZone:'UTC', hour:'2-digit', minute:'2-digit'});
    sunsetOutput.innerHTML = sunset.toLocaleTimeString('en-US', {timeZone:'UTC', hour:'2-digit', minute:'2-digit'});

    humidityOutput.innerHTML = `${data.main.humidity}%`;
    humidityBar.style.width = `${data.main.humidity}%`;

    windSpeedOutput.innerHTML = `${(data.wind.speed * 3.6).toFixed(1)}`;
    const deg = data.wind.deg;
    windArrow.style.transform = `rotate(${deg}deg)`;
    const compass = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    windDirText.innerHTML = compass[Math.floor((deg / 22.5) + 0.5) % 16];

    cloudOutput.innerHTML = `${data.clouds.all}%`;
    cloudBar.style.width = `${data.clouds.all}%`;

    visibilityOutput.innerHTML = `${(data.visibility / 1000).toFixed(1)} km`;
    pressureOutput.innerHTML = `${data.main.pressure} hPa`;

    const dew = data.main.temp - ((100 - data.main.humidity) / 5);
    dewOutput.innerHTML = `${Math.round(dew)}°`;
}

function updateForecast(data) {
    forecastContainer.innerHTML = '';
    data.list.slice(0, 8).forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        const desc = item.weather[0].main;

        const div = document.createElement('div');
        div.classList.add('forecast-item');
        div.innerHTML = `
            <span class="f-time">${time}</span>
            <img src="${getCustomIcon(item.weather[0].icon)}" class="f-icon" alt="${desc}">
            <span class="f-desc">${desc}</span>
            <span class="f-temp">${Math.round(item.main.temp)}°</span>
        `;
        forecastContainer.appendChild(div);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (searchInput.value.length === 0) return;
    cityInput = searchInput.value;
    suggestionsBox.classList.remove('active');
    fetchWeatherData();
});

fetchWeatherData();