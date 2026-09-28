// Comprehensive Indian Solo Travel Safety Intelligence & Emergency Guidelines

const DESTINATION_SAFETY_PROFILES = {
  manali: {
    safetyScore: 4.8,
    soloFriendliness: 9.6,
    safeNeighborhoods: ["Old Manali Village", "Vashisht", "Naggar Road", "Model Town"],
    emergencyContacts: [
      { name: "National All-in-One Emergency", number: "112", icon: "🚨" },
      { name: "24x7 Tourist Police Helpline", number: "1363", icon: "🇮🇳" },
      { name: "Women Safety Helpline", number: "1091", icon: "👩" },
      { name: "Medical Ambulance Emergency", number: "108", icon: "🚑" },
      { name: "Manali Police Station", number: "01902-252322", icon: "👮" },
      { name: "Civil Hospital Manali", number: "01902-252317", icon: "🏥" }
    ],
    soloTips: [
      "Old Manali and Vashisht have thriving backpacker hostel ecosystems (Zostel, The Lost Hostels) which are extremely welcoming and secure for solo travelers.",
      "Always negotiate taxi/auto fares at the Govt Prepaid Taxi Stand near Mall Road to prevent overcharging.",
      "Himachal Pradesh has low crime rates; locals are hospitable and helpful toward solo explorers.",
      "Keep digital and physical copies of your ID proof (Aadhaar / Passport) in your daypack."
    ],
    trekkingSafety: [
      "Acclimatization: Manali sits at 2,050m. Allow 24 hours of rest before attempting high-altitude treks like Bhrigu Lake or Hampta Pass (3,500m+).",
      "Hydration: Drink at least 3-4 liters of water daily to counter altitude sickness (AMS).",
      "Never trek alone into deep cedar forests past 5:00 PM; mountain weather changes rapidly.",
      "Hire local certified IMF (Indian Mountaineering Foundation) guides for multi-day treks.",
      "Carry a whistle, multi-tool knife, and high-lumen headlamp on all ridge trails."
    ],
    wildlifeSafety: [
      "Keep food items securely zipped; Himalayan langurs and monkeys around Hadimba temple are attracted to open snacks.",
      "Do not venture off-trail into dense forest sanctuaries after dusk due to nocturnal Himalayan black bears.",
      "Maintain a safe distance from grazing mountain yaks and horses along Solang and Rohtang meadows."
    ],
    weatherWarnings: [
      "Monsoon Alert (July–August): Heavy rains can trigger flash floods along the Beas river and landslides on the NH3 highway.",
      "Winter Snow Alert (December–February): Roads past Solang can develop slippery black ice; use 4x4 vehicles with tire snow chains."
    ]
  },

  jaipur: {
    safetyScore: 4.6,
    soloFriendliness: 9.2,
    safeNeighborhoods: ["C-Scheme", "Bani Park", "Civil Lines", "MI Road"],
    emergencyContacts: [
      { name: "National Emergency", number: "112", icon: "🚨" },
      { name: "Rajasthan Tourist Assistance Force (TAF)", number: "1363", icon: "🇮🇳" },
      { name: "Women Helpline (Garima)", number: "1091", icon: "👩" },
      { name: "Medical Ambulance", number: "108", icon: "🚑" },
      { name: "Jaipur Police Control Room", number: "0141-2374433", icon: "👮" },
      { name: "SMS Hospital Jaipur (Govt Multi-Specialty)", number: "0141-2560291", icon: "🏥" }
    ],
    soloTips: [
      "Use the clean, air-conditioned Jaipur Metro for easy, safe travel between Chandpole, Railway Station, and Mansarovar.",
      "Buy the composite monument entry ticket at your first fort to skip touts and queues at Amer, Hawa Mahal, and Jantar Mantar.",
      "In crowded bazaars (Johari & Bapu Bazaar), keep your backpack zipped in front in dense corridors.",
      "Bani Park and C-Scheme host top-rated solo traveler hostels with lively community vibes."
    ],
    trekkingSafety: [
      "The Nahargarh fort ridge walk offers stunning sunset panoramas; ensure you begin your descent before total darkness.",
      "Stone fort ramps at Amer and Jaigarh are steep and polished; wear sneakers with strong rubber traction.",
      "Carry ample water and electrolyte sachets as Rajasthan's arid sun can cause dehydration."
    ],
    wildlifeSafety: [
      "Galta Ji (Monkey Temple): Avoid wearing dangling jewelry or holding plastic bags that monkeys associate with food.",
      "Do not feed stray street animals; photograph them from a respectful distance."
    ],
    weatherWarnings: [
      "Summer Heat Alert (April–June): Midday temperatures can exceed 42°C. Schedule sightseeing strictly between 7:30 AM–11:00 AM and 4:30 PM–7:30 PM."
    ]
  },

  rishikesh: {
    safetyScore: 4.9,
    soloFriendliness: 9.7,
    safeNeighborhoods: ["Tapovan", "Swarg Ashram", "High Bank", "Ram Jhula"],
    emergencyContacts: [
      { name: "National Emergency", number: "112", icon: "🚨" },
      { name: "Uttarakhand Tourist Helpline", number: "1363", icon: "🇮🇳" },
      { name: "Women Helpline", number: "1091", icon: "👩" },
      { name: "Ambulance", number: "108", icon: "🚑" },
      { name: "Muni Ki Reti Police Station", number: "0135-2430040", icon: "👮" },
      { name: "AIIMS Rishikesh Hospital", number: "0135-2462929", icon: "🏥" }
    ],
    soloTips: [
      "Tapovan is arguably one of the safest and most sociable neighborhoods in India for solo female backpackers and yogis.",
      "Rishikesh is a holy dry town — alcohol and non-vegetarian food are strictly prohibited inside city limits.",
      "Shared Vikram autos cost only ₹10–₹20 between Tapovan, Ram Jhula, and Triveni Ghat.",
      "Stay in registered ashrams or certified backpacker hostels near Lakshman Jhula."
    ],
    trekkingSafety: [
      "Rafting Safety: Strictly wear certified life jackets and helmets; raft only with DG-Shipping authorized river guides.",
      "Neer Garh & Patna Waterfall treks involve slippery mossy rocks; wear shoes with water-drainage grip.",
      "Do not swim in rapid white-water sections of the Ganga outside calm ghat shallows."
    ],
    wildlifeSafety: [
      "Rajaji National Park border: Avoid forest trails along Neelkanth Mahadev road on foot after dark as wild elephants occasionally cross.",
      "Do not approach langurs on the suspension bridges."
    ],
    weatherWarnings: [
      "Monsoon River Alert (July–August): White-water rafting is closed during peak monsoon due to torrential river swelling."
    ]
  },

  goa: {
    safetyScore: 4.7,
    soloFriendliness: 9.4,
    safeNeighborhoods: ["Anjuna", "Assagao", "Vagator", "Fontainhas (Panaji)", "Palolem"],
    emergencyContacts: [
      { name: "National Emergency", number: "112", icon: "🚨" },
      { name: "Goa Tourist Police", number: "1363", icon: "🇮🇳" },
      { name: "Women Helpline", number: "1091", icon: "👩" },
      { name: "Medical Ambulance", number: "108", icon: "🚑" },
      { name: "Anjuna Police Station", number: "0832-2273233", icon: "👮" },
      { name: "Goa Medical College Hospital (Bambolim)", number: "0832-2458700", icon: "🏥" }
    ],
    soloTips: [
      "Renting a scooter (₹350–₹500/day) is the most flexible way to get around; inspect the vehicle brakes before taking possession.",
      "Always wear a helmet; Goa traffic police conduct strict spot checks.",
      "Keep personal belongings inside a waterproof pouch when swimming or strolling on the sand.",
      "Hostels in Anjuna and Vagator organize group beach cleanups, sunset treks, and community dinners."
    ],
    trekkingSafety: [
      "Chapora Fort red laterite cliffs are crumbly near the edge; stay on demarcated stone pathways.",
      "Dudhsagar Waterfall trek involves crossing active railway tracks; go with authorized forest department jeep tours."
    ],
    wildlifeSafety: [
      "Swim strictly within red-and-yellow flagged safe swimming zones patrolled by Drishti Marine lifeguards.",
      "Beware of sea urchins and jellyfish during monsoon and seasonal tide transitions."
    ],
    weatherWarnings: [
      "Monsoon Sea Alert (June–September): High sea tides and rough undercurrents. Swimming in the ocean is strictly prohibited."
    ]
  },

  varanasi: {
    safetyScore: 4.4,
    soloFriendliness: 9.0,
    safeNeighborhoods: ["Assi Ghat", "Shivala", "Cantt Area", "Godowlia"],
    emergencyContacts: [
      { name: "National Emergency", number: "112", icon: "🚨" },
      { name: "UP Tourist Police", number: "1363", icon: "🇮🇳" },
      { name: "Women Power Line", number: "1090", icon: "👩" },
      { name: "Medical Ambulance", number: "108", icon: "🚑" },
      { name: "Dashashwamedh Police Station", number: "0542-2451233", icon: "👮" },
      { name: "Sir Sunderlal Hospital (BHU)", number: "0542-2307500", icon: "🏥" }
    ],
    soloTips: [
      "Assi Ghat is the quietest and most traveler-friendly neighborhood to stay in Varanasi.",
      "Never pay boatmen in advance; negotiate ₹250–₹400 for a 1-hour sunrise row-boat ride.",
      "Respect religious privacy: Strictly refrain from taking photographs at Manikarnika and Harishchandra cremation ghats.",
      "Labyrinthine gullies are pedestrian-only; walk with confidence or use offline maps."
    ],
    trekkingSafety: [
      "Walking all 84 ghats from Assi to Rajghat is an 8 km journey; wear comfortable footwear and stay hydrated.",
      "Ghat stone steps can be slippery near river water lines due to silt."
    ],
    wildlifeSafety: [
      "Cows and bulls are common in narrow gullies; walk past them calmly without sudden hand gestures."
    ],
    weatherWarnings: [
      "Ganga Flood Alert (August–September): High river water levels submerge lower ghat steps and halt boat rides temporarily."
    ]
  }
};

