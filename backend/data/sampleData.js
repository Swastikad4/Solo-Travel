// Comprehensive Indian Destinations sample dataset
// 100% India — Validated across States, Districts, Cities, Towns, and Attractions

const destinations = {
  jaipur: {
    _id: "ind_jaipur_01",
    name: "Jaipur",
    slug: "jaipur",
    country: "India",
    state: "Rajasthan",
    stateType: "State",
    district: "Jaipur",
    city: "Jaipur",
    townOrVillage: "Amer / Old Pink City",
    tagline: "The Royal Pink City of Forts, Palaces & Vibrant Bazars",
    description: "Rajasthan's regal capital enchants solo travelers with majestic hilltop amber fortresses, intricate terracotta-pink royal facades, astronomy observatories, and welcoming traveler cafes in C-Scheme.",
    category: ["Heritage", "Cultural & Food", "Architecture"],
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
      "https://images.unsplash.com/photo-1603288940300-349c4033320f?w=800",
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800"
    ],
    attractions: [
      { name: "Amer Fort", type: "Fort / Palace", description: "Imposing 16th-century red sandstone and marble fortress overlooking Maota Lake.", entryFee: "₹100 (Indians) / ₹500 (Foreigners)", timings: "8:00 AM – 5:30 PM, 6:30 PM – 9:15 PM" },
      { name: "Hawa Mahal", type: "Palace", description: "Iconic honeycomb 5-story facade with 953 jharokhas designed for royal breeze.", entryFee: "₹50 (Indians) / ₹200 (Foreigners)", timings: "9:00 AM – 5:00 PM" },
      { name: "City Palace & Jantar Mantar", type: "Heritage & Astronomy", description: "Living royal residence and UNESCO astronomical observation instruments.", entryFee: "₹70 (Jantar Mantar) / ₹300 (City Palace)", timings: "9:30 AM – 5:00 PM" },
      { name: "Nahargarh Fort", type: "Fort & Sunset View", description: "Perched on the Aravalli ridge; the best sunset point overlooking the entire city lights.", entryFee: "₹50", timings: "10:00 AM – 5:30 PM" },
      { name: "Johari & Bapu Bazaar", type: "Market", description: "Labyrinthine pink corridors filled with gemstones, juttis, bandhani textiles, and street snacks.", entryFee: "Free", timings: "11:00 AM – 9:00 PM" }
    ],
    famousPlaces: ["Amer Fort", "Hawa Mahal", "City Palace", "Nahargarh Fort", "Jantar Mantar", "Jal Mahal"],
    thingsToDo: [
      "Watch the golden sunset over Jaipur from Padao Restaurant at Nahargarh Fort",
      "Savor authentic Pyaaz Kachori and Lassi at MI Road",
      "Stay at a boutique traveler hostel in C-Scheme and join guided heritage walking tours",
      "Explore the stepwell geometry at Panna Meena Ka Kund near Amer",
      "Shop for hand-block printed textiles at Anokhi Museum"
    ],
    safetyRating: 4.5,
    soloScore: 9.3,
    avgBudget: {
      min: 1200,
      max: 2800,
      perDay: 1800,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 3,
    bestTime: "October to March",
    bestMonths: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    language: ["Hindi", "Rajasthani", "English"],
    howToReach: {
      airport: "Jaipur International Airport (JAI) — 13 km from city center",
      railway: "Jaipur Junction (JP) — Superfast express trains from Delhi, Mumbai, Kolkata",
      road: "Well connected via NH48 (4.5 hrs from Delhi by bus or car)"
    },
    soloTravelerTips: [
      "Jaipur Metro is clean, safe, and air-conditioned for traversing between railway station and Chandpole.",
      "Get the composite entry ticket at your first monument to skip ticket queues at Amer, Hawa Mahal, and Jantar Mantar.",
      "Stay in hostel hubs in Bani Park or C-Scheme for meeting fellow backpackers and reliable group rides."
    ]
  },

  varanasi: {
    _id: "ind_varanasi_02",
    name: "Varanasi",
    slug: "varanasi",
    country: "India",
    state: "Uttar Pradesh",
    stateType: "State",
    district: "Varanasi",
    city: "Varanasi",
    townOrVillage: "Assi Ghat / Dashashwamedh Ghat",
    tagline: "The Eternal Spiritual Heart of India on the Holy Ganga",
    description: "One of the world's oldest continuously inhabited cities. Solo travelers find transcendent serenity along its 84 historic stone ghats, hypnotic evening aartis, labyrinthine silk gullies, and boat dawns.",
    category: ["Spiritual", "Cultural & Food", "Heritage"],
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=800",
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800"
    ],
    attractions: [
      { name: "Dashashwamedh Ghat Ganga Aarti", type: "Spiritual Ceremony", description: "Mesmerizing synchronized brass lamp ritual conducted every evening by young priests.", entryFee: "Free (boat viewing ₹150–₹300)", timings: "6:30 PM – 7:30 PM" },
      { name: "Assi Ghat", type: "Ghat & Morning Yoga", description: "Southernmost ghat famous for Subah-e-Banaras classical music, yoga, and traveler cafes.", entryFee: "Free", timings: "Open 24 hours (Dawn is prime)" },
      { name: "Kashi Vishwanath Temple & Corridor", type: "Sacred Temple", description: "Revered Jyotirlinga shrine dedicated to Lord Shiva, newly renovated with a grand river corridor.", entryFee: "Free / Sugam Darshan ₹300", timings: "3:00 AM – 11:00 PM" },
      { name: "Sarnath", type: "Buddhist Heritage", description: "Deer park where Gautam Buddha taught his first sermon; Dhamek Stupa and Ashoka Pillar.", entryFee: "₹25 (Indians) / ₹300 (Foreigners)", timings: "Sunrise to Sunset" },
      { name: "Manikarnika & Harishchandra Ghats", type: "Sacred Ghat", description: "Sacred cremation ghats reflecting the profound philosophy of liberation (Moksha).", entryFee: "Free (respect photography rules)", timings: "Open 24 hours" }
    ],
    famousPlaces: ["Dashashwamedh Ghat", "Assi Ghat", "Kashi Vishwanath Temple", "Sarnath", "Manikarnika Ghat"],
    thingsToDo: [
      "Wake up before sunrise for a silent row-boat ride along the mist-covered riverfront",
      "Savor creamy Banarasi Malaiyo and Blue Lassi in the hidden alleyways",
      "Attend dawn yoga sessions and morning classical music concerts at Assi Ghat",
      "Spend an afternoon cycling through the Buddhist ruins and museum at Sarnath",
      "Sample Banarasi Paan and Tamatar Chaat near Godowlia Chowk"
    ],
    safetyRating: 4.1,
    soloScore: 9.0,
    avgBudget: {
      min: 800,
      max: 2000,
      perDay: 1300,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 3,
    bestTime: "October to March",
    bestMonths: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    language: ["Hindi", "Bhojpuri", "English"],
    howToReach: {
      airport: "Lal Bahadur Shastri International Airport (VNS) — 26 km north",
      railway: "Varanasi Junction (BSB) / Banaras (BSBS) — Direct Vande Bharat from New Delhi",
      road: "National Highway 19 connects seamlessly to Prayagraj, Lucknow, and Patna"
    },
    soloTravelerTips: [
      "Book accommodations near Assi Ghat or Shivala Ghat for quieter lanes and easy walkability.",
      "Never pay boatmen before negotiating clearly; morning rowboats should cost ~₹250-₹400 for an hour.",
      "Strictly respect photography restrictions around Manikarnika Ghat."
    ]
  },

  manali: {
    _id: "ind_manali_03",
    name: "Manali",
    slug: "manali",
    country: "India",
    state: "Himachal Pradesh",
    stateType: "State",
    district: "Kullu",
    city: "Manali",
    townOrVillage: "Old Manali / Vashisht",
    tagline: "Himalayan Alpine Wonderland of Pine Forests & Bohemian Trails",
    description: "Nestled at 2,050 meters along the roaring Beas river, Manali is India's premier solo adventure hub. Old Manali's rustic wooden cottages, apple orchards, cozy workation cafes, and dramatic Rohtang Pass gateways draw globetrotters year-round.",
    category: ["Hill Station", "Adventure & Trekking", "Nature & Wildlife"],
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
    ],
    attractions: [
      { name: "Old Manali Village & Cafes", type: "Bohemian Village", description: "Cobblestone trails lined with pine trees, live music cafes, and wooden traditional Himachali homes.", entryFee: "Free", timings: "Open all day" },
      { name: "Hadimba Temple", type: "Wooden Temple", description: "16th-century pagoda-style wooden shrine sheltered inside towering Dhungri cedar forests.", entryFee: "Free", timings: "8:00 AM – 6:00 PM" },
      { name: "Solang Valley & Atal Tunnel", type: "Adventure & Engineering", description: "Paragliding, quad biking, and direct portal through the Pir Panjal range to Lahaul Valley.", entryFee: "Free (activities extra)", timings: "Daytime" },
      { name: "Jogini Waterfalls Trek", type: "Nature Trek", description: "Scenic 3 km hike through apple orchards and pine cliffs starting from Vashisht hot springs.", entryFee: "Free", timings: "Best between 8:00 AM – 4:00 PM" },
      { name: "Vashisht Natural Hot Springs", type: "Wellness", description: "Centuries-old sulfur natural thermal baths known for rejuvenating tired hikers.", entryFee: "Free", timings: "7:00 AM – 8:00 PM" }
    ],
    famousPlaces: ["Old Manali", "Hadimba Temple", "Solang Valley", "Atal Tunnel", "Jogini Waterfalls", "Vashisht"],
    thingsToDo: [
      "Rent a Royal Enfield or mountain bike to ride through the Atal Tunnel into Sissu",
      "Hike up to Jogini Waterfall and enjoy mountain chai by the cascade",
      "Work remotely from riverside cafes in Old Manali offering high-speed fiber internet",
      "Paraglide over Solang Valley with certified Himalayan pilots",
      "Stroll through the deodar sanctuary in Van Vihar"
    ],
    safetyRating: 4.8,
    soloScore: 9.6,
    avgBudget: {
      min: 1000,
      max: 2600,
      perDay: 1600,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 4,
    bestTime: "March to June (Pleasant) & Oct to Feb (Snow)",
    bestMonths: ["Mar", "Apr", "May", "Jun", "Oct", "Nov", "Dec", "Jan"],
    language: ["Hindi", "Pahari", "English"],
    howToReach: {
      airport: "Bhuntar Airport / Kullu (KUU) — 50 km south (daily Delhi flights)",
      railway: "Joginder Nagar (narrow gauge) or Chandigarh (broad gauge, 310 km)",
      road: "Overnight luxury Volvo AC sleeper buses direct from Delhi (Kashmere Gate, 12 hrs)"
    },
    soloTravelerTips: [
      "Base yourself in Old Manali or Vashisht rather than Mall Road to avoid tourist crowds and meet solo travelers.",
      "ATMs can run out of cash during peak holiday weekends; carry sufficient cash for remote treks.",
      "Himachal Roadways (HRTC) buses are reliable and dirt-cheap for traveling between Kullu, Kasol, and Manali."
    ]
  },

  rishikesh: {
    _id: "ind_rishikesh_04",
    name: "Rishikesh",
    slug: "rishikesh",
    country: "India",
    state: "Uttarakhand",
    stateType: "State",
    district: "Dehradun",
    city: "Rishikesh",
    townOrVillage: "Tapovan / Laxman Jhula",
    tagline: "Yoga Capital of the World on the Turquoise Foothills of the Himalayas",
    description: "Where the sacred river Ganga emerges into the northern plains. Rishikesh balances spiritual rejuvenation, world-renowned ashrams, and yoga teacher trainings with white-water rafting, cliff jumping, and serene riverbank meditation.",
    category: ["Spiritual", "Adventure & Trekking", "Yoga & Wellness"],
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800"
    ],
    attractions: [
      { name: "Triveni Ghat Evening Aarti", type: "Spiritual Aarti", description: "Soulful musical Ganga aarti at confluence of three holy rivers with floating diya ceremonies.", entryFee: "Free", timings: "6:00 PM – 7:15 PM" },
      { name: "Beatles Ashram (Chaurasi Kutia)", type: "Heritage & Art", description: "Abandoned meditation complex covered in stunning graffiti where The Beatles composed the White Album.", entryFee: "₹150 (Indians) / ₹600 (Foreigners)", timings: "9:00 AM – 4:30 PM" },
      { name: "White Water Rafting (Shivpuri to NIM Beach)", type: "Adventure", description: "Thrilling Grade III & IV river rapids including Roller Coaster, Golf Course, and Club House.", entryFee: "₹600 – ₹1,200 per person", timings: "September to June (Daytime)" },
      { name: "Neer Garh Waterfalls", type: "Nature", description: "Two-tiered natural emerald pools secluded in the mountain jungle, ideal for dips.", entryFee: "₹30", timings: "8:00 AM – 5:00 PM" },
      { name: "Tapovan Sunset Cafes", type: "Social Hub", description: "Terrace cafes serving Ayurvedic vegan bowls, kombucha, and panoramic river valley views.", entryFee: "Varies", timings: "8:00 AM – 10:30 PM" }
    ],
    famousPlaces: ["Triveni Ghat", "Beatles Ashram", "Tapovan", "Laxman Jhula", "Neer Garh Waterfall", "Parmarth Niketan"],
    thingsToDo: [
      "Join drop-in morning Ashtanga or Hatha yoga sessions in Tapovan studios",
      "Raft through turbulent Ganga rapids from Shivpuri with certified river guides",
      "Listen to the twilight bells and chants at Parmarth Niketan Ganga Aarti",
      "Hike to the secret graffiti dome halls inside the Beatles Ashram",
      "Read a book by the white sandy shores of Marine Drive / Secret Beach"
    ],
    safetyRating: 4.9,
    soloScore: 9.7,
    avgBudget: {
      min: 900,
      max: 2200,
      perDay: 1400,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 3,
    bestTime: "September to November & February to May",
    bestMonths: ["Sep", "Oct", "Nov", "Feb", "Mar", "Apr", "May"],
    language: ["Hindi", "Garhwali", "English"],
    howToReach: {
      airport: "Dehradun Jolly Grant Airport (DED) — 20 km away (35 min taxi ride)",
      railway: "Yog Nagari Rishikesh (YNRK) / Haridwar (HW) — Direct train connectivity from across India",
      road: "Delhi to Rishikesh is a smooth 4.5-hour highway drive via Meerut Expressway"
    },
    soloTravelerTips: [
      "Tapovan is the safest and most social neighborhood for solo women and international backpackers.",
      "Alcohol and non-vegetarian food are strictly prohibited within Rishikesh city limits.",
      "Shared Vikram autos (three-wheelers) cost only ₹10-₹20 between Tapovan, Ram Jhula, and Triveni Ghat."
    ]
  },

  munnar: {
    _id: "ind_munnar_05",
    name: "Munnar",
    slug: "munnar",
    country: "India",
    state: "Kerala",
    stateType: "State",
    district: "Idukki",
    city: "Munnar",
    townOrVillage: "Old Munnar / Top Station",
    tagline: "Rolling Emerald Tea Carpets & Misty Western Ghat Ridges",
    description: "Perched 1,600 meters high in the Western Ghats, Munnar is a cool sanctuary of rolling manicured tea estates, rare Neelakurinji blossoms, mist-soaked waterfalls, and endangered Nilgiri Tahr mountain goats.",
    category: ["Hill Station", "Nature & Wildlife", "Backwaters & Greenery"],
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800"
    ],
    attractions: [
      { name: "Eravikulam National Park", type: "Wildlife Sanctuary", description: "Home to the endangered Nilgiri Tahr and the base for South India's highest peak, Anamudi.", entryFee: "₹200 (Indians) / ₹500 (Foreigners)", timings: "7:30 AM – 4:00 PM" },
      { name: "Tea Museum & Factory", type: "Heritage", description: "Learn orthodox black and green tea processing dating back to British colonial pioneers.", entryFee: "₹125", timings: "9:00 AM – 5:00 PM (Closed Mon)" },
      { name: "Top Station & Cloud Walk", type: "Panoramic Viewpoint", description: "Highest point on the Munnar-Kodaikanal road offering 360-degree views across Kerala and Tamil Nadu.", entryFee: "₹30", timings: "6:00 AM – 7:00 PM" },
      { name: "Mattupetty Dam & Lake", type: "Lake & Boating", description: "Scenic mountain reservoir surrounded by tea gardens where elephants frequently graze.", entryFee: "₹20", timings: "9:30 AM – 5:00 PM" }
    ],
    famousPlaces: ["Eravikulam National Park", "Top Station", "Tea Museum", "Mattupetty Dam", "Attukal Waterfalls"],
    thingsToDo: [
      "Hike through organic tea plantation trails early in the morning",
      "Spot the agile Nilgiri Tahr mountain goats at Rajamalai",
      "Taste freshly harvested single-origin teas paired with banana fritters (Pazham Pori)",
      "Camp under stargazing skies in the tent stays of Suryanelli",
      "Witness traditional Kalaripayattu martial arts and Kathakali performances in town"
    ],
    safetyRating: 4.7,
    soloScore: 9.1,
    avgBudget: {
      min: 1100,
      max: 2500,
      perDay: 1700,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 3,
    bestTime: "September to March",
    bestMonths: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    language: ["Malayalam", "Tamil", "English"],
    howToReach: {
      airport: "Cochin International Airport (COK) — 110 km (3.5 hrs scenic drive)",
      railway: "Aluva (110 km) or Ernakulam Junction (130 km)",
      road: "Direct KSRTC mountain express buses run regularly from Kochi and Kottayam"
    },
    soloTravelerTips: [
      "Hire a scooter to explore Top Station, Kundala Dam, and hidden plantation roads at your own pace.",
      "Evenings get chilly even during summer; pack a warm fleece jacket.",
      "Stay in eco-homestays or tea estate bungalows for authentic local Kerala meals."
    ]
  },

  hampi: {
    _id: "ind_hampi_06",
    name: "Hampi",
    slug: "hampi",
    country: "India",
    state: "Karnataka",
    stateType: "State",
    district: "Vijayanagara",
    city: "Hampi",
    townOrVillage: "Anegundi / Hippie Island",
    tagline: "Surreal UNESCO Boulder Moonscapes of the Vijayanagara Empire",
    description: "Step into an open-air museum of giant golden granite boulders, 14th-century monolithic temples, royal elephant stables, and the tranquil Tungabhadra river. A haven for solo backpackers, rock climbers, and history enthusiasts.",
    category: ["Heritage", "Architecture", "Adventure & Trekking"],
    image: "https://images.unsplash.com/photo-1600100397608-f010f443b715?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800"
    ],
    attractions: [
      { name: "Virupaksha Temple", type: "Sacred Temple", description: "Active 7th-century Dravidian temple dedicated to Lord Shiva with an elephant blessing devotees.", entryFee: "Free (₹50 for sanctuary)", timings: "6:00 AM – 1:00 PM, 5:00 PM – 9:00 PM" },
      { name: "Vijaya Vittala Temple & Stone Chariot", type: "Architectural Marvel", description: "Iconic stone chariot featured on the ₹50 note, famous for its resonant musical pillars.", entryFee: "₹40 (Indians) / ₹600 (Foreigners)", timings: "8:30 AM – 5:30 PM" },
      { name: "Matanga Hill Sunrise", type: "Viewpoint", description: "The highest point in central Hampi offering unforgettable panoramic 360° views of the ruins.", entryFee: "Free", timings: "Best at 5:30 AM" },
      { name: "Lotus Mahal & Elephant Stables", type: "Royal Enclosure", description: "Indo-Islamic royal pavilions and dome chambers where imperial royal war elephants were housed.", entryFee: "Included in Vittala ticket", timings: "8:30 AM – 5:30 PM" },
      { name: "Sanapur Lake", type: "Scenic Lake", description: "Tranquil reservoir flanked by giant boulders, famous for coracle round-boat rides.", entryFee: "Free (Coracle ride ₹100-₹200)", timings: "Daytime" }
    ],
    famousPlaces: ["Virupaksha Temple", "Stone Chariot", "Matanga Hill", "Elephant Stables", "Sanapur Lake", "Anegundi"],
    thingsToDo: [
      "Rent a bicycle or moped to discover forgotten monolithic shrines scattered across boulder fields",
      "Climb Matanga Hill in the pre-dawn darkness for an epic golden sunrise",
      "Cross the Tungabhadra river on a traditional circular woven coracle boat",
      "Practice boulder climbing with fellow international climbers in Anegundi",
      "Relax at chill rooftop traveler cafes serving Israeli, Indian, and Italian comfort food"
    ],
    safetyRating: 4.6,
    soloScore: 9.5,
    avgBudget: {
      min: 900,
      max: 2200,
      perDay: 1400,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 3,
    bestTime: "October to March",
    bestMonths: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    language: ["Kannada", "Hindi", "English"],
    howToReach: {
      airport: "Jindal Vijayanagar Airport, Vidyanagar (VDY) — 40 km, or Hubballi (160 km)",
      railway: "Hosapete Junction (HPT) — 13 km (connected to Bengaluru, Goa, Hyderabad)",
      road: "Overnight sleeper buses connect directly from Bengaluru, Goa, and Mumbai to Hospet"
    },
    soloTravelerTips: [
      "Carry plenty of water and a wide-brim hat; climbing ruins in the afternoon gets hot.",
      "The monument ticket for Vittala Temple also grants same-day access to the Zenana Enclosure / Lotus Mahal.",
      "Rent a scooter in Anegundi / Sanapur to reach cliff jump spots and paddy fields."
    ]
  },

  goa: {
    _id: "ind_goa_07",
    name: "North Goa",
    slug: "north-goa",
    country: "India",
    state: "Goa",
    stateType: "State",
    district: "North Goa",
    city: "North Goa",
    townOrVillage: "Anjuna / Arambol / Vagator",
    tagline: "Sun, Sand, Portuguese Heritage & Vibrant Backpacking Culture",
    description: "India's beach paradise offers solo travelers the ultimate combination of golden shorelines, bohemian flea markets, legendary beach shacks, Portuguese colonial quarters in Fontainhas, and lively social hostels.",
    category: ["Beach & Coastal", "Cultural & Food", "Wellness"],
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    ],
    attractions: [
      { name: "Chapora Fort", type: "Historic Fort", description: "17th-century coastal fortress perched above Vagator Beach; made legendary by Bollywood's Dil Chahta Hai.", entryFee: "Free", timings: "9:00 AM – 6:30 PM" },
      { name: "Anjuna Flea Market & Curlies", type: "Market & Beachfront", description: "Vibrant market for bohemian handicrafts, beachwear, music, and sunset drum circles.", entryFee: "Free", timings: "Wednesdays & Daily sunsets" },
      { name: "Arambol Sweet Water Lake", type: "Nature & Lagoon", description: "Freshwater lagoon separated from the ocean by a narrow sandbar, surrounded by banyan hills.", entryFee: "Free", timings: "Sunrise to Sunset" },
      { name: "Fontainhas Latin Quarter", type: "Colonial Architecture", description: "Heritage quarter in Panaji with bright yellow and indigo Portuguese villas, bakeries, and art galleries.", entryFee: "Free", timings: "Best walked early morning or late afternoon" },
      { name: "Fort Aguada & Lighthouse", type: "Seaside Citadel", description: "Well-preserved Portuguese fortress with expansive Arabian Sea vantage points.", entryFee: "₹25", timings: "9:30 AM – 5:30 PM" }
    ],
    famousPlaces: ["Chapora Fort", "Anjuna Beach", "Arambol Beach", "Fontainhas Panaji", "Fort Aguada", "Vagator"],
    thingsToDo: [
      "Rent a scooter to discover secluded cliff coves around Ashwem and Morjim",
      "Join sunset drum circles and ecstatic dance workshops on Arambol beach",
      "Walk the charming cobblestone streets of Fontainhas Latin Quarter and try Goan Poi bread",
      "Stay in award-winning backpacker hostels in Anjuna or Vagator",
      "Sample authentic Goan fish thali and coconut curry at local family taverns"
    ],
    safetyRating: 4.4,
    soloScore: 9.4,
    avgBudget: {
      min: 1200,
      max: 3000,
      perDay: 1900,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 4,
    bestTime: "November to March",
    bestMonths: ["Nov", "Dec", "Jan", "Feb", "Mar"],
    language: ["Konkani", "English", "Hindi"],
    howToReach: {
      airport: "Mopa Airport (GOX) or Dabolim Airport (GOI) — Direct flights from all Indian metros",
      railway: "Thivim (THVM) or Madgaon (MAO) — Well-serviced by Konkan Railway trains",
      road: "Well maintained highways connecting Mumbai (10 hrs) and Bengaluru (11 hrs)"
    },
    soloTravelerTips: [
      "Renting a two-wheeler (scooter) is by far the most economical and flexible way to explore (₹300-₹500/day).",
      "Always wear a helmet; Goa traffic police conduct regular checks across coastal roads.",
      "Stay in Anjuna, Vagator, or Morjim for the best social hostel vibes."
    ]
  },

  ladakh: {
    _id: "ind_ladakh_08",
    name: "Leh-Ladakh",
    slug: "leh-ladakh",
    country: "India",
    state: "Ladakh",
    stateType: "Union Territory",
    district: "Leh",
    city: "Leh",
    townOrVillage: "Leh Old Town / Changspa",
    tagline: "The Roof of the World: High-Altitude Himalayan Passes & Monasteries",
    description: "A high-altitude mountain desert suspended between heaven and earth at 3,500m. Famed for whitewashed Tibetan monasteries perched on sheer crags, the shimmering color-shifting waters of Pangong Tso, and the dramatic Khardung La pass.",
    category: ["Adventure & Trekking", "Spiritual", "Nature & Wildlife"],
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800"
    ],
    attractions: [
      { name: "Pangong Tso", type: "Glacial Lake", description: "Endorheic lake at 4,350m whose waters shift between shades of turquoise, azure, and deep sapphire.", entryFee: "Inner Line Permit required", timings: "Day trips / overnight camps" },
      { name: "Thiksey Monastery", type: "Buddhist Monastery", description: "Twelve-story Tibetan monastery resembling the Potala Palace, housing a 15m statue of Maitreya Buddha.", entryFee: "₹50", timings: "6:00 AM – 6:00 PM (Morning prayers 7:00 AM)" },
      { name: "Nubra Valley & Hunder Sand Dunes", type: "High Desert Valley", description: "Double-humped Bactrian camels grazing amidst sand dunes framed by snow-clad peaks.", entryFee: "ILP required", timings: "Best around sunset" },
      { name: "Khardung La Pass", type: "Mountain Pass", description: "One of the world's highest motorable passes at 17,982 feet, connecting Leh to Nubra.", entryFee: "Free with ILP", timings: "Daytime passage" },
      { name: "Shanti Stupa", type: "Peace Pagoda", description: "White-domed Buddhist stupa built by Japanese monks offering sweeping panoramic views of Leh town.", entryFee: "Free", timings: "5:00 AM – 9:00 PM" }
    ],
    famousPlaces: ["Pangong Tso", "Thiksey Monastery", "Nubra Valley", "Khardung La", "Shanti Stupa", "Hemis"],
    thingsToDo: [
      "Dedicate your first 48 hours to complete rest and acclimatization in Leh town",
      "Attend dawn Buddhist chanting sessions at Thiksey Monastery",
      "Ride or join shared cabs over the Khardung La pass into Nubra Valley",
      "Gaze at the Milky Way galaxy from Pangong or Hanle Dark Sky Reserve",
      "Enjoy traditional Ladakhi Tingmo and Thukpa at cafes on Changspa Road"
    ],
    safetyRating: 4.9,
    soloScore: 9.6,
    avgBudget: {
      min: 1500,
      max: 3800,
      perDay: 2400,
      tier: "Mid-range",
      currency: "INR (₹)"
    },
    idealDurationDays: 6,
    bestTime: "May to September",
    bestMonths: ["May", "Jun", "Jul", "Aug", "Sep"],
    language: ["Ladakhi", "Tibetan", "Hindi", "English"],
    howToReach: {
      airport: "Kushok Bakula Rimpochee Airport (IXL) in Leh — Daily flights from Delhi, Mumbai, Srinagar",
      railway: "Jammu Tawi (700 km) or Chandigarh (railheads for road routes)",
      road: "Epic mountain highways: Manali-Leh Highway (open June-Oct) or Srinagar-Leh Highway"
    },
    soloTravelerTips: [
      "ACCLIMATIZATION IS MANDATORY: Do not engage in strenuous activity on Day 1 and Day 2.",
      "Solo travelers can easily join shared jeeps/taxis from Leh taxi union noticeboards to split costs to Pangong and Nubra.",
      "Get an Inner Line Permit (ILP) online or from any agency in Leh for Nubra and Pangong."
    ]
  },

  pondicherry: {
    _id: "ind_pondicherry_09",
    name: "Pondicherry",
    slug: "pondicherry",
    country: "India",
    state: "Puducherry",
    stateType: "Union Territory",
    district: "Puducherry",
    city: "Pondicherry",
    townOrVillage: "White Town / Auroville",
    tagline: "French Colonial Romance, Coastal Promenades & Auroville Serenity",
    description: "A coastal French-Tamil enclave on the Coromandel Coast. Bicycle past bougainvillea-draped mustard villas in White Town, sip espresso at seaside promenade cafes, and explore the experimental universal township of Auroville.",
    category: ["Heritage", "Beach & Coastal", "Spiritual"],
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    ],
    attractions: [
      { name: "Promenade Beach & Rock Beach", type: "Seaside Walkway", description: "Vehicle-free ocean promenade along the Bay of Bengal with colonial statues and ocean breezes.", entryFee: "Free", timings: "Vehicle-free from 6:00 PM – 7:30 AM" },
      { name: "White Town (French Quarter)", type: "Colonial Heritage", description: "Gridded streets with pastel French architecture, boutique libraries, and cozy bakeries.", entryFee: "Free", timings: "Open all day" },
      { name: "Auroville & Matrimandir", type: "Universal Township", description: "Visionary township founded by The Mother; golden sphere Matrimandir for silent concentration.", entryFee: "Free (prior booking required for inner chamber)", timings: "9:00 AM – 4:30 PM" },
      { name: "Sri Aurobindo Ashram", type: "Spiritual Center", description: "Serene spiritual haven where Sri Aurobindo and The Mother lived; floral samadhi sanctuary.", entryFee: "Free", timings: "8:00 AM – 12:00 PM, 2:00 PM – 6:00 PM" },
      { name: "Serenity Beach & Surf Schools", type: "Beach & Surfing", description: "Golden beach with beginner-friendly surf breaks, beach huts, and seafood shacks.", entryFee: "Free (surfing lessons ₹1,200)", timings: "Sunrise to Sunset" }
    ],
    famousPlaces: ["Promenade Beach", "White Town", "Matrimandir", "Sri Aurobindo Ashram", "Serenity Beach"],
    thingsToDo: [
      "Rent a vintage bicycle to pedal through the picturesque streets of White Town",
      "Spend a quiet morning meditating at the Matrimandir viewing point in Auroville",
      "Take a beginner surfing lesson on the gentle rollers of Serenity Beach",
      "Indulge in authentic French croissants and crepes at Baker Street",
      "Stroll the car-free Promenade at dusk alongside the waves"
    ],
    safetyRating: 4.8,
    soloScore: 9.4,
    avgBudget: {
      min: 1000,
      max: 2600,
      perDay: 1600,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 3,
    bestTime: "October to March",
    bestMonths: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    language: ["Tamil", "French", "English", "Hindi"],
    howToReach: {
      airport: "Puducherry Airport (PNY) — regional flights; Chennai International Airport (MAA) is 150 km away",
      railway: "Puducherry Railway Station (PDY) — Direct express trains from Chennai, Bengaluru, Delhi",
      road: "The East Coast Road (ECR) from Chennai is one of India's most scenic coastal drives (3.5 hrs)"
    },
    soloTravelerTips: [
      "White Town is exceptionally safe, quiet, and walkable for solo women travelers at all hours.",
      "Rent a bicycle (₹100/day) for White Town or a scooter (₹300/day) if commuting back and forth to Auroville.",
      "Reserve Matrimandir inner meditation hall passes at least 3–5 days in advance online."
    ]
  },

  darjeeling: {
    _id: "ind_darjeeling_10",
    name: "Darjeeling",
    slug: "darjeeling",
    country: "India",
    state: "West Bengal",
    stateType: "State",
    district: "Darjeeling",
    city: "Darjeeling",
    townOrVillage: "Chowrasta / Ghum",
    tagline: "The Queen of Hills: Himalayan Toy Trains & Mount Kanchenjunga Vistas",
    description: "Perched at 2,042 meters against the backdrop of Mount Kanchenjunga (the world's third highest peak). Famed for fragrant champagne-grade tea estates, UNESCO heritage steam toy trains, and peaceful Tibetan Buddhist monasteries.",
    category: ["Hill Station", "Heritage", "Nature & Wildlife"],
    image: "https://images.unsplash.com/photo-1558431382-27e303142255?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800"
    ],
    attractions: [
      { name: "Tiger Hill Sunrise", type: "Mountain Vista", description: "Watch sunrise illuminate Mount Kanchenjunga and Mount Everest in dazzling gold and crimson light.", entryFee: "₹40", timings: "Best around 4:30 AM" },
      { name: "Darjeeling Himalayan Railway (Toy Train)", type: "UNESCO Heritage", description: "Century-old narrow-gauge steam train winding through mountain loops and Batasia Loop.", entryFee: "₹1,000 – ₹1,500 (Steam Joyride)", timings: "Scheduled daytime joyrides" },
      { name: "Happy Valley Tea Estate", type: "Tea Plantation", description: "One of the oldest tea gardens, offering guided plucking and tasting tours overlooking valleys.", entryFee: "₹100", timings: "8:00 AM – 4:00 PM (Closed Mon)" },
      { name: "Ghum Monastery (Yiga Choeling)", type: "Monastery", description: "Historic Tibetan monastery built in 1850 housing a 15-foot clay statue of the Maitreya Buddha.", entryFee: "Free", timings: "6:00 AM – 6:00 PM" },
      { name: "Chowrasta & The Mall", type: "Social Promenade", description: "Pedestrianized ridge square lined with bookstores, heritage cafes (Glenary's), and valley views.", entryFee: "Free", timings: "Open all day" }
    ],
    famousPlaces: ["Tiger Hill", "Toy Train Batasia Loop", "Chowrasta Mall", "Ghum Monastery", "Happy Valley Tea Estate"],
    thingsToDo: [
      "Wake up early for the sunrise spectacle illuminating Mount Kanchenjunga from Tiger Hill",
      "Ride the UNESCO steam toy train around the spiral loop at Batasia Loop",
      "Enjoy Darjeeling first-flush tea with English pastries at the historic Glenary's Bakery",
      "Browse mountaineering history at the Himalayan Mountaineering Institute (HMI)",
      "Walk the peaceful circular forest trail around Observatory Hill"
    ],
    safetyRating: 4.8,
    soloScore: 9.3,
    avgBudget: {
      min: 1100,
      max: 2500,
      perDay: 1600,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 3,
    bestTime: "March to May & October to December",
    bestMonths: ["Mar", "Apr", "May", "Oct", "Nov", "Dec"],
    language: ["Nepali", "Bengali", "Hindi", "English"],
    howToReach: {
      airport: "Bagdogra Airport (IXB) — 70 km away (approx 3 hrs via shared cab)",
      railway: "New Jalpaiguri (NJP) — 75 km away; major railway junction connecting to all India",
      road: "Frequent shared mountain jeeps depart continuously from Siliguri / NJP to Darjeeling (₹250-₹350)"
    },
    soloTravelerTips: [
      "Shared Tata Sumo jeeps from NJP/Siliguri to Darjeeling are inexpensive and the standard way locals and backpackers travel.",
      "Book Glenary's or Keventer's rooftop tables early in the morning for crisp mountain vistas with your breakfast.",
      "Pack layers: mountain weather changes rapidly from warm sunshine to misty cold."
    ]
  },

  shillong: {
    _id: "ind_shillong_11",
    name: "Shillong",
    slug: "shillong",
    country: "India",
    state: "Meghalaya",
    stateType: "State",
    district: "East Khasi Hills",
    city: "Shillong",
    townOrVillage: "Police Bazar / Laitlum",
    tagline: "The Scotland of the East: Living Root Bridges & Rolling Cloud Valleys",
    description: "Surrounded by pine hills and tumbling waterfalls, Meghalaya's capital is a vibrant cultural hub. Renowned for its live rock music culture, the crystal-clear waters of Dawki, the cleanest village of Mawlynnong, and the awe-inspiring living root bridges of Cherrapunji.",
    category: ["Hill Station", "Nature & Wildlife", "Adventure & Trekking"],
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1594973557995-bb04975e5461?w=800"
    ],
    attractions: [
      { name: "Double Decker Living Root Bridge", type: "Natural Bio-Engineering", description: "Centuries-old suspension bridges hand-woven by the Khasi tribe from rubber tree roots.", entryFee: "₹50 (at Nongriat)", timings: "Day trek (start early from Tyrna)" },
      { name: "Umiam Lake (Barapani)", type: "Man-made Lake", description: "Expansive water reservoir framed by lush coniferous pine hills, offering boating and kayaking.", entryFee: "₹20", timings: "9:00 AM – 5:00 PM" },
      { name: "Laitlum Canyons", type: "Cliff & Canyon", description: "Dramatically steep green gorges offering breathtaking vistas over the misty valleys below.", entryFee: "Free", timings: "Sunrise to Sunset" },
      { name: "Dawki & Umngot River", type: "Crystal Waters", description: "So clear that wooden boats appear to float on glass above the river bed; border point with Bangladesh.", entryFee: "Boating ₹500 – ₹800 per boat", timings: "8:00 AM – 5:00 PM" },
      { name: "Elephant Falls", type: "Waterfall", description: "Three-tiered mountain waterfall cascading through fern-covered rocks.", entryFee: "₹30", timings: "9:00 AM – 5:00 PM" }
    ],
    famousPlaces: ["Living Root Bridges", "Umiam Lake", "Laitlum Canyons", "Dawki Umngot River", "Elephant Falls", "Cherrapunji"],
    thingsToDo: [
      "Trek down the 3,500 stone stairs from Tyrna village to the Double Decker Root Bridge in Nongriat",
      "Take a clear-water boat ride on the Umngot River in Dawki / Shnongpdeng",
      "Sit on the edge of the world at the misty Laitlum Canyons",
      "Enjoy live indie music and acoustic rock at cafes in Police Bazar",
      "Visit Mawlynnong, celebrated as Asia's cleanest village"
    ],
    safetyRating: 4.8,
    soloScore: 9.4,
    avgBudget: {
      min: 1100,
      max: 2600,
      perDay: 1650,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 4,
    bestTime: "September to May",
    bestMonths: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    language: ["Khasi", "English", "Hindi"],
    howToReach: {
      airport: "Shillong Airport, Umroi (SHL) — 30 km; or Guwahati Lokpriya Gopinath Bordoloi (GAU) — 120 km",
      railway: "Guwahati Railway Station (GHY) — 100 km (broad gauge railhead connecting North-East)",
      road: "Shared tourist cabs depart constantly from Guwahati railway station to Shillong (3 hrs via scenic highway)"
    },
    soloTravelerTips: [
      "Meghalaya is a matrilineal society; solo women travelers experience remarkable safety and respect.",
      "Stay overnight in a basic village homestay in Nongriat or Shnongpdeng for riverside camping and natural pool swims.",
      "Carry waterproof gear and sturdy trekking shoes; mountain trails can be slick."
    ]
  },

  udaipur: {
    _id: "ind_udaipur_12",
    name: "Udaipur",
    slug: "udaipur",
    country: "India",
    state: "Rajasthan",
    stateType: "State",
    district: "Udaipur",
    city: "Udaipur",
    townOrVillage: "Old City / Lake Pichola",
    tagline: "The City of Lakes: White Marble Palaces & Romantic Sunsets",
    description: "Surrounded by the ancient Aravalli mountains and glistening lakes, Udaipur is one of India's most serene royal destinations. Grand City Palace courtyards, rooftop cafes overlooking Lake Pichola, and traditional miniature painting schools welcome solo wanderers.",
    category: ["Heritage", "Architecture", "Cultural & Food"],
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800"
    ],
    attractions: [
      { name: "City Palace Complex", type: "Royal Palace", description: "Sprawling palace museum complex built over 400 years by the Maharanas of Mewar.", entryFee: "₹300 (Indians)", timings: "9:00 AM – 5:30 PM" },
      { name: "Lake Pichola Boat Ride", type: "Scenic Lake", description: "Scenic boat cruise passing the floating Taj Lake Palace and Jagmandir Island.", entryFee: "₹450 – ₹800", timings: "10:00 AM – 6:00 PM" },
      { name: "Jagdish Temple & Gangaur Ghat", type: "Heritage & Ghat", description: "Majestic carved 1651 temple and active water ghat where cultural festivals and sunsets unfold.", entryFee: "Free", timings: "5:00 AM – 10:00 PM" },
      { name: "Monsoon Palace (Sajjangarh)", type: "Hilltop Palace", description: "High-perched mountain palace commanding panoramic sunset views across the lake system.", entryFee: "₹100 + vehicle charge", timings: "9:00 AM – 6:00 PM" },
      { name: "Saheliyon-ki-Bari", type: "Royal Gardens", description: "Historic ornamental gardens featuring lotus pools, marble fountains, and marble elephants.", entryFee: "₹50", timings: "9:00 AM – 7:00 PM" }
    ],
    famousPlaces: ["City Palace", "Lake Pichola", "Jagmandir", "Gangaur Ghat", "Monsoon Palace", "Fateh Sagar"],
    thingsToDo: [
      "Watch the traditional folk dance and puppet show at Bagore Ki Haveli on Gangaur Ghat",
      "Sip masala chai from a rooftop terrace overlooking the illuminated Lake Palace at night",
      "Take a leisurely sunset cruise to Jagmandir Island Palace",
      "Learn traditional miniature painting from master artists in the Old City alleys",
      "Cycle around the tree-lined banks of Fateh Sagar Lake in the morning"
    ],
    safetyRating: 4.8,
    soloScore: 9.5,
    avgBudget: {
      min: 1100,
      max: 2700,
      perDay: 1700,
      tier: "Budget",
      currency: "INR (₹)"
    },
    idealDurationDays: 3,
    bestTime: "October to March",
    bestMonths: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    language: ["Hindi", "Mewari", "English"],
    howToReach: {
      airport: "Maharana Pratap Airport (UDR) — 22 km east of town",
      railway: "Udaipur City Railway Station (UDZ) — Direct express trains from Delhi, Mumbai, Jaipur",
      road: "NH48 connects to Ahmedabad (4.5 hrs) and Jaipur (6.5 hrs)"
    },
    soloTravelerTips: [
      "Stay in the Old City near Gangaur Ghat or Chandpole for cobblestone walkability and lake views.",
      "Most top rooftop cafes have no entry charge — buy a tea or cold beverage and enjoy the million-dollar view.",
      "Bagore Ki Haveli Dharohar dance show tickets sell out quickly; queue up by 5:30 PM for the 7:00 PM show."
    ]
  }
};

