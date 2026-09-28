const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const prisma = require("../lib/prisma");
const { sampleTrips } = require("../data/sampleData");
=======
const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const { sampleTrips, destinations } = require("../data/sampleData");

// In-memory fallback storage
const inMemoryTrips = new Map();
const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper: Destination Itinerary Templates for India
const getDestinationTemplate = (destinationName, numDays = 3) => {
  const destLower = (destinationName || "").toLowerCase();
  
  const templates = {
    jaipur: [
      {
        dayNumber: 1,
        title: "Day 1: Royal Forts & Amer Heritage",
        activities: [
          { _id: "act_jp_1", time: "09:00", title: "Traditional Breakfast & Masala Chai at Rawat", category: "Food", cost: 200, location: "Sindhi Camp", notes: "Try Pyaz Kachori and hot Jalebi" },
          { _id: "act_jp_2", time: "10:30", title: "Explore Amer Fort & Sheesh Mahal", category: "Activities", cost: 300, location: "Amer", notes: "Hire a certified audio guide" },
          { _id: "act_jp_3", time: "13:30", title: "Thali Lunch with Dal Baati Churma", category: "Food", cost: 450, location: "Amer Road", notes: "Authentic Rajasthani royal platter" },
          { _id: "act_jp_4", time: "15:30", title: "Visit Jaigarh Fort & Geometric Stepwell", category: "Activities", cost: 150, location: "Panna Meena Kund", notes: "Great photography spot" },
          { _id: "act_jp_5", time: "17:30", title: "Sunset at Nahargarh Fort / Padao Cafe", category: "Activities", cost: 250, location: "Nahargarh", notes: "Panoramic view over the Pink City" },
          { _id: "act_jp_6", time: "20:00", title: "Dinner & Walking at Bapu Bazaar", category: "Food", cost: 400, location: "Old City", notes: "Textiles and souvenirs" }
        ]
      },
      {
        dayNumber: 2,
        title: "Day 2: City Palace, Hawa Mahal & Museum Trail",
        activities: [
          { _id: "act_jp_7", time: "08:30", title: "Early photo session at Hawa Mahal facade", category: "Activities", cost: 150, location: "Badi Chaupar", notes: "Best morning golden hour" },
          { _id: "act_jp_8", time: "10:00", title: "Tour of City Palace & Mubarak Mahal", category: "Activities", cost: 300, location: "Old City", notes: "Royal courtyards" },
          { _id: "act_jp_9", time: "12:30", title: "Jantar Mantar Astronomical Observatory", category: "Activities", cost: 200, location: "Old City", notes: "UNESCO World Heritage site" },
          { _id: "act_jp_10", time: "14:00", title: "Lunch at LMB (Laxmi Misthan Bhandar)", category: "Food", cost: 350, location: "Johari Bazaar", notes: "Heritage restaurant" },
          { _id: "act_jp_11", time: "16:30", title: "Albert Hall Museum & Evening Illumination", category: "Activities", cost: 100, location: "Ram Niwas Garden", notes: "Indo-Saracenic architecture" },
          { _id: "act_jp_12", time: "19:30", title: "Rooftop dinner with live Rajasthani folk music", category: "Food", cost: 500, location: "MI Road", notes: "Puppet show & sitar" }
        ]
      },
      {
        dayNumber: 3,
        title: "Day 3: Hidden Temples, Crafts & Cultural Feast",
        activities: [
          { _id: "act_jp_13", time: "08:00", title: "Hike to Galta Ji (Monkey Temple)", category: "Activities", cost: 100, location: "Khania-Balaji", notes: "Natural springs and sacred kunds" },
          { _id: "act_jp_14", time: "11:00", title: "Blue Pottery Workshop in Sanganer", category: "Activities", cost: 400, location: "Sanganer", notes: "Handmade ceramic pottery" },
          { _id: "act_jp_15", time: "13:30", title: "Clay-pot Lassi at Lassiwala MI Road", category: "Food", cost: 200, location: "MI Road", notes: "Rich creamy kulhad lassi" },
          { _id: "act_jp_16", time: "16:00", title: "Gaitore Ki Chhatriyan (Royal Cenotaphs)", category: "Activities", cost: 100, location: "Brahampuri", notes: "Intricate marble carvings" },
          { _id: "act_jp_17", time: "19:30", title: "Cultural Dinner at Chokhi Dhani", category: "Food", cost: 900, location: "Tonk Road", notes: "Grand Rajasthani village experience" }
        ]
      }
    ],
    goa: [
      {
        dayNumber: 1,
        title: "Day 1: North Goa Beaches & Sunset Drums",
        activities: [
          { _id: "act_goa_1", time: "09:00", title: "Breakfast & Pour-over Coffee at Baba Au Rhum", category: "Food", cost: 450, location: "Anjuna", notes: "Fresh croissants" },
          { _id: "act_goa_2", time: "10:30", title: "Explore Chapora Fort & Vagator Cliffs", category: "Activities", cost: 50, location: "Vagator", notes: "Dil Chahta Hai viewpoint" },
          { _id: "act_goa_3", time: "13:00", title: "Goan Fish Curry Thali lunch", category: "Food", cost: 350, location: "Anjuna Beach", notes: "Fresh local catch" },
          { _id: "act_goa_4", time: "16:00", title: "Arambol Sweet Water Lake walk", category: "Activities", cost: 100, location: "Arambol", notes: "Freshwater lagoon" },
          { _id: "act_goa_5", time: "18:00", title: "Arambol Sunset Drum Circle", category: "Activities", cost: 100, location: "Arambol Beach", notes: "Community music gather" },
          { _id: "act_goa_6", time: "20:30", title: "Beachside dinner under starlight", category: "Food", cost: 600, location: "Anjuna", notes: "Live music and sea breeze" }
        ]
      },
      {
        dayNumber: 2,
        title: "Day 2: Heritage Fontainhas Latin Quarter",
        activities: [
          { _id: "act_goa_7", time: "09:00", title: "Scooter rental and ride to Panaji", category: "Transportation", cost: 400, location: "Panaji", notes: "Explore colonial streets" },
          { _id: "act_goa_8", time: "10:30", title: "Walking tour of Fontainhas", category: "Activities", cost: 100, location: "Fontainhas", notes: "Colourful Portuguese villas" },
          { _id: "act_goa_9", time: "13:00", title: "Goan-Portuguese lunch at Viva Panjim", category: "Food", cost: 450, location: "Fontainhas", notes: "Chicken Xacuti and Bebinca" },
          { _id: "act_goa_10", time: "15:30", title: "Our Lady of Immaculate Conception Church", category: "Activities", cost: 50, location: "Church Square", notes: "Iconic white zigzag stairs" },
          { _id: "act_goa_11", time: "18:00", title: "Mandovi River Sunset Cruise", category: "Activities", cost: 400, location: "Mandovi Jetty", notes: "Folk music on board" },
          { _id: "act_goa_12", time: "20:30", title: "Tapas & live jazz in Panaji", category: "Food", cost: 600, location: "Campal", notes: "Cosy bistro atmosphere" }
        ]
      }
    ],
    manali: [
      {
        dayNumber: 1,
        title: "Day 1: Old Manali Cafes & Jogini Falls",
        activities: [
          { _id: "act_mn_1", time: "09:00", title: "Apple crumble breakfast at Dylan's Cafe", category: "Food", cost: 250, location: "Old Manali", notes: "Fresh roasted mountain coffee" },
          { _id: "act_mn_2", time: "10:30", title: "Pine forest trek to Jogini Waterfalls", category: "Activities", cost: 100, location: "Vashisht", notes: "Beas river valley views" },
          { _id: "act_mn_3", time: "13:30", title: "Himachali Siddu & hot springs at Vashisht", category: "Food", cost: 200, location: "Vashisht", notes: "Warm stuffed siddu with ghee" },
          { _id: "act_mn_4", time: "16:00", title: "Manu Temple & Old Manali wooden streets", category: "Activities", cost: 50, location: "Old Manali", notes: "Traditional pagoda architecture" },
          { _id: "act_mn_5", time: "19:30", title: "Riverside dinner & live acoustic music at Cafe 1947", category: "Food", cost: 450, location: "Beas River", notes: "Woodfired pizza by the river" }
        ]
      },
      {
        dayNumber: 2,
        title: "Day 2: Atal Tunnel & Sissu Valley Adventure",
        activities: [
          { _id: "act_mn_6", time: "08:00", title: "Drive through Atal Tunnel (9.02 km)", category: "Transportation", cost: 600, location: "Atal Tunnel", notes: "Cross into high altitude Lahaul" },
          { _id: "act_mn_7", time: "10:30", title: "Sissu Waterfall exploration", category: "Activities", cost: 200, location: "Sissu, Lahaul", notes: "Spectacular barren peaks" },
          { _id: "act_mn_8", time: "13:00", title: "Hot Thukpa & Momos lunch in Lahaul", category: "Food", cost: 180, location: "Sissu Village", notes: "Tibetan noodle soup" },
          { _id: "act_mn_9", time: "15:30", title: "Solang Valley adventure stop", category: "Activities", cost: 1200, location: "Solang Valley", notes: "Paragliding / Valley zip-lining" },
          { _id: "act_mn_10", time: "19:30", title: "Fresh river trout dinner on Mall Road", category: "Food", cost: 400, location: "Mall Road", notes: "Local delicacy" }
        ]
      }
    ],
    default: [
      {
        dayNumber: 1,
        title: "Day 1: Arrival, Check-in & Neighborhood Walk",
        activities: [
          { _id: "act_def_1", time: "09:00", title: "Check-in at Backpacker Hostel/Boutique Stay", category: "Accommodation", cost: 1200, location: "City Center", notes: "Freshen up & meet solo travelers" },
          { _id: "act_def_2", time: "11:00", title: "Heritage walking tour & monument visit", category: "Activities", cost: 250, location: "Historic Quarter", notes: "Learn regional history" },
          { _id: "act_def_3", time: "13:30", title: "Authentic regional lunch at iconic eatery", category: "Food", cost: 300, location: "Old Bazaar", notes: "Regional special thali" },
          { _id: "act_def_4", time: "16:00", title: "Local cultural craft market exploration", category: "Activities", cost: 100, location: "Market Street", notes: "Handicrafts and souvenirs" },
          { _id: "act_def_5", time: "18:30", title: "Sunset viewpoint photography", category: "Activities", cost: 50, location: "Promenade", notes: "Golden hour capture" },
          { _id: "act_def_6", time: "20:30", title: "Welcome dinner & traveler meetup", category: "Food", cost: 450, location: "Rooftop Cafe", notes: "Connect with explorers" }
        ]
      },
      {
        dayNumber: 2,
        title: "Day 2: Core Highlights & Adventure Experiences",
        activities: [
          { _id: "act_def_7", time: "08:30", title: "Morning chai & local breakfast street food", category: "Food", cost: 150, location: "Main Chowk", notes: "Fresh breakfast specialties" },
          { _id: "act_def_8", time: "10:00", title: "Top-rated attraction & guided heritage tour", category: "Activities", cost: 350, location: "Heritage Zone", notes: "Deep dive exploration" },
          { _id: "act_def_9", time: "13:00", title: "Lunch at garden cafe", category: "Food", cost: 300, location: "Art District", notes: "Rest and recharge" },
          { _id: "act_def_10", time: "15:00", title: "Nature hike or outdoor adventure", category: "Activities", cost: 500, location: "Outskirts", notes: "Active outdoor exploration" },
          { _id: "act_def_11", time: "19:00", title: "Evening cultural performance or music show", category: "Activities", cost: 250, location: "Cultural Center", notes: "Folk performance" },
          { _id: "act_def_12", time: "20:30", title: "Dinner tasting regional culinary delicacies", category: "Food", cost: 400, location: "Gourmet Street", notes: "Signature sweets and curries" }
        ]
      },
      {
        dayNumber: 3,
        title: "Day 3: Hidden Gems, Photography & Wrap-up",
        activities: [
          { _id: "act_def_13", time: "08:00", title: "Sunrise photography stroll", category: "Activities", cost: 50, location: "Scenic Vista", notes: "Quiet moments" },
          { _id: "act_def_14", time: "09:30", title: "Specialty brunch & artisanal coffee", category: "Food", cost: 250, location: "Boho Cafe", notes: "Journaling and relaxing" },
          { _id: "act_def_15", time: "11:30", title: "Hidden museum or stepwell visit", category: "Activities", cost: 150, location: "Inner Alleys", notes: "Hidden architectural gem" },
          { _id: "act_def_16", time: "14:00", title: "Farewell lunch & packing souvenirs", category: "Food", cost: 300, location: "Town Square", notes: "Last taste of favorite dishes" },
          { _id: "act_def_17", time: "16:30", title: "Departure transit", category: "Transportation", cost: 500, location: "Transit Hub", notes: "Cab / Train to next journey" }
        ]
      }
    ]
  };

  for (const [key, tpl] of Object.entries(templates)) {
    if (key !== "default" && destLower.includes(key)) {
      return JSON.parse(JSON.stringify(tpl.slice(0, numDays)));
    }
  }

  const baseDefault = templates.default;
  const result = [];
  for (let i = 1; i <= numDays; i++) {
    const templateIndex = (i - 1) % baseDefault.length;
    const day = JSON.parse(JSON.stringify(baseDefault[templateIndex]));
    day.dayNumber = i;
    day.title = `Day ${i}: ${destinationName || "Adventure"} Discovery ${i > 3 ? `(Part ${i})` : ""}`;
    day.activities = day.activities.map(a => ({
      ...a,
      _id: "act_" + Math.random().toString(36).substr(2, 9)
    }));
    result.push(day);
  }
  return result;
};

