import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PrivacySettingsModal = ({ isOpen, onClose, token }) => {
  const [whoCanMessageMe, setWhoCanMessageMe] = useState("everyone");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPrivacySettings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/users/privacy/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setWhoCanMessageMe(res.data.privacySettings?.whoCanMessageMe || "everyone");
        setBlockedUsers(res.data.blockedUsers || []);
      }
    } catch (err) {
      setErrorMsg("Failed to load privacy settings.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      fetchPrivacySettings();
      setSuccessMsg("");
      setErrorMsg("");
    }
  }, [isOpen, fetchPrivacySettings]);

  const handleSavePrivacy = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await axios.put(
        `${API}/api/users/privacy/settings`,
        { whoCanMessageMe },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setSuccessMsg("Privacy preferences saved successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to update privacy settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const res = await axios.post(
        `${API}/api/users/${userId}/unblock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setBlockedUsers((prev) => prev.filter((u) => (u._id || u.id || u) !== userId));
        setSuccessMsg("Traveler unblocked successfully.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setErrorMsg("Failed to unblock traveler.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="privacy-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="privacy-modal-header">
          <div className="privacy-header-title">
            <span className="privacy-shield-icon">🛡️</span>
            <div>
              <h4>Chat & Privacy Settings</h4>
              <p>Manage who can reach out to you and control blocked travelers</p>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="privacy-loading">
            <div className="spinner"></div>
            <p>Loading security preferences...</p>
          </div>
        ) : (
          <div className="privacy-modal-body">
            {successMsg && <div className="privacy-alert-success">{successMsg}</div>}
            {errorMsg && <div className="privacy-alert-error">{errorMsg}</div>}

            {/* Who can message me section */}
            <div className="privacy-section">
              <label className="privacy-section-label">
                💬 Who can send me direct messages?
              </label>
              <div className="privacy-options-grid">
                <label className={`privacy-radio-card ${whoCanMessageMe === "everyone" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="whoCanMessageMe"
                    value="everyone"
                    checked={whoCanMessageMe === "everyone"}
                    onChange={(e) => setWhoCanMessageMe(e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">🌍 Everyone</span>
                    <span className="radio-desc">Any verified solo traveler in India can start a conversation with you.</span>
                  </div>
                </label>

                <label className={`privacy-radio-card ${whoCanMessageMe === "group_members" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="whoCanMessageMe"
                    value="group_members"
                    checked={whoCanMessageMe === "group_members"}
                    onChange={(e) => setWhoCanMessageMe(e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">🎒 Travel Group Members</span>
                    <span className="radio-desc">Only travelers connected with you or sharing mutual trips can message you.</span>
                  </div>
                </label>

                <label className={`privacy-radio-card ${whoCanMessageMe === "nobody" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="whoCanMessageMe"
                    value="nobody"
                    checked={whoCanMessageMe === "nobody"}
                    onChange={(e) => setWhoCanMessageMe(e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">🔒 Nobody</span>
                    <span className="radio-desc">Pause all incoming direct messages. Existing chats remain archived.</span>
                  </div>
                </label>
              </div>

              <button
                className="btn-save-privacy"
                onClick={handleSavePrivacy}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Privacy Preferences"}
              </button>
            </div>

            {/* Blocked Users Section */}
            <div className="privacy-section">
              <label className="privacy-section-label">
                🚫 Blocked Travelers ({blockedUsers.length})
              </label>
              {blockedUsers.length === 0 ? (
                <p className="no-blocked-text">You have not blocked any travelers.</p>
              ) : (
                <div className="blocked-users-list">
                  {blockedUsers.map((bu, idx) => {
                    const uid = bu._id || bu.id || bu;
                    const name = bu.name || "Blocked Traveler";
                    const avatar = bu.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria";

                    return (
                      <div key={idx} className="blocked-user-item">
                        <div className="blocked-user-info">
                          <img src={avatar} alt={name} className="blocked-user-avatar" />
                          <div>
                            <div className="blocked-user-name">{name}</div>
                            {bu.username && <div className="blocked-user-handle">@{bu.username}</div>}
                          </div>
                        </div>
                        <button
                          className="btn-unblock"
                          onClick={() => handleUnblockUser(uid)}
                        >
                          Unblock
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Safety Guidelines Advice */}
            <div className="safety-advice-callout">
              <h6>💡 Safety Tip for Solo Travelers</h6>
              <p>
                Never share sensitive banking OTPs or private financial credentials in chats.
                Always meet fellow solo travelers in well-lit public places and inform your trusted emergency contacts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacySettingsModal;
