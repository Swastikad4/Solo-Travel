const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { destinations } = require("../data/sampleData");
const { authenticate, requireAdmin } = require("../middleware/auth");
const {
  INDIAN_STATES_AND_UTS,
  INDIAN_REGIONS,
  isValidIndianState,
  getIndianStateInfo
} = require("../data/indiaLocations");

// In-memory destinations store for offline/fallback mode (initialized from sampleData)
const inMemoryDestinations = JSON.parse(JSON.stringify(destinations));

// Helper: Normalize strings for case-insensitive matching
const normalize = (str) => (str || "").trim().toLowerCase();

// Helper: Generate slug from name
const generateSlug = (name) => {
  return (name || "")
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
};

// ==========================================
// 1. LOCATION HIERARCHY ENDPOINTS
// ==========================================

// GET /api/destinations/locations/states
// List all 28 States & 8 UTs with metadata and destination counts
router.get("/locations/states", async (req, res) => {
  try {
<<<<<<< HEAD
    const dbData = await prisma.destination.findMany({
      orderBy: { name: "asc" },
    });
    if (dbData && dbData.length > 0) {
      return res.json(dbData);
    }
  } catch (err) {
    // Fall through to sample data
  }
=======
    const allDests = Object.values(inMemoryDestinations);
>>>>>>> 8588af7 (Update project)

    const statesWithCounts = INDIAN_STATES_AND_UTS.map((state) => {
      const count = allDests.filter(
        (d) => normalize(d.state) === normalize(state.name)
      ).length;

      return {
        name: state.name,
        code: state.code,
        type: state.type,
        region: state.region,
        capital: state.capital,
        description: state.description,
        image: state.image,
        districtCount: state.districts ? state.districts.length : 0,
        cities: state.cities ? state.cities.map((c) => c.name) : [],
        destinationCount: count
      };
    });

    res.json({
      totalStates: 28,
      totalUnionTerritories: 8,
      regions: INDIAN_REGIONS,
      states: statesWithCounts
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Indian states" });
  }
});

// GET /api/destinations/locations/hierarchy
// Full hierarchical location tree: India -> State/UT -> District -> City -> Towns
router.get("/locations/hierarchy", (req, res) => {
  res.json({
    country: "India",
    regions: INDIAN_REGIONS,
    hierarchy: INDIAN_STATES_AND_UTS
  });
});

// GET /api/destinations/locations/categories
// Available destination categories
router.get("/locations/categories", (req, res) => {
  const categories = [
    "Heritage",
    "Spiritual",
    "Nature & Wildlife",
    "Hill Station",
    "Adventure & Trekking",
    "Beach & Coastal",
    "Cultural & Food",
    "Architecture",
    "Backwaters & Greenery",
    "Yoga & Wellness"
  ];
  res.json(categories);
});

// ==========================================
// 1.5 RECOMMENDATIONS ENGINE (PHASE 9)
// ==========================================
const { getRecommendations } = require("../services/recommendationService");
const User = require("../models/User");
const Trip = require("../models/Trip");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

// GET /api/destinations/recommendations
// Generates personalized destination matches (e.g. Manali: 94%, Kashmir: 89%, Sikkim: 86%)
router.get("/recommendations", async (req, res) => {
  try {
<<<<<<< HEAD
    const dbData = await prisma.destination.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
      },
    });
=======
    let userProfile = {
      interests: req.query.interests ? req.query.interests.split(",") : [],
      travelStyle: req.query.travelStyle || "Cultural Explorer",
      budget: Number(req.query.budget) || 15000,
      duration: Number(req.query.duration) || 5,
      favorites: [],
      previousTrips: []
    };
>>>>>>> 8588af7 (Update project)

    // Check if token provided to personalize based on logged-in user profile & trip history
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).lean();
        if (user) {
          if (!req.query.interests && user.travelInterests) {
            userProfile.interests = user.travelInterests;
          }
          if (!req.query.travelStyle && user.travelStyle) {
            userProfile.travelStyle = user.travelStyle;
          }
          if (user.favorites) {
            userProfile.favorites = user.favorites;
          }

          // Fetch previous trips to recommend novel destinations
          const pastTrips = await Trip.find({ userId: String(user._id) }).select("destination").lean();
          if (pastTrips && pastTrips.length > 0) {
            userProfile.previousTrips = pastTrips.map(t => t.destination);
          }
        }
      } catch (err) {
        // Continue with query params
      }
    }

    const recommendations = await getRecommendations(userProfile);

    res.json({
      success: true,
      count: recommendations.length,
      userProfileSummary: {
        interests: userProfile.interests,
        travelStyle: userProfile.travelStyle,
        budget: userProfile.budget,
        duration: userProfile.duration
      },
      recommendations
    });
  } catch (err) {
    console.error("Error generating recommendations:", err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// ==========================================
// 2. DESTINATION CRUD & ADVANCED QUERY API
// ==========================================

// GET /api/destinations
// Advanced query engine: search, state, city, category, budget, duration, rating, sort, pagination
router.get("/", async (req, res) => {
  const {
    q,
    search,
    state,
    city,
    category,
    region,
    budgetTier,
    maxBudget,
    duration, // "weekend" (1-2), "short" (3-5), "week" (6+)
    minRating,
    minSoloScore,
    sortBy = "popular", // "rating", "soloScore", "budget_asc", "budget_desc", "name", "duration"
    page = 1,
    limit = 12
  } = req.query;

  const searchQuery = (q || search || "").trim().toLowerCase();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);

  let results = [];

  // 1. Try fetching from MongoDB first if connected
  let usingDb = false;
  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  if (isMongoConnected) {
    try {
      const filter = { isPublished: { $ne: false }, country: "India" };

      if (searchQuery) {
        filter.$or = [
          { name: { $regex: searchQuery, $options: "i" } },
          { city: { $regex: searchQuery, $options: "i" } },
          { state: { $regex: searchQuery, $options: "i" } },
          { district: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } },
          { "attractions.name": { $regex: searchQuery, $options: "i" } }
        ];
      }
      if (state && state !== "All") filter.state = new RegExp(`^${state.trim()}$`, "i");
      if (city) filter.city = new RegExp(`^${city.trim()}$`, "i");
      if (category && category !== "All") filter.category = category;
      if (budgetTier && budgetTier !== "All") filter["avgBudget.tier"] = budgetTier;
      if (maxBudget) filter["avgBudget.perDay"] = { $lte: Number(maxBudget) };
      if (minRating) filter.safetyRating = { $gte: Number(minRating) };
      if (minSoloScore) filter.soloScore = { $gte: Number(minSoloScore) };

      const dbData = await Destination.find(filter).maxTimeMS(2500);
      if (dbData && dbData.length > 0) {
        results = dbData.map((d) => d.toObject());
        usingDb = true;
      }
    } catch (err) {
      // Fall back to in-memory store
    }
  }

  // 2. If DB returned no results or was offline, filter in-memory store
  if (!usingDb) {
    results = Object.values(inMemoryDestinations).filter((item) => {
      // Must be India
      if (item.country && item.country.toLowerCase() !== "india") return false;

      // Search matching across name, city, state, district, attractions, categories, description
      if (searchQuery) {
        const inName = normalize(item.name).includes(searchQuery);
        const inCity = normalize(item.city).includes(searchQuery);
        const inState = normalize(item.state).includes(searchQuery);
        const inDistrict = normalize(item.district).includes(searchQuery);
        const inDesc = normalize(item.description).includes(searchQuery);
        const inCat = (item.category || []).some((c) => normalize(c).includes(searchQuery));
        const inAttr = (item.attractions || []).some((a) =>
          normalize(a.name).includes(searchQuery)
        );

        if (!inName && !inCity && !inState && !inDistrict && !inDesc && !inCat && !inAttr) {
          return false;
        }
      }

      // State filter
      if (state && state !== "All" && normalize(item.state) !== normalize(state)) {
        return false;
      }

      // City filter
      if (city && normalize(item.city) !== normalize(city)) {
        return false;
      }

      // Region filter (North, South, etc.)
      if (region && region !== "All") {
        const stateInfo = getIndianStateInfo(item.state);
        if (!stateInfo || normalize(stateInfo.region) !== normalize(region)) {
          return false;
        }
      }

      // Category filter
      if (category && category !== "All") {
        const hasCategory = (item.category || []).some(
          (c) => normalize(c) === normalize(category)
        );
        if (!hasCategory) return false;
      }

      // Budget tier filter
      if (budgetTier && budgetTier !== "All") {
        const itemTier = item.avgBudget && item.avgBudget.tier;
        if (itemTier !== budgetTier) return false;
      }

      // Max budget filter
      if (maxBudget) {
        const perDay = item.avgBudget ? item.avgBudget.perDay : 1500;
        if (perDay > Number(maxBudget)) return false;
      }

      // Duration filter
      if (duration && duration !== "All") {
        const days = item.idealDurationDays || 3;
        if (duration === "weekend" && (days < 1 || days > 2)) return false;
        if (duration === "short" && (days < 3 || days > 5)) return false;
        if (duration === "week" && days < 6) return false;
      }

      // Rating filters
      if (minRating && (item.safetyRating || 0) < Number(minRating)) return false;
      if (minSoloScore && (item.soloScore || 0) < Number(minSoloScore)) return false;

      return true;
    });
  }

  // 3. Sorting
  results.sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.safetyRating || 0) - (a.safetyRating || 0);
      case "soloScore":
        return (b.soloScore || 0) - (a.soloScore || 0);
      case "budget_asc": {
        const bA = a.avgBudget ? a.avgBudget.perDay : 0;
        const bB = b.avgBudget ? b.avgBudget.perDay : 0;
        return bA - bB;
      }
      case "budget_desc": {
        const bA = a.avgBudget ? a.avgBudget.perDay : 0;
        const bB = b.avgBudget ? b.avgBudget.perDay : 0;
        return bB - bA;
      }
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "duration":
        return (a.idealDurationDays || 0) - (b.idealDurationDays || 0);
      case "popular":
      default:
        return (b.soloScore || 0) - (a.soloScore || 0);
    }
  });

  // 4. Pagination
  const total = results.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = results.slice(startIndex, startIndex + limitNum);

  // Return standard response with pagination metadata and array
  res.json({
    destinations: paginated,
    total,
    totalPages,
    currentPage: pageNum,
    limit: limitNum,
    hasNext: pageNum < totalPages,
    hasPrev: pageNum > 1
  });
});

