import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SafetyHub = ({ destination }) => {
  const [safetyData, setSafetyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("solo"); // 'solo', 'trekking', 'wildlife', 'weather_alerts'

  const fetchSafetyInfo = useCallback(async () => {
    if (!destination) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/safety/${encodeURIComponent(destination)}`);
      setSafetyData(res.data);
    } catch (err) {
      console.error("Failed to load safety info:", err);
    } finally {
      setLoading(false);
    }
  }, [destination]);

  useEffect(() => {
    fetchSafetyInfo();
  }, [fetchSafetyInfo]);

  if (loading) {
    return (
      <div className="safety-hub-card loading-state">
        <div className="safety-spinner"></div>
        <p>Loading verified Indian safety & emergency intelligence for {destination}...</p>
      </div>
    );
  }

  if (!safetyData) {
    return (
      <div className="safety-hub-card empty-state">
        <p>No safety data available for this destination.</p>
      </div>
    );
  }

  const {
    safetyScore,
    soloFriendliness,
    safeNeighborhoods,
    emergencyContacts,
    soloTips,
    trekkingSafety,
    wildlifeSafety,
    weatherWarnings
  } = safetyData;

  return (
    <div className="safety-hub-wrapper">
      {/* Top Safety KPI Scores Banner */}
      <div className="safety-kpi-banner">
        <div className="safety-kpi-item">
          <span className="safety-badge-icon">🛡️</span>
          <div>
            <div className="safety-kpi-val">{safetyScore || 4.5} <span className="max-val">/ 5.0</span></div>
            <div className="safety-kpi-lbl">Destination Safety Score</div>
          </div>
        </div>

        <div className="safety-kpi-item">
          <span className="safety-badge-icon">👤</span>
          <div>
            <div className="safety-kpi-val">{soloFriendliness || 9.2} <span className="max-val">/ 10.0</span></div>
            <div className="safety-kpi-lbl">Solo Traveler Friendliness</div>
          </div>
        </div>

        {safeNeighborhoods && safeNeighborhoods.length > 0 && (
          <div className="safety-kpi-item neighborhoods-pill-box">
            <span className="safety-badge-icon">📍</span>
            <div>
              <div className="safety-neighborhoods-title">Recommended Safe Stay Areas:</div>
              <div className="neighborhoods-tags">
                {safeNeighborhoods.map((area, idx) => (
                  <span key={idx} className="safe-area-tag">
                    ✓ {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Speed Dial Cards */}
      <div className="emergency-contacts-section">
        <h5 className="emg-section-title">🚨 24x7 Emergency Speed Dial (India)</h5>
        <div className="emergency-dial-grid">
          {emergencyContacts?.map((contact, idx) => (
            <a
              key={idx}
              href={`tel:${contact.number.replace(/[^0-9]/g, "")}`}
              className="emergency-dial-card"
            >
              <span className="emg-card-icon">{contact.icon || "📞"}</span>
              <div className="emg-card-info">
                <span className="emg-card-name">{contact.name}</span>
                <span className="emg-card-num">{contact.number}</span>
              </div>
              <span className="btn-call-pill">Tap to Call 📞</span>
            </a>
          ))}
        </div>
      </div>

      {/* Categorized Safety Intelligence Tabs */}
      <div className="safety-subtabs-nav">
        <button
          type="button"
          className={`safety-subtab-btn ${activeTab === "solo" ? "active" : ""}`}
          onClick={() => setActiveTab("solo")}
        >
          🛡️ Solo & Female Travel Tips
        </button>
        <button
          type="button"
          className={`safety-subtab-btn ${activeTab === "trekking" ? "active" : ""}`}
          onClick={() => setActiveTab("trekking")}
        >
          🥾 Trekking & Altitude Safety
        </button>
        <button
          type="button"
          className={`safety-subtab-btn ${activeTab === "wildlife" ? "active" : ""}`}
          onClick={() => setActiveTab("wildlife")}
        >
          🐾 Wildlife & Sanctuary Rules
        </button>
        <button
          type="button"
          className={`safety-subtab-btn ${activeTab === "weather_alerts" ? "active" : ""}`}
          onClick={() => setActiveTab("weather_alerts")}
        >
          ⛈️ Seasonal Weather Alerts
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="safety-tab-content-card">
        {activeTab === "solo" && (
          <div className="safety-bullet-section">
            <h4>Solo Traveler Guidelines for {destination}</h4>
            <ul className="safety-check-list">
              {soloTips?.map((tip, i) => (
                <li key={i}>
                  <span className="check-bullet">✅</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "trekking" && (
          <div className="safety-bullet-section">
            <h4>🥾 Mountain & Trekking Safety Protocols</h4>
            <ul className="safety-check-list">
              {trekkingSafety?.map((tip, i) => (
                <li key={i}>
                  <span className="check-bullet">⛰️</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "wildlife" && (
          <div className="safety-bullet-section">
            <h4>🐾 Wildlife & Nature Safety Precautions</h4>
            <ul className="safety-check-list">
              {wildlifeSafety?.map((tip, i) => (
                <li key={i}>
                  <span className="check-bullet">🌲</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "weather_alerts" && (
          <div className="safety-bullet-section">
            <h4>⛈️ Seasonal Weather Warnings & Natural Advisories</h4>
            <ul className="safety-check-list">
              {weatherWarnings?.map((warning, i) => (
                <li key={i}>
                  <span className="check-bullet">⚠️</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyHub;