// Seed in-memory storage from sampleTrips
Object.values(sampleTrips).flat().forEach((t) => {
  const initialItinerary = getDestinationTemplate(t.destination, 3);
  inMemoryTrips.set(t._id, {
    _id: t._id,
    userId: t.userId,
    title: `${t.destination} Solo Adventure`,
    destination: t.destination,
    state: "",
    startDate: new Date(t.startDate),
    endDate: new Date(t.endDate),
    travelers: 1,
    budget: 15000,
    currency: "INR",
    status: "Planning",
    coverImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
    notes: t.notes || "",
    itinerary: initialItinerary,
    expenses: [
      { _id: "exp_1", title: "Hostel / Stay", category: "Accommodation", cost: 3600, date: t.startDate, notes: "3 nights dorm" },
      { _id: "exp_2", title: "Train / Flight ticket", category: "Transportation", cost: 2500, date: t.startDate, notes: "Round trip" }
    ],
    createdAt: new Date()
  });
});
>>>>>>> 8588af7 (Update project)

// ===== VALIDATION HELPER =====
const validateTrip = (body) => {
  const errors = [];
  const { userId, destination, startDate, endDate } = body;

  if (!userId || typeof userId !== "string" || !userId.trim())
    errors.push("Traveler name or User ID is required");
  if (!destination || typeof destination !== "string" || !destination.trim())
    errors.push("Destination is required");
  if (!startDate) errors.push("Start date is required");
  if (!endDate) errors.push("End date is required");

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime())) errors.push("Start date is not valid");
    if (isNaN(end.getTime())) errors.push("End date is not valid");
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start)
      errors.push("End date must be on or after start date");
  }

  return errors;
};