// GET /api/destinations/:nameOrSlug
// Get a single destination with full details, breadcrumbs, and attractions
router.get("/:nameOrSlug", async (req, res) => {
  const target = normalize(req.params.nameOrSlug);
  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Check MongoDB if connected
  if (isMongoConnected) {
    try {
      const dbDest = await Destination.findOne({
        $or: [
          { slug: target },
          { name: new RegExp(`^${target}$`, "i") }
        ]
      }).maxTimeMS(2500);

      if (dbDest) {
        return res.json(dbDest);
      }
    } catch (err) {
      // Fall through to in-memory
    }
  }

  // 2. Check in-memory by key or slug or name
  let found = inMemoryDestinations[target];

  if (!found) {
    found = Object.values(inMemoryDestinations).find(
      (d) =>
        normalize(d.slug) === target ||
        normalize(d.name) === target ||
        (d._id && String(d._id) === target)
    );
  }

  // 3. Partial match fallback
  if (!found) {
    found = Object.values(inMemoryDestinations).find((d) => {
      const n = normalize(d.name);
      return n.includes(target) || target.includes(n);
    });
  }

  if (found) {
    return res.json(found);
  }

  res.status(404).json({ error: "Destination not found in India" });
});

// ==========================================
// 3. STRICT CRUD OPERATIONS
// ==========================================

