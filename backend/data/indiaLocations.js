// Definitive dataset of all 28 States and 8 Union Territories of India
// with hierarchical location support (State/UT -> Districts -> Cities -> Towns/Villages)

const INDIAN_STATES_AND_UTS = [
  // 28 STATES
  {
    name: "Andhra Pradesh",
    code: "AP",
    type: "State",
    region: "South",
    capital: "Amaravati",
    description: "Known for ancient temples, untouched coastlines of the Bay of Bengal, and rich Telugu heritage.",
    image: "https://images.unsplash.com/photo-1606298855672-3efb63017be8?w=800",
    districts: ["Visakhapatnam", "Chittoor", "Krishna", "Guntur", "East Godavari", "Kurnool", "Anantapur", "Kadapa"],
    cities: [
      { name: "Visakhapatnam", district: "Visakhapatnam", towns: ["Bheemunipatnam", "Rushikonda", "Araku Valley"] },
      { name: "Tirupati", district: "Chittoor", towns: ["Tirumala", "Chandragiri", "Srikalahasti"] },
      { name: "Vijayawada", district: "Krishna", towns: ["Mangalagiri", "Kondapalli"] }
    ]
  },
  {
    name: "Arunachal Pradesh",
    code: "AR",
    type: "State",
    region: "North-East",
    capital: "Itanagar",
    description: "The Land of Dawn-lit Mountains, home to ancient high-altitude Buddhist monasteries and pristine alpine valleys.",
    image: "https://images.unsplash.com/photo-1594973557995-bb04975e5461?w=800",
    districts: ["Tawang", "West Kameng", "Papum Pare", "Lower Subansiri", "Ziro", "East Siang"],
    cities: [
      { name: "Tawang", district: "Tawang", towns: ["Jang", "Lumla", "Zemithang"] },
      { name: "Ziro", district: "Lower Subansiri", towns: ["Hapoli", "Old Ziro"] },
      { name: "Bomdila", district: "West Kameng", towns: ["Dirang", "Rupa"] }
    ]
  },
  {
    name: "Assam",
    code: "AS",
    type: "State",
    region: "North-East",
    capital: "Dispur",
    description: "Gateway to the North-East, famed for lush tea gardens, the mighty Brahmaputra river, and one-horned rhinos.",
    image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=800",
    districts: ["Kamrup Metropolitan", "Golaghat", "Jorhat", "Nagaon", "Sonitpur", "Dibrugarh", "Cachar"],
    cities: [
      { name: "Guwahati", district: "Kamrup Metropolitan", towns: ["Kamakhya", "Dispur", "Uzan Bazar"] },
      { name: "Kaziranga", district: "Golaghat", towns: ["Kohora", "Bagori", "Bokakhat"] },
      { name: "Jorhat", district: "Jorhat", towns: ["Majuli Island", "Titabar"] }
    ]
  },
  {
    name: "Bihar",
    code: "BR",
    type: "State",
    region: "East",
    capital: "Patna",
    description: "The historical cradle of Buddhism and Jainism, featuring Nalanda, Bodh Gaya, and ancient Magadha sites.",
    image: "https://images.unsplash.com/photo-1622308644420-a7d0e40882e3?w=800",
    districts: ["Gaya", "Nalanda", "Patna", "Vaishali", "Bhagalpur", "Muzaffarpur"],
    cities: [
      { name: "Bodh Gaya", district: "Gaya", towns: ["Bodhgaya", "Bakror", "Mastipur"] },
      { name: "Rajgir", district: "Nalanda", towns: ["Kundalpur", "Nalanda Mahavihara"] },
      { name: "Patna", district: "Patna", towns: ["Kumhrar", "Danapur"] }
    ]
  },
  {
    name: "Chhattisgarh",
    code: "CG",
    type: "State",
    region: "Central",
    capital: "Raipur",
    description: "India's tribal heartland with cascading waterfalls like Chitrakote, dense sal forests, and ancient temples.",
    image: "https://images.unsplash.com/photo-1609137144820-221d6044b7d0?w=800",
    districts: ["Bastar", "Raipur", "Bilaspur", "Dantewada", "Surguja", "Kanker"],
    cities: [
      { name: "Jagdalpur", district: "Bastar", towns: ["Chitrakote", "Kanger Ghati", "Teerathgarh"] },
      { name: "Raipur", district: "Raipur", towns: ["Naya Raipur", "Arang"] }
    ]
  },
  {
    name: "Goa",
    code: "GA",
    type: "State",
    region: "West",
    capital: "Panaji",
    description: "Sun-drenched beaches, Portuguese colonial architecture, bohemian flea markets, and vibrant solo traveler hostels.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    districts: ["North Goa", "South Goa"],
    cities: [
      { name: "North Goa", district: "North Goa", towns: ["Anjuna", "Vagator", "Arambol", "Morjim", "Calangute", "Assagao"] },
      { name: "Panaji", district: "North Goa", towns: ["Fontainhas", "Miramar", "Dona Paula"] },
      { name: "South Goa", district: "South Goa", towns: ["Palolem", "Agonda", "Colva", "Benaulim", "Cavelossim"] }
    ]
  },
  {
    name: "Gujarat",
    code: "GJ",
    type: "State",
    region: "West",
    capital: "Gandhinagar",
    description: "From the sparkling white salt desert of Kutch to the Asiatic lions in Gir, and rich heritage stepwells.",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800",
    districts: ["Kutch", "Junagadh", "Ahmedabad", "Patan", "Vadodara", "Porbandar"],
    cities: [
      { name: "Rann of Kutch", district: "Kutch", towns: ["Dhordo", "Bhuj", "Khavda", "Mandvi"] },
      { name: "Ahmedabad", district: "Ahmedabad", towns: ["Old City", "Sarkhej", "Sabarmati"] },
      { name: "Sasan Gir", district: "Junagadh", towns: ["Gir Somnath", "Mendarda"] }
    ]
  },
  {
    name: "Haryana",
    code: "HR",
    type: "State",
    region: "North",
    capital: "Chandigarh",
    description: "The land of the epic Mahabharata, historic Kurukshetra, and scenic Sultanpur bird sanctuary.",
    image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800",
    districts: ["Gurugram", "Faridabad", "Kurukshetra", "Panchkula", "Ambala"],
    cities: [
      { name: "Kurukshetra", district: "Kurukshetra", towns: ["Thanesar", "Jyotisar", "Pehowa"] },
      { name: "Panchkula", district: "Panchkula", towns: ["Morni Hills", "Pinjore"] }
    ]
  },
  {
    name: "Himachal Pradesh",
    code: "HP",
    type: "State",
    region: "North",
    capital: "Shimla (Summer) / Dharamshala (Winter)",
    description: "A paradise of snow-clad Himalayan peaks, apple orchards, quaint cafes, and bohemian traveler villages.",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    districts: ["Kullu", "Kangra", "Lahaul and Spiti", "Shimla", "Chamba", "Kinnaur", "Mandi"],
    cities: [
      { name: "Manali", district: "Kullu", towns: ["Old Manali", "Vashisht", "Solang", "Naggar"] },
      { name: "Dharamshala", district: "Kangra", towns: ["McLeodGanj", "Dharamkot", "Bhagsunag"] },
      { name: "Spiti Valley", district: "Lahaul and Spiti", towns: ["Kaza", "Tabo", "Dhankar", "Kibber", "Langza"] },
      { name: "Kasol", district: "Kullu", towns: ["Tosh", "Chalal", "Malana", "Kheerganga"] },
      { name: "Shimla", district: "Shimla", towns: ["Kufri", "Mashobra", "Narkanda"] },
      { name: "Bir Billing", district: "Kangra", towns: ["Bir Colony", "Billing", "Gunehar"] }
    ]
  },
  {
    name: "Jharkhand",
    code: "JH",
    type: "State",
    region: "East",
    capital: "Ranchi",
    description: "The Land of Forests with untouched waterfalls, sacred Parasnath hills, and rich tribal art.",
    image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=800",
    districts: ["Ranchi", "East Singhbhum", "Giridih", "Deoghar", "Hazaribagh"],
    cities: [
      { name: "Ranchi", district: "Ranchi", towns: ["Hundru", "Jonha", "Dassam"] },
      { name: "Deoghar", district: "Deoghar", towns: ["Baidyanath Dham", "Trikut Hills"] },
      { name: "Netarhat", district: "Latehar", towns: ["Sunrise Point", "Magnolia Point"] }
    ]
  },
  {
    name: "Karnataka",
    code: "KA",
    type: "State",
    region: "South",
    capital: "Bengaluru",
    description: "From the boulder-strewn UNESCO ruins of Hampi to the misty coffee plantations of Coorg and serene beaches of Gokarna.",
    image: "https://images.unsplash.com/photo-1600100397608-f010f443b715?w=800",
    districts: ["Vijayanagara", "Uttara Kannada", "Kodagu", "Mysuru", "Chikkamagaluru", "Bengaluru Urban"],
    cities: [
      { name: "Hampi", district: "Vijayanagara", towns: ["Hippie Island / Virupapur Gaddi", "Anegundi", "Kamalapur"] },
      { name: "Gokarna", district: "Uttara Kannada", towns: ["Kudle Beach", "Om Beach", "Half Moon Beach", "Paradise Beach"] },
      { name: "Coorg (Kodagu)", district: "Kodagu", towns: ["Madikeri", "Kushalnagar", "Virajpet"] },
      { name: "Mysuru", district: "Mysuru", towns: ["Chamundi Hill", "Srirangapatna"] },
      { name: "Chikmagalur", district: "Chikkamagaluru", towns: ["Mullayanagiri", "Kemmangundi", "Baba Budangiri"] }
    ]
  },
  {
    name: "Kerala",
    code: "KL",
    type: "State",
    region: "South",
    capital: "Thiruvananthapuram",
    description: "God's Own Country: tranquil backwaters, mist-cloaked tea estates of Munnar, cliff-backed beaches, and Ayurveda.",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    districts: ["Idukki", "Alappuzha", "Ernakulam", "Wayanad", "Kottayam", "Thiruvananthapuram"],
    cities: [
      { name: "Munnar", district: "Idukki", towns: ["Old Munnar", "Mattupetty", "Top Station", "Marayoor"] },
      { name: "Alleppey (Alappuzha)", district: "Alappuzha", towns: ["Punnamada", "Kuttanad", "Marari"] },
      { name: "Kochi (Cochin)", district: "Ernakulam", towns: ["Fort Kochi", "Mattancherry", "Jew Town", "Cherai"] },
      { name: "Varkala", district: "Thiruvananthapuram", towns: ["North Cliff", "South Cliff", "Helipad", "Edava"] },
      { name: "Wayanad", district: "Wayanad", towns: ["Kalpetta", "Sulthan Bathery", "Vythiri", "Meppadi"] }
    ]
  },
  {
    name: "Madhya Pradesh",
    code: "MP",
    type: "State",
    region: "Central",
    capital: "Bhopal",
    description: "The heart of India boasting erotic temple carvings of Khajuraho, dense tiger reserves of Kanha, and the ghats of Maheshwar.",
    image: "https://images.unsplash.com/photo-1600100397839-8cfb8e21a221?w=800",
    districts: ["Chhatarpur", "Jabalpur", "Khargone", "Ujjain", "Umaria", "Hoshangabad"],
    cities: [
      { name: "Khajuraho", district: "Chhatarpur", towns: ["Western Group", "Eastern Group", "Raneh Falls"] },
      { name: "Orchha", district: "Niwari", towns: ["Orchha Fort", "Chaturbhuj", "Betwa Banks"] },
      { name: "Ujjain", district: "Ujjain", towns: ["Mahakaleshwar", "Ram Ghat"] },
      { name: "Bandhavgarh", district: "Umaria", towns: ["Tala", "Magadhi"] }
    ]
  },
  {
    name: "Maharashtra",
    code: "MH",
    type: "State",
    region: "West",
    capital: "Mumbai",
    description: "Dynamic financial capital, UNESCO rock-cut caves of Ajanta & Ellora, Western Ghat hill retreats, and coastal forts.",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800",
    districts: ["Mumbai City", "Pune", "Aurangabad (Chhatrapati Sambhajinagar)", "Ratnagiri", "Raigad", "Satara"],
    cities: [
      { name: "Mumbai", district: "Mumbai City", towns: ["Colaba", "Bandra", "Kala Ghoda", "Juhu"] },
      { name: "Pune", district: "Pune", towns: ["Koregaon Park", "Lonavala", "Khandala", "Lavasa"] },
      { name: "Aurangabad", district: "Aurangabad (Chhatrapati Sambhajinagar)", towns: ["Ellora", "Ajanta", "Daulatabad"] },
      { name: "Mahabaleshwar", district: "Satara", towns: ["Panchgani", "Old Mahabaleshwar", "Pratapgad"] }
    ]
  },
  {
    name: "Manipur",
    code: "MN",
    type: "State",
    region: "North-East",
    capital: "Imphal",
    description: "The Jewel of India, famed for the floating islands of Loktak Lake, Keibul Lamjao National Park, and Ima Keithel women's market.",
    image: "https://images.unsplash.com/photo-1616091093714-c648dfc516b1?w=800",
    districts: ["Imphal West", "Bishnupur", "Churachandpur", "Ukhrul"],
    cities: [
      { name: "Imphal", district: "Imphal West", towns: ["Kangla", "Ima Keithel"] },
      { name: "Loktak", district: "Bishnupur", towns: ["Moirang", "Sendra Island", "Thanga"] },
      { name: "Ukhrul", district: "Ukhrul", towns: ["Shirui Hills", "Khayang"] }
    ]
  },
  {
    name: "Meghalaya",
    code: "ML",
    type: "State",
    region: "North-East",
    capital: "Shillong",
    description: "The Abode of Clouds: living root bridges, crystal-clear Dawki river, roaring Nohkalikai falls, and vibrant indie music culture.",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800",
    districts: ["East Khasi Hills", "West Jaintia Hills", "East Jaintia Hills", "Ri-Bhoi"],
    cities: [
      { name: "Shillong", district: "East Khasi Hills", towns: ["Police Bazar", "Laitlum Canyons", "Umiam Lake"] },
      { name: "Cherrapunji (Sohra)", district: "East Khasi Hills", towns: ["Nongriat (Double Decker Bridge)", "Mawsmai", "Tyrna"] },
      { name: "Dawki", district: "West Jaintia Hills", towns: ["Shnongpdeng", "Umngot River", "Mawlynnong (Cleanest Village)"] }
    ]
  },
  {
    name: "Mizoram",
    code: "MZ",
    type: "State",
    region: "North-East",
    capital: "Aizawl",
    description: "Land of rolling green hills, bamboo forests, serene mountain lakes, and rich Mizo hospitality.",
    image: "https://images.unsplash.com/photo-1627993077747-8a8b13ff78f2?w=800",
    districts: ["Aizawl", "Champhai", "Lunglei", "Serchhip"],
    cities: [
      { name: "Aizawl", district: "Aizawl", towns: ["Durtlang Hills", "Bara Bazar", "Reiek"] },
      { name: "Champhai", district: "Champhai", towns: ["Rih Dil", "Zokhawthar"] }
    ]
  },
  {
    name: "Nagaland",
    code: "NL",
    type: "State",
    region: "North-East",
    capital: "Kohima",
    description: "The Falcon Capital of the World, famed for the Hornbill Festival, Dzukou Valley trek, and vibrant indigenous Naga tribes.",
    image: "https://images.unsplash.com/photo-1624638760852-87034c4d2843?w=800",
    districts: ["Kohima", "Dimapur", "Mokokchung", "Mon", "Wokha"],
    cities: [
      { name: "Kohima", district: "Kohima", towns: ["Kisama (Hornbill Village)", "Khonoma (Green Village)", "Dzukou Base"] },
      { name: "Mokokchung", district: "Mokokchung", towns: ["Ungma", "Longkhum"] },
      { name: "Mon", district: "Mon", towns: ["Longwa", "Shangnyu"] }
    ]
  },
  {
    name: "Odisha",
    code: "OD",
    type: "State",
    region: "East",
    capital: "Bhubaneswar",
    description: "Ancient Kalinga architecture, the Sun Temple of Konark, holy Puri Jagannath dham, and Asia's largest brackish lagoon at Chilika.",
    image: "https://images.unsplash.com/photo-1609137144820-221d6044b7d0?w=800",
    districts: ["Puri", "Khurda", "Ganjam", "Mayurbhanj", "Cuttack"],
    cities: [
      { name: "Puri", district: "Puri", towns: ["Golden Beach", "Swargadwar", "Konark"] },
      { name: "Bhubaneswar", district: "Khurda", towns: ["Old Town", "Khandagiri", "Dhauli"] },
      { name: "Chilika", district: "Puri", towns: ["Satapada", "Mangalajodi", "Barkul"] }
    ]
  },
  {
    name: "Punjab",
    code: "PB",
    type: "State",
    region: "North",
    capital: "Chandigarh",
    description: "The spiritual serenity of the Golden Temple, vibrant Punjabi hospitality, rich culinary heritage, and patriotic Wagah Border.",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800",
    districts: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Gurdaspur"],
    cities: [
      { name: "Amritsar", district: "Amritsar", towns: ["Golden Temple Complex", "Attari-Wagah", "Katras", "Ranjit Avenue"] },
      { name: "Patiala", district: "Patiala", towns: ["Qila Mubarak", "Baradari"] }
    ]
  },
  {
    name: "Rajasthan",
    code: "RJ",
    type: "State",
    region: "West",
    capital: "Jaipur",
    description: "The Land of Kings: majestic amber forts, opulent royal palaces, camel safaris in the Thar desert, and colorful bazaars.",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800",
    districts: ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer", "Ajmer", "Bikaner", "Sawai Madhopur"],
    cities: [
      { name: "Jaipur", district: "Jaipur", towns: ["Pink City", "Amer", "Nahargarh", "C-Scheme", "Malviya Nagar"] },
      { name: "Udaipur", district: "Udaipur", towns: ["Old City", "Fateh Sagar", "Jagdish Temple Chowk", "Lake Pichola"] },
      { name: "Jodhpur", district: "Jodhpur", towns: ["Blue City", "Mehrangarh", "Clock Tower", "Mandore"] },
      { name: "Jaisalmer", district: "Jaisalmer", towns: ["Golden Fort", "Sam Sand Dunes", "Khuri Village", "Gadisar"] },
      { name: "Pushkar", district: "Ajmer", towns: ["Pushkar Lake Ghats", "Brahma Temple", "Desert Camp"] }
    ]
  },
  {
    name: "Sikkim",
    code: "SK",
    type: "State",
    region: "North-East",
    capital: "Gangtok",
    description: "India's first 100% organic state, framed by the majestic Mount Kanchenjunga, ancient monasteries, and glacial lakes.",
    image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800",
    districts: ["East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim"],
    cities: [
      { name: "Gangtok", district: "East Sikkim", towns: ["MG Marg", "Rumtek", "Tsomgo Lake", "Nathula Pass"] },
      { name: "Pelling", district: "West Sikkim", towns: ["Pemayangtse", "Rabdentse", "Yuksom (Trek Base)"] },
      { name: "Lachung & Lachen", district: "North Sikkim", towns: ["Yumthang Valley", "Gurudongmar Lake", "Chopta Valley"] }
    ]
  },
  {
    name: "Tamil Nadu",
    code: "TN",
    type: "State",
    region: "South",
    capital: "Chennai",
    description: "Soaring Dravidian gopurams, ancient seaside rock relief at Mahabalipuram, the misty Nilgiri hills, and fragrant filter coffee.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
    districts: ["Chennai", "Nilgiris", "Madurai", "Chengalpattu", "Dindigul", "Kanyakumari", "Thanjavur"],
    cities: [
      { name: "Ooty (Udhagamandalam)", district: "Nilgiris", towns: ["Botanical Garden", "Coonoor", "Kotagiri"] },
      { name: "Mahabalipuram", district: "Chengalpattu", towns: ["Shore Temple", "Pancha Rathas", "Othavadai Street"] },
      { name: "Madurai", district: "Madurai", towns: ["Meenakshi Amman", "Thirumalai Nayakkar"] },
      { name: "Kodaikanal", district: "Dindigul", towns: ["Vattakanal", "Kodai Lake", "Pillar Rocks"] },
      { name: "Kanyakumari", district: "Kanyakumari", towns: ["Vivekananda Rock", "Sunset Point"] }
    ]
  },
  {
    name: "Telangana",
    code: "TG",
    type: "State",
    region: "South",
    capital: "Hyderabad",
    description: "A seamless blend of Nizami grandeur, Golconda fort, world-famous Hyderabadi biryani, and high-tech Cyberabad.",
    image: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=800",
    districts: ["Hyderabad", "Ranga Reddy", "Warangal", "Medak"],
    cities: [
      { name: "Hyderabad", district: "Hyderabad", towns: ["Old City (Charminar)", "Banjara Hills", "Golconda", "Hitec City"] },
      { name: "Warangal", district: "Warangal", towns: ["Thousand Pillar Temple", "Ramappa (UNESCO)", "Warangal Fort"] }
    ]
  },
  {
    name: "Tripura",
    code: "TR",
    type: "State",
    region: "North-East",
    capital: "Agartala",
    description: "The serene water palace of Neermahal, Ujjayanta Palace, rock sculptures of Unakoti, and bamboo craft.",
    image: "https://images.unsplash.com/photo-1616091093714-c648dfc516b1?w=800",
    districts: ["West Tripura", "Sepahijala", "Unakoti", "Gomati"],
    cities: [
      { name: "Agartala", district: "West Tripura", towns: ["Ujjayanta", "Akhaura"] },
      { name: "Unakoti", district: "Unakoti", towns: ["Kailashahar", "Rock Carvings"] }
    ]
  },
  {
    name: "Uttar Pradesh",
    code: "UP",
    type: "State",
    region: "North",
    capital: "Lucknow",
    description: "Spiritual epicenter on the Ganges at Varanasi, the timeless monument to love Taj Mahal in Agra, and Awadhi culinary splendor.",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
    districts: ["Varanasi", "Agra", "Lucknow", "Prayagraj", "Mathura", "Ayodhya"],
    cities: [
      { name: "Varanasi", district: "Varanasi", towns: ["Dashashwamedh Ghat", "Assi Ghat", "Manikarnika", "Sarnath"] },
      { name: "Agra", district: "Agra", towns: ["Taj Ganj", "Fatehpur Sikri", "Agra Fort Area"] },
      { name: "Lucknow", district: "Lucknow", towns: ["Hazratganj", "Chowk", "Aminabad", "Old Lucknow"] },
      { name: "Mathura & Vrindavan", district: "Mathura", towns: ["Krishna Janmabhoomi", "Banke Bihari", "Barsana"] }
    ]
  },
  {
    name: "Uttarakhand",
    code: "UK",
    type: "State",
    region: "North",
    capital: "Dehradun (Winter) / Gairsain (Summer)",
    description: "Devbhoomi (Land of the Gods): the yoga capital Rishikesh, sacred shrines of Badrinath & Kedarnath, and high alpine meadows.",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800",
    districts: ["Dehradun", "Nainital", "Pauri Garhwal", "Rudraprayag", "Chamoli", "Uttarkashi"],
    cities: [
      { name: "Rishikesh", district: "Dehradun", towns: ["Tapovan", "Laxman Jhula", "Ram Jhula", "Swarg Ashram"] },
      { name: "Mussoorie", district: "Dehradun", towns: ["Mall Road", "Landour", "Camel's Back", "Kempty"] },
      { name: "Nainital", district: "Nainital", towns: ["Mallital", "Tallital", "Pangot"] },
      { name: "Auli", district: "Chamoli", towns: ["Joshimath", "Auli Ski Resort", "Gorson Bugyal"] },
      { name: "Chopta", district: "Rudraprayag", towns: ["Tungnath Trek", "Chandrashila", "Deoria Tal"] }
    ]
  },
  {
    name: "West Bengal",
    code: "WB",
    type: "State",
    region: "East",
    capital: "Kolkata",
    description: "From the colonial charm and literary cafes of Kolkata to the emerald Himalayan tea estates of Darjeeling and Sundarbans mangroves.",
    image: "https://images.unsplash.com/photo-1558431382-27e303142255?w=800",
    districts: ["Darjeeling", "Kolkata", "South 24 Parganas", "Kalimpong", "Jalpaiguri"],
    cities: [
      { name: "Darjeeling", district: "Darjeeling", towns: ["Chowrasta / Mall", "Ghum", "Batasia Loop", "Happy Valley"] },
      { name: "Kolkata", district: "Kolkata", towns: ["Park Street", "College Street", "Kumartuli", "Howrah"] },
      { name: "Kalimpong", district: "Kalimpong", towns: ["Deolo Hill", "Lava", "Rishyap"] },
      { name: "Sundarbans", district: "South 24 Parganas", towns: ["Gosaba", "Sajnekhali"] }
    ]
  },

  // 8 UNION TERRITORIES
  {
    name: "Andaman and Nicobar Islands",
    code: "AN",
    type: "Union Territory",
    region: "Islands",
    capital: "Port Blair",
    description: "Tropical island paradise with turquoise lagoons, world-renowned Radhanagar Beach, vibrant coral reefs, and historic Cellular Jail.",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800",
    districts: ["South Andaman", "North and Middle Andaman", "Nicobar"],
    cities: [
      { name: "Havelock Island (Swaraj Dweep)", district: "South Andaman", towns: ["Radhanagar", "Elephant Beach", "Vijay Nagar"] },
      { name: "Neil Island (Shaheed Dweep)", district: "South Andaman", towns: ["Bharatpur Beach", "Laxmanpur Beach", "Sitapur"] },
      { name: "Port Blair", district: "South Andaman", towns: ["Aberdeen Bazaar", "Corbyn's Cove", "Ross Island"] }
    ]
  },
  {
    name: "Chandigarh",
    code: "CH",
    type: "Union Territory",
    region: "North",
    capital: "Chandigarh",
    description: "India's first planned city designed by Le Corbusier, famous for the whimsical Rock Garden, Sukhna Lake, and wide tree-lined boulevards.",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
    districts: ["Chandigarh"],
    cities: [
      { name: "Chandigarh", district: "Chandigarh", towns: ["Sector 17", "Sukhna Lake Promenade", "Rock Garden Complex"] }
    ]
  },
  {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    code: "DH",
    type: "Union Territory",
    region: "West",
    capital: "Daman",
    description: "Quaint Portuguese fortresses, tranquil beaches along the Arabian Sea, and coastal serenity.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    districts: ["Daman", "Diu", "Dadra and Nagar Haveli"],
    cities: [
      { name: "Diu", district: "Diu", towns: ["Nagoa Beach", "Diu Fort Area", "Ghoghla"] },
      { name: "Daman", district: "Daman", towns: ["Moti Daman", "Nani Daman", "Devka Beach"] }
    ]
  },
  {
    name: "Delhi",
    code: "DL",
    type: "Union Territory",
    region: "North",
    capital: "New Delhi",
    description: "The historic capital of empires: Red Fort, Qutub Minar, bustling Chandni Chowk street food, and bohemian Hauz Khas Village.",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
    districts: ["New Delhi", "Central Delhi", "South Delhi", "North Delhi", "East Delhi"],
    cities: [
      { name: "Delhi", district: "New Delhi", towns: ["Old Delhi / Chandni Chowk", "Hauz Khas Village", "Connaught Place", "Mehrauli", "Majnu ka Tilla"] }
    ]
  },
  {
    name: "Jammu and Kashmir",
    code: "JK",
    type: "Union Territory",
    region: "North",
    capital: "Srinagar (Summer) / Jammu (Winter)",
    description: "Paradise on Earth: shikaras floating on Dal Lake, cedar forests of Pahalgam, snow meadows of Gulmarg, and Mughal gardens.",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800",
    districts: ["Srinagar", "Baramulla", "Anantnag", "Ganderbal", "Jammu"],
    cities: [
      { name: "Srinagar", district: "Srinagar", towns: ["Dal Lake Houseboats", "Lal Chowk", "Nigeen Lake", "Old City"] },
      { name: "Gulmarg", district: "Baramulla", towns: ["Gondola Base", "Apharwat Peak", "Meadow of Flowers"] },
      { name: "Pahalgam", district: "Anantnag", towns: ["Betaab Valley", "Aru Valley", "Baisaran"] },
      { name: "Sonamarg", district: "Ganderbal", towns: ["Thajiwas Glacier", "Baltal"] }
    ]
  },
  {
    name: "Ladakh",
    code: "LA",
    type: "Union Territory",
    region: "North",
    capital: "Leh",
    description: "The Land of High Mountain Passes: dramatic moonscapes, blue glacial waters of Pangong Tso, and ancient Tibetan Buddhist monasteries.",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800",
    districts: ["Leh", "Kargil"],
    cities: [
      { name: "Leh", district: "Leh", towns: ["Leh Old Town", "Changspa", "Shey", "Thiksey"] },
      { name: "Nubra Valley", district: "Leh", towns: ["Diskit", "Hunder Sand Dunes", "Turtuk"] },
      { name: "Pangong Tso", district: "Leh", towns: ["Spangmik", "Maan", "Merak"] },
      { name: "Zanskar", district: "Kargil", towns: ["Padum", "Karsha", "Phuktal"] }
    ]
  },
  {
    name: "Lakshadweep",
    code: "LD",
    type: "Union Territory",
    region: "Islands",
    capital: "Kavaratti",
    description: "Pristine coral atolls in the Arabian Sea with untouched lagoons, scuba diving, and tranquil island solitude.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    districts: ["Lakshadweep"],
    cities: [
      { name: "Agatti Island", district: "Lakshadweep", towns: ["Agatti Lagoon", "Coral Reef Point"] },
      { name: "Bangaram Island", district: "Lakshadweep", towns: ["Bangaram Resort", "Thinnakara"] },
      { name: "Kavaratti", district: "Lakshadweep", towns: ["Kavaratti Jetty", "Marine Aquarium Area"] }
    ]
  },
  {
    name: "Puducherry",
    code: "PY",
    type: "Union Territory",
    region: "South",
    capital: "Pondicherry",
    description: "French colonial boulevard streets with yellow mustard villas, beachfront promenade cafes, and the spiritual experimental township of Auroville.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
    districts: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    cities: [
      { name: "Pondicherry", district: "Puducherry", towns: ["White Town (French Quarter)", "Auroville", "Promenade Beach", "Serenity Beach"] }
    ]
  }
];

// Helper: Normalize strings for fuzzy comparison
const normalize = (str) => (str || "").trim().toLowerCase();

// Validate if state/UT is in India
const isValidIndianState = (stateName) => {
  if (!stateName) return false;
  const n = normalize(stateName);
  return INDIAN_STATES_AND_UTS.some(
    (s) => normalize(s.name) === n || normalize(s.code) === n
  );
};

// Find state info
const getIndianStateInfo = (stateName) => {
  if (!stateName) return null;
  const n = normalize(stateName);
  return (
    INDIAN_STATES_AND_UTS.find(
      (s) => normalize(s.name) === n || normalize(s.code) === n
    ) || null
  );
};

// Regions
const INDIAN_REGIONS = ["All", "North", "South", "East", "West", "Central", "North-East", "Islands"];

module.exports = {
  INDIAN_STATES_AND_UTS,
  INDIAN_REGIONS,
  isValidIndianState,
  getIndianStateInfo
};