// ===== ROUTES =====

// 1. Get Destination Itinerary Template
router.get("/templates/:destination", (req, res) => {
  const dest = req.params.destination;
  const days = parseInt(req.query.days, 10) || 3;
  const template = getDestinationTemplate(dest, days);
  res.json({ destination: dest, days, itinerary: template });
});

// 2. Get all trips
router.get("/", async (req, res) => {
  const { userId, destination } = req.query;

  if (isDbConnected()) {
    try {
      const query = {};
      if (userId) query.userId = new RegExp(`^${userId.trim()}$`, "i");
      if (destination) query.destination = new RegExp(`^${destination.trim()}$`, "i");
      const dbTrips = await Trip.find(query).sort({ createdAt: -1 });
      if (dbTrips && dbTrips.length > 0) {
        return res.json(dbTrips);
      }
    } catch (err) {
      // Fall through
    }
  }

  let trips = Array.from(inMemoryTrips.values());
  if (userId) {
    trips = trips.filter(t => t.userId && t.userId.toLowerCase() === userId.trim().toLowerCase());
  }
  if (destination) {
    trips = trips.filter(t => t.destination && t.destination.toLowerCase().includes(destination.trim().toLowerCase()));
  }
  res.json(trips);
});

// 3. Get single trip by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const dbTrip = await Trip.findById(id);
      if (dbTrip) return res.json(dbTrip);
    } catch (err) {
      // Fall through
    }
  }

  const memoryTrip = inMemoryTrips.get(id);
  if (memoryTrip) {
    return res.json(memoryTrip);
  }

  return res.status(404).json({ error: "Trip not found" });
});

