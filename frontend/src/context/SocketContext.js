import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({}); // userId -> { isOnline: Boolean, lastSeen: Date }
  const [latestMessage, setLatestMessage] = useState(null);
  const [latestGroupMessage, setLatestGroupMessage] = useState(null);
  const [typingUsers, setTypingUsers] = useState({}); // conversationId -> senderName
  const [groupTypingUsers, setGroupTypingUsers] = useState({}); // groupId -> userName
  const [deletedGroupMessageId, setDeletedGroupMessageId] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const currentUserId = user._id || user.id;

    // Connect to Socket.IO server
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 Socket connected:", newSocket.id);
      newSocket.emit("register_user", { userId: currentUserId });
    });

    newSocket.on("user_status_changed", ({ userId, isOnline, lastSeen }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [String(userId)]: { isOnline, lastSeen },
      }));
    });

    // 1-to-1 message events
    newSocket.on("new_message", (data) => {
      setLatestMessage(data);
    });

    newSocket.on("user_typing", ({ senderId, senderName, conversationId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: senderName || "Traveler",
      }));
    });

    newSocket.on("user_stop_typing", ({ conversationId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    });

    // Group message events
    newSocket.on("new_group_message", (data) => {
      setLatestGroupMessage(data);
    });

    newSocket.on("group_user_typing", ({ groupId, userName }) => {
      setGroupTypingUsers((prev) => ({
        ...prev,
        [groupId]: userName || "Traveler",
      }));
    });

    newSocket.on("group_user_stop_typing", ({ groupId }) => {
      setGroupTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[groupId];
        return updated;
      });
    });

    newSocket.on("group_message_deleted", ({ messageId }) => {
      setDeletedGroupMessageId(messageId);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  // 1-to-1 Chat Helpers
  const sendMessage = (payload, callback) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_message", payload, callback);
    } else {
      if (callback) callback({ error: "Socket not connected" });
    }
  };

  const startTyping = ({ receiverId, conversationId, senderName }) => {
    if (socketRef.current && user) {
      socketRef.current.emit("typing_start", {
        senderId: user._id || user.id,
        receiverId,
        conversationId,
        senderName: senderName || user.name,
      });
    }
  };

  const stopTyping = ({ receiverId, conversationId }) => {
    if (socketRef.current && user) {
      socketRef.current.emit("typing_stop", {
        senderId: user._id || user.id,
        receiverId,
        conversationId,
      });
    }
  };

  const markMessagesRead = ({ conversationId, otherUserId }) => {
    if (socketRef.current && user) {
      socketRef.current.emit("mark_messages_read", {
        conversationId,
        userId: user._id || user.id,
        otherUserId,
      });
    }
  };

  // Group Chat Helpers
  const joinGroupRoom = (groupId) => {
    if (socketRef.current && user) {
      socketRef.current.emit("join_group_room", {
        groupId,
        userId: user._id || user.id,
        userName: user.name,
      });
    }
  };

  const leaveGroupRoom = (groupId) => {
    if (socketRef.current && user) {
      socketRef.current.emit("leave_group_room", {
        groupId,
        userId: user._id || user.id,
      });
    }
  };

  const sendGroupMessage = (payload, callback) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_group_message", payload, callback);
    } else {
      if (callback) callback({ error: "Socket not connected" });
    }
  };

  const sendGroupTyping = (groupId) => {
    if (socketRef.current && user) {
      socketRef.current.emit("group_typing_start", {
        groupId,
        userId: user._id || user.id,
        userName: user.name,
      });
    }
  };

  const sendGroupStopTyping = (groupId) => {
    if (socketRef.current && user) {
      socketRef.current.emit("group_typing_stop", {
        groupId,
        userId: user._id || user.id,
      });
    }
  };

  const deleteGroupMessage = (groupId, messageId) => {
    if (socketRef.current && user) {
      socketRef.current.emit("delete_group_message_event", {
        groupId,
        messageId,
        deletedBy: user._id || user.id,
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        latestMessage,
        latestGroupMessage,
        typingUsers,
        groupTypingUsers,
        deletedGroupMessageId,
        sendMessage,
        startTyping,
        stopTyping,
        markMessagesRead,
        joinGroupRoom,
        leaveGroupRoom,
        sendGroupMessage,
        sendGroupTyping,
        sendGroupStopTyping,
        deleteGroupMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext) || {};
};

export default SocketContext;
