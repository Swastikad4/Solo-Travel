import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          SoloTravel
          <span className="brand-badge-india">🇮🇳 BHARAT</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-links">
          <Link
            to="/explore"
            className={`nav-link ${location.pathname === "/explore" ? "active" : ""}`}
          >
            Explore India
          </Link>
          <Link
            to="/travelers"
            className={`nav-link ${location.pathname === "/travelers" ? "active" : ""}`}
          >
            👥 Travelers
          </Link>
          <Link
            to="/groups"
            className={`nav-link ${location.pathname.startsWith("/groups") ? "active" : ""}`}
          >
            🎒 Groups
          </Link>
          <Link
            to="/trips"
            className={`nav-link ${location.pathname.startsWith("/trips") ? "active" : ""}`}
          >
            🗺️ My Trips
          </Link>
          <Link
            to="/plan"
            className={`nav-link ${location.pathname === "/plan" ? "active" : ""}`}
          >
            ➕ Plan Trip
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/messages"
                className={`nav-link ${location.pathname === "/messages" ? "active" : ""}`}
              >
                💬 Messages
              </Link>
              <Link
                to="/wishlist"
                className={`nav-link ${location.pathname === "/wishlist" ? "active" : ""}`}
              >
                ❤️ Wishlist
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`nav-link nav-link-admin ${location.pathname === "/admin" ? "active" : ""}`}
                  style={{ color: "var(--accent, #c9a96e)", fontWeight: 700 }}
                >
                  ⚙️ Admin
                </Link>
              )}
            </>
          )}
        </div>

        {/* User / Auth Actions */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu-wrapper">
              <Link to="/profile" className="user-profile-chip" title="View Profile">
                <img
                  src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria"}
                  alt={user?.name || "User"}
                  className="user-nav-avatar"
                />
                <span className="user-nav-name">{user?.name?.split(" ")[0]}</span>
                {isAdmin && <span className="nav-admin-badge">ADMIN</span>}
              </Link>
              {isAdmin && (
                <Link to="/admin" className="btn-hero-share" style={{ padding: "6px 12px", fontSize: "0.8rem", textDecoration: "none" }} title="Admin Dashboard">
                  ⚙️ Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="btn-nav-logout" title="Sign out">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons-group">
              <Link to="/login" className="btn-nav-login">
                Log In
              </Link>
              <Link to="/register" className="btn-nav-register">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className={`navbar-toggle ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="navbar-mobile-drawer">
          <Link to="/" className="mobile-nav-link">
            🏠 Home
          </Link>
          <Link to="/explore" className="mobile-nav-link">
            🇮🇳 Explore India
          </Link>
          <Link to="/travelers" className="mobile-nav-link">
            👥 Discover Travelers
          </Link>
          <Link to="/groups" className="mobile-nav-link">
            🎒 Travel Groups
          </Link>
          <Link to="/trips" className="mobile-nav-link">
            🗺️ My Trips
          </Link>
          <Link to="/plan" className="mobile-nav-link">
            ➕ Plan Trip
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/messages" className="mobile-nav-link">
                💬 Messages
              </Link>
              <Link to="/wishlist" className="mobile-nav-link">
                ❤️ Wishlist
              </Link>
              {isAdmin && (
                <Link to="/admin" className="mobile-nav-link" style={{ color: "var(--accent, #c9a96e)", fontWeight: 700 }}>
                  ⚙️ Admin Dashboard
                </Link>
              )}
            </>
          )}

          <div className="mobile-drawer-divider" />

          {isAuthenticated ? (
            <div className="mobile-auth-section">
              <Link to="/profile" className="mobile-nav-link profile-link">
                <img
                  src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria"}
                  alt={user?.name}
                  className="user-nav-avatar"
                />
                <div>
                  <div className="mobile-user-name">{user?.name}</div>
                  <div className="mobile-user-role">{user?.role === "ADMIN" ? "👑 Administrator" : "🎒 Solo Traveler"}</div>
                </div>
              </Link>
              <button onClick={handleLogout} className="btn-mobile-logout">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mobile-guest-buttons">
              <Link to="/login" className="btn-nav-login mobile-btn">
                Log In
              </Link>
              <Link to="/register" className="btn-nav-register mobile-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