// 4. Create new trip (Supports POST / and POST /add)
const handleCreateTrip = async (req, res) => {
  const errors = validateTrip(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join("; ") });
  }

  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const numDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);

  const initialItinerary = Array.isArray(req.body.itinerary) && req.body.itinerary.length > 0
    ? req.body.itinerary
    : getDestinationTemplate(req.body.destination, numDays);

  const tripData = {
    userId: req.body.userId.trim(),
    title: req.body.title ? req.body.title.trim() : `${req.body.destination.trim()} Solo Expedition`,
    destination: req.body.destination.trim(),
<<<<<<< HEAD
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
    notes: req.body.notes ? req.body.notes.trim().slice(0, 500) : "",
  };

  try {
    const trip = await prisma.trip.create({ data: tripData });
    return res.status(201).json(trip);
  } catch (err) {
    // If PostgreSQL fails, store in memory as fallback
    const name = tripData.destination.toLowerCase();
    const newTrip = { _id: "t" + Date.now(), ...tripData };
    if (!sampleTrips[name]) sampleTrips[name] = [];
    sampleTrips[name].push(newTrip);
    return res.status(201).json(newTrip);
=======
    state: req.body.state ? req.body.state.trim() : "",
    startDate: startDate,
    endDate: endDate,
    travelers: req.body.travelers ? Math.max(1, parseInt(req.body.travelers, 10)) : 1,
    budget: req.body.budget !== undefined && req.body.budget !== "" ? Math.max(0, parseFloat(req.body.budget)) : 15000,
    currency: req.body.currency || "INR",
    status: req.body.status || "Planning",
    coverImage: req.body.coverImage || "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
    notes: req.body.notes ? req.body.notes.trim().slice(0, 1000) : "",
    itinerary: initialItinerary,
    expenses: Array.isArray(req.body.expenses) ? req.body.expenses : []
  };

  if (isDbConnected()) {
    try {
      const trip = new Trip(tripData);
      await trip.save();
      return res.status(201).json(trip);
    } catch (err) {
      // Fall through to memory
    }
>>>>>>> 8588af7 (Update project)
  }

  const fakeId = "t_" + Date.now();
  const newTrip = { _id: fakeId, ...tripData, createdAt: new Date() };
  inMemoryTrips.set(fakeId, newTrip);
  return res.status(201).json(newTrip);
};

