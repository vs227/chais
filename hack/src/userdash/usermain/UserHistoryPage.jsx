import React, { useEffect, useState } from "react";
import { getRecordHistory } from "../../utils/blockchain";
import { retrievePatientData, getIPFSGatewayURL, isRealIPFS } from "../../utils/ipfs";
import { mergeHistory } from "../../utils/historyCache";
import "./usermain.css";

export default function UserHistoryPage() {
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const aadhaar = localStorage.getItem("userAadhaar");
    if (aadhaar) {
      setPatientId(aadhaar);
    }
  }, []);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    (async () => {
      const res = await getRecordHistory(patientId);
      if (!res.success) {
        setEntries([]);
      } else {
        const merged = mergeHistory(patientId, res.history);
        const detailed = [];
        for (const h of merged) {
          const r = await retrievePatientData(h.ipfsHash);
          detailed.push({ cid: h.ipfsHash, timestamp: h.timestamp, data: r.success ? r.data : null });
        }
        setEntries(detailed);
      }
      setLoading(false);
    })();
  }, [patientId]);

  return (
    <div className="usermain">
      <div className="user-main">
        <div className="user-card">
          <div className="content-area">
            <h2>Full Records History</h2>
            {patientId && (
              <p style={{ marginBottom: 10 }}>Aadhaar: <strong>{patientId}</strong></p>
            )}
            {loading ? (
              <div className="spinner"></div>
            ) : entries.length === 0 ? (
              <p>No history found.</p>
            ) : (
              <div className="selected-files">
                {entries.map((item, idx) => (
                  <div className="file-item" key={item.cid || idx}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span className="file-name">{new Date(item.timestamp).toLocaleString()}</span>
                      {item.data ? (
                        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 4, columnGap: 8 }}>
                          <span className="file-size">Name:</span><span className="file-size">{item.data.name || '-'}</span>
                          <span className="file-size">Aadhaar:</span><span className="file-size">{item.data.aadhar || '-'}</span>
                          <span className="file-size">Age:</span><span className="file-size">{item.data.age || '-'}</span>
                          <span className="file-size">Gender:</span><span className="file-size">{item.data.gender || '-'}</span>
                          <span className="file-size">Disease:</span><span className="file-size">{item.data.disease || '-'}</span>
                          <span className="file-size">Blood Pressure:</span><span className="file-size">{item.data.bloodPressure || '-'}</span>
                          <span className="file-size">Heart Disease:</span><span className="file-size">{item.data.heartDisease || '-'}</span>
                          {item.data.metadata && item.data.metadata.timestamp && (
                            <>
                              <span className="file-size">Record Time:</span><span className="file-size">{new Date(item.data.metadata.timestamp).toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="file-size">Details unavailable</span>
                      )}
                      {item.data && item.data.files && item.data.files.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <span className="file-name">Medical Reports:</span>
                          {item.data.files.map((f, i) => (
                            <div key={i} className="file-item" style={{ marginTop: 6 }}>
                              <span className="file-name">📄 {f.fileName}</span>
                              {isRealIPFS() && f.ipfsHash ? (
                                <a href={getIPFSGatewayURL(f.ipfsHash)} target="_blank" rel="noopener noreferrer" className="report-link">View</a>
                              ) : (
                                <span className="file-size">Mock data</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