// POST /api/destinations
// Create new Indian destination — strictly validates country === "India" and Indian state (Admin only)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  const body = req.body;

  // STRICT VALIDATION: country = "India"
  if (body.country && body.country.trim().toLowerCase() !== "india") {
    return res.status(400).json({
      error: "SoloTravel is an India-only platform. International destinations are forbidden. Country must be 'India'."
    });
  }

  const country = "India";
  const { name, state, district, city, description, image } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Destination name is required" });
  }

  if (!state || !isValidIndianState(state)) {
    return res.status(400).json({
      error: "A valid Indian State or Union Territory is required (e.g. Rajasthan, Himachal Pradesh, Kerala, Goa, Ladakh)"
    });
  }

  if (!district || typeof district !== "string" || !district.trim()) {
    return res.status(400).json({ error: "District is required" });
  }

  if (!city || typeof city !== "string" || !city.trim()) {
    return res.status(400).json({ error: "City is required" });
  }

  if (!description || typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "Description is required" });
  }

  if (!image || typeof image !== "string" || !image.trim()) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  const slug = generateSlug(name);
  const stateInfo = getIndianStateInfo(state);

  const destinationData = {
    ...body,
    name: name.trim(),
    slug,
    country,
    state: stateInfo ? stateInfo.name : state.trim(),
    stateType: stateInfo ? stateInfo.type : "State",
    district: district.trim(),
    city: city.trim(),
    townOrVillage: body.townOrVillage ? body.townOrVillage.trim() : "",
    description: description.trim(),
    image: image.trim(),
    attractions: Array.isArray(body.attractions) ? body.attractions : [],
    category: Array.isArray(body.category) && body.category.length > 0 ? body.category : ["Cultural & Heritage"],
    safetyRating: Number(body.safetyRating) || 4.5,
    soloScore: Number(body.soloScore) || 8.5,
    avgBudget: body.avgBudget || { min: 1000, max: 2500, perDay: 1500, tier: "Budget", currency: "INR (₹)" },
    idealDurationDays: Number(body.idealDurationDays) || 3,
    bestTime: body.bestTime || "October to March",
    bestMonths: Array.isArray(body.bestMonths) ? body.bestMonths : ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    language: Array.isArray(body.language) ? body.language : ["Hindi", "English"],
    howToReach: body.howToReach || { airport: "", railway: "", road: "" },
    soloTravelerTips: Array.isArray(body.soloTravelerTips) ? body.soloTravelerTips : []
  };

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try persisting to MongoDB if connected
  if (isMongoConnected) {
    try {
      const newDest = new Destination(destinationData);
      await newDest.save();
      return res.status(201).json(newDest);
    } catch (err) {
      // Fall through to in-memory
    }
  }

  // 2. Fallback in-memory
  const id = "custom_in_" + Date.now();
  const savedInMemory = { _id: id, ...destinationData };
  inMemoryDestinations[slug] = savedInMemory;
  return res.status(201).json(savedInMemory);
});

