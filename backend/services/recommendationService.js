const Destination = require("../models/Destination");
const User = require("../models/User");
const Trip = require("../models/Trip");

// Curated Indian Destination dataset with rich attributes for recommendation scoring
const INDIAN_DESTINATION_DATABASE = [
  {
    name: "Manali",
    state: "Himachal Pradesh",
    tagline: "Valley of the Gods & Himalayan Adventure Hub",
    description: "Nestled along the Beas River, Manali is India's top destination for high-altitude trekking, Solang adventure sports, Old Manali cafes, and Atal Tunnel explorations.",
    category: ["Trekking", "Adventure Seeker", "Photography", "Backpacking", "Mountains"],
    travelStyles: ["Budget Backpacker", "Adventure Seeker", "Weekend Wanderer"],
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    minBudget: 8000,
    maxBudget: 25000,
    idealDurationMin: 4,
    idealDurationMax: 7,
    safetyRating: 4.8,
    soloScore: 9.4,
    bestTimeToVisit: "October to June",
    highlights: ["Hampta Pass Trek", "Solang Valley Paragliding", "Old Manali Cafes", "Jogini Waterfall", "Rohtang Pass"],
    slug: "manali"
  },
  {
    name: "Kashmir (Srinagar & Gulmarg)",
    state: "Jammu and Kashmir",
    tagline: "Paradise on Earth with Alpine Slopes & Dal Lake",
    description: "Experience iconic Shikara rides on Dal Lake, world-class snow slopes & gondola in Gulmarg, saffron valleys of Pampore, and pine meadows in Pahalgam.",
    category: ["Photography", "Mountains", "Cultural Explorer", "Heritage & Culture", "Slow Nomad"],
    travelStyles: ["Cultural Explorer", "Luxury Solivagant", "Slow Nomad", "Photography"],
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800",
    minBudget: 12000,
    maxBudget: 40000,
    idealDurationMin: 5,
    idealDurationMax: 8,
    safetyRating: 4.5,
    soloScore: 8.9,
    bestTimeToVisit: "March to October & Winter for Snow",
    highlights: ["Dal Lake Houseboat Stay", "Gulmarg Gondola Phase 2", "Betaab Valley", "Shankaracharya Temple"],
    slug: "kashmir"
  },
  {
    name: "Sikkim (Gangtok & Pelling)",
    state: "Sikkim",
    tagline: "Land of Kanchenjunga & Organic Monasteries",
    description: "India's first fully organic state offers majestic views of Mount Kanchenjunga, serene Tibetan Buddhist monasteries, glacial Tsomgo Lake, and rhododendron valleys.",
    category: ["Trekking", "Heritage & Culture", "Yoga & Wellness", "Mountains", "Photography"],
    travelStyles: ["Slow Nomad", "Cultural Explorer", "Budget Backpacker"],
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800",
    minBudget: 10000,
    maxBudget: 30000,
    idealDurationMin: 4,
    idealDurationMax: 7,
    safetyRating: 4.9,
    soloScore: 9.2,
    bestTimeToVisit: "September to May",
    highlights: ["Rumtek Monastery", "Tsomgo Glacial Lake", "Pelling Skywalk", "Nathula Pass View"],
    slug: "sikkim"
  },
  {
    name: "Goa (North & South)",
    state: "Goa",
    tagline: "Sun, Sand, Portuguese Heritage & Bohemian Vibe",
    description: "From the sunset drum circles of Arambol to pristine secluded coves of Palolem and spice plantations of Ponda, Goa is India's premier solo coastal retreat.",
    category: ["Beach & Chill", "Backpacking", "Street Food", "Yoga & Wellness", "Photography"],
    travelStyles: ["Budget Backpacker", "Slow Nomad", "Weekend Wanderer"],
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    minBudget: 7000,
    maxBudget: 28000,
    idealDurationMin: 3,
    idealDurationMax: 7,
    safetyRating: 4.7,
    soloScore: 9.5,
    bestTimeToVisit: "November to March",
    highlights: ["Arambol Sweet Water Lake", "Palolem Beach Kayaking", "Fontainhas Latin Quarter", "Dudhsagar Waterfalls"],
    slug: "goa"
  },
  {
    name: "Varkala & Munnar",
    state: "Kerala",
    tagline: "Clifftop Sunsets & Emerald Tea Canopy",
    description: "Perched dramatically above the Arabian Sea, Varkala's red cliffs offer yoga and surf breaks, while Munnar mesmerizes with rolling tea estates and misty peaks.",
    category: ["Beach & Chill", "Trekking", "Yoga & Wellness", "Street Food", "Slow Nomad"],
    travelStyles: ["Slow Nomad", "Cultural Explorer", "Budget Backpacker"],
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    minBudget: 8000,
    maxBudget: 26000,
    idealDurationMin: 4,
    idealDurationMax: 7,
    safetyRating: 4.9,
    soloScore: 9.3,
    bestTimeToVisit: "October to March",
    highlights: ["Varkala North Cliff", "Munnar Tea Museum", "Anamudi Peak Trail", "Alleppey Backwaters"],
    slug: "kerala"
  },
  {
    name: "Jaisalmer & Jodhpur",
    state: "Rajasthan",
    tagline: "Golden Thar Desert & Blue City Fortresses",
    description: "Experience living fortresses, camel safaris under starlit desert skies, blue painted heritage lanes, and rich Rajput culinary heritage.",
    category: ["Heritage & Culture", "Photography", "Street Food", "Backpacking"],
    travelStyles: ["Cultural Explorer", "Budget Backpacker", "Slow Nomad"],
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
    minBudget: 6000,
    maxBudget: 22000,
    idealDurationMin: 3,
    idealDurationMax: 6,
    safetyRating: 4.6,
    soloScore: 9.0,
    bestTimeToVisit: "October to March",
    highlights: ["Jaisalmer Living Fort", "Sam Sand Dunes Camp", "Mehrangarh Fort", "Blue Alleys of Navchokiya"],
    slug: "rajasthan"
  },
  {
    name: "Rishikesh",
    state: "Uttarakhand",
    tagline: "Yoga Capital of the World & River Rafting Capital",
    description: "Set on the holy Ganges River at the foothills of the Himalayas, Rishikesh blends yoga ashrams, evening Ganga aarti, white-water rapids, and bungee jumping.",
    category: ["Yoga & Wellness", "Adventure Seeker", "Trekking", "Spirituality", "Backpacking"],
    travelStyles: ["Adventure Seeker", "Slow Nomad", "Budget Backpacker"],
    image: "https://images.unsplash.com/photo-1609137144822-4828131341a9?w=800",
    minBudget: 5000,
    maxBudget: 18000,
    idealDurationMin: 2,
    idealDurationMax: 5,
    safetyRating: 4.8,
    soloScore: 9.3,
    bestTimeToVisit: "September to November & March to May",
    highlights: ["Ganga Aarti at Triveni Ghat", "Shivpuri White Water Rafting", "Beatles Ashram", "Neer Garh Waterfall"],
    slug: "rishikesh"
  },
  {
    name: "Hampi",
    state: "Karnataka",
    tagline: "UNESCO Boulder Wonderland of Ancient Vijayanagara",
    description: "Surreal boulder-strewn landscapes along the Tungabhadra River, ancient 14th-century temple architecture, vibrant hippie island cafes, and coracle rides.",
    category: ["Heritage & Culture", "Photography", "Backpacking", "Slow Nomad"],
    travelStyles: ["Cultural Explorer", "Budget Backpacker", "Slow Nomad"],
    image: "https://images.unsplash.com/photo-1600100397608-f010e4708779?w=800",
    minBudget: 5000,
    maxBudget: 18000,
    idealDurationMin: 3,
    idealDurationMax: 5,
    safetyRating: 4.7,
    soloScore: 9.1,
    bestTimeToVisit: "October to March",
    highlights: ["Virupaksha Temple", "Matanga Hill Sunrise", "Vittala Stone Chariot", "Coracle Boat Ride"],
    slug: "hampi"
  },
  {
    name: "Spiti Valley",
    state: "Himachal Pradesh",
    tagline: "Middle Land High-Altitude Cold Desert & Stargazing",
    description: "One of the most remote, pristine valleys in the Himalayas. Ancient cliffside monasteries, world's highest post office (Hikkim), and surreal Chandratal lake.",
    category: ["Trekking", "Adventure Seeker", "Photography", "Mountains"],
    travelStyles: ["Adventure Seeker", "Slow Nomad", "Budget Backpacker"],
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800",
    minBudget: 12000,
    maxBudget: 35000,
    idealDurationMin: 6,
    idealDurationMax: 10,
    safetyRating: 4.6,
    soloScore: 8.8,
    bestTimeToVisit: "June to October",
    highlights: ["Key Gompa Monastery", "Chandratal Lake Camping", "Hikkim Post Office", "Pin Valley National Park"],
    slug: "spiti"
  },
  {
    name: "Varanasi",
    state: "Uttar Pradesh",
    tagline: "World's Oldest Living City & Spiritual Ghats",
    description: "Sacred ghats along Mother Ganga, evening spiritual chants, winding ancient alleys with world-famous street food, silk weaving, and sunrise boat rides.",
    category: ["Heritage & Culture", "Street Food", "Spirituality", "Photography"],
    travelStyles: ["Cultural Explorer", "Slow Nomad", "Budget Backpacker"],
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
    minBudget: 4500,
    maxBudget: 16000,
    idealDurationMin: 2,
    idealDurationMax: 4,
    safetyRating: 4.5,
    soloScore: 8.7,
    bestTimeToVisit: "October to March",
    highlights: ["Dashashwamedh Ghat Aarti", "Assi Ghat Morning Yoga", "Kashi Vishwanath Temple", "Banarasi Street Food Trail"],
    slug: "varanasi"
  },
  {
    name: "Meghalaya (Shillong & Cherrapunji)",
    state: "Meghalaya",
    tagline: "Abode of Clouds & Living Root Bridges",
    description: "Pristine northeast paradise with double-decker living root bridges, emerald transparent waters of Umngot River in Dawki, and roaring Nohkalikai Falls.",
    category: ["Trekking", "Wildlife & Nature", "Photography", "Backpacking"],
    travelStyles: ["Adventure Seeker", "Slow Nomad", "Cultural Explorer"],
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800",
    minBudget: 10000,
    maxBudget: 28000,
    idealDurationMin: 5,
    idealDurationMax: 8,
    safetyRating: 4.9,
    soloScore: 9.3,
    bestTimeToVisit: "October to April",
    highlights: ["Double Decker Root Bridge", "Dawki River Boating", "Nohkalikai Falls", "Mawlynnong Cleanest Village"],
    slug: "meghalaya"
  },
  {
    name: "Bandhavgarh & Kanha",
    state: "Madhya Pradesh",
    tagline: "Heart of Wild Bharat & Royal Bengal Tiger Safari",
    description: "India's highest density of Bengal Tigers, ancient sal forests, safari expeditions, and pristine wilderness that inspired Kipling's Jungle Book.",
    category: ["Wildlife & Nature", "Photography", "Adventure Seeker"],
    travelStyles: ["Adventure Seeker", "Cultural Explorer"],
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800",
    minBudget: 9000,
    maxBudget: 32000,
    idealDurationMin: 3,
    idealDurationMax: 6,
    safetyRating: 4.7,
    soloScore: 8.9,
    bestTimeToVisit: "October to June",
    highlights: ["Jeep Safari in Tala Zone", "Kanha Meadow Watchtower", "Bandhavgarh Fort Trek", "Tribal Village Walks"],
    slug: "madhya-pradesh"
  }
];

