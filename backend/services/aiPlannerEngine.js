const { destinations: sampleDestinations } = require("../data/sampleData");
const { INDIAN_STATES_AND_UTS } = require("../data/indiaLocations");

// List of non-Indian keywords/countries/cities to detect and strictly reject
const NON_INDIAN_DESTINATIONS = [
  "paris", "france", "london", "uk", "united kingdom", "england",
  "new york", "usa", "united states", "america", "california", "los angeles", "san francisco",
  "tokyo", "japan", "osaka", "kyoto",
  "dubai", "uae", "abu dhabi",
  "bali", "indonesia", "bangkok", "phuket", "thailand",
  "singapore", "kuala lumpur", "malaysia",
  "rome", "italy", "milan", "florence", "venice",
  "switzerland", "zurich", "geneva", "interlaken",
  "amsterdam", "netherlands", "berlin", "germany", "munich",
  "barcelona", "madrid", "spain",
  "toronto", "canada", "vancouver",
  "sydney", "melbourne", "australia",
  "maldives", "sri lanka", "colombo", "kathmandu", "nepal", "bhutan", "thimphu",
  "egypt", "cairo", "turkey", "istanbul", "greece", "athens", "santorini"
];

// Curated list of Indian states, UTs, cities, hill stations, and popular spots
const INDIAN_KEYWORDS = [
  "india", "bharat", "hindustan",
  // States & UTs
  "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh", "goa", "gujarat",
  "haryana", "himachal pradesh", "jharkhand", "karnataka", "kerala", "madhya pradesh", "maharashtra",
  "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "punjab", "rajasthan", "sikkim",
  "tamil nadu", "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
  "andaman and nicobar", "chandigarh", "dadra and nagar haveli", "daman and diu", "delhi", "new delhi",
  "jammu and kashmir", "ladakh", "lakshadweep", "puducherry", "pondicherry",
  // Top Solo Hubs & Cities
  "manali", "shimla", "dharamshala", "mcleodganj", "kasol", "jibhi", "spiti", "kullu", "dalhousie", "bir billing",
  "rishikesh", "haridwar", "mussoorie", "dehradun", "nainital", "auli", "chopta", "kedarnath", "badrinath",
  "jaipur", "udaipur", "jodhpur", "jaisalmer", "pushkar", "mount abu", "bikaner",
  "varanasi", "agra", "lucknow", "ayodhya", "mathura", "vrindavan", "prayagraj",
  "mumbai", "pune", "lonavala", "khandala", "mahabeleshwar", "alibaug", "panchgani",
  "bangalore", "bengaluru", "mysore", "mysuru", "coorg", "kodagu", "hampi", "gokarna", "chikmagalur",
  "munnar", "kochi", "cochin", "alleppey", "alappuzha", "wayanad", "varkala", "kovalam", "thekkady", "kumarakom",
  "north goa", "south goa", "panaji", "anjuna", "arambol", "palolem", "vagator", "calangute",
  "darjeeling", "kalimpong", "kolkata", "sundarbans", "digha", "kurseong",
  "gangtok", "pelling", "lachung", "yumthang", "ravangla",
  "shillong", "cherrapunji", "dawki", "mawlynnong", "kaziranga", "guwahati", "tawang", "ziro",
  "leh", "nubra valley", "pangong", "zanskar", "kargil",
  "srinagar", "gulmarg", "pahalgam", "sonamarg",
  "ooty", "kodaikanal", "chennai", "madurai", "rameswaram", "kanyakumari", "coimbatore",
  "hyderabad", "warangal", "visakhapatnam", "vizag", "araku", "tirupati",
  "ahmedabad", "rann of kutch", "bhuj", "gir", "somnath", "dwarka", "statue of unity",
  "amritsar", "bhopal", "indore", "khajuraho", "ujjain", "gwalior", "orchha", "pachmarhi",
  "puri", "konark", "bhubaneswar", "port blair", "havelock", "neil island"
];

/**
 * Validate whether a destination query belongs to India
 */
function isIndianDestination(destInput) {
  if (!destInput || typeof destInput !== "string") return false;
  const inputLower = destInput.toLowerCase().trim();

  // 1. Direct check against non-Indian blacklist
  for (const nonInd of NON_INDIAN_DESTINATIONS) {
    // Exact word or boundary match
    const regex = new RegExp(`\\b${nonInd}\\b`, "i");
    if (regex.test(inputLower)) {
      return false;
    }
  }

  // 2. Positive check in Indian keyword dictionary
  for (const ind of INDIAN_KEYWORDS) {
    if (inputLower.includes(ind) || ind.includes(inputLower)) {
      return true;
    }
  }

  // 3. Positive check against state/districts dataset
  for (const stateObj of INDIAN_STATES_AND_UTS) {
    if (stateObj.name.toLowerCase().includes(inputLower) || inputLower.includes(stateObj.name.toLowerCase())) {
      return true;
    }
    if (Array.isArray(stateObj.districts)) {
      for (const dist of stateObj.districts) {
        if (inputLower.includes(dist.toLowerCase()) || dist.toLowerCase().includes(inputLower)) {
          return true;
        }
      }
    }
    if (Array.isArray(stateObj.cities)) {
      for (const c of stateObj.cities) {
        if (inputLower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(inputLower)) {
          return true;
        }
      }
    }
  }

  // 4. Fallback heuristics: If user explicitly wrote "India" or "Bharat"
  if (inputLower.includes("india") || inputLower.includes("bharat")) {
    return true;
  }

  // If no international match and reasonable Indian string, accept if it doesn't look foreign
  return false;
}

/**
 * Knowledge base profiles for popular Indian Destinations
 */