router.post("/", handleCreateTrip);
router.post("/add", handleCreateTrip);

// 5. Update trip details
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updateFields = {};

  if (req.body.title !== undefined) updateFields.title = req.body.title.trim();
  if (req.body.destination !== undefined) updateFields.destination = req.body.destination.trim();
  if (req.body.state !== undefined) updateFields.state = req.body.state.trim();
  if (req.body.startDate !== undefined) updateFields.startDate = new Date(req.body.startDate);
  if (req.body.endDate !== undefined) updateFields.endDate = new Date(req.body.endDate);
  if (req.body.travelers !== undefined) updateFields.travelers = Math.max(1, parseInt(req.body.travelers, 10));
  if (req.body.budget !== undefined) updateFields.budget = Math.max(0, parseFloat(req.body.budget));
  if (req.body.status !== undefined) updateFields.status = req.body.status;
  if (req.body.notes !== undefined) updateFields.notes = req.body.notes.trim();
  if (req.body.coverImage !== undefined) updateFields.coverImage = req.body.coverImage;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const updated = await Trip.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
      if (updated) return res.json(updated);
    } catch (err) {}
  }

  const memoryTrip = inMemoryTrips.get(id);
  if (memoryTrip) {
    const updated = { ...memoryTrip, ...updateFields };
    inMemoryTrips.set(id, updated);
    return res.json(updated);
  }

  return res.status(404).json({ error: "Trip not found" });
});

<<<<<<< HEAD
// Get all trips
router.get("/", async (req, res) => {
  try {
    const dbTrips = await prisma.trip.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (dbTrips && dbTrips.length > 0) return res.json(dbTrips);
  } catch (err) {
    // Fall through to sample data
=======
// 6. Delete a trip
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const deleted = await Trip.findByIdAndDelete(id);
      if (deleted) return res.json({ message: "Trip successfully deleted", id });
    } catch (err) {}
>>>>>>> 8588af7 (Update project)
  }

  if (inMemoryTrips.has(id)) {
    inMemoryTrips.delete(id);
    return res.json({ message: "Trip successfully deleted", id });
  }

  return res.status(404).json({ error: "Trip not found" });
});

