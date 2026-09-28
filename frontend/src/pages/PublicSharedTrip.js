import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PublicSharedTrip = () => {
  const { shareId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedTrip = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${API}/api/trips/public/${shareId}`);
        setTrip(res.data);
      } catch (err) {
        console.error('Failed to load shared trip:', err);
        setError(err.response?.data?.message || 'This trip is either private or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedTrip();
    }
  }, [shareId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="public-shared-trip-page">
        <Navbar />
        <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <div className="spinner mb-3"></div>
            <h4 style={{ color: '#fff' }}>Fetching Curated Bharat Itinerary...</h4>
            <p style={{ color: '#888' }}>Loading public travel details and day-by-day plan</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="public-shared-trip-page">
        <Navbar />
        <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
          <div className="card bg-dark border-secondary p-5 mx-auto shadow-lg" style={{ maxWidth: '600px', borderRadius: '16px', background: '#111827', border: '1px solid #374151', color: '#fff' }}>
            <div style={{ fontSize: '3.5rem', color: '#f59e0b', marginBottom: '1rem' }}>🛡️</div>
            <h2 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>Trip Not Accessible</h2>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>{error || 'This travel itinerary is private or has expired.'}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <Link to="/" className="btn-modal-cancel" style={{ textDecoration: 'none', padding: '10px 20px' }}>
                ← Back to Home
              </Link>
              <Link to="/plan" className="btn-hero-edit" style={{ textDecoration: 'none', padding: '10px 20px' }}>
                🧭 Plan Your Own Trip
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    title,
    destination,
    state,
    startDate,
    endDate,
    travelers,
    budget,
    totalEstimatedCost,
    itinerary = [],
    creator,
    coverImage,
    sharedAt
  } = trip;

  const defaultCover = "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=1200&auto=format&fit=crop&q=80";

  return (
    <div className="public-shared-trip-page pb-5">
      <Navbar />

      {/* Hero Banner with Destination */}
      <div 
        className="shared-trip-hero position-relative d-flex align-items-end"
        style={{
          minHeight: '400px',
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.95) 100%), url(${coverImage || defaultCover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingBottom: '2.5rem',
          paddingTop: '2.5rem',
          color: '#fff'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Link to="/explore" className="suggestion-chip" style={{ textDecoration: 'none', color: '#fff' }}>
              ← Explore All India
            </Link>
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', padding: '4px 12px', borderRadius: '999px', fontSize: '0.85rem' }}>
              👁️ Public Shared Itinerary
            </span>
          </div>

          <div className="row align-items-end" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 60%' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)', marginBottom: '8px', fontSize: '0.9rem' }}>
                📍 <span>{destination}{state ? `, ${state}` : ', India'}</span>
              </div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', margin: '6px 0 12px' }}>
                {title || `${destination} Solo Adventure`}
              </h1>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#d1d5db', fontSize: '0.95rem' }}>
                {startDate && (
                  <div>
                    🗓️ <span>{new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {endDate ? ` - ${new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</span>
                  </div>
                )}
                <div>
                  👥 <span>{travelers === 1 ? 'Solo Traveler' : `${travelers || 1} Travelers`}</span>
                </div>
                {(totalEstimatedCost || budget) && (
                  <div>
                    💰 <span>Est. ₹{(totalEstimatedCost || budget)?.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button 
                onClick={handleCopyLink} 
                className="btn-hero-share"
                style={{ padding: '10px 24px', fontSize: '0.95rem' }}
              >
                {copied ? '✅ Link Copied!' : '🔗 Share Itinerary'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '2rem' }}>
          {/* Left Column: Creator & Quick Info */}
          <div>
            {/* Creator Card */}
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>
              <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px' }}>
                Trip Curated By
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img 
                  src={creator?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria'} 
                  alt={creator?.name || 'Traveler'} 
                  style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c9a96e' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{creator?.name || 'Solo Explorer'}</h4>
                  <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>@{creator?.username || 'traveler'}</span>
                </div>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '12px' }}>
                Shared an authentic day-by-day solo travel plan for exploring {destination}.
              </p>
              {sharedAt && (
                <div style={{ borderTop: '1px solid #1f2937', paddingTop: '8px', color: '#6b7280', fontSize: '0.8rem' }}>
                  Published: {new Date(sharedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}
            </div>

            {/* Plan Your Own Trip CTA */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>⭐</span>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>Inspired by this plan?</h4>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '16px' }}>
                Create your custom AI-powered itinerary for {destination} or any Indian destination with budgeting and safety tips in seconds.
              </p>
              <Link 
                to={`/plan?dest=${encodeURIComponent(destination)}`} 
                className="btn-create-trip-cta"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px' }}
              >
                Generate Similar Itinerary
              </Link>
            </div>
          </div>

          {/* Right Column: Itinerary Details */}
          <div>
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '1.8rem', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.3rem' }}>
                  🗓️ Day-by-Day Itinerary ({itinerary.length} Days)
                </h3>
                <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', color: '#c9a96e' }}>
                  Bharat Verified 🇮🇳
                </span>
              </div>

              {itinerary && itinerary.length > 0 ? (
                <div className="itinerary-timeline">
                  {itinerary.map((dayPlan, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                        borderRadius: '12px', 
                        padding: '1.2rem', 
                        marginBottom: '1.2rem' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ margin: 0, color: '#f59e0b', fontWeight: 700, fontSize: '1.05rem' }}>
                          DAY {dayPlan.day || idx + 1}: {dayPlan.theme || dayPlan.title || `Exploring ${destination}`}
                        </h4>
                        {dayPlan.estimatedCost && (
                          <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                            Est. Day Cost: ₹{dayPlan.estimatedCost.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Activities Schedule */}
                      {dayPlan.activities && dayPlan.activities.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ textTransform: 'uppercase', fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, marginBottom: '8px' }}>
                            Key Activities & Schedule
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {dayPlan.activities.map((act, actIdx) => (
                              <div key={actIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: actIdx < dayPlan.activities.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '999px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                                  {act.time || `${actIdx + 1}`}
                                </span>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                                    {act.activity || act.name || act.title || act}
                                  </div>
                                  {act.location && (
                                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '2px' }}>
                                      📍 {act.location}
                                    </div>
                                  )}
                                  {act.notes && (
                                    <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '4px 0 0' }}>
                                      {act.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Food suggestions */}
                      {dayPlan.food && (
                        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af', fontSize: '0.82rem' }}>
                          <strong style={{ color: '#e5e7eb' }}>🍛 Food & Cuisine:</strong> {typeof dayPlan.food === 'string' ? dayPlan.food : (dayPlan.food.lunch || dayPlan.food.dinner || 'Local culinary hotspots')}
                        </div>
                      )}

                      {/* Transport suggestions */}
                      {dayPlan.transportation && (
                        <div style={{ marginTop: '6px', color: '#9ca3af', fontSize: '0.82rem' }}>
                          <strong style={{ color: '#e5e7eb' }}>🚗 Local Commute:</strong> {dayPlan.transportation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                  <p>No day-by-day activities available for this shared trip.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublicSharedTrip;