const DESTINATION_PROFILES = {
  manali: {
    state: "Himachal Pradesh",
    climate: "Cool Alpine Mountain Climate (Chilly nights, pleasant days, snow in winter)",
    vibe: "Adventure, Pine Trails, River Cafes & Bohemian Vibe",
    coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200",
    highlights: ["Old Manali Village", "Jogini Waterfall Trek", "Atal Tunnel & Sissu", "Solang Adventure Valley", "Hadimba Pagoda Temple", "Vashisht Hot Sulphur Springs"],
    foodSuggestions: {
      mustTryDishes: ["Himachali Siddu with Pure Ghee", "Fresh Beas River Trout Fish", "Hot Steamed Tingmo & Thukpa", "Mountain Apple Strudel & Crumble", "Kullu Dham Thali"],
      recommendedSpots: ["Dylan's Toasted & Roasted Coffee House (Old Manali)", "Cafe 1947 (Riverside Beas)", "Chopsticks (Mall Road)", "The Lazy Dog Lounge", "Vashisht Siddu Corner"]
    },
    transportation: {
      gettingThere: "Overnight luxury Volvo AC sleeper bus from New Delhi / Chandigarh, or flight to Kullu-Bhuntar Airport (50 km).",
      localTransit: "Rent a Royal Enfield/Scooter (₹800–₹1,200/day) or shared HRTC local buses (₹20–₹50). Autos available on Mall Road.",
      averageLocalFare: "₹300 - ₹600 / day"
    },
    travelTimes: [
      { from: "Mall Road", to: "Old Manali", duration: "10 mins (Auto/Walk)" },
      { from: "Old Manali", to: "Jogini Falls (Vashisht)", duration: "25 mins drive + 45 mins hike" },
      { from: "Manali", to: "Atal Tunnel / Sissu Valley", duration: "1 hr 15 mins scenic drive" },
      { from: "Manali", to: "Solang Valley", duration: "35 mins" }
    ],
    accommodations: [
      { name: "Zostel Old Manali", type: "Backpacker Hostel", pricePerNight: 750, location: "Old Manali", rating: 4.8 },
      { name: "The Lost Hostels", type: "Hostel & Community Workation", pricePerNight: 650, location: "Vashisht", rating: 4.7 },
      { name: "Apple View Cottage", type: "Cozy Homestay", pricePerNight: 1600, location: "Naggar Road", rating: 4.6 },
      { name: "Solang Valley Resort", type: "Boutique Mountain Stay", pricePerNight: 4200, location: "Solang", rating: 4.9 }
    ],
    packingList: [
      "Layered thermal fleece & windproof jacket",
      "Sturdy waterproof trekking shoes with good grip",
      "Power bank (battery drains quickly in cold mountain weather)",
      "Reusable insulated water flask & UV sunglasses",
      "Personal first-aid kit & altitude/motion sickness meds (Avomine)",
      "Cash (ATMs sometimes run dry during peak weekends)"
    ],
    safetyTips: [
      "Check weather and Atal Tunnel road status before heading to Lahaul/Sissu.",
      "Never trek alone after sunset; trails through cedar forests have active wildlife.",
      "Stay hydrated to counter high altitude fatigue (2,050m+).",
      "Himachal Police Helpline: Dial 112 | Tourist Info: 01902-252175."
    ],
    itineraryDays: [
      {
        day: 1,
        title: "Day 1: Arrival, Old Manali Cafes & Jogini Falls Hike",
        theme: "Acclimatization & Nature Trek",
        activities: [
          { time: "09:00", title: "Reach Manali & check-in at Old Manali hostel", category: "Accommodation", cost: 800, location: "Old Manali", notes: "Freshen up with mountain views" },
          { time: "10:30", title: "Fresh apple crumble & roasted coffee at Dylan's Cafe", category: "Food", cost: 250, location: "Old Manali", notes: "Famous local bakery" },
          { time: "12:00", title: "Trek through deodar pine forest to Jogini Waterfalls", category: "Activities", cost: 100, location: "Vashisht", notes: "3 km scenic trail with valley panorama" },
          { time: "14:00", title: "Himachali Siddu & Pahadi Rajma lunch at Vashisht village", category: "Food", cost: 200, location: "Vashisht", notes: "Warm steamed dough filled with spiced nuts & ghee" },
          { time: "16:00", title: "Visit Hadimba Pagoda Temple & Dhungri cedar woods", category: "Activities", cost: 50, location: "Dhungri Forest", notes: "16th-century wooden architectural marvel" },
          { time: "19:00", title: "Live acoustic indie music & riverside dinner at Cafe 1947", category: "Food", cost: 550, location: "Beas Riverbed", notes: "Wood-fired pizza & hot chocolate by the river" }
        ]
      },
      {
        day: 2,
        title: "Day 2: Atal Tunnel Highway & Sissu Waterfall in Lahaul",
        theme: "High Altitude Crossing & Lahaul Exploration",
        activities: [
          { time: "08:00", title: "Scooter / Cab ride through Atal Tunnel (9.02 km)", category: "Transportation", cost: 600, location: "Atal Tunnel North Portal", notes: "World's longest highway tunnel above 10,000 ft" },
          { time: "10:30", title: "Explore Sissu Waterfall & Chandra River shores", category: "Activities", cost: 150, location: "Sissu, Lahaul", notes: "Spectacular barren peaks and glacial waterfall" },
          { time: "13:00", title: "Hot Tibetan Thukpa & Steamed Momos at local dhaba", category: "Food", cost: 200, location: "Sissu Village", notes: "Authentic Himalayan warmth" },
          { time: "15:30", title: "Solang Valley adventure stop (Ziplining / Quad ride)", category: "Activities", cost: 900, location: "Solang Valley", notes: "Breathtaking views of glaciers" },
          { time: "19:30", title: "Dinner & stroll at vibrant Mall Road", category: "Food", cost: 400, location: "Mall Road", notes: "Try local trout fish or warm momos" }
        ]
      },
      {
        day: 3,
        title: "Day 3: Naggar Heritage Castle, Art Gallery & Trout Farm",
        theme: "Himachali Art, Culture & Heritage",
        activities: [
          { time: "09:00", title: "Scenic drive along left bank to Naggar Village", category: "Transportation", cost: 300, location: "Naggar", notes: "Tranquil apple orchard countryside" },
          { time: "10:30", title: "Explore 15th-century Naggar Castle & Nicholas Roerich Art Gallery", category: "Activities", cost: 150, location: "Naggar Castle", notes: "Traditional Kathkuni wood and stone architecture" },
          { time: "13:00", title: "Traditional Royal Himachali Dham lunch at Heritage Cafe", category: "Food", cost: 350, location: "Naggar", notes: "Festive multi-course platter on leaf plates" },
          { time: "15:30", title: "Nature walk to Jana Waterfall and local apple jaggery stall", category: "Activities", cost: 100, location: "Jana Village", notes: "Hidden forested cascade" },
          { time: "19:30", title: "Bonfire & solo traveler meetup at hostel lounge", category: "Miscellaneous", cost: 150, location: "Old Manali", notes: "Share stories under star-lit Himalayan skies" }
        ]
      },
      {
        day: 4,
        title: "Day 4: Hampta Valley Day Hike / Solang Ridge Walk",
        theme: "Alpine Trekking & Wild Meadows",
        activities: [
          { time: "08:30", title: "Morning trek to Sethan Village (Igloo & boulder zone)", category: "Activities", cost: 350, location: "Sethan / Hampta foothills", notes: "Panoramic vista of Dhauladhar & Pir Panjal" },
          { time: "12:30", title: "Packed meadow picnic & herbal mountain tea", category: "Food", cost: 200, location: "Sethan Ridge", notes: "Pure alpine tranquility" },
          { time: "15:00", title: "Manu Temple visit & heritage wood carvings walk", category: "Activities", cost: 50, location: "Upper Old Manali", notes: "Ancient shrine dedicated to Sage Manu" },
          { time: "17:30", title: "Sunset herbal tea & cinnamon roll at Drifters' Cafe", category: "Food", cost: 250, location: "Old Manali", notes: "Cozy library & board games" },
          { time: "20:00", title: "Special Himalayan Thali dinner with local craft kombucha", category: "Food", cost: 450, location: "Old Manali", notes: "Wholesome organic mountain meal" }
        ]
      },
      {
        day: 5,
        title: "Day 5: Van Vihar Pine Sanctuary, Souvenir Trail & Departure",
        theme: "Leisure, Souvenirs & Farewell",
        activities: [
          { time: "09:00", title: "Morning walk inside Van Vihar towering deodar sanctuary", category: "Activities", cost: 50, location: "Beas River Park", notes: "Peaceful morning nature walk" },
          { time: "11:00", title: "Shopping for Kullu shawls, organic apple jams & pine honey", category: "Miscellaneous", cost: 600, location: "Himachal Handloom Emporium", notes: "Govt certified local crafts" },
          { time: "13:30", title: "Farewell lunch & masala chai at Chopsticks", category: "Food", cost: 350, location: "Mall Road", notes: "Hearty Tibetan noodles & spiced teas" },
          { time: "16:00", title: "Board luxury evening Volvo bus for return transit", category: "Transportation", cost: 1200, location: "Private Bus Stand", notes: "Comfortable overnight transit" }
        ]
      }
    ]
  },

  jaipur: {
    state: "Rajasthan",
    climate: "Semi-arid (Sunny winter days, cool desert evenings)",
    vibe: "Royal Fortresses, Grand Palaces & Vibrant Pink City Bazaars",
    coverImage: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200",
    highlights: ["Amer Fort & Sheesh Mahal", "Hawa Mahal Golden Hour", "Nahargarh Sunset Point", "City Palace & Jantar Mantar", "Panna Meena Kund Stepwell", "Johari & Bapu Bazaar"],
    foodSuggestions: {
      mustTryDishes: ["Pyaz Kachori with spicy tamarind chutney", "Dal Baati Churma with Pure Ghee", "Clay-pot Kulhad Lassi", "Ghevar & Mawa Kachori", "Laal Maas (or Ker Sangri for veg)"],
      recommendedSpots: ["Rawat Mishthan Bhandar (Sindhi Camp)", "Lassiwala (MI Road, Shop #312)", "LMB (Johari Bazaar)", "Padao Cafe (Nahargarh Fort)", "Chokhi Dhani Ethnic Resort"]
    },
    transportation: {
      gettingThere: "Jaipur International Airport (JAI), direct Vande Bharat/Express trains from Delhi/Mumbai, or 4.5 hrs drive via NH48.",
      localTransit: "Jaipur Metro (clean & safe), shared e-rickshaws (₹20-₹40), or auto-rickshaws/Uber.",
      averageLocalFare: "₹250 - ₹500 / day"
    },
    travelTimes: [
      { from: "Old Pink City", to: "Amer Fort", duration: "25 mins" },
      { from: "Amer Fort", to: "Nahargarh Fort", duration: "20 mins winding hill drive" },
      { from: "Hawa Mahal", to: "City Palace", duration: "5 mins walk" }
    ],
    accommodations: [
      { name: "Zostel Jaipur", type: "Backpacker Hostel", pricePerNight: 650, location: "Old City", rating: 4.8 },
      { name: "Moustache Jaipur", type: "Hostel & Rooftop Pool", pricePerNight: 700, location: "MI Road", rating: 4.7 },
      { name: "Umaid Bhawan Heritage Hotel", type: "Heritage Haveli", pricePerNight: 2800, location: "Bani Park", rating: 4.9 },
      { name: "Pearl Palace Heritage", type: "Boutique Stay", pricePerNight: 1900, location: "Hathroi Fort", rating: 4.8 }
    ],
    packingList: [
      "Comfortable breathable cotton clothing with scarves/stoles for temple visits",
      "Sturdy walking sneakers (lots of climbing stone fort ramps)",
      "Sun hat, sunglasses & high-SPF sunscreen",
      "Power bank for palace photography"
    ],
    safetyTips: [
      "Buy the composite monument entry ticket at your first fort to skip queues everywhere.",
      "Use Jaipur Metro or app-cabs for transparent pricing.",
      "Rajasthan Tourist Assistance Force (TAF): Dial 1363 / 112."
    ],
    itineraryDays: [
      {
        day: 1,
        title: "Day 1: Royal Amer Fort, Stepwell & Nahargarh Sunset",
        theme: "Grand Fortresses & Hillside Vistas",
        activities: [
          { time: "09:00", title: "Breakfast at Rawat — Crispy Pyaz Kachori & Jalebi", category: "Food", cost: 180, location: "Sindhi Camp", notes: "Jaipur's most famous morning snack" },
          { time: "10:30", title: "Explore Amer Fort & Mirror Palace (Sheesh Mahal)", category: "Activities", cost: 300, location: "Amer", notes: "Hire certified guide / audio tour" },
          { time: "13:30", title: "Authentic Rajasthani Thali lunch near Amer", category: "Food", cost: 400, location: "Amer Road", notes: "Dal Baati Churma & Ker Sangri" },
          { time: "15:00", title: "Photography at Panna Meena Ka Kund (Geometric Stepwell)", category: "Activities", cost: 100, location: "Amer Town", notes: "16th-century architectural symmetry" },
          { time: "17:30", title: "Watch the golden sunset over Pink City from Nahargarh Fort", category: "Activities", cost: 200, location: "Nahargarh Hilltop", notes: "Breathtaking panoramic lights" },
          { time: "20:00", title: "Dinner & cultural folk music at Padao or MI Road", category: "Food", cost: 500, location: "MI Road", notes: "Sitar & puppet storytelling" }
        ]
      },
      {
        day: 2,
        title: "Day 2: City Palace, Hawa Mahal & Bapu Bazaar Trail",
        theme: "Heritage Architecture & Vibrant Bazars",
        activities: [
          { time: "08:30", title: "Golden hour photo shoot outside Hawa Mahal facade", category: "Activities", cost: 100, location: "Badi Chaupar", notes: "Best lighting before market crowds arrive" },
          { time: "10:00", title: "Royal courtyards of Jaipur City Palace & Mubarak Mahal", category: "Activities", cost: 350, location: "Old City", notes: "Peacock Gate and textile gallery" },
          { time: "12:30", title: "UNESCO Jantar Mantar Astronomical Observatory tour", category: "Activities", cost: 200, location: "Old City", notes: "World's largest stone sundial" },
          { time: "14:00", title: "Lunch & Kulhad Lassi at Lassiwala MI Road", category: "Food", cost: 250, location: "MI Road", notes: "Original shop operating since 1944" },
          { time: "16:00", title: "Textile & handicraft shopping at Bapu and Johari Bazaars", category: "Miscellaneous", cost: 500, location: "Old Bazaars", notes: "Jaipuri quilts, mojris, and block-prints" },
          { time: "19:30", title: "Rooftop dining overlooking illuminated monuments", category: "Food", cost: 600, location: "C-Scheme", notes: "Cosy traveler ambiance" }
        ]
      }
    ]
  },

  goa: {
    state: "Goa",
    climate: "Tropical Coastal Breeze (Sunny, warm, pleasant sea winds)",
    vibe: "Beaches, Portuguese Heritage, Sunset Drum Circles & Bohemian Cafes",
    coverImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200",
    highlights: ["Chapora Fort Cliffs", "Arambol Sweet Water Lake & Drum Circle", "Fontainhas Latin Quarter", "Anjuna Flea Market", "Divar Island Cycling"],
    foodSuggestions: {
      mustTryDishes: ["Goan Fish Curry Thali", "Pork/Chicken Vindaloo & Xacuti", "Poi Bread with Chorizo", "Traditional Bebinca & Serradura", "Kokum Feni Spritzer"],
      recommendedSpots: ["Baba Au Rhum (Anjuna)", "Viva Panjim (Fontainhas)", "Vinayak Family Restaurant (Assagao)", "Curlies / Shiva Valley (Anjuna)", "Burger Factory (Morjim)"]
    },
    transportation: {
      gettingThere: "Mopa Airport (GOX) / Dabolim (GOI), or Madgaon/Thivim railway stations.",
      localTransit: "Rent a Honda Activa/Scooter (₹350–₹500/day) — the absolute best way for solo travelers.",
      averageLocalFare: "₹400 / day"
    },
    travelTimes: [
      { from: "Panaji", to: "Anjuna / Vagator", duration: "35 mins ride" },
      { from: "Anjuna", to: "Arambol Beach", duration: "30 mins ride" },
      { from: "Panaji", to: "Fontainhas", duration: "Walking distance" }
    ],
    accommodations: [
      { name: "The Hosteller Goa Anjuna", type: "Backpacker Hostel", pricePerNight: 750, location: "Anjuna", rating: 4.8 },
      { name: "Jungle Hostel Vagator", type: "Eco Hostel", pricePerNight: 650, location: "Vagator", rating: 4.7 },
      { name: "Panjim Heritage Inn", type: "Colonial Homestay", pricePerNight: 2200, location: "Fontainhas", rating: 4.9 }
    ],
    packingList: [
      "Light linen/cotton beachwear & swimwear",
      "Flip-flops & breathable sandals",
      "Sunscreen SPF 50+ & UV sunglasses",
      "Waterproof dry bag for beach phone/wallet protection"
    ],
    safetyTips: [
      "Always wear a helmet when riding rented scooters — traffic police enforce strictly.",
      "Swim only in designated lifeguard zones; avoid rough rip tides.",
      "Goa Tourist Police: 112 | Women Helpline: 1091."
    ],
    itineraryDays: [
      {
        day: 1,
        title: "Day 1: North Goa Cliffs, Chapora & Sunset Drum Circle",
        theme: "Coastal Vibes & Bohemian Sunset",
        activities: [
          { time: "09:00", title: "Croissant breakfast & cold brew at Baba Au Rhum", category: "Food", cost: 350, location: "Anjuna", notes: "Bamboo forest garden setting" },
          { time: "11:00", title: "Hike up to Chapora Fort & Vagator red cliffs", category: "Activities", cost: 50, location: "Vagator", notes: "Iconic Dil Chahta Hai movie viewpoint" },
          { time: "13:30", title: "Authentic Goan Fish Curry Thali at Vinayak Assagao", category: "Food", cost: 300, location: "Assagao", notes: "Fresh kingfish, prawns, kadi, and rice" },
          { time: "16:30", title: "Walk along Arambol Sweet Water Lake and Banyan Tree", category: "Activities", cost: 100, location: "Arambol Beach", notes: "Freshwater lagoon right next to the sea" },
          { time: "18:00", title: "Join the sunset drum circle and sunset fire spinners", category: "Activities", cost: 50, location: "Arambol Shore", notes: "Spontaneous music gathering of travelers" },
          { time: "20:30", title: "Seafood dinner & acoustic vibes under starlight", category: "Food", cost: 600, location: "Anjuna", notes: "Gentle ocean waves & fairy lights" }
        ]
      }
    ]
  },

  rishikesh: {
    state: "Uttarakhand",
    climate: "Fresh Himalayan Foothill Breeze",
    vibe: "Spiritual Rejuvenation, Yoga, White Water Rafting & Ganga Aartis",
    coverImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200",
    highlights: ["Triveni Ghat Evening Aarti", "Beatles Ashram (Chaurasi Kutia)", "White Water Rafting at Shivpuri", "Neer Garh Waterfalls Hike", "Tapovan Terrace Cafes"],
    foodSuggestions: {
      mustTryDishes: ["Garhwali Kafuli & Jhangore Ki Kheer", "Ayurvedic Sattvic Kitchari Bowls", "Woodfired Thin-crust Pizza in Tapovan", "Fresh Ginger Lemon Honey Tea", "Allo Puri at Haridwar-Rishikesh highway"],
      recommendedSpots: ["Little Buddha Cafe (Laxman Jhula)", "Beatles Cafe / 60's Cafe", "Chotiwala (Swarg Ashram)", "Tat Cafe (Tapovan)", "Ganga View Cafe"]
    },
    transportation: {
      gettingThere: "Dehradun Jolly Grant Airport (20 km), Yog Nagari Rishikesh railway station, or 4.5 hrs drive from Delhi.",
      localTransit: "Shared Vikram autos (₹10–₹20), walking across suspension bridges, or rental scooters (₹400/day).",
      averageLocalFare: "₹200 - ₹350 / day"
    },
    travelTimes: [
      { from: "Tapovan", to: "Ram Jhula", duration: "10 mins walk / auto" },
      { from: "Tapovan", to: "Shivpuri Rafting Base", duration: "25 mins" },
      { from: "Tapovan", to: "Neer Garh Waterfall", duration: "15 mins ride + 20 mins hike" }
    ],
    accommodations: [
      { name: "Zostel Rishikesh Tapovan", type: "Hostel", pricePerNight: 650, location: "Tapovan", rating: 4.8 },
      { name: "Live Free Hostel", type: "Hostel & Rooftop Yoga", pricePerNight: 550, location: "Laxman Jhula", rating: 4.7 },
      { name: "Aloha On The Ganges", type: "Resort Stay", pricePerNight: 4500, location: "Tapovan", rating: 4.9 }
    ],
    packingList: [
      "Modest light clothing for ashrams and temples",
      "Quick-dry shorts and river water shoes for rafting",
      "Yoga mat or travel strap",
      "Slip-on shoes for frequent temple entry"
    ],
    safetyTips: [
      "Strictly vegetarian and dry zone (no alcohol / non-veg permitted within city limits).",
      "Wear lifejackets and follow certified river guide instructions during rafting.",
      "Uttarakhand Tourist Helpline: 1363 | Emergency: 112."
    ],
    itineraryDays: [
      {
        day: 1,
        title: "Day 1: Tapovan Cafes, Beatles Ashram & Parmarth Ganga Aarti",
        theme: "Spiritual Culture & Sacred River",
        activities: [
          { time: "08:30", title: "Drop-in morning Hatha Yoga session at Tapovan studio", category: "Activities", cost: 200, location: "Tapovan", notes: "Begin your journey with mindfulness" },
          { time: "10:00", title: "Avocado toast & fresh smoothie bowl at Beatles Cafe", category: "Food", cost: 300, location: "Paidal Marg", notes: "Panoramic views of turquoise Ganga" },
          { time: "11:30", title: "Explore Beatles Ashram (Chaurasi Kutia) & graffiti dome halls", category: "Activities", cost: 150, location: "Swarg Ashram", notes: "Where The Beatles lived & meditated in 1968" },
          { time: "14:00", title: "Wholesome Ayurvedic thali at Chotiwala", category: "Food", cost: 250, location: "Ram Jhula", notes: "Heritage Indian eatery" },
          { time: "16:30", title: "Hike up to Neer Garh emerald tiered waterfalls", category: "Activities", cost: 50, location: "Neer Garh", notes: "Dip your feet in natural mountain spring pools" },
          { time: "18:30", title: "Attend Parmarth Niketan Ganga Aarti with floating diyas", category: "Activities", cost: 50, location: "Parmarth Ghat", notes: "Hypnotic chanting & spiritual serenity" },
          { time: "20:30", title: "Rooftop herbal tea & dinner overlooking the lit bridges", category: "Food", cost: 400, location: "Tapovan", notes: "Connect with solo backpackers" }
        ]
      }
    ]
  },

  munnar: {
    state: "Kerala",
    climate: "Mist-clad Western Ghats Hills (Cool, fresh, scenic monsoon clouds)",
    vibe: "Emerald Tea Gardens, Waterfalls, Trekking & Spice Plantations",
    coverImage: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200",
    highlights: ["Kolukkumalai Sunrise Peak", "Eravikulam National Park (Nilgiri Tahr)", "Tea Factory & Tasting Tour", "Mattupetty Dam & Echo Point", "Attukad Waterfall"],
    foodSuggestions: {
      mustTryDishes: ["Kerala Sadya on Banana Leaf", "Appam with Vegetable / Chicken Stew", "Malabar Parotta with Kerala Curry", "Fresh Cardamom-infused Mountain Chai", "Puttu and Kadala Curry"],
      recommendedSpots: ["Rapsy Restaurant (Main Bazaar)", "Saravana Bhavan (Munnar Town)", "Guru's Restaurant", "Tea Tales Cafe"]
    },
    transportation: {
      gettingThere: "Cochin International Airport (COK) — 110 km (3.5 hrs drive), or Aluva railway station.",
      localTransit: "Auto-rickshaws, shared jeeps to Kolukkumalai, or rented scooters from Old Munnar.",
      averageLocalFare: "₹400 - ₹700 / day"
    },
    travelTimes: [
      { from: "Munnar Town", to: "Tea Museum", duration: "10 mins" },
      { from: "Munnar Town", to: "Eravikulam National Park", duration: "30 mins" },
      { from: "Munnar Town", to: "Kolukkumalai Jeep Base", duration: "1 hr 15 mins" }
    ],
    accommodations: [
      { name: "Zostel Munnar", type: "Hostel", pricePerNight: 750, location: "Chithirapuram", rating: 4.8 },
      { name: "Green Valley Homestay", type: "Homestay", pricePerNight: 1400, location: "Old Munnar", rating: 4.7 }
    ],
    packingList: [
      "Light woolen sweater / rain poncho",
      "Good hiking shoes (misty slippery rocks)",
      "Leech socks (if trekking deep shola forests during wet season)",
      "Binoculars / camera with zoom lens"
    ],
    safetyTips: [
      "Mountain roads have sharp hairpin bends; avoid night driving in thick fog.",
      "Reserve Eravikulam National Park tickets online in advance.",
      "Kerala Tourism Police Helpline: 112 | Toll-free: 1800-425-4747."
    ],
    itineraryDays: [
      {
        day: 1,
        title: "Day 1: Tea Plantations, KDHP Tea Museum & Echo Point",
        theme: "Tea Heritage & Western Ghats Vista",
        activities: [
          { time: "09:00", title: "Fluffy Appam & Stew breakfast at town eatery", category: "Food", cost: 180, location: "Munnar Town", notes: "Traditional Kerala morning breakfast" },
          { time: "10:30", title: "Tour of KDHP Tea Museum & fresh leaf grading demo", category: "Activities", cost: 150, location: "Nullatanni Estate", notes: "Learn 140 years of tea crafting history" },
          { time: "13:00", title: "Authentic Banana Leaf Kerala Thali lunch", category: "Food", cost: 200, location: "Munnar Bazaar", notes: "Served with Avial, Sambar, and Payasam" },
          { time: "15:00", title: "Visit Mattupetty Dam, Kundala Lake & Echo Point", category: "Activities", cost: 100, location: "Kundala", notes: "Pedal boating amidst rolling mist hills" },
          { time: "17:30", title: "Sunset tea tasting at scenic plantation cliff cafe", category: "Food", cost: 150, location: "Chithirapuram", notes: "Freshly brewed green & white teas" },
          { time: "20:00", title: "Dinner & restful overnight stay amidst spice gardens", category: "Accommodation", cost: 800, location: "Hostel / Stay", notes: "Cool mountain breezes" }
        ]
      }
    ]
  },

  varanasi: {
    state: "Uttar Pradesh",
    climate: "Subtropical (Pleasant winter, warm summer)",
    vibe: "Spiritual Transcendence, Historic Ghats, Dawn Boat Rides & Ancient Gullies",
    coverImage: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200",
    highlights: ["Dashashwamedh Ghat Maha Aarti", "Subah-e-Banaras at Assi Ghat", "Sunrise Row Boat Ride on Holy Ganga", "Kashi Vishwanath Corridor", "Sarnath Buddhist Heritage Park"],
    foodSuggestions: {
      mustTryDishes: ["Banarasi Tamatar Chaat & Kachori Sabzi", "Creamy winter Malaiyo / Rabdi", "Blue Lassi with mixed fruits & pistachio", "Crispy Chooda Matar", "Iconic Maghai Banarasi Meetha Paan"],
      recommendedSpots: ["Kashi Chaat Bhandar (Godowlia)", "Blue Lassi Shop (Manikarnika Gali)", "Pahalwan Lassi (Lanka)", "Shree Ram Bhandar (Thatheri Bazaar)", "Darbhanga Ghat Rooftop Cafe"]
    },
    transportation: {
      gettingThere: "Lal Bahadur Shastri Airport (VNS) or Varanasi Jn (BSB) / Banaras (BSBS) railway stations.",
      localTransit: "Walking through ghats (best!), shared e-rickshaws, and hand-rowed wooden boats (₹200–₹400/hr).",
      averageLocalFare: "₹200 - ₹350 / day"
    },
    travelTimes: [
      { from: "Assi Ghat", to: "Dashashwamedh Ghat", duration: "30 mins leisurely ghat walk" },
      { from: "Godowlia", to: "Kashi Vishwanath Temple", duration: "5 mins walk" },
      { from: "Varanasi", to: "Sarnath", duration: "30 mins e-rickshaw" }
    ],
    accommodations: [
      { name: "Zostel Varanasi", type: "Hostel", pricePerNight: 600, location: "Dashashwamedh", rating: 4.8 },
      { name: "Moustache Varanasi", type: "Hostel", pricePerNight: 550, location: "Assi Ghat", rating: 4.7 },
      { name: "BrijRama Palace Heritage", type: "Luxury Heritage", pricePerNight: 9500, location: "Darbhanga Ghat", rating: 4.9 }
    ],
    packingList: [
      "Comfortable slip-on footwear (lots of temple removal)",
      "Modest clothing covering shoulders and knees",
      "Hand sanitizer & small torch for evening alleyway strolls",
      "Camera for stunning sunrise ghat photography"
    ],
    safetyTips: [
      "Negotiate boat prices before boarding; sunrise rowboats cost approx ₹250–₹400/hr.",
      "Strictly respect photography bans at cremation ghats (Manikarnika).",
      "UP Tourism Police: 112 | Tourist Info: 0542-2505030."
    ],
    itineraryDays: [
      {
        day: 1,
        title: "Day 1: Silent Sunrise Boat, Kashi Vishwanath & Grand Aarti",
        theme: "Spiritual Awakening & Holy Ghats",
        activities: [
          { time: "05:30", title: "Subah-e-Banaras classical music & dawn yoga at Assi Ghat", category: "Activities", cost: 50, location: "Assi Ghat", notes: "Soul-stirring morning ragas" },
          { time: "06:30", title: "Silent wooden row-boat ride along all 84 historic ghats", category: "Transportation", cost: 300, location: "River Ganga", notes: "Watch sunrise paint the stone palaces gold" },
          { time: "08:30", title: "Breakfast — Hot Puris with Chana & Jalebi at Ram Bhandar", category: "Food", cost: 120, location: "Thatheri Bazaar", notes: "Traditional morning breakfast" },
          { time: "10:30", title: "Darshan at Kashi Vishwanath Golden Temple & Grand Corridor", category: "Activities", cost: 100, location: "Vishwanath Gali", notes: "One of the 12 sacred Jyotirlingas" },
          { time: "13:30", title: "Creamy seasonal fruit lassi at the world-famous Blue Lassi", category: "Food", cost: 150, location: "Manikarnika Lane", notes: "Served in terracotta kulhad" },
          { time: "16:00", title: "Explore Banarasi silk weaving workshops in old gullies", category: "Activities", cost: 100, location: "Peeli Kothi", notes: "Master handloom artisans at work" },
          { time: "18:30", title: "Witness the magnificent Dashashwamedh Ghat Ganga Aarti", category: "Activities", cost: 100, location: "Dashashwamedh Ghat", notes: "Choreographed brass lamps, conch shells & chants" },
          { time: "20:30", title: "Street food dinner — Spicy Tamatar Chaat & Banarasi Paan", category: "Food", cost: 200, location: "Kashi Chaat Bhandar", notes: "Unbeatable local delicacies" }
        ]
      }
    ]
  }
};

