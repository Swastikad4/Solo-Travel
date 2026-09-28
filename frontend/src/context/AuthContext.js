import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("solo_token") || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("solo_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Configure axios authorization header
  const updateAxiosAuth = (jwtToken) => {
    if (jwtToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // On initial mount, verify session from localStorage
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem("solo_token");
      if (savedToken) {
        updateAxiosAuth(savedToken);
        try {
          const res = await axios.get(`${API}/api/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem("solo_user", JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn("Session expired or invalid, logging out");
          setToken(null);
          setUser(null);
          localStorage.removeItem("solo_token");
          localStorage.removeItem("solo_user");
          updateAxiosAuth(null);
        }
      } else {
        updateAxiosAuth(null);
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("solo_token", newToken);
    localStorage.setItem("solo_user", JSON.stringify(userData));
    updateAxiosAuth(newToken);
    return userData;
  };

  // Register handler
  const register = async (formData) => {
    const res = await axios.post(`${API}/api/auth/register`, formData);
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("solo_token", newToken);
    localStorage.setItem("solo_user", JSON.stringify(userData));
    updateAxiosAuth(newToken);
    return userData;
  };

  // Logout handler
  const logout = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`);
    } catch (e) {
      // Ignore error on logout
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("solo_token");
    localStorage.removeItem("solo_user");
    updateAxiosAuth(null);
  };

  // Profile update handler
  const updateProfile = async (profileData) => {
    const res = await axios.put(`${API}/api/auth/profile`, profileData);
    const updatedUser = res.data.user;
    setUser(updatedUser);
    localStorage.setItem("solo_user", JSON.stringify(updatedUser));
    return updatedUser;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === "ADMIN",
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
