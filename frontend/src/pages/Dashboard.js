import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalCapacity: 0,
    openEvents: 0,
    approvalEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/events");
      const events = response.data.data.events;
      
      setStats({
        totalEvents: events.length,
        totalCapacity: events.reduce((sum, e) => sum + e.capacity, 0),
        openEvents: events.filter(e => e.type === 'open').length,
        approvalEvents: events.filter(e => e.type === 'approval').length
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className="card stat-card">
      <div className="stat-icon" style={{ background: color }}>
        {icon}
      </div>
      <div className="stat-content">
        <p className="stat-label">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Your Dashboard</h1>
        <p>Track and manage your event analytics</p>
      </div>

      {/* Content */}
      <div className="content-container">
        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div className="loading-spinner">⏳</div>
            <p style={{ fontSize: "1.1rem", color: "#666" }}>Loading statistics...</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "3rem", textAlign: "center" }}>
              <h2 style={{ fontSize: "1.8rem", color: "#1a1a1a", marginBottom: "0.5rem", fontWeight: "800" }}>
                Event Overview
              </h2>
              <p style={{ color: "#666" }}>Key metrics for your event platform</p>
            </div>

            <div className="grid grid-2">
              <StatCard 
                icon="📋" 
                title="Total Events" 
                value={stats.totalEvents}
                color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
              <StatCard 
                icon="👥" 
                title="Total Capacity" 
                value={stats.totalCapacity}
                color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
              <StatCard 
                icon="🔓" 
                title="Open Events" 
                value={stats.openEvents}
                color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
              <StatCard 
                icon="🔒" 
                title="Approval Events" 
                value={stats.approvalEvents}
                color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: "3rem", padding: "2rem", background: "#f8f9fa", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
              <h3 style={{ color: "#1a1a1a", marginBottom: "1rem", fontSize: "1.3rem", fontWeight: "700" }}>
                📊 Insights
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <p style={{ color: "#666", marginBottom: "0.5rem" }}>Average Event Capacity</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "#667eea" }}>
                    {stats.totalEvents > 0 ? Math.round(stats.totalCapacity / stats.totalEvents) : 0}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#666", marginBottom: "0.5rem" }}>Most Common Type</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "#f5576c" }}>
                    {stats.openEvents > stats.approvalEvents ? "Open" : stats.approvalEvents > stats.openEvents ? "Approval" : "Equal"}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#666", marginBottom: "0.5rem" }}>Platform Status</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "#43e97b" }}>
                    ✓ Active
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}