/**
 * Get comprehensive safety intelligence for any Indian destination
 */
function getDestinationSafetyInfo(destination) {
  const destClean = (destination || "India").toLowerCase().trim();

  let profile = DESTINATION_SAFETY_PROFILES[destClean];
  if (!profile) {
    for (const [key, val] of Object.entries(DESTINATION_SAFETY_PROFILES)) {
      if (destClean.includes(key) || key.includes(destClean)) {
        profile = val;
        break;
      }
    }
  }

  if (profile) {
    return {
      destination,
      safetyScore: profile.safetyScore,
      soloFriendliness: profile.soloFriendliness,
      safeNeighborhoods: profile.safeNeighborhoods,
      emergencyContacts: profile.emergencyContacts,
      soloTips: profile.soloTips,
      trekkingSafety: profile.trekkingSafety,
      wildlifeSafety: profile.wildlifeSafety,
      weatherWarnings: profile.weatherWarnings
    };
  }

  // Generic Indian solo safety intelligence
  return {
    destination,
    safetyScore: 4.5,
    soloFriendliness: 9.1,
    safeNeighborhoods: [`${destination} Central`, `${destination} Heritage Quarter`, "Civil Lines"],
    emergencyContacts: [
      { name: "National Emergency Helpline", number: "112", icon: "🚨" },
      { name: "24x7 India Tourist Helpline", number: "1363", icon: "🇮🇳" },
      { name: "National Women Helpline", number: "1091", icon: "👩" },
      { name: "Medical Ambulance Emergency", number: "108", icon: "🚑" }
    ],
    soloTips: [
      "Share your daily travel live location with a trusted family member or friend.",
      "Prefer registered backpacker hostels or vetted homestays with verified guest reviews.",
      "Keep digital backups of your Aadhaar card, travel insurance, and hotel confirmations on your phone.",
      "Carry sufficient cash (₹100/₹500 notes) for remote attractions where UPI network signals may drop."
    ],
    trekkingSafety: [
      "Check trail conditions and weather forecasts before setting out on outdoor nature hikes.",
      "Carry a small first-aid kit, blister plasters, water purification tablets, and high-protein trail snacks.",
      "Stay on established trekking routes; do not attempt shortcuts on steep ridges."
    ],
    wildlifeSafety: [
      "Do not feed wild animals or leave unattended food packs in forest sanctuaries.",
      "Maintain a safe observation distance when photographing birds and mammals."
    ],
    weatherWarnings: [
      "Check seasonal weather advisories before planning high mountain transit or coastal water activities."
    ]
  };
}

module.exports = {
  DESTINATION_SAFETY_PROFILES,
  getDestinationSafetyInfo
};
