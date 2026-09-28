const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Trip = require("../models/Trip");
const { authenticate } = require("../middleware/auth");

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper: safe user projection
const USER_PUBLIC_FIELDS = "name username avatar bio travelInterests preferredDestinations travelStyle isOnline lastSeen createdAt";

// Mock/fallback sample travelers for when MongoDB is in sample mode
const SAMPLE_TRAVELERS = [
  {
    _id: "u_rahul123",
    name: "Rahul Sharma",
    username: "rahul_wanderer",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    bio: "Passionate solo backpacker exploring the Himalayas and ancient forts of Rajasthan.",
    travelInterests: ["Trekking", "Heritage & Culture", "Photography", "Backpacking"],
    preferredDestinations: ["Himachal Pradesh", "Rajasthan", "Ladakh"],
    travelStyle: "Budget Backpacker",
    isOnline: true,
    lastSeen: new Date(),
    upcomingTrips: [
      { destination: "Manali, Himachal Pradesh", startDate: "2026-10-15", durationDays: 5 },
      { destination: "Jaisalmer, Rajasthan", startDate: "2026-11-20", durationDays: 4 }
    ]
  },
  {
    _id: "u_ananya456",
    name: "Ananya Iyer",
    username: "ananya_solos",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Maya",
    bio: "Solo female explorer from Bangalore. Love coastal trails, yoga retreats, and local food trails.",
    travelInterests: ["Street Food", "Yoga & Wellness", "Beaches", "Cultural Explorer"],
    preferredDestinations: ["Kerala", "Goa", "Gokarna", "Varanasi"],
    travelStyle: "Cultural Explorer",
    isOnline: true,
    lastSeen: new Date(),
    upcomingTrips: [
      { destination: "Varkala, Kerala", startDate: "2026-10-05", durationDays: 6 }
    ]
  },
  {
    _id: "u_arjun789",
    name: "Arjun Verma",
    username: "arjun_peaks",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper",
    bio: "High-altitude trekker and nature photographer. Always looking for offbeat mountain trails.",
    travelInterests: ["Trekking", "Wildlife", "Photography", "Adventure Seeker"],
    preferredDestinations: ["Uttarakhand", "Himachal Pradesh", "Sikkim"],
    travelStyle: "Adventure Seeker",
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000),
    upcomingTrips: [
      { destination: "Kedarkantha, Uttarakhand", startDate: "2026-12-01", durationDays: 6 }
    ]
  },
  {
    _id: "u_sneha101",
    name: "Sneha Patel",
    username: "sneha_journeys",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
    bio: "Slow traveler and heritage lover. Exploring temple architecture and handloom traditions across India.",
    travelInterests: ["Heritage & Culture", "Handicrafts", "Photography", "Slow Nomad"],
    preferredDestinations: ["Tamil Nadu", "Odisha", "Hampi"],
    travelStyle: "Slow Nomad",
    isOnline: true,
    lastSeen: new Date(),
    upcomingTrips: [
      { destination: "Hampi, Karnataka", startDate: "2026-11-10", durationDays: 4 }
    ]
  }
];

// 1. GET /api/users/discover — Search travelers with filters
router.get("/discover", async (req, res) => {
  try {
    const { q, interest, destination, style } = req.query;
    const currentUserId = req.query.currentUserId;

    let blockedIds = [];
    if (currentUserId && isDbConnected() && mongoose.Types.ObjectId.isValid(currentUserId)) {
      try {
        const currentUser = await User.findById(currentUserId);
        if (currentUser) {
          blockedIds = currentUser.blockedUsers || [];
        }
      } catch (e) {}
    }

    let filter = {};
    if (currentUserId) {
      filter._id = { $ne: currentUserId, $nin: blockedIds };
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { name: regex },
        { username: regex },
        { bio: regex },
        { travelInterests: regex },
        { preferredDestinations: regex }
      ];
    }

    if (interest && interest !== "All") {
      filter.travelInterests = new RegExp(interest, "i");
    }

    if (destination && destination !== "All") {
      filter.preferredDestinations = new RegExp(destination, "i");
    }

    if (style && style !== "All") {
      filter.travelStyle = style;
    }

    let users = [];
    if (isDbConnected()) {
      try {
        users = await User.find(filter)
          .select(USER_PUBLIC_FIELDS)
          .limit(40)
          .lean();
      } catch (err) {
        // Fallback to sample data
      }
    }

    if (!users || users.length === 0) {
      // Filter sample travelers
      users = SAMPLE_TRAVELERS.filter(t => {
        if (currentUserId && t._id === currentUserId) return false;
        if (q && q.trim()) {
          const query = q.toLowerCase();
          const matchName = t.name.toLowerCase().includes(query);
          const matchUser = t.username?.toLowerCase().includes(query);
          const matchBio = t.bio.toLowerCase().includes(query);
          const matchInt = t.travelInterests.some(i => i.toLowerCase().includes(query));
          const matchDest = t.preferredDestinations.some(d => d.toLowerCase().includes(query));
          if (!matchName && !matchUser && !matchBio && !matchInt && !matchDest) return false;
        }
        if (interest && interest !== "All") {
          if (!t.travelInterests.some(i => i.toLowerCase().includes(interest.toLowerCase()))) return false;
        }
        if (destination && destination !== "All") {
          if (!t.preferredDestinations.some(d => d.toLowerCase().includes(destination.toLowerCase()))) return false;
        }
        if (style && style !== "All") {
          if (t.travelStyle !== style) return false;
        }
        return true;
      });
    }

    // Attach preview of upcoming trips for each user
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        let upcomingTrips = [];
        if (isDbConnected() && mongoose.Types.ObjectId.isValid(u._id)) {
          try {
            upcomingTrips = await Trip.find({
              user: u._id,
              status: { $in: ["Upcoming", "Ongoing", "Planning"] }
            })
              .select("title destination startDate durationDays")
              .limit(3)
              .lean();
          } catch (err) {
            upcomingTrips = u.upcomingTrips || [];
          }
        } else {
          upcomingTrips = u.upcomingTrips || [];
        }
        return {
          ...u,
          upcomingTrips: upcomingTrips || u.upcomingTrips || []
        };
      })
    );

    res.json({
      success: true,
      count: enrichedUsers.length,
      travelers: enrichedUsers,
      users: enrichedUsers
    });
  } catch (err) {
    console.error("Error discovering travelers:", err);
    res.status(500).json({ error: "Failed to discover travelers" });
  }
});

