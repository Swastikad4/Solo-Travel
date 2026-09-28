const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const prisma = require("../lib/prisma");

// In-memory fallback for messages if PostgreSQL is unavailable
const sampleMessages = [];
=======
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const { getIo } = require("../services/socketService");

// Sample in-memory conversations for offline/sample fallback
let sampleConversations = [
  {
    _id: "c_sample_1",
    participants: ["u_rahul123", "sample_me"],
    participantProfiles: [
      {
        _id: "u_rahul123",
        name: "Rahul Sharma",
        username: "rahul_wanderer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
        isOnline: true,
        lastSeen: new Date()
      }
    ],
    lastMessage: {
      content: "Hey! Are you planning for the Manali trek in October?",
      sender: "u_rahul123",
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    _id: "c_sample_2",
    participants: ["u_ananya456", "sample_me"],
    participantProfiles: [
      {
        _id: "u_ananya456",
        name: "Ananya Iyer",
        username: "ananya_solos",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2)
      }
    ],
    lastMessage: {
      content: "Thanks for the Gokarna hostel recommendation! It was awesome.",
      sender: "sample_me",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];
>>>>>>> 8588af7 (Update project)

let sampleMessages = [
  {
    _id: "m_1",
    conversationId: "c_sample_1",
    sender: "u_rahul123",
    receiver: "sample_me",
    senderId: "u_rahul123",
    receiverId: "sample_me",
    content: "Hi! Noticed you have Manali in your wishlist too.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: true
  },
  {
    _id: "m_2",
    conversationId: "c_sample_1",
    sender: "sample_me",
    receiver: "u_rahul123",
    senderId: "sample_me",
    receiverId: "u_rahul123",
    content: "Hello Rahul! Yes, thinking of doing the Hampta Pass circuit.",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    read: true
  },
  {
    _id: "m_3",
    conversationId: "c_sample_1",
    sender: "u_rahul123",
    receiver: "sample_me",
    senderId: "u_rahul123",
    receiverId: "sample_me",
    content: "Hey! Are you planning for the Manali trek in October?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false
  }
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// 1. GET /api/chat/conversations — Get all active 1-to-1 conversations
router.get("/conversations", authenticate, async (req, res) => {
  const currentUserId = req.user.id;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(currentUserId)) {
    try {
      const convs = await Conversation.find({
        participants: currentUserId,
        deletedFor: { $ne: currentUserId }
      })
        .populate("participants", "name username avatar isOnline lastSeen")
        .sort({ updatedAt: -1 })
        .lean();

      const formatted = convs.map(c => {
        const otherParticipant = c.participants.find(
          p => String(p._id) !== String(currentUserId)
        );
        const unread = c.unreadCounts ? c.unreadCounts[String(currentUserId)] || 0 : 0;
        return {
          _id: c._id,
          participants: c.participants,
          otherParticipant,
          lastMessage: c.lastMessage,
          unreadCount: unread,
          updatedAt: c.updatedAt
        };
      });

<<<<<<< HEAD
  if (!u1 || !u2)
    return res.status(400).json({ error: "Both user IDs are required" });

  try {
    const dbMessages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: { equals: u1, mode: "insensitive" },
            receiverId: { equals: u2, mode: "insensitive" },
          },
          {
            senderId: { equals: u2, mode: "insensitive" },
            receiverId: { equals: u1, mode: "insensitive" },
          },
        ],
      },
      orderBy: { timestamp: "asc" },
      take: 200,
    });

    if (dbMessages && dbMessages.length > 0) return res.json(dbMessages);
  } catch (err) {
    // Fall through to in-memory fallback
=======
      return res.json({ success: true, conversations: formatted });
    } catch (err) {
      // Fallback
    }
>>>>>>> 8588af7 (Update project)
  }

  res.json({
    success: true,
    conversations: sampleConversations.map(c => ({
      ...c,
      otherParticipant: c.participantProfiles[0]
    }))
  });
});

