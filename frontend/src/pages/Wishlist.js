import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Wishlist() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("favorites");
  const [favorites, setFavorites] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);

    Promise.all([
      axios
        .get(`${API}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch(() => ({ data: { destinations: [] } })),
      axios
        .get(`${API}/api/favorites/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch(() => ({ data: { destinations: [] } })),
    ]).then(([favRes, wishRes]) => {
      setFavorites(favRes.data.destinations || []);
      setWishlist(wishRes.data.destinations || []);
      setLoading(false);
    });
  }, [isAuthenticated, token]);

  const removeFavorite = async (slug) => {
    try {
      await axios.delete(`${API}/api/favorites/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites((prev) =>
        prev.filter(
          (d) => (d.slug || d.name?.toLowerCase()) !== slug
        )
      );
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  const removeWishlistItem = async (slug) => {
    try {
      await axios.delete(`${API}/api/favorites/wishlist/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist((prev) =>
        prev.filter(
          (d) => (d.slug || d.name?.toLowerCase()) !== slug
        )
      );
    } catch (err) {
      console.error("Failed to remove wishlist item:", err);
    }
  };

  const currentList = activeTab === "favorites" ? favorites : wishlist;

  return (
    <div className="wishlist-page">
      <Navbar />

      <div className="wishlist-hero">
        <div className="wishlist-hero-content">
          <h1 className="wishlist-title">
            {activeTab === "favorites"
              ? "❤️ My Favorites"
              : "📋 My Wishlist"}
          </h1>
          <p className="wishlist-subtitle">
            {activeTab === "favorites"
              ? "Destinations you love — your personal collection of Indian gems."
              : "Places you dream of visiting — plan your next solo adventure."}
          </p>
        </div>
      </div>

      <div className="wishlist-container">
        {/* Tab Switcher */}
        <div className="wishlist-tabs">
          <button
            className={`wishlist-tab ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("favorites")}
            id="tab-favorites"
          >
            <span className="tab-emoji">❤️</span>
            Favorites
            <span className="tab-count">{favorites.length}</span>
          </button>
          <button
            className={`wishlist-tab ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
            id="tab-wishlist"
          >
            <span className="tab-emoji">📋</span>
            Wishlist
            <span className="tab-count">{wishlist.length}</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p className="loading-text">Loading your saved destinations...</p>
          </div>
        ) : currentList.length > 0 ? (
          <div className="wishlist-grid">
            {currentList.map((dest) => {
              const slug = dest.slug || dest.name?.toLowerCase();
              return (
                <div key={slug} className="wishlist-card">
                  <div className="wishlist-card-img-wrapper">
                    <img
                      className="wishlist-card-img"
                      src={dest.image}
                      alt={dest.name}
                      loading="lazy"
                    />
                    <div className="wishlist-card-badges">
                      {dest.soloScore && (
                        <span className="badge-solo">
                          ⭐ {dest.soloScore}
                        </span>
                      )}
                      {dest.safetyRating && (
                        <span className="badge-safety">
                          🛡️ {dest.safetyRating}
                        </span>
                      )}
                    </div>
                    <button
                      className="wishlist-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        activeTab === "favorites"
                          ? removeFavorite(slug)
                          : removeWishlistItem(slug);
                      }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="wishlist-card-body">
                    <div className="dest-hierarchy-crumbs">
                      <span>{dest.state}</span>
                      <span>•</span>
                      <span>{dest.city}</span>
                    </div>

                    <h3 className="wishlist-card-name">{dest.name}</h3>
                    <p className="wishlist-card-desc">
                      {(dest.description || "").slice(0, 120)}...
                    </p>

                    <div className="wishlist-card-meta">
                      {(dest.category || []).slice(0, 2).map((cat) => (
                        <span key={cat} className="category-tag">
                          {cat}
                        </span>
                      ))}
                      {dest.idealDurationDays && (
                        <span className="duration-tag">
                          ⏱️ {dest.idealDurationDays} Days
                        </span>
                      )}
                    </div>

                    <div className="wishlist-card-footer">
                      <div className="dest-budget-info">
                        <span className="budget-label">Avg Budget</span>
                        <span className="budget-value">
                          ₹
                          {dest.avgBudget
                            ? dest.avgBudget.perDay.toLocaleString("en-IN")
                            : "1,500"}
                          /day
                        </span>
                      </div>
                      <button
                        className="btn-explore-card"
                        onClick={() => navigate(`/destination/${slug}`)}
                      >
                        Explore →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              {activeTab === "favorites" ? "💔" : "📭"}
            </div>
            <h3>
              {activeTab === "favorites"
                ? "No favorites yet"
                : "Your wishlist is empty"}
            </h3>
            <p>
              {activeTab === "favorites"
                ? "Explore destinations and tap the ❤️ heart icon to save your favorites."
                : "Browse destinations and add places you want to visit to your wishlist."}
            </p>
            <button
              className="btn-explore-cta"
              onClick={() => navigate("/explore")}
            >
              🇮🇳 Explore India
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Wishlist;