/**
 * Calculate personalized match score for a destination
 */
const calculateMatchScore = (dest, userProfile) => {
  const {
    interests = [],
    travelStyle = "Cultural Explorer",
    budget = 15000,
    duration = 5,
    favorites = [],
    previousTrips = []
  } = userProfile;

  let score = 50; // base baseline score
  const reasons = [];

  // 1. Interests Overlap (Weight: 35%)
  if (interests.length > 0) {
    const matchedInterests = interests.filter((interest) =>
      dest.category.some((cat) =>
        cat.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(cat.toLowerCase())
      )
    );

    const overlapRatio = matchedInterests.length / Math.max(1, interests.length);
    const interestPoints = Math.round(overlapRatio * 35);
    score += interestPoints;

    if (matchedInterests.length > 0) {
      reasons.push(`Strong match for your interest in ${matchedInterests.slice(0, 2).join(" & ")}`);
    }
  } else {
    score += 20; // default average
  }

  // 2. Travel Style Compatibility (Weight: 25%)
  if (dest.travelStyles.includes(travelStyle)) {
    score += 25;
    reasons.push(`Tailored for your "${travelStyle}" travel style`);
  } else {
    score += 10;
  }

  // 3. Budget Alignment (Weight: 15%)
  if (budget >= dest.minBudget && budget <= dest.maxBudget * 1.5) {
    score += 15;
    reasons.push(`Fits comfortably within your ₹${Number(budget).toLocaleString()} budget`);
  } else if (budget < dest.minBudget) {
    score += 5;
  } else {
    score += 10;
  }

  // 4. Duration Fit (Weight: 10%)
  if (duration >= dest.idealDurationMin && duration <= dest.idealDurationMax + 2) {
    score += 10;
    reasons.push(`Ideal for your ${duration}-day travel window`);
  } else {
    score += 5;
  }

  // 5. Novelty & Favorites Affinity (Weight: 15%)
  const isFavorite = favorites.some((fav) =>
    fav.toLowerCase().includes(dest.name.toLowerCase()) ||
    dest.name.toLowerCase().includes(fav.toLowerCase())
  );
  const isVisited = previousTrips.some((trip) =>
    trip.toLowerCase().includes(dest.name.toLowerCase()) ||
    dest.name.toLowerCase().includes(trip.toLowerCase())
  );

  if (isFavorite) {
    score += 15;
    reasons.push(`Featured in your saved travel wishlist`);
  } else if (!isVisited) {
    score += 12;
    reasons.push(`New unexplored destination matching your preferences`);
  } else {
    score += 5; // slightly lower novelty if already visited
  }

  // Cap score between 75% and 98% for realistic natural presentation
  const finalMatchScore = Math.min(98, Math.max(74, score));

  return {
    matchScore: finalMatchScore,
    reasons: reasons.slice(0, 3)
  };
};

