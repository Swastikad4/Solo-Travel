import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import RecommendationWidget from "../components/RecommendationWidget";
import Footer from "../components/Footer";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const REGIONS = [
  "All",
  "North",
  "South",
  "West",
  "East",
  "Central",
  "North-East",
  "Islands"
];

const CATEGORIES = [
  "All",
  "Heritage",
  "Spiritual",
  "Nature & Wildlife",
  "Hill Station",
  "Adventure & Trekking",
  "Beach & Coastal",
  "Cultural & Food",
  "Architecture"
];

const BUDGET_TIERS = [
  { label: "All Budgets", value: "All" },
  { label: "Budget (< ₹1,800/day)", value: "Budget" },
  { label: "Mid-range (₹1,800–₹4,000/day)", value: "Mid-range" },
  { label: "Luxury (₹4,000+/day)", value: "Luxury" }
];

const DURATIONS = [
  { label: "Any Duration", value: "All" },
  { label: "Weekend (1–2 Days)", value: "weekend" },
  { label: "Short Trip (3–5 Days)", value: "short" },
  { label: "Extended (6+ Days)", value: "week" }
];

function ExploreIndia() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab: "destinations" or "states"
  const [activeTab, setActiveTab] = useState("destinations");

  // Filter state initialized from URL search params
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "All");
  const [selectedState, setSelectedState] = useState(searchParams.get("state") || "All");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedBudgetTier, setSelectedBudgetTier] = useState(searchParams.get("budgetTier") || "All");
  const [selectedDuration, setSelectedDuration] = useState(searchParams.get("duration") || "All");
  const [minSoloScore, setMinSoloScore] = useState(searchParams.get("minSoloScore") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "popular");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page"), 10) || 1);

  // Data state
  const [destinations, setDestinations] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false });
  const [statesList, setStatesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all Indian states & UTs
  useEffect(() => {
    axios
      .get(`${API}/api/destinations/locations/states`)
      .then((res) => {
        if (res.data && res.data.states) {
          setStatesList(res.data.states);
        }
      })
      .catch((err) => console.error("Error loading states:", err));
  }, []);

  // Fetch filtered destinations
  const fetchDestinations = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (selectedRegion !== "All") params.set("region", selectedRegion);
    if (selectedState !== "All") params.set("state", selectedState);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedBudgetTier !== "All") params.set("budgetTier", selectedBudgetTier);
    if (selectedDuration !== "All") params.set("duration", selectedDuration);
    if (minSoloScore) params.set("minSoloScore", minSoloScore);
    if (sortBy) params.set("sortBy", sortBy);
    params.set("page", currentPage);
    params.set("limit", 9);

    setSearchParams(params, { replace: true });

    axios
      .get(`${API}/api/destinations?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.destinations) {
          setDestinations(res.data.destinations);
          setPagination({
            total: res.data.total,
            totalPages: res.data.totalPages,
            hasNext: res.data.hasNext,
            hasPrev: res.data.hasPrev
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching destinations:", err);
        setLoading(false);
      });
  }, [
    searchTerm,
    selectedRegion,
    selectedState,
    selectedCategory,
    selectedBudgetTier,
    selectedDuration,
    minSoloScore,
    sortBy,
    currentPage,
    setSearchParams
  ]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRegion("All");
    setSelectedState("All");
    setSelectedCategory("All");
    setSelectedBudgetTier("All");
    setSelectedDuration("All");
    setMinSoloScore("");
    setSortBy("popular");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedRegion !== "All" ||
    selectedState !== "All" ||
    selectedCategory !== "All" ||
    selectedBudgetTier !== "All" ||
    selectedDuration !== "All" ||
    minSoloScore !== "";

  // Filter states list based on selected region
  const filteredStates = statesList.filter((s) => {
    if (selectedRegion === "All") return true;
    return s.region === selectedRegion;
  });

  return (
    <div className="explore-page">
      <Navbar />

      {/* Explore Hero Banner */}
      <div className="explore-hero">
        <div className="explore-hero-content">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="breadcrumb-current">Explore India</span>
          </div>
          <h1>
            Discover <span className="accent-text">Incredible India</span>
          </h1>
          <p className="explore-hero-desc">
            Journey through 28 States and 8 Union Territories — handpicked for solo explorers with safety scores, local transit tips, and genuine cultural immersion.
          </p>

          {/* Search bar inside header */}
          <div className="explore-search-box">
            <span className="explore-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by destination, city, temple, fort, or trek (e.g. Jaipur, Manali, Varanasi)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                ✖
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="explore-container">
        {/* View Switcher: Destinations vs States Directory */}
        <div className="view-switcher-bar">
          <div className="tab-pills">
            <button
              className={`tab-pill ${activeTab === "destinations" ? "active" : ""}`}
              onClick={() => setActiveTab("destinations")}
            >
              📍 Curated Destinations ({pagination.total})
            </button>
            <button
              className={`tab-pill ${activeTab === "states" ? "active" : ""}`}
              onClick={() => setActiveTab("states")}
            >
              🗺️ All 36 States & UTs
            </button>
          </div>

          <div className="sort-box">
            <label htmlFor="sortBySelect">Sort by:</label>
            <select
              id="sortBySelect"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="popular">⭐ Most Popular (Solo Score)</option>
              <option value="rating">🛡️ Safety Rating (High to Low)</option>
              <option value="budget_asc">💰 Budget (Lowest First)</option>
              <option value="budget_desc">💰 Budget (Highest First)</option>
              <option value="name">🔤 Name (A to Z)</option>
              <option value="duration">⏱️ Ideal Duration</option>
            </select>
          </div>
        </div>

        {/* Region Selector Chips */}
        <div className="region-selector">
          <span className="region-label">Region:</span>
          <div className="region-chips-wrapper">
            {REGIONS.map((reg) => (
              <button
                key={reg}
                className={`region-chip ${selectedRegion === reg ? "active" : ""}`}
                onClick={() => {
                  setSelectedRegion(reg);
                  setSelectedState("All"); // Reset state when changing region
                  setCurrentPage(1);
                }}
              >
                {reg === "All" ? "All India 🇮🇳" : reg}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "destinations" ? (
          <div className="explore-layout">
            {/* Left Filter Sidebar */}
            <aside className="filter-sidebar">
              <div className="filter-header">
                <h3>Filters</h3>
                {hasActiveFilters && (
                  <button className="reset-filter-btn" onClick={resetFilters}>
                    Reset All
                  </button>
                )}
              </div>

              {/* State Filter */}
              <div className="filter-section">
                <label className="filter-title">State / Union Territory</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="All">All States & UTs (36)</option>
                  {filteredStates.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} {s.destinationCount > 0 ? `(${s.destinationCount})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="filter-section">
                <label className="filter-title">Experience Category</label>
                <div className="category-pills">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Tier */}
              <div className="filter-section">
                <label className="filter-title">Daily Budget (INR ₹)</label>
                <div className="radio-group">
                  {BUDGET_TIERS.map((tier) => (
                    <label key={tier.value} className="radio-label">
                      <input
                        type="radio"
                        name="budgetTier"
                        checked={selectedBudgetTier === tier.value}
                        onChange={() => {
                          setSelectedBudgetTier(tier.value);
                          setCurrentPage(1);
                        }}
                      />
                      <span>{tier.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Trip Duration */}
              <div className="filter-section">
                <label className="filter-title">Ideal Trip Duration</label>
                <div className="radio-group">
                  {DURATIONS.map((dur) => (
                    <label key={dur.value} className="radio-label">
                      <input
                        type="radio"
                        name="duration"
                        checked={selectedDuration === dur.value}
                        onChange={() => {
                          setSelectedDuration(dur.value);
                          setCurrentPage(1);
                        }}
                      />
                      <span>{dur.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Min Solo Score */}
              <div className="filter-section">
                <label className="filter-title">Minimum Solo Score</label>
                <div className="score-selector">
                  {["", "8.5", "9.0", "9.5"].map((score) => (
                    <button
                      key={score}
                      className={`score-btn ${minSoloScore === score ? "active" : ""}`}
                      onClick={() => {
                        setMinSoloScore(score);
                        setCurrentPage(1);
                      }}
                    >
                      {score === "" ? "Any" : `${score}+`}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Destination Results Grid */}
            <main className="destinations-results-pane">
              {/* Active Filter Chips Bar */}
              {hasActiveFilters && (
                <div className="active-filters-bar">
                  <span className="active-filters-label">Active:</span>
                  {selectedRegion !== "All" && (
                    <span className="active-chip">
                      Region: {selectedRegion}
                      <button onClick={() => setSelectedRegion("All")}>✖</button>
                    </span>
                  )}
                  {selectedState !== "All" && (
                    <span className="active-chip">
                      State: {selectedState}
                      <button onClick={() => setSelectedState("All")}>✖</button>
                    </span>
                  )}
                  {selectedCategory !== "All" && (
                    <span className="active-chip">
                      Category: {selectedCategory}
                      <button onClick={() => setSelectedCategory("All")}>✖</button>
                    </span>
                  )}
                  {selectedBudgetTier !== "All" && (
                    <span className="active-chip">
                      Budget: {selectedBudgetTier}
                      <button onClick={() => setSelectedBudgetTier("All")}>✖</button>
                    </span>
                  )}
                  {selectedDuration !== "All" && (
                    <span className="active-chip">
                      Duration: {selectedDuration}
                      <button onClick={() => setSelectedDuration("All")}>✖</button>
                    </span>
                  )}
                  {minSoloScore && (
                    <span className="active-chip">
                      Solo: {minSoloScore}+
                      <button onClick={() => setMinSoloScore("")}>✖</button>
                    </span>
                  )}
                </div>
              )}

              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p className="loading-text">Discovering Indian destinations...</p>
                </div>
              ) : destinations.length === 0 ? (
                <div className="no-results-card">
                  <div className="no-results-icon">🗺️</div>
                  <h3>No destinations match your filters</h3>
                  <p>Try widening your budget, selecting "All India", or resetting your search term.</p>
                  <button className="search-btn" onClick={resetFilters}>
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <>
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
                            {dest.townOrVillage && (
                              <>
                                <span>•</span>
                                <span>{dest.townOrVillage.split("/")[0]}</span>
                              </>
                            )}
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
                            <button
                              className="btn-explore-card"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/destination/${dest.slug || dest.name.toLowerCase()}`);
                              }}
                            >
                              Explore →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="pagination-bar">
                      <button
                        className="page-btn"
                        disabled={!pagination.hasPrev}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        ← Previous
                      </button>

                      <div className="page-indicators">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                          <button
                            key={num}
                            className={`page-num-btn ${currentPage === num ? "active" : ""}`}
                            onClick={() => setCurrentPage(num)}
                          >
                            {num}
                          </button>
                        ))}
                      </div>

                      <button
                        className="page-btn"
                        disabled={!pagination.hasNext}
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        ) : (
          /* All 36 States & Union Territories Grid */
          <div className="states-directory-section">
            <div className="states-directory-header">
              <h2>States & Union Territories of India</h2>
              <p>Select any state or union territory to view its cities, districts, and solo travel destinations.</p>
            </div>

            <div className="states-grid">
              {filteredStates.map((st) => (
                <div
                  key={st.name}
                  className="state-card"
                  onClick={() =>
                    navigate(
                      `/state/${st.name.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-")}`
                    )
                  }
                >
                  <div className="state-card-img-wrap">
                    <img src={st.image} alt={st.name} loading="lazy" />
                    <span className={`state-type-badge ${st.type === "Union Territory" ? "ut" : "state"}`}>
                      {st.type}
                    </span>
                  </div>
                  <div className="state-card-body">
                    <div className="state-card-top">
                      <h3>{st.name}</h3>
                      <span className="state-code-badge">{st.code}</span>
                    </div>
                    <p className="state-capital">Capital: <strong>{st.capital}</strong></p>
                    <p className="state-desc">{st.description}</p>
                    <div className="state-card-meta">
                      <span>🏛️ {st.districtCount} Districts</span>
                      <span className="state-dest-count">
                        📍 {st.destinationCount} {st.destinationCount === 1 ? "Destination" : "Destinations"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Recommendation Widget */}
        <div className="explore-recommendations-wrapper pt-4">
          <RecommendationWidget 
            title="✨ AI Recommendations Based On Your Preferences"
            subtitle="Smart suggestions matching budget, travel season and solo safety standards"
            limit={3}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ExploreIndia;
