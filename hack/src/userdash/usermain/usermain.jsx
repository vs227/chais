import React, { useState, useEffect, useCallback } from "react";
import "./usermain.css";
import { getRecord, isMetaMaskInstalled } from "../../utils/blockchain";
import { retrievePatientData, getIPFSGatewayURL } from "../../utils/ipfs";

export default function UserMain() {
  const [activeLink, setActiveLink] = useState("Reports");
  const links = ["Reports", "Profile"];

  const [patientId, setPatientId] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showBlockchainAlert, setShowBlockchainAlert] = useState(false);
  
  

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

    // Check MetaMask connection
    if (!isMetaMaskInstalled()) {
      setShowBlockchainAlert(true);
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
                        {reportData.files.map((file, index) => {
                          // Ensure we have a valid hash
                          const fileHash = file.ipfsHash || file.hash || file.cid;
                          const fileUrl = fileHash ? getIPFSGatewayURL(fileHash) : '';
                          
                          console.log('File info:', { 
                            fileName: file.fileName, 
                            hash: fileHash, 
                            url: fileUrl,
                            fullFile: file 
                          });
                          
                          if (!fileHash || !fileUrl) {
                            return (
                              <div key={index} className="file-item">
                                <span className="file-name">{file.fileName || 'Unknown file'}</span>
                                <span className="file-error" style={{ color: '#dc3545', fontSize: '0.85rem' }}>
                                  Hash missing
                                </span>
                              </div>
                            );
                          }
                          
                          return (
                            <div key={index} className="file-item">
                              <span className="file-name">{file.fileName}</span>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="report-link"
                                onClick={(e) => {
                                  console.log('Opening file:', fileUrl);
                                  // Let the link open, but log for debugging
                                }}
                              >
                                View File
                              </a>
                            </div>
                          );
                        })}
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
                {reportData ? (
                  <div className="profile-container">
                    <div className="profile-header">
                      <div className="profile-avatar">
                        {/* Placeholder for profile picture */}
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="7" r="3" fill="#4CAF50"/>
                          <path d="M17 14H7C4.79086 14 3 15.7909 3 18V20H21V18C21 15.7909 19.2091 14 17 14Z" fill="#4CAF50"/>
                        </svg>
                      </div>
                      <h3>{reportData.name}</h3>
                      <p className="profile-aadhaar">Aadhaar: {reportData.aadhar}</p>
                    </div>

                    <div className="profile-details-card">
                      <h4>Personal Information</h4>
                      <div className="detail-row">
                        <span className="detail-label">Gender:</span>
                        <span className="detail-value">{reportData.gender}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Age:</span>
                        <span className="detail-value">{reportData.age}</span>
                      </div>
                      {reportData.metadata && (
                        <div className="detail-row">
                          <span className="detail-label">Last Updated:</span>
                          <span className="detail-value">{new Date(reportData.metadata.timestamp).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="profile-actions">
                      <a
                        href="#/userdash/history"
                        className="report-link profile-button"
                      >
                        View Full History
                      </a>
                    </div>
                  </div>
                ) : (
                  <p>No patient data loaded. Please retrieve patient data first.</p>
                )}
              </div>
            )}
            {/* Modal removed in favor of dedicated page */}
          </div>
        </div>
      </div>
    </div>
  );
}