import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function StateExplorer() {
  const { stateSlug } = useParams();
  const navigate = useNavigate();

  const [stateInfo, setStateInfo] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCityFilter, setSelectedCityFilter] = useState("All");

  useEffect(() => {
    setLoading(true);
    setError(false);

    // Fetch states and find matching state
    axios
      .get(`${API}/api/destinations/locations/states`)
      .then((res) => {
        const states = res.data.states || [];
        const matched = states.find((s) => {
          const slug = s.name
            .toLowerCase()
            .replace(/[^\w ]+/g, "")
            .replace(/ +/g, "-");
          return slug === stateSlug.toLowerCase();
        });

        if (matched) {
          setStateInfo(matched);
          // Now fetch destinations for this state
          return axios.get(`${API}/api/destinations?state=${encodeURIComponent(matched.name)}&limit=50`);
        } else {
          setError(true);
          setLoading(false);
          return null;
        }
      })
      .then((destRes) => {
        if (destRes && destRes.data) {
          setDestinations(destRes.data.destinations || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading state details:", err);
        setError(true);
        setLoading(false);
      });
  }, [stateSlug]);

  if (loading) {
    return (
      <div className="state-page">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p className="loading-text">Exploring state records...</p>
        </div>
      </div>
    );
  }

  if (error || !stateInfo) {
    return (
      <div className="state-page">
        <Navbar />
        <div className="not-found">
          <h2>🗺️ State Not Found</h2>
          <p>We couldn't find an Indian state matching "{stateSlug}".</p>
          <Link to="/explore" className="search-btn">
            ← Back to Explore India
          </Link>
        </div>
      </div>
    );
  }

  // Filter destinations by city if selected
  const visibleDestinations =
    selectedCityFilter === "All"
      ? destinations
      : destinations.filter((d) => d.city === selectedCityFilter);

  return (
    <div className="state-page">
      <Navbar />

      {/* State Hero */}
      <div className="state-hero">
        <img className="state-hero-bg" src={stateInfo.image} alt={stateInfo.name} />
        <div className="state-hero-overlay">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/explore">Explore India</Link>
            <span>/</span>
            <span className="breadcrumb-current">{stateInfo.name}</span>
          </div>

          <div className="state-hero-title-group">
            <div className="state-hero-pill-row">
              <span className={`state-type-pill ${stateInfo.type === "Union Territory" ? "ut" : "state"}`}>
                {stateInfo.type}
              </span>
              <span className="region-pill">Region: {stateInfo.region} India</span>
              <span className="code-pill">Code: {stateInfo.code}</span>
            </div>
            <h1>{stateInfo.name}</h1>
            <p className="state-hero-desc">{stateInfo.description}</p>
          </div>
        </div>
      </div>

      <div className="state-content-container">
        {/* Quick Stats Banner */}
        <div className="state-stat-cards">
          <div className="state-stat-card">
            <span className="icon">🏛️</span>
            <div>
              <div className="value">{stateInfo.capital}</div>
              <div className="label">Capital</div>
            </div>
          </div>

          <div className="state-stat-card">
            <span className="icon">🗺️</span>
            <div>
              <div className="value">{stateInfo.districtCount}</div>
              <div className="label">Districts</div>
            </div>
          </div>

          <div className="state-stat-card">
            <span className="icon">📍</span>
            <div>
              <div className="value">{destinations.length}</div>
              <div className="label">Solo Destinations Listed</div>
            </div>
          </div>

          <div className="state-stat-card">
            <span className="icon">🏙️</span>
            <div>
              <div className="value">{stateInfo.cities ? stateInfo.cities.length : 0}</div>
              <div className="label">Major Hub Cities</div>
            </div>
          </div>
        </div>

        {/* Cities & Towns Navigation */}
        {stateInfo.cities && stateInfo.cities.length > 0 && (
          <div className="state-cities-section">
            <div className="section-intro">
              <h3>Cities & Districts in {stateInfo.name}</h3>
              <p>Filter destinations by city or browse destinations below</p>
            </div>
            <div className="city-filter-chips">
              <button
                className={`city-chip ${selectedCityFilter === "All" ? "active" : ""}`}
                onClick={() => setSelectedCityFilter("All")}
              >
                All Cities ({destinations.length})
              </button>
              {stateInfo.cities.map((city) => {
                const count = destinations.filter((d) => d.city === city).length;
                return (
                  <button
                    key={city}
                    className={`city-chip ${selectedCityFilter === city ? "active" : ""}`}
                    onClick={() => setSelectedCityFilter(city)}
                  >
                    📍 {city} {count > 0 ? `(${count})` : ""}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Destinations in State */}
        <div className="state-destinations-section">
          <div className="section-header-row">
            <div>
              <h2>
                Solo Destinations in {stateInfo.name}{" "}
                {selectedCityFilter !== "All" && `— ${selectedCityFilter}`}
              </h2>
              <p className="subtitle">
                {visibleDestinations.length > 0
                  ? `Showing ${visibleDestinations.length} curated destinations`
                  : `No curated destinations added yet for ${selectedCityFilter}. Be the first to explore!`}
              </p>
            </div>
            <Link to="/plan" className="btn-plan">
              ✈️ Plan a Trip to {stateInfo.name}
            </Link>
          </div>

          {visibleDestinations.length === 0 ? (
            <div className="no-state-dests-card">
              <p>No specific destinations found for this city filter.</p>
              <button className="search-btn" onClick={() => setSelectedCityFilter("All")}>
                View All Destinations in {stateInfo.name}
              </button>
            </div>
          ) : (
            <div className="destinations-grid">
              {visibleDestinations.map((dest) => (
                <div
                  key={dest.slug || dest.name}
                  className="dest-card"
                  onClick={() => navigate(`/destination/${dest.slug || dest.name.toLowerCase()}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && navigate(`/destination/${dest.slug || dest.name.toLowerCase()}`)
                  }
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
                      <span>{dest.district} District</span>
                      <span>•</span>
                      <span>{dest.city}</span>
                    </div>

                    <h3 className="dest-card-name">{dest.name}</h3>
                    <p className="dest-card-desc">{dest.description}</p>

                    <div className="dest-card-category-tags">
                      {(dest.category || []).map((c) => (
                        <span key={c} className="category-tag">
                          {c}
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
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default StateExplorer;
