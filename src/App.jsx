import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Wind,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  RefreshCw,
} from "lucide-react";
import "./App.css";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherCache, setWeatherCache] = useState({});

  const mapWmoToWeather = (code) => {
    if (code === 0) return { main: "Clear", description: "Clear sky" };
    if ([1, 2, 3].includes(code))
      return { main: "Clouds", description: "Cloudy" };
    if ([45, 48].includes(code))
      return { main: "Clouds", description: "Foggy" };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
      return { main: "Rain", description: "Rainy" };
    if ([95, 96, 99].includes(code))
      return { main: "Lightning", description: "Thunderstorm" };
    return { main: "Clear", description: "Clear" };
  };

  const fetchWeather = async (lat, lon, cityName = null) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch weather data from Open-Meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`,
      );
      const weatherDataRaw = await weatherRes.json();

      // 2. If cityName isn't provided, reverse geocode to get it
      let finalCityName = cityName;
      if (!finalCityName) {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        );
        const geoData = await geoRes.json();
        finalCityName =
          geoData.address.city ||
          geoData.address.town ||
          geoData.address.village ||
          "Current Location";
      }

      const { current_weather } = weatherDataRaw;
      const weatherInfo = mapWmoToWeather(current_weather.weathercode);

      const newWeatherData = {
        name: finalCityName,
        main: {
          temp: Math.round(current_weather.temperature),
          humidity: weatherDataRaw.hourly.relativehumidity_2m[0], // approximate current humidity
        },
        wind: {
          speed: current_weather.windspeed,
        },
        weather: [
          {
            main: weatherInfo.main,
            description: weatherInfo.description,
          },
        ],
      };

      setWeatherData(newWeatherData);

      // Cache the result using the lowercase city name as key
      if (finalCityName) {
        setWeatherCache((prev) => ({
          ...prev,
          [finalCityName.toLowerCase()]: newWeatherData,
        }));
      }
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const searchCity = city.trim().toLowerCase();
    if (!searchCity) return;

    // Check cache first
    if (weatherCache[searchCity]) {
      setWeatherData(weatherCache[searchCity]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use Open-Meteo Geocoding API to find coordinates for the city
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${searchCity}&count=1&language=en&format=json`,
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name } = geoData.results[0];
      await fetchWeather(latitude, longitude, name);
    } catch (err) {
      setError("Error searching for city");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("User denied the location access");
        } else {
          setError("Unable to fetch location");
        }
        setLoading(false);
      },
    );
  }, []);

  const getWeatherIcon = (main) => {
    switch (main) {
      case "Clear":
        return <Sun size={48} />;
      case "Clouds":
        return <Cloud size={48} />;
      case "Rain":
        return <CloudRain size={48} />;
      case "Lightning":
        return <CloudLightning size={48} />;
      default:
        return <Sun size={48} />;
    }
  };

  const getTodayDate = () => {
    const options = { weekday: "long", day: "numeric", month: "long" };
    return new Date().toLocaleDateString("en-US", options);
  };

  return (
    <div className="app-container">
      <div className="weather-card">
        <div className="search-header">
          <form onSubmit={handleSearch} className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </form>
          <button
            className="location-btn"
            onClick={() => {
              setLoading(true);
              navigator.geolocation.getCurrentPosition(
                (pos) =>
                  fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => {
                  setError("Location denied");
                  setLoading(false);
                },
              );
            }}
            title="Use current location"
          >
            <MapPin size={20} />
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <span className="loader"></span>
            <p>Fetching weather atmosphere...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-msg">{error}</p>
            <button
              className="retry-btn"
              onClick={() => {
                setCity("");
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        ) : (
          weatherData && (
            <div className="weather-content">
              <div className="weather-main">
                <div className="weather-header">
                  <h1 className="city-name">
                    <MapPin
                      size={24}
                      style={{ display: "inline", marginRight: "8px" }}
                    />
                    {weatherData.name}
                  </h1>
                  <p className="weather-date">{getTodayDate()}</p>
                </div>

                <div className="weather-temp-container">
                  <div className="weather-icon-main">
                    {getWeatherIcon(weatherData.weather[0].main)}
                  </div>

                  <div className="temp-wrapper">
                    <div className="temp-value">{weatherData.main.temp}</div>
                    <span className="temp-unit">°C</span>
                  </div>
                  <p className="weather-desc">
                    {weatherData.weather[0].description}
                  </p>
                </div>
              </div>

              <div className="weather-stats">
                <div className="stat-item">
                  <div className="stat-icon">
                    <Wind size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {weatherData.wind.speed} km/h
                    </span>
                    <span className="stat-label">Wind Speed</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <Droplets size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {weatherData.main.humidity}%
                    </span>
                    <span className="stat-label">Humidity</span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default WeatherApp;
