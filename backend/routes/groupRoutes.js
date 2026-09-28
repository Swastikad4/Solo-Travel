const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Group = require("../models/Group");
const GroupMessage = require("../models/GroupMessage");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const { getIo } = require("../services/socketService");

// Default Pre-seeded Indian Travel Groups
const SEED_GROUPS = [
  {
    _id: "g_goa_solo",
    name: "Goa Solo Travelers",
    description:
      "The official hub for solo wanderers in Goa! Connect for beach sunsets in Anjuna, scooty trips to South Goa waterfalls, flea markets, and cafe hopping.",
    destination: "Goa",
    category: "Beach & Chill",
    coverImage:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    creator: "u_rahul123",
    creatorInfo: { name: "Rahul Sharma", username: "rahul_wanderer" },
    admins: ["u_rahul123"],
    members: ["u_rahul123", "u_ananya456", "u_arjun789"],
    memberCount: 3,
    rules: [
      "Respect beach cleanliness and local coastal traditions.",
      "Always ride scooties with helmets and valid licenses.",
      "Share verified hostel recommendations and safety updates.",
    ],
    lastActivity: new Date(),
  },
  {
    _id: "g_manali_travelers",
    name: "Manali Travelers",
    description:
      "Connecting solo hikers, backpackers, and mountain lovers in Old Manali, Solang, Sethan, and Rohtang. Plan treks, share cabs, and explore local cafes.",
    destination: "Manali, Himachal Pradesh",
    category: "Trekking",
    coverImage:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    creator: "u_arjun789",
    creatorInfo: { name: "Arjun Verma", username: "arjun_peaks" },
    admins: ["u_arjun789"],
    members: ["u_arjun789", "u_rahul123", "u_sneha101"],
    memberCount: 3,
    rules: [
      "No trekking off-trail without informing fellow travelers.",
      "Check Atal Tunnel and Rohtang weather conditions daily.",
      "Strict leave-no-trace mountain policy.",
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    _id: "g_kerala_travelers",
    name: "Kerala Travelers",
    description:
      "From Varkala clifftops to Munnar tea plantations and Alleppey backwaters. Meet fellow solo explorers traveling God's Own Country.",
    destination: "Kerala",
    category: "Backpacking",
    coverImage:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    creator: "u_ananya456",
    creatorInfo: { name: "Ananya Iyer", username: "ananya_solos" },
    admins: ["u_ananya456"],
    members: ["u_ananya456", "u_sneha101"],
    memberCount: 2,
    rules: [
      "Share genuine Ayurvedic retreat and homestay tips.",
      "Respect local temple dress codes and timings.",
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    _id: "g_rajasthan_backpackers",
    name: "Rajasthan Backpackers",
    description:
      "Explore the golden sands of Jaisalmer, blue alleys of Jodhpur, palaces of Udaipur, and pink heritage of Jaipur with fellow budget backpackers.",
    destination: "Rajasthan",
    category: "Heritage & Culture",
    coverImage:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
    creator: "u_sneha101",
    creatorInfo: { name: "Sneha Patel", username: "sneha_journeys" },
    admins: ["u_sneha101"],
    members: ["u_sneha101", "u_rahul123"],
    memberCount: 2,
    rules: [
      "Share honest camel safari and folk music reviews.",
      "Stay hydrated during desert expeditions.",
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    _id: "g_mp_travelers",
    name: "Madhya Pradesh Travelers",
    description:
      "Heart of Incredible India! Connect for tiger safaris in Kanha & Bandhavgarh, Khajuraho temples, and the ghats of Maheshwar & Ujjain.",
    destination: "Madhya Pradesh",
    category: "Wildlife & Nature",
    coverImage:
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800",
    creator: "u_arjun789",
    creatorInfo: { name: "Arjun Verma", username: "arjun_peaks" },
    admins: ["u_arjun789"],
    members: ["u_arjun789", "u_ananya456"],
    memberCount: 2,
    rules: [
      "Follow forest department safari guidelines strictly.",
      "Maintain quiet in wildlife buffer zones.",
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 240),
  },
];

let sampleGroupMessages = [
  {
    _id: "gm_seed_1",
    groupId: "g_goa_solo",
    sender: "u_rahul123",
    senderName: "Rahul Sharma",
    senderAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    content: "Welcome to Goa Solo Travelers! Anyone heading to Arambol drum circle this evening?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isDeleted: false,
  },
  {
    _id: "gm_seed_2",
    groupId: "g_goa_solo",
    sender: "u_ananya456",
    senderName: "Ananya Iyer",
    senderAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    content: "Hey Rahul! Yes, a few of us from the hostel are renting scooters to reach there around 5:30 PM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    isDeleted: false,
  },
];

// Helper: Database connection check
const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper: Seed default groups if database is empty
const seedGroupsIfEmpty = async () => {
  if (!isDbConnected()) return;
  try {
    const count = await Group.countDocuments();
    if (count === 0) {
      // Find any user to set as creator or create placeholders
      const firstUser = await User.findOne();
      if (firstUser) {
        const groupsToInsert = SEED_GROUPS.map((g) => {
          const { _id, creatorInfo, memberCount, ...rest } = g;
          return {
            ...rest,
            creator: firstUser._id,
            admins: [firstUser._id],
            members: [firstUser._id],
          };
        });
        await Group.insertMany(groupsToInsert);
      }
    }
  } catch (err) {
    // Fallback in-memory
  }
};
seedGroupsIfEmpty();

// 1. GET /api/groups — Browse and search travel groups
router.get("/", async (req, res) => {
  try {
    const { q, destination, category } = req.query;
    let filter = {};

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { name: regex },
        { description: regex },
        { destination: regex },
      ];
    }

    if (destination && destination !== "All") {
      filter.destination = new RegExp(destination, "i");
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    let groups = [];
    try {
      groups = await Group.find(filter)
        .populate("creator", "name username avatar")
        .sort({ lastActivity: -1 })
        .lean();
    } catch (err) {}

    if (!groups || groups.length === 0) {
      // Filter in-memory sample groups
      groups = SEED_GROUPS.filter((g) => {
        if (q && q.trim()) {
          const query = q.toLowerCase();
          const matchName = g.name.toLowerCase().includes(query);
          const matchDesc = g.description.toLowerCase().includes(query);
          const matchDest = g.destination.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchDest) return false;
        }
        if (destination && destination !== "All") {
          if (!g.destination.toLowerCase().includes(destination.toLowerCase()))
            return false;
        }
        if (category && category !== "All") {
          if (g.category !== category) return false;
        }
        return true;
      });
    }

    const formatted = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      description: g.description,
      destination: g.destination,
      category: g.category,
      coverImage: g.coverImage,
      creator: g.creator,
      admins: g.admins || [],
      members: g.members || [],
      memberCount: g.members ? g.members.length : g.memberCount || 1,
      rules: g.rules || [],
      lastActivity: g.lastActivity,
    }));

    res.json({ success: true, count: formatted.length, groups: formatted });
  } catch (err) {
    res.status(500).json({ error: "Failed to load travel groups" });
  }
});

