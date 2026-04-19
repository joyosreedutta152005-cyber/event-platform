import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import Judge from "./pages/Judge";
import "./App.css";

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🎉</span>
          EventHub
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className={location.pathname === "/" ? "nav-link active" : "nav-link"}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/create" className={location.pathname === "/create" ? "nav-link active" : "nav-link"}>
              Create Event
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/events" className={location.pathname === "/events" ? "nav-link active" : "nav-link"}>
              Events
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard" className={location.pathname === "/dashboard" ? "nav-link active" : "nav-link"}>
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/judge" className={location.pathname === "/judge" ? "nav-link active" : "nav-link"}>
              Judge
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/events" element={<Events />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/judge" element={<Judge />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