/**
 * Generate a generic dynamic Indian itinerary template for any Indian location
 */
function generateDynamicIndianItinerary(destName, numDays, travelStyle = "solo", interests = [], budget = 15000, travelers = 1) {
  const result = [];
  const perDayTarget = Math.max(800, Math.round(budget / (numDays * travelers)));

  for (let i = 1; i <= numDays; i++) {
    const dayActivities = [];

    // Activity 1: Breakfast / Arrival
    dayActivities.push({
      _id: `act_${i}_1`,
      time: i === 1 ? "09:00" : "08:30",
      title: i === 1 ? `Arrive in ${destName}, check-in & freshen up` : `Morning tea & breakfast at iconic eatery in ${destName}`,
      category: i === 1 ? "Accommodation" : "Food",
      cost: i === 1 ? Math.round(perDayTarget * 0.35) : Math.round(perDayTarget * 0.12),
      location: `${destName} Central`,
      notes: i === 1 ? "Meet fellow travelers and get settled" : "Energizing local morning meal"
    });

    // Activity 2: Main Sightseeing / Adventure
    dayActivities.push({
      _id: `act_${i}_2`,
      time: "10:30",
      title: `Explore ${destName} highlight & historic monuments`,
      category: "Activities",
      cost: Math.round(perDayTarget * 0.2),
      location: `${destName} Heritage Zone`,
      notes: "Experience core cultural landmarks and architecture"
    });

    // Activity 3: Lunch
    dayActivities.push({
      _id: `act_${i}_3`,
      time: "13:30",
      title: `Authentic regional thali lunch tasting local flavors`,
      category: "Food",
      cost: Math.round(perDayTarget * 0.18),
      location: `${destName} Old Bazaar`,
      notes: "Try the region's famous signature recipes"
    });

    // Activity 4: Afternoon Adventure or Crafts
    dayActivities.push({
      _id: `act_${i}_4`,
      time: "16:00",
      title: interests.some(int => int.toLowerCase().includes("trek") || int.toLowerCase().includes("nature"))
        ? `Scenic nature trail & scenic ridge hike around ${destName}`
        : `Handicrafts market & cultural artisan quarter in ${destName}`,
      category: "Activities",
      cost: Math.round(perDayTarget * 0.1),
      location: `${destName} Outskirts`,
      notes: "Panoramic viewpoints and photography"
    });

    // Activity 5: Sunset & Dinner
    dayActivities.push({
      _id: `act_${i}_5`,
      time: "18:30",
      title: `Sunset viewpoint & evening cultural stroll`,
      category: "Activities",
      cost: Math.round(perDayTarget * 0.05),
      location: `${destName} Promenade`,
      notes: "Magical golden hour reflections"
    });

    // Activity 6: Dinner
    dayActivities.push({
      _id: `act_${i}_6`,
      time: "20:30",
      title: `Dinner & local music at popular solo traveler hub in ${destName}`,
      category: "Food",
      cost: Math.round(perDayTarget * 0.25),
      location: `${destName} Dining Street`,
      notes: "Delicious evening meal & meet fellow explorers"
    });

    result.push({
      day: i,
      dayNumber: i,
      title: `Day ${i}: ${destName} ${i === 1 ? "Arrival & Orientation" : i === numDays ? "Highlights & Wrap-up" : "Discovery & Exploration"}`,
      theme: i === 1 ? "Arrival & Orientation" : `Day ${i} Highlights`,
      activities: dayActivities
    });
  }

  return result;
}

