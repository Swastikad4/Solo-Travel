import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import PrivacySettingsModal from "../components/PrivacySettingsModal";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const POPULAR_INTERESTS = [
  "All",
  "Trekking",
  "Photography",
  "Heritage & Culture",
  "Street Food",
  "Yoga & Wellness",
  "Backpacking",
  "Wildlife"
];

const POPULAR_DESTINATIONS = [
  "All",
  "Himachal Pradesh",
  "Rajasthan",
  "Kerala",
  "Goa",
  "Uttarakhand",
  "Ladakh",
  "Karnataka"
];

const TRAVEL_STYLES = [
  "All",
  "Budget Backpacker",
  "Slow Nomad",
  "Adventure Seeker",
  "Cultural Explorer",
  "Luxury Solivagant",
  "Weekend Wanderer"
];

const DiscoverTravelers = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("All");
  const [selectedDestination, setSelectedDestination] = useState("All");
  const [selectedStyle, setSelectedStyle] = useState("All");

  // Profile modal & Report modal states
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [reportTargetUser, setReportTargetUser] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  const currentUserId = user?._id || user?.id;

  const fetchTravelers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      if (selectedInterest !== "All") params.append("interest", selectedInterest);
      if (selectedDestination !== "All") params.append("destination", selectedDestination);
      if (selectedStyle !== "All") params.append("style", selectedStyle);
      if (currentUserId) params.append("currentUserId", currentUserId);

      const res = await axios.get(`${API}/api/users/discover?${params.toString()}`);
      if (res.data?.success) {
        setTravelers(res.data.travelers || []);
      }
    } catch (err) {
      console.error("Failed to fetch travelers:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedInterest, selectedDestination, selectedStyle, currentUserId]);

  useEffect(() => {
    fetchTravelers();
  }, [fetchTravelers]);

  // Handle Start Conversation / Message
  const handleStartMessage = async (targetUser) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const targetId = targetUser._id || targetUser.id;
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
      const errMsg = err.response?.data?.error || "Unable to start conversation.";
      setActionNotice(errMsg);
      setTimeout(() => setActionNotice(""), 4000);
    }
  };

  // Handle Block Traveler
  const handleBlockUser = async (targetId, targetName) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!window.confirm(`Are you sure you want to block ${targetName}? They will no longer be able to message you.`)) {
      return;
    }

    try {
      const res = await axios.post(
        `${API}/api/users/${targetId}/block`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setTravelers((prev) => prev.filter((t) => (t._id || t.id) !== targetId));
        setActionNotice(`${targetName} has been blocked.`);
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch (err) {
      setActionNotice(err.response?.data?.error || "Failed to block user.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Handle Submit Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportTargetUser) return;
    try {
      const targetId = reportTargetUser._id || reportTargetUser.id;
      const res = await axios.post(
        `${API}/api/users/${targetId}/report`,
        { reason: reportReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setActionNotice("Report submitted to Trust & Safety team. Thank you for keeping our community safe.");
        setTimeout(() => setActionNotice(""), 4000);
        setReportTargetUser(null);
        setReportReason("");
      }
    } catch (err) {
      setActionNotice("Failed to submit report.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // View Detailed Profile Modal
  const handleViewProfile = async (targetUser) => {
    const targetId = targetUser._id || targetUser.id;
    try {
      const res = await axios.get(`${API}/api/users/${targetId}/profile`);
      if (res.data?.success) {
        setSelectedProfile(res.data.profile);
        setShowProfileModal(true);
      }
    } catch (err) {
      setSelectedProfile(targetUser);
      setShowProfileModal(true);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="discover-page-wrapper">
        {/* Hero Header */}
        <section className="discover-hero-header">
          <div className="discover-hero-badge">🤝 Solo Traveler Community</div>
          <h1 className="discover-hero-title">Discover Fellow Solo Travelers</h1>
          <p className="discover-hero-subtitle">
            Connect with verified solo wanderers, backpackers, and adventurers traveling across India.
          </p>

          {/* Search & Action Bar */}
          <div className="discover-search-box-card">
            <div className="search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, username, interests (e.g. Trekking, Photography) or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="discover-search-input"
              />
              {searchQuery && (
                <button
                  className="btn-clear-search"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            {isAuthenticated && (
              <button
                className="btn-open-privacy"
                onClick={() => setShowPrivacyModal(true)}
                title="Manage who can message you"
              >
                🛡️ Chat Privacy Settings
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="discover-filters-container">
            <div className="filter-group-row">
              <span className="filter-label">🎯 Interests:</span>
              <div className="filter-chips-list">
                {POPULAR_INTERESTS.map((int) => (
                  <button
                    key={int}
                    className={`filter-chip ${selectedInterest === int ? "active" : ""}`}
                    onClick={() => setSelectedInterest(int)}
                  >
                    {int}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group-row">
              <span className="filter-label">📍 Destination:</span>
              <div className="filter-chips-list">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest}
                    className={`filter-chip ${selectedDestination === dest ? "active" : ""}`}
                    onClick={() => setSelectedDestination(dest)}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group-row">
              <span className="filter-label">🎒 Style:</span>
              <div className="filter-chips-list">
                {TRAVEL_STYLES.map((st) => (
                  <button
                    key={st}
                    className={`filter-chip ${selectedStyle === st ? "active" : ""}`}
                    onClick={() => setSelectedStyle(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Global Action / Error Notification */}
        {actionNotice && (
          <div className="discover-action-banner">
            <span>ℹ️ {actionNotice}</span>
          </div>
        )}

        {/* Travelers Grid */}
        <section className="discover-results-section">
          <div className="results-header-row">
            <h3>Travelers in India ({travelers.length})</h3>
            <span className="results-badge">Verified Solo Travelers</span>
          </div>

          {loading ? (
            <div className="discover-loading-state">
              <div className="spinner"></div>
              <p>Finding solo travelers near your interests...</p>
            </div>
          ) : travelers.length === 0 ? (
            <div className="discover-empty-state">
              <div className="empty-icon">🎒</div>
              <h4>No travelers found matching your criteria</h4>
              <p>Try clearing some search filters or exploring all interests.</p>
              <button
                className="btn-reset-filters"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedInterest("All");
                  setSelectedDestination("All");
                  setSelectedStyle("All");
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="travelers-card-grid">
              {travelers.map((traveler) => {
                const tid = traveler._id || traveler.id;
                const isLiveOnline =
                  onlineUsers[String(tid)]?.isOnline ?? traveler.isOnline;

                return (
                  <div key={tid} className="traveler-card">
                    {/* Top row: Avatar + Online Badge + Style */}
                    <div className="traveler-card-header">
                      <div className="avatar-wrapper">
                        <img
                          src={
                            traveler.avatar ||
                            "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria"
                          }
                          alt={traveler.name}
                          className="traveler-avatar"
                        />
                        <span
                          className={`online-status-dot ${isLiveOnline ? "online" : "offline"}`}
                          title={isLiveOnline ? "Online now" : "Offline"}
                        ></span>
                      </div>

                      <div className="traveler-meta">
                        <h4 className="traveler-name">{traveler.name}</h4>
                        {traveler.username && (
                          <span className="traveler-handle">
                            @{traveler.username}
                          </span>
                        )}
                        <span className="travel-style-pill">
                          🎒 {traveler.travelStyle || "Cultural Explorer"}
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="traveler-bio">
                      {traveler.bio ||
                        "Solo travel enthusiast exploring heritage trails and local culture across India."}
                    </p>

                    {/* Interests tags */}
                    {traveler.travelInterests && traveler.travelInterests.length > 0 && (
                      <div className="traveler-interests-tags">
                        {traveler.travelInterests.slice(0, 4).map((interest, i) => (
                          <span key={i} className="interest-tag">
                            #{interest}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Upcoming Trips Preview */}
                    {traveler.upcomingTrips && traveler.upcomingTrips.length > 0 && (
                      <div className="traveler-upcoming-trips-preview">
                        <span className="preview-label">🗓️ Upcoming Trip:</span>
                        <span className="preview-trip-name">
                          {traveler.upcomingTrips[0].destination ||
                            traveler.upcomingTrips[0].title}
                        </span>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="traveler-card-actions">
                      <button
                        className="btn-traveler-message"
                        onClick={() => handleStartMessage(traveler)}
                      >
                        💬 Message
                      </button>

                      <button
                        className="btn-traveler-profile"
                        onClick={() => handleViewProfile(traveler)}
                      >
                        👤 Profile
                      </button>

                      <div className="card-more-menu">
                        <button
                          className="btn-traveler-block"
                          title="Block traveler"
                          onClick={() => handleBlockUser(tid, traveler.name)}
                        >
                          🚫
                        </button>
                        <button
                          className="btn-traveler-report"
                          title="Report traveler"
                          onClick={() => setReportTargetUser(traveler)}
                        >
                          ⚠️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Detailed Traveler Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="traveler-profile-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn-modal-close"
              onClick={() => setShowProfileModal(false)}
            >
              ✕
            </button>

            <div className="modal-profile-header">
              <img
                src={
                  selectedProfile.avatar ||
                  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria"
                }
                alt={selectedProfile.name}
                className="modal-avatar"
              />
              <div>
                <h2>{selectedProfile.name}</h2>
                {selectedProfile.username && (
                  <p className="modal-handle">@{selectedProfile.username}</p>
                )}
                <span className="modal-style-badge">
                  🎒 {selectedProfile.travelStyle || "Cultural Explorer"}
                </span>
              </div>
            </div>

            <div className="modal-profile-body">
              <div className="profile-section">
                <h5>About</h5>
                <p className="profile-bio-text">
                  {selectedProfile.bio ||
                    "Solo traveler looking to connect with fellow explorers in India."}
                </p>
              </div>

              <div className="profile-section">
                <h5>Travel Interests</h5>
                <div className="interests-pill-list">
                  {selectedProfile.travelInterests?.map((item, idx) => (
                    <span key={idx} className="modal-pill">
                      ✨ {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="profile-section">
                <h5>Preferred Destinations in India</h5>
                <div className="destinations-pill-list">
                  {selectedProfile.preferredDestinations?.map((dest, idx) => (
                    <span key={idx} className="modal-pill dest">
                      📍 {dest}
                    </span>
                  ))}
                </div>
              </div>

              {selectedProfile.upcomingTrips &&
                selectedProfile.upcomingTrips.length > 0 && (
                  <div className="profile-section">
                    <h5>Upcoming Public Trips</h5>
                    <div className="modal-trips-list">
                      {selectedProfile.upcomingTrips.map((trip, idx) => (
                        <div key={idx} className="modal-trip-item">
                          <span className="trip-pin">🗺️</span>
                          <div>
                            <h6>{trip.destination || trip.title}</h6>
                            <p>
                              {trip.durationDays} Days • Starts {trip.startDate}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="modal-profile-footer">
              <button
                className="btn-modal-start-chat"
                onClick={() => {
                  setShowProfileModal(false);
                  handleStartMessage(selectedProfile);
                }}
              >
                💬 Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportTargetUser && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => setReportTargetUser(null)}
        >
          <div className="report-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <h4>⚠️ Report Traveler</h4>
              <button
                className="btn-modal-close"
                onClick={() => setReportTargetUser(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="report-form">
              <p>
                Reporting traveler: <strong>{reportTargetUser.name}</strong>
              </p>
              <label>Reason for reporting:</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                required
                className="report-reason-select"
              >
                <option value="">Select a reason</option>
                <option value="Spam / Unsolicited advertising">
                  Spam / Unsolicited advertising
                </option>
                <option value="Harassment or inappropriate behavior">
                  Harassment or inappropriate behavior
                </option>
                <option value="Fake profile or impersonation">
                  Fake profile or impersonation
                </option>
                <option value="Safety concern or scam">
                  Safety concern or scam
                </option>
              </select>

              <div className="report-form-actions">
                <button
                  type="button"
                  className="btn-cancel-report"
                  onClick={() => setReportTargetUser(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit-report">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        token={token}
      />
    </div>
  );
};

export default DiscoverTravelers;
