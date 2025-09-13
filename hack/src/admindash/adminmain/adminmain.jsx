import React, { useState } from "react";
import "./adminmain.css";

export default function AdminMain() {
  const [activeLink, setActiveLink] = useState("Add Data");
  const links = ["Add Data", "Delete Data", "Modify", "Visualize"];

  return (
    <div className="adminmain">
      <div className="admin-main">
        <div className="admin-card">
          <nav className="first-comp">
            {links.map((link) => (
              <button
                key={link}
                className={`nav-link ${activeLink === link ? "active" : ""}`}
                onClick={() => setActiveLink(link)}
              >
                {link}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
