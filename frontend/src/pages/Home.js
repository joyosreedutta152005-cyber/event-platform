import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Discover Amazing Events</h1>
        <p>Create, manage, and participate in events that matter. All in one place.</p>
        <div className="hero-actions">
          <Link to="/events" className="btn btn-primary">
            Browse Events
          </Link>
          <Link to="/create" className="btn btn-secondary">
            Create Event
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="content-container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2.5rem", color: "var(--text-primary)", marginBottom: "0.5rem", fontWeight: "900", letterSpacing: "-1px" }}>
            Everything You Need
          </h2>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", fontWeight: "400" }}>
            Manage every aspect of your events with our comprehensive platform
          </p>
        </div>

        <div className="grid grid-2">
          <Link to="/create" className="card home-card">
            <div className="card-icon">👨‍💼</div>
            <h3>Create Events</h3>
            <p>Organize professional events with flexible registration options, capacity management, and detailed event settings.</p>
          </Link>
          
          <Link to="/events" className="card home-card">
            <div className="card-icon">👥</div>
            <h3>Browse Events</h3>
            <p>Discover exciting events happening around you. Filter by type, capacity, and find the perfect event to attend.</p>
          </Link>
          
          <Link to="/dashboard" className="card home-card">
            <div className="card-icon">📊</div>
            <h3>Analytics</h3>
            <p>Get insights into your events with real-time analytics and comprehensive statistics about registrations.</p>
          </Link>
          
          <Link to="/judge" className="card home-card">
            <div className="card-icon">⚖️</div>
            <h3>Judge Panel</h3>
            <p>Review applications and manage registrations with an intuitive approval system for approval-based events.</p>
          </Link>
        </div>
      </div>

      {/* Testimonials / Quotes Section */}
      <div className="content-container">
        <div className="quotes-section">
          <div className="quotes-title">
            <h2>What People Are Saying</h2>
            <p>Join thousands of satisfied users who trust EventHub for their events</p>
          </div>
          <div className="quotes-grid">
            <div className="quote-card">
              <p className="quote-text">EventHub made organizing my conference incredibly easy. The interface is intuitive and the registration system is flawless!</p>
              <p className="quote-author">Sarah Johnson - Event Organizer</p>
            </div>
            <div className="quote-card">
              <p className="quote-text">I've attended dozens of events through this platform. The user experience is amazing and finding events is so simple.</p>
              <p className="quote-author">Michael Chen - Event Enthusiast</p>
            </div>
            <div className="quote-card">
              <p className="quote-text">The analytics dashboard gave us incredible insights into our event performance. Highly recommended for serious organizers!</p>
              <p className="quote-author">Emma Williams - Conference Host</p>
            </div>
            <div className="quote-card">
              <p className="quote-text">Managing approvals and registrations has never been this straightforward. EventHub is a game-changer!</p>
              <p className="quote-author">David Rodriguez - Event Manager</p>
            </div>
            <div className="quote-card">
              <p className="quote-text">The dark theme is beautiful and easy on the eyes. The design is both professional and modern.</p>
              <p className="quote-author">Lisa Park - Tech Enthusiast</p>
            </div>
            <div className="quote-card">
              <p className="quote-text">Customer support is fantastic and the platform is constantly improving. EventHub is my go-to event platform!</p>
              <p className="quote-author">James Wilson - Regular User</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="content-container">
        <div className="info-section">
          <h2>Why Choose EventHub?</h2>
          <p>Everything you need to make events successful</p>
          
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Experience blazing fast event creation and registration with our optimized platform built for speed.</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🔒</div>
              <h3>Secure & Reliable</h3>
              <p>Your data is protected with enterprise-grade security. Rest easy knowing everything is safe.</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Access your events and registrations from anywhere. Works perfectly on all devices and screen sizes.</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h3>Easy to Use</h3>
              <p>Intuitive interface designed for everyone. No technical knowledge required to get started.</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">📊</div>
              <h3>Real-Time Analytics</h3>
              <p>Get instant insights into your event performance with comprehensive analytics and statistics.</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🌟</div>
              <h3>Premium Support</h3>
              <p>Get help when you need it. Our dedicated support team is always ready to assist you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
        color: "white",
        padding: "5rem 2rem",
        textAlign: "center",
        marginTop: "2rem",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          pointerEvents: "none"
        }}></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "2.8rem", marginBottom: "1rem", fontWeight: "900", letterSpacing: "-1px" }}>
            Ready to Create Amazing Events?
          </h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "2.5rem", opacity: "0.95", fontWeight: "400" }}>
            Join thousands of event organizers and participants on EventHub today
          </p>
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/create" className="btn btn-primary">
              Create Your Event
            </Link>
            <Link to="/events" className="btn btn-secondary">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}