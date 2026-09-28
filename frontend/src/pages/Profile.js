import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "";

const AVATAR_PRESETS = [
  {
    id: "cartoon_explorer",
    label: "Mountain Explorer",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
  },
  {
    id: "cartoon_trekker",
    label: "Trail Trekker",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  },
  {
    id: "cartoon_nomad",
    label: "Solo Nomad",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Maya",
  },
  {
    id: "cartoon_wanderer",
    label: "Heritage Wanderer",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo",
  },
  {
    id: "cartoon_backpacker",
    label: "Forest Backpacker",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe",
  },
  {
    id: "cartoon_voyager",
    label: "Coastal Voyager",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver",
  },
  {
    id: "cartoon_solivagant",
    label: "Zen Solivagant",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Willow",
  },
  {
    id: "cartoon_summit",
    label: "Summit Seeker",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper",
  },
];

const ALL_INTERESTS = [
  "Heritage & Culture",
  "Trekking",
  "Spiritual",
  "Photography",
  "Street Food",
  "Wildlife Safari",
  "Yoga & Wellness",
  "Beach & Sunsets",
  "High Passes & Biking",
  "Monastery Stays",
];

const POPULAR_STATES = [
  "Rajasthan",
  "Himachal Pradesh",
  "Uttarakhand",
  "Kerala",
  "Goa",
  "Ladakh",
  "Meghalaya",
  "Karnataka",
  "West Bengal",
  "Varanasi (UP)",
];

const TRAVEL_STYLES = [
  "Cultural Explorer",
  "Budget Backpacker",
  "Slow Nomad",
  "Adventure Seeker",
  "Luxury Solivagant",
  "Weekend Wanderer",
];

