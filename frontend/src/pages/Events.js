import { useEffect, useState } from "react";
import api from "../api";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationData, setRegistrationData] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data.data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
      setMessage({ type: "error", text: "Failed to load events" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (event) => {
    setSelectedEvent(event);
    setRegistrationData({ name: "", email: "" });
    setShowModal(true);
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/register", {
        eventId: selectedEvent.id,
        name: registrationData.name,
        email: registrationData.email
      });
      
      setMessage({ type: "success", text: `✅ Registered for ${selectedEvent.name}!` });
      setShowModal(false);
      setRegistrationData({ name: "", email: "" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Registration failed: " + error.message });
    }
  };

  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const eventEmojis = ["🎉", "🏆", "🎓", "🚀", "💻", "🎨", "🎤", "🎬"];

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Discover Events</h1>
        <p>Find and register for events that interest you</p>
        
        <div className="header-search">
          <input 
            type="text"
            className="search-input"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="content-container">
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div className="loading-spinner">⏳</div>
            <p style={{ fontSize: "1.1rem", color: "#666" }}>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state">No Events Found</h3>
            <p style={{ color: "#999", marginTop: "0.5rem" }}>
              {searchTerm ? "Try a different search term" : "Check back soon for upcoming events!"}
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "2rem", color: "#666", textAlign: "center" }}>
              Showing <strong>{filteredEvents.length}</strong> event{filteredEvents.length !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-3">
              {filteredEvents.map((e, i) => (
                <div key={i} className="card event-card">
                  <div className="event-image">
                    {eventEmojis[i % eventEmojis.length]}
                  </div>
                  
                  <div className="event-content">
                    <div className="event-header">
                      <h3>{e.name}</h3>
                      <span className={`badge badge-${e.type}`}>
                        {e.type === 'open' ? 'Open' : 'Approval'}
                      </span>
                    </div>

                    <div className="event-meta">
                      <div className="meta-item">
                        👥 <strong>{e.capacity}</strong> spots
                      </div>
                      <div className="meta-item">
                        📅 <strong>{new Date(e.createdAt).toLocaleDateString()}</strong>
                      </div>
                    </div>

                    <div className="event-footer">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleRegisterClick(e)}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: "500px", width: "90%", padding: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "#1a1a1a", fontSize: "1.8rem" }}>
              Register for {selectedEvent?.name}
            </h2>
            
            <form onSubmit={handleRegistrationSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text"
                  placeholder="Your name"
                  value={registrationData.name}
                  onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email"
                  placeholder="your@email.com"
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Register Now
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}