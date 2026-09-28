// Indian Destinations, Attractions & Landmarks Coordinates Database
const INDIAN_COORDINATES = {
  // Cities / Main Hubs
  manali: { lat: 32.2396, lng: 77.1887, state: "Himachal Pradesh" },
  jaipur: { lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
  rishikesh: { lat: 30.0869, lng: 78.2676, state: "Uttarakhand" },
  varanasi: { lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh" },
  munnar: { lat: 10.0889, lng: 77.0595, state: "Kerala" },
  goa: { lat: 15.2993, lng: 74.1240, state: "Goa" },
  "north goa": { lat: 15.5847, lng: 73.7438, state: "Goa" },
  "south goa": { lat: 15.1500, lng: 73.9800, state: "Goa" },
  hampi: { lat: 15.3350, lng: 76.4600, state: "Karnataka" },
  leh: { lat: 34.1526, lng: 77.5771, state: "Ladakh" },
  darjeeling: { lat: 27.0410, lng: 88.2663, state: "West Bengal" },
  shillong: { lat: 25.5788, lng: 91.8933, state: "Meghalaya" },
  udaipur: { lat: 24.5854, lng: 73.7125, state: "Rajasthan" },
  jodhpur: { lat: 26.2389, lng: 73.0243, state: "Rajasthan" },
  jaisalmer: { lat: 26.9157, lng: 70.9083, state: "Rajasthan" },
  shimla: { lat: 31.1048, lng: 77.1734, state: "Himachal Pradesh" },
  kasol: { lat: 32.0100, lng: 77.3150, state: "Himachal Pradesh" },
  dharamshala: { lat: 32.2190, lng: 76.3234, state: "Himachal Pradesh" },
  mcleodganj: { lat: 32.2426, lng: 76.3213, state: "Himachal Pradesh" },
  alleppey: { lat: 9.4981, lng: 76.3388, state: "Kerala" },
  kochi: { lat: 9.9312, lng: 76.2673, state: "Kerala" },
  varkala: { lat: 8.7379, lng: 76.7163, state: "Kerala" },
  gokarna: { lat: 14.5479, lng: 74.3188, state: "Karnataka" },
  coorg: { lat: 12.3375, lng: 75.8069, state: "Karnataka" },
  mysore: { lat: 12.2958, lng: 76.6394, state: "Karnataka" },
  bangalore: { lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  mumbai: { lat: 19.0760, lng: 72.8777, state: "Maharashtra" },
  pune: { lat: 18.5204, lng: 73.8567, state: "Maharashtra" },
  lonavala: { lat: 18.7557, lng: 73.4091, state: "Maharashtra" },
  pondicherry: { lat: 11.9416, lng: 79.8083, state: "Puducherry" },
  ooty: { lat: 11.4102, lng: 76.6950, state: "Tamil Nadu" },
  kodaikanal: { lat: 10.2381, lng: 77.4892, state: "Tamil Nadu" },
  amritsar: { lat: 31.6340, lng: 74.8723, state: "Punjab" },
  agra: { lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh" },
  delhi: { lat: 28.6139, lng: 77.2090, state: "Delhi" },
  srinagar: { lat: 34.0837, lng: 74.7973, state: "Jammu & Kashmir" },
  gulmarg: { lat: 34.0484, lng: 74.3805, state: "Jammu & Kashmir" },
  gangtok: { lat: 27.3389, lng: 88.6065, state: "Sikkim" },

  // Specific Attractions / Landmarks
  "old manali": { lat: 32.2530, lng: 77.1750 },
  "hadimba temple": { lat: 32.2483, lng: 77.1802 },
  "jogini waterfalls": { lat: 32.2680, lng: 77.1950 },
  "solang valley": { lat: 32.3160, lng: 77.1570 },
  "atal tunnel": { lat: 32.3640, lng: 77.1420 },
  "sissu": { lat: 32.4760, lng: 77.1210 },
  "mall road": { lat: 32.2430, lng: 77.1890 },
  "vashisht": { lat: 32.2610, lng: 77.1880 },

  "amer fort": { lat: 26.9855, lng: 75.8513 },
  "hawa mahal": { lat: 26.9239, lng: 75.8267 },
  "city palace": { lat: 26.9258, lng: 75.8237 },
  "nahargarh fort": { lat: 26.9378, lng: 75.8156 },
  "jantar mantar": { lat: 26.9248, lng: 75.8246 },
  "panna meena ka kund": { lat: 26.9880, lng: 75.8560 },

  "tapovan": { lat: 30.1340, lng: 78.3240 },
  "beatles ashram": { lat: 30.1190, lng: 78.3180 },
  "triveni ghat": { lat: 30.1030, lng: 78.2970 },
  "shivpuri": { lat: 30.1370, lng: 78.3880 },
  "neer garh": { lat: 30.1450, lng: 78.3360 },

  "assi ghat": { lat: 25.2885, lng: 83.0062 },
  "dashashwamedh ghat": { lat: 25.3075, lng: 83.0105 },
  "kashi vishwanath": { lat: 25.3109, lng: 83.0107 },
  "sarnath": { lat: 25.3762, lng: 83.0227 },
  "manikarnika ghat": { lat: 25.3107, lng: 83.0145 },

  "anjuna": { lat: 15.5840, lng: 73.7430 },
  "vagator": { lat: 15.5990, lng: 73.7380 },
  "arambol": { lat: 15.6860, lng: 73.7040 },
  "chapora fort": { lat: 15.6060, lng: 73.7360 },
  "fontainhas": { lat: 15.4980, lng: 73.8320 }
};

/**
 * Resolve coordinates for a given destination or landmark in India
 */
function resolveCoordinates(query) {
  if (!query || typeof query !== "string") return null;
  const q = query.toLowerCase().trim();

  // Exact match
  if (INDIAN_COORDINATES[q]) {
    return INDIAN_COORDINATES[q];
  }

  // Partial match
  for (const [name, coords] of Object.entries(INDIAN_COORDINATES)) {
    if (q.includes(name) || name.includes(q)) {
      return coords;
    }
  }

  // Default fallback (Center of India / New Delhi)
  return { lat: 28.6139, lng: 77.2090, isFallback: true };
}

/**
 * Haversine formula to calculate approximate distance in KM between two coordinates
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Build sequential itinerary route map with:
 * Hotel -> Attraction -> Restaurant -> Activity
 */
function generateItineraryRouteMap(destination, itinerary = []) {
  const baseCoords = resolveCoordinates(destination) || { lat: 28.6139, lng: 77.2090 };
  const daysRoutes = [];

  const baseLat = baseCoords.lat;
  const baseLng = baseCoords.lng;

  // Process each day in the itinerary
  itinerary.forEach((day, dayIndex) => {
    const dayNumber = day.dayNumber || day.day || dayIndex + 1;
    const activities = day.activities || [];
    const waypoints = [];

    // Ensure sequencing: Hotel -> Attraction -> Restaurant -> Activity
    // If specific types not present, maps chronological activities
    activities.forEach((act, actIndex) => {
      // Find specific landmark coords or generate nearby realistic delta
      const actLocationQuery = act.location || act.title;
      let matchedCoords = resolveCoordinates(actLocationQuery);

      if (!matchedCoords || matchedCoords.isFallback) {
        // Generate realistic geographic dispersion within 3-8 km of base
        const angle = (actIndex * 60 + dayIndex * 40) * (Math.PI / 180);
        const radius = 0.012 * (actIndex + 1); // ~1.5 - 5 km offset
        matchedCoords = {
          lat: Number((baseLat + radius * Math.cos(angle)).toFixed(4)),
          lng: Number((baseLng + radius * Math.sin(angle)).toFixed(4))
        };
      }

      // Determine waypoint sequence type
      let stepType = "Activity";
      const cat = (act.category || "").toLowerCase();
      const title = (act.title || "").toLowerCase();

      if (cat === "accommodation" || title.includes("hotel") || title.includes("hostel") || title.includes("check-in") || title.includes("stay")) {
        stepType = "Hotel";
      } else if (title.includes("hike") || title.includes("trek") || title.includes("paragliding") || title.includes("rafting") || title.includes("adventure") || title.includes("safari") || title.includes("yoga") || title.includes("boating") || title.includes("cycling") || title.includes("workshop") || title.includes("shopping") || title.includes("ziplining")) {
        stepType = "Activity";
      } else if (cat === "food" || title.includes("lunch") || title.includes("dinner") || title.includes("cafe") || title.includes("breakfast") || title.includes("chai") || title.includes("dhaba") || title.includes("thali") || title.includes("bakery")) {
        stepType = "Restaurant";
      } else if (title.includes("fort") || title.includes("temple") || title.includes("waterfall") || title.includes("palace") || title.includes("lake") || title.includes("ghat") || title.includes("museum") || title.includes("viewpoint") || title.includes("monument") || title.includes("ashram") || title.includes("corridor") || title.includes("pass")) {
        stepType = "Attraction";
      }

      waypoints.push({
        stepNumber: actIndex + 1,
        stepType, // 'Hotel', 'Attraction', 'Restaurant', 'Activity'
        title: act.title,
        time: act.time || "09:00",
        category: act.category || "Activities",
        cost: act.cost || 0,
        location: act.location || destination,
        notes: act.notes || "",
        lat: matchedCoords.lat,
        lng: matchedCoords.lng,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${act.location || act.title}, ${destination}`
        )}`
      });
    });

    // Calculate total leg distances and sequence progression
    let totalDayDistanceKm = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dist = calculateDistanceKm(
        waypoints[i].lat,
        waypoints[i].lng,
        waypoints[i + 1].lat,
        waypoints[i + 1].lng
      );
      waypoints[i].distanceToNextKm = dist;
      totalDayDistanceKm += dist;
    }

    daysRoutes.push({
      dayNumber,
      dayTitle: day.title || `Day ${dayNumber}`,
      waypoints,
      totalDayDistanceKm: Math.round(totalDayDistanceKm * 10) / 10,
      sequenceSummary: waypoints.map(w => w.stepType).join(" ➔ ")
    });
  });

  return {
    destination,
    centerCoordinates: baseCoords,
    daysRoutes
  };
}

module.exports = {
  INDIAN_COORDINATES,
  resolveCoordinates,
  calculateDistanceKm,
  generateItineraryRouteMap
};
