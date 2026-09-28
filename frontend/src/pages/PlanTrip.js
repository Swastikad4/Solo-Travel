import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AICommandBar from "../components/AICommandBar";
import TripMapView from "../components/TripMapView";
import WeatherWidget from "../components/WeatherWidget";
import SafetyHub from "../components/SafetyHub";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const INTEREST_OPTIONS = [
  { id: "trekking", label: "🥾 Trekking & Nature Trails" },
  { id: "nature", label: "🌲 Nature & Wildlife" },
  { id: "heritage", label: "🏰 Heritage Forts & Palaces" },
  { id: "spiritual", label: "🕉️ Spiritual & Ghats" },
  { id: "food", label: "🍛 Street Food & Cuisine" },
  { id: "photography", label: "📸 Photography & Sunsets" },
  { id: "beaches", label: "🏖️ Beaches & Coastal" },
  { id: "cafes", label: "☕ Bohemian Cafes & Workations" },
  { id: "adventure", label: "🪂 Paragliding & Rafting" },
  { id: "art", label: "🎨 Local Crafts & Bazaars" }
];

const TRAVEL_STYLES = [
  "Solo Backpacker",
  "Budget Explorer",
  "Balanced / Mid-Range",
  "Slow & Relaxed Traveler",
  "Adventure Thrill-Seeker",
  "Boutique & Heritage"
];

const ACCOMMODATION_TYPES = [
  "Backpacker Hostel / Dorm",
  "Cozy Homestay",
  "Budget Hotel / Guest House",
  "Heritage Haveli / Boutique Stay",
  "Luxury Resort / Villa",
  "Mountain Camping / Swiss Tent"
];

const FOOD_PREFERENCES = [
  "Authentic Local Street Food & Dhabas",
  "Pure Vegetarian / Sattvic",
  "Vegan Friendly",
  "Coastal Seafood & Local Non-Veg",
  "Cafes & Continental"
];

const TRANSPORT_MODES = [
  "Public Buses & Local Trains",
  "Rental Scooter / Royal Enfield",
  "Shared Taxis & E-Rickshaws",
  "Private Cab / Self-Drive"
];

const CATEGORY_COLORS = {
  Transportation: "#3b82f6",
  Accommodation: "#8b5cf6",
  Food: "#f59e0b",
  Activities: "#10b981",
  Miscellaneous: "#ec4899"
};

function PlanTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDest = searchParams.get("destination") || searchParams.get("dest") || "";

  const { user } = useAuth();
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    userId: user?.name || localStorage.getItem("soloTravelerName") || "",
    destination: preselectedDest,
    days: 5,
    startDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    travelers: 1,
    budget: 15000,
    interests: ["🥾 Trekking & Nature Trails", "🌲 Nature & Wildlife"],
    travelStyle: "Solo Backpacker",
    accommodation: "Backpacker Hostel / Dorm",
    foodPreference: "Authentic Local Street Food & Dhabas",
    transportation: "Rental Scooter / Royal Enfield",
    customNotes: ""
  });

  // Keep destination in sync if URL query changes
  useEffect(() => {
    const destParam = searchParams.get("destination") || searchParams.get("dest");
    if (destParam) {
      setFormData((prev) => ({ ...prev, destination: destParam }));
    }
  }, [searchParams]);

  // Generated Result State
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary"); // 'itinerary', 'map', 'weather', 'safety', 'food', 'transit', 'packing', 'stays'

  // Activity Edit State for Generated Itinerary
  const [editingAct, setEditingAct] = useState(null);
  const [editActForm, setEditActForm] = useState({ time: "", title: "", cost: 0, category: "Activities", location: "", notes: "" });

  // Sync userId if user logs in
  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => (prev.userId ? prev : { ...prev, userId: user.name }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const toggleInterest = (interestLabel) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interestLabel);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interestLabel) };
      } else {
        return { ...prev, interests: [...prev.interests, interestLabel] };
      }
    });
  };

  const handleGenerateAIItinerary = async (e) => {
    if (e) e.preventDefault();

    if (!formData.destination || !formData.destination.trim()) {
      setError("Please enter an Indian destination (e.g. Manali, Jaipur, Goa, Rishikesh).");
      return;
    }

    setGenerating(true);
    setError("");
    setGenerationStep(1);

    const stepTimer1 = setTimeout(() => setGenerationStep(2), 600);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 1200);

    try {
      const payload = {
        destination: formData.destination.trim(),
        days: parseInt(formData.days, 10) || 5,
        startDate: formData.startDate,
        travelers: parseInt(formData.travelers, 10) || 1,
        budget: parseFloat(formData.budget) || 15000,
        interests: formData.interests,
        travelStyle: formData.travelStyle,
        accommodation: formData.accommodation,
        foodPreference: formData.foodPreference,
        transportation: formData.transportation
      };

      const res = await axios.post(`${API}/api/ai/plan-trip`, payload);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setGenerationStep(4);

      setTimeout(() => {
        setGeneratedPlan(res.data);
        setGenerating(false);
        // Scroll to preview
        window.scrollTo({ top: 400, behavior: "smooth" });
      }, 400);
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setGenerating(false);
      const errMsg =
        err.response?.data?.error ||
        "Failed to generate AI itinerary. Please ensure the destination is in India and try again.";
      setError(errMsg);
    }
  };

  const handleItineraryUpdatedByAI = (newItinerary, newTotalCost) => {
    if (!generatedPlan) return;
    setGeneratedPlan((prev) => ({
      ...prev,
      itinerary: newItinerary,
      budgetBreakdown: {
        ...prev.budgetBreakdown,
        estimatedActivitiesCost: newTotalCost || prev.budgetBreakdown?.estimatedActivitiesCost
      }
    }));
  };

  // Inline activity management in preview
  const handleOpenEditAct = (dayNumber, act) => {
    setEditingAct({ dayNumber, ...act });
    setEditActForm({
      time: act.time || "09:00",
      title: act.title || "",
      cost: act.cost || 0,
      category: act.category || "Activities",
      location: act.location || "",
      notes: act.notes || ""
    });
  };

  const handleSaveEditedAct = (e) => {
    e.preventDefault();
    if (!editingAct || !generatedPlan) return;

    const updatedItinerary = generatedPlan.itinerary.map((day) => {
      if (day.dayNumber === editingAct.dayNumber || day.day === editingAct.dayNumber) {
        return {
          ...day,
          activities: day.activities.map((a) =>
            a._id === editingAct._id ? { ...a, ...editActForm, cost: parseFloat(editActForm.cost) || 0 } : a
          )
        };
      }
      return day;
    });

    setGeneratedPlan((prev) => ({
      ...prev,
      itinerary: updatedItinerary
    }));
    setEditingAct(null);
  };

  const handleDeleteAct = (dayNumber, actId) => {
    if (!generatedPlan) return;
    const updatedItinerary = generatedPlan.itinerary.map((day) => {
      if (day.dayNumber === dayNumber || day.day === dayNumber) {
        return {
          ...day,
          activities: day.activities.filter((a) => a._id !== actId)
        };
      }
      return day;
    });

    setGeneratedPlan((prev) => ({
      ...prev,
      itinerary: updatedItinerary
    }));
  };

  const handleAddAct = (dayNumber) => {
    if (!generatedPlan) return;
    const newAct = {
      _id: `act_${dayNumber}_custom_${Date.now()}`,
      time: "14:00",
      title: "New Custom Activity / Landmark Visit",
      category: "Activities",
      cost: 200,
      location: `${formData.destination}`,
      notes: "Custom added activity"
    };

    const updatedItinerary = generatedPlan.itinerary.map((day) => {
      if (day.dayNumber === dayNumber || day.day === dayNumber) {
        return {
          ...day,
          activities: [...day.activities, newAct]
        };
      }
      return day;
    });

    setGeneratedPlan((prev) => ({
      ...prev,
      itinerary: updatedItinerary
    }));
  };

  // Save the Final Plan to Backend
  const handleSaveTripToDatabase = async () => {
    if (!generatedPlan) return;
    setSaving(true);
    setError("");

    try {
      const travelerHandle = formData.userId.trim() || user?.name || "Solo Explorer";
      localStorage.setItem("soloTravelerName", travelerHandle);

      const startDateObj = new Date(formData.startDate);
      const endDateObj = new Date(startDateObj.getTime() + (parseInt(formData.days, 10) - 1) * 86400000);

      const payload = {
        userId: travelerHandle,
        title: `${generatedPlan.tripMeta?.destination || formData.destination} AI Expedition`,
        destination: generatedPlan.tripMeta?.destination || formData.destination,
        state: generatedPlan.tripMeta?.state || "",
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        travelers: parseInt(formData.travelers, 10) || 1,
        budget: parseFloat(formData.budget) || 15000,
        currency: "INR",
        status: "Planning",
        coverImage: generatedPlan.tripMeta?.coverImage || "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200",
        notes: `AI Generated Plan | Style: ${formData.travelStyle} | Food: ${formData.foodPreference} | Transit: ${formData.transportation}`,
        itinerary: generatedPlan.itinerary,
        expenses: [
          {
            title: "Accommodation / Hostel Stay",
            category: "Accommodation",
            cost: generatedPlan.budgetBreakdown?.estimatedAccommodationCost || 3500,
            date: formData.startDate,
            notes: "Estimated multi-night stay"
          }
        ]
      };

      const res = await axios.post(`${API}/api/trips/add`, payload);
      navigate(`/trips/${res.data._id}`);
    } catch (err) {
      console.error("Save Trip Error:", err);
      setError("Failed to save trip to your account. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="plan-trip-page-v2">
      <Navbar />

      <div className="plan-page">
        <div className="breadcrumb" style={{ textAlign: "center", marginBottom: "16px" }}>
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/trips">My Trips</Link>
          <span>/</span>
          <span className="breadcrumb-current">AI Travel Planner</span>
        </div>

        <div className="plan-header-box">
          <div className="ai-planner-badge">⭐ Phase 6 Maps • Weather • Safety Integrated</div>
          <h1>🇮🇳 AI Indian Travel Itinerary Generator</h1>
          <p className="subtitle">
            Enter your destination, days, budget, and travel preferences. Our AI engine builds an authentic,
            day-by-day Indian itinerary with estimated costs, step-by-step route maps, live weather, safety guides, and packing essentials.
          </p>
        </div>

        {/* ================= AI INPUT WIZARD FORM ================= */}
        <div className="form-card ai-planner-card">
          <form onSubmit={handleGenerateAIItinerary} noValidate>
            {/* Row 1: Traveler Name & Destination */}
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="userId">Traveler Name / Handle *</label>
                <input
                  id="userId"
                  type="text"
                  name="userId"
                  placeholder="e.g. WandererPriya, HimalayanNomad"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1.5 }}>
                <label htmlFor="destination">
                  Indian Destination * <span className="label-tag-ind">🇮🇳 India Only</span>
                </label>
                <input
                  id="destination"
                  type="text"
                  name="destination"
                  placeholder="e.g. Manali, Jaipur, Rishikesh, Munnar, North Goa"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Row 2: Days, Start Date, Travelers, Budget */}
            <div className="form-row form-row-4cols">
              <div className="form-group">
                <label htmlFor="days">Days ({formData.days} Days)</label>
                <input
                  id="days"
                  type="number"
                  name="days"
                  min="1"
                  max="14"
                  value={formData.days}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="travelers">Travelers</label>
                <input
                  id="travelers"
                  type="number"
                  name="travelers"
                  min="1"
                  max="20"
                  value={formData.travelers}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget">Budget (₹ INR)</label>
                <input
                  id="budget"
                  type="number"
                  name="budget"
                  min="500"
                  step="500"
                  placeholder="15000"
                  value={formData.budget}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Row 3: Interests Badges */}
            <div className="form-group">
              <label>Select Interests & Vibe</label>
              <div className="interests-pill-grid">
                {INTEREST_OPTIONS.map((item) => {
                  const isSelected = formData.interests.includes(item.label);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`interest-pill-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleInterest(item.label)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 4: Travel Style, Accommodation, Food, Transportation */}
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="travelStyle">Travel Style</label>
                <select
                  id="travelStyle"
                  name="travelStyle"
                  value={formData.travelStyle}
                  onChange={handleInputChange}
                >
                  {TRAVEL_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="accommodation">Accommodation</label>
                <select
                  id="accommodation"
                  name="accommodation"
                  value={formData.accommodation}
                  onChange={handleInputChange}
                >
                  {ACCOMMODATION_TYPES.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="foodPreference">Food Preference</label>
                <select
                  id="foodPreference"
                  name="foodPreference"
                  value={formData.foodPreference}
                  onChange={handleInputChange}
                >
                  {FOOD_PREFERENCES.map((food) => (
                    <option key={food} value={food}>
                      {food}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="transportation">Transportation</label>
                <select
                  id="transportation"
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleInputChange}
                >
                  {TRANSPORT_MODES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="error-message ai-error-banner animate-fade-in">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Submit / Generate Button */}
            <div className="ai-generate-action-box">
              <button
                type="submit"
                className="submit-btn btn-ai-sparkle-submit"
                disabled={generating}
              >
                {generating ? (
                  <span>🤖 AI Generating Practical Itinerary for {formData.destination || "India"}...</span>
                ) : (
                  <span>✨ Generate AI Itinerary (with Maps, Weather & Safety)</span>
                )}
              </button>
            </div>
          </form>

          {/* Multi-step progress animation when generating */}
          {generating && (
            <div className="ai-generation-progress-box animate-fade-in">
              <div className="ai-progress-spinner"></div>
              <div className="ai-progress-steps">
                <div className={`step-item ${generationStep >= 1 ? "active" : ""}`}>
                  1. Validating Indian destination & resolving geo-coordinates...
                </div>
                <div className={`step-item ${generationStep >= 2 ? "active" : ""}`}>
                  2. Reasoning routes (Hotel ➔ Attraction ➔ Restaurant ➔ Activity)...
                </div>
                <div className={`step-item ${generationStep >= 3 ? "active" : ""}`}>
                  3. Calibrating live weather, travel advice & safety guidelines...
                </div>
                <div className={`step-item ${generationStep >= 4 ? "active" : ""}`}>
                  4. Finalizing field-ready structured itinerary!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= GENERATED AI ITINERARY PREVIEW STUDIO ================= */}
        {generatedPlan && (
          <div className="ai-preview-studio-section animate-fade-in">
            <div className="ai-preview-hero-banner">
              <div className="preview-hero-text">
                <div className="preview-tag-row">
                  <span className="badge-ai-generated">✨ Field-Ready Itinerary</span>
                  <span className="badge-ai-dest">📍 {generatedPlan.tripMeta?.destination}, {generatedPlan.tripMeta?.state}</span>
                  <span className="badge-ai-days">🗓️ {generatedPlan.tripMeta?.days} Days</span>
                  <span className="badge-ai-budget">💰 Target: ₹{Number(generatedPlan.tripMeta?.budget).toLocaleString("en-IN")}</span>
                </div>
                <h2>{generatedPlan.tripMeta?.destination} Solo Adventure</h2>
                <p className="preview-meta-desc">
                  Tailored for <strong>{generatedPlan.tripMeta?.travelStyle}</strong> • Food: <strong>{generatedPlan.tripMeta?.foodPreference}</strong> • Transit: <strong>{generatedPlan.tripMeta?.transportation}</strong>
                </p>
              </div>

              <div className="preview-hero-action">
                <button
                  type="button"
                  className="btn-save-trip-primary"
                  onClick={handleSaveTripToDatabase}
                  disabled={saving}
                >
                  {saving ? "Saving Trip..." : "💾 Save Trip & Open Workspace"}
                </button>
              </div>
            </div>

            {/* AI Command Toolbar */}
            <AICommandBar
              itinerary={generatedPlan.itinerary}
              tripMeta={generatedPlan.tripMeta}
              onItineraryUpdated={handleItineraryUpdatedByAI}
              totalDays={generatedPlan.itinerary?.length}
            />

            {/* Studio Navigation Tabs */}
            <div className="ai-studio-tabs-row">
              <button
                type="button"
                className={`studio-tab-btn ${activeTab === "itinerary" ? "active" : ""}`}
                onClick={() => setActiveTab("itinerary")}
              >
                📅 Day-by-Day Schedule ({generatedPlan.itinerary?.length} Days)
              </button>
              <button
                type="button"
                className={`studio-tab-btn ${activeTab === "map" ? "active" : ""}`}
                onClick={() => setActiveTab("map")}
              >
                🗺️ Route Map (Hotel ➔ Sight ➔ Dining ➔ Activity)
              </button>
              <button
                type="button"
                className={`studio-tab-btn ${activeTab === "weather" ? "active" : ""}`}
                onClick={() => setActiveTab("weather")}
              >
                🌦️ Live Weather & Forecast
              </button>
              <button
                type="button"
                className={`studio-tab-btn ${activeTab === "safety" ? "active" : ""}`}
                onClick={() => setActiveTab("safety")}
              >
                🛡️ Solo Safety & Helplines
              </button>
              <button
                type="button"
                className={`studio-tab-btn ${activeTab === "food" ? "active" : ""}`}
                onClick={() => setActiveTab("food")}
              >
                🍛 Local Food
              </button>
              <button
                type="button"
                className={`studio-tab-btn ${activeTab === "transit" ? "active" : ""}`}
                onClick={() => setActiveTab("transit")}
              >
                🚗 Transit & Travel Times
              </button>
              <button
                type="button"
                className={`studio-tab-btn ${activeTab === "packing" ? "active" : ""}`}
                onClick={() => setActiveTab("packing")}
              >
                🎒 Packing Checklist
              </button>
              <button
                type="button"
                className={`studio-tab-btn ${activeTab === "stays" ? "active" : ""}`}
                onClick={() => setActiveTab("stays")}
              >
                🏨 Stays
              </button>
            </div>

            {/* TAB 1: ITINERARY */}
            {activeTab === "itinerary" && (
              <div className="studio-tab-body">
                <div className="itinerary-days-container">
                  {generatedPlan.itinerary?.map((day) => {
                    const dayTotal = (day.activities || []).reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

                    return (
                      <div key={day.dayNumber || day.day} className="day-planner-card preview-day-card">
                        <div className="day-planner-header">
                          <div>
                            <span className="day-badge-num">Day {day.dayNumber || day.day}</span>
                            <h4 className="day-title-text">{day.title}</h4>
                            {day.theme && <span className="day-theme-pill">{day.theme}</span>}
                          </div>
                          <div className="day-header-meta">
                            <span className="day-cost-tag">
                              Day Total: <strong>₹{dayTotal.toLocaleString("en-IN")}</strong>
                            </span>
                            <button
                              type="button"
                              className="btn-day-add-act"
                              onClick={() => handleAddAct(day.dayNumber || day.day)}
                            >
                              ➕ Add Activity
                            </button>
                          </div>
                        </div>

                        {/* Activities List */}
                        <div className="timeline-tree">
                          {day.activities?.map((act, index) => {
                            const isLast = index === day.activities.length - 1;
                            const catColor = CATEGORY_COLORS[act.category] || "#10b981";

                            return (
                              <div key={act._id || index} className="timeline-item-row">
                                <div className="timeline-tree-node">
                                  <div className="tree-symbol">{isLast ? "└──" : "├──"}</div>
                                  <div className="tree-dot" style={{ backgroundColor: catColor }}></div>
                                </div>

                                <div className="activity-card-item">
                                  <div className="activity-card-top">
                                    <div className="activity-time-badge">⏰ {act.time || "09:00"}</div>
                                    <span
                                      className="activity-cat-badge"
                                      style={{
                                        backgroundColor: `${catColor}20`,
                                        color: catColor,
                                        border: `1px solid ${catColor}50`
                                      }}
                                    >
                                      {act.category || "Activities"}
                                    </span>
                                    <div className="activity-cost-badge">
                                      ₹{(Number(act.cost) || 0).toLocaleString("en-IN")}
                                    </div>
                                  </div>

                                  <div className="activity-card-content">
                                    <h5 className="activity-title">{act.title}</h5>
                                    {act.location && <div className="activity-location">📍 {act.location}</div>}
                                    {act.notes && <div className="activity-notes">💡 {act.notes}</div>}
                                  </div>

                                  <div className="activity-card-actions">
                                    <button
                                      type="button"
                                      className="btn-act-edit"
                                      onClick={() => handleOpenEditAct(day.dayNumber || day.day, act)}
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-act-delete"
                                      onClick={() => handleDeleteAct(day.dayNumber || day.day, act._id)}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: ROUTE MAP */}
            {activeTab === "map" && (
              <div className="studio-tab-body">
                <TripMapView
                  destination={generatedPlan.tripMeta?.destination || formData.destination}
                  itinerary={generatedPlan.itinerary}
                />
              </div>
            )}

            {/* TAB 3: WEATHER & FORECAST */}
            {activeTab === "weather" && (
              <div className="studio-tab-body">
                <WeatherWidget
                  destination={generatedPlan.tripMeta?.destination || formData.destination}
                />
              </div>
            )}

            {/* TAB 4: SAFETY & HELPLINES */}
            {activeTab === "safety" && (
              <div className="studio-tab-body">
                <SafetyHub
                  destination={generatedPlan.tripMeta?.destination || formData.destination}
                />
              </div>
            )}

            {/* TAB 5: FOOD */}
            {activeTab === "food" && (
              <div className="studio-tab-body">
                <div className="food-guide-grid">
                  <div className="guide-card">
                    <h3>🍲 Must-Try Signature Dishes in {generatedPlan.tripMeta?.destination}</h3>
                    <ul className="guide-bullet-list">
                      {generatedPlan.foodSuggestions?.mustTryDishes?.map((dish, i) => (
                        <li key={i}>
                          <span className="dish-icon">🍽️</span> <strong>{dish}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="guide-card">
                    <h3>📍 Recommended Iconic Eateries & Cafes</h3>
                    <ul className="guide-bullet-list">
                      {generatedPlan.foodSuggestions?.recommendedSpots?.map((spot, i) => (
                        <li key={i}>
                          <span className="dish-icon">☕</span> <strong>{spot}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: TRANSIT & TRAVEL TIMES */}
            {activeTab === "transit" && (
              <div className="studio-tab-body">
                <div className="transit-guide-grid">
                  <div className="guide-card">
                    <h3>🚆 Getting There & Transit Overview</h3>
                    <p className="transit-desc-text">
                      <strong>How to reach:</strong> {generatedPlan.transportation?.gettingThere}
                    </p>
                    <p className="transit-desc-text">
                      <strong>Local commuting:</strong> {generatedPlan.transportation?.localTransit}
                    </p>
                    <div className="transit-fare-pill">
                      Average Local Transit Cost: {generatedPlan.transportation?.averageLocalFare}
                    </div>
                  </div>

                  <div className="guide-card">
                    <h3>⏱️ Estimated Travel Times Between Hubs</h3>
                    <div className="travel-times-list">
                      {generatedPlan.travelTimes?.map((item, i) => (
                        <div key={i} className="travel-time-row">
                          <span className="time-from-to">
                            📍 {item.from} ➔ 📍 {item.to}
                          </span>
                          <span className="time-duration-badge">⏱️ {item.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: PACKING CHECKLIST */}
            {activeTab === "packing" && (
              <div className="studio-tab-body">
                <div className="packing-checklist-card">
                  <h3>🎒 Weather & Terrain Tailored Packing Checklist</h3>
                  <p className="checklist-sub">Check off items as you pack for your {generatedPlan.tripMeta?.destination} trip!</p>
                  <div className="packing-items-grid">
                    {generatedPlan.packingList?.map((item, i) => (
                      <label key={i} className="packing-item-checkbox">
                        <input type="checkbox" defaultChecked={false} />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: ACCOMMODATION STAYS */}
            {activeTab === "stays" && (
              <div className="studio-tab-body">
                <div className="accommodations-grid">
                  {generatedPlan.accommodations?.map((stay, i) => (
                    <div key={i} className="stay-recommendation-card">
                      <div className="stay-card-top">
                        <span className="stay-type-badge">{stay.type}</span>
                        <span className="stay-rating-badge">★ {stay.rating}</span>
                      </div>
                      <h4>{stay.name}</h4>
                      <p className="stay-loc">📍 {stay.location}</p>
                      <div className="stay-price-row">
                        <span className="stay-price">₹{stay.pricePerNight}</span>
                        <span className="stay-unit">/ night</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Save Action Bar */}
            <div className="preview-bottom-save-bar">
              <div>
                <h4>Ready to take off?</h4>
                <p>Save this AI itinerary to track expenses, add bookings, and customize further.</p>
              </div>
              <button
                type="button"
                className="btn-save-trip-primary btn-save-large"
                onClick={handleSaveTripToDatabase}
                disabled={saving}
              >
                {saving ? "Saving to My Trips..." : "🚀 Save Itinerary to My Trips"}
              </button>
            </div>
          </div>
        )}

        {/* Modal: Edit Activity in Preview */}
        {editingAct && (
          <div className="modal-overlay" onClick={() => setEditingAct(null)}>
            <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>✏️ Edit Activity</h3>
                <button type="button" className="modal-close" onClick={() => setEditingAct(null)}>✕</button>
              </div>
              <form onSubmit={handleSaveEditedAct}>
                <div className="modal-form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={editActForm.title}
                    onChange={(e) => setEditActForm({ ...editActForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-form-row">
                  <div className="modal-form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      value={editActForm.time}
                      onChange={(e) => setEditActForm({ ...editActForm, time: e.target.value })}
                    />
                  </div>
                  <div className="modal-form-group">
                    <label>Category</label>
                    <select
                      value={editActForm.category}
                      onChange={(e) => setEditActForm({ ...editActForm, category: e.target.value })}
                    >
                      <option value="Activities">Activities</option>
                      <option value="Food">Food</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Accommodation">Accommodation</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label>Cost (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editActForm.cost}
                      onChange={(e) => setEditActForm({ ...editActForm, cost: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={editActForm.location}
                    onChange={(e) => setEditActForm({ ...editActForm, location: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label>Notes</label>
                  <textarea
                    rows="2"
                    value={editActForm.notes}
                    onChange={(e) => setEditActForm({ ...editActForm, notes: e.target.value })}
                  />
                </div>
                <div className="modal-actions-row">
                  <button type="button" className="btn-modal-cancel" onClick={() => setEditingAct(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-submit">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default PlanTrip;
