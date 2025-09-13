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

          {/* Content Area */}
          <div className="content-area">
            {activeLink === "Add Data" && (
              <form className="health-form">
                <h2>Add Patient Health Data</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" placeholder="Enter Name" required />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input type="number" placeholder="Enter Age" required />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select required>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Disease</label>
                    <input type="text" placeholder="Enter Disease" />
                  </div>
                  <div className="form-group">
                    <label>Blood Pressure</label>
                    <input type="text" placeholder="e.g. 120/80" />
                  </div>
                  <div className="form-group">
                    <label>Heart Disease</label>
                    <select>
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Upload Medical Reports</label>
                    <input type="file" accept=".pdf,.jpg,.png,.jpeg" />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">Submit</button>
                </div>
              </form>
            )}

            {activeLink === "Delete Data" && (
              <div className="placeholder">Delete Data Section</div>
            )}

            {activeLink === "Modify" && (
              <div className="placeholder">Modify Data Section</div>
            )}

            {activeLink === "Visualize" && (
              <div className="placeholder">Visualize Data Section</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
