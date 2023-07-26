const searchBtn = document.querySelector(".search button");
const locationBtn = document.querySelector(".location");
const cityInput = document.querySelector(".city-input");
const weatherCardsDiv = document.querySelector(".upperrow");
const weatherCardsDivL = document.querySelector(".lowerrow");

const API_KEY = "195d4c897217862f4699799ee4484c53";

const createWeatherCard = (weatherItem) => {
    return `<div class="card">
        <img src=" https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon" class="card-image">
        <p class="date">${weatherItem.dt_txt.split(" ")[0]}</p>
        <p class="temp">Temprature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
        <p class="wind">Wind : ${weatherItem.wind.speed}m/s</p>
        <p class="humility">Humidity : ${weatherItem.main.humidity}%</p>
        </div>
    `;

}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        const uniqueForecastDays = [];

        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        weatherCardsDiv.innerHTML = "";
        weatherCardsDivL.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem,index) => {
            if(index===5 || index===4){
                weatherCardsDivL.insertAdjacentHTML("beforeend", createWeatherCard(weatherItem));
            }
            if(index===1 || index===2 || index===3){
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(weatherItem));
                
            }
            if(index===0){
                const temprature = document.getElementById("curr-temp");
                const humidity = document.getElementById("curr-humidity");
                const wind = document.getElementById("curr-wind");
                const city = document.querySelector(".city");
                temprature.innerHTML = "";
                humidity.innerHTML = "";
                wind.innerHTML = "";
                city.innerHTML = "";
                temprature.innerHTML = `<h1 class="temp" id="curr-temp">${(weatherItem.main.temp - 273.15).toFixed(2)}°c</h1>`;
                humidity.innerHTML = `<p class="humidity" id="curr-humidity">${weatherItem.main.humidity}%</p>`;
                wind.innerHTML = `<p class="wind" id="curr-wind">${weatherItem.wind.speed} m/s</p>`;
                city.innerHTML = `<h2 class="city">${cityName}</h2>`;
            }

        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // Get user enterd city name and remove extra sapce
    if (!cityName) return;

    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city!");
            });
        }, 
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
}

searchBtn.addEventListener("click", getCityCoordinates);
locationBtn.addEventListener("click", getUserCoordinates);