// 2. GET /api/groups/:id — Get group profile & members
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let group = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      group = await Group.findById(id)
        .populate("creator", "name username avatar")
        .populate("admins", "name username avatar")
        .populate("members", "name username avatar travelStyle")
        .lean();
    }

    if (!group) {
      group = SEED_GROUPS.find((g) => g._id === id);
    }

    if (!group) {
      return res.status(404).json({ error: "Travel group not found" });
    }

    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch group details" });
  }
});

// 3. POST /api/groups — Create new travel group
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, description, destination, category, coverImage, rules } =
      req.body;
    const userId = req.user.id;

    if (!name?.trim() || !description?.trim() || !destination?.trim()) {
      return res.status(400).json({
        error: "Group name, description, and destination are required",
      });
    }

    if (!isDbConnected()) {
      const fallbackGroup = {
        _id: "g_" + Date.now(),
        name: name.trim(),
        description: description.trim(),
        destination: destination.trim(),
        category: category || "General",
        coverImage:
          coverImage?.trim() ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        creator: req.user,
        admins: [userId],
        members: [req.user],
        memberCount: 1,
        rules: rules || [
          "Be respectful to all solo travelers.",
          "Share genuine local tips and updates.",
        ],
        lastActivity: new Date(),
      };
      SEED_GROUPS.unshift(fallbackGroup);
      return res.status(201).json({ success: true, group: fallbackGroup });
    }

    const newGroup = new Group({
      name: name.trim(),
      description: description.trim(),
      destination: destination.trim(),
      category: category || "General",
      coverImage:
        coverImage?.trim() ||
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      creator: userId,
      admins: [userId],
      members: [userId],
      rules: rules || [
        "Be respectful to all solo travelers.",
        "Share genuine local tips and updates.",
      ],
      lastActivity: new Date(),
    });

    await newGroup.save();
    const populated = await Group.findById(newGroup._id)
      .populate("creator", "name username avatar")
      .populate("members", "name username avatar");

    res.status(201).json({ success: true, group: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "A travel group with this name already exists" });
    }
    res.status(500).json({ error: "Failed to create travel group" });
  }
});

// 4. PUT /api/groups/:id — Edit group (Admin only)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, destination, category, coverImage, rules } =
      req.body;
    const userId = String(req.user.id);

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isAdmin =
      String(group.creator) === userId ||
      group.admins.some((a) => String(a) === userId);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "Only group admins can edit group settings" });
    }

    if (name) group.name = name.trim();
    if (description) group.description = description.trim();
    if (destination) group.destination = destination.trim();
    if (category) group.category = category;
    if (coverImage) group.coverImage = coverImage.trim();
    if (rules) group.rules = rules;

    await group.save();
    res.json({ success: true, message: "Group updated successfully", group });
  } catch (err) {
    res.status(500).json({ error: "Failed to update group" });
  }
});

