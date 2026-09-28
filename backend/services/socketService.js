const { Server } = require("socket.io");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Group = require("../models/Group");
const GroupMessage = require("../models/GroupMessage");

// In-memory mappings for active connections
const userSockets = new Map(); // userId -> Set of socketIds
const socketUserMap = new Map(); // socketId -> userId

let io = null;

const initSocketServer = (httpServer, allowedOrigins = []) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(null, true); // Dev fallback
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    // 1. User Authentication / Registration
    socket.on("register_user", async ({ userId }) => {
      if (!userId) return;
      const uid = String(userId);
      socket.userId = uid;
      socketUserMap.set(socket.id, uid);

      if (!userSockets.has(uid)) {
        userSockets.set(uid, new Set());
      }
      userSockets.get(uid).add(socket.id);
      socket.join(`user_${uid}`);

      // Update online presence
      try {
        await User.findByIdAndUpdate(uid, { isOnline: true, lastSeen: new Date() });
      } catch (err) {
        // Safe fallback
      }

      // Broadcast user online status
      io.emit("user_status_changed", { userId: uid, isOnline: true, lastSeen: new Date() });
    });

    // 2. Real-time 1-to-1 message dispatching
    socket.on("send_message", async (data, callback) => {
      try {
        const { senderId, receiverId, content, conversationId } = data;
        if (!senderId || !receiverId || !content?.trim()) {
          if (callback) callback({ error: "Invalid message payload" });
          return;
        }

        const sid = String(senderId);
        const rid = String(receiverId);

        // Check blocking & privacy
        try {
          const [senderUser, receiverUser] = await Promise.all([
            User.findById(sid),
            User.findById(rid),
          ]);

          if (receiverUser) {
            const isBlockedByReceiver = receiverUser.blockedUsers?.some(
              (id) => String(id) === sid
            );
            if (isBlockedByReceiver) {
              if (callback) callback({ error: "You cannot message this user (blocked)." });
              return;
            }

            const privacy = receiverUser.privacySettings?.whoCanMessageMe || "everyone";
            if (privacy === "nobody") {
              if (callback) callback({ error: "This user has disabled direct messaging." });
              return;
            }
          }
        } catch (err) {}

        // Find or create conversation
        let conv = null;
        try {
          if (conversationId) {
            conv = await Conversation.findById(conversationId);
          }
          if (!conv) {
            conv = await Conversation.findOne({
              participants: { $all: [sid, rid] },
            });
          }
          if (!conv) {
            conv = new Conversation({
              participants: [sid, rid],
              lastMessage: {
                content: content.trim(),
                sender: sid,
                timestamp: new Date(),
              },
              unreadCounts: { [rid]: 1, [sid]: 0 },
            });
            await conv.save();
          } else {
            const currentUnread = (conv.unreadCounts?.get(rid) || 0) + 1;
            conv.lastMessage = {
              content: content.trim(),
              sender: sid,
              timestamp: new Date(),
            };
            if (!conv.unreadCounts) conv.unreadCounts = new Map();
            conv.unreadCounts.set(rid, currentUnread);
            conv.deletedFor = [];
            await conv.save();
          }
        } catch (err) {}

        // Save Message in DB
        let savedMessage = null;
        try {
          savedMessage = new Message({
            conversationId: conv?._id,
            sender: sid,
            receiver: rid,
            senderId: sid,
            receiverId: rid,
            content: content.trim(),
            timestamp: new Date(),
            read: false,
          });
          await savedMessage.save();
        } catch (err) {
          savedMessage = {
            _id: "m_" + Date.now(),
            conversationId: conv?._id || "c_" + Date.now(),
            senderId: sid,
            receiverId: rid,
            content: content.trim(),
            timestamp: new Date(),
            read: false,
          };
        }

        const payload = {
          message: savedMessage,
          conversationId: conv?._id,
          senderId: sid,
          receiverId: rid,
        };

        io.to(`user_${rid}`).emit("new_message", payload);
        io.to(`user_${sid}`).emit("message_sent_ack", payload);

        if (callback) callback({ success: true, message: savedMessage, conversationId: conv?._id });
      } catch (err) {
        console.error("Socket send_message error:", err);
        if (callback) callback({ error: "Failed to send message via socket" });
      }
    });

    // 3. Typing Indicators (1-to-1)
    socket.on("typing_start", ({ senderId, receiverId, conversationId, senderName }) => {
      if (receiverId) {
        io.to(`user_${receiverId}`).emit("user_typing", {
          senderId,
          senderName,
          conversationId,
        });
      }
    });

    socket.on("typing_stop", ({ senderId, receiverId, conversationId }) => {
      if (receiverId) {
        io.to(`user_${receiverId}`).emit("user_stop_typing", {
          senderId,
          conversationId,
        });
      }
    });

    // 4. Mark Messages Read (1-to-1)
    socket.on("mark_messages_read", async ({ conversationId, userId, otherUserId }) => {
      if (!conversationId || !userId) return;
      try {
        await Message.updateMany(
          {
            conversationId,
            receiverId: String(userId),
            read: false,
          },
          {
            $set: { read: true, readAt: new Date() },
          }
        );

        const conv = await Conversation.findById(conversationId);
        if (conv && conv.unreadCounts) {
          conv.unreadCounts.set(String(userId), 0);
          await conv.save();
        }
      } catch (err) {}

      if (otherUserId) {
        io.to(`user_${otherUserId}`).emit("messages_read_receipt", {
          conversationId,
          readBy: userId,
          readAt: new Date(),
        });
      }
    });

    // 5. Message Deletion (1-to-1)
    socket.on("delete_message_event", async ({ messageId, conversationId, otherUserId, forEveryone }) => {
      if (forEveryone && otherUserId) {
        io.to(`user_${otherUserId}`).emit("message_deleted", {
          messageId,
          conversationId,
          forEveryone: true,
        });
      }
    });

    // ==========================================
    // 6. GROUP CHAT SOCKET EVENTS (PHASE 8)
    // ==========================================

    // Join Group Room
    socket.on("join_group_room", ({ groupId, userId, userName }) => {
      if (!groupId) return;
      socket.join(`group_${groupId}`);
      io.to(`group_${groupId}`).emit("group_member_active", {
        groupId,
        userId,
        userName,
      });
    });

    // Leave Group Room
    socket.on("leave_group_room", ({ groupId, userId }) => {
      if (!groupId) return;
      socket.leave(`group_${groupId}`);
    });

    // Send Real-Time Group Message
    socket.on("send_group_message", async (data, callback) => {
      try {
        const { groupId, senderId, senderName, senderAvatar, content } = data;
        if (!groupId || !senderId || !content?.trim()) {
          if (callback) callback({ error: "Invalid group message payload" });
          return;
        }

        let savedMsg = null;
        try {
          savedMsg = new GroupMessage({
            groupId,
            sender: senderId,
            senderName: senderName || "Solo Traveler",
            senderAvatar:
              senderAvatar ||
              "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
            content: content.trim(),
            timestamp: new Date(),
          });
          await savedMsg.save();

          // Update group's last activity
          await Group.findByIdAndUpdate(groupId, { lastActivity: new Date() });
        } catch (err) {
          savedMsg = {
            _id: "gm_" + Date.now(),
            groupId,
            sender: senderId,
            senderName: senderName || "Solo Traveler",
            senderAvatar:
              senderAvatar ||
              "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
            content: content.trim(),
            timestamp: new Date(),
          };
        }

        // Broadcast to everyone in group room
        io.to(`group_${groupId}`).emit("new_group_message", {
          groupId,
          message: savedMsg,
        });

        if (callback) callback({ success: true, message: savedMsg });
      } catch (err) {
        console.error("Error in send_group_message socket:", err);
        if (callback) callback({ error: "Failed to broadcast group message" });
      }
    });

    // Group Typing Indicator
    socket.on("group_typing_start", ({ groupId, userId, userName }) => {
      if (groupId) {
        socket.to(`group_${groupId}`).emit("group_user_typing", {
          groupId,
          userId,
          userName: userName || "Traveler",
        });
      }
    });

    socket.on("group_typing_stop", ({ groupId, userId }) => {
      if (groupId) {
        socket.to(`group_${groupId}`).emit("group_user_stop_typing", {
          groupId,
          userId,
        });
      }
    });

    // Group Message Deleted (by Admin or Author)
    socket.on("delete_group_message_event", ({ groupId, messageId, deletedBy }) => {
      if (groupId && messageId) {
        io.to(`group_${groupId}`).emit("group_message_deleted", {
          groupId,
          messageId,
          deletedBy,
        });
      }
    });

    // 7. Disconnect handling
    socket.on("disconnect", async () => {
      const uid = socketUserMap.get(socket.id);
      socketUserMap.delete(socket.id);

      if (uid && userSockets.has(uid)) {
        const set = userSockets.get(uid);
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(uid);

          const lastSeen = new Date();
          try {
            await User.findByIdAndUpdate(uid, { isOnline: false, lastSeen });
          } catch (err) {}

          io.emit("user_status_changed", { userId: uid, isOnline: false, lastSeen });
        }
      }
    });
  });

  return io;
};

const getIo = () => io;

const isUserOnline = (userId) => {
  if (!userId) return false;
  const uid = String(userId);
  return userSockets.has(uid) && userSockets.get(uid).size > 0;
};

module.exports = {
  initSocketServer,
  getIo,
  isUserOnline,
};