// Sample Trips across Indian destinations
const sampleTrips = {
  jaipur: [
    { _id: "t_in_01", userId: "Aarav_Explorer", destination: "Jaipur", startDate: "2026-10-15", endDate: "2026-10-20", notes: "Exploring Amer and Nahargarh sunset points. Looking for photography mates!" },
    { _id: "t_in_02", userId: "PriyaNomad", destination: "Jaipur", startDate: "2026-11-05", endDate: "2026-11-10", notes: "Boutique hostel stay, food walk in Old City. Let's try rawat kachoris together!" }
  ],
  varanasi: [
    { _id: "t_in_03", userId: "Rohan_Spiritual", destination: "Varanasi", startDate: "2026-10-22", endDate: "2026-10-27", notes: "Early morning boat dawns, yoga at Assi Ghat. Join for morning meditation." },
    { _id: "t_in_04", userId: "Maya_Wanderer", destination: "Varanasi", startDate: "2026-11-12", endDate: "2026-11-17", notes: "Capturing street photography across the ghats." }
  ],
  manali: [
    { _id: "t_in_05", userId: "Kabir_Trekker", destination: "Manali", startDate: "2026-09-20", endDate: "2026-09-28", notes: "Hiking to Jogini Falls and riding through Atal Tunnel to Lahaul." },
    { _id: "t_in_06", userId: "Sanya_CafeHopper", destination: "Manali", startDate: "2026-10-02", endDate: "2026-10-10", notes: "Workation in Old Manali with good Wi-Fi. Up for evening music sessions!" }
  ],
  rishikesh: [
    { _id: "t_in_07", userId: "Ananya_Yogi", destination: "Rishikesh", startDate: "2026-09-25", endDate: "2026-10-05", notes: "Ashtanga yoga intensive in Tapovan, river rafting on the weekend!" },
    { _id: "t_in_08", userId: "Dev_Rafter", destination: "Rishikesh", startDate: "2026-10-18", endDate: "2026-10-23", notes: "Camping by the river and rafting Grade IV rapids." }
  ],
  munnar: [
    { _id: "t_in_09", userId: "Kiran_Nature", destination: "Munnar", startDate: "2026-11-10", endDate: "2026-11-15", notes: "Tea garden hikes and spotting Nilgiri Tahr at Eravikulam." }
  ],
  hampi: [
    { _id: "t_in_10", userId: "Vikram_Bouldering", destination: "Hampi", startDate: "2026-11-18", endDate: "2026-11-24", notes: "Bicycle exploration of ruins and boulder climbing near Sanapur." }
  ],
  "north-goa": [
    { _id: "t_in_11", userId: "Simran_Beaches", destination: "North Goa", startDate: "2026-12-01", endDate: "2026-12-08", notes: "Arambol sunset drum circles, scooter rides across Fontainhas." }
  ],
  "leh-ladakh": [
    { _id: "t_in_12", userId: "Arjun_HighPasses", destination: "Leh-Ladakh", startDate: "2026-09-15", endDate: "2026-09-25", notes: "Shared taxi for Pangong Lake and Nubra Valley. Need 2 more travelers to split cab!" }
  ],
  pondicherry: [
    { _id: "t_in_13", userId: "Meera_Coastal", destination: "Pondicherry", startDate: "2026-10-08", endDate: "2026-10-13", notes: "Bicycle tours in White Town and visiting Auroville Matrimandir." }
  ],
  darjeeling: [
    { _id: "t_in_14", userId: "Tenzing_Explorer", destination: "Darjeeling", startDate: "2026-10-25", endDate: "2026-10-31", notes: "Toy train ride and Tiger Hill sunrise view. Staying near Chowrasta." }
  ],
  shillong: [
    { _id: "t_in_15", userId: "Wanbha_Hills", destination: "Shillong", startDate: "2026-11-15", endDate: "2026-11-22", notes: "Living root bridge trek in Nongriat and Dawki river boating." }
  ],
  udaipur: [
    { _id: "t_in_16", userId: "Gauri_Palaces", destination: "Udaipur", startDate: "2026-11-20", endDate: "2026-11-26", notes: "City Palace and rooftop dinners overlooking Lake Pichola." }
  ]
};

module.exports = { destinations, sampleTrips };
