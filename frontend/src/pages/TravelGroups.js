import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CATEGORIES = [
  "All",
  "Backpacking",
  "Trekking",
  "Beach & Chill",
  "Heritage & Culture",
  "Wildlife & Nature",
  "Road Trips",
];

const PRESET_COVERS = [
  {
    name: "Goa Beach",
    url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
  },
  {
    name: "Himalayas / Manali",
    url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
  },
  {
    name: "Kerala Backwaters",
    url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
  },
  {
    name: "Rajasthan Fort",
    url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
  },
  {
    name: "Madhya Pradesh Tiger Safari",
    url: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800",
  },
];

const TravelGroups = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterMode, setFilterMode] = useState("all"); // 'all' or 'my_groups'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  // Create group form state
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState("Backpacking");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const currentUserId = user?._id || user?.id;

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      if (selectedCategory !== "All") params.append("category", selectedCategory);

      const res = await axios.get(`${API}/api/groups?${params.toString()}`);
      if (res.data?.success) {
        setGroups(res.data.groups || []);
      }
    } catch (err) {
      console.error("Failed to load groups:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Join group handler
  const handleJoinGroup = async (groupId, groupName) => {
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
        setActionNotice(`You joined ${groupName}!`);
        setTimeout(() => setActionNotice(""), 3000);
        fetchGroups();
      }
    } catch (err) {
      setActionNotice("Failed to join group.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Create Group submission
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setCreating(true);
    setCreateError("");

    try {
      const res = await axios.post(
        `${API}/api/groups`,
        { name, destination, category, description, coverImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setShowCreateModal(false);
        setName("");
        setDestination("");
        setDescription("");
        navigate(`/groups/${res.data.group._id}`);
      }
    } catch (err) {
      setCreateError(
        err.response?.data?.error || "Failed to create travel group."
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredGroups = groups.filter((g) => {
    if (filterMode === "my_groups") {
      if (!currentUserId) return false;
      const isMember = g.members?.some(
        (m) => String(m._id || m.id || m) === String(currentUserId)
      );
      return isMember;
    }
    return true;
  });

  return (
    <div className="app-container">
      <Navbar />

      <main className="groups-page-wrapper">
        {/* Hero Header */}
        <section className="groups-hero-header">
          <div className="groups-hero-badge">🏔️ Bharat Travel Communities</div>
          <h1 className="groups-hero-title">Indian Solo Travel Groups</h1>
          <p className="groups-hero-subtitle">
            Join region-based travel groups across India. Chat in real-time, share local tips, find companions for treks, and coordinate journeys.
          </p>

          {/* Action Bar */}
          <div className="groups-action-bar">
            <div className="groups-search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search groups by destination or keyword (e.g., Goa, Manali, Kerala, Trekking)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="groups-search-input"
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

            <button
              className="btn-create-group-cta"
              onClick={() => {
                if (!isAuthenticated) navigate("/login");
                else setShowCreateModal(true);
              }}
            >
              ➕ Create Travel Group
            </button>
          </div>

          {/* Tabs & Category Filter Chips */}
          <div className="groups-filters-wrapper">
            <div className="groups-mode-tabs">
              <button
                className={`mode-tab-btn ${filterMode === "all" ? "active" : ""}`}
                onClick={() => setFilterMode("all")}
              >
                🌍 All Groups ({groups.length})
              </button>
              {isAuthenticated && (
                <button
                  className={`mode-tab-btn ${filterMode === "my_groups" ? "active" : ""}`}
                  onClick={() => setFilterMode("my_groups")}
                >
                  🎒 My Groups
                </button>
              )}
            </div>

            <div className="category-chips-list">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`cat-chip ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Global Notice */}
        {actionNotice && (
          <div className="groups-action-banner">
            <span>ℹ️ {actionNotice}</span>
          </div>
        )}

        {/* Groups Cards Grid */}
        <section className="groups-grid-section">
          {loading ? (
            <div className="groups-loading-state">
              <div className="spinner"></div>
              <p>Loading Indian travel groups...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="groups-empty-state">
              <span className="empty-icon">🎒</span>
              <h3>No travel groups found</h3>
              <p>
                {filterMode === "my_groups"
                  ? "You haven't joined any travel groups yet. Explore available groups and join the conversation!"
                  : "Be the first to create a travel group for this region!"}
              </p>
              {filterMode === "my_groups" ? (
                <button
                  className="btn-switch-all-groups"
                  onClick={() => setFilterMode("all")}
                >
                  Explore All Groups
                </button>
              ) : (
                <button
                  className="btn-create-first-group"
                  onClick={() => {
                    if (!isAuthenticated) navigate("/login");
                    else setShowCreateModal(true);
                  }}
                >
                  ➕ Create First Group
                </button>
              )}
            </div>
          ) : (
            <div className="travel-groups-grid">
              {filteredGroups.map((group) => {
                const isMember =
                  currentUserId &&
                  group.members?.some(
                    (m) => String(m._id || m.id || m) === String(currentUserId)
                  );

                return (
                  <div
                    key={group._id}
                    className="travel-group-card"
                    onClick={() => navigate(`/groups/${group._id}`)}
                  >
                    {/* Card Cover */}
                    <div className="group-card-cover-wrapper">
                      <img
                        src={group.coverImage}
                        alt={group.name}
                        className="group-card-cover"
                      />
                      <div className="group-card-badges">
                        <span className="group-cat-badge">{group.category}</span>
                        <span className="group-members-badge">
                          👥 {group.memberCount || group.members?.length || 1} Members
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="group-card-content">
                      <div className="group-dest-tag">📍 {group.destination}</div>
                      <h3 className="group-card-title">{group.name}</h3>
                      <p className="group-card-desc">{group.description}</p>

                      <div className="group-card-footer">
                        {isMember ? (
                          <button
                            className="btn-enter-group"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/groups/${group._id}`);
                            }}
                          >
                            💬 Open Chat Room
                          </button>
                        ) : (
                          <button
                            className="btn-join-group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinGroup(group._id, group.name);
                            }}
                          >
                            🎒 Join Group
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="create-group-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3>➕ Create Indian Travel Group</h3>
              <button
                className="btn-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="create-group-form">
              {createError && (
                <div className="create-error-alert">{createError}</div>
              )}

              <div className="form-group">
                <label>Group Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Spiti Valley Explorers, Varkala Sunset Tribe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="modal-form-input"
                />
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label>Destination / State in India *</label>
                  <input
                    type="text"
                    placeholder="e.g. Himachal Pradesh, Goa, Ladakh"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="modal-form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="modal-form-select"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Group Description *</label>
                <textarea
                  placeholder="Describe the focus of this group, types of trips planned, and who should join..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="modal-form-textarea"
                />
              </div>

              <div className="form-group">
                <label>Cover Photo</label>
                <div className="preset-covers-selector">
                  {PRESET_COVERS.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset.url}
                      alt={preset.name}
                      title={preset.name}
                      className={`preset-thumb ${coverImage === preset.url ? "selected" : ""}`}
                      onClick={() => setCoverImage(preset.url)}
                    />
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Or enter custom image URL..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="modal-form-input"
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-submit-create-group"
                >
                  {creating ? "Creating..." : "🚀 Launch Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TravelGroups;
