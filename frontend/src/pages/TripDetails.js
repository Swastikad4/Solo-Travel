import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AICommandBar from "../components/AICommandBar";
import TripMapView from "../components/TripMapView";
import WeatherWidget from "../components/WeatherWidget";
import SafetyHub from "../components/SafetyHub";
import ShareTripModal from "../components/ShareTripModal";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CATEGORIES = [
  { name: "Transportation", icon: "🚗", color: "#3b82f6" },
  { name: "Accommodation", icon: "🏨", color: "#8b5cf6" },
  { name: "Food", icon: "🍛", color: "#f59e0b" },
  { name: "Activities", icon: "🎯", color: "#10b981" },
  { name: "Miscellaneous", icon: "📦", color: "#ec4899" }
];

const TripDetails = () => {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("itinerary"); // 'itinerary', 'map', 'weather', 'safety', 'budget', 'food_transit', 'packing', 'stays', 'overview'
  const [aiInsights, setAiInsights] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Modals & form state
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [activityForm, setActivityForm] = useState({
    time: "09:00",
    title: "",
    category: "Activities",
    cost: "",
    location: "",
    notes: ""
  });

  const [editingActivity, setEditingActivity] = useState(null);
  const [targetDayForMove, setTargetDayForMove] = useState(1);

  // Edit Trip Settings Modal
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [tripSettingsForm, setTripSettingsForm] = useState({
    title: "",
    budget: "",
    travelers: 1,
    status: "Planning",
    notes: ""
  });

  // Custom Expense item form for budget tab
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "Transportation",
    cost: "",
    notes: ""
  });

  // Template loader state
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [optimizingBudget, setOptimizingBudget] = useState(false);

  const fetchTripDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/trips/${id}`);
      setTrip(res.data);
      setTripSettingsForm({
        title: res.data.title || "",
        budget: res.data.budget || 0,
        travelers: res.data.travelers || 1,
        status: res.data.status || "Planning",
        notes: res.data.notes || ""
      });

      // Load AI Destination Insights
      if (res.data?.destination) {
        fetchAIInsights(res.data.destination);
      }
    } catch (err) {
      setError("Failed to load trip details. It may not exist.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  const fetchAIInsights = async (destinationName) => {
    try {
      const res = await axios.post(`${API}/api/ai/plan-trip`, {
        destination: destinationName,
        days: 3,
        budget: 15000
      });
      if (res.data?.success) {
        setAiInsights(res.data);
      }
    } catch (err) {
      // Non-blocking fallback
    }
  };

  // ================= AI UPDATES =================
  const handleAIItineraryUpdated = async (newItinerary) => {
    try {
      const res = await axios.put(`${API}/api/trips/${id}/itinerary`, {
        itinerary: newItinerary
      });
      setTrip(res.data);
    } catch (err) {
      console.error("Failed to persist AI itinerary:", err);
    }
  };

  const handleAIOptimizeBudget = async () => {
    if (!trip || !trip.itinerary) return;
    setOptimizingBudget(true);
    try {
      const res = await axios.post(`${API}/api/ai/optimize-budget`, {
        currentItinerary: trip.itinerary,
        tripMeta: {
          destination: trip.destination,
          budget: trip.budget || 15000,
          travelers: trip.travelers || 1
        }
      });

      if (res.data?.success && Array.isArray(res.data.itinerary)) {
        const updateRes = await axios.put(`${API}/api/trips/${id}/itinerary`, {
          itinerary: res.data.itinerary
        });
        setTrip(updateRes.data);
        alert("✨ AI successfully optimized your itinerary budget!");
      }
    } catch (err) {
      alert("Could not optimize budget.");
    } finally {
      setOptimizingBudget(false);
    }
  };

  // ================= ACTIVITY CRUD & REORDER =================
  const handleOpenAddActivity = (dayNumber) => {
    setSelectedDayNumber(dayNumber);
    setActivityForm({
      time: "10:00",
      title: "",
      category: "Activities",
      cost: "",
      location: "",
      notes: ""
    });
    setIsAddActivityOpen(true);
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.title.trim()) return;

    try {
      const res = await axios.post(`${API}/api/trips/${id}/activity`, {
        dayNumber: selectedDayNumber,
        ...activityForm,
        cost: parseFloat(activityForm.cost) || 0
      });
      setTrip(res.data);
      setIsAddActivityOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || "Error adding activity");
    }
  };

  const handleOpenEditActivity = (dayNumber, activity) => {
    setEditingActivity(activity);
    setSelectedDayNumber(dayNumber);
    setTargetDayForMove(dayNumber);
    setActivityForm({
      time: activity.time || "09:00",
      title: activity.title || "",
      category: activity.category || "Activities",
      cost: activity.cost || 0,
      location: activity.location || "",
      notes: activity.notes || ""
    });
  };

  const handleSaveEditedActivity = async (e) => {
    e.preventDefault();
    if (!editingActivity || !activityForm.title.trim()) return;

    try {
      const res = await axios.put(`${API}/api/trips/${id}/activity/${editingActivity._id}`, {
        ...activityForm,
        cost: parseFloat(activityForm.cost) || 0,
        targetDayNumber: parseInt(targetDayForMove, 10)
      });
      setTrip(res.data);
      setEditingActivity(null);
    } catch (err) {
      alert(err.response?.data?.error || "Error updating activity");
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("Remove this activity from your itinerary?")) return;
    try {
      const res = await axios.delete(`${API}/api/trips/${id}/activity/${activityId}`);
      setTrip(res.data);
    } catch (err) {
      alert("Error deleting activity");
    }
  };

  const handleMoveActivityUpDown = async (dayNumber, activityIndex, direction) => {
    if (!trip || !trip.itinerary) return;

    const newItinerary = JSON.parse(JSON.stringify(trip.itinerary));
    const day = newItinerary.find((d) => d.dayNumber === dayNumber);
    if (!day || !day.activities) return;

    const targetIndex = direction === "up" ? activityIndex - 1 : activityIndex + 1;
    if (targetIndex < 0 || targetIndex >= day.activities.length) return;

    // Swap activities
    const temp = day.activities[activityIndex];
    day.activities[activityIndex] = day.activities[targetIndex];
    day.activities[targetIndex] = temp;

    try {
      const res = await axios.put(`${API}/api/trips/${id}/itinerary`, {
        itinerary: newItinerary
      });
      setTrip(res.data);
    } catch (err) {
      console.error("Failed to reorder activities:", err);
    }
  };

  const handleAddDay = async () => {
    if (!trip) return;
    const currentDays = trip.itinerary || [];
    const nextDayNumber = currentDays.length > 0 ? Math.max(...currentDays.map((d) => d.dayNumber)) + 1 : 1;

    const newDay = {
      dayNumber: nextDayNumber,
      title: `Day ${nextDayNumber}: ${trip.destination} Exploration`,
      activities: []
    };

    const newItinerary = [...currentDays, newDay];
    try {
      const res = await axios.put(`${API}/api/trips/${id}/itinerary`, {
        itinerary: newItinerary
      });
      setTrip(res.data);
    } catch (err) {
      alert("Error adding new day");
    }
  };

  const handleRemoveDay = async (dayNumber) => {
    if (!window.confirm(`Delete Day ${dayNumber} and all its activities?`)) return;
    const newItinerary = trip.itinerary
      .filter((d) => d.dayNumber !== dayNumber)
      .map((d, index) => ({
        ...d,
        dayNumber: index + 1
      }));

    try {
      const res = await axios.put(`${API}/api/trips/${id}/itinerary`, {
        itinerary: newItinerary
      });
      setTrip(res.data);
    } catch (err) {
      alert("Error removing day");
    }
  };

  const handleLoadDestinationTemplate = async () => {
    if (!window.confirm(`Load recommended solo travel itinerary for ${trip.destination}? This will replace current days.`)) return;
    setLoadingTemplate(true);
    try {
      const daysCount = trip.itinerary?.length || 3;
      const res = await axios.get(`${API}/api/trips/templates/${encodeURIComponent(trip.destination)}?days=${daysCount}`);
      if (res.data?.itinerary) {
        const updateRes = await axios.put(`${API}/api/trips/${id}/itinerary`, {
          itinerary: res.data.itinerary
        });
        setTrip(updateRes.data);
      }
    } catch (err) {
      alert("Could not load template for this destination.");
    } finally {
      setLoadingTemplate(false);
    }
  };

  // ================= EXPENSES & BUDGET =================
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title.trim() || !expenseForm.cost) return;

    try {
      const res = await axios.post(`${API}/api/trips/${id}/expense`, {
        ...expenseForm,
        cost: parseFloat(expenseForm.cost) || 0
      });
      setTrip(res.data);
      setIsAddExpenseOpen(false);
      setExpenseForm({ title: "", category: "Transportation", cost: "", notes: "" });
    } catch (err) {
      alert("Error adding expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const res = await axios.delete(`${API}/api/trips/${id}/expense/${expenseId}`);
      setTrip(res.data);
    } catch (err) {
      alert("Error deleting expense");
    }
  };

  const handleSaveTripSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API}/api/trips/${id}`, {
        title: tripSettingsForm.title,
        budget: parseFloat(tripSettingsForm.budget) || 0,
        travelers: parseInt(tripSettingsForm.travelers, 10) || 1,
        status: tripSettingsForm.status,
        notes: tripSettingsForm.notes
      });
      setTrip(res.data);
      setIsEditTripOpen(false);
    } catch (err) {
      alert("Error updating trip settings");
    }
  };

  const handlePrintItinerary = () => {
    window.print();
  };

  // ================= CALCULATIONS =================
  const calculateMetrics = () => {
    if (!trip) return { total: 0, perPerson: 0, perDay: 0, remaining: 0, categories: {} };

    const categories = {
      Transportation: 0,
      Accommodation: 0,
      Food: 0,
      Activities: 0,
      Miscellaneous: 0
    };

    let totalActivitiesCost = 0;
    if (Array.isArray(trip.itinerary)) {
      trip.itinerary.forEach((day) => {
        if (Array.isArray(day.activities)) {
          day.activities.forEach((act) => {
            const cost = Number(act.cost) || 0;
            const cat = act.category || "Activities";
            if (categories[cat] !== undefined) {
              categories[cat] += cost;
            } else {
              categories.Miscellaneous += cost;
            }
            totalActivitiesCost += cost;
          });
        }
      });
    }

    let totalExpensesCost = 0;
    if (Array.isArray(trip.expenses)) {
      trip.expenses.forEach((exp) => {
        const cost = Number(exp.cost) || 0;
        const cat = exp.category || "Miscellaneous";
        if (categories[cat] !== undefined) {
          categories[cat] += cost;
        } else {
          categories.Miscellaneous += cost;
        }
        totalExpensesCost += cost;
      });
    }

    const total = totalActivitiesCost + totalExpensesCost;
    const travelers = Math.max(1, Number(trip.travelers) || 1);
    const days = Math.max(1, trip.itinerary?.length || 1);
    const budget = Number(trip.budget) || 0;
    const remaining = budget - total;

    return {
      total,
      perPerson: Math.round(total / travelers),
      perDay: Math.round(total / days),
      budget,
      remaining,
      categories
    };
  };

  const metrics = calculateMetrics();
  const percentSpent = metrics.budget > 0 ? Math.min(100, Math.round((metrics.total / metrics.budget) * 100)) : 0;
  const isOverBudget = metrics.budget > 0 && metrics.total > metrics.budget;

  if (loading) {
    return (
      <div className="trip-details-page">
        <Navbar />
        <div className="container loading-container">
          <div className="spinner"></div>
          <p>Loading your Indian travel workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="trip-details-page">
        <Navbar />
        <div className="container error-container">
          <h2>⚠️ Itinerary Not Found</h2>
          <p>{error || "This trip does not exist or has been removed."}</p>
          <Link to="/trips" className="btn-back-link">
            ← Return to My Trips
          </Link>
        </div>
      </div>
    );
  }

  const startDate = trip.startDate ? new Date(trip.startDate) : null;
  const endDate = trip.endDate ? new Date(trip.endDate) : null;

  return (
    <div className="trip-details-page">
      <Navbar />

      {/* Hero / Header Section */}
      <div className="trip-hero-section">
        <div className="trip-hero-bg">
          <img
            src={trip.coverImage || "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200"}
            alt={trip.destination}
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="container trip-hero-content">
          <div className="breadcrumb breadcrumb-light">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/trips">My Trips</Link>
            <span>/</span>
            <span className="breadcrumb-current">{trip.destination}</span>
          </div>

          <div className="trip-hero-header-flex">
            <div>
              <div className="trip-badge-row">
                <span className="badge-trip-status" data-status={trip.status || "Planning"}>
                  ● {trip.status || "Planning"}
                </span>
                <span className="badge-trip-dest">📍 {trip.destination}</span>
                <span className="badge-trip-travelers">
                  👥 {trip.travelers || 1} {trip.travelers > 1 ? "Travelers" : "Solo Traveler"}
                </span>
              </div>
              <h1 className="trip-main-title">{trip.title || `${trip.destination} Solo Journey`}</h1>
              <p className="trip-dates-text">
                🗓️ {startDate ? startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "TBD"} –{" "}
                {endDate ? endDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                <span className="trip-duration-pill">
                  ({trip.itinerary?.length || 1} {(trip.itinerary?.length || 1) === 1 ? "Day" : "Days"})
                </span>
              </p>
            </div>

            <div className="trip-hero-actions">
              <button type="button" className="btn-hero-share" onClick={() => setIsShareModalOpen(true)}>
                🔗 Share Trip
              </button>
              <button type="button" className="btn-hero-edit" onClick={() => setIsEditTripOpen(true)}>
                ⚙️ Trip Settings
              </button>
              <button type="button" className="btn-hero-print" onClick={handlePrintItinerary} title="Print or Save PDF">
                🖨️ Export PDF
              </button>
              <Link to={`/destination/${trip.destination.toLowerCase().replace(/\s+/g, "-")}`} className="btn-hero-explore">
                🇮🇳 Destination Guide
              </Link>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="trip-tabs-nav">
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === "itinerary" ? "active" : ""}`}
              onClick={() => setActiveTab("itinerary")}
            >
              📅 Itinerary Timeline ({trip.itinerary?.length || 0} Days)
            </button>
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === "map" ? "active" : ""}`}
              onClick={() => setActiveTab("map")}
            >
              🗺️ Route Map (Hotel ➔ Sight ➔ Food ➔ Activity)
            </button>
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === "weather" ? "active" : ""}`}
              onClick={() => setActiveTab("weather")}
            >
              🌦️ Live Weather & Forecast
            </button>
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === "safety" ? "active" : ""}`}
              onClick={() => setActiveTab("safety")}
            >
              🛡️ Safety & Helplines
            </button>
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === "budget" ? "active" : ""}`}
              onClick={() => setActiveTab("budget")}
            >
              💰 Budget Calculator (₹{metrics.total.toLocaleString("en-IN")})
            </button>
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === "food_transit" ? "active" : ""}`}
              onClick={() => setActiveTab("food_transit")}
            >
              🍛 Food & Transit
            </button>
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === "packing" ? "active" : ""}`}
              onClick={() => setActiveTab("packing")}
            >
              🎒 Packing Checklist
            </button>
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === "stays" ? "active" : ""}`}
              onClick={() => setActiveTab("stays")}
            >
              🏨 Stays
            </button>
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📝 Notes
            </button>
          </div>
        </div>
      </div>

      <div className="container trip-main-body">
        {/* ================= TAB 1: ITINERARY TIMELINE ================= */}
        {activeTab === "itinerary" && (
          <div className="tab-content-itinerary">
            {/* AI Command Toolbar Embedded */}
            <AICommandBar
              itinerary={trip.itinerary || []}
              tripMeta={{
                destination: trip.destination,
                budget: trip.budget,
                travelers: trip.travelers
              }}
              onItineraryUpdated={handleAIItineraryUpdated}
              totalDays={trip.itinerary?.length || 1}
            />

            <div className="itinerary-actions-bar">
              <div className="itinerary-summary-info">
                <h3>🗓️ Day-by-Day Solo Schedule</h3>
                <p>Add activities, customize timings, reorder items, and move plans between days.</p>
              </div>

              <div className="itinerary-btn-group">
                <button
                  type="button"
                  className="btn-template-load"
                  onClick={handleLoadDestinationTemplate}
                  disabled={loadingTemplate}
                  title="Load suggested Indian itinerary template"
                >
                  {loadingTemplate ? "Loading..." : "✨ Load Template"}
                </button>
                <button type="button" className="btn-add-day" onClick={handleAddDay}>
                  ➕ Add Day
                </button>
              </div>
            </div>

            {/* Days List */}
            {!trip.itinerary || trip.itinerary.length === 0 ? (
              <div className="empty-itinerary-box">
                <h4>No days in your itinerary yet</h4>
                <p>Start by adding your first day or using the AI Assistant above!</p>
                <button type="button" className="btn-add-day" onClick={handleAddDay}>
                  ➕ Add Day 1
                </button>
              </div>
            ) : (
              <div className="itinerary-days-container">
                {trip.itinerary.map((day) => {
                  const dayCost = (day.activities || []).reduce(
                    (sum, a) => sum + (Number(a.cost) || 0),
                    0
                  );

                  return (
                    <div key={day.dayNumber} className="day-planner-card">
                      <div className="day-planner-header">
                        <div className="day-header-title-group">
                          <span className="day-badge-num">Day {day.dayNumber}</span>
                          <h4 className="day-title-text">{day.title || `Day ${day.dayNumber} Exploration`}</h4>
                          {day.theme && <span className="day-theme-pill">{day.theme}</span>}
                        </div>

                        <div className="day-header-meta">
                          <span className="day-cost-tag">
                            Day Total: <strong>₹{dayCost.toLocaleString("en-IN")}</strong>
                          </span>
                          <button
                            type="button"
                            className="btn-day-add-act"
                            onClick={() => handleOpenAddActivity(day.dayNumber)}
                          >
                            ➕ Add Activity
                          </button>
                          {trip.itinerary.length > 1 && (
                            <button
                              type="button"
                              className="btn-day-remove"
                              onClick={() => handleRemoveDay(day.dayNumber)}
                              title="Delete this entire day"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Activities Timeline */}
                      <div className="day-timeline-wrapper">
                        {!day.activities || day.activities.length === 0 ? (
                          <div className="empty-day-activities">
                            <p>No activities scheduled for Day {day.dayNumber}.</p>
                            <button
                              type="button"
                              className="btn-inline-add-act"
                              onClick={() => handleOpenAddActivity(day.dayNumber)}
                            >
                              + Add Breakfast, Attraction, or Transport
                            </button>
                          </div>
                        ) : (
                          <div className="timeline-tree">
                            {day.activities.map((act, index) => {
                              const isLast = index === day.activities.length - 1;
                              const categoryInfo =
                                CATEGORIES.find((c) => c.name === act.category) ||
                                CATEGORIES[3];

                              return (
                                <div key={act._id || index} className="timeline-item-row">
                                  {/* Tree Branch Symbol */}
                                  <div className="timeline-tree-node">
                                    <div className="tree-symbol">
                                      {isLast ? "└──" : "├──"}
                                    </div>
                                    <div
                                      className="tree-dot"
                                      style={{ backgroundColor: categoryInfo.color }}
                                    ></div>
                                  </div>

                                  {/* Activity Card */}
                                  <div className="activity-card-item">
                                    <div className="activity-card-top">
                                      <div className="activity-time-badge">
                                        ⏰ {act.time || "09:00"}
                                      </div>
                                      <span
                                        className="activity-cat-badge"
                                        style={{
                                          backgroundColor: `${categoryInfo.color}20`,
                                          color: categoryInfo.color,
                                          border: `1px solid ${categoryInfo.color}50`
                                        }}
                                      >
                                        {categoryInfo.icon} {act.category || "Activities"}
                                      </span>
                                      <div className="activity-cost-badge">
                                        ₹{(Number(act.cost) || 0).toLocaleString("en-IN")}
                                      </div>
                                    </div>

                                    <div className="activity-card-content">
                                      <h5 className="activity-title">{act.title}</h5>
                                      {act.location && (
                                        <div className="activity-location">
                                          📍 {act.location}
                                        </div>
                                      )}
                                      {act.notes && (
                                        <div className="activity-notes">
                                          💡 {act.notes}
                                        </div>
                                      )}
                                    </div>

                                    {/* Action buttons: Edit, Reorder, Delete */}
                                    <div className="activity-card-actions">
                                      <div className="reorder-btns">
                                        <button
                                          type="button"
                                          className="btn-order-arrow"
                                          disabled={index === 0}
                                          onClick={() =>
                                            handleMoveActivityUpDown(day.dayNumber, index, "up")
                                          }
                                          title="Move activity up"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          className="btn-order-arrow"
                                          disabled={index === day.activities.length - 1}
                                          onClick={() =>
                                            handleMoveActivityUpDown(day.dayNumber, index, "down")
                                          }
                                          title="Move activity down"
                                        >
                                          ▼
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        className="btn-act-edit"
                                        onClick={() => handleOpenEditActivity(day.dayNumber, act)}
                                        title="Edit Activity"
                                      >
                                        ✏️ Edit
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-act-delete"
                                        onClick={() => handleDeleteActivity(act._id)}
                                        title="Delete Activity"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: ROUTE MAP ================= */}
        {activeTab === "map" && (
          <div className="tab-content-map animate-fade-in">
            <TripMapView destination={trip.destination} itinerary={trip.itinerary} />
          </div>
        )}

        {/* ================= TAB 3: WEATHER & FORECAST ================= */}
        {activeTab === "weather" && (
          <div className="tab-content-weather animate-fade-in">
            <WeatherWidget destination={trip.destination} />
          </div>
        )}

        {/* ================= TAB 4: SAFETY & HELPLINES ================= */}
        {activeTab === "safety" && (
          <div className="tab-content-safety animate-fade-in">
            <SafetyHub destination={trip.destination} />
          </div>
        )}

        {/* ================= TAB 5: BUDGET CALCULATOR ================= */}
        {activeTab === "budget" && (
          <div className="tab-content-budget animate-fade-in">
            {/* Top Overview KPI Cards */}
            <div className="budget-kpi-grid">
              <div className="budget-kpi-card">
                <span className="kpi-icon">🎯</span>
                <div className="kpi-info">
                  <div className="kpi-value">₹{metrics.budget.toLocaleString("en-IN")}</div>
                  <div className="kpi-label">Target Budget</div>
                </div>
              </div>

              <div className="budget-kpi-card highlight-planned">
                <span className="kpi-icon">💵</span>
                <div className="kpi-info">
                  <div className="kpi-value">₹{metrics.total.toLocaleString("en-IN")}</div>
                  <div className="kpi-label">Total Planned Expenses</div>
                </div>
              </div>

              <div className={`budget-kpi-card ${isOverBudget ? "danger" : "success"}`}>
                <span className="kpi-icon">{isOverBudget ? "⚠️" : "⚖️"}</span>
                <div className="kpi-info">
                  <div className="kpi-value">
                    {isOverBudget
                      ? `-₹${Math.abs(metrics.remaining).toLocaleString("en-IN")}`
                      : `₹${metrics.remaining.toLocaleString("en-IN")}`}
                  </div>
                  <div className="kpi-label">{isOverBudget ? "Over Budget" : "Remaining Budget"}</div>
                </div>
              </div>

              <div className="budget-kpi-card">
                <span className="kpi-icon">👤</span>
                <div className="kpi-info">
                  <div className="kpi-value">₹{metrics.perPerson.toLocaleString("en-IN")}</div>
                  <div className="kpi-label">Per Person ({trip.travelers || 1} Travelers)</div>
                </div>
              </div>

              <div className="budget-kpi-card">
                <span className="kpi-icon">📅</span>
                <div className="kpi-info">
                  <div className="kpi-value">₹{metrics.perDay.toLocaleString("en-IN")}</div>
                  <div className="kpi-label">Per Day ({trip.itinerary?.length || 1} Days)</div>
                </div>
              </div>
            </div>

            {/* AI Optimize Budget Action Box */}
            <div className="budget-ai-optimizer-banner">
              <div>
                <h4>🤖 AI Budget Optimizer</h4>
                <p>Automatically tune itinerary costs, scale down transport and suggest budget local dhabas to fit within your target fund.</p>
              </div>
              <button
                type="button"
                className="btn-ai-optimize-budget"
                onClick={handleAIOptimizeBudget}
                disabled={optimizingBudget}
              >
                {optimizingBudget ? "Optimizing..." : "✨ Run AI Budget Optimizer"}
              </button>
            </div>

            {/* Budget Health Progress Bar */}
            <div className="budget-gauge-box">
              <div className="gauge-header-row">
                <h4>📊 Budget Utilization</h4>
                <span className={`gauge-percentage-badge ${isOverBudget ? "badge-danger" : "badge-safe"}`}>
                  {percentSpent}% Spent
                </span>
              </div>
              <div className="gauge-track-large">
                <div
                  className={`gauge-fill-large ${isOverBudget ? "gauge-fill-over" : ""}`}
                  style={{ width: `${percentSpent}%` }}
                ></div>
              </div>
              <div className="gauge-footer-note">
                {isOverBudget ? (
                  <span className="text-danger">
                    ⚠️ You are exceeding your allocated budget of ₹{metrics.budget.toLocaleString("en-IN")} by ₹{Math.abs(metrics.remaining).toLocaleString("en-IN")}.
                  </span>
                ) : (
                  <span className="text-success">
                    ✅ Great planning! You still have ₹{metrics.remaining.toLocaleString("en-IN")} remaining in your travel fund.
                  </span>
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="budget-category-section">
              <h3>🏷️ Expenses by Category</h3>
              <p className="section-desc">Real-time breakdown across all scheduled itinerary activities and separate expense items.</p>

              <div className="category-cards-grid">
                {CATEGORIES.map((cat) => {
                  const catAmount = metrics.categories[cat.name] || 0;
                  const catPercentage = metrics.total > 0 ? Math.round((catAmount / metrics.total) * 100) : 0;

                  return (
                    <div key={cat.name} className="cat-breakdown-card">
                      <div className="cat-card-header">
                        <span className="cat-icon-badge" style={{ backgroundColor: `${cat.color}25`, color: cat.color }}>
                          {cat.icon}
                        </span>
                        <div className="cat-name">{cat.name}</div>
                        <div className="cat-pct">{catPercentage}%</div>
                      </div>
                      <div className="cat-amount">₹{catAmount.toLocaleString("en-IN")}</div>
                      <div className="cat-bar-mini">
                        <div
                          className="cat-bar-mini-fill"
                          style={{ width: `${catPercentage}%`, backgroundColor: cat.color }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Custom Expenses Tracker */}
            <div className="custom-expenses-section">
              <div className="expenses-section-header">
                <div>
                  <h3>🎟️ Pre-Trip & Transit Expenses</h3>
                  <p>Track flights, trains, hotel deposits, or gear outside daily schedule.</p>
                </div>
                <button type="button" className="btn-add-expense" onClick={() => setIsAddExpenseOpen(true)}>
                  ➕ Add Expense Item
                </button>
              </div>

              {!trip.expenses || trip.expenses.length === 0 ? (
                <div className="empty-expenses-box">
                  <p>No extra fixed expenses added yet. (e.g. Sleeper train tickets, flight bookings, gear)</p>
                  <button type="button" className="btn-inline-add-act" onClick={() => setIsAddExpenseOpen(true)}>
                    + Add Fixed Expense
                  </button>
                </div>
              ) : (
                <div className="expenses-table-wrapper">
                  <table className="expenses-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Cost</th>
                        <th>Notes</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trip.expenses.map((exp) => {
                        const cat = CATEGORIES.find((c) => c.name === exp.category) || CATEGORIES[4];
                        return (
                          <tr key={exp._id}>
                            <td className="fw-semibold">{exp.title}</td>
                            <td>
                              <span className="cat-tag-pill" style={{ color: cat.color, backgroundColor: `${cat.color}15` }}>
                                {cat.icon} {exp.category}
                              </span>
                            </td>
                            <td className="expense-cost-val">₹{(Number(exp.cost) || 0).toLocaleString("en-IN")}</td>
                            <td className="expense-notes-col">{exp.notes || "—"}</td>
                            <td>
                              <button
                                type="button"
                                className="btn-del-expense"
                                onClick={() => handleDeleteExpense(exp._id)}
                                title="Remove expense"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 6: FOOD & TRANSIT GUIDE ================= */}
        {activeTab === "food_transit" && (
          <div className="tab-content-food-transit animate-fade-in">
            <div className="food-guide-grid">
              <div className="guide-card">
                <h3>🍲 Signature Local Dishes in {trip.destination}</h3>
                <ul className="guide-bullet-list">
                  {(aiInsights?.foodSuggestions?.mustTryDishes || [
                    `Authentic Regional ${trip.destination} Special Thali`,
                    "Fresh Masala Chai & Local Savory Snacks",
                    "Traditional Sweet Delicacies in Clay Pots",
                    "Regional Slow-Cooked Specialties"
                  ]).map((dish, i) => (
                    <li key={i}>
                      <span className="dish-icon">🍽️</span> <strong>{dish}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="guide-card">
                <h3>📍 Recommended Iconic Eateries</h3>
                <ul className="guide-bullet-list">
                  {(aiInsights?.foodSuggestions?.recommendedSpots || [
                    `Famous Heritage Dhaba near ${trip.destination} Old Market`,
                    "Traveler Garden Cafe & Workation Hub",
                    "Street Food Chowk for Evening Snacks",
                    "Rooftop Sunset Dining"
                  ]).map((spot, i) => (
                    <li key={i}>
                      <span className="dish-icon">☕</span> <strong>{spot}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="transit-guide-grid" style={{ marginTop: "24px" }}>
              <div className="guide-card">
                <h3>🚆 Transit & Local Commute</h3>
                <p className="transit-desc-text">
                  <strong>How to Reach:</strong> {aiInsights?.transportation?.gettingThere || "Connected via nearest Indian Railways junction and national highways."}
                </p>
                <p className="transit-desc-text">
                  <strong>Local Transit:</strong> {aiInsights?.transportation?.localTransit || "Rental scooters (₹400/day), shared auto-rickshaws, and local buses."}
                </p>
              </div>

              <div className="guide-card">
                <h3>⏱️ Estimated Travel Times Between Spots</h3>
                <div className="travel-times-list">
                  {(aiInsights?.travelTimes || [
                    { from: "Transit Hub", to: "City Center", duration: "15-20 mins" },
                    { from: "Hostel / Stay", to: "Main Landmark", duration: "10-15 mins" },
                    { from: "City Center", to: "Sunset Point", duration: "25 mins" }
                  ]).map((item, i) => (
                    <div key={i} className="travel-time-row">
                      <span className="time-from-to">📍 {item.from} ➔ 📍 {item.to}</span>
                      <span className="time-duration-badge">⏱️ {item.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: PACKING CHECKLIST ================= */}
        {activeTab === "packing" && (
          <div className="tab-content-packing animate-fade-in">
            <div className="packing-checklist-card">
              <h3>🎒 Weather & Destination Packing Checklist</h3>
              <p className="checklist-sub">Check off items as you pack for your {trip.destination} expedition!</p>
              <div className="packing-items-grid">
                {(aiInsights?.packingList || [
                  "Comfortable walking / trekking shoes with grip",
                  "Layered clothing appropriate for climate",
                  "Power bank (10,000mAh+) & multi-plug adapter",
                  "Personal first-aid kit with altitude/motion sickness tablets",
                  "Aadhaar Card / Govt ID original and photocopies",
                  "Reusable insulated water bottle",
                  "Emergency cash notes (₹500 / ₹100)"
                ]).map((item, i) => (
                  <label key={i} className="packing-item-checkbox">
                    <input type="checkbox" defaultChecked={false} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 8: ACCOMMODATION STAYS ================= */}
        {activeTab === "stays" && (
          <div className="tab-content-stays animate-fade-in">
            <h3 style={{ marginBottom: "16px" }}>🏨 Recommended Stays for {trip.destination}</h3>
            <div className="accommodations-grid">
              {(aiInsights?.accommodations || [
                { name: `${trip.destination} Backpacker Hostel`, type: "Backpacker Hostel", pricePerNight: 650, location: "City Center", rating: 4.8 },
                { name: `${trip.destination} Heritage Homestay`, type: "Cozy Homestay", pricePerNight: 1500, location: "Quiet Quarter", rating: 4.7 },
                { name: `${trip.destination} Mountain/Boutique Stay`, type: "Boutique Stay", pricePerNight: 3200, location: "Scenic Vista", rating: 4.9 }
              ]).map((stay, i) => (
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

        {/* ================= TAB 9: OVERVIEW & NOTES ================= */}
        {activeTab === "overview" && (
          <div className="tab-content-overview animate-fade-in">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>📝 Solo Traveler Notes & Preferences</h3>
                <p className="notes-body-text">{trip.notes || "No custom traveler notes provided yet."}</p>
                <button type="button" className="btn-edit-notes" onClick={() => setIsEditTripOpen(true)}>
                  ✏️ Edit Trip Notes
                </button>
              </div>

              <div className="overview-card">
                <h3>🛡️ Indian Solo Travel Safety Checklist</h3>
                <ul className="safety-checklist">
                  <li>✅ Share live GPS location with trusted emergency contacts.</li>
                  <li>✅ Keep physical photocopy & digital cloud backup of Aadhaar / Passport.</li>
                  <li>✅ Carry cash (₹500 / ₹100 notes) as remote mountain/coastal vendors may have weak UPI signals.</li>
                  <li>✅ Install offline Google Maps / MapMyIndia for offline navigation.</li>
                  <li>✅ Verified tourist helpline in India: Dial <strong>1363</strong> (Toll Free).</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD ACTIVITY ================= */}
      {isAddActivityOpen && (
        <div className="modal-overlay" onClick={() => setIsAddActivityOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add Activity to Day {selectedDayNumber}</h3>
              <button type="button" className="modal-close" onClick={() => setIsAddActivityOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveActivity}>
              <div className="modal-form-group">
                <label>Activity Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Breakfast at German Bakery, Amer Fort Tour"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={activityForm.time}
                    onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Category</label>
                  <select
                    value={activityForm.category}
                    onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Cost (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={activityForm.cost}
                    onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Location / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Old Manali, Tapovan, Assi Ghat"
                  value={activityForm.location}
                  onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label>Notes / Meetup Details</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Great photography spot, order special thali"
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsAddActivityOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Add to Itinerary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT / MOVE ACTIVITY ================= */}
      {editingActivity && (
        <div className="modal-overlay" onClick={() => setEditingActivity(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Activity & Schedule</h3>
              <button type="button" className="modal-close" onClick={() => setEditingActivity(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEditedActivity}>
              <div className="modal-form-group">
                <label>Activity Title *</label>
                <input
                  type="text"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label>Move / Assign Day</label>
                  <select
                    value={targetDayForMove}
                    onChange={(e) => setTargetDayForMove(parseInt(e.target.value, 10))}
                  >
                    {trip.itinerary?.map((d) => (
                      <option key={d.dayNumber} value={d.dayNumber}>
                        Day {d.dayNumber}: {d.title || `Day ${d.dayNumber}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={activityForm.time}
                    onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Cost (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={activityForm.cost}
                    onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select
                    value={activityForm.category}
                    onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-form-group" style={{ flex: 2 }}>
                  <label>Location</label>
                  <input
                    type="text"
                    value={activityForm.location}
                    onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Notes</label>
                <textarea
                  rows="2"
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setEditingActivity(null)}>
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

      {/* ================= MODAL: EDIT TRIP SETTINGS ================= */}
      {isEditTripOpen && (
        <div className="modal-overlay" onClick={() => setIsEditTripOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ Trip Settings & Budget</h3>
              <button type="button" className="modal-close" onClick={() => setIsEditTripOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveTripSettings}>
              <div className="modal-form-group">
                <label>Trip Title</label>
                <input
                  type="text"
                  value={tripSettingsForm.title}
                  onChange={(e) => setTripSettingsForm({ ...tripSettingsForm, title: e.target.value })}
                  placeholder="e.g. Royal Udaipur Solo Expedition"
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label>Target Budget (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={tripSettingsForm.budget}
                    onChange={(e) => setTripSettingsForm({ ...tripSettingsForm, budget: e.target.value })}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Number of Travelers</label>
                  <input
                    type="number"
                    min="1"
                    value={tripSettingsForm.travelers}
                    onChange={(e) => setTripSettingsForm({ ...tripSettingsForm, travelers: e.target.value })}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Status</label>
                  <select
                    value={tripSettingsForm.status}
                    onChange={(e) => setTripSettingsForm({ ...tripSettingsForm, status: e.target.value })}
                  >
                    <option value="Planning">Planning</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="modal-form-group">
                <label>Trip Notes</label>
                <textarea
                  rows="3"
                  value={tripSettingsForm.notes}
                  onChange={(e) => setTripSettingsForm({ ...tripSettingsForm, notes: e.target.value })}
                  placeholder="Packing list, flight details, hostel contacts..."
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsEditTripOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Save Trip Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD EXPENSE ================= */}
      {isAddExpenseOpen && (
        <div className="modal-overlay" onClick={() => setIsAddExpenseOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add Fixed / Transit Expense</h3>
              <button type="button" className="modal-close" onClick={() => setIsAddExpenseOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveExpense}>
              <div className="modal-form-group">
                <label>Expense Name *</label>
                <input
                  type="text"
                  placeholder="e.g. AC 2-Tier Train Delhi to Jaipur, Hostel Deposit"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label>Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Cost (₹ INR) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={expenseForm.cost}
                    onChange={(e) => setExpenseForm({ ...expenseForm, cost: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Booking PNR, Confirmation Code"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsAddExpenseOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SHARE TRIP ================= */}
      <ShareTripModal
        trip={trip}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onTripUpdated={(updated) => setTrip(updated)}
      />

      <Footer />
    </div>
  );
};

export default TripDetails;
