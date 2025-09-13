import React, { useState } from 'react';
import "./Login.css";

export default function Login() {
    const [aadhar, setAadhar] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [activeTab, setActiveTab] = useState('author');

    const handleAadharSubmit = (event) => {
        event.preventDefault();
        console.log("Sending OTP for Aadhar:", aadhar);
        alert(`An OTP has been sent to the mobile number linked with Aadhar: ${aadhar}`);
        setOtpSent(true); 
    };

    const handleVerifySubmit = (event) => {
        event.preventDefault();
        console.log("Verifying Aadhar:", aadhar, "with OTP:", otp);
        alert(`Login successful for Aadhar: ${aadhar}`);
    };
  return (
    <div className="login">
        <div className="log-nav">
            <div className="logo"></div>
            <div className="logo-line"></div>
        </div>
        <div className="login-page">
            <div className="login-card">
                <div className="names">
                    <button 
                        className={`tab-button ${activeTab === 'author' ? 'active' : ''}`}
                        onClick={() => setActiveTab('author')}
                    >
                        Author
                    </button>
                    <h5> | </h5>
                    <button 
                        className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
                        onClick={() => setActiveTab('user')}
                    >
                        User
                    </button>
                </div>
                <div className="log-in">
                    <h2>Login</h2>
                    {!otpSent ? (
                        <form onSubmit={handleAadharSubmit}>
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
                            <button type="submit" className="login-button">Send OTP</button>
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
                            <button type="submit" className="login-button">Verify & Login</button>
                        </form>
                    )}
                </div>
                
            </div>
        </div>
    </div>
    
  )
}
