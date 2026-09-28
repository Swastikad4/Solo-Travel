import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || "/profile";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Invalid email or password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo Login helpers
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Quick login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-badge">🇮🇳 🎒</div>
            <h2>Welcome Back</h2>
            <p>Log in to continue your solo travel journey across India</p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Log In to SoloTravel"}
            </button>
          </form>

          {/* Quick Demo Login Chips */}
          <div className="demo-logins-section">
            <div className="demo-divider">
              <span>QUICK DEMO ACCESS</span>
            </div>
            <div className="demo-buttons-grid">
              <button
                type="button"
                className="btn-demo-chip"
                onClick={() =>
                  handleQuickLogin("aarav@solotravel.in", "Travel@123")
                }
                disabled={loading}
              >
                <span className="demo-chip-icon">🎒</span>
                <div className="demo-chip-text">
                  <strong>Solo Traveler</strong>
                  <small>aarav@solotravel.in</small>
                </div>
              </button>

              <button
                type="button"
                className="btn-demo-chip admin-chip"
                onClick={() =>
                  handleQuickLogin("admin@solotravel.in", "Admin@123")
                }
                disabled={loading}
              >
                <span className="demo-chip-icon">👑</span>
                <div className="demo-chip-text">
                  <strong>Administrator</strong>
                  <small>admin@solotravel.in</small>
                </div>
              </button>
            </div>
          </div>

          <div className="auth-footer-link">
            Don't have an account yet?{" "}
            <Link to="/register">Create a Solo Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