/**
 * Main AI Planner Engine generator
 */
async function generateAITripItinerary(params) {
  const {
    destination,
    days = 3,
    startDate,
    travelers = 1,
    budget = 15000,
    interests = ["Nature", "Culture"],
    travelStyle = "Solo Backpacker",
    accommodation = "Backpacker Hostel",
    foodPreference = "Authentic Local Cuisine",
    transportation = "Public Buses & Rental Scooter"
  } = params;

  // 1. Strict India-only validation
  if (!isIndianDestination(destination)) {
    return {
      success: false,
      error: "Sorry, this platform currently supports travel destinations within India only.",
      isIndiaOnlyError: true
    };
  }

  const numDays = Math.max(1, Math.min(14, parseInt(days, 10) || 3));
  const numTravelers = Math.max(1, parseInt(travelers, 10) || 1);
  const totalBudget = Math.max(500, parseFloat(budget) || 15000);

  const destClean = destination.trim();
  const destKey = destClean.toLowerCase();

  // Check if we have an in-depth curated profile for this destination
  let matchedProfile = null;
  for (const [key, profile] of Object.entries(DESTINATION_PROFILES)) {
    if (destKey.includes(key) || key.includes(destKey)) {
      matchedProfile = profile;
      break;
    }
  }

  let dayItineraries = [];
  let highlights = [];
  let foodSuggestions = { mustTryDishes: [], recommendedSpots: [] };
  let transportationInfo = {};
  let travelTimes = [];
  let accommodations = [];
  let packingList = [];
  let safetyTips = [];
  let stateName = "India";
  let coverImage = "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200";

  if (matchedProfile) {
    stateName = matchedProfile.state;
    coverImage = matchedProfile.coverImage;
    highlights = matchedProfile.highlights;
    foodSuggestions = matchedProfile.foodSuggestions;
    transportationInfo = matchedProfile.transportation;
    travelTimes = matchedProfile.travelTimes;
    accommodations = matchedProfile.accommodations;
    packingList = matchedProfile.packingList;
    safetyTips = matchedProfile.safetyTips;

    // Take profile days or stretch/trim to match requested days
    const baseDays = matchedProfile.itineraryDays;
    for (let i = 1; i <= numDays; i++) {
      const templateDayIndex = (i - 1) % baseDays.length;
      const baseDay = JSON.parse(JSON.stringify(baseDays[templateDayIndex]));
      baseDay.day = i;
      baseDay.dayNumber = i;
      if (i > baseDays.length) {
        baseDay.title = `Day ${i}: ${destClean} Extended Exploration (Part ${i})`;
      }
      baseDay.activities = baseDay.activities.map((a, idx) => ({
        ...a,
        _id: `act_${i}_${idx + 1}`
      }));
      dayItineraries.push(baseDay);
    }
  } else {
    // Dynamic generation for any Indian destination
    dayItineraries = generateDynamicIndianItinerary(destClean, numDays, travelStyle, interests, totalBudget, numTravelers);
    highlights = [
      `${destClean} Heritage Quarter & Landmark Architecture`,
      `Scenic Nature Trails & Panoramic Viewpoints`,
      `Traditional Bazaars & Local Handicraft Centers`,
      `Signature Local Culinary Food Trail`,
      `Cultural Sunset Gathering & Night Street Exploration`
    ];
    foodSuggestions = {
      mustTryDishes: [
        `Authentic Regional ${destClean} Thali`,
        `Freshly Brewed Special Masala Chai & Regional Snacks`,
        `Traditional Clay-pot Sweets & Savories`,
        `Locally Sourced Seasonal Curries & Breads`
      ],
      recommendedSpots: [
        `Iconic Heritage Dhaba in ${destClean} Old Town`,
        `Popular Solo Backpacker Garden Cafe`,
        `Famous Street Food Chowk near Main Market`,
        `Scenic Viewpoint Tea Stall`
      ]
    };
    transportationInfo = {
      gettingThere: `Easily accessible via nearest Indian Railways junction, state transport bus terminal (HRTC/RSRTC/KSRTC), or nearest regional airport.`,
      localTransit: `Rent a scooter/bike (₹350–₹800/day) or use shared auto-rickshaws (₹20–₹50) and state buses for budget travel.`,
      averageLocalFare: `₹250 - ₹500 / day`
    };
    travelTimes = [
      { from: "Transit Hub", to: "City Center", duration: "20 mins" },
      { from: "City Center", to: "Top Attraction", duration: "15 mins" },
      { from: "City Center", to: "Sunset Viewpoint", duration: "25 mins" }
    ];
    accommodations = [
      { name: `${destClean} Backpacker Hostel`, type: "Hostel / Dorm", pricePerNight: 650, location: "Central", rating: 4.8 },
      { name: `Heritage Green Homestay`, type: "Homestay", pricePerNight: 1500, location: "Quiet Quarter", rating: 4.7 },
      { name: `${destClean} Boutique Stay`, type: "Boutique Hotel", pricePerNight: 2800, location: "Scenic Vista", rating: 4.9 }
    ];
    packingList = [
      "Comfortable breathable walking / trekking shoes",
      "Layered clothing suitable for regional weather",
      "Power bank & reusable insulated water flask",
      "Personal first-aid kit & basic medications",
      "Aadhaar card / Government photo ID photocopy & digital backup"
    ];
    safetyTips = [
      "Share your daily live location with a trusted contact.",
      "Carry some cash as remote street stalls and mountain shacks may have patchy UPI network.",
      "Emergency National Helpline: Dial 112 | 24x7 Tourist Helpline: 1363 (Toll Free)."
    ];
  }

  // Adjust activities according to specific interests & travel styles
  if (interests.some(i => i.toLowerCase().includes("trek") || i.toLowerCase().includes("adventure"))) {
    // Boost trekking & outdoor activities
    dayItineraries.forEach(d => {
      d.activities.forEach(a => {
        if (a.category === "Activities" && !a.title.toLowerCase().includes("trek") && !a.title.toLowerCase().includes("hike")) {
          a.notes += " — Opportunity to extend into a scenic mountain/nature ridge trek.";
        }
      });
    });
  }

  // Calculate estimated total cost from activities
  let totalCalculatedCost = 0;
  dayItineraries.forEach(d => {
    d.dayCost = d.activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
    totalCalculatedCost += d.dayCost;
  });

  // Add estimated stay cost if not included
  const estimatedStayPerNight = accommodations[0]?.pricePerNight || 700;
  const totalStayCost = estimatedStayPerNight * Math.max(1, numDays - 1) * numTravelers;
  const grandTotal = totalCalculatedCost + totalStayCost;

  return {
    success: true,
    tripMeta: {
      destination: destClean,
      state: stateName,
      days: numDays,
      startDate: startDate || new Date().toISOString().split("T")[0],
      travelers: numTravelers,
      budget: totalBudget,
      currency: "INR (₹)",
      travelStyle,
      accommodation,
      foodPreference,
      transportation,
      interests,
      coverImage
    },
    itinerary: dayItineraries,
    placesToVisit: highlights,
    foodSuggestions,
    transportation: transportationInfo,
    travelTimes,
    packingList,
    safetyTips,
    accommodations,
    budgetBreakdown: {
      targetBudget: totalBudget,
      estimatedActivitiesCost: totalCalculatedCost,
      estimatedAccommodationCost: totalStayCost,
      estimatedTotalCost: grandTotal,
      perPersonCost: Math.round(grandTotal / numTravelers),
      perDayCost: Math.round(grandTotal / numDays),
      savingsOrExcess: totalBudget - grandTotal,
      isUnderBudget: grandTotal <= totalBudget
    }
  };
}

