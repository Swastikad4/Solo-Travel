import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  { id: 'all', label: 'All Recommendations' },
  { id: 'trekking', label: '🏔️ Trekking & Adventure', filterTag: 'Trekking' },
  { id: 'beaches', label: '🏖️ Beaches & Coastal', filterTag: 'Beaches' },
  { id: 'heritage', label: '🏛️ Heritage & Spiritual', filterTag: 'Spiritual' },
  { id: 'nature', label: '🌿 Nature & Scenic', filterTag: 'Nature' }
];

const RecommendationWidget = ({ 
  title = "Recommended Indian Destinations For You", 
  subtitle = "Personalized recommendations scored by AI based on your interests, travel style & budget",
  limit = 6,
  showFilters = true
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let queryParams = `?limit=${limit}`;
        if (selectedCategory !== 'all') {
          const cat = CATEGORIES.find(c => c.id === selectedCategory);
          if (cat?.filterTag) {
            queryParams += `&interests=${encodeURIComponent(cat.filterTag)}`;
          }
        }

        const res = await axios.get(`${API}/api/destinations/recommendations${queryParams}`, { headers });
        setRecommendations(res.data.recommendations || []);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedCategory, limit]);

  const getScoreBadgeStyle = (score) => {
    if (score >= 90) return { background: '#059669', color: '#fff' };
    if (score >= 80) return { background: '#0284c7', color: '#fff' };
    if (score >= 70) return { background: '#4f46e5', color: '#fff' };
    return { background: '#4b5563', color: '#fff' };
  };

  return (
    <div className="recommendation-widget my-5" style={{ margin: '3rem 0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 12px', borderRadius: '999px', background: 'rgba(201, 169, 110, 0.15)', color: 'var(--accent, #c9a96e)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
            ✨ AI Smart Matching
          </div>
          <h3 style={{ color: '#fff', fontWeight: 800, margin: '0 0 4px', fontSize: '1.5rem' }}>{title}</h3>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>{subtitle}</p>
        </div>

        {showFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`suggestion-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{
                  background: selectedCategory === cat.id ? 'var(--accent, #c9a96e)' : 'rgba(255,255,255,0.06)',
                  color: selectedCategory === cat.id ? '#121212' : '#e5e7eb',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner mb-2"></div>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Calculating personalized match scores across Indian destinations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🧭</div>
          <h4 style={{ color: '#fff', fontWeight: 700 }}>No custom recommendations found</h4>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '1rem' }}>Explore our all-India destination catalog to discover new spots.</p>
          <Link to="/explore" className="btn-hero-edit" style={{ textDecoration: 'none', display: 'inline-block', padding: '8px 18px' }}>
            Explore All India
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {recommendations.map((item, idx) => {
            const dest = item?.destination || item || {};
            const matchScore = item?.matchScore || dest?.matchScore || 88;
            const matchReasons = item?.matchReasons || dest?.matchReasons || [];
            const destName = dest?.name || 'Indian Destination';
            const destState = dest?.state || 'India';
            const destImage = dest?.images?.[0] || dest?.image || dest?.coverImage || 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=600&auto=format&fit=crop&q=80';
            const destBudget = dest?.estimatedCost?.budget || dest?.minBudget || dest?.budget || 15000;
            const destSafety = dest?.safetyRating || dest?.safety?.rating || 4.8;
            const destBestTime = dest?.bestTimeToVisit || dest?.bestTime || 'Oct - May';
            const destTags = Array.isArray(dest?.category) ? dest.category : (dest?.tags || []);

            return (
              <div 
                key={dest._id || dest.slug || idx}
                className="destination-rec-card"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#0f172a',
                  border: '1px solid #1e293b'
                }}
              >
                {/* Destination Cover Image */}
                <div style={{ position: 'relative', height: '180px' }}>
                  <img 
                    src={destImage} 
                    alt={destName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(15,23,42,0.85) 100%)' }} />
                  
                  {/* Match Score Badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span style={{ ...getScoreBadgeStyle(matchScore), borderRadius: '999px', padding: '4px 12px', fontWeight: 800, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      ⭐ {matchScore}% Match
                    </span>
                  </div>

                  {/* Destination Title & State on Image */}
                  <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                    <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>
                      📍 {destState}
                    </div>
                    <h4 style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {destName}
                    </h4>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Key Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.82rem', paddingBottom: '10px', borderBottom: '1px solid #1e293b', marginBottom: '12px' }}>
                    <div style={{ color: '#34d399', fontWeight: 600 }}>
                      💰 ₹{Number(destBudget).toLocaleString('en-IN')}
                    </div>
                    <div style={{ color: '#fbbf24' }}>
                      🌤️ {destBestTime}
                    </div>
                    {destSafety && (
                      <div style={{ color: '#60a5fa' }}>
                        🛡️ {destSafety}/5
                      </div>
                    )}
                  </div>

                  {/* Match Reasons */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ textTransform: 'uppercase', color: '#64748b', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Why it matches you
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(matchReasons.length > 0 ? matchReasons : [`Top trending solo travel spot in ${destState}`]).slice(0, 2).map((reason, rIdx) => (
                        <div key={rIdx} style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ color: '#3b82f6' }}>•</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Destination Tags */}
                  {destTags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                      {destTags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', padding: '2px 8px', fontSize: '0.72rem', color: '#94a3b8' }}>
                          #{typeof tag === 'string' ? tag : tag.name || 'India'}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <div style={{ marginTop: 'auto' }}>
                    <Link 
                      to={`/plan?dest=${encodeURIComponent(destName)}`}
                      className="btn-hero-explore"
                      style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '9px', fontSize: '0.85rem' }}
                    >
                      Plan {destName} Trip →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecommendationWidget;
