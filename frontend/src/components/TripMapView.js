import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const STEP_ICONS = {
  Hotel: "🏨",
  Attraction: "🏰",
  Restaurant: "🍛",
  Activity: "🎯"
};

const STEP_COLORS = {
  Hotel: "#8b5cf6",
  Attraction: "#10b981",
  Restaurant: "#f59e0b",
  Activity: "#3b82f6"
};

const TripMapView = ({ destination, itinerary }) => {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 = Day 1, etc.
  const [activeWaypoint, setActiveWaypoint] = useState(null);

  const fetchRouteMap = useCallback(async () => {
    if (!destination) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/geo/route-map`, {
        destination,
        itinerary: itinerary || []
      });
      setRouteData(res.data);
      if (res.data?.daysRoutes?.length > 0 && res.data.daysRoutes[0].waypoints?.length > 0) {
        setActiveWaypoint(res.data.daysRoutes[0].waypoints[0]);
      }
    } catch (err) {
      console.error("Failed to load route map:", err);
    } finally {
      setLoading(false);
    }
  }, [destination, itinerary]);

  useEffect(() => {
    fetchRouteMap();
  }, [fetchRouteMap]);

  if (loading) {
    return (
      <div className="trip-map-container loading-state">
        <div className="map-spinner"></div>
        <p>Loading destination coordinates & route waypoints...</p>
      </div>
    );
  }

  if (!routeData || !routeData.daysRoutes || routeData.daysRoutes.length === 0) {
    return (
      <div className="trip-map-container empty-state">
        <p>No route data available for this itinerary yet.</p>
      </div>
    );
  }

  const currentDayRoute = routeData.daysRoutes[selectedDayIndex] || routeData.daysRoutes[0];
  const waypoints = currentDayRoute?.waypoints || [];

  return (
    <div className="trip-map-wrapper">
      {/* Map Control Header */}
      <div className="map-controls-header">
        <div className="map-header-left">
          <span className="map-header-icon">🗺️</span>
          <div>
            <h4>Interactive Daily Route Visualizer</h4>
            <p className="map-subtitle">
              Sequence: <strong className="sequence-badge">🏨 Hotel ➔ 🏰 Attraction ➔ 🍛 Restaurant ➔ 🎯 Activity</strong>
            </p>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="map-day-pills">
          {routeData.daysRoutes.map((day, idx) => (
            <button
              key={day.dayNumber}
              type="button"
              className={`map-day-pill-btn ${selectedDayIndex === idx ? "active" : ""}`}
              onClick={() => {
                setSelectedDayIndex(idx);
                if (day.waypoints && day.waypoints.length > 0) {
                  setActiveWaypoint(day.waypoints[0]);
                }
              }}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Sequence Visualization Grid */}
      <div className="map-body-grid">
        {/* Visual Map Canvas / OpenStreetMap Route Display */}
        <div className="map-canvas-card">
          <div className="map-canvas-header">
            <span className="map-day-label">
              📍 Day {currentDayRoute.dayNumber}: {destination}
            </span>
            <span className="map-dist-label">
              Total Day Distance: <strong>{currentDayRoute.totalDayDistanceKm} km</strong>
            </span>
          </div>

          {/* Map Graphic Canvas with numbered markers & connected route path */}
          <div className="map-visual-viewport">
            {/* Background Grid & Compass */}
            <div className="map-grid-bg"></div>
            <div className="map-compass">🧭 N</div>

            {/* Route Sequence Line Overlay */}
            <svg className="map-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="35%" stopColor="#10b981" />
                  <stop offset="70%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              {waypoints.length > 1 && (
                <polyline
                  points={waypoints
                    .map((_, i) => {
                      const x = 15 + (i * 70) / Math.max(1, waypoints.length - 1);
                      const y = 25 + Math.sin(i * 1.5) * 20 + (i % 2 === 0 ? 10 : -10);
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  className="route-path-line"
                />
              )}
            </svg>

            {/* Waypoint Markers on Viewport */}
            <div className="map-waypoints-layer">
              {waypoints.map((wp, i) => {
                const x = 15 + (i * 70) / Math.max(1, waypoints.length - 1);
                const y = 25 + Math.sin(i * 1.5) * 20 + (i % 2 === 0 ? 10 : -10);
                const isSelected = activeWaypoint?.stepNumber === wp.stepNumber;
                const markerColor = STEP_COLORS[wp.stepType] || "#3b82f6";

                return (
                  <div
                    key={i}
                    className={`map-waypoint-pin ${isSelected ? "selected-pin" : ""}`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      borderColor: markerColor
                    }}
                    onClick={() => setActiveWaypoint(wp)}
                  >
                    <span className="pin-icon">{STEP_ICONS[wp.stepType] || "📍"}</span>
                    <span className="pin-number" style={{ backgroundColor: markerColor }}>
                      {wp.stepNumber}
                    </span>

                    {/* Pin Label Hover Popup */}
                    <div className="pin-tooltip">
                      <strong>
                        {wp.stepNumber}. {wp.stepType}: {wp.title}
                      </strong>
                      <span>⏰ {wp.time} | 📍 {wp.location}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route Map Legend */}
          <div className="map-legend-row">
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: STEP_COLORS.Hotel }}></span>
              <span>🏨 Hotel (Start/Stay)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: STEP_COLORS.Attraction }}></span>
              <span>🏰 Attraction (Key Sight)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: STEP_COLORS.Restaurant }}></span>
              <span>🍛 Restaurant (Dining/Lunch)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: STEP_COLORS.Activity }}></span>
              <span>🎯 Activity (Trek/Sports)</span>
            </div>
          </div>
        </div>

        {/* Waypoints Sequence List & Directions Panel */}
        <div className="map-waypoints-sidebar">
          <div className="sidebar-header">
            <h5>Step-by-Step Waypoint Timeline</h5>
            <span className="stops-count">{waypoints.length} Stops</span>
          </div>

          <div className="waypoints-flow-list">
            {waypoints.map((wp, idx) => {
              const isSelected = activeWaypoint?.stepNumber === wp.stepNumber;
              const stepColor = STEP_COLORS[wp.stepType] || "#3b82f6";

              return (
                <div
                  key={idx}
                  className={`waypoint-flow-item ${isSelected ? "active-flow-item" : ""}`}
                  onClick={() => setActiveWaypoint(wp)}
                >
                  <div className="flow-step-badge" style={{ backgroundColor: `${stepColor}25`, color: stepColor, border: `1px solid ${stepColor}` }}>
                    {STEP_ICONS[wp.stepType]} {wp.stepNumber}
                  </div>

                  <div className="flow-content">
                    <div className="flow-top-row">
                      <span className="flow-step-type" style={{ color: stepColor }}>
                        {wp.stepType}
                      </span>
                      <span className="flow-time">⏰ {wp.time}</span>
                    </div>
                    <h6 className="flow-title">{wp.title}</h6>
                    <p className="flow-loc">📍 {wp.location}</p>

                    {wp.distanceToNextKm !== undefined && (
                      <div className="flow-dist-to-next">
                        ⬇️ ~{wp.distanceToNextKm} km to next stop
                      </div>
                    )}
                  </div>

                  <a
                    href={wp.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-open-gmaps"
                    title="Open in Google Maps"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ↗️ Maps
                  </a>
                </div>
              );
            })}
          </div>

          {/* Active Waypoint Detail Inspector */}
          {activeWaypoint && (
            <div className="active-waypoint-inspector">
              <div className="inspector-header">
                <span className="inspector-badge" style={{ backgroundColor: STEP_COLORS[activeWaypoint.stepType] }}>
                  {STEP_ICONS[activeWaypoint.stepType]} Step {activeWaypoint.stepNumber}: {activeWaypoint.stepType}
                </span>
                <span className="inspector-cost">₹{activeWaypoint.cost}</span>
              </div>
              <h5 className="inspector-title">{activeWaypoint.title}</h5>
              <p className="inspector-loc">📍 {activeWaypoint.location}</p>
              {activeWaypoint.notes && <p className="inspector-notes">💡 {activeWaypoint.notes}</p>}
              <a
                href={activeWaypoint.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-gmaps-direct"
              >
                🗺️ Get Directions on Google Maps
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripMapView;