// PUT /api/destinations/:idOrSlug
// Update an existing destination (Admin only)
router.put("/:idOrSlug", authenticate, requireAdmin, async (req, res) => {
  const target = normalize(req.params.idOrSlug);
  const updates = req.body;

  // Strict check on update
  if (updates.country && updates.country.trim().toLowerCase() !== "india") {
    return res.status(400).json({
      error: "Country cannot be modified to an international destination. Must remain 'India'."
    });
  }

  if (updates.state && !isValidIndianState(updates.state)) {
    return res.status(400).json({
      error: "State must be a valid Indian State or Union Territory"
    });
  }

  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try DB update
  if (isMongoConnected) {
    try {
      const updated = await Destination.findOneAndUpdate(
        { $or: [{ slug: target }, { _id: target }] },
        { ...updates, country: "India" },
        { new: true, runValidators: true }
      );
      if (updated) return res.json(updated);
    } catch (err) {
      // Fall through to in-memory
    }
  }

  // 2. In-memory update
  let foundKey = Object.keys(inMemoryDestinations).find(
    (k) =>
      k === target ||
      normalize(inMemoryDestinations[k].slug) === target ||
      inMemoryDestinations[k]._id === target
  );

  if (foundKey) {
    inMemoryDestinations[foundKey] = {
      ...inMemoryDestinations[foundKey],
      ...updates,
      country: "India",
      updatedAt: new Date().toISOString()
    };
    return res.json(inMemoryDestinations[foundKey]);
  }

  res.status(404).json({ error: "Destination not found to update" });
});

// DELETE /api/destinations/:idOrSlug
// Remove a destination (Admin only)
router.delete("/:idOrSlug", authenticate, requireAdmin, async (req, res) => {
  const target = normalize(req.params.idOrSlug);
  const isMongoConnected = req.app.get("mongoConnected")
    ? req.app.get("mongoConnected")()
    : false;

  // 1. Try DB delete
  if (isMongoConnected) {
    try {
      const deleted = await Destination.findOneAndDelete({
        $or: [{ slug: target }, { _id: target }]
      });
      if (deleted) return res.json({ message: "Destination deleted successfully", slug: target });
    } catch (err) {
      // Fall through
    }
  }

  // 2. In-memory delete
  let foundKey = Object.keys(inMemoryDestinations).find(
    (k) =>
      k === target ||
      normalize(inMemoryDestinations[k].slug) === target ||
      inMemoryDestinations[k]._id === target
  );

  if (foundKey) {
    delete inMemoryDestinations[foundKey];
    return res.json({ message: "Destination deleted successfully", slug: target });
  }

  res.status(404).json({ error: "Destination not found" });
});

module.exports = router;