const express = require("express");
const router = express.Router();
const {
  resolveCoordinates,
  generateItineraryRouteMap
} = require("../services/geoService");

/**
 * 1. Get coordinates for a destination or landmark
 * GET /api/geo/coordinates/:query
 */
router.get("/coordinates/:query", (req, res) => {
  const query = req.params.query;
  const coords = resolveCoordinates(query);
  res.json({
    query,
    coordinates: coords
  });
});

/**
 * 2. Generate Route Map for Itinerary (Hotel -> Attraction -> Restaurant -> Activity)
 * POST /api/geo/route-map
 */
router.post("/route-map", (req, res) => {
  try {
    const { destination, itinerary } = req.body;
    if (!destination) {
      return res.status(400).json({ error: "Destination is required." });
    }

    const routeMapData = generateItineraryRouteMap(destination, itinerary || []);
    res.json(routeMapData);
  } catch (error) {
    console.error("Geo Route Map Error:", error);
    res.status(500).json({ error: "Failed to generate route map." });
  }
});

module.exports = router;
