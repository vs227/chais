import React, { useState, useEffect, useCallback } from "react";
import "./usermain.css";
import { getRecord, isMetaMaskInstalled } from "../../utils/blockchain";
import { retrievePatientData, getIPFSGatewayURL } from "../../utils/ipfs-mock";

export default function UserMain() {
  const [activeLink, setActiveLink] = useState("Reports");
  const links = ["Reports", "Profile"];

  const [patientId, setPatientId] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showMetaMaskAlert, setShowMetaMaskAlert] = useState(false);

  const handleRetrieveDataForUser = useCallback(async (aadhaarNumber) => {
    if (!aadhaarNumber.trim()) return;

    setIsLoading(true);
    setStatus({ type: "info", message: "Loading your health records..." });

    try {
      const blockchainResult = await getRecord(aadhaarNumber);
      
      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error);
      }

      setStatus({ type: "info", message: "Retrieving your data from IPFS..." });

      const ipfsResult = await retrievePatientData(blockchainResult.ipfsHash);
      
      if (!ipfsResult.success) {
        throw new Error(ipfsResult.error);
      }

      setReportData(ipfsResult.data);
      setStatus({ type: "success", message: "Your health records loaded successfully!" });

    } catch (error) {
      console.error('Error retrieving patient data:', error);
      setStatus({ 
        type: "error", 
        message: `No records found for Aadhaar: ${aadhaarNumber}. Please contact admin to add your records.` 
      });
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const userAadhaar = localStorage.getItem('userAadhaar');
    if (userAadhaar) {
      setPatientId(userAadhaar);
      handleRetrieveDataForUser(userAadhaar);
    }
  }, [handleRetrieveDataForUser]);


  const handleRetrieveData = async () => {
    if (!patientId.trim()) {
      setStatus({ type: "error", message: "Please enter a Patient ID/Aadhaar number." });
      return;
    }

    if (!isMetaMaskInstalled()) {
      setShowMetaMaskAlert(true);
      return;
    }

    setIsLoading(true);
    setStatus({ type: "info", message: "Retrieving data from blockchain..." });

    try {
      const blockchainResult = await getRecord(patientId);
      
      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error);
      }

      setStatus({ type: "info", message: "Retrieving data from IPFS..." });

      const ipfsResult = await retrievePatientData(blockchainResult.ipfsHash);
      
      if (!ipfsResult.success) {
        throw new Error(ipfsResult.error);
      }

      setReportData(ipfsResult.data);
      setStatus({ type: "success", message: "Patient data retrieved successfully!" });

    } catch (error) {
      console.error('Error retrieving patient data:', error);
      setStatus({ 
        type: "error", 
        message: `Error: ${error.message}` 
      });
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPatientId("");
    setReportData(null);
    setStatus({ type: "", message: "" });
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
                
                <div className="user-info-display">
                  <div className="user-info-group">
                    <label>Logged in as:</label>
                    <div className="aadhar-display">
                      <span className="aadhar-number">{patientId || 'Loading...'}</span>
                    </div>
                    <small className="help-text">
                      Your health records are automatically loaded from your login.
                    </small>
                  </div>
                  <div className="search-actions">
                    <button 
                      onClick={handleRetrieveData}
                      disabled={isLoading || !patientId.trim()}
                      className="search-btn"
                    >
                      {isLoading ? "Loading..." : "Refresh Data"}
                    </button>
                    <button 
                      onClick={handleClear}
                      disabled={isLoading}
                      className="clear-btn"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {status.message && (
                  <div className={`status-message ${status.type}`}>
                    {status.message}
                  </div>
                )}

                {showMetaMaskAlert && (
                  <div className="alert alert-warning">
                    <strong>MetaMask Required:</strong> Please install MetaMask to use this application.
                    <button 
                      type="button" 
                      className="close-btn"
                      onClick={() => setShowMetaMaskAlert(false)}
                    >
                      ×
                    </button>
                  </div>
                )}

                {reportData && (
                  <div className="report-card">
                    <h3>Patient Information</h3>
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
                    
                    {reportData.files && reportData.files.length > 0 && (
                      <div className="files-section">
                        <h4>Medical Reports</h4>
                        {reportData.files.map((file, index) => (
                          <div key={index} className="file-item">
                            <span className="file-name">📄 {file.fileName}</span>
                            <a
                              href={getIPFSGatewayURL(file.ipfsHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="report-link"
                            >
                              View File
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    {reportData.metadata && (
                      <div className="metadata-section">
                        <h4>Record Information</h4>
                        <div className="report-row">
                          <span className="label">Created:</span>
                          <span className="value">
                            {new Date(reportData.metadata.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="report-row">
                          <span className="label">Version:</span>
                          <span className="value">{reportData.metadata.version}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!reportData && !isLoading && !status.message && (
                  <div className="no-data-message">
                    <p>Enter a Patient ID or Aadhaar number to retrieve health records.</p>
                  </div>
                )}
              </div>
            )}

            {activeLink === "Profile" && (
              <div className="profile-view">
                <h2>User Profile</h2>
                <div className="profile-card">
                  {reportData ? (
                    <>
                      <p><strong>Name:</strong> {reportData.name}</p>
                      <p><strong>Aadhar:</strong> {reportData.aadhar}</p>
                      <p><strong>Gender:</strong> {reportData.gender}</p>
                      <p><strong>Age:</strong> {reportData.age}</p>
                      {reportData.metadata && (
                        <p><strong>Last Updated:</strong> {new Date(reportData.metadata.timestamp).toLocaleString()}</p>
                      )}
                    </>
                  ) : (
                    <p>No patient data loaded. Please retrieve patient data first.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}