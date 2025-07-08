const apiKey = "bd073888cd875d36c7fab53c5a77d726";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl =
  "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchInput = document.querySelector("#search input");
const searchBtn = document.querySelector("#search button");
const icon = document.querySelector(".weather-info img");
const forecastCardsContainer = document.getElementById("forecast-cards");

// Check current weather
async function checkWeather(city) {
  const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

  if (response.status == 404) {
    document.querySelector(".error").style.display = "block";
    document.querySelector("#weather").style.display = "none";
    forecastCardsContainer.innerHTML = ""; // clear forecast
  } else {
    const data = await response.json();

    // Display current weather
    document.querySelector("#weatherHere").innerHTML =
      Math.round(data.main.temp) + "°C";
    document.querySelector("#cityname").innerHTML =
      data.name + ", " + data.sys.country;
    document.querySelector("#humidity").innerHTML = data.main.humidity + "%";
    document.querySelector("#wind").innerHTML = data.wind.speed + " km/h";

    // Set weather icon
    const weatherType = data.weather[0].main.toLowerCase();
    switch (weatherType) {
      case "clouds":
        icon.src = "./images/clouds.png";
        break;
      case "mist":
        icon.src = "./images/mist.png";
        break;
      case "drizzle":
        icon.src = "./images/drizzle.png";
        break;
      case "rain":
        icon.src = "./images/rain.png";
        break;
      case "snow":
        icon.src = "./images/snow.png";
        break;
      case "humidity":
        icon.src = "./images/humidity.png";
        break;
      default:
        icon.src = "./images/clear.png";
    }

    document.querySelector("#weather").style.display = "flex";
    document.querySelector(".error").style.display = "none";

    // Fetch and display forecast
    fetchForecast(city);
  }
}

// Fetch and display 4-day forecast
async function fetchForecast(city) {
  try {
    const res = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    const data = await res.json();
    renderForecastCards(data.list);
  } catch (error) {
    forecastCardsContainer.innerHTML =
      "<p class='text-white'>Error fetching forecast.</p>";
  }
}

// Render forecast cards dynamically
function renderForecastCards(forecastList) {
  forecastCardsContainer.innerHTML = "";

  const dailyForecast = [];
  const seenDates = new Set();

  for (let i = 0; i < forecastList.length; i++) {
    const entry = forecastList[i];
    const date = entry.dt_txt.split(" ")[0];

    if (!seenDates.has(date)) {
      seenDates.add(date);
      dailyForecast.push(entry);
    }

    if (dailyForecast.length === 4) break;
  }

  dailyForecast.forEach((item, index) => {
    const date = item.dt_txt.split(" ")[0];
    const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
    const temp = item.main.temp;
    const humidity = item.main.humidity;
    const wind = item.wind.speed;

    const card = document.createElement("div");
    card.className = "bg-black/30 text-white p-4 rounded-xl";

    card.innerHTML = `
      <p class="text-lg font-semibold mb-2">Day ${index + 1} - ${date}</p>
      <img src="${iconUrl}" alt="Forecast Icon" class="w-14 mb-2" />
      <p>Temp: ${temp.toFixed(1)} °C</p>
      <p>Humidity: ${humidity}%</p>
      <p>Wind: ${wind} km/h</p>
    `;

    forecastCardsContainer.appendChild(card);
  });
}

// Event listener
searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  const errorBox = document.querySelector(".error");

  // Regex to allow letters, spaces, and hyphens only (valid city name pattern)
  const cityNamePattern = /^[a-zA-Z\s-]+$/;

  // Empty input check
  if (city === "") {
    errorBox.style.display = "block";
    errorBox.innerHTML = "<h1>Please enter a city name.</h1>";
    document.querySelector("#weather").style.display = "none";
    forecastCardsContainer.innerHTML = "";
    return;
  }

  // Invalid format check (e.g., numbers or special chars)
  if (!cityNamePattern.test(city)) {
    errorBox.style.display = "block";
    errorBox.innerHTML =
      "<h1>Please enter a valid city name (letters only).</h1>";
    document.querySelector("#weather").style.display = "none";
    forecastCardsContainer.innerHTML = "";
    return;
  }

  // Clear previous errors
  errorBox.style.display = "none";

  // Make API request
  checkWeather(city);
});