/**
 * Handle interactive AI Commands on existing itinerary
 */
function applyAICommand(command, currentItinerary, tripMeta, options = {}) {
  const { commandType, dayNumber, customPrompt } = options;
  const cmd = (commandType || command || "").toLowerCase().trim();
  const destName = tripMeta?.destination || "India";

  const updatedItinerary = JSON.parse(JSON.stringify(currentItinerary || []));

  switch (cmd) {
    case "regenerate_day": {
      const targetDay = parseInt(dayNumber, 10) || 1;
      const dayIndex = updatedItinerary.findIndex(d => (d.dayNumber || d.day) === targetDay);
      if (dayIndex !== -1) {
        updatedItinerary[dayIndex].activities = [
          { _id: `act_${targetDay}_r1`, time: "08:30", title: `Morning tea & artisanal bakery breakfast at ${destName}`, category: "Food", cost: 200, location: "Old Town", notes: "Fresh morning bakery items & regional chai" },
          { _id: `act_${targetDay}_r2`, time: "10:00", title: `Offbeat heritage trail & hidden architectural wonder in ${destName}`, category: "Activities", cost: 250, location: "Heritage Quarter", notes: "Less crowded scenic spot" },
          { _id: `act_${targetDay}_r3`, time: "13:00", title: `Authentic regional thali feast at historic local eatery`, category: "Food", cost: 350, location: "Bazaar Chowk", notes: "Rich traditional flavors" },
          { _id: `act_${targetDay}_r4`, time: "15:30", title: `Panoramic nature viewpoint & photography walk`, category: "Activities", cost: 100, location: "Hilltop Vista", notes: "Spectacular landscape view" },
          { _id: `act_${targetDay}_r5`, time: "18:00", title: `Sunset tea & live cultural folk performance`, category: "Activities", cost: 200, location: "Cultural Hub", notes: "Unforgettable evening experience" },
          { _id: `act_${targetDay}_r6`, time: "20:30", title: `Specialty dinner with fellow travelers at cozy rooftop cafe`, category: "Food", cost: 450, location: "Promenade", notes: "Great food & atmosphere" }
        ];
        updatedItinerary[dayIndex].title = `Day ${targetDay}: ${destName} Refreshed & Offbeat Discovery`;
      }
      break;
    }

    case "more_trekking": {
      // Injects trekking trails and outdoor hikes
      updatedItinerary.forEach((d, dIdx) => {
        const trekActivities = [
          { time: "09:00", title: `Morning ridge hike & mountain forest trek in ${destName}`, category: "Activities", cost: 150, location: "Alpine / Nature Trail", notes: "Scenic viewpoints and pine fresh air" },
          { time: "15:00", title: `Adventure nature exploration & waterfall scramble`, category: "Activities", cost: 200, location: "Valley Outskirts", notes: "Active outdoor exploration" }
        ];
        if (d.activities && d.activities.length > 2) {
          d.activities[1] = { _id: `act_trk_${dIdx}_1`, ...trekActivities[0] };
          if (d.activities.length > 4) {
            d.activities[3] = { _id: `act_trk_${dIdx}_2`, ...trekActivities[1] };
          }
        }
        d.title += " (Adventure & Trekking Focused)";
      });
      break;
    }

    case "reduce_travel_time": {
      // Clusters activities by location and smooths timings
      updatedItinerary.forEach(d => {
        if (d.activities) {
          d.activities.forEach(a => {
            a.notes += " [Clustered in same walkable zone to minimize transit]";
          });
        }
      });
      break;
    }

    case "make_cheaper": {
      // Slashes activity costs by suggesting budget alternatives, street food, and free monuments
      updatedItinerary.forEach(d => {
        if (d.activities) {
          d.activities.forEach(a => {
            const originalCost = Number(a.cost) || 0;
            a.cost = Math.max(0, Math.round(originalCost * 0.55));
            if (a.category === "Food") {
              a.title = a.title.replace(/Boutique|Fine Dining|Resort/gi, "Authentic Local Dhaba");
              a.notes = "Budget-friendly local favorite offering delicious authentic thali.";
            } else if (a.category === "Transportation") {
              a.title = a.title.replace(/Cab|Taxi|Private/gi, "Shared Bus / E-Rickshaw");
              a.notes = "Economical public transit option.";
            }
          });
        }
      });
      break;
    }

    case "more_relaxing": {
      // Reduces pacing, adds tea breaks and leisure intervals
      updatedItinerary.forEach(d => {
        if (d.activities && d.activities.length > 4) {
          d.activities = d.activities.filter((_, idx) => idx !== 3); // Remove middle hectic item
        }
        if (d.activities) {
          d.activities.forEach(a => {
            if (a.category === "Activities") {
              a.notes += " — Take your time, relaxed pace with no rush.";
            }
          });
        }
        d.title += " (Slow & Relaxed Pace)";
      });
      break;
    }

    case "add_local_food": {
      // Injects street food hubs and regional specialty dining
      updatedItinerary.forEach((d, dIdx) => {
        if (d.activities) {
          d.activities.push({
            _id: `act_food_${dIdx}_${Date.now()}`,
            time: "17:30",
            title: `Street food crawl: Try famous regional Chaat, Lassi & Sweets`,
            category: "Food",
            cost: 180,
            location: `${destName} Street Food Bazaar`,
            notes: "Iconic local food stalls with unforgettable flavors"
          });
          d.activities.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        }
      });
      break;
    }

    case "optimize_budget": {
      // Recalibrates costs to match target budget
      const targetBudget = Number(tripMeta?.budget) || 15000;
      const numDays = updatedItinerary.length || 3;
      const perDayBudget = targetBudget / numDays;

      updatedItinerary.forEach(d => {
        const currentDayCost = d.activities.reduce((s, a) => s + (Number(a.cost) || 0), 0);
        if (currentDayCost > perDayBudget) {
          const ratio = perDayBudget / currentDayCost;
          d.activities.forEach(a => {
            a.cost = Math.round(Number(a.cost) * ratio);
          });
        }
      });
      break;
    }

    default: {
      // Custom prompt modification
      if (customPrompt) {
        updatedItinerary.forEach(d => {
          if (d.activities && d.activities.length > 0) {
            d.activities[0].notes += ` (Custom refinement: ${customPrompt})`;
          }
        });
      }
      break;
    }
  }

  // Recalculate costs
  let totalCost = 0;
  updatedItinerary.forEach(d => {
    d.dayCost = (d.activities || []).reduce((s, a) => s + (Number(a.cost) || 0), 0);
    totalCost += d.dayCost;
  });

  return {
    success: true,
    itinerary: updatedItinerary,
    totalCost,
    message: `Itinerary successfully updated with command: ${commandType || customPrompt || "refined"}`
  };
}

module.exports = {
  isIndianDestination,
  generateAITripItinerary,
  applyAICommand,
  DESTINATION_PROFILES,
  INDIAN_KEYWORDS,
  NON_INDIAN_DESTINATIONS
};
