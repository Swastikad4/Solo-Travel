import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Destination() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [myUsername, setMyUsername] = useState(localStorage.getItem("soloTravelerName") || "");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    Promise.all([
      axios.get(`${API}/api/destinations/${name}`).catch(() => ({ data: null })),
      axios.get(`${API}/api/trips/${name}`).catch(() => ({ data: [] })),
    ]).then(([destRes, tripsRes]) => {
      if (destRes.data && destRes.data.name) {
        setData(destRes.data);
      } else {
        setNotFound(true);
      }
      setTrips(Array.isArray(tripsRes.data) ? tripsRes.data : []);
      setLoading(false);
    });
  }, [name]);

  // Polling for messages
  useEffect(() => {
    let interval;
    if (chatOpen && chatUser && myUsername) {
      const fetchMessages = () => {
        axios.get(`${API}/api/chat/${myUsername}/${chatUser}`)
          .then(res => setMessages(res.data))
          .catch(err => console.error("Error fetching messages:", err));
      };
      
      fetchMessages(); // initial fetch
      interval = setInterval(fetchMessages, 3000); // poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [chatOpen, chatUser, myUsername]);

  const openChat = (user) => {
    setChatUser(user);
    setChatOpen(true);
  };

  const closeChat = () => {
    setChatOpen(false);
    setChatUser(null);
    setMessages([]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !myUsername.trim()) return;

    localStorage.setItem("soloTravelerName", myUsername);

    const msgData = {
      senderId: myUsername,
      receiverId: chatUser,
      content: newMessage
    };

    try {
      const res = await axios.post(`${API}/api/chat/send`, msgData);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const getInitials = (name) => {
    return name
      .split(/[\s_]+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div>
        <nav className="navbar">
          <div className="navbar-logo" onClick={() => navigate("/")}>
            🌍 <span>SoloTravel</span>
          </div>
          <div className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/plan" className="btn-plan">Plan a Trip</Link>
          </div>
        </nav>
        <div className="loading">
          <div className="spinner"></div>
          <p className="loading-text">Discovering {name}...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        <nav className="navbar">
          <div className="navbar-logo" onClick={() => navigate("/")}>
            🌍 <span>SoloTravel</span>
          </div>
          <div className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/plan" className="btn-plan">Plan a Trip</Link>
          </div>
        </nav>
        <div className="not-found">
          <h2>🗺️ Destination Not Found</h2>
          <p>We don't have info for "{name}" yet. Try one of our popular destinations!</p>
          <button className="search-btn" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dest-detail">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          🌍 <span>SoloTravel</span>
        </div>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/plan" className="btn-plan">Plan a Trip</Link>
        </div>
      </nav>

      {/* Hero Banner */}
      {data.image && (
        <div className="dest-hero">
          <img className="dest-hero-img" src={data.image} alt={data.name} />
          <div className="dest-hero-overlay">
            <h1 className="dest-hero-title">{data.name}</h1>
            {data.description && (
              <p className="dest-hero-desc">{data.description}</p>
            )}
          </div>
        </div>
      )}

      {!data.image && (
        <div style={{ paddingTop: "20px" }}>
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>
          <div style={{ padding: "20px 40px" }}>
            <h1 className="dest-hero-title">{data.name}</h1>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="dest-stats">
        {data.soloScore && (
          <div className="stat-card">
            <div className="stat-value">⭐ {data.soloScore}</div>
            <div className="stat-label">Solo Score</div>
          </div>
        )}
        {data.safetyRating && (
          <div className="stat-card">
            <div className="stat-value">🛡️ {data.safetyRating}</div>
            <div className="stat-label">Safety Rating</div>
          </div>
        )}
        {data.avgBudget && (
          <div className="stat-card">
            <div className="stat-value">💰 {data.avgBudget}</div>
            <div className="stat-label">Avg Budget</div>
          </div>
        )}
        {data.language && (
          <div className="stat-card">
            <div className="stat-value">🗣️ {data.language}</div>
            <div className="stat-label">Language</div>
          </div>
        )}
        {data.currency && (
          <div className="stat-card">
            <div className="stat-value">💱 {data.currency}</div>
            <div className="stat-label">Currency</div>
          </div>
        )}
        {data.bestTime && (
          <div className="stat-card">
            <div className="stat-value">📅</div>
            <div className="stat-label">{data.bestTime}</div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="dest-content">
        {data.famousPlaces && data.famousPlaces.length > 0 && (
          <div className="info-card">
            <h2 className="info-card-title">
              <span className="icon">📍</span> Famous Places
            </h2>
            <ul className="info-list">
              {data.famousPlaces.map((place, i) => (
                <li key={i}>{place}</li>
              ))}
            </ul>
          </div>
        )}

        {data.thingsToDo && data.thingsToDo.length > 0 && (
          <div className="info-card">
            <h2 className="info-card-title">
              <span className="icon">🎯</span> Things to Do
            </h2>
            <ul className="info-list">
              {data.thingsToDo.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Travelers */}
      <div className="travelers-section">
        <div className="travelers-header">
          <h2>🤝 Solo Travelers Going Here</h2>
          <p>
            {trips.length > 0
              ? `${trips.length} fellow traveler${trips.length > 1 ? "s" : ""} planning to visit ${data.name}`
              : `Be the first to plan a trip to ${data.name}!`}
          </p>
        </div>

        {trips.length > 0 ? (
          <div className="travelers-grid">
            {trips.map((trip) => (
              <div key={trip._id} className="traveler-card">
                <div className="traveler-header">
                  <div className="traveler-avatar">
                    {getInitials(trip.userId)}
                  </div>
                  <div>
                    <div className="traveler-name">{trip.userId}</div>
                    <div className="traveler-dates">
                      {new Date(trip.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      —{" "}
                      {new Date(trip.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                {trip.notes && (
                  <div className="traveler-notes">{trip.notes}</div>
                )}
                <button className="chat-btn" onClick={() => openChat(trip.userId)}>
                  💬 Chat with {trip.userId}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Link to="/plan" className="btn-plan" style={{ fontSize: "1rem", padding: "14px 32px" }}>
              ✈️ Plan Your Trip Here
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 SoloTravel — Built for adventurers who explore alone, together.</p>
      </footer>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="chat-overlay">
          <div className="chat-modal">
            <div className="chat-header">
              <h3>Chat with {chatUser}</h3>
              <button className="close-btn" onClick={closeChat}>✖</button>
            </div>
            
            <div className="chat-setup">
              <input 
                type="text" 
                placeholder="Enter your name to chat..." 
                value={myUsername}
                onChange={(e) => setMyUsername(e.target.value)}
                className="name-input"
              />
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <p className="no-messages">No messages yet. Say hi!</p>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId.toLowerCase() === myUsername.toLowerCase();
                  return (
                    <div key={idx} className={`message ${isMine ? 'sent' : 'received'}`}>
                      <div className="message-content">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
              <input 
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!myUsername.trim()}
              />
              <button type="submit" disabled={!newMessage.trim() || !myUsername.trim()}>Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Destination;