// 7. Add activity to a day
router.post("/:id/activity", async (req, res) => {
  const { id } = req.params;
  const { dayNumber, time, title, category, cost, location, notes } = req.body;

<<<<<<< HEAD
  try {
    const dbTrips = await prisma.trip.findMany({
      where: {
        destination: { equals: dest, mode: "insensitive" },
      },
      orderBy: { startDate: "asc" },
    });
    if (dbTrips && dbTrips.length > 0) return res.json(dbTrips);
  } catch (err) {
    // Fall through
=======
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Activity title is required" });
>>>>>>> 8588af7 (Update project)
  }

  const newActivity = {
    _id: "act_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    time: time || "09:00",
    title: title.trim(),
    category: category || "Activities",
    cost: parseFloat(cost) || 0,
    location: location ? location.trim() : "",
    notes: notes ? notes.trim() : ""
  };

  const targetDayNumber = parseInt(dayNumber, 10) || 1;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const trip = await Trip.findById(id);
      if (trip) {
        let day = trip.itinerary.find(d => d.dayNumber === targetDayNumber);
        if (!day) {
          day = { dayNumber: targetDayNumber, title: `Day ${targetDayNumber}`, activities: [] };
          trip.itinerary.push(day);
        }
        day.activities.push(newActivity);
        trip.itinerary.sort((a, b) => a.dayNumber - b.dayNumber);
        await trip.save();
        return res.json(trip);
      }
    } catch (err) {}
  }

  const memoryTrip = inMemoryTrips.get(id);
  if (memoryTrip) {
    let day = memoryTrip.itinerary.find(d => d.dayNumber === targetDayNumber);
    if (!day) {
      day = { dayNumber: targetDayNumber, title: `Day ${targetDayNumber}`, activities: [] };
      memoryTrip.itinerary.push(day);
    }
    day.activities.push(newActivity);
    memoryTrip.itinerary.sort((a, b) => a.dayNumber - b.dayNumber);
    inMemoryTrips.set(id, memoryTrip);
    return res.json(memoryTrip);
  }

  return res.status(404).json({ error: "Trip not found" });
});

// 8. Update an activity
router.put("/:id/activity/:activityId", async (req, res) => {
  const { id, activityId } = req.params;
  const { targetDayNumber, time, title, category, cost, location, notes } = req.body;

  const updateInTripObject = (trip) => {
    let targetActivity = null;
    let originalDay = null;

    for (const day of trip.itinerary) {
      const actIndex = day.activities.findIndex(a => String(a._id) === String(activityId));
      if (actIndex !== -1) {
        targetActivity = day.activities[actIndex];
        originalDay = day;
        if (targetDayNumber && parseInt(targetDayNumber, 10) !== day.dayNumber) {
          day.activities.splice(actIndex, 1);
        }
        break;
      }
    }

    if (!targetActivity) return null;

    if (time !== undefined) targetActivity.time = time;
    if (title !== undefined) targetActivity.title = title.trim();
    if (category !== undefined) targetActivity.category = category;
    if (cost !== undefined) targetActivity.cost = parseFloat(cost) || 0;
    if (location !== undefined) targetActivity.location = location.trim();
    if (notes !== undefined) targetActivity.notes = notes.trim();

    if (targetDayNumber && originalDay && originalDay.dayNumber !== parseInt(targetDayNumber, 10)) {
      const targetDayInt = parseInt(targetDayNumber, 10);
      let newDay = trip.itinerary.find(d => d.dayNumber === targetDayInt);
      if (!newDay) {
        newDay = { dayNumber: targetDayInt, title: `Day ${targetDayInt}`, activities: [] };
        trip.itinerary.push(newDay);
      }
      newDay.activities.push(targetActivity);
      trip.itinerary.sort((a, b) => a.dayNumber - b.dayNumber);
    }

    return trip;
  };

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      let trip = await Trip.findById(id);
      if (trip) {
        trip = updateInTripObject(trip);
        if (trip) {
          await trip.save();
          return res.json(trip);
        }
      }
    } catch (err) {}
  }

  const memoryTrip = inMemoryTrips.get(id);
  if (memoryTrip) {
    const updatedTrip = updateInTripObject(memoryTrip);
    if (updatedTrip) {
      inMemoryTrips.set(id, updatedTrip);
      return res.json(updatedTrip);
    }
  }

  return res.status(404).json({ error: "Trip or activity not found" });
});

