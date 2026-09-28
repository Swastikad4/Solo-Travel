const express = require("express");
const router = express.Router();
const {
  isIndianDestination,
  generateAITripItinerary,
  applyAICommand,
  DESTINATION_PROFILES
} = require("../services/aiPlannerEngine");

/**
 * 1. Validate destination is in India
 * POST /api/ai/validate-destination
 */
router.post("/validate-destination", (req, res) => {
  const { destination } = req.body;
  if (!destination || typeof destination !== "string" || !destination.trim()) {
    return res.status(400).json({
      valid: false,
      error: "Destination is required."
    });
  }

  const isValid = isIndianDestination(destination);
  if (!isValid) {
    return res.status(400).json({
      valid: false,
      error: "Sorry, this platform currently supports travel destinations within India only."
    });
  }

  res.json({
    valid: true,
    destination: destination.trim(),
    message: "Destination is a verified Indian travel location."
  });
});

/**
 * 2. Generate Full AI Travel Itinerary
 * POST /api/ai/plan-trip
 */
router.post("/plan-trip", async (req, res) => {
  try {
    const {
      destination,
      days,
      startDate,
      travelers,
      budget,
      interests,
      travelStyle,
      accommodation,
      foodPreference,
      transportation
    } = req.body;

    if (!destination || typeof destination !== "string" || !destination.trim()) {
      return res.status(400).json({
        error: "Destination is required."
      });
    }

    const result = await generateAITripItinerary({
      destination: destination.trim(),
      days: days || 3,
      startDate: startDate || new Date().toISOString().split("T")[0],
      travelers: travelers || 1,
      budget: budget !== undefined ? budget : 15000,
      interests: Array.isArray(interests) ? interests : (interests ? [interests] : ["Nature", "Culture"]),
      travelStyle: travelStyle || "Solo Backpacker",
      accommodation: accommodation || "Backpacker Hostel",
      foodPreference: foodPreference || "Authentic Local Cuisine",
      transportation: transportation || "Public Buses & Rental Scooter"
    });

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        isIndiaOnlyError: result.isIndiaOnlyError || false
      });
    }

    res.json(result);
  } catch (error) {
    console.error("AI Planner Error:", error);
    res.status(500).json({
      error: "An error occurred while generating the itinerary. Please try again."
    });
  }
});

/**
 * 3. Execute AI Itinerary Command
 * POST /api/ai/command
 */
router.post(["/command", "/modify-itinerary"], (req, res) => {
  try {
    const {
      command,
      commandType,
      dayNumber,
      customPrompt,
      currentItinerary,
      itinerary,
      tripMeta
    } = req.body;

    const itin = currentItinerary || itinerary;
    if (!Array.isArray(itin)) {
      return res.status(400).json({
        error: "currentItinerary must be an array of days."
      });
    }

    const cmd = commandType || command || customPrompt;
    const result = applyAICommand(
      cmd,
      itin,
      tripMeta || {},
      { commandType: cmd, dayNumber, customPrompt }
    );

    res.json(result);
  } catch (error) {
    console.error("AI Command Error:", error);
    res.status(500).json({
      error: "An error occurred executing the AI command."
    });
  }
});

/**
 * 4. Optimize Itinerary Budget
 * POST /api/ai/optimize-budget
 */
router.post("/optimize-budget", (req, res) => {
  try {
    const { currentItinerary, tripMeta } = req.body;

    if (!Array.isArray(currentItinerary)) {
      return res.status(400).json({
        error: "currentItinerary must be an array of days."
      });
    }

    const result = applyAICommand(
      "optimize_budget",
      currentItinerary,
      tripMeta || {},
      { commandType: "optimize_budget" }
    );

    res.json(result);
  } catch (error) {
    console.error("AI Optimize Budget Error:", error);
    res.status(500).json({
      error: "An error occurred optimizing the budget."
    });
  }
});

/**
 * 5. Get AI Planner suggestions & presets
 * GET /api/ai/suggestions
 */
router.get("/suggestions", (req, res) => {
  res.json({
    popularIndianDestinations: [
      { name: "Manali", state: "Himachal Pradesh", tag: "Adventure & Trekking", avgBudget: "₹15,000", idealDays: 5 },
      { name: "Jaipur", state: "Rajasthan", tag: "Royal Heritage & Palaces", avgBudget: "₹12,000", idealDays: 3 },
      { name: "Rishikesh", state: "Uttarakhand", tag: "Yoga & River Rafting", avgBudget: "₹10,000", idealDays: 4 },
      { name: "North Goa", state: "Goa", tag: "Beaches & Sunsets", avgBudget: "₹18,000", idealDays: 5 },
      { name: "Munnar", state: "Kerala", tag: "Tea Estates & Misty Hills", avgBudget: "₹14,000", idealDays: 4 },
      { name: "Varanasi", state: "Uttar Pradesh", tag: "Spiritual Ghats & Aartis", avgBudget: "₹8,000", idealDays: 3 },
      { name: "Hampi", state: "Karnataka", tag: "Ancient Boulders & Ruins", avgBudget: "₹11,000", idealDays: 3 },
      { name: "Leh-Ladakh", state: "Ladakh", tag: "High Mountain Passes", avgBudget: "₹28,000", idealDays: 7 },
      { name: "Darjeeling", state: "West Bengal", tag: "Himalayan Sunrise & Toy Train", avgBudget: "₹13,000", idealDays: 4 },
      { name: "Shillong", state: "Meghalaya", tag: "Living Root Bridges & Waterfalls", avgBudget: "₹16,000", idealDays: 5 }
    ],
    interestOptions: [
      "Trekking & Hiking",
      "Nature & Wildlife",
      "Heritage & Forts",
      "Spiritual & Yoga",
      "Street Food & Culinary",
      "Photography & Vlogging",
      "Beaches & Coastal",
      "Nightlife & Music",
      "Handicrafts & Art",
      "Adventure Sports"
    ],
    travelStyles: [
      "Solo Backpacker",
      "Budget Explorer",
      "Balanced / Mid-Range",
      "Luxury / Boutique",
      "Slow & Relaxed",
      "Fast-Paced Explorer"
    ],
    accommodationTypes: [
      "Backpacker Hostel / Dorm",
      "Cozy Homestay",
      "Budget Hotel / Guest House",
      "Heritage Haveli / Boutique Stay",
      "Luxury Resort / Villa",
      "Camping / Mountain Swiss Tent"
    ],
    foodPreferences: [
      "Authentic Local Street Food",
      "Pure Vegetarian / Sattvic",
      "Vegan Friendly",
      "Coastal Seafood & Local Non-Veg",
      "Cafes & Multi-Cuisine"
    ],
    transportationModes: [
      "Public Buses & Local Trains",
      "Rental Scooter / Royal Enfield",
      "Shared Taxis & E-Rickshaws",
      "Private Cab / Self-Drive"
    ],
    quickCommands: [
      { id: "regenerate_day", label: "🔄 Regenerate Day", icon: "🔄" },
      { id: "more_trekking", label: "🥾 Add More Trekking", icon: "🥾" },
      { id: "reduce_travel_time", label: "⏱️ Reduce Travel Time", icon: "⏱️" },
      { id: "make_cheaper", label: "💸 Make It Cheaper", icon: "💸" },
      { id: "more_relaxing", label: "🧘 Make It More Relaxing", icon: "🧘" },
      { id: "add_local_food", label: "🍛 Add Authentic Local Food", icon: "🍛" },
      { id: "optimize_budget", label: "📊 Optimize Budget", icon: "📊" }
    ]
  });
});

module.exports = router;
