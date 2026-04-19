import { useState } from "react";
import api from "../api";

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    type: "open"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      await api.post("/create", {
        ...formData,
        capacity: parseInt(formData.capacity),
        registrations: []
      });
      
      setMessage({ type: "success", text: "✅ Event Created Successfully!" });
      setFormData({ name: "", capacity: "", type: "open" });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Error creating event: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Create Your Event</h1>
        <p>Set up a new event and start accepting registrations</p>
      </div>

      {/* Form Container */}
      <div className="content-container">
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}
          
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Event Name *</label>
                <input
                  id="name"
                  name="name"
                  placeholder="e.g., Tech Summit 2024"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">Participant Capacity *</label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Registration Type *</label>
                <select 
                  id="type"
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                >
                  <option value="open">Open Registration - Anyone can register</option>
                  <option value="approval">Approval Based - Review registrations</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ width: "100%", marginTop: "1.5rem", padding: "1rem" }}
              >
                {loading ? "Creating Event..." : "Create Event"}
              </button>
            </form>

            <div style={{ marginTop: "2rem", padding: "1.5rem", background: "#f8f9fa", borderRadius: "8px" }}>
              <h4 style={{ color: "#1a1a1a", marginBottom: "0.8rem", fontSize: "1rem" }}>💡 Pro Tips:</h4>
              <ul style={{ color: "#666", fontSize: "0.95rem", marginLeft: "1.5rem", lineHeight: "1.8" }}>
                <li>Choose descriptive event names to attract participants</li>
                <li>Set realistic capacity limits based on your venue</li>
                <li>Use approval-based registration to screen participants</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}