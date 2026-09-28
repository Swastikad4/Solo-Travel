const { resolveCoordinates } = require("./geoService");

// Weather condition codes mapping (WMO Weather interpretation codes)
const WMO_CODE_MAP = {
  0: { condition: "Clear Sky", icon: "☀️", travelTip: "Perfect clear skies! Great for outdoor sightseeing, photography & trekking." },
  1: { condition: "Mainly Clear", icon: "🌤️", travelTip: "Pleasant sunny weather with light clouds. Ideal for day exploration." },
  2: { condition: "Partly Cloudy", icon: "⛅", travelTip: "Comfortable weather for walking tours and outdoor cafe breaks." },
  3: { condition: "Overcast", icon: "☁️", travelTip: "Cool diffused sunlight. Carry a light windcheater." },
  45: { condition: "Foggy / Mist", icon: "🌫️", travelTip: "Morning fog in hills/plains. Drive carefully and start mountain treks after 8:30 AM." },
  48: { condition: "Depositing Rime Fog", icon: "🌫️", travelTip: "Chilly mist. Keep thermal gloves & jacket handy." },
  51: { condition: "Light Drizzle", icon: "🌦️", travelTip: "Light passing showers. Carry an umbrella or waterproof daypack." },
  53: { condition: "Moderate Drizzle", icon: "🌧️", travelTip: "Intermittent rain. Good day for indoor palaces, museums & cozy cafes." },
  55: { condition: "Dense Drizzle", icon: "🌧️", travelTip: "Keep rain poncho ready and wear non-slippery walking shoes." },
  61: { condition: "Slight Rain", icon: "🌧️", travelTip: "Pack a waterproof dry bag for your phone & camera." },
  63: { condition: "Moderate Rain", icon: "🌧️", travelTip: "Wet trails. Be cautious on slippery stone steps and ghats." },
  65: { condition: "Heavy Rain", icon: "⛈️", travelTip: "Heavy rainfall alert. Avoid high mountain passes and fast-flowing streams." },
  71: { condition: "Slight Snowfall", icon: "🌨️", travelTip: "Fresh Himalayan snow! Wear insulated waterproof snow boots." },
  73: { condition: "Moderate Snowfall", icon: "❄️", travelTip: "Snow accumulation on high passes. Check road and Atal tunnel status." },
  75: { condition: "Heavy Snowfall", icon: "❄️", travelTip: "Winter wonderland! Stay in warm heated stays and keep thermal layers." },
  80: { condition: "Rain Showers", icon: "🌦️", travelTip: "Short tropical showers. Enjoy roadside hot pakoras and tea!" },
  95: { condition: "Thunderstorm", icon: "⛈️", travelTip: "Stay indoors during lightning; avoid open ridges and lake waters." }
};

// Regional climate profile fallbacks for Indian destinations
const REGIONAL_CLIMATE_FALLBACKS = {
  manali: { temp: 14, min: 6, max: 19, condition: "Partly Cloudy", icon: "⛅", humidity: 62, windSpeed: 8, elevation: "2,050 m" },
  jaipur: { temp: 28, min: 18, max: 33, condition: "Sunny & Clear", icon: "☀️", humidity: 40, windSpeed: 12, elevation: "431 m" },
  rishikesh: { temp: 24, min: 15, max: 29, condition: "Pleasant & Clear", icon: "🌤️", humidity: 55, windSpeed: 7, elevation: "372 m" },
  varanasi: { temp: 27, min: 19, max: 32, condition: "Warm & Sunny", icon: "☀️", humidity: 48, windSpeed: 9, elevation: "81 m" },
  munnar: { temp: 18, min: 12, max: 23, condition: "Misty & Mild", icon: "🌫️", humidity: 75, windSpeed: 6, elevation: "1,600 m" },
  goa: { temp: 30, min: 24, max: 33, condition: "Tropical Sea Breeze", icon: "🏖️", humidity: 72, windSpeed: 14, elevation: "10 m" },
  hampi: { temp: 31, min: 21, max: 35, condition: "Sunny & Warm", icon: "☀️", humidity: 45, windSpeed: 11, elevation: "467 m" },
  leh: { temp: 8, min: -2, max: 14, condition: "Crisp Alpine Sun", icon: "❄️", humidity: 30, windSpeed: 15, elevation: "3,500 m" }
};

/**
 * Fetch live and forecast weather for an Indian destination
 */