// 2. GET /api/users/:id/profile — View public traveler profile
router.get("/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    let user = null;

    try {
      user = await User.findById(id).select(USER_PUBLIC_FIELDS).lean();
    } catch (err) {}

    if (!user) {
      user = SAMPLE_TRAVELERS.find(t => t._id === id);
    }

    if (!user) {
      return res.status(404).json({ error: "Traveler profile not found" });
    }

    let upcomingTrips = [];
    try {
      upcomingTrips = await Trip.find({ user: id })
        .select("title destination startDate durationDays status")
        .limit(5)
        .lean();
    } catch (err) {
      upcomingTrips = user.upcomingTrips || [];
    }

    res.json({
      success: true,
      profile: {
        ...user,
        upcomingTrips: upcomingTrips || user.upcomingTrips || []
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch traveler profile" });
  }
});

// 3. POST /api/users/:id/block — Block a traveler
router.post("/:id/block", authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (String(targetUserId) === String(currentUserId)) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }

    const user = await User.findById(currentUserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.blockedUsers.includes(targetUserId)) {
      user.blockedUsers.push(targetUserId);
      await user.save();
    }

    res.json({ success: true, message: "User blocked successfully", blockedUsers: user.blockedUsers });
  } catch (err) {
    res.status(500).json({ error: "Failed to block user" });
  }
});

// 4. POST /api/users/:id/unblock — Unblock a traveler
router.post("/:id/unblock", authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const user = await User.findById(currentUserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.blockedUsers = user.blockedUsers.filter(id => String(id) !== String(targetUserId));
    await user.save();

    res.json({ success: true, message: "User unblocked successfully", blockedUsers: user.blockedUsers });
  } catch (err) {
    res.status(500).json({ error: "Failed to unblock user" });
  }
});

// 5. POST /api/users/:id/report — Report a traveler profile
router.post("/:id/report", authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { reason } = req.body;
    const reporterId = req.user.id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    if (!targetUser.reports) targetUser.reports = [];
    targetUser.reports.push({
      reportedBy: reporterId,
      reason: reason || "Inappropriate behavior",
      timestamp: new Date()
    });
    await targetUser.save();

    res.json({ success: true, message: "Report submitted to SoloTravel Trust & Safety team" });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// 6. GET /api/users/privacy/settings — Get current privacy settings & blocked users
router.get("/privacy/settings", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("blockedUsers", "name username avatar")
      .select("privacySettings blockedUsers");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      privacySettings: user.privacySettings || { whoCanMessageMe: "everyone" },
      blockedUsers: user.blockedUsers || []
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch privacy settings" });
  }
});

// 7. PUT /api/users/privacy/settings — Update "Who can message me?"
router.put("/privacy/settings", authenticate, async (req, res) => {
  try {
    const { whoCanMessageMe } = req.body;
    if (!["everyone", "group_members", "nobody"].includes(whoCanMessageMe)) {
      return res.status(400).json({ error: "Invalid privacy setting value" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.privacySettings) user.privacySettings = {};
    user.privacySettings.whoCanMessageMe = whoCanMessageMe;
    await user.save();

    res.json({
      success: true,
      message: "Privacy settings updated",
      privacySettings: user.privacySettings
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update privacy settings" });
  }
});

module.exports = router;
