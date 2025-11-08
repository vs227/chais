import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [aadhar, setAadhar] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const navigate = useNavigate();

  const handleAadharSubmit = (event) => {
    event.preventDefault();
    if (activeTab === "user") {
      console.log("Sending OTP for Aadhar:", aadhar);
      setOtpSent(true);
    } else if (activeTab === "admin") {
      console.log("Sending OTP for Unique ID:", aadhar);
      setOtpSent(true);
    }
  };

  const handleVerifySubmit = (event) => {
    event.preventDefault();
    if (activeTab === "user") {
      console.log("Verifying Aadhar:", aadhar, "with OTP:", otp);
      localStorage.setItem("userAadhaar", aadhar);
      navigate("/userdash");
    } else if (activeTab === "admin") {
      console.log("Verifying Unique ID:", aadhar, "with OTP:", otp);
      navigate("/admindash");
    }
  };

  return (
    <div className="login">
      <div className="log-nav1">
        <div className="logo1"></div>
        <div className="logo-line1"></div>
      </div>

      <div className="login-page">
        <div className="login-card">
          {/* Tabs */}
          <div className="names">
            <button
              className={`tab-button ${activeTab === "user" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("user");
                setOtpSent(false);
                setAadhar("");
              }}
            >
              User
            </button>
            <h5> | </h5>
            <button
              className={`tab-button ${activeTab === "admin" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("admin");
                setOtpSent(false);
                setAadhar("");
              }}
            >
              Admin
            </button>
            <h5> | </h5>
            <button
              className={`tab-button ${activeTab === "newadmin" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("newadmin");
                setOtpSent(false);
                setAadhar("");
              }}
            >
              Register
            </button>
          </div>

          {/* Login / Register section */}
          <div className="log-in">
            <h2>{activeTab === "newadmin" ? "Register" : "Login"}</h2>

            {/* User/Admin login flow */}
            {activeTab !== "newadmin" ? (
              !otpSent ? (
                <form onSubmit={handleAadharSubmit}>
                  {activeTab === "user" ? (
                    <>
                      <label htmlFor="aadhar-input">Aadhar Number</label>
                      <input
                        id="aadhar-input"
                        type="text"
                        value={aadhar}
                        onChange={(e) => setAadhar(e.target.value)}
                        placeholder="Enter 12-digit Aadhar number"
                        required
                        pattern="\d{12}"
                        title="Aadhar number must be 12 digits."
                      />
                    </>
                  ) : (
                    <>
                      <label htmlFor="uniqueid-input">Unique ID</label>
                      <input
                        id="uniqueid-input"
                        type="text"
                        value={aadhar}
                        onChange={(e) => setAadhar(e.target.value)}
                        placeholder="Enter Unique ID"
                        required
                      />
                    </>
                  )}
                  <button type="submit" className="login-button">
                    Send OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifySubmit}>
                  <label htmlFor="otp-input">Enter OTP</label>
                  <input
                    id="otp-input"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    required
                    pattern="\d{6}"
                    title="OTP must be 6 digits."
                  />
                  <button type="submit" className="login-button">
                    Verify & Login
                  </button>
                </form>
              )
            ) : (
              // New Admin register button
              <div className="register-option">
                <p>New Admin? Please register with your degree proofs.</p>
                <button
                  type="button"
                  className="login-button"
                  onClick={() => navigate("/registeradmin")}
                >
                  Register Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
