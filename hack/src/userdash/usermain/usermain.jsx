import React, { useState } from "react";
import "./usermain.css";

export default function UserMain() {
  const [activeLink, setActiveLink] = useState("Reports");
  const links = ["Reports", "Profile"];

  // Example report data (can be fetched from backend)
  const reportData = {
    name: "Rahul Sharma",
    aadhar: "1234-5678-9123",
    age: 35,
    gender: "Male",
    disease: "Diabetes",
    bloodPressure: "130/85",
    heartDisease: "No",
    reportFile: "medical_report.pdf",
  };

  return (
    <div className="usermain">
      <div className="user-main">
        <div className="user-card">
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

          <div className="content-area">
            {activeLink === "Reports" && (
              <div className="report-view">
                <h2>Patient Health Report</h2>
                <div className="report-card">
                  <div className="report-row">
                    <span className="label">Name:</span>
                    <span className="value">{reportData.name}</span>
                  </div>
                  <div className="report-row">
                    <span className="label">Aadhar:</span>
                    <span className="value">{reportData.aadhar}</span>
                  </div>
                  <div className="report-row">
                    <span className="label">Age:</span>
                    <span className="value">{reportData.age}</span>
                  </div>
                  <div className="report-row">
                    <span className="label">Gender:</span>
                    <span className="value">{reportData.gender}</span>
                  </div>
                  <div className="report-row">
                    <span className="label">Disease:</span>
                    <span className="value">{reportData.disease}</span>
                  </div>
                  <div className="report-row">
                    <span className="label">Blood Pressure:</span>
                    <span className="value">{reportData.bloodPressure}</span>
                  </div>
                  <div className="report-row">
                    <span className="label">Heart Disease:</span>
                    <span className="value">{reportData.heartDisease}</span>
                  </div>
                  <div className="report-row file-row">
                    <span className="label">Report File:</span>
                    <a
                      href={`/${reportData.reportFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="report-link"
                    >
                      📑 View Report
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeLink === "Profile" && (
              <div className="profile-view">
                <h2>User Profile</h2>
                <div className="profile-card">
                  <p><strong>Name:</strong> {reportData.name}</p>
                  <p><strong>Aadhar:</strong> {reportData.aadhar}</p>
                  <p><strong>Gender:</strong> {reportData.gender}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
