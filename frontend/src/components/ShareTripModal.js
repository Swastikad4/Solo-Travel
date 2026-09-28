import React, { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ShareTripModal = ({ trip, isOpen, onClose, onTripUpdated }) => {
  const [isPublic, setIsPublic] = useState(trip?.isPublic || false);
  const [shareId, setShareId] = useState(trip?.shareId || '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !trip) return null;

  const getShareUrl = (id) => {
    return `${window.location.origin}/share/trip/${id || shareId}`;
  };

  const handleEnableSharing = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API}/api/trips/${trip._id}/share`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsPublic(true);
      setShareId(res.data.shareId);
      if (onTripUpdated) {
        onTripUpdated({ ...trip, isPublic: true, shareId: res.data.shareId });
      }
    } catch (err) {
      console.error('Error enabling trip sharing:', err);
      setError(err.response?.data?.message || 'Failed to generate shareable link.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSharing = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API}/api/trips/${trip._id}/share`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsPublic(false);
      if (onTripUpdated) {
        onTripUpdated({ ...trip, isPublic: false });
      }
    } catch (err) {
      console.error('Error revoking trip share link:', err);
      setError(err.response?.data?.message || 'Failed to make trip private.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = getShareUrl(shareId);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Check out my solo travel itinerary for ${trip.destination} on SoloTravel India! 🇮🇳✈️`;

  const shareOnWhatsApp = () => {
    const url = getShareUrl(shareId);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${url}`)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = getShareUrl(shareId);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '1rem',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="modal-content-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#111827',
          border: '1px solid #374151',
          borderRadius: '16px',
          padding: '1.75rem',
          maxWidth: '520px',
          width: '100%',
          color: '#fff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🔗</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Share Your Trip</h3>
              <small style={{ color: '#9ca3af' }}>{trip.title || trip.destination}</small>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close" 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Sharing Status Box */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{isPublic ? '🌐' : '🔒'}</span>
              <span style={{ fontWeight: 600, color: isPublic ? '#10b981' : '#f59e0b', fontSize: '0.92rem' }}>
                {isPublic ? 'Public Link Active' : 'Private Trip (Only You)'}
              </span>
            </div>
            {isPublic ? (
              <button 
                onClick={handleDisableSharing} 
                disabled={loading}
                className="btn-modal-cancel"
                style={{ padding: '4px 10px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
              >
                Make Private
              </button>
            ) : (
              <button 
                onClick={handleEnableSharing} 
                disabled={loading}
                className="btn-hero-share"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                {loading ? 'Creating Link...' : 'Enable Public Link'}
              </button>
            )}
          </div>

          <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.82rem', lineHeight: 1.4 }}>
            {isPublic 
              ? 'Anyone with the link can view your itinerary, dates, and destination highlights in read-only mode.'
              : 'Turn on public sharing to generate a secure read-only web page for fellow travelers.'}
          </p>
        </div>

        {/* Share Link & Actions when Public */}
        {isPublic && shareId && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '6px', fontWeight: 600 }}>Public Trip URL</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="text" 
                readOnly 
                value={getShareUrl(shareId)} 
                style={{ flex: 1, background: '#000', border: '1px solid #374151', borderRadius: '8px', padding: '8px 12px', color: '#60a5fa', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
              <button 
                onClick={handleCopyLink} 
                className="btn-hero-share"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                type="button"
              >
                {copied ? '✅' : '📋 Copy'}
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={shareOnWhatsApp} 
                style={{ flex: 1, background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                💬 WhatsApp
              </button>
              <button 
                onClick={shareOnTwitter} 
                style={{ flex: 1, background: '#1DA1F2', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                🐦 Twitter / X
              </button>
              <a 
                href={getShareUrl(shareId)} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', textDecoration: 'none', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                title="Preview public page"
              >
                ↗️
              </a>
            </div>
          </div>
        )}

        {/* Privacy Note Badge */}
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1rem', color: '#3b82f6' }}>🛡️</span>
          <div>
            <strong style={{ color: '#e5e7eb' }}>Privacy Guarantee:</strong> Private information (your expenses breakdown, personal notes, and account email) is automatically stripped on the public page.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-cancel-modal">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareTripModal;
