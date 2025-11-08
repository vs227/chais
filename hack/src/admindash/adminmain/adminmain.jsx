import React, { useState, useEffect } from "react";
import "./adminmain.css";
import {
  addOrUpdateRecord,
  isMetaMaskInstalled,
  getContract,
  initializeBlockchain,
  getRecordHistory,
  getCurrentAccount,
} from "../../utils/blockchain";
import {
  uploadPatientData,
  retrievePatientData,
  getIPFSGatewayURL,
  isRealIPFS,
} from "../../utils/ipfs";
import { addHistoryEntry, mergeHistory } from "../../utils/historyCache";
import { validateFileType, formatFileSize } from "../../utils/ipfs-mock";
import { IPFS_CONFIG } from "../../config/blockchain";

export default function AdminMain() {
  const [activeLink, setActiveLink] = useState("Add Data");
  const links = ["Add Data", "Review History", "Profile"];

  const [walletBalance, setWalletBalance] = useState(5000); // dummy balance in INR
  const [topUpAmount, setTopUpAmount] = useState(""); // input for top-up

  const [showTopUpOptions, setShowTopUpOptions] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    aadhar: "",
    age: "",
    gender: "",
    disease: "",
    bloodPressure: "",
    heartDisease: "",
  });

  // OTP flow state
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // Separate file states
  const [mriReports, setMriReports] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [fileErrors, setFileErrors] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [showBlockchainAlert, setShowBlockchainAlert] = useState(false);

  const [profileData, setProfileData] = useState({
    patientsManaged: 0,
    recordsAddedToday: 0,
    recentActivity: [],
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyDetails, setHistoryDetails] = useState([]);
  const [filterMyRecords, setFilterMyRecords] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");

  // Review History states
  const [reviewAadhar, setReviewAadhar] = useState("");
  const [reviewOtpSent, setReviewOtpSent] = useState(false);
  const [reviewOtp, setReviewOtp] = useState("");
  const [reviewOtpVerified, setReviewOtpVerified] = useState(false);
  const [reviewLoadingHistory] = useState(false);
  const [reviewHistoryDetails, setReviewHistoryDetails] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const addr = await getCurrentAccount();
        setCurrentAccount(addr);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (activeLink === "Profile") {
      const fetchProfileData = async () => {
        setLoadingProfile(true);
        try {
          const { provider } = await initializeBlockchain();
          const contract = getContract(provider);
          const filter = contract.filters.RecordAdded();
          const events = await contract.queryFilter(filter);

          const uniquePatients = new Set(
            events.map((event) => event.args.patientIdHash)
          );

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const recordsToday = events.filter((event) => {
            const eventDate = new Date(Number(event.args.timestamp) * 1000);
            return eventDate >= today;
          });

          setProfileData({
            patientsManaged: uniquePatients.size,
            recordsAddedToday: recordsToday.length,
            recentActivity: events
              .slice(-5)
              .reverse()
              .map((e) => ({
                patientIdHash: e.args.patientIdHash.substring(0, 10) + "...",
                timestamp: new Date(
                  Number(e.args.timestamp) * 1000
                ).toLocaleString(),
              })),
          });
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
        setLoadingProfile(false);
      };
      fetchProfileData();
    }
  }, [activeLink]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "aadhar") {
      setOtpSent(false);
      setOtpInput("");
      setOtpVerified(false);
    }
  };

  const handleFileCategoryChange = (e, categorySetter) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];

    files.forEach((file) => {
      if (!validateFileType(file)) {
        errors.push(`File ${file.name} is not valid. Allowed: PDF, JPG, PNG.`);
      } else if (file.size > IPFS_CONFIG.MAX_FILE_SIZE) {
        errors.push(
          `File ${file.name} is too large. Max size is ${
            IPFS_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
          }MB.`
        );
      } else {
        validFiles.push(file);
      }
    });

    categorySetter((prev) => [...prev, ...validFiles]);
    setFileErrors(errors);
    e.target.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check MetaMask connection
    if (!isMetaMaskInstalled()) {
      setShowBlockchainAlert(true);
      return;
    }

    if (!otpVerified) {
      setSubmitStatus({
        type: "error",
        message: "Please verify OTP for Aadhaar before submitting.",
      });
      return;
    }

    if (
      !formData.name ||
      !formData.aadhar ||
      !formData.age ||
      !formData.gender
    ) {
      setSubmitStatus({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: "info", message: "Uploading data to IPFS..." });

    try {
      const patientData = {
        name: formData.name,
        aadhar: formData.aadhar,
        age: parseInt(formData.age),
        gender: formData.gender,
        disease: formData.disease || "Not specified",
        bloodPressure: formData.bloodPressure || "Not measured",
        heartDisease: formData.heartDisease || "Not specified",
        adminAddress: currentAccount || "",
        timestamp: new Date().toISOString(),
      };

      console.log('Uploading patient data to IPFS...', patientData);
      const allFiles = [...mriReports, ...labReports, ...prescriptions];
      console.log('Files to upload:', allFiles.length);
      
      const ipfsResult = await uploadPatientData(patientData, allFiles);
      console.log('IPFS upload result:', ipfsResult);

      if (!ipfsResult.success) {
        console.error('IPFS upload failed:', ipfsResult.error);
        throw new Error(`IPFS upload failed: ${ipfsResult.error || 'Unknown error'}`);
      }

      if (!ipfsResult.ipfsHash) {
        console.error('No IPFS hash returned:', ipfsResult);
        throw new Error('IPFS upload succeeded but no hash was returned');
      }

      console.log('IPFS hash generated:', ipfsResult.ipfsHash);

      setSubmitStatus({
        type: "info",
        message: `IPFS hash: ${ipfsResult.ipfsHash.substring(0, 20)}... Storing on blockchain...`,
      });

      console.log('Storing IPFS hash on blockchain...', {
        aadhar: formData.aadhar,
        ipfsHash: ipfsResult.ipfsHash
      });

      const blockchainResult = await addOrUpdateRecord(
        formData.aadhar,
        ipfsResult.ipfsHash
      );

      console.log('Blockchain result:', blockchainResult);

      if (!blockchainResult.success) {
        console.error('Blockchain transaction failed:', blockchainResult.error);
        throw new Error(`Blockchain transaction failed: ${blockchainResult.error || 'Unknown error'}`);
      }

      console.log('Transaction successful:', blockchainResult.transactionHash);

      setSubmitStatus({
        type: "success",
        message: `Patient data stored successfully! IPFS: ${ipfsResult.ipfsHash.substring(0, 20)}... Tx: ${blockchainResult.transactionHash.substring(0, 10)}...`,
      });

      addHistoryEntry(formData.aadhar, ipfsResult.ipfsHash, Date.now());

      setFormData({
        name: "",
        aadhar: "",
        age: "",
        gender: "",
        disease: "",
        bloodPressure: "",
        heartDisease: "",
      });
      setMriReports([]);
      setLabReports([]);
      setPrescriptions([]);
      setFileErrors([]);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({
        type: "error",
        message: `Error: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileList = (files, setFiles, label) =>
    files.length > 0 && (
      <div className="selected-files">
        <h4>{label}</h4>
        {files.map((file, idx) => (
          <div key={idx} className="file-item">
            <span className="file-name">{file.name}</span>
            <span className="file-size">({formatFileSize(file.size)})</span>
            <button
              type="button"
              className="remove-file-btn"
              onClick={() =>
                setFiles((prev) => prev.filter((_, i) => i !== idx))
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    );

  // OTP send
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!formData.aadhar || !/^\d{12}$/.test(formData.aadhar)) {
      setSubmitStatus({
        type: "error",
        message: "Enter valid 12-digit Aadhaar.",
      });
      return;
    }
    setSubmitStatus({
      type: "info",
      message: `OTP sent to Aadhaar ending with ${formData.aadhar.slice(-4)}.`,
    });
    setOtpSent(true);
  };

  // OTP verify
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otpSent) {
      setSubmitStatus({ type: "error", message: "Send OTP first." });
      return;
    }
    if (!/^\d{6}$/.test(otpInput)) {
      setSubmitStatus({ type: "error", message: "Enter valid 6-digit OTP." });
      return;
    }
    setOtpVerified(true);
    setSubmitStatus({
      type: "success",
      message: "OTP verified. You can now fill the details.",
    });
  };

  // Review OTP send
  const handleReviewSendOtp = (e) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(reviewAadhar)) {
      setSubmitStatus({
        type: "error",
        message: "Enter valid 12-digit Aadhaar.",
      });
      return;
    }
    setSubmitStatus({
      type: "info",
      message: `OTP sent to Aadhaar ending with ${reviewAadhar.slice(-4)}.`,
    });
    setReviewOtpSent(true);
  };

  // Review OTP verify
  const handleReviewVerifyOtp = async (e) => {
    e.preventDefault();
    if (!reviewOtpSent) {
      setSubmitStatus({ type: "error", message: "Send OTP first." });
      return;
    }
    if (!/^\d{6}$/.test(reviewOtp)) {
      setSubmitStatus({ type: "error", message: "Enter valid 6-digit OTP." });
      return;
    }
    setReviewOtpVerified(true);
    setSubmitStatus({
      type: "success",
      message: "OTP verified. Loading history...",
    });
    try {
      sessionStorage.setItem("review:aadhaar", reviewAadhar);
    } catch {}
    window.location.hash = "#/admindash/review-history";
  };

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

          <div className="content-area">
            {activeLink === "Add Data" && (
              <form className="health-form" onSubmit={handleSubmit}>
                <h2>Add Patient Health Data</h2>

                {submitStatus.message && (
                  <div className={`status-message ${submitStatus.type}`}>
                    {submitStatus.message}
                  </div>
                )}

                {showBlockchainAlert && (
                  <div className="alert alert-warning">
                    <strong>MetaMask Connection:</strong> Please install MetaMask and connect your wallet
                    <button
                      type="button"
                      className="close-btn"
                      onClick={() => setShowBlockchainAlert(false)}
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Aadhaar + OTP */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Aadhar Card *</label>
                    <input
                      type="text"
                      name="aadhar"
                      value={formData.aadhar}
                      onChange={handleInputChange}
                      placeholder="Enter Aadhaar Number"
                      required
                      disabled={otpVerified}
                    />
                  </div>
                  <div className="form-group">
                    <label>&nbsp;</label>
                    {!otpSent ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleSendOtp}
                      >
                        Send OTP
                      </button>
                    ) : !otpVerified ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="text"
                          name="otp"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="otp-input"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={handleVerifyOtp}
                        >
                          Verify
                        </button>
                      </div>
                    ) : (
                      <span className="verified-badge">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Basic details */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={!otpVerified}
                    />
                  </div>
                  <div className="form-group">
                    <label>Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      disabled={!otpVerified}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      disabled={!otpVerified}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Health details */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Disease</label>
                    <input
                      type="text"
                      name="disease"
                      value={formData.disease}
                      onChange={handleInputChange}
                      disabled={!otpVerified}
                    />
                  </div>
                  <div className="form-group">
                    <label>Blood Pressure</label>
                    <input
                      type="text"
                      name="bloodPressure"
                      value={formData.bloodPressure}
                      onChange={handleInputChange}
                      disabled={!otpVerified}
                    />
                  </div>
                  <div className="form-group">
                    <label>Heart Disease</label>
                    <select
                      name="heartDisease"
                      value={formData.heartDisease}
                      onChange={handleInputChange}
                      disabled={!otpVerified}
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                {/* Separate uploads */}
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Upload MRI Report</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="mri-upload"
                        accept=".pdf,.jpg,.png,.jpeg"
                        onChange={(e) =>
                          handleFileCategoryChange(e, setMriReports)
                        }
                        multiple
                        disabled={!otpVerified}
                        className="file-input"
                      />
                      <label htmlFor="mri-upload" className="file-upload-label">
                        <span className="file-upload-text">Choose Files</span>
                      </label>
                    </div>
                    {mriReports.length > 0 && (
                      <div className="selected-files-inline">
                        <h4>MRI Reports ({mriReports.length})</h4>
                        {mriReports.map((file, idx) => (
                          <div key={idx} className="file-item">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">({formatFileSize(file.size)})</span>
                            <button
                              type="button"
                              className="remove-file-btn"
                              onClick={() =>
                                setMriReports((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Upload Lab Reports</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="lab-upload"
                        accept=".pdf,.jpg,.png,.jpeg"
                        onChange={(e) =>
                          handleFileCategoryChange(e, setLabReports)
                        }
                        multiple
                        disabled={!otpVerified}
                        className="file-input"
                      />
                      <label htmlFor="lab-upload" className="file-upload-label">
                        <span className="file-upload-text">Choose Files</span>
                      </label>
                    </div>
                    {labReports.length > 0 && (
                      <div className="selected-files-inline">
                        <h4>Lab Reports ({labReports.length})</h4>
                        {labReports.map((file, idx) => (
                          <div key={idx} className="file-item">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">({formatFileSize(file.size)})</span>
                            <button
                              type="button"
                              className="remove-file-btn"
                              onClick={() =>
                                setLabReports((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Upload Prescription</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="prescription-upload"
                        accept=".pdf,.jpg,.png,.jpeg"
                        onChange={(e) =>
                          handleFileCategoryChange(e, setPrescriptions)
                        }
                        multiple
                        disabled={!otpVerified}
                        className="file-input"
                      />
                      <label htmlFor="prescription-upload" className="file-upload-label">
                        <span className="file-upload-text">Choose Files</span>
                      </label>
                    </div>
                    {prescriptions.length > 0 && (
                      <div className="selected-files-inline">
                        <h4>Prescriptions ({prescriptions.length})</h4>
                        {prescriptions.map((file, idx) => (
                          <div key={idx} className="file-item">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">({formatFileSize(file.size)})</span>
                            <button
                              type="button"
                              className="remove-file-btn"
                              onClick={() =>
                                setPrescriptions((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {fileErrors.length > 0 && (
                  <div className="file-errors">
                    {fileErrors.map((err, idx) => (
                      <div key={idx} className="error-message">
                        {err}
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !otpVerified}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            )}

            {activeLink === "Review History" && (
              <div className="health-form">
                <h2>Review Patient History</h2>
                {submitStatus.message && (
                  <div className={`status-message ${submitStatus.type}`}>
                    {submitStatus.message}
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label>Aadhar Card *</label>
                    <input
                      type="text"
                      name="reviewAadhar"
                      value={reviewAadhar}
                      onChange={(e) => {
                        setReviewAadhar(e.target.value);
                        setReviewOtpSent(false);
                        setReviewOtp("");
                        setReviewOtpVerified(false);
                        setReviewHistoryDetails([]);
                      }}
                      placeholder="Enter Aadhaar Number"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>&nbsp;</label>
                    {!reviewOtpSent ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleReviewSendOtp}
                      >
                        Send OTP
                      </button>
                    ) : !reviewOtpVerified ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="text"
                          name="reviewOtp"
                          value={reviewOtp}
                          onChange={(e) => setReviewOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="otp-input"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={handleReviewVerifyOtp}
                        >
                          Verify
                        </button>
                      </div>
                    ) : (
                      <span className="verified-badge">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeLink === "Profile" && (
              <div className="admin-profile">
                <h2>Admin Profile</h2>
                {loadingProfile ? (
                  <div className="loading">Loading profile...</div>
                ) : (
                  <>
                    {/* Wallet Card */}
                    <div className="wallet-card">
                      <div className="wallet-header">
                        <h3>Wallet</h3>
                      </div>
                      <div className="wallet-balance">
                        <span>Current Balance</span>
                        <h2>₹ {walletBalance.toLocaleString()}</h2>
                      </div>
                      <div className="wallet-actions">
                        <input
                          type="number"
                          placeholder="Top-up amount"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          min="0"
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setShowTopUpOptions(true)}
                          disabled={!topUpAmount || topUpAmount <= 0}
                        >
                          Top Up
                        </button>
                      </div>

                      <p className="wallet-note">
                        Admin can top-up via UPI or bank transfer (prototype).
                      </p>
                    </div>

                    {/* Wallet Top-Up Modal */}
                    {/* Wallet Top-Up Modal */}
                    {showTopUpOptions && (
                      <div
                        className="modal-overlay"
                        onClick={() => setShowTopUpOptions(false)}
                      >
                        <div
                          className="modal-content"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h3>Top-Up Wallet</h3>
                          <p>Amount: ₹ {topUpAmount}</p>

                          <div className="payment-grid">
                            {[
                              "UPI",
                              "Net Banking",
                              "NEFT",
                              "RTGS",
                              "Bitcoin (BTC)",
                              "USD Tether (USDT)",
                            ].map((method) => (
                              <button
                                key={method}
                                className="payment-option-btn"
                              >
                                {method}
                              </button>
                            ))}
                          </div>

                          <button
                            className="btn btn-secondary close-btn"
                            onClick={() => setShowTopUpOptions(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="profile-stats">
                      <div className="stat-card">
                        <span className="stat-number">
                          {profileData.patientsManaged}
                        </span>
                        <span className="stat-label">Patients Managed</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-number">
                          {profileData.recordsAddedToday}
                        </span>
                        <span className="stat-label">Records Added Today</span>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="recent-activity-card">
                      <h3>Recent Activity</h3>
                      <ul className="activity-list">
                        {profileData.recentActivity.map((activity, idx) => (
                          <li key={idx}>
                            <span className="activity-id">
                              {activity.patientIdHash}
                            </span>
                            <span className="activity-time">
                              {activity.timestamp}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
