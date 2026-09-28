import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import RecommendationWidget from "../components/RecommendationWidget";
import Footer from "../components/Footer";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Home() {
  const [place, setPlace] = useState("");
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API}/api/destinations?limit=6&sortBy=popular`)
      .then((res) => {
        if (res.data && res.data.destinations) {
          setDestinations(res.data.destinations);
        } else if (Array.isArray(res.data)) {
          setDestinations(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (place.trim()) {
      navigate(`/explore?q=${encodeURIComponent(place.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section with Incredible India Visuals */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&q=80"
            alt="Incredible India Heritage"
          />
        </div>
        <div className="hero-content">
          <div className="hero-pill-badge">
            <span>🇮🇳</span> The Premier Solo Travel Platform for India
          </div>
          <h1>
            Explore Incredible<br />
            <span className="accent-text">India On Your Terms</span>
          </h1>
          <p className="hero-subtitle">
            Uncover ancient fortresses, misty Himalayan mountain trails, tranquil Kerala backwaters, and vibrant spiritual ghats. Connect with verified solo travelers across all 28 States and 8 Union Territories.
          </p>

          {/* Search Bar */}
          <div className="search-bar" role="search">
            <div className="search-field">
              <span className="field-icon">🔍</span>
              <input
                type="text"
                placeholder="Where in India? (e.g. Jaipur, Manali, Rishikesh, Kerala)..."
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                aria-label="Search Indian destination or state"
              />
            </div>
            <div className="search-divider"></div>
            <div className="search-field" style={{ flex: "0 0 auto" }}>
              <span className="field-icon">🗺️</span>
              <span style={{ color: "#b8b8b8", fontSize: "0.88rem" }}>28 States • 8 UTs</span>
            </div>
            <div className="search-divider"></div>
            <div className="search-field" style={{ flex: "0 0 auto" }}>
              <span className="field-icon">👤</span>
              <span style={{ color: "#c9a96e", fontSize: "0.88rem", fontWeight: "600" }}>Solo Friendly</span>
            </div>
            <button className="search-btn-main" onClick={handleSearch}>
              Explore India
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="search-suggestions">
            <span className="suggestions-label">Popular now:</span>
            {[
              { name: "Jaipur", slug: "jaipur" },
              { name: "Rishikesh", slug: "rishikesh" },
              { name: "Manali", slug: "manali" },
              { name: "Varanasi", slug: "varanasi" },
              { name: "Hampi", slug: "hampi" },
              { name: "North Goa", slug: "north-goa" },
              { name: "Leh-Ladakh", slug: "leh-ladakh" },
              { name: "Munnar", slug: "munnar" }
            ].map((s) => (
              <button
                key={s.slug}
                className="suggestion-chip"
                onClick={() => navigate(`/destination/${s.slug}`)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-promo">
          <h3>"The real voyage of discovery consists not in seeking new landscapes, but in having new eyes."</h3>
          <p>Over 18+ curated solo destinations with safety metrics & live traveler meetups.</p>
        </div>
      </section>

      {/* Explore India Feature Callout */}
      <section className="india-highlight-strip">
        <div className="strip-container">
          <div className="strip-card" onClick={() => navigate("/explore?category=Heritage")}>
            <span className="strip-icon">🏰</span>
            <div>
              <h4>Royal Heritage & Forts</h4>
              <p>Rajasthan, Madhya Pradesh, Delhi</p>
            </div>
          </div>
          <div className="strip-card" onClick={() => navigate("/explore?category=Spiritual")}>
            <span className="strip-icon">🕉️</span>
            <div>
              <h4>Spiritual Awakening</h4>
              <p>Varanasi, Rishikesh, Amritsar, Bodh Gaya</p>
            </div>
          </div>
          <div className="strip-card" onClick={() => navigate("/explore?category=Hill%20Station")}>
            <span className="strip-icon">🏔️</span>
            <div>
              <h4>Himalayan Escapes</h4>
              <p>Himachal, Uttarakhand, Ladakh, Sikkim</p>
            </div>
          </div>
          <div className="strip-card" onClick={() => navigate("/explore?category=Beach%20%26%20Coastal")}>
            <span className="strip-icon">🏖️</span>
            <div>
              <h4>Coastal & Tropical</h4>
              <p>Goa, Kerala, Pondicherry, Andaman</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Smart Recommendations Section */}
      <section className="section bg-opacity-25" style={{ padding: "1rem 0" }}>
        <div className="container">
          <RecommendationWidget 
            title="🎯 Personalized India Recommendations"
            subtitle="Calculated specifically for your travel preferences, budget in ₹ INR, and preferred adventure styles."
            limit={6}
          />
        </div>
      </section>

      {/* Popular Solo Destinations */}
      <section className="section" id="popular-destinations">
        <div className="section-header">
          <p className="section-label">Bharat Solo Collection</p>
          <h2 className="section-title">Highest-Rated Solo Hubs in India</h2>
          <p className="section-subtitle">
            Rated by safety index, vibrant traveler community, affordable stays in Indian Rupees (₹), and ease of solo transit.
          </p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p className="loading-text">Loading Indian destinations...</p>
          </div>
        ) : (
          <div className="destinations-grid">
            {destinations.map((dest) => (
              <div
                key={dest.slug || dest.name}
                className="dest-card"
                onClick={() => navigate(`/destination/${dest.slug || dest.name.toLowerCase()}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && navigate(`/destination/${dest.slug || dest.name.toLowerCase()}`)
                }
                aria-label={`Explore ${dest.name}`}
              >
                <div className="dest-card-img-wrapper">
                  <img className="dest-card-img" src={dest.image} alt={dest.name} loading="lazy" />
                  <div className="dest-card-badges">
                    {dest.soloScore && (
                      <span className="badge-solo">⭐ {dest.soloScore} Solo Score</span>
                    )}
                    {dest.safetyRating && (
                      <span className="badge-safety">🛡️ {dest.safetyRating} Safety</span>
                    )}
                  </div>
                </div>

                <div className="dest-card-body">
                  <div className="dest-hierarchy-crumbs">
                    <span>{dest.state}</span>
                    <span>•</span>
                    <span>{dest.city}</span>
                  </div>

                  <h3 className="dest-card-name">{dest.name}</h3>
                  <p className="dest-card-desc">{dest.description}</p>

                  <div className="dest-card-category-tags">
                    {(dest.category || []).slice(0, 2).map((cat) => (
                      <span key={cat} className="category-tag">
                        {cat}
                      </span>
                    ))}
                    {dest.idealDurationDays && (
                      <span className="duration-tag">⏱️ {dest.idealDurationDays} Days</span>
                    )}
                  </div>

                  <div className="dest-card-footer">
                    <div className="dest-budget-info">
                      <span className="budget-label">Avg Budget</span>
                      <span className="budget-value">
                        ₹{dest.avgBudget ? dest.avgBudget.perDay.toLocaleString("en-IN") : "1,500"}/day
                      </span>
                    </div>
                    <button className="btn-explore-card">Explore Details →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA to Explore India Hub */}
        <div className="explore-all-cta-box">
          <div className="cta-content">
            <h3>Ready to see all 28 States & 8 Union Territories?</h3>
            <p>Filter by budget in Rupees, trip duration, safety rating, and regional terrain.</p>
          </div>
          <button className="search-btn-main" onClick={() => navigate("/explore")}>
            Open Explore India Hub 🇮🇳
          </button>
        </div>
      </section>

      {/* Architectural Theme Footer */}
      <Footer />
    </div>
  );
}

export default Home;