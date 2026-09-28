import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

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

const TRAVEL_STYLES = [
  "Cultural Explorer",
  "Budget Backpacker",
  "Slow Nomad",
  "Adventure Seeker",
  "Luxury Solivagant",
  "Weekend Wanderer",
];

const INTEREST_OPTIONS = [
  "Heritage & Culture",
  "Trekking",
  "Spiritual",
  "Photography",
  "Street Food",
  "Wildlife Safari",
  "Yoga & Wellness",
  "Beach & Sunsets",
];

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [travelStyle, setTravelStyle] = useState("Cultural Explorer");
  const [selectedInterests, setSelectedInterests] = useState([
    "Heritage & Culture",
    "Photography",
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      }
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        avatar: selectedAvatar,
        travelStyle,
        travelInterests: selectedInterests,
        preferredDestinations: ["Rajasthan", "Himachal Pradesh", "Kerala"],
      });
      navigate("/profile");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Registration failed. Please check your details and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      <div className="auth-container register-container">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="auth-icon-badge">✨ 🇮🇳</div>
            <h2>Join SoloTravel Bharat</h2>
            <p>Create your solo traveler profile and explore India on your terms</p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="reg-name">Full Name *</label>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Meera Sharma"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email Address *</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="meera@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="reg-password">Password (min 6 chars) *</label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password *</label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="form-group">
              <label>Choose Your Explorer Avatar</label>
              <div className="avatar-picker-grid">
                {AVATAR_PRESETS.map((p) => (
                  <div
                    key={p.id}
                    className={`avatar-preset-item ${
                      selectedAvatar === p.url ? "selected" : ""
                    }`}
                    onClick={() => setSelectedAvatar(p.url)}
                  >
                    <img src={p.url} alt={p.label} />
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Style Selector */}
            <div className="form-group">
              <label htmlFor="travel-style">Your Solo Travel Style</label>
              <select
                id="travel-style"
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

            {/* Travel Interests Multi-Select */}
            <div className="form-group">
              <label>What are your travel interests? (Select multiple)</label>
              <div className="interests-pills-selector">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      className={`interest-pill-btn ${
                        isSelected ? "active" : ""
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? "Creating Profile..." : "Complete Registration & Explore"}
            </button>
          </form>

          <div className="auth-footer-link">
            Already have an account? <Link to="/login">Log In Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
