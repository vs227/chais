import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminnav.css";

export default function Adminnav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="adminnav">
      <div className="log-nav">
        <div className="logo-group">
          <div className="logo"></div>
          <div className="logo-line"></div>
        </div>

        <div
          className={`menu-icon ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`admin-info ${menuOpen ? "show" : ""}`}>
          <a href="/admindash#/admindash" className="admin-info-link">Home</a>
          <button 
            onClick={() => navigate('/admindash/dashboard')} 
            className="admin-info-link"
          >
            Dashboard
          </button>
          <a href="#contact" className="admin-info-link">Contact</a>
          <a href="#about" className="admin-info-link">About</a>
          <a href="/SIH" className="admin-logout">Logout</a>
        </div>
      </div>
    </div>
  );
}