import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import ShareTripModal from "../components/ShareTripModal";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const MyTrips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'Planning', 'Confirmed', 'Completed'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTripToShare, setSelectedTripToShare] = useState(null);

  const currentUserId = user?.name || localStorage.getItem("soloTravelerName") || "";

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch user trips or all public solo trips
      const url = currentUserId 
        ? `${API}/api/trips?userId=${encodeURIComponent(currentUserId)}`
        : `${API}/api/trips`;
      const res = await axios.get(url);
      let data = Array.isArray(res.data) ? res.data : [];
      
      // If user has no specific trips yet, fetch all available trips
      if (data.length === 0 && currentUserId) {
        const allRes = await axios.get(`${API}/api/trips`);
        data = Array.isArray(allRes.data) ? allRes.data : [];
      }
      setTrips(data);
    } catch (err) {
      setError("Failed to load trips. Please check server connection.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDeleteTrip = async (e, tripId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this trip itinerary?")) return;
    try {
      await axios.delete(`${API}/api/trips/${tripId}`);
      setTrips(trips.filter((t) => t._id !== tripId));
    } catch (err) {
      alert("Failed to delete trip");
    }
  };

  // Compute stats
  const totalTrips = trips.length;
  const totalBudget = trips.reduce((sum, t) => sum + (Number(t.budget) || 0), 0);
  const totalDays = trips.reduce((sum, t) => {
    if (t.startDate && t.endDate) {
      const d = Math.max(1, Math.ceil((new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24)) + 1);
      return sum + d;
    }
    return sum + (t.itinerary ? t.itinerary.length : 1);
  }, 0);

  // Filtered trips
  const filteredTrips = trips.filter((t) => {
    const matchesFilter = filter === "all" || t.status === filter;
    const matchesSearch =
      (t.destination && t.destination.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Calculate planned cost for a trip
  const calculateTripTotal = (trip) => {
    let sum = 0;
    if (Array.isArray(trip.itinerary)) {
      trip.itinerary.forEach((day) => {
        if (Array.isArray(day.activities)) {
          day.activities.forEach((act) => {
            sum += Number(act.cost) || 0;
          });
        }
      });
    }
    if (Array.isArray(trip.expenses)) {
      trip.expenses.forEach((exp) => {
        sum += Number(exp.cost) || 0;
      });
    }
    return sum;
  };

  return (
    <div className="mytrips-page">
      <Navbar />

      <div className="mytrips-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="breadcrumb-current">My Trips</span>
          </div>
          <div className="mytrips-header-flex">
            <div>
              <h1>🇮🇳 My Bharat Travel Itineraries</h1>
              <p className="mytrips-subtitle">
                Plan, organize day-by-day schedules, and track your solo travel budget across India.
              </p>
            </div>
            <Link to="/plan" className="btn-create-trip-cta">
              <span>➕</span> Plan New Trip
            </Link>
          </div>

          {/* Quick Stats Bar */}
          <div className="mytrips-stats-bar">
            <div className="stat-card">
              <div className="stat-icon">🗺️</div>
              <div>
                <div className="stat-val">{totalTrips}</div>
                <div className="stat-lbl">Planned Expeditions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div>
                <div className="stat-val">{totalDays}</div>
                <div className="stat-lbl">Total Days in India</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div>
                <div className="stat-val">₹{totalBudget.toLocaleString("en-IN")}</div>
                <div className="stat-lbl">Target Travel Budget</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎒</div>
              <div>
                <div className="stat-val">{currentUserId || "Solo Traveler"}</div>
                <div className="stat-lbl">Active Explorer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mytrips-main-content">
        {/* Filter and Search Bar */}
        <div className="mytrips-filters-row">
          <div className="mytrips-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by destination (e.g. Manali, Goa, Jaipur)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          <div className="mytrips-tab-pills">
            {["all", "Planning", "Confirmed", "Completed"].map((status) => (
              <button
                key={status}
                className={`tab-pill ${filter === status ? "active" : ""}`}
                onClick={() => setFilter(status)}
              >
                {status === "all" ? "All Trips" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your Indian travel itineraries...</p>
          </div>
        ) : error ? (
          <div className="error-alert">
            <p>⚠️ {error}</p>
            <button onClick={fetchTrips} className="btn-retry">
              Retry
            </button>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="empty-trips-card">
            <div className="empty-icon">🎒</div>
            <h3>No trips found</h3>
            <p>
              {searchQuery || filter !== "all"
                ? "No trips matched your current filters. Try changing search terms."
                : "You haven't created any travel itineraries yet. Start planning your dream solo trip across India!"}
            </p>
            <Link to="/plan" className="btn-start-planning">
              🚀 Create Your First Trip
            </Link>
          </div>
        ) : (
          <div className="trips-cards-grid">
            {filteredTrips.map((trip) => {
              const startDate = trip.startDate ? new Date(trip.startDate) : null;
              const endDate = trip.endDate ? new Date(trip.endDate) : null;
              const daysCount =
                startDate && endDate
                  ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1)
                  : trip.itinerary?.length || 1;
              const plannedCost = calculateTripTotal(trip);
              const targetBudget = Number(trip.budget) || 0;
              const percentBudget = targetBudget > 0 ? Math.min(100, Math.round((plannedCost / targetBudget) * 100)) : 0;
              const isOverBudget = targetBudget > 0 && plannedCost > targetBudget;

              return (
                <div
                  key={trip._id}
                  className="trip-card-v2"
                  onClick={() => navigate(`/trips/${trip._id}`)}
                >
                  <div className="trip-card-image-wrap">
                    <img
                      src={
                        trip.coverImage ||
                        "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800"
                      }
                      alt={trip.destination}
                      className="trip-card-img"
                    />
                    <div className="trip-status-badge" data-status={trip.status || "Planning"}>
                      {trip.status || "Planning"}
                    </div>
                    <div className="trip-days-badge">
                      📅 {daysCount} {daysCount === 1 ? "Day" : "Days"}
                    </div>
                  </div>

                  <div className="trip-card-body">
                    <div className="trip-card-header">
                      <h3 className="trip-card-title">{trip.title || `${trip.destination} Trip`}</h3>
                      <div className="trip-destination-tag">📍 {trip.destination}</div>
                    </div>

                    <div className="trip-dates-row">
                      <span>
                        🗓️ {startDate ? startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "TBD"} –{" "}
                        {endDate ? endDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                      </span>
                      <span className="travelers-count">
                        👥 {trip.travelers || 1} {trip.travelers > 1 ? "Travelers" : "Solo"}
                      </span>
                    </div>

                    {trip.notes && (
                      <p className="trip-card-notes">
                        {trip.notes.length > 90 ? `${trip.notes.slice(0, 90)}...` : trip.notes}
                      </p>
                    )}

                    {/* Budget progress bar */}
                    <div className="trip-budget-progress-section">
                      <div className="budget-labels-row">
                        <span className="spent-label">
                          Planned: <strong>₹{plannedCost.toLocaleString("en-IN")}</strong>
                        </span>
                        <span className="target-label">
                          Budget: <strong>₹{targetBudget.toLocaleString("en-IN")}</strong>
                        </span>
                      </div>
                      <div className="budget-bar-track">
                        <div
                          className={`budget-bar-fill ${isOverBudget ? "over-budget" : ""}`}
                          style={{ width: `${percentBudget}%` }}
                        ></div>
                      </div>
                      <div className="budget-sub-metrics">
                        <span>
                          {isOverBudget ? (
                            <span className="text-danger">⚠️ ₹{(plannedCost - targetBudget).toLocaleString("en-IN")} over budget</span>
                          ) : (
                            <span className="text-success">✅ ₹{(targetBudget - plannedCost).toLocaleString("en-IN")} remaining</span>
                          )}
                        </span>
                        <span>
                          Per Person: <strong>₹{Math.round(plannedCost / (trip.travelers || 1)).toLocaleString("en-IN")}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="trip-card-footer">
                      <span className="activities-count">
                        🎯 {trip.itinerary ? trip.itinerary.reduce((sum, d) => sum + (d.activities?.length || 0), 0) : 0} Activities
                      </span>
                      <div className="trip-card-actions">
                        <button
                          className="btn-share-trip"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTripToShare(trip);
                          }}
                          title="Share public itinerary link"
                        >
                          🔗
                        </button>
                        <button
                          className="btn-delete-trip"
                          onClick={(e) => handleDeleteTrip(e, trip._id)}
                          title="Delete trip"
                        >
                          🗑️
                        </button>
                        <button className="btn-view-itinerary">
                          Open Planner →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Trip Modal */}
      {selectedTripToShare && (
        <ShareTripModal
          trip={selectedTripToShare}
          isOpen={!!selectedTripToShare}
          onClose={() => setSelectedTripToShare(null)}
          onTripUpdated={(updated) => {
            setTrips(trips.map((t) => (t._id === updated._id ? updated : t)));
            setSelectedTripToShare(updated);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default MyTrips;