// 5. DELETE /api/groups/:id — Delete group (Admin/Creator only)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user.id);

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isCreatorOrAdmin =
      String(group.creator) === userId ||
      group.admins.some((a) => String(a) === userId);

    if (!isCreatorOrAdmin) {
      return res
        .status(403)
        .json({ error: "Only group creator or admins can delete this group" });
    }

    await Group.findByIdAndDelete(id);
    await GroupMessage.deleteMany({ groupId: id });

    res.json({ success: true, message: "Travel group deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete group" });
  }
});

// 6. POST /api/groups/:id/join — Join group
router.post("/:id/join", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.members.some((m) => String(m) === String(userId))) {
      group.members.push(userId);
      await group.save();
    }

    res.json({
      success: true,
      message: "Joined group successfully",
      membersCount: group.members.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to join group" });
  }
});

// 7. POST /api/groups/:id/leave — Leave group
router.post("/:id/leave", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user.id);

    let group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members = group.members.filter((m) => String(m) !== userId);
    group.admins = group.admins.filter((a) => String(a) !== userId);
    await group.save();

    res.json({
      success: true,
      message: "Left group successfully",
      membersCount: group.members.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to leave group" });
  }
});

// 8. POST /api/groups/:id/remove-member — Remove/Kick member (Admin only)
router.post("/:id/remove-member", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const adminId = String(req.user.id);

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isAdmin =
      String(group.creator) === adminId ||
      group.admins.some((a) => String(a) === adminId);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "Only admins can remove group members" });
    }

    if (String(group.creator) === String(memberId)) {
      return res.status(400).json({ error: "Cannot remove the group creator" });
    }

    group.members = group.members.filter((m) => String(m) !== String(memberId));
    group.admins = group.admins.filter((a) => String(a) !== String(memberId));
    await group.save();

    res.json({
      success: true,
      message: "Member removed from group",
      membersCount: group.members.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// 9. GET /api/groups/:id/messages — Get message history
router.get("/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    let messages = [];

    if (mongoose.Types.ObjectId.isValid(id)) {
      messages = await GroupMessage.find({ groupId: id })
        .sort({ timestamp: 1 })
        .limit(300)
        .lean();
    }

    if (!messages || messages.length === 0) {
      messages = sampleGroupMessages.filter((m) => m.groupId === id);
    }

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ error: "Failed to load group messages" });
  }
});

// 10. POST /api/groups/:id/messages — Send group message (REST fallback)
router.post("/:id/messages", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!content?.trim()) {
      return res.status(400).json({ error: "Message content cannot be empty" });
    }

    if (!isDbConnected() || !mongoose.Types.ObjectId.isValid(id)) {
      const fallbackMsg = {
        _id: "gm_" + Date.now(),
        groupId: req.params.id,
        sender: req.user.id,
        senderName: req.user.name,
        senderAvatar:
          req.user.avatar ||
          "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
        content: content.trim(),
        timestamp: new Date(),
      };
      sampleGroupMessages.push(fallbackMsg);
      return res.status(201).json({ success: true, message: fallbackMsg });
    }

    const newMsg = new GroupMessage({
      groupId: id,
      sender: user.id,
      senderName: user.name,
      senderAvatar:
        user.avatar ||
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
      content: content.trim(),
      timestamp: new Date(),
    });

    await newMsg.save();
    await Group.findByIdAndUpdate(id, { lastActivity: new Date() });

    // Socket.IO broadcast
    const io = getIo();
    if (io) {
      io.to(`group_${id}`).emit("new_group_message", {
        groupId: id,
        message: newMsg,
      });
    }

    res.status(201).json({ success: true, message: newMsg });
  } catch (err) {
    const fallbackMsg = {
      _id: "gm_" + Date.now(),
      groupId: req.params.id,
      sender: req.user.id,
      senderName: req.user.name,
      senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
      content: req.body.content?.trim(),
      timestamp: new Date(),
    };
    sampleGroupMessages.push(fallbackMsg);
    res.status(201).json({ success: true, message: fallbackMsg });
  }
});

// 11. DELETE /api/groups/:groupId/messages/:messageId — Delete group message
router.delete("/:groupId/messages/:messageId", authenticate, async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = String(req.user.id);

    let msg = null;
    if (mongoose.Types.ObjectId.isValid(messageId)) {
      msg = await GroupMessage.findById(messageId);
    }

    if (msg) {
      const group = await Group.findById(groupId);
      const isAdmin =
        group &&
        (String(group.creator) === userId ||
          group.admins?.some((a) => String(a) === userId));
      const isAuthor = String(msg.sender) === userId;

      if (!isAdmin && !isAuthor) {
        return res
          .status(403)
          .json({ error: "Only admins or message authors can delete messages" });
      }

      msg.isDeleted = true;
      msg.content = "This message was deleted by a group moderator.";
      msg.deletedBy = userId;
      await msg.save();
    }

    // Broadcast socket event
    const io = getIo();
    if (io) {
      io.to(`group_${groupId}`).emit("group_message_deleted", {
        groupId,
        messageId,
        deletedBy: userId,
      });
    }

    res.json({ success: true, message: "Group message deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete group message" });
  }
});

module.exports = router;
