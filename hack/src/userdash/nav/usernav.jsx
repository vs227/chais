import React, { useState } from "react";
import "./usernav.css";

export default function Usernav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="usernav">
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

        <div className={`user-info ${menuOpen ? "show" : ""}`}>
          <a href="#contact" className="user-info-link">Contact</a>
          <a href="#about" className="user-info-link">About</a>
          <a href="/SIH" className="user-logout">Logout</a>
        </div>
      </div>
    </div>
  );
}
