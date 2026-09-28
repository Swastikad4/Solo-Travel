import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const WeatherWidget = ({ destination }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeather = useCallback(async () => {
    if (!destination) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/weather/${encodeURIComponent(destination)}`);
      if (res.data?.success) {
        setWeatherData(res.data);
      }
    } catch (err) {
      setError("Unable to load live weather.");
    } finally {
      setLoading(false);
    }
  }, [destination]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  if (loading) {
    return (
      <div className="weather-widget-card loading-state">
        <div className="weather-spinner"></div>
        <p>Fetching real-time weather & forecast for {destination}...</p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="weather-widget-card error-state">
        <p>⚠️ {error || "Live weather unavailable"}</p>
        <button type="button" className="btn-retry-weather" onClick={fetchWeather}>
          🔄 Retry
        </button>
      </div>
    );
  }

  const { current, forecast, travelSuggestions } = weatherData;

  return (
    <div className="weather-widget-wrapper">
      {/* Current Weather Card */}
      <div className="current-weather-banner">
        <div className="current-weather-left">
          <div className="weather-icon-large">{current.icon}</div>
          <div>
            <div className="weather-temp-huge">
              {current.temperature}
              <span className="temp-unit">°C</span>
            </div>
            <div className="weather-condition-text">{current.condition}</div>
            <div className="weather-dest-name">📍 {destination}</div>
          </div>
        </div>

        <div className="current-weather-metrics">
          <div className="weather-metric-item">
            <span className="metric-icon">💧</span>
            <div>
              <span className="metric-val">{current.humidity}</span>
              <span className="metric-lbl">Humidity</span>
            </div>
          </div>
          <div className="weather-metric-item">
            <span className="metric-icon">💨</span>
            <div>
              <span className="metric-val">{current.windSpeed}</span>
              <span className="metric-lbl">Wind Speed</span>
            </div>
          </div>
          <button type="button" className="btn-refresh-weather" onClick={fetchWeather} title="Refresh Live Weather">
            🔄 Live Refresh
          </button>
        </div>
      </div>

      {/* Weather-Driven Travel Suggestions */}
      {travelSuggestions && travelSuggestions.length > 0 && (
        <div className="weather-suggestions-banner">
          <div className="suggestions-header">
            <span className="sugg-icon">💡</span>
            <strong>Weather-Aware Travel Advice for {destination}:</strong>
          </div>
          <ul className="suggestions-list">
            {travelSuggestions.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 5-Day Forecast Grid */}
      <div className="forecast-section">
        <h5 className="forecast-title">5-Day Weather Forecast</h5>
        <div className="forecast-cards-grid">
          {forecast?.map((day, idx) => (
            <div key={idx} className={`forecast-day-card ${idx === 0 ? "today-card" : ""}`}>
              <span className="forecast-day-name">{day.dayName}</span>
              <span className="forecast-day-date">{day.date.split("-").slice(1).join("/")}</span>
              <span className="forecast-day-icon">{day.icon}</span>
              <span className="forecast-day-condition">{day.condition}</span>
              <div className="forecast-temps">
                <span className="temp-max">{day.maxTemp}°</span>
                <span className="temp-min">{day.minTemp}°</span>
              </div>
              <span className="forecast-precip">💧 {day.precipitationChance}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