async function getDestinationWeather(destination) {
  const coords = resolveCoordinates(destination) || { lat: 28.6139, lng: 77.2090 };
  const destClean = (destination || "India").toLowerCase().trim();

  try {
    // Open-Meteo free API (No API key required, highly accurate for Indian subcontinent)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }
    const data = await response.json();

    const currentCode = data.current?.weather_code || 0;
    const currentMeta = WMO_CODE_MAP[currentCode] || WMO_CODE_MAP[0];
    const currentTemp = Math.round(data.current?.temperature_2m || 24);
    const humidity = Math.round(data.current?.relative_humidity_2m || 55);
    const windSpeed = Math.round(data.current?.wind_speed_10m || 10);

    // Build 5-day daily forecast
    const daily = data.daily || {};
    const forecast = [];
    const times = daily.time || [];

    for (let i = 0; i < Math.min(5, times.length); i++) {
      const code = daily.weather_code?.[i] || 0;
      const meta = WMO_CODE_MAP[code] || WMO_CODE_MAP[0];
      const maxT = Math.round(daily.temperature_2m_max?.[i] || currentTemp + 4);
      const minT = Math.round(daily.temperature_2m_min?.[i] || currentTemp - 5);
      const precip = daily.precipitation_probability_max?.[i] || 10;

      const dateObj = new Date(times[i]);
      const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : dateObj.toLocaleDateString("en-IN", { weekday: "short" });

      forecast.push({
        date: times[i],
        dayName,
        maxTemp: maxT,
        minTemp: minT,
        condition: meta.condition,
        icon: meta.icon,
        precipitationChance: `${precip}%`
      });
    }

    // Generate weather-driven travel suggestions
    const travelSuggestions = [
      currentMeta.travelTip,
      currentTemp < 15
        ? "🧤 Mountain Chills: Pack thermal base layers and a warm windproof fleece."
        : currentTemp > 30
        ? "🕶️ Warm Sun: Stay hydrated with fresh coconut water and apply SPF 50+ sunscreen."
        : "👟 Pleasant Temperatures: Ideal for long heritage walks and outdoor photography.",
      humidity > 70
        ? "🌧️ High Humidity: Wear light, quick-drying linen or breathable cotton clothes."
        : "💧 Crisp Air: Keep a reusable insulated water flask handy while exploring."
    ];

    return {
      success: true,
      destination,
      coordinates: coords,
      current: {
        temperature: currentTemp,
        unit: "°C",
        condition: currentMeta.condition,
        icon: currentMeta.icon,
        humidity: `${humidity}%`,
        windSpeed: `${windSpeed} km/h`
      },
      forecast,
      travelSuggestions
    };
  } catch (err) {
    // Graceful intelligent fallback using regional profiles
    let fallback = REGIONAL_CLIMATE_FALLBACKS[destClean];
    if (!fallback) {
      for (const [key, val] of Object.entries(REGIONAL_CLIMATE_FALLBACKS)) {
        if (destClean.includes(key)) {
          fallback = val;
          break;
        }
      }
    }

    const base = fallback || {
      temp: 22,
      min: 14,
      max: 28,
      condition: "Pleasant & Clear",
      icon: "🌤️",
      humidity: 50,
      windSpeed: 10
    };

    const today = new Date();
    const mockForecast = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      mockForecast.push({
        date: d.toISOString().split("T")[0],
        dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }),
        maxTemp: base.max + (i % 2 === 0 ? 1 : -1),
        minTemp: base.min + (i % 2 === 0 ? -1 : 1),
        condition: base.condition,
        icon: base.icon,
        precipitationChance: `${10 + i * 5}%`
      });
    }

    return {
      success: true,
      destination,
      coordinates: coords,
      current: {
        temperature: base.temp,
        unit: "°C",
        condition: base.condition,
        icon: base.icon,
        humidity: `${base.humidity}%`,
        windSpeed: `${base.windSpeed} km/h`
      },
      forecast: mockForecast,
      travelSuggestions: [
        `Pleasant weather conditions for ${destination}.`,
        base.temp < 16 ? "Carry warm layers for evenings." : "Carry sunglasses and a sun hat for daytime excursions.",
        "Check local mountain transit schedules during morning hours."
      ],
      isFallback: true
    };
  }
}

module.exports = {
  WMO_CODE_MAP,
  getDestinationWeather
};
