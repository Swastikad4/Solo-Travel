const express = require("express");
const router = express.Router();
const { getDestinationWeather } = require("../services/weatherService");

/**
 * 1. Get Live Weather & 5-Day Forecast for an Indian destination
 * GET /api/weather/:destination
 */
router.get("/:destination", async (req, res) => {
  try {
    const destination = req.params.destination;
    const weatherData = await getDestinationWeather(destination);
    res.json(weatherData);
  } catch (error) {
    console.error("Weather Route Error:", error);
    res.status(500).json({ error: "Failed to fetch destination weather." });
  }
});

module.exports = router;
