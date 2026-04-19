import { useState, useEffect } from "react";
import api from "../api";

export default function Judge() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get("/registrations");
      setRegistrations(response.data.data.registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setMessage({ type: "error", text: "Failed to load registrations" });
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (regId, decision) => {
    try {
      await api.put(`/registrations/${regId}`, { status: decision });
      setMessage({ type: "success", text: `✅ Registration ${decision}!` });
      
      // Update local state
      setRegistrations(registrations.map(r => 
        r.id === regId ? {...r, status: decision} : r
      ));
      
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Error updating registration: " + error.message });
    }
  };

  const pendingCount = registrations.filter(r => r.status === 'Pending').length;
  const approvedCount = registrations.filter(r => r.status === 'Approved').length;
  const rejectedCount = registrations.filter(r => r.status === 'Rejected').length;

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Judge Panel</h1>
        <p>Review and approve event registrations</p>
      </div>

      {/* Content */}
      <div className="content-container">
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div style={{ marginBottom: "2rem", padding: "1rem", background: "#f0f7ff", borderRadius: "8px", border: "1px solid #b3d9ff" }}>
          <p style={{ color: "#0c5460", margin: "0" }}>
            ℹ️ You have <strong>{pendingCount}</strong> pending registration{pendingCount !== 1 ? "s" : ""} to review
          </p>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div className="loading-spinner">⏳</div>
            <p style={{ fontSize: "1.1rem", color: "#666" }}>Loading registrations...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div className="empty-state-icon">✅</div>
            <h3 className="empty-state">All Set!</h3>
            <p style={{ color: "#999", marginTop: "0.5rem" }}>No registrations yet</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {registrations.map((reg) => (
              <div key={reg.id} className="card judge-card">
                <div className="judge-header">
                  <h3>{reg.name}</h3>
                  <span className={`badge badge-${reg.status.toLowerCase()}`}>
                    {reg.status === 'Approved' ? '✓ Approved' : reg.status === 'Rejected' ? '✕ Rejected' : '⏳ Pending'}
                  </span>
                </div>
                
                <div className="judge-details">
                  <p><strong>📅 Event:</strong> {reg.eventName}</p>
                  <p><strong>🔔 Status:</strong> {reg.status}</p>
                </div>
                
                <div className="judge-actions">
                  <button 
                    className="btn btn-success" 
                    onClick={() => handleDecision(reg.id, 'Approved')}
                    disabled={reg.status !== 'Pending'}
                    style={{ opacity: reg.status !== 'Pending' ? 0.5 : 1 }}
                  >
                    ✓ Approve
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDecision(reg.id, 'Rejected')}
                    disabled={reg.status !== 'Pending'}
                    style={{ opacity: reg.status !== 'Pending' ? 0.5 : 1 }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div style={{ marginTop: "3rem", padding: "2rem", background: "#f8f9fa", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
          <h3 style={{ color: "#1a1a1a", marginBottom: "1rem", fontSize: "1.2rem", fontWeight: "700" }}>
            📊 Review Summary
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            <div>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>Total Registrations</p>
              <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "#667eea" }}>{registrations.length}</p>
            </div>
            <div>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>Approved</p>
              <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "#43e97b" }}>
                {approvedCount}
              </p>
            </div>
            <div>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>Rejected</p>
              <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "#f5576c" }}>
                {rejectedCount}
              </p>
            </div>
            <div>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>Pending</p>
              <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "#ff9800" }}>
                {pendingCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}