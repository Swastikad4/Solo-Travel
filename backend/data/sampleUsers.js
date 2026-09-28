const bcrypt = require("bcryptjs");

// Pre-hashed passwords:
// "Admin@123" -> bcrypt hash
// "Travel@123" -> bcrypt hash
const adminPasswordHash = bcrypt.hashSync("Admin@123", 10);
const travelerPasswordHash = bcrypt.hashSync("Travel@123", 10);

const sampleUsers = [
  {
    _id: "u_admin_001",
    name: "Admin SoloTravel",
    email: "admin@solotravel.in",
    password: adminPasswordHash,
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    bio: "Platform Administrator & Lead Solo Travel Explorer across 28 Indian States.",
    travelInterests: ["Heritage & Culture", "Trekking", "Wildlife Safari", "Spiritual"],
    preferredDestinations: ["Ladakh", "Rajasthan", "Meghalaya", "Kerala"],
    travelStyle: "Cultural Explorer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "u_traveler_002",
    name: "Aarav Sharma",
    email: "aarav@solotravel.in",
    password: travelerPasswordHash,
    role: "USER",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    bio: "Photographer & backpacker exploring ancient ghats, Himalayan trails, and street food corridors of Bharat.",
    travelInterests: ["Photography", "Street Food", "Trekking", "Spiritual"],
    preferredDestinations: ["Varanasi", "Himachal Pradesh", "Hampi", "Goa"],
    travelStyle: "Budget Backpacker",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "u_traveler_003",
    name: "Priya Patel",
    email: "priya@solotravel.in",
    password: travelerPasswordHash,
    role: "USER",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    bio: "Solo female wanderer loving quiet coastal villages, pottery workshops, and mountain cafes.",
    travelInterests: ["Beach & Sunsets", "Yoga & Wellness", "Heritage & Culture"],
    preferredDestinations: ["Pondicherry", "Kerala", "Udaipur", "Goa"],
    travelStyle: "Slow Nomad",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

module.exports = { sampleUsers };