/**
 * Generate Ranked Recommendations for a User or Query
 */
const getRecommendations = async (userProfile = {}) => {
  let destinations = [...INDIAN_DESTINATION_DATABASE];

  // If MongoDB contains extra destinations, merge them
  try {
    const dbDestinations = await Destination.find().limit(20).lean();
    if (dbDestinations && dbDestinations.length > 0) {
      dbDestinations.forEach((dbD) => {
        if (!destinations.some((d) => d.slug === dbD.slug || d.name.toLowerCase() === dbD.name.toLowerCase())) {
          destinations.push({
            name: dbD.name,
            state: dbD.state,
            tagline: dbD.tagline || "",
            description: dbD.description,
            category: dbD.category || ["Cultural & Heritage"],
            travelStyles: ["Cultural Explorer", "Budget Backpacker"],
            image: dbD.image,
            minBudget: dbD.avgBudget?.min * 3 || 6000,
            maxBudget: dbD.avgBudget?.max * 5 || 20000,
            idealDurationMin: 3,
            idealDurationMax: 6,
            safetyRating: dbD.safetyRating || 4.5,
            soloScore: dbD.soloScore || 8.8,
            bestTimeToVisit: dbD.bestTimeToVisit || "October to March",
            highlights: dbD.attractions ? dbD.attractions.map((a) => a.name).slice(0, 4) : [],
            slug: dbD.slug
          });
        }
      });
    }
  } catch (err) {
    // Fallback to static catalogue
  }

  // Score all destinations
  const scored = destinations.map((dest) => {
    const { matchScore, reasons } = calculateMatchScore(dest, userProfile);
    return {
      ...dest,
      matchScore,
      matchReasons: reasons
    };
  });

  // Sort descending by matchScore
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored;
};

module.exports = {
  getRecommendations,
  calculateMatchScore,
  INDIAN_DESTINATION_DATABASE
};
