import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import PrivacySettingsModal from "../components/PrivacySettingsModal";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Messages = () => {
  const { user, token } = useAuth();
  const {
    onlineUsers,
    latestMessage,
    typingUsers,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markMessagesRead
  } = useSocket();

  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [chatNotice, setChatNotice] = useState("");

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = user?._id || user?.id;

  // Auto-scroll to bottom of messages
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch all user conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingConversations(true);
      const res = await axios.get(`${API}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle URL search query ?conv=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const convId = params.get("conv");
    if (convId && conversations.length > 0) {
      const match = conversations.find((c) => String(c._id) === String(convId));
      if (match) {
        setActiveConversation(match);
      }
    } else if (conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]);
    }
  }, [location.search, conversations, activeConversation]);

  // Fetch messages for active conversation
  const fetchMessagesForActiveConv = useCallback(async (convId) => {
    if (!convId || !token) return;
    try {
      setLoadingMessages(true);
      const res = await axios.get(`${API}/api/chat/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setMessages(res.data.messages || []);
        setTimeout(() => scrollToBottom("auto"), 50);

        // Notify socket of read receipts
        const otherUser = activeConversation?.otherParticipant;
        const otherId = otherUser?._id || otherUser?.id;
        markMessagesRead({ conversationId: convId, otherUserId: otherId });
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [token, activeConversation, markMessagesRead]);

  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessagesForActiveConv(activeConversation._id);
    }
  }, [activeConversation?._id, fetchMessagesForActiveConv]);

  // Handle real-time incoming socket messages
  useEffect(() => {
    if (!latestMessage) return;

    const { message, conversationId } = latestMessage;

    // If message belongs to current active conversation, append it
    if (String(activeConversation?._id) === String(conversationId)) {
      setMessages((prev) => {
        const exists = prev.some((m) => String(m._id) === String(message._id));
        if (exists) return prev;
        return [...prev, message];
      });
      scrollToBottom("smooth");

      // Mark read
      const otherId = activeConversation?.otherParticipant?._id;
      markMessagesRead({ conversationId, otherUserId: otherId });
    }

    // Update conversation list lastMessage preview
    setConversations((prev) =>
      prev.map((c) => {
        if (String(c._id) === String(conversationId)) {
          return {
            ...c,
            lastMessage: {
              content: message.content,
              sender: message.senderId,
              timestamp: message.timestamp || new Date()
            },
            unreadCount:
              String(activeConversation?._id) === String(conversationId)
                ? 0
                : (c.unreadCount || 0) + 1,
            updatedAt: new Date()
          };
        }
        return c;
      })
    );
  }, [latestMessage, activeConversation, markMessagesRead]);

  // Handle Typing indicator
  const handleInputChange = (e) => {
    setNewMessageText(e.target.value);

    if (activeConversation) {
      const otherId =
        activeConversation.otherParticipant?._id ||
        activeConversation.otherParticipant?.id;
      startTyping({
        receiverId: otherId,
        conversationId: activeConversation._id,
        senderName: user?.name
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping({
          receiverId: otherId,
          conversationId: activeConversation._id
        });
      }, 1500);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() || !activeConversation) return;

    const otherUser = activeConversation.otherParticipant;
    const receiverId = otherUser?._id || otherUser?.id;
    const text = newMessageText.trim();
    setNewMessageText("");

    // Stop typing indicator
    stopTyping({
      receiverId,
      conversationId: activeConversation._id
    });

    const payload = {
      senderId: currentUserId,
      receiverId,
      content: text,
      conversationId: activeConversation._id
    };

    // Try Socket first
    socketSendMessage(payload, async (res) => {
      if (res?.error) {
        // Fallback to REST API
        try {
          const restRes = await axios.post(
            `${API}/api/chat/send`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (restRes.data?.success) {
            setMessages((prev) => [...prev, restRes.data.message]);
            scrollToBottom("smooth");
          }
        } catch (restErr) {
          const errMsg =
            restErr.response?.data?.error || "Failed to send message.";
          setChatNotice(errMsg);
          setTimeout(() => setChatNotice(""), 4000);
        }
      } else if (res?.message) {
        setMessages((prev) => [...prev, res.message]);
        scrollToBottom("smooth");
      }
    });
  };

  // Handle Delete Single Message
  const handleDeleteMessage = async (msgId, forEveryone = false) => {
    try {
      const res = await axios.delete(
        `${API}/api/chat/messages/${msgId}?forEveryone=${forEveryone}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        if (forEveryone) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === msgId
                ? { ...m, isDeleted: true, content: "This message was deleted" }
                : m
            )
          );
        } else {
          setMessages((prev) => prev.filter((m) => m._id !== msgId));
        }
      }
    } catch (err) {
      setChatNotice("Failed to delete message.");
      setTimeout(() => setChatNotice(""), 3000);
    }
  };

  // Handle Delete Entire Conversation
  const handleDeleteConversation = async () => {
    if (!activeConversation) return;
    if (!window.confirm("Are you sure you want to delete this entire conversation?")) return;

    try {
      const res = await axios.delete(
        `${API}/api/chat/conversations/${activeConversation._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setConversations((prev) =>
          prev.filter((c) => c._id !== activeConversation._id)
        );
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setChatNotice("Failed to delete conversation.");
      setTimeout(() => setChatNotice(""), 3000);
    }
  };

  // Handle Block user from chat
  const handleBlockActiveUser = async () => {
    if (!activeConversation) return;
    const otherUser = activeConversation.otherParticipant;
    const otherId = otherUser?._id || otherUser?.id;

    if (!window.confirm(`Block ${otherUser?.name}? You will no longer receive messages from them.`)) return;

    try {
      const res = await axios.post(
        `${API}/api/users/${otherId}/block`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setChatNotice(`${otherUser?.name} has been blocked.`);
        setTimeout(() => setChatNotice(""), 3000);
      }
    } catch (err) {
      setChatNotice("Failed to block user.");
      setTimeout(() => setChatNotice(""), 3000);
    }
  };

  // Filtered conversations
  const filteredConversations = conversations.filter((c) => {
    const name = c.otherParticipant?.name || "";
    const username = c.otherParticipant?.username || "";
    const q = searchFilter.toLowerCase();
    return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
  });

  const activeOtherUser = activeConversation?.otherParticipant;
  const isOtherUserOnline = activeOtherUser
    ? (onlineUsers[String(activeOtherUser._id || activeOtherUser.id)]?.isOnline ?? activeOtherUser.isOnline)
    : false;

  const isTyping = activeConversation
    ? !!typingUsers[activeConversation._id]
    : false;

  return (
    <div className="app-container">
      <Navbar />

      <div className={`messages-layout-container ${activeConversation ? "mobile-chat-open" : ""}`}>
        {/* Left Column: Conversations List */}
        <aside className="conversations-sidebar-pane">
          <div className="conversations-header">
            <div className="conversations-title-row">
              <h3>💬 Messages</h3>
              <button
                className="btn-privacy-settings-icon"
                onClick={() => setShowPrivacyModal(true)}
                title="Chat Privacy Settings"
              >
                ⚙️
              </button>
            </div>

            <div className="conv-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="conv-search-input"
              />
            </div>
          </div>

          <div className="conversations-scroll-list">
            {loadingConversations ? (
              <div className="conv-loading-state">
                <div className="spinner"></div>
                <p>Loading chats...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="conv-empty-state">
                <p>No conversations found.</p>
                <button
                  className="btn-discover-more"
                  onClick={() => navigate("/travelers")}
                >
                  👥 Discover Travelers
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = conv.otherParticipant || {};
                const otherId = other._id || other.id;
                const isSelected = activeConversation?._id === conv._id;
                const isOnline =
                  onlineUsers[String(otherId)]?.isOnline ?? other.isOnline;

                return (
                  <div
                    key={conv._id}
                    className={`conversation-item ${isSelected ? "active" : ""} ${conv.unreadCount > 0 ? "has-unread" : ""}`}
                    onClick={() => setActiveConversation(conv)}
                  >
                    <div className="conv-avatar-wrapper">
                      <img
                        src={
                          other.avatar ||
                          "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria"
                        }
                        alt={other.name || "Traveler"}
                        className="conv-avatar"
                      />
                      <span
                        className={`online-indicator-dot ${isOnline ? "online" : "offline"}`}
                      ></span>
                    </div>

                    <div className="conv-details">
                      <div className="conv-top-line">
                        <span className="conv-name">{other.name || "Traveler"}</span>
                        {conv.lastMessage?.timestamp && (
                          <span className="conv-time">
                            {new Date(conv.lastMessage.timestamp).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        )}
                      </div>

                      <div className="conv-bottom-line">
                        <span className="conv-snippet">
                          {conv.lastMessage?.content || "Started a conversation"}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="unread-count-badge">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Active Chat Area */}
        <section className="active-chat-pane">
          {activeConversation ? (
            <div className="chat-interface-wrapper">
              {/* Chat Header */}
              <div className="chat-header-bar">
                <div className="chat-recipient-info">
                  <button
                    className="btn-mobile-chat-back"
                    onClick={() => setActiveConversation(null)}
                    title="Back to conversations"
                  >
                    ←
                  </button>
                  <div className="recipient-avatar-wrapper">
                    <img
                      src={
                        activeOtherUser?.avatar ||
                        "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria"
                      }
                      alt={activeOtherUser?.name || "Traveler"}
                      className="recipient-avatar"
                    />
                    <span
                      className={`online-indicator-dot ${isOtherUserOnline ? "online" : "offline"}`}
                    ></span>
                  </div>

                  <div className="recipient-text-details">
                    <h4 className="recipient-name">
                      {activeOtherUser?.name || "Solo Traveler"}
                    </h4>
                    <span className="recipient-status-text">
                      {isOtherUserOnline ? "🟢 Online" : "⚪ Offline"}
                    </span>
                  </div>
                </div>

                {/* Header Action Menu */}
                <div className="chat-header-actions">
                  <button
                    className="btn-chat-action"
                    onClick={handleBlockActiveUser}
                    title="Block this user"
                  >
                    🚫 Block
                  </button>
                  <button
                    className="btn-chat-action danger"
                    onClick={handleDeleteConversation}
                    title="Delete conversation"
                  >
                    🗑️ Delete Chat
                  </button>
                </div>
              </div>

              {/* Chat Alert Banner */}
              {chatNotice && (
                <div className="chat-notice-alert">
                  <span>⚠️ {chatNotice}</span>
                </div>
              )}

              {/* Message Thread Body */}
              <div className="chat-messages-container">
                {loadingMessages ? (
                  <div className="messages-loading">
                    <div className="spinner"></div>
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="messages-empty-state">
                    <span className="empty-chat-icon">👋</span>
                    <h5>Start the conversation</h5>
                    <p>
                      Say hello to {activeOtherUser?.name || "this traveler"} and plan your journey together!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine =
                      String(msg.sender) === String(currentUserId) ||
                      String(msg.senderId) === String(currentUserId);

                    return (
                      <div
                        key={msg._id || idx}
                        className={`message-bubble-row ${isMine ? "outgoing" : "incoming"}`}
                      >
                        <div
                          className={`message-bubble ${isMine ? "mine" : "theirs"} ${msg.isDeleted ? "deleted" : ""}`}
                        >
                          <p className="message-text">{msg.content}</p>

                          <div className="message-meta-row">
                            <span className="message-timestamp">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                            {isMine && !msg.isDeleted && (
                              <span
                                className={`read-tick-status ${msg.read ? "read" : "sent"}`}
                                title={msg.read ? "Read" : "Sent"}
                              >
                                {msg.read ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>

                          {/* Message Context Options */}
                          {!msg.isDeleted && (
                            <div className="message-context-actions">
                              {isMine && (
                                <button
                                  className="btn-msg-action"
                                  onClick={() => handleDeleteMessage(msg._id, true)}
                                  title="Delete for everyone"
                                >
                                  🗑️
                                </button>
                              )}
                              <button
                                className="btn-msg-action"
                                onClick={() => handleDeleteMessage(msg._id, false)}
                                title="Delete for me"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Real-time typing bubble */}
                {isTyping && (
                  <div className="typing-indicator-bubble">
                    <span>{activeOtherUser?.name || "Traveler"} is typing</span>
                    <span className="dot-pulse"></span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="chat-input-bar">
                <input
                  type="text"
                  placeholder={`Message ${activeOtherUser?.name || "traveler"}...`}
                  value={newMessageText}
                  onChange={handleInputChange}
                  className="chat-text-input"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim()}
                  className="btn-chat-send"
                >
                  🚀 Send
                </button>
              </form>
            </div>
          ) : (
            <div className="no-active-chat-state">
              <span className="select-chat-icon">💬</span>
              <h3>Your SoloTravel Messages</h3>
              <p>
                Select a conversation on the left or discover fellow travelers across India to start chatting.
              </p>
              <button
                className="btn-go-discover"
                onClick={() => navigate("/travelers")}
              >
                👥 Find Solo Travelers
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        token={token}
      />
    </div>
  );
};

export default Messages;
