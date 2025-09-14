import React, { useState, useEffect } from "react";
import "./adminmain.css";
import { addOrUpdateRecord, isMetaMaskInstalled, getContract, initializeBlockchain } from "../../utils/blockchain";
import { uploadPatientData, validateFileType, formatFileSize } from "../../utils/ipfs-mock";
import { IPFS_CONFIG } from "../../config/blockchain";

export default function AdminMain() {
  const [activeLink, setActiveLink] = useState("Add Data");
  const links = ["Add Data", "Profile"];
  
  const [formData, setFormData] = useState({
    name: "",
    aadhar: "",
    age: "",
    gender: "",
    disease: "",
    bloodPressure: "",
    heartDisease: ""
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [showMetaMaskAlert, setShowMetaMaskAlert] = useState(false);

  const [profileData, setProfileData] = useState({ patientsManaged: 0, recordsAddedToday: 0, recentActivity: [] });
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (activeLink === "Profile") {
      const fetchProfileData = async () => {
        setLoadingProfile(true);
        try {
          const { provider } = await initializeBlockchain();
          const contract = getContract(provider);
          const filter = contract.filters.RecordAdded();
          const events = await contract.queryFilter(filter);

          const uniquePatients = new Set(events.map(event => event.args.patientIdHash));

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const recordsToday = events.filter(event => {
            const eventDate = new Date(Number(event.args.timestamp) * 1000);
            return eventDate >= today;
          });

          setProfileData({
            patientsManaged: uniquePatients.size,
            recordsAddedToday: recordsToday.length,
            recentActivity: events.slice(-5).reverse().map(e => ({ 
              patientIdHash: e.args.patientIdHash.substring(0, 10) + '...',
              timestamp: new Date(Number(e.args.timestamp) * 1000).toLocaleString(),
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];

    files.forEach((file, index) => {
      if (!validateFileType(file)) {
        errors.push(`File ${file.name} is not a valid type. Only PDF, JPG, and PNG files are allowed.`);
      } else if (file.size > IPFS_CONFIG.MAX_FILE_SIZE) {
        errors.push(`File ${file.name} is too large. Maximum size is ${IPFS_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      } else {
        validFiles.push(file);
      }
    });

    setSelectedFiles(validFiles);
    setFileErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isMetaMaskInstalled()) {
      setShowMetaMaskAlert(true);
      return;
    }

    if (!formData.name || !formData.aadhar || !formData.age || !formData.gender) {
      setSubmitStatus({ type: "error", message: "Please fill in all required fields." });
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
        timestamp: new Date().toISOString()
      };

      const ipfsResult = await uploadPatientData(patientData, selectedFiles);
      
      if (!ipfsResult.success) {
        throw new Error(ipfsResult.error);
      }

      setSubmitStatus({ type: "info", message: "Storing IPFS hash on blockchain..." });

      console.log('Storing on blockchain:', formData.aadhar, ipfsResult.ipfsHash);
      const blockchainResult = await addOrUpdateRecord(formData.aadhar, ipfsResult.ipfsHash);
      console.log('Blockchain result:', blockchainResult);
      
      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error);
      }

      setSubmitStatus({ 
        type: "success", 
        message: `Patient data successfully stored! Transaction: ${blockchainResult.transactionHash}` 
      });

      setFormData({
        name: "",
        aadhar: "",
        age: "",
        gender: "",
        disease: "",
        bloodPressure: "",
        heartDisease: ""
      });
      setSelectedFiles([]);
      setFileErrors([]);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({ 
        type: "error", 
        message: `Error: ${error.message}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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

                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter Name" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Aadhar Card *</label>
                    <input 
                      type="text" 
                      name="aadhar"
                      value={formData.aadhar}
                      onChange={handleInputChange}
                      placeholder="Enter Aadhar Number" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Age *</label>
                    <input 
                      type="number" 
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter Age" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select 
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Disease</label>
                    <input 
                      type="text" 
                      name="disease"
                      value={formData.disease}
                      onChange={handleInputChange}
                      placeholder="Enter Disease" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Blood Pressure</label>
                    <input 
                      type="text" 
                      name="bloodPressure"
                      value={formData.bloodPressure}
                      onChange={handleInputChange}
                      placeholder="e.g. 120/80" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Heart Disease</label>
                    <select 
                      name="heartDisease"
                      value={formData.heartDisease}
                      onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Upload Medical Reports</label>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.png,.jpeg"
                      onChange={handleFileChange}
                      multiple
                    />
                    <small className="file-help">
                      Supported formats: PDF, JPG, PNG. Maximum file size: {IPFS_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB per file.
                    </small>
                  </div>
                </div>

                {fileErrors.length > 0 && (
                  <div className="file-errors">
                    {fileErrors.map((error, index) => (
                      <div key={index} className="error-message">{error}</div>
                    ))}
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="selected-files">
                    <h4>Selected Files:</h4>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({formatFileSize(file.size)})</span>
                        <button 
                          type="button" 
                          className="remove-file-btn"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            )}

            {activeLink === "Profile" && (
              <div className="admin-profile">
                <h2>Admin Profile</h2>
                {loadingProfile ? <div className="spinner"></div> : (
                  <div className="profile-info">
                    <div className="profile-details">
                      <h3>Healthcare Administrator</h3>
                      <p>System Administrator</p>
                      <p>admin@healthcare-system.com</p>
                    </div>
                    <div className="profile-stats">
                      <div className="stat">
                        <span className="stat-number">{profileData.patientsManaged}</span>
                        <span className="stat-label">Patients Managed</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{profileData.recordsAddedToday}</span>
                        <span className="stat-label">Records Added Today</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">99.8%</span>
                        <span className="stat-label">System Uptime</span>
                      </div>
                    </div>
                    <div className="recent-activity">
                      <h3>Recent Activity</h3>
                      <div className="activity">
                        {profileData.recentActivity.map((activity, index) => (
                          <div className="activity-item" key={index}>
                            <span>Record added for patient {activity.patientIdHash}</span>
                            <span>{activity.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}