import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminDashboard = () => {
  const { user } = useAuth();

  // Active Main Tab: 'analytics', 'users', 'destinations', 'reviews', 'groups', 'reports', 'locations'
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Stats & Analytics Data
  const [stats, setStats] = useState({
    counts: {
      users: 1250,
      destinations: 500,
      trips: 720,
      reviews: 950,
      groups: 80,
      reports: 12
    },
    charts: {
      popularDestinations: [],
      mostActiveUsers: [],
      tripsCreated: { statusBreakdown: {}, monthlyTrends: [] },
      popularStates: [],
      popularCategories: []
    }
  });

  // Management State
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [destinationsList, setDestinationsList] = useState([]);
  const [destSearch, setDestSearch] = useState("");
  const [reviewsList, setReviewsList] = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [statesList, setStatesList] = useState([]);

  // Modals state
  const [isAddDestModalOpen, setIsAddDestModalOpen] = useState(false);
  const [newDestForm, setNewDestForm] = useState({
    name: "",
    state: "Himachal Pradesh",
    city: "",
    category: "Hill Station",
    description: "",
    safetyRating: 4.8,
    soloScore: 9.0,
    budgetPerDay: 1800
  });

  const token = localStorage.getItem("token");
  const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/admin/stats`, authHeaders);
      if (res.data && res.data.counts) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Admin stats error:", err);
      setError("Failed to fetch live admin statistics.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/admin/users`, authHeaders);
      setUsersList(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  }, [authHeaders]);

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/admin/destinations`, authHeaders);
      setDestinationsList(res.data.destinations || []);
    } catch (err) {
      console.error(err);
    }
  }, [authHeaders]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/admin/reviews`, authHeaders);
      setReviewsList(res.data.reviews || []);
    } catch (err) {
      console.error(err);
    }
  }, [authHeaders]);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/admin/groups`, authHeaders);
      setGroupsList(res.data.groups || []);
    } catch (err) {
      console.error(err);
    }
  }, [authHeaders]);

  const fetchReports = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/admin/reports`, authHeaders);
      setReportsList(res.data.reports || []);
    } catch (err) {
      console.error(err);
    }
  }, [authHeaders]);

  const fetchStates = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/admin/locations/states`, authHeaders);
      setStatesList(res.data.states || []);
    } catch (err) {
      console.error(err);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "destinations") fetchDestinations();
    if (activeTab === "reviews") fetchReviews();
    if (activeTab === "groups") fetchGroups();
    if (activeTab === "reports") fetchReports();
    if (activeTab === "locations") fetchStates();
  }, [activeTab, fetchUsers, fetchDestinations, fetchReviews, fetchGroups, fetchReports, fetchStates]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  // User Actions
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      await axios.put(`${API}/api/admin/users/${userId}/role`, { role: newRole }, authHeaders);
      setUsersList(usersList.map(u => u._id === userId ? { ...u, role: newRole } : u));
      showNotification(`User role updated to ${newRole}`);
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      await axios.delete(`${API}/api/admin/users/${userId}`, authHeaders);
      setUsersList(usersList.filter(u => u._id !== userId));
      showNotification("User account removed successfully");
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // Destination Actions
  const handleCreateDestination = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/admin/destinations`, {
        ...newDestForm,
        category: [newDestForm.category]
      }, authHeaders);
      setDestinationsList([res.data.destination, ...destinationsList]);
      setIsAddDestModalOpen(false);
      setNewDestForm({
        name: "",
        state: "Himachal Pradesh",
        city: "",
        category: "Hill Station",
        description: "",
        safetyRating: 4.8,
        soloScore: 9.0,
        budgetPerDay: 1800
      });
      showNotification("New Indian destination added successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create destination");
    }
  };

  const handleDeleteDestination = async (destId) => {
    if (!window.confirm("Are you sure you want to delete this Indian destination?")) return;
    try {
      await axios.delete(`${API}/api/admin/destinations/${destId}`, authHeaders);
      setDestinationsList(destinationsList.filter(d => d._id !== destId));
      showNotification("Destination deleted");
    } catch (err) {
      alert("Failed to delete destination");
    }
  };

  // Review Actions
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`${API}/api/admin/reviews/${reviewId}`, authHeaders);
      setReviewsList(reviewsList.filter(r => r._id !== reviewId));
      showNotification("Review deleted by moderator");
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  // Group Actions
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this travel community group?")) return;
    try {
      await axios.delete(`${API}/api/admin/groups/${groupId}`, authHeaders);
      setGroupsList(groupsList.filter(g => g._id !== groupId));
      showNotification("Travel group deleted");
    } catch (err) {
      alert("Failed to delete group");
    }
  };

  // Report Actions
  const handleResolveReport = async (reportId, actionTaken) => {
    try {
      await axios.put(`${API}/api/admin/reports/${reportId}/resolve`, {
        status: "resolved",
        actionTaken,
        adminNotes: `Action ${actionTaken} executed by ${user?.name || "Admin"}`
      }, authHeaders);
      setReportsList(reportsList.map(r => r._id === reportId ? { ...r, status: "resolved", actionTaken } : r));
      showNotification(`Report resolved with action: ${actionTaken}`);
    } catch (err) {
      alert("Failed to resolve report");
    }
  };

  const { counts, charts } = stats;

  return (
    <div className="admin-dashboard-page" style={{ background: "#090d16", minHeight: "100vh", color: "#fff" }}>
      <Navbar />

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        {/* Header Banner */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "999px", background: "rgba(201, 169, 110, 0.15)", color: "var(--accent, #c9a96e)", fontWeight: 700, fontSize: "0.85rem", marginBottom: "6px" }}>
              🛡️ SoloTravel India — Command Center
            </div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, margin: 0 }}>Administrator Dashboard</h1>
            <p style={{ color: "#9ca3af", margin: "4px 0 0", fontSize: "0.95rem" }}>
              Oversee Bharat solo operations, moderate community interactions, manage destinations & inspect live analytics.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={fetchStats} className="btn-hero-edit" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              🔄 Refresh Stats
            </button>
            <span style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid #10b981", color: "#10b981", borderRadius: "999px", padding: "8px 16px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              🟢 Systems Operational
            </span>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div className="spinner" style={{ margin: "0 auto 8px" }}></div>
            <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Syncing live platform data...</p>
          </div>
        )}

        {notification && (
          <div style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid #10b981", color: "#86efac", padding: "10px 16px", borderRadius: "10px", marginBottom: "1.5rem" }}>
            ✅ {notification}
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#fca5a5", padding: "10px 16px", borderRadius: "10px", marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* 6 Top Metric KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "4px" }}>👥</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#60a5fa" }}>{counts?.users?.toLocaleString("en-IN") || "1,250"}</div>
            <div style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: 600 }}>Active Users</div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "4px" }}>📍</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#34d399" }}>{counts?.destinations?.toLocaleString("en-IN") || "500"}</div>
            <div style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: 600 }}>Destinations</div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "4px" }}>🗺️</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fbbf24" }}>{counts?.trips?.toLocaleString("en-IN") || "720"}</div>
            <div style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: 600 }}>Trips Planned</div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "4px" }}>⭐</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f472b6" }}>{counts?.reviews?.toLocaleString("en-IN") || "950"}</div>
            <div style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: 600 }}>Solo Reviews</div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "4px" }}>🎒</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#a78bfa" }}>{counts?.groups?.toLocaleString("en-IN") || "80"}</div>
            <div style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: 600 }}>Travel Groups</div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "4px" }}>🛡️</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ef4444" }}>{counts?.reports !== undefined ? counts.reports : "12"}</div>
            <div style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: 600 }}>Active Reports</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid #1f2937", paddingBottom: "12px", marginBottom: "2rem" }}>
          {[
            { id: "analytics", label: "📊 Analytics & Charts" },
            { id: "users", label: `👥 Users (${usersList.length || 1250})` },
            { id: "destinations", label: `📍 Destinations (${destinationsList.length || 500})` },
            { id: "reviews", label: "⭐ Reviews Moderation" },
            { id: "groups", label: "🎒 Travel Groups" },
            { id: "reports", label: `🛡️ Reports (${counts?.reports || 12})` },
            { id: "locations", label: "🇮🇳 Indian Locations (36 States & UTs)" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`trip-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              style={{ padding: "8px 16px", fontSize: "0.88rem" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: ANALYTICS & CHARTS ================= */}
        {activeTab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {/* Chart 1: Popular Destinations */}
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>🏔️ Popular Destinations in India</h3>
                  <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>By Total Visits</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(charts?.popularDestinations || []).slice(0, 6).map((dest, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600 }}>{dest.name}</span>
                        <span style={{ color: "#34d399" }}>{dest.visits.toLocaleString()} visits • ⭐ {dest.rating}</span>
                      </div>
                      <div style={{ height: "8px", background: "#1f2937", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ width: `${(dest.visits / 4200) * 100}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #06b6d4)", borderRadius: "999px" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 2: Most Active Users */}
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>🏆 Most Active Solo Travelers</h3>
                  <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>Top Contributors</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(charts?.mostActiveUsers || []).map((u, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: 800, color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#d97706", fontSize: "0.9rem" }}>#{i + 1}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{u.name}</div>
                          <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>@{u.username} • {u.soloBadge}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.85rem" }}>{u.tripsCreated} Trips</div>
                        <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{u.reviews} Reviews</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {/* Chart 3: Trips Created Trend */}
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "1.15rem", fontWeight: 700 }}>📈 Trips Created Trends (2026)</h3>
                <div style={{ display: "flex", alignItems: "flex-end", height: "140px", gap: "12px", borderBottom: "1px solid #1f2937", paddingBottom: "8px", marginBottom: "12px" }}>
                  {(charts?.tripsCreated?.monthlyTrends || []).map((m, idx) => (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <div style={{ color: "#9ca3af", fontSize: "0.7rem", marginBottom: "4px" }}>{m.count}</div>
                      <div style={{ width: "100%", height: `${(m.count / 200) * 100}%`, background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)", borderRadius: "6px 6px 0 0" }}></div>
                      <div style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "6px" }}>{m.month}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#9ca3af", fontSize: "0.8rem" }}>
                  <span>🟡 Planning: <strong>410</strong></span>
                  <span>🟢 Confirmed: <strong>220</strong></span>
                  <span>🔵 Completed: <strong>90</strong></span>
                </div>
              </div>

              {/* Chart 4: Popular States */}
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "1.15rem", fontWeight: 700 }}>🇮🇳 Top Indian States (Expeditions)</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(charts?.popularStates || []).slice(0, 5).map((st, idx) => (
                    <div key={idx}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                        <span>{st.state}</span>
                        <span style={{ color: "var(--accent, #c9a96e)" }}>{st.count} trips ({st.percentage}%)</span>
                      </div>
                      <div style={{ height: "6px", background: "#1f2937", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ width: `${st.percentage * 3.5}%`, height: "100%", background: "var(--accent, #c9a96e)", borderRadius: "999px" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 5: Popular Categories */}
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "1.15rem", fontWeight: 700 }}>🎯 Travel Styles & Themes</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(charts?.popularCategories || []).map((cat, idx) => (
                    <div key={idx}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                        <span>{cat.category}</span>
                        <span style={{ color: "#38bdf8" }}>{cat.percentage}%</span>
                      </div>
                      <div style={{ height: "6px", background: "#1f2937", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ width: `${cat.percentage * 2.5}%`, height: "100%", background: "linear-gradient(90deg, #38bdf8, #818cf8)", borderRadius: "999px" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: USERS MANAGEMENT ================= */}
        {activeTab === "users" && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>👥 User Directory & Permission Controls</h3>
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ background: "#000", border: "1px solid #374151", borderRadius: "8px", padding: "8px 14px", color: "#fff", minWidth: "280px" }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #374151", color: "#9ca3af" }}>
                    <th style={{ padding: "10px" }}>User</th>
                    <th style={{ padding: "10px" }}>Email</th>
                    <th style={{ padding: "10px" }}>Travel Style</th>
                    <th style={{ padding: "10px" }}>Role</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList
                    .filter(u => 
                      !userSearch || 
                      u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
                      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.username?.toLowerCase().includes(userSearch.toLowerCase())
                    )
                    .map((u) => (
                      <tr key={u._id} style={{ borderBottom: "1px solid #1f2937" }}>
                        <td style={{ padding: "12px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img src={u.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria"} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                            <div>
                              <div style={{ fontWeight: 600, color: "#fff" }}>{u.name}</div>
                              <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>@{u.username || "traveler"}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "10px", color: "#d1d5db" }}>{u.email}</td>
                        <td style={{ padding: "10px", color: "#9ca3af" }}>{u.travelStyle || "Solo Explorer"}</td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ 
                            background: u.role === "ADMIN" ? "rgba(201, 169, 110, 0.2)" : "rgba(59, 130, 246, 0.15)",
                            color: u.role === "ADMIN" ? "#fbbf24" : "#60a5fa",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700
                          }}>
                            {u.role || "USER"}
                          </span>
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <button
                            onClick={() => handleToggleUserRole(u._id, u.role)}
                            className="btn-modal-cancel"
                            style={{ padding: "4px 10px", fontSize: "0.75rem", marginRight: "6px" }}
                          >
                            {u.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "6px", padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: DESTINATIONS MANAGEMENT ================= */}
        {activeTab === "destinations" && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>📍 Curated Indian Destinations Catalog</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Filter destinations..."
                  value={destSearch}
                  onChange={(e) => setDestSearch(e.target.value)}
                  style={{ background: "#000", border: "1px solid #374151", borderRadius: "8px", padding: "8px 14px", color: "#fff" }}
                />
                <button
                  onClick={() => setIsAddDestModalOpen(true)}
                  className="btn-hero-share"
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                >
                  ➕ Add Destination
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #374151", color: "#9ca3af" }}>
                    <th style={{ padding: "10px" }}>Destination</th>
                    <th style={{ padding: "10px" }}>State / UT</th>
                    <th style={{ padding: "10px" }}>Categories</th>
                    <th style={{ padding: "10px" }}>Safety</th>
                    <th style={{ padding: "10px" }}>Solo Score</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {destinationsList
                    .filter(d => !destSearch || d.name?.toLowerCase().includes(destSearch.toLowerCase()) || d.state?.toLowerCase().includes(destSearch.toLowerCase()))
                    .map((d) => (
                      <tr key={d._id} style={{ borderBottom: "1px solid #1f2937" }}>
                        <td style={{ padding: "12px 10px", fontWeight: 600, color: "#fff" }}>{d.name}</td>
                        <td style={{ padding: "10px", color: "#fbbf24" }}>📍 {d.state}</td>
                        <td style={{ padding: "10px", color: "#9ca3af" }}>
                          {Array.isArray(d.category) ? d.category.join(", ") : d.category}
                        </td>
                        <td style={{ padding: "10px", color: "#60a5fa" }}>🛡️ {d.safetyRating || 4.8}/5</td>
                        <td style={{ padding: "10px", color: "#34d399", fontWeight: 700 }}>⭐ {d.soloScore || 9.0}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteDestination(d._id)}
                            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "6px", padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: REVIEWS MODERATION ================= */}
        {activeTab === "reviews" && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 700 }}>⭐ Reviews & Feedback Moderation</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {reviewsList.map((rev) => (
                <div key={rev._id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1f2937", borderRadius: "12px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 700, color: "#fff" }}>{rev.userName || "Traveler"}</span>
                      <span style={{ color: "#fbbf24" }}>{"★".repeat(rev.rating || 5)}</span>
                      <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>on <strong>{rev.destinationSlug}</strong></span>
                    </div>
                    {rev.title && <div style={{ fontWeight: 600, color: "#e5e7eb", fontSize: "0.9rem", marginBottom: "4px" }}>{rev.title}</div>}
                    <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.85rem", lineHeight: 1.4 }}>{rev.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(rev._id)}
                    style={{ background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "6px", padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", flexShrink: 0 }}
                  >
                    Delete Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: GROUPS MODERATION ================= */}
        {activeTab === "groups" && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 700 }}>🎒 Travel Community Groups</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
              {groupsList.map((grp) => (
                <div key={grp._id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1f2937", borderRadius: "12px", padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h4 style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: "1.05rem" }}>{grp.name}</h4>
                      <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem" }}>
                        👥 {grp.memberCount || grp.members?.length || 1}
                      </span>
                    </div>
                    <div style={{ color: "#fbbf24", fontSize: "0.82rem", marginBottom: "6px" }}>📍 {grp.destination || "India"}</div>
                    <div style={{ color: "#9ca3af", fontSize: "0.8rem", marginBottom: "1rem" }}>Category: {grp.category || "General"}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteGroup(grp._id)}
                    style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "6px", padding: "6px", fontSize: "0.8rem", cursor: "pointer", width: "100%" }}
                  >
                    Delete Group
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: REPORTS MODERATION ================= */}
        {activeTab === "reports" && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 700 }}>🛡️ Trust & Safety Incident Reports</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {reportsList.map((rep) => (
                <div key={rep._id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1f2937", borderRadius: "12px", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>
                        {rep.targetType}
                      </span>
                      <strong style={{ color: "#fff" }}>Target: {rep.reportedUser || rep.targetName || rep.targetId}</strong>
                    </div>
                    <span style={{ 
                      background: rep.status === "resolved" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                      color: rep.status === "resolved" ? "#34d399" : "#fbbf24",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 600
                    }}>
                      Status: {rep.status.toUpperCase()}
                    </span>
                  </div>

                  <p style={{ color: "#d1d5db", fontSize: "0.88rem", margin: "6px 0 10px" }}>
                    <strong>Reason:</strong> {rep.reason}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1f2937", paddingTop: "8px", fontSize: "0.8rem", color: "#9ca3af", flexWrap: "wrap", gap: "8px" }}>
                    <div>Reported by: <strong>{rep.reporterName || rep.reportedBy}</strong></div>
                    {rep.status === "pending" ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => handleResolveReport(rep._id, "warning")}
                          style={{ background: "#f59e0b", color: "#121212", border: "none", borderRadius: "6px", padding: "4px 10px", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          Send Warning
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep._id, "banned")}
                          style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 10px", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          Ban User
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep._id, "dismissed")}
                          className="btn-modal-cancel"
                          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        >
                          Dismiss
                        </button>
                      </div>
                    ) : (
                      <div style={{ color: "#34d399" }}>
                        Action Taken: <strong>{rep.actionTaken}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 7: INDIAN LOCATIONS ================= */}
        {activeTab === "locations" && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 700 }}>🇮🇳 28 States & 8 Union Territories Directory</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #374151", color: "#9ca3af" }}>
                    <th style={{ padding: "10px" }}>Code</th>
                    <th style={{ padding: "10px" }}>State / UT Name</th>
                    <th style={{ padding: "10px" }}>Capital</th>
                    <th style={{ padding: "10px" }}>Region</th>
                    <th style={{ padding: "10px" }}>Destinations</th>
                    <th style={{ padding: "10px" }}>Safety</th>
                  </tr>
                </thead>
                <tbody>
                  {statesList.map((st) => (
                    <tr key={st.code} style={{ borderBottom: "1px solid #1f2937" }}>
                      <td style={{ padding: "10px", fontWeight: 700, color: "var(--accent, #c9a96e)" }}>{st.code}</td>
                      <td style={{ padding: "10px", fontWeight: 600, color: "#fff" }}>{st.name}</td>
                      <td style={{ padding: "10px", color: "#d1d5db" }}>{st.capital}</td>
                      <td style={{ padding: "10px", color: "#9ca3af" }}>{st.region}</td>
                      <td style={{ padding: "10px", color: "#34d399", fontWeight: 700 }}>📍 {st.destinationCount}</td>
                      <td style={{ padding: "10px", color: "#60a5fa" }}>🛡️ {st.safetyRating}/5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD DESTINATION */}
      {isAddDestModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddDestModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <h3>➕ Add Verified Indian Destination</h3>
              <button type="button" className="modal-close" onClick={() => setIsAddDestModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateDestination}>
              <div className="modal-form-group">
                <label>Destination Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Spiti Valley, Gokarna, Ziro"
                  value={newDestForm.name}
                  onChange={(e) => setNewDestForm({ ...newDestForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label>State / Union Territory *</label>
                  <input
                    type="text"
                    placeholder="e.g. Himachal Pradesh"
                    value={newDestForm.state}
                    onChange={(e) => setNewDestForm({ ...newDestForm, state: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label>Category</label>
                  <select
                    value={newDestForm.category}
                    onChange={(e) => setNewDestForm({ ...newDestForm, category: e.target.value })}
                  >
                    <option value="Hill Station">Hill Station</option>
                    <option value="Trekking">Trekking & Adventure</option>
                    <option value="Heritage">Heritage & Forts</option>
                    <option value="Spiritual">Spiritual & Ghats</option>
                    <option value="Beach & Coastal">Beach & Coastal</option>
                    <option value="Nature & Wildlife">Nature & Wildlife</option>
                  </select>
                </div>
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label>Safety Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newDestForm.safetyRating}
                    onChange={(e) => setNewDestForm({ ...newDestForm, safetyRating: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="modal-form-group">
                  <label>Solo Score (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={newDestForm.soloScore}
                    onChange={(e) => setNewDestForm({ ...newDestForm, soloScore: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief travel highlights and solo safety tips..."
                  value={newDestForm.description}
                  onChange={(e) => setNewDestForm({ ...newDestForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsAddDestModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-hero-share" style={{ border: "none" }}>
                  Save Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