const Profile = () => {
  const { user, updateProfile, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  // Form states for editing
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [travelInterests, setTravelInterests] = useState([]);
  const [preferredDestinations, setPreferredDestinations] = useState([]);
  const [newDestInput, setNewDestInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Initialize edit form when entering edit mode or when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
      setTravelStyle(user.travelStyle || "Cultural Explorer");
      setTravelInterests(user.travelInterests || []);
      setPreferredDestinations(user.preferredDestinations || []);
    }
  }, [user, isEditing]);

  // Load user trips
  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        const res = await axios.get(`${API}/api/trips`);
        const allTrips = Array.isArray(res.data) ? res.data : [];
        const filtered = allTrips.filter(
          (t) =>
            (t.userId && user?.name && t.userId.toLowerCase().includes(user.name.split(" ")[0].toLowerCase())) ||
            (t.userId && user?.email && t.userId.toLowerCase() === user.email.toLowerCase()) ||
            (t.userId && user?._id && String(t.userId) === String(user._id))
        );
        setUserTrips(filtered);
      } catch (err) {
        setUserTrips([]);
      } finally {
        setLoadingTrips(false);
      }
    };

    if (user) {
      fetchUserTrips();
    }
  }, [user]);

  const toggleInterest = (item) => {
    if (travelInterests.includes(item)) {
      if (travelInterests.length > 1) {
        setTravelInterests(travelInterests.filter((i) => i !== item));
      }
    } else {
      setTravelInterests([...travelInterests, item]);
    }
  };

  const toggleDestination = (dest) => {
    if (preferredDestinations.includes(dest)) {
      setPreferredDestinations(preferredDestinations.filter((d) => d !== dest));
    } else {
      setPreferredDestinations([...preferredDestinations, dest]);
    }
  };

  const handleAddCustomDest = (e) => {
    e.preventDefault();
    if (newDestInput.trim() && !preferredDestinations.includes(newDestInput.trim())) {
      setPreferredDestinations([...preferredDestinations, newDestInput.trim()]);
      setNewDestInput("");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: "error", message: "Name cannot be empty." });
      return;
    }

    try {
      setSaving(true);
      setFeedback({ type: "", message: "" });
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar.trim(),
        travelStyle,
        travelInterests,
        preferredDestinations,
      });
      setFeedback({ type: "success", message: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.error || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <Navbar />

      <div className="profile-hero-banner">
        <div className="profile-banner-overlay" />
      </div>

      <div className="profile-main-container">
        {feedback.message && (
          <div
            className={`auth-${feedback.type === "success" ? "success" : "error"}-banner`}
            role="alert"
          >
            <span>{feedback.type === "success" ? "✅" : "⚠️"}</span> {feedback.message}
          </div>
        )}

        {/* PROFILE HEADER CARD */}
        <div className="profile-header-card">
          <div className="profile-avatar-wrapper">
            <img
              src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria"}
              alt={user?.name}
              className="profile-avatar-large"
            />
            <span className="profile-status-indicator" title="Active Solo Traveler"></span>
          </div>

          <div className="profile-header-info">
            <div className="profile-name-row">
              <h2>{user?.name}</h2>
              {isAdmin ? (
                <span className="role-badge badge-admin">👑 Administrator</span>
              ) : (
                <span className="role-badge badge-user">🎒 Solo Explorer</span>
              )}
            </div>
            <p className="profile-email-text">{user?.email}</p>
            {user?.bio ? (
              <p className="profile-bio-text">"{user.bio}"</p>
            ) : (
              <p className="profile-bio-empty">No bio added yet. Tell fellow travelers about your journeys!</p>
            )}
          </div>

          <div className="profile-header-actions">
            {!isEditing ? (
              <button
                className="btn-edit-profile"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <button
                className="btn-cancel-profile"
                onClick={() => setIsEditing(false)}
              >
                ✕ Cancel
              </button>
            )}
          </div>
        </div>

        {/* EDIT MODE FORM */}
        {isEditing ? (
          <div className="profile-edit-section">
            <div className="edit-section-header">
              <h3>Edit Solo Traveler Profile</h3>
              <p>Customize your identity and travel preferences across Bharat</p>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Bio (Max 500 characters)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a bit about your travel philosophy, favorite moments, and what you seek when traveling solo..."
                  rows={4}
                  maxLength={500}
                />
                <small className="char-count">{bio.length}/500 characters</small>
              </div>

              {/* Avatar Chooser */}
              <div className="form-group">
                <label>Profile Picture</label>
                <div className="avatar-picker-grid">
                  {AVATAR_PRESETS.map((p) => (
                    <div
                      key={p.id}
                      className={`avatar-preset-item ${avatar === p.url ? "selected" : ""}`}
                      onClick={() => setAvatar(p.url)}
                    >
                      <img src={p.url} alt={p.label} />
                      <span>{p.label}</span>
                    </div>
                  ))}
                </div>
                <div className="custom-avatar-url-input">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Or paste a custom image URL (https://...)"
                  />
                </div>
              </div>

              {/* Travel Style */}
              <div className="form-group">
                <label>Travel Style</label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="select-styled"
                >
                  {TRAVEL_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Travel Interests */}
              <div className="form-group">
                <label>Travel Interests (Click to toggle)</label>
                <div className="interests-pills-selector">
                  {ALL_INTERESTS.map((interest) => {
                    const isSelected = travelInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        className={`interest-pill-btn ${isSelected ? "active" : ""}`}
                        onClick={() => toggleInterest(interest)}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Destinations */}
              <div className="form-group">
                <label>Preferred Indian States & Destinations</label>
                <div className="interests-pills-selector">
                  {POPULAR_STATES.map((dest) => {
                    const isSelected = preferredDestinations.includes(dest);
                    return (
                      <button
                        key={dest}
                        type="button"
                        className={`interest-pill-btn ${isSelected ? "active" : ""}`}
                        onClick={() => toggleDestination(dest)}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {dest}
                      </button>
                    );
                  })}
                </div>
                <div className="add-custom-dest-row">
                  <input
                    type="text"
                    value={newDestInput}
                    onChange={(e) => setNewDestInput(e.target.value)}
                    placeholder="Add other Indian city or state..."
                  />
                  <button
                    type="button"
                    className="btn-add-dest"
                    onClick={handleAddCustomDest}
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="edit-form-actions">
                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  className="btn-cancel-action"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* VIEW MODE DETAILS */
          <div className="profile-details-grid">
            {/* Travel Identity Card */}
            <div className="profile-card">
              <div className="profile-card-header">
                <span className="profile-card-icon">🧭</span>
                <h4>Travel Style</h4>
              </div>
              <div className="travel-style-display">
                <div className="style-badge">{user?.travelStyle || "Cultural Explorer"}</div>
                <p className="style-description">
                  {user?.travelStyle === "Budget Backpacker" &&
                    "Prefers hostels, local buses, overnight trains, and budget-friendly authentic experiences."}
                  {user?.travelStyle === "Slow Nomad" &&
                    "Loves longer stays, mountain cafes with Wi-Fi, immersive cultural deep dives, and village walks."}
                  {user?.travelStyle === "Adventure Seeker" &&
                    "Thrives on high Himalayan passes, river rapids, multi-day trekking trails, and boulder climbing."}
                  {user?.travelStyle === "Cultural Explorer" &&
                    "Drawn to ancient temples, forts, royal palaces, living heritage, street bazaars, and local artisan crafts."}
                  {user?.travelStyle === "Luxury Solivagant" &&
                    "Seeks boutique heritage havelis, private guided experiences, luxury jungle lodges, and wellness retreats."}
                  {user?.travelStyle === "Weekend Wanderer" &&
                    "Takes frequent spontaneous 2-3 day escapes to nearby hill stations, beaches, and wildlife sanctuaries."}
                </p>
              </div>
            </div>

            {/* Travel Interests Card */}
            <div className="profile-card">
              <div className="profile-card-header">
                <span className="profile-card-icon">✨</span>
                <h4>Travel Interests</h4>
              </div>
              <div className="profile-tags-container">
                {user?.travelInterests && user.travelInterests.length > 0 ? (
                  user.travelInterests.map((interest, idx) => (
                    <span key={idx} className="profile-interest-tag">
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="empty-tag-note">No travel interests selected yet.</p>
                )}
              </div>
            </div>

            {/* Preferred Destinations Card */}
            <div className="profile-card">
              <div className="profile-card-header">
                <span className="profile-card-icon">🇮🇳</span>
                <h4>Preferred Indian Destinations</h4>
              </div>
              <div className="profile-tags-container">
                {user?.preferredDestinations && user.preferredDestinations.length > 0 ? (
                  user.preferredDestinations.map((dest, idx) => (
                    <span key={idx} className="profile-destination-tag">
                      📍 {dest}
                    </span>
                  ))
                ) : (
                  <p className="empty-tag-note">No preferred destinations listed yet.</p>
                )}
              </div>
            </div>

            {/* User Trips Card */}
            <div className="profile-card full-width-card">
              <div className="profile-card-header">
                <span className="profile-card-icon">🗺️</span>
                <h4>Upcoming & Planned Solo Trips</h4>
                <Link to="/plan" className="btn-plan-from-profile">
                  + Plan a New Trip
                </Link>
              </div>

              {loadingTrips ? (
                <p className="loading-trips-text">Loading planned adventures...</p>
              ) : userTrips.length > 0 ? (
                <div className="profile-trips-grid">
                  {userTrips.map((trip) => (
                    <div key={trip._id} className="profile-trip-item">
                      <div className="trip-item-header">
                        <span className="trip-dest-badge">📍 {trip.destination}</span>
                        <span className="trip-dates">
                          {trip.startDate} → {trip.endDate}
                        </span>
                      </div>
                      {trip.notes && <p className="trip-notes-preview">"{trip.notes}"</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-trips-box">
                  <p>You haven't posted any upcoming trips yet.</p>
                  <Link to="/plan" className="btn-start-first-trip">
                    Publish Your First Trip
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