// 2. GET /api/chat/messages/:conversationId — Get conversation message history
router.get("/messages/:conversationId", authenticate, async (req, res) => {
  const { conversationId } = req.params;
  const currentUserId = req.user.id;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(conversationId)) {
    try {
      const messages = await Message.find({
        conversationId,
        deletedFor: { $ne: currentUserId }
      })
        .sort({ timestamp: 1 })
        .limit(300)
        .lean();

      // Mark unread messages received by current user as read
      await Message.updateMany(
        {
          conversationId,
          receiverId: String(currentUserId),
          read: false
        },
        { $set: { read: true, readAt: new Date() } }
      );

      // Reset unread count in Conversation
      const conv = await Conversation.findById(conversationId);
      if (conv && conv.unreadCounts) {
        conv.unreadCounts.set(String(currentUserId), 0);
        await conv.save();
      }

      return res.json({ success: true, messages });
    } catch (err) {}
  }

  const filtered = sampleMessages.filter(
    m => m.conversationId === conversationId && (!m.deletedFor || !m.deletedFor.includes(currentUserId))
  );
  res.json({ success: true, messages: filtered });
});

// 3. POST /api/chat/start-or-get — Start or retrieve existing conversation with target user
router.post(["/start-or-get", "/start"], authenticate, async (req, res) => {
  const { recipientId } = req.body;
  const currentUserId = req.user.id;

  if (!recipientId) {
    return res.status(400).json({ error: "Recipient ID is required" });
  }

  if (String(recipientId) === String(currentUserId)) {
    return res.status(400).json({ error: "Cannot start a conversation with yourself" });
  }

  if (!isDbConnected() || !mongoose.Types.ObjectId.isValid(recipientId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
    const targetTraveler = {
      _id: recipientId,
      name: "Traveler",
      username: "traveler",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      isOnline: true
    };
    return res.json({
      success: true,
      conversation: {
        _id: "c_new_" + recipientId,
        participants: [currentUserId, recipientId],
        otherParticipant: targetTraveler,
        lastMessage: { content: "" },
        unreadCount: 0
      }
    });
  }

  try {
<<<<<<< HEAD
    const message = await prisma.message.create({ data: newMsgData });
    return res.status(201).json(message);
  } catch (err) {
    // If PostgreSQL fails, store in memory
    const newMsg = { _id: "m" + Date.now(), ...newMsgData };
    sampleMessages.push(newMsg);
    return res.status(201).json(newMsg);
=======
    // Check if recipient has blocked current user
    const recipient = await User.findById(recipientId);
    if (recipient) {
      if (recipient.blockedUsers?.some(id => String(id) === String(currentUserId))) {
        return res.status(403).json({ error: "You cannot message this traveler (blocked)." });
      }

      if (recipient.privacySettings?.whoCanMessageMe === "nobody") {
        return res.status(403).json({ error: "This traveler has disabled incoming messages." });
      }
    }

    let conv = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId] }
    }).populate("participants", "name username avatar isOnline lastSeen");

    if (!conv) {
      conv = new Conversation({
        participants: [currentUserId, recipientId],
        lastMessage: { content: "", timestamp: new Date() },
        unreadCounts: { [recipientId]: 0, [currentUserId]: 0 }
      });
      await conv.save();
      conv = await Conversation.findById(conv._id).populate("participants", "name username avatar isOnline lastSeen");
    } else {
      // Un-delete if previously deleted for current user
      if (conv.deletedFor?.includes(currentUserId)) {
        conv.deletedFor = conv.deletedFor.filter(id => String(id) !== String(currentUserId));
        await conv.save();
      }
    }

    const otherParticipant = conv.participants.find(
      p => String(p._id) !== String(currentUserId)
    );

    return res.json({
      success: true,
      conversation: {
        _id: conv._id,
        participants: conv.participants,
        otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: 0
      }
    });
  } catch (err) {
    // Fallback sample conversation
    const targetTraveler = {
      _id: recipientId,
      name: "Traveler",
      username: "traveler",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      isOnline: true
    };
    return res.json({
      success: true,
      conversation: {
        _id: "c_new_" + recipientId,
        participants: [currentUserId, recipientId],
        otherParticipant: targetTraveler,
        lastMessage: { content: "" },
        unreadCount: 0
      }
    });
  }
});

