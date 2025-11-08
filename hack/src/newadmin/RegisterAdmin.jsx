import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IPFS_CONFIG } from "../config/blockchain";
import { validateFileType, formatFileSize } from "../utils/ipfs-mock";
import "./RegisterAdmin.css";

export default function RegisterAdmin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [degreeFiles, setDegreeFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = [];
    const validFiles = [];

    files.forEach((file) => {
      if (!validateFileType(file)) {
        newErrors.push(`${file.name} is not valid. Allowed: PDF, JPG, PNG`);
      } else if (file.size > IPFS_CONFIG.MAX_FILE_SIZE) {
        newErrors.push(
          `${file.name} exceeds max size of ${
            IPFS_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
          }MB`
        );
      } else {
        validFiles.push(file);
      }
    });

    // Append instead of replacing
    setDegreeFiles((prev) => [...prev, ...validFiles]);
    setErrors(newErrors);
    e.target.value = null;
  };

  // Remove selected file
  const handleRemoveFile = (index) => {
    setDegreeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !contact || !address || degreeFiles.length === 0) {
      alert("Please provide all details and upload proofs.");
      return;
    }

    console.log("Registering Admin with data:", {
      name,
      email,
      contact,
      address,
      degreeFiles,
    });

    alert("Registration request submitted! Awaiting verification.");
    navigate("/"); // back to login
  };

  return (
    <>
      {/* Top navbar (same as Login page) */}
      <div className="log-nav1">
        <div className="logo1"></div>
        <div className="logo-line1"></div>
      </div>

      <div className="register-admin">
        <div className="register-card">
          <h2>New Admin Registration</h2>
        <form onSubmit={handleSubmit}>
          {/* Full name */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Contact Number */}
          <div className="form-group">
            <label>Contact Number *</label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Enter your contact number"
              required
            />
          </div>

          {/* Address */}
          <div className="form-group">
            <label>Real Address *</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your real address"
              required
            />
          </div>

          {/* File upload */}
          <div className="form-group">
            <label>Upload Degree Proofs *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.png,.jpeg"
              multiple
              onChange={handleFileChange}
            />
            <small>
              Supported: PDF, JPG, PNG. Max size:{" "}
              {IPFS_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB
            </small>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="file-errors">
              {errors.map((err, idx) => (
                <div key={idx} className="error-message">
                  {err}
                </div>
              ))}
            </div>
          )}

          {/* Selected Files */}
          {degreeFiles.length > 0 && (
            <div className="selected-files">
              <h4>Selected Files:</h4>
              {degreeFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span>
                    {file.name} ({formatFileSize(file.size)})
                  </span>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveFile(index)}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="submit-btn">
            Submit for Verification
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
