const app = document.querySelector('.weather-app');
const temp = document.querySelector('.temp');
const dateOutput = document.querySelector('.date');
const timeOutput = document.querySelector('.time');
const conditionOutput = document.querySelector('.condition');
const nameOutput = document.querySelector('.name');
const icon = document.querySelector('.icon');
const cloudOutput = document.querySelector('.cloud');
const humidityOutput = document.querySelector('.humidity');
const windOutput = document.querySelector('.wind');
const form = document.getElementById('locationInput');
const search = document.querySelector('.search');
const btn = document.querySelector('.submit');
const cities = document.querySelectorAll('.city');

// Default city when the page loads
let cityInput = "Delhi";

// Add click event to each city in the panel
cities.forEach((city) => {
    city.addEventListener('click', (e) => {
        // Change from default city to the clicked one
        cityInput = e.target.innerHTML;
        // Fade out the app 
        app.style.opacity = "0";
        // Function that fetches and displays all the data from the weather API
        setTimeout(fetchWeatherData, 500); // Delay execution by 500 milliseconds
    });
});

// Add submit event to the form
form.addEventListener('submit', (e) => {
    // If the input field (search bar) is empty, throw an alert
    if (search.value.length == 0) {
        alert('Please type in a city name');
    } else {
        // Change the default city to the one written in the input field
        cityInput = search.value;
        // Remove all text from the input field
        search.value = "";
        // Fade out the app
        app.style.opacity = "0";
        // Function that fetches and displays all the data from the weather API
        setTimeout(fetchWeatherData, 500); // Delay execution by 500 milliseconds
    }
    // Prevents the default behavior of the form 
    e.preventDefault();
});


// Function that returns a day of the week (Monday, Tuesday, Friday) from a date
function dayOfTheWeek(day, month, year) {
    const weekday = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    return weekday[new Date(`${day}/${month}/${year}`).getDay()];
}

// Function that fetches and displays the data from the weather API
function fetchWeatherData() {
    // Fetch the data and dynamically add the city name with template literals
    const apiKey = "dda14ddfd62cf36c86183fe30624b573";
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${cityInput}&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // You can console log the data to see
            console.log(data);
            // Let's start by adding temperature and weather condition to the page
            temp.innerHTML = `${data.main.temp} &#176;C`;
            conditionOutput.innerHTML = data.weather[0].description;

            // Get the date and time from the city and extract the day, month, year, and time into individual variables
            const date = new Date(); // Convert timestamp to milliseconds
            const y = date.getFullYear();
            const m = date.getMonth() + 1; // Months are 0-indexed
            const d = date.getDate();
            const time = `${date.getHours()}:${date.getMinutes()}`;
            const day = date.getDay(); // Get the day of the week

            // Reformat the date into something more appealing and add it to the page
            dateOutput.innerHTML = `${dayOfTheWeek(day, m, d, y)} ${d},${m} ${y}`;
            timeOutput.innerHTML = `${date.getHours()}:${date.getMinutes()}`;   

            // Add the name of the city into the page
            nameOutput.innerHTML = data.name;

            // Add the weather details to the page
            cloudOutput.innerHTML = `${data.clouds.all}%`;
            humidityOutput.innerHTML = `${data.main.humidity}%`;
            windOutput.innerHTML = `${data.wind.speed} m/s`;

            // Set default time of day
            let timeOfDay = "day";
            // Get the unique id for each weather condition
            const weatherMain = data.weather[0].main.toLowerCase();
            // Change to night if it's night time in the city
            if (date.getHours() < 6 || date.getHours() >= 18) {
                timeOfDay = "night";
            }
            // Get the corresponding icon URL
            const iconId = data.weather[0].icon;
           // Get the corresponding icon code from the API response
            const iconCode = data.weather[0].icon;

            // Construct the URL for the weather icon based on the icon code
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

            // Set the source attribute of the icon element
            icon.src = iconUrl;


            // Set the background image based on weather conditions
            const weatherId = data.weather[0].id;

            if (weatherId === 800) {
                // Clear sky
                app.style.backgroundImage = `url(./images/${timeOfDay}/clear.jpg)`;
                btn.style.background = "#e5ba92";
                if (timeOfDay === "night") {
                    btn.style.background = "#181e27";
                }
            }else if (weatherId === 741 || weatherId === 711 || weatherId === 762) {
                // Foggy or Smoky weather
                app.style.backgroundImage = `url(./images/${timeOfDay}/fogy.jpg)`;
                btn.style.background = "#647d75";
                if (timeOfDay === "night") {
                    btn.style.background = "#325c80";
                }

            } else if (weatherId >= 801 && weatherId <= 804) {
                // Cloudy weather
                app.style.backgroundImage = `url(./images/${timeOfDay}/cloudy.jpg)`;
                btn.style.background = "#fa6d1b";
                if (timeOfDay === "night") {
                    btn.style.background = "#181e27";
                }
            } else if (weatherId >= 500 && weatherId <= 531) {
                // Rainy weather
                app.style.backgroundImage = `url(./images/${timeOfDay}/rainy.jpg)`;
                btn.style.background = "#647d75";
                if (timeOfDay === "night") {
                    btn.style.background = "#325c80";
                }
            } else if (weatherId >= 600 && weatherId <= 622) {
                // Snowy weather
                app.style.backgroundImage = `url(./images/${timeOfDay}/snowy.jpg)`;
                btn.style.background = "#4d72aa";
                if (timeOfDay === "night") {
                    btn.style.background = "#1b1b1b";
                }
            }

            // Fade in the page once all is done
            app.style.opacity = "1";
        })
        // If the user types a city that doesn't exist, throw an error
        .catch(() => {
            alert('City not found, please try again');
            app.style.opacity = "1";
        });
}

// Call the function
fetchWeatherData();
// Fade in the page
app.style.opacity = "1";

const API_KEY = "YOUR_OPENWEATHER_API_KEY";

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const form = document.getElementById("locationInput");

let debounceTimer;

// 🔍 Autocomplete while typing
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = searchInput.value.trim();

  if (query.length < 2) {
    suggestions.innerHTML = "";
    return;
  }

  debounceTimer = setTimeout(() => {
    fetchCitySuggestions(query);
  }, 300);
});

async function fetchCitySuggestions(query) {
  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=6&appid=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    suggestions.innerHTML = "";

    data.forEach(city => {
      const li = document.createElement("li");
      li.textContent = `${city.name}, ${city.country}`;

      li.addEventListener("click", () => {
        searchInput.value = city.name;
        suggestions.innerHTML = "";

        // BEST PRACTICE
        fetchWeatherByCoords(city.lat, city.lon);
      });

      suggestions.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// Prevent form submit reload
form.addEventListener("submit", (e) => {
  e.preventDefault();
});

// Hide suggestions on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest("#locationInput")) {
    suggestions.innerHTML = "";
  }
});