// 4. POST /api/chat/send — Send a message (REST endpoint fallback)
router.post("/send", authenticate, async (req, res) => {
  const { receiverId, conversationId, content } = req.body;
  const currentUserId = req.user.id;

  if (!receiverId || !content?.trim()) {
    return res.status(400).json({ error: "Receiver ID and message content are required" });
  }

  if (!isDbConnected() || !mongoose.Types.ObjectId.isValid(receiverId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
    const fallbackMsg = {
      _id: "m_" + Date.now(),
      conversationId: conversationId || "c_" + Date.now(),
      senderId: String(currentUserId),
      receiverId: String(receiverId),
      content: content.trim(),
      timestamp: new Date(),
      read: false
    };
    sampleMessages.push(fallbackMsg);
    return res.status(201).json({ success: true, message: fallbackMsg });
  }

  try {
    // Check block & privacy
    const receiver = await User.findById(receiverId);
    if (receiver) {
      if (receiver.blockedUsers?.some(id => String(id) === String(currentUserId))) {
        return res.status(403).json({ error: "You cannot message this user." });
      }
      if (receiver.privacySettings?.whoCanMessageMe === "nobody") {
        return res.status(403).json({ error: "This user does not accept messages." });
      }
    }

    let convId = conversationId;
    let conv = null;

    if (convId && mongoose.Types.ObjectId.isValid(convId)) {
      conv = await Conversation.findById(convId);
    }
    if (!conv) {
      conv = await Conversation.findOne({
        participants: { $all: [currentUserId, receiverId] }
      });
    }

    if (!conv) {
      conv = new Conversation({
        participants: [currentUserId, receiverId],
        lastMessage: { content: content.trim(), sender: currentUserId, timestamp: new Date() },
        unreadCounts: { [receiverId]: 1, [currentUserId]: 0 }
      });
      await conv.save();
    } else {
      const currentUnread = (conv.unreadCounts?.get(String(receiverId)) || 0) + 1;
      conv.lastMessage = { content: content.trim(), sender: currentUserId, timestamp: new Date() };
      if (!conv.unreadCounts) conv.unreadCounts = new Map();
      conv.unreadCounts.set(String(receiverId), currentUnread);
      conv.deletedFor = [];
      await conv.save();
    }

    const newMsg = new Message({
      conversationId: conv._id,
      sender: currentUserId,
      receiver: receiverId,
      senderId: String(currentUserId),
      receiverId: String(receiverId),
      content: content.trim(),
      timestamp: new Date(),
      read: false
    });

    await newMsg.save();

    // Socket.IO trigger
    const io = getIo();
    if (io) {
      io.to(`user_${receiverId}`).emit("new_message", {
        message: newMsg,
        conversationId: conv._id,
        senderId: currentUserId,
        receiverId
      });
    }

    return res.status(201).json({ success: true, message: newMsg, conversationId: conv._id });
  } catch (err) {
    const fallbackMsg = {
      _id: "m_" + Date.now(),
      conversationId: conversationId || "c_" + Date.now(),
      senderId: String(currentUserId),
      receiverId: String(receiverId),
      content: content.trim(),
      timestamp: new Date(),
      read: false
    };
    sampleMessages.push(fallbackMsg);
    return res.status(201).json({ success: true, message: fallbackMsg });
  }
});

// 5. DELETE /api/chat/messages/:id — Delete single message
router.delete("/messages/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { forEveryone } = req.query;
  const currentUserId = req.user.id;

  try {
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    if (forEveryone === "true") {
      if (String(msg.sender) !== String(currentUserId) && msg.senderId !== String(currentUserId)) {
        return res.status(403).json({ error: "You can only delete your own messages for everyone" });
      }
      msg.isDeleted = true;
      msg.content = "This message was deleted";
      await msg.save();
    } else {
      if (!msg.deletedFor) msg.deletedFor = [];
      if (!msg.deletedFor.includes(currentUserId)) {
        msg.deletedFor.push(currentUserId);
        await msg.save();
      }
    }

    return res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// 6. DELETE /api/chat/conversations/:id — Delete entire conversation for current user
router.delete("/conversations/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  try {
    const conv = await Conversation.findById(id);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    if (!conv.deletedFor) conv.deletedFor = [];
    if (!conv.deletedFor.includes(currentUserId)) {
      conv.deletedFor.push(currentUserId);
      await conv.save();
    }

    return res.json({ success: true, message: "Conversation deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// 7. POST /api/chat/report-message/:id — Report an abusive message
router.post("/report-message/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const currentUserId = req.user.id;

  try {
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    msg.reported = {
      isReported: true,
      reason: reason || "Inappropriate message",
      reportedBy: currentUserId,
      reportedAt: new Date()
    };
    await msg.save();

    res.json({ success: true, message: "Message reported to moderators" });
  } catch (err) {
    res.status(500).json({ error: "Failed to report message" });
>>>>>>> 8588af7 (Update project)
  }
});

module.exports = router;
