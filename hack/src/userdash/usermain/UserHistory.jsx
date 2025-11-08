import React, { useEffect, useState } from "react";
import { getRecordHistory } from "../../utils/blockchain";
import { retrievePatientData, getIPFSGatewayURL, isRealIPFS } from "../../utils/ipfs";
import { mergeHistory } from "../../utils/historyCache";
import "./usermain.css";

export default function UserHistory() {
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
          const r = await retrievePatientData(h.cid);
          detailed.push({ cid: h.cid, timestamp: h.timestamp, data: r.success ? r.data : null });
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
                  <div key={item.cid || idx} className="file-item">
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span className="file-name">{new Date(item.timestamp).toLocaleString()}</span>
                      <span className="file-size">CID: {item.cid}</span>
                      {item.data ? (
                        <span className="file-size">
                          {item.data.name ? `Name: ${item.data.name}` : ''}
                          {item.data.disease ? `  • Disease: ${item.data.disease}` : ''}
                          {item.data.bloodPressure ? `  • BP: ${item.data.bloodPressure}` : ''}
                        </span>
                      ) : (
                        <span className="file-size">Details unavailable</span>
                      )}
                    </div>
                    {isRealIPFS() && item.cid ? (
                      <a
                        href={getIPFSGatewayURL(item.cid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="report-link"
                      >
                        View
                      </a>
                    ) : (
                      <span className="file-size">Mock data</span>
                    )}
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