// 9. Delete an activity
router.delete("/:id/activity/:activityId", async (req, res) => {
  const { id, activityId } = req.params;

  const removeFromTrip = (trip) => {
    let found = false;
    for (const day of trip.itinerary) {
      const idx = day.activities.findIndex(a => String(a._id) === String(activityId));
      if (idx !== -1) {
        day.activities.splice(idx, 1);
        found = true;
        break;
      }
    }
    return found ? trip : null;
  };

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const trip = await Trip.findById(id);
      if (trip) {
        const modified = removeFromTrip(trip);
        if (modified) {
          await trip.save();
          return res.json(trip);
        }
      }
    } catch (err) {}
  }

  const memoryTrip = inMemoryTrips.get(id);
  if (memoryTrip) {
    const modified = removeFromTrip(memoryTrip);
    if (modified) {
      inMemoryTrips.set(id, modified);
      return res.json(modified);
    }
  }

  return res.status(404).json({ error: "Trip or activity not found" });
});

// 10. Update entire Itinerary
router.put("/:id/itinerary", async (req, res) => {
  const { id } = req.params;
  const { itinerary } = req.body;

  if (!Array.isArray(itinerary)) {
    return res.status(400).json({ error: "itinerary must be an array of days" });
  }

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const updated = await Trip.findByIdAndUpdate(
        id,
        { $set: { itinerary } },
        { new: true }
      );
      if (updated) return res.json(updated);
    } catch (err) {}
  }

  const memoryTrip = inMemoryTrips.get(id);
  if (memoryTrip) {
    memoryTrip.itinerary = itinerary;
    inMemoryTrips.set(id, memoryTrip);
    return res.json(memoryTrip);
  }

  return res.status(404).json({ error: "Trip not found" });
});

// 11. Add budget expense
router.post("/:id/expense", async (req, res) => {
  const { id } = req.params;
  const { title, category, cost, date, notes } = req.body;

  if (!title || cost === undefined) {
    return res.status(400).json({ error: "Title and cost are required" });
  }

  const expenseItem = {
    _id: "exp_" + Date.now(),
    title: title.trim(),
    category: category || "Miscellaneous",
    cost: parseFloat(cost) || 0,
    date: date || new Date().toISOString().split("T")[0],
    notes: notes ? notes.trim() : ""
  };

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const trip = await Trip.findById(id);
      if (trip) {
        if (!Array.isArray(trip.expenses)) trip.expenses = [];
        trip.expenses.push(expenseItem);
        await trip.save();
        return res.json(trip);
      }
    } catch (err) {}
  }

  const memoryTrip = inMemoryTrips.get(id);
  if (memoryTrip) {
    if (!Array.isArray(memoryTrip.expenses)) memoryTrip.expenses = [];
    memoryTrip.expenses.push(expenseItem);
    inMemoryTrips.set(id, memoryTrip);
    return res.json(memoryTrip);
  }

  return res.status(404).json({ error: "Trip not found" });
});

// 12. Delete expense
router.delete("/:id/expense/:expenseId", async (req, res) => {
  const { id, expenseId } = req.params;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const trip = await Trip.findById(id);
      if (trip && Array.isArray(trip.expenses)) {
        trip.expenses = trip.expenses.filter(e => String(e._id) !== String(expenseId));
        await trip.save();
        return res.json(trip);
      }
    } catch (err) {}
  }

  const memoryTrip = inMemoryTrips.get(id);
  if (memoryTrip && Array.isArray(memoryTrip.expenses)) {
    memoryTrip.expenses = memoryTrip.expenses.filter(e => String(e._id) !== String(expenseId));
    inMemoryTrips.set(id, memoryTrip);
    return res.json(memoryTrip);
  }

  return res.status(404).json({ error: "Trip or expense not found" });
});

// ==========================================
// 13. PUBLIC TRIP SHARING ENDPOINTS (PHASE 9)
// ==========================================
const crypto = require("crypto");
const User = require("../models/User");

