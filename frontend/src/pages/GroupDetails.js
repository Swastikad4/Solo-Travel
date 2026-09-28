import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GroupDetails = () => {
  const { id: groupId } = useParams();
  const { user, token, isAuthenticated } = useAuth();
  const {
    joinGroupRoom,
    leaveGroupRoom,
    sendGroupMessage: socketSendGroupMessage,
    sendGroupTyping,
    sendGroupStopTyping,
    deleteGroupMessage: socketDeleteGroupMessage,
    latestGroupMessage,
    groupTypingUsers,
    deletedGroupMessageId,
  } = useSocket();

  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit group form fields
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDest, setEditDest] = useState("");
  const [editCover, setEditCover] = useState("");

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = user?._id || user?.id;

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch Group Data
  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/groups/${groupId}`);
      if (res.data?.success) {
        setGroup(res.data.group);
        setEditName(res.data.group.name);
        setEditDesc(res.data.group.description);
        setEditDest(res.data.group.destination);
        setEditCover(res.data.group.coverImage);
      }
    } catch (err) {
      console.error("Failed to load group details:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // Fetch Group Messages
  const fetchGroupMessages = useCallback(async () => {
    try {
      setLoadingMessages(true);
      const res = await axios.get(`${API}/api/groups/${groupId}/messages`);
      if (res.data?.success) {
        setMessages(res.data.messages || []);
        setTimeout(() => scrollToBottom("auto"), 50);
      }
    } catch (err) {
      console.error("Failed to load group messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupDetails();
    fetchGroupMessages();
  }, [fetchGroupDetails, fetchGroupMessages]);

  // Join & Leave Socket Room for this Group
  useEffect(() => {
    if (groupId) {
      joinGroupRoom(groupId);
    }
    return () => {
      if (groupId) {
        leaveGroupRoom(groupId);
      }
    };
  }, [groupId, joinGroupRoom, leaveGroupRoom]);

  // Listen for real-time incoming group messages
  useEffect(() => {
    if (
      latestGroupMessage &&
      String(latestGroupMessage.groupId) === String(groupId)
    ) {
      setMessages((prev) => {
        const exists = prev.some(
          (m) => String(m._id) === String(latestGroupMessage.message._id)
        );
        if (exists) return prev;
        return [...prev, latestGroupMessage.message];
      });
      scrollToBottom("smooth");
    }
  }, [latestGroupMessage, groupId]);

  // Listen for real-time deleted group messages
  useEffect(() => {
    if (deletedGroupMessageId) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === deletedGroupMessageId
            ? {
                ...m,
                isDeleted: true,
                content: "This message was deleted by a group moderator.",
              }
            : m
        )
      );
    }
  }, [deletedGroupMessageId]);

  // Handle Input & Typing
  const handleInputChange = (e) => {
    setNewMessageText(e.target.value);
    sendGroupTyping(groupId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendGroupStopTyping(groupId);
    }, 1500);
  };

  // Send Group Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !isAuthenticated) return;

    const content = newMessageText.trim();
    setNewMessageText("");
    sendGroupStopTyping(groupId);

    const payload = {
      groupId,
      senderId: currentUserId,
      senderName: user?.name,
      senderAvatar: user?.avatar,
      content,
    };

    // Try Socket first
    socketSendGroupMessage(payload, async (res) => {
      if (res?.error) {
        // Fallback to REST API
        try {
          const restRes = await axios.post(
            `${API}/api/groups/${groupId}/messages`,
            { content },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (restRes.data?.success) {
            setMessages((prev) => [...prev, restRes.data.message]);
            scrollToBottom("smooth");
          }
        } catch (restErr) {
          setActionNotice("Failed to send message.");
          setTimeout(() => setActionNotice(""), 3000);
        }
      } else if (res?.message) {
        setMessages((prev) => [...prev, res.message]);
        scrollToBottom("smooth");
      }
    });
  };

  // Delete Group Message (Admins or Author)
  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await axios.delete(
        `${API}/api/groups/${groupId}/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        socketDeleteGroupMessage(groupId, messageId);
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? {
                  ...m,
                  isDeleted: true,
                  content: "This message was deleted by a group moderator.",
                }
              : m
          )
        );
      }
    } catch (err) {
      setActionNotice(err.response?.data?.error || "Failed to delete message.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Join Group
  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post(
        `${API}/api/groups/${groupId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setActionNotice("You joined the group!");
        setTimeout(() => setActionNotice(""), 3000);
        fetchGroupDetails();
      }
    } catch (err) {
      setActionNotice("Failed to join group.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Leave Group
  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this travel group?"))
      return;
    try {
      const res = await axios.post(
        `${API}/api/groups/${groupId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setActionNotice("You left the group.");
        setTimeout(() => setActionNotice(""), 3000);
        fetchGroupDetails();
      }
    } catch (err) {
      setActionNotice("Failed to leave group.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Kick Member (Admin Only)
  const handleKickMember = async (memberId, memberName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${memberName} from this group?`
      )
    )
      return;
    try {
      const res = await axios.post(
        `${API}/api/groups/${groupId}/remove-member`,
        { memberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setActionNotice(`${memberName} has been removed from the group.`);
        setTimeout(() => setActionNotice(""), 3000);
        fetchGroupDetails();
      }
    } catch (err) {
      setActionNotice(err.response?.data?.error || "Failed to remove member.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Direct Message member
  const handleDirectMessage = async (targetId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post(
        `${API}/api/chat/start-or-get`,
        { recipientId: targetId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        navigate(`/messages?conv=${res.data.conversation?._id}`);
      }
    } catch (err) {
      setActionNotice("Unable to start direct message.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Save Group Edits
  const handleSaveEditGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${API}/api/groups/${groupId}`,
        {
          name: editName,
          description: editDesc,
          destination: editDest,
          coverImage: editCover,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setShowEditModal(false);
        setActionNotice("Group settings updated.");
        setTimeout(() => setActionNotice(""), 3000);
        fetchGroupDetails();
      }
    } catch (err) {
      setActionNotice(err.response?.data?.error || "Failed to update group.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Delete Group
  const handleDeleteGroup = async () => {
    if (
      !window.confirm(
        "⚠️ DANGER: Are you sure you want to permanently delete this travel group? This action cannot be undone."
      )
    )
      return;
    try {
      const res = await axios.delete(`${API}/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        navigate("/groups");
      }
    } catch (err) {
      setActionNotice("Failed to delete group.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="group-loading-state">
          <div className="spinner"></div>
          <p>Loading travel group community...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="group-not-found">
          <h2>Travel Group Not Found</h2>
          <button className="btn-back-groups" onClick={() => navigate("/groups")}>
            ← Back to Travel Groups
          </button>
        </div>
      </div>
    );
  }

  const isMember =
    currentUserId &&
    group.members?.some(
      (m) => String(m._id || m.id || m) === String(currentUserId)
    );

  const isAdmin =
    currentUserId &&
    (String(group.creator?._id || group.creator) === String(currentUserId) ||
      group.admins?.some(
        (a) => String(a._id || a.id || a) === String(currentUserId)
      ));

  const isTyping = !!groupTypingUsers[groupId];

  return (
    <div className="app-container">
      <Navbar />

      <main className="group-details-wrapper">
        {/* Group Hero Header */}
        <section
          className="group-hero-banner"
          style={{ backgroundImage: `url(${group.coverImage})` }}
        >
          <div className="group-hero-overlay">
            <div className="group-hero-top-nav">
              <button
                className="btn-hero-back"
                onClick={() => navigate("/groups")}
              >
                ← All Groups
              </button>
              <div className="group-hero-admin-actions">
                {isAdmin && (
                  <>
                    <button
                      className="btn-admin-edit"
                      onClick={() => setShowEditModal(true)}
                    >
                      ⚙️ Edit Group
                    </button>
                    <button
                      className="btn-admin-delete"
                      onClick={handleDeleteGroup}
                    >
                      🗑️ Disband Group
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="group-hero-main-content">
              <div className="group-hero-meta-badges">
                <span className="badge-dest">📍 {group.destination}</span>
                <span className="badge-cat">🎒 {group.category}</span>
                <span className="badge-members">
                  👥 {group.members?.length || group.memberCount || 1} Solo Travelers
                </span>
              </div>

              <h1 className="group-hero-title">{group.name}</h1>
              <p className="group-hero-desc">{group.description}</p>

              <div className="group-hero-join-cta">
                {isMember ? (
                  <button className="btn-leave-group" onClick={handleLeave}>
                    ✓ Joined • Leave Group
                  </button>
                ) : (
                  <button className="btn-join-group-hero" onClick={handleJoin}>
                    🎒 Join Group Community
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Global Action Banner */}
        {actionNotice && (
          <div className="group-action-banner">
            <span>ℹ️ {actionNotice}</span>
          </div>
        )}

        {/* Studio Split Layout */}
        <div className="group-studio-layout">
          {/* Main Area: Real-Time Group Chatroom */}
          <section className="group-chat-pane">
            <div className="group-chat-header">
              <div className="chat-room-title">
                <span className="room-icon">💬</span>
                <div>
                  <h4>Live Group Chatroom</h4>
                  <p>Real-time updates, coordination & questions</p>
                </div>
              </div>
              <span className="live-pill">🔴 LIVE</span>
            </div>

            {/* Message Stream */}
            <div className="group-messages-container">
              {loadingMessages ? (
                <div className="messages-loading">
                  <div className="spinner"></div>
                  <p>Loading community messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="messages-empty-state">
                  <span className="empty-chat-icon">👋</span>
                  <h5>Welcome to {group.name}!</h5>
                  <p>
                    Be the first to post a greeting, ask a question, or share an Indian travel recommendation.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine =
                    String(msg.sender?._id || msg.sender) ===
                    String(currentUserId);
                  const isSenderAdmin =
                    String(group.creator?._id || group.creator) ===
                      String(msg.sender?._id || msg.sender) ||
                    group.admins?.some(
                      (a) =>
                        String(a._id || a.id || a) ===
                        String(msg.sender?._id || msg.sender)
                    );

                  return (
                    <div
                      key={msg._id || idx}
                      className={`group-message-row ${isMine ? "outgoing" : "incoming"}`}
                    >
                      {!isMine && (
                        <img
                          src={
                            msg.senderAvatar ||
                            "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria"
                          }
                          alt={msg.senderName}
                          className="msg-sender-avatar"
                        />
                      )}

                      <div
                        className={`group-message-bubble ${isMine ? "mine" : "theirs"} ${msg.isDeleted ? "deleted" : ""}`}
                      >
                        {!isMine && (
                          <div className="msg-sender-name-row">
                            <span className="msg-sender-name">
                              {msg.senderName}
                            </span>
                            {isSenderAdmin && (
                              <span className="msg-admin-crown" title="Group Admin">
                                👑 Admin
                              </span>
                            )}
                          </div>
                        )}

                        <p className="msg-text-content">{msg.content}</p>

                        <div className="msg-bottom-meta">
                          <span className="msg-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Delete Action (Admin or Author) */}
                        {!msg.isDeleted && (isAdmin || isMine) && (
                          <div className="msg-hover-actions">
                            <button
                              className="btn-del-msg"
                              onClick={() => handleDeleteMessage(msg._id)}
                              title="Delete message"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="typing-indicator-bubble">
                  <span>{groupTypingUsers[groupId]} is typing</span>
                  <span className="dot-pulse"></span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            {isMember ? (
              <form onSubmit={handleSendMessage} className="group-chat-input-bar">
                <input
                  type="text"
                  placeholder={`Post message to ${group.name}...`}
                  value={newMessageText}
                  onChange={handleInputChange}
                  className="group-text-input"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim()}
                  className="btn-group-send"
                >
                  🚀 Send
                </button>
              </form>
            ) : (
              <div className="group-chat-join-prompt">
                <p>🔒 Join {group.name} to participate in the live group chat</p>
                <button className="btn-join-to-chat" onClick={handleJoin}>
                  🎒 Join Group
                </button>
              </div>
            )}
          </section>

          {/* Right Sidebar: Guidelines & Member Directory */}
          <aside className="group-sidebar-pane">
            {/* Rules Section */}
            <div className="sidebar-card">
              <h5 className="sidebar-card-title">📜 Community Guidelines</h5>
              <ul className="group-rules-list">
                {group.rules?.map((rule, idx) => (
                  <li key={idx} className="rule-item">
                    <span>•</span> {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Members Directory */}
            <div className="sidebar-card members-card">
              <div className="members-header-row">
                <h5 className="sidebar-card-title">
                  👥 Group Members ({group.members?.length || 1})
                </h5>
              </div>

              <div className="group-members-list">
                {group.members?.map((member, idx) => {
                  const mid = member._id || member.id || member;
                  const memberName = member.name || "Solo Traveler";
                  const isMemberAdmin =
                    String(group.creator?._id || group.creator) ===
                      String(mid) ||
                    group.admins?.some(
                      (a) => String(a._id || a.id || a) === String(mid)
                    );
                  const isMe = String(mid) === String(currentUserId);

                  return (
                    <div key={idx} className="group-member-item">
                      <div className="member-avatar-info">
                        <img
                          src={
                            member.avatar ||
                            "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria"
                          }
                          alt={memberName}
                          className="member-avatar"
                        />
                        <div className="member-names">
                          <div className="member-name-row">
                            <span className="member-name">{memberName}</span>
                            {isMe && <span className="me-badge">You</span>}
                            {isMemberAdmin && (
                              <span className="admin-tag">👑 Admin</span>
                            )}
                          </div>
                          {member.travelStyle && (
                            <span className="member-style">
                              {member.travelStyle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {!isMe && (
                        <div className="member-actions">
                          <button
                            className="btn-dm-member"
                            onClick={() => handleDirectMessage(mid)}
                            title={`Direct message ${memberName}`}
                          >
                            💬
                          </button>
                          {isAdmin && !isMemberAdmin && (
                            <button
                              className="btn-kick-member"
                              onClick={() => handleKickMember(mid, memberName)}
                              title={`Remove ${memberName} from group`}
                            >
                              🚫
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Edit Group Modal */}
      {showEditModal && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="create-group-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3>⚙️ Edit Group Settings</h3>
              <button
                className="btn-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditGroup} className="create-group-form">
              <div className="form-group">
                <label>Group Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="modal-form-input"
                />
              </div>

              <div className="form-group">
                <label>Destination *</label>
                <input
                  type="text"
                  value={editDest}
                  onChange={(e) => setEditDest(e.target.value)}
                  required
                  className="modal-form-input"
                />
              </div>

              <div className="form-group">
                <label>Group Description *</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                  rows={3}
                  className="modal-form-textarea"
                />
              </div>

              <div className="form-group">
                <label>Cover Photo URL</label>
                <input
                  type="url"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  className="modal-form-input"
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit-create-group">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
