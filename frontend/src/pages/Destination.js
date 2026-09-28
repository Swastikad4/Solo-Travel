import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Star rating display component
const StarRating = ({ rating, size = 18, interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating" style={{ fontSize: `${size}px` }}>
      {stars.map((star) => {
        const filled = interactive
          ? star <= (hoverRating || rating)
          : star <= Math.round(rating);
        return (
          <span
            key={star}
            className={`star ${filled ? "star-filled" : "star-empty"}`}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onChange && onChange(star)}
            style={{ cursor: interactive ? "pointer" : "default" }}
            role={interactive ? "button" : undefined}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            {filled ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
};

// Rating distribution bar
const RatingDistribution = ({ distribution, totalReviews }) => {
  return (
    <div className="rating-distribution">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] || 0;
        const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return (
          <div key={star} className="rating-bar-row">
            <span className="rating-bar-label">{star} ★</span>
            <div className="rating-bar-track">
              <div
                className="rating-bar-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="rating-bar-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

function Destination() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const [data, setData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Gallery state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // Favorites/Wishlist state
  const [isFavorited, setIsFavorited] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    content: "",
    visitDate: "",
    travelStyle: "Solo",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Active section tab
  const [activeTab, setActiveTab] = useState("overview");

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [myUsername, setMyUsername] = useState(
    user?.name || localStorage.getItem("soloTravelerName") || ""
  );
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch destination data
  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    Promise.all([
      axios
        .get(`${API}/api/destinations/${name}`)
        .catch(() => ({ data: null })),
      axios.get(`${API}/api/trips/${name}`).catch(() => ({ data: [] })),
    ]).then(([destRes, tripsRes]) => {
      if (destRes.data && destRes.data.name) {
        setData(destRes.data);
      } else {
        setNotFound(true);
      }
      setTrips(Array.isArray(tripsRes.data) ? tripsRes.data : []);
      setLoading(false);
    });
  }, [name]);

  // Fetch reviews
  const fetchReviews = useCallback(() => {
    if (!data) return;
    const slug = data.slug || name;
    axios
      .get(`${API}/api/reviews/${slug}`)
      .then((res) => {
        setReviews(res.data.reviews || []);
        setReviewStats({
          averageRating: res.data.averageRating || 0,
          totalReviews: res.data.totalReviews || 0,
          distribution: res.data.distribution || {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
        });
      })
      .catch(() => {});
  }, [data, name]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Check favorites/wishlist status
  useEffect(() => {
    if (!isAuthenticated || !data) return;
    const slug = data.slug || name;
    axios
      .get(`${API}/api/favorites/check/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setIsFavorited(res.data.isFavorited);
        setIsWishlisted(res.data.isWishlisted);
      })
      .catch(() => {});
  }, [isAuthenticated, data, name, token]);

  // Auto-cycle hero images
  useEffect(() => {
    if (!data) return;
    const allImages = [data.image, ...(data.gallery || [])].filter(Boolean);
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % allImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setFavLoading(true);
    const slug = data.slug || name;
    try {
      if (isFavorited) {
        await axios.delete(`${API}/api/favorites/${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorited(false);
      } else {
        await axios.post(
          `${API}/api/favorites/${slug}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorited(true);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
    setFavLoading(false);
  };

  // Toggle wishlist
  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const slug = data.slug || name;
    try {
      if (isWishlisted) {
        await axios.delete(`${API}/api/favorites/wishlist/${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsWishlisted(false);
      } else {
        await axios.post(
          `${API}/api/favorites/wishlist/${slug}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setReviewSubmitting(true);
    const slug = data.slug || name;
    try {
      if (editingReview) {
        await axios.put(`${API}/api/reviews/${editingReview._id}`, reviewForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/api/reviews/${slug}`, reviewForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowReviewForm(false);
      setEditingReview(null);
      setReviewForm({
        rating: 5,
        title: "",
        content: "",
        visitDate: "",
        travelStyle: "Solo",
      });
      fetchReviews();
    } catch (err) {
      alert(
        err.response?.data?.error || "Failed to submit review. Please try again."
      );
    }
    setReviewSubmitting(false);
  };

  // Edit review
  const startEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      title: review.title || "",
      content: review.content,
      visitDate: review.visitDate || "",
      travelStyle: review.travelStyle || "Solo",
    });
    setShowReviewForm(true);
  };

  // Delete review
  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`${API}/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (err) {
      alert("Failed to delete review.");
    }
  };

  // Chat functions (preserved from original)
  useEffect(() => {
    let interval;
    if (chatOpen && chatUser && myUsername) {
      const fetchMessages = () => {
        axios
          .get(`${API}/api/chat/${myUsername}/${chatUser}`)
          .then((res) => setMessages(res.data))
          .catch((err) => console.error("Error fetching messages:", err));
      };
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [chatOpen, chatUser, myUsername]);

  const openChat = (user) => {
    setChatUser(user);
    setChatOpen(true);
  };
  const closeChat = () => {
    setChatOpen(false);
    setChatUser(null);
    setMessages([]);
  };
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !myUsername.trim()) return;
    localStorage.setItem("soloTravelerName", myUsername);
    try {
      const res = await axios.post(`${API}/api/chat/send`, {
        senderId: myUsername,
        receiverId: chatUser,
        content: newMessage,
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const getInitials = (userName) => {
    return (userName || "Solo")
      .split(/[\s_]+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStateSlug = (stateName) => {
    return (stateName || "")
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  // Gallery helpers
  const allImages = data
    ? [data.image, ...(data.gallery || [])].filter(Boolean)
    : [];

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="dest-detail-page">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p className="loading-text">Discovering {name} in India...</p>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="dest-detail-page">
        <Navbar />
        <div className="not-found">
          <h2>🗺️ Indian Destination Not Found</h2>
          <p>
            We could not find "{name}" in our Indian directory. Explore our
            handpicked destinations across all 28 States and 8 Union
            Territories!
          </p>
          <button className="search-btn" onClick={() => navigate("/explore")}>
            ← Browse Explore India Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dest-detail-page">
      <Navbar />

      {/* ===== HERO WITH GALLERY CAROUSEL ===== */}
      <div className="dest-hero">
        <img
          className="dest-hero-img"
          src={allImages[heroImageIndex] || data.image}
          alt={data.name}
        />
        <div className="dest-hero-overlay">
          {/* Location Breadcrumb */}
          <div className="hierarchy-breadcrumb">
            <Link to="/explore" className="crumb-link">
              🇮🇳 India
            </Link>
            <span className="crumb-sep">›</span>
            <Link
              to={`/state/${getStateSlug(data.state)}`}
              className="crumb-link"
            >
              {data.state}
            </Link>
            {data.district && (
              <>
                <span className="crumb-sep">›</span>
                <span className="crumb-text">{data.district} District</span>
              </>
            )}
            <span className="crumb-sep">›</span>
            <span className="crumb-text">{data.city}</span>
            {data.townOrVillage && (
              <>
                <span className="crumb-sep">›</span>
                <span className="crumb-text">{data.townOrVillage}</span>
              </>
            )}
          </div>

          <div className="dest-hero-title-area">
            <div className="dest-category-pill-row">
              <span className="state-badge-pill">{data.state}</span>
              {(data.category || []).map((cat) => (
                <span key={cat} className="category-badge-pill">
                  {cat}
                </span>
              ))}
            </div>
            <h1 className="dest-hero-title">{data.name}</h1>
            {data.tagline && <p className="dest-tagline">{data.tagline}</p>}

            {/* Favorite & Wishlist Buttons */}
            <div className="dest-hero-actions">
              <button
                className={`btn-fav-hero ${isFavorited ? "favorited" : ""}`}
                onClick={toggleFavorite}
                disabled={favLoading}
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                id="btn-toggle-favorite"
              >
                <span className="fav-icon">{isFavorited ? "❤️" : "🤍"}</span>
                {isFavorited ? "Favorited" : "Favorite"}
              </button>
              <button
                className={`btn-wishlist-hero ${isWishlisted ? "wishlisted" : ""}`}
                onClick={toggleWishlist}
                title={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                id="btn-toggle-wishlist"
              >
                <span className="wishlist-icon">
                  {isWishlisted ? "📋" : "📝"}
                </span>
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
            </div>
          </div>

          {/* Hero Image Dots */}
          {allImages.length > 1 && (
            <div className="hero-carousel-dots">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  className={`hero-dot ${idx === heroImageIndex ? "active" : ""}`}
                  onClick={() => setHeroImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== SECTION NAV TABS ===== */}
      <div className="dest-section-nav">
        <div className="dest-section-nav-inner">
          {[
            { key: "overview", label: "Overview", icon: "📋" },
            { key: "attractions", label: "Attractions", icon: "🏛️" },
            { key: "practical", label: "Plan & Budget", icon: "💰" },
            { key: "reviews", label: "Reviews", icon: "⭐" },
            { key: "travelers", label: "Travelers", icon: "🤝" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`section-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.key);
                document
                  .getElementById(`section-${tab.key}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dest-detail-container">
        {/* ===== QUICK STATS RIBBON ===== */}
        <div className="dest-stats-bar" id="section-overview">
          <div className="stat-card">
            <div className="stat-value">⭐ {data.soloScore || 9.0}</div>
            <div className="stat-label">Solo Traveler Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              🛡️ {data.safetyRating || 4.5}/5
            </div>
            <div className="stat-label">Safety Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ₹
              {data.avgBudget
                ? data.avgBudget.perDay.toLocaleString("en-IN")
                : "1,500"}
            </div>
            <div className="stat-label">
              Avg Daily Budget (
              {data.avgBudget ? data.avgBudget.tier : "Budget"})
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ⏱️ {data.idealDurationDays || 3} Days
            </div>
            <div className="stat-label">Recommended Duration</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              📅 {data.bestTime || "Oct to Mar"}
            </div>
            <div className="stat-label">Best Travel Season</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              🗣️{" "}
              {Array.isArray(data.language)
                ? data.language.join(", ")
                : data.language || "Hindi, English"}
            </div>
            <div className="stat-label">Local Languages</div>
          </div>
          {reviewStats.totalReviews > 0 && (
            <div className="stat-card stat-card-accent">
              <div className="stat-value">
                ⭐ {reviewStats.averageRating}/5
              </div>
              <div className="stat-label">
                {reviewStats.totalReviews} Review
                {reviewStats.totalReviews > 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>

        {/* ===== DESCRIPTION ===== */}
        <section className="dest-description-section">
          <h2 className="section-title-sm">
            About {data.name}
          </h2>
          <p className="dest-full-description">{data.description}</p>
        </section>

        {/* ===== IMAGE GALLERY ===== */}
        {allImages.length > 1 && (
          <section className="dest-gallery-section">
            <h2 className="section-title-sm">📸 Photo Gallery</h2>
            <div className="dest-gallery-grid">
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`gallery-thumb ${idx === 0 ? "gallery-thumb-large" : ""}`}
                  onClick={() => openLightbox(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openLightbox(idx)}
                >
                  <img src={img} alt={`${data.name} - ${idx + 1}`} loading="lazy" />
                  <div className="gallery-thumb-overlay">
                    <span>🔍</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== ATTRACTIONS ===== */}
        {data.attractions && data.attractions.length > 0 && (
          <section className="dest-attractions-section" id="section-attractions">
            <div className="section-header">
              <p className="section-label">Top Attractions & Hidden Gems</p>
              <h2 className="section-title">
                Must-Visit Sights in {data.name}
              </h2>
              <p className="section-subtitle">
                Iconic monuments, spiritual sanctuaries, natural vistas, and
                vibrant markets to explore solo.
              </p>
            </div>

            <div className="attractions-grid">
              {data.attractions.map((attraction, idx) => (
                <div key={idx} className="attraction-card">
                  <div className="attraction-card-top">
                    <span className="attraction-number">
                      0{idx + 1}
                    </span>
                    <span className="attraction-type-badge">
                      {attraction.type}
                    </span>
                  </div>
                  <h3 className="attraction-name">{attraction.name}</h3>
                  <p className="attraction-desc">{attraction.description}</p>
                  <div className="attraction-meta">
                    <div className="meta-row">
                      <span className="meta-icon">🎟️ Entry:</span>
                      <span className="meta-val">{attraction.entryFee}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-icon">⏰ Timings:</span>
                      <span className="meta-val">{attraction.timings}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== ACTIVITIES & SOLO TIPS ===== */}
        <div className="dest-two-column-info">
          <div className="info-box">
            <h2 className="info-box-title">
              <span className="icon">🎯</span> Curated Solo Activities
            </h2>
            <ul className="info-list">
              {(data.thingsToDo || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="info-box highlight-box">
            <h2 className="info-box-title">
              <span className="icon">💡</span> India Solo Traveler Tips
            </h2>
            <ul className="info-list tips-list">
              {(data.soloTravelerTips && data.soloTravelerTips.length > 0
                ? data.soloTravelerTips
                : [
                    "Download UPI apps (Google Pay, PhonePe) — even street vendors and auto-rickshaws prefer QR code payments.",
                    "Pre-book government authorized prepaid taxis or use Uber/Ola at railway stations and airports.",
                    "Stay at recognized traveler hostels to meet companions for shared monument tours and local eats.",
                    "Dress respectfully when visiting religious shrines (cover shoulders and knees, remove footwear).",
                  ]
              ).map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== BUDGET & PLANNING ===== */}
        <section className="dest-budget-section" id="section-practical">
          <h2 className="section-title-sm">💰 Budget & Planning</h2>
          <div className="budget-planning-grid">
            <div className="budget-card-detail">
              <h3>Daily Budget</h3>
              <div className="budget-big-number">
                ₹
                {data.avgBudget
                  ? data.avgBudget.perDay.toLocaleString("en-IN")
                  : "1,500"}
                <span className="budget-unit">/day</span>
              </div>
              <div className="budget-range">
                Range: ₹
                {data.avgBudget
                  ? data.avgBudget.min.toLocaleString("en-IN")
                  : "1,000"}{" "}
                – ₹
                {data.avgBudget
                  ? data.avgBudget.max.toLocaleString("en-IN")
                  : "2,500"}
              </div>
              <span className={`budget-tier-badge tier-${(data.avgBudget?.tier || "Budget").toLowerCase().replace(/[- ]/g, "")}`}>
                {data.avgBudget?.tier || "Budget"}
              </span>
            </div>

            <div className="budget-card-detail">
              <h3>Recommended Duration</h3>
              <div className="budget-big-number">
                {data.idealDurationDays || 3}
                <span className="budget-unit"> days</span>
              </div>
              <p className="budget-note">
                Ideal for solo travelers to explore all major attractions and
                local experiences.
              </p>
            </div>

            <div className="budget-card-detail">
              <h3>Best Time to Visit</h3>
              <div className="best-time-display">
                📅 {data.bestTime || "October to March"}
              </div>
              {data.bestMonths && data.bestMonths.length > 0 && (
                <div className="best-months-pills">
                  {data.bestMonths.map((month) => (
                    <span key={month} className="month-pill">
                      {month}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="budget-card-detail">
              <h3>Safety Information</h3>
              <div className="safety-display">
                <div className="safety-score-big">
                  🛡️ {data.safetyRating || 4.5}
                  <span className="safety-out-of">/5</span>
                </div>
                <div className="safety-bar-wrap">
                  <div
                    className="safety-bar-fill"
                    style={{
                      width: `${((data.safetyRating || 4.5) / 5) * 100}%`,
                    }}
                  />
                </div>
                <p className="safety-note">
                  {(data.safetyRating || 4.5) >= 4.5
                    ? "Excellent safety for solo travelers"
                    : (data.safetyRating || 4.5) >= 4
                      ? "Very good safety for solo travelers"
                      : (data.safetyRating || 4.5) >= 3.5
                        ? "Good safety — exercise normal caution"
                        : "Moderate — stay alert and plan routes"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TRANSPORTATION ===== */}
        {data.howToReach && (
          <section className="how-to-reach-card">
            <h3>🚆 How to Reach {data.name}</h3>
            <div className="transit-grid">
              {data.howToReach.airport && (
                <div className="transit-item">
                  <span className="transit-icon">✈️</span>
                  <div>
                    <strong>Nearest Airport</strong>
                    <p>{data.howToReach.airport}</p>
                  </div>
                </div>
              )}
              {data.howToReach.railway && (
                <div className="transit-item">
                  <span className="transit-icon">🚆</span>
                  <div>
                    <strong>Railway Connectivity</strong>
                    <p>{data.howToReach.railway}</p>
                  </div>
                </div>
              )}
              {data.howToReach.road && (
                <div className="transit-item">
                  <span className="transit-icon">🚌</span>
                  <div>
                    <strong>Road / Highway Access</strong>
                    <p>{data.howToReach.road}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===== MAP ===== */}
        <section className="dest-map-section">
          <h2 className="section-title-sm">🗺️ Location on Map</h2>
          <div className="dest-map-embed">
            <iframe
              title={`Map of ${data.name}`}
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: "16px" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${72 + Math.random() * 10},${10 + Math.random() * 20},${73 + Math.random() * 10},${11 + Math.random() * 20}`)}&layer=mapnik&marker=${encodeURIComponent(`${20 + Math.random() * 10},${75 + Math.random() * 10}`)}`}
              allowFullScreen
            />
            <p className="map-note">
              📍 {data.city}, {data.district} District, {data.state}, India
            </p>
          </div>
        </section>

        {/* ===== REVIEWS SECTION ===== */}
        <section className="dest-reviews-section" id="section-reviews">
          <div className="section-header">
            <h2 className="section-title">⭐ Traveler Reviews</h2>
            <p className="section-subtitle">
              Real experiences from solo travelers who visited {data.name}
            </p>
          </div>

          {/* Review Stats Summary */}
          <div className="reviews-summary-card">
            <div className="reviews-summary-left">
              <div className="reviews-avg-big">
                {reviewStats.averageRating > 0
                  ? reviewStats.averageRating.toFixed(1)
                  : "—"}
              </div>
              <StarRating rating={reviewStats.averageRating} size={22} />
              <p className="reviews-count-label">
                {reviewStats.totalReviews} review
                {reviewStats.totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="reviews-summary-right">
              <RatingDistribution
                distribution={reviewStats.distribution}
                totalReviews={reviewStats.totalReviews}
              />
            </div>
          </div>

          {/* Write Review Button */}
          <div className="review-actions-bar">
            {isAuthenticated ? (
              <button
                className="btn-write-review"
                onClick={() => {
                  setEditingReview(null);
                  setReviewForm({
                    rating: 5,
                    title: "",
                    content: "",
                    visitDate: "",
                    travelStyle: "Solo",
                  });
                  setShowReviewForm(!showReviewForm);
                }}
                id="btn-write-review"
              >
                ✍️ {showReviewForm ? "Cancel" : "Write a Review"}
              </button>
            ) : (
              <Link to="/login" className="btn-write-review">
                🔐 Log in to Write a Review
              </Link>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form
              className="review-form-card"
              onSubmit={handleReviewSubmit}
            >
              <h3>
                {editingReview ? "Edit Your Review" : "Share Your Experience"}
              </h3>

              <div className="review-form-group">
                <label>Your Rating</label>
                <StarRating
                  rating={reviewForm.rating}
                  size={28}
                  interactive
                  onChange={(val) =>
                    setReviewForm((prev) => ({ ...prev, rating: val }))
                  }
                />
              </div>

              <div className="review-form-group">
                <label>Title (optional)</label>
                <input
                  type="text"
                  placeholder="Summarize your experience..."
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  maxLength={120}
                  className="review-input"
                />
              </div>

              <div className="review-form-group">
                <label>Your Review *</label>
                <textarea
                  placeholder="Share details about your solo travel experience, tips, and recommendations..."
                  value={reviewForm.content}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  className="review-textarea"
                />
                <span className="char-count">
                  {reviewForm.content.length}/2000
                </span>
              </div>

              <div className="review-form-row">
                <div className="review-form-group">
                  <label>When did you visit?</label>
                  <input
                    type="text"
                    placeholder="e.g., March 2026"
                    value={reviewForm.visitDate}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        visitDate: e.target.value,
                      }))
                    }
                    className="review-input"
                  />
                </div>
                <div className="review-form-group">
                  <label>Travel Style</label>
                  <select
                    value={reviewForm.travelStyle}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        travelStyle: e.target.value,
                      }))
                    }
                    className="review-select"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Couple">Couple</option>
                    <option value="Family">Family</option>
                    <option value="Friends">Friends</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div className="review-form-actions">
                <button
                  type="submit"
                  className="btn-submit-review"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting
                    ? "Submitting..."
                    : editingReview
                      ? "Update Review"
                      : "Submit Review"}
                </button>
                <button
                  type="button"
                  className="btn-cancel-review"
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Review List */}
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-card-header">
                    <div className="review-author">
                      <div className="review-avatar">
                        {getInitials(review.userName)}
                      </div>
                      <div>
                        <div className="review-author-name">
                          {review.userName}
                        </div>
                        <div className="review-meta-line">
                          {review.travelStyle && (
                            <span className="review-travel-style">
                              {review.travelStyle}
                            </span>
                          )}
                          {review.visitDate && (
                            <span className="review-visit-date">
                              📅 {review.visitDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="review-card-right">
                      <StarRating rating={review.rating} size={16} />
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="review-title">{review.title}</h4>
                  )}
                  <p className="review-content">{review.content}</p>
                  {/* Owner actions */}
                  {isAuthenticated &&
                    user &&
                    String(user._id) === String(review.userId) && (
                      <div className="review-owner-actions">
                        <button
                          className="btn-edit-review"
                          onClick={() => startEditReview(review)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-delete-review"
                          onClick={() => deleteReview(review._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div className="no-reviews-box">
                <p>
                  No reviews yet for {data.name}. Be the first to share your
                  experience!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ===== FELLOW TRAVELERS ===== */}
        <div className="travelers-section" id="section-travelers">
          <div className="travelers-header">
            <div>
              <h2>🤝 Fellow Solo Travelers Visiting {data.name}</h2>
              <p>
                {trips.length > 0
                  ? `${trips.length} solo traveler${trips.length > 1 ? "s" : ""} have published upcoming trips to ${data.name}. Say hello or coordinate plans!`
                  : `No upcoming trips posted for ${data.name} yet. Publish your trip below to connect!`}
              </p>
            </div>
            <Link to="/plan" className="btn-plan">
              ✈️ Publish My Trip to {data.name}
            </Link>
          </div>

          {trips.length > 0 ? (
            <div className="travelers-grid">
              {trips.map((trip) => (
                <div key={trip._id} className="traveler-card">
                  <div className="traveler-header">
                    <div className="traveler-avatar">
                      {getInitials(trip.userId)}
                    </div>
                    <div>
                      <div className="traveler-name">{trip.userId}</div>
                      <div className="traveler-dates">
                        📅{" "}
                        {new Date(trip.startDate).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        —{" "}
                        {new Date(trip.endDate).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  {trip.notes && (
                    <div className="traveler-notes">"{trip.notes}"</div>
                  )}
                  <button
                    className="chat-btn"
                    onClick={() => openChat(trip.userId)}
                  >
                    💬 Message {trip.userId}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-trips-box">
              <p>
                Be the first adventurer to plant your flag in {data.name}!
              </p>
              <Link to="/plan" className="btn-plan">
                Publish Upcoming Trip
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ===== LIGHTBOX MODAL ===== */}
      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close"
              onClick={() => setLightboxOpen(false)}
            >
              ✕
            </button>
            <img
              src={allImages[lightboxIndex]}
              alt={`${data.name} - ${lightboxIndex + 1}`}
              className="lightbox-img"
            />
            <div className="lightbox-nav">
              <button
                className="lightbox-arrow"
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + allImages.length) % allImages.length
                  )
                }
              >
                ‹
              </button>
              <span className="lightbox-counter">
                {lightboxIndex + 1} / {allImages.length}
              </span>
              <button
                className="lightbox-arrow"
                onClick={() =>
                  setLightboxIndex((lightboxIndex + 1) % allImages.length)
                }
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHAT MODAL ===== */}
      {chatOpen && (
        <div className="chat-overlay">
          <div className="chat-modal">
            <div className="chat-header">
              <div>
                <h3>Chat with {chatUser}</h3>
                <span className="chat-sub">SoloTravel India Community</span>
              </div>
              <button className="close-btn" onClick={closeChat}>
                ✖
              </button>
            </div>

            <div className="chat-setup">
              <input
                type="text"
                placeholder="Enter your name / handle to chat..."
                value={myUsername}
                onChange={(e) => setMyUsername(e.target.value)}
                className="name-input"
              />
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <p className="no-messages">
                  No messages yet. Say Namaste to start connecting!
                </p>
              ) : (
                messages.map((msg, idx) => {
                  const isMine =
                    msg.senderId.toLowerCase() === myUsername.toLowerCase();
                  return (
                    <div
                      key={idx}
                      className={`message ${isMine ? "sent" : "received"}`}
                    >
                      <div className="message-content">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder="Type a travel message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!myUsername.trim()}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !myUsername.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Destination;