// POST /api/trips/:id/share — Generate or toggle public shareable link
router.post("/:id/share", async (req, res) => {
  const { id } = req.params;

  let shareId = "tr_" + crypto.randomBytes(4).toString("hex");

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const trip = await Trip.findById(id);
      if (trip) {
        if (!trip.shareId) {
          trip.shareId = shareId;
        } else {
          shareId = trip.shareId;
        }
        trip.isPublic = true;
        trip.sharedAt = new Date();
        await trip.save();

        return res.json({
          success: true,
          shareId: trip.shareId,
          shareUrl: `/share/trip/${trip.shareId}`,
          isPublic: true,
          message: "Trip is now publicly shareable"
        });
      }
    } catch (err) {}
  }

  const memoryTrip = inMemoryTrips.get(id);
  if (memoryTrip) {
    if (!memoryTrip.shareId) memoryTrip.shareId = shareId;
    memoryTrip.isPublic = true;
    memoryTrip.sharedAt = new Date();
    inMemoryTrips.set(id, memoryTrip);

    return res.json({
      success: true,
      shareId: memoryTrip.shareId,
      shareUrl: `/share/trip/${memoryTrip.shareId}`,
      isPublic: true,
      message: "Trip is now publicly shareable"
    });
  }

  return res.status(404).json({ error: "Trip not found" });
});

// GET /api/trips/public/:shareId — Public read-only trip viewer (Keeps private info hidden)
router.get("/public/:shareId", async (req, res) => {
  const { shareId } = req.params;

  let trip = null;
  if (isDbConnected()) {
    try {
      trip = await Trip.findOne({
        $or: [
          { shareId: shareId, isPublic: true },
          { _id: mongoose.Types.ObjectId.isValid(shareId) ? shareId : null, isPublic: true }
        ]
      }).lean();
    } catch (err) {}
  }

  if (!trip) {
    // Check in-memory trips
    for (const [_, memTrip] of inMemoryTrips.entries()) {
      if ((memTrip.shareId === shareId || memTrip._id === shareId) && memTrip.isPublic) {
        trip = memTrip;
        break;
      }
    }
  }

  if (!trip) {
    return res.status(404).json({ error: "Public trip not found or link has expired" });
  }

  // Fetch public creator info (strip private email & passwords)
  let creator = { name: "Solo Explorer", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria" };
  if (trip.userId) {
    try {
      const u = await User.findById(trip.userId).select("name username avatar travelStyle").lean();
      if (u) {
        creator = {
          name: u.name,
          username: u.username,
          avatar: u.avatar || creator.avatar,
          travelStyle: u.travelStyle || "Cultural Explorer"
        };
      }
    } catch (e) {}
  }

  // Calculate estimated cost & summary
  let totalEstimatedCost = 0;
  if (Array.isArray(trip.itinerary)) {
    trip.itinerary.forEach(day => {
      if (Array.isArray(day.activities)) {
        day.activities.forEach(act => {
          totalEstimatedCost += act.cost || 0;
        });
      }
    });
  }

  // Strictly sanitize: completely hide private personal expenses, internal notes, and sensitive auth data
  const sanitizedTrip = {
    _id: trip._id,
    shareId: trip.shareId,
    title: trip.title || `Trip to ${trip.destination}`,
    destination: trip.destination,
    state: trip.state,
    startDate: trip.startDate,
    endDate: trip.endDate,
    travelers: trip.travelers || 1,
    budget: trip.budget || totalEstimatedCost,
    totalEstimatedCost,
    status: trip.status || "Planning",
    coverImage: trip.coverImage,
    itinerary: trip.itinerary || [],
    sharedAt: trip.sharedAt,
    isPublic: true
  };

  return res.json({
    success: true,
    trip: sanitizedTrip,
    creator,
    ...sanitizedTrip
  });
});

// DELETE /api/trips/:id/share — Revoke public sharing
router.delete("/:id/share", async (req, res) => {
  const { id } = req.params;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const trip = await Trip.findById(id);
      if (trip) {
        trip.isPublic = false;
        await trip.save();
        return res.json({ success: true, message: "Trip is now private", isPublic: false });
      }
    } catch (err) {}
  }

  const memoryTrip = inMemoryTrips.get(id);
  if (memoryTrip) {
    memoryTrip.isPublic = false;
    inMemoryTrips.set(id, memoryTrip);
    return res.json({ success: true, message: "Trip is now private", isPublic: false });
  }

  return res.status(404).json({ error: "Trip not found" });
});

module.exports = router;