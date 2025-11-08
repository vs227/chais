import React, { useEffect, useState } from "react";
import { getRecordHistory } from "../../utils/blockchain";
import { retrievePatientData, getIPFSGatewayURL, isRealIPFS } from "../../utils/ipfs";
import "./adminmain.css";

export default function ReviewHistoryPage() {
  const [aadhaar, setAadhaar] = useState("");
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const v = sessionStorage.getItem("review:aadhaar");
    if (v) setAadhaar(v);
  }, []);

  useEffect(() => {
    if (!aadhaar) return;
    setLoading(true);
    (async () => {
      const res = await getRecordHistory(aadhaar);
      if (!res.success) {
        setEntries([]);
      } else {
        const detailed = [];
        for (const h of res.history) {
          const r = await retrievePatientData(h.ipfsHash);
          detailed.push({ cid: h.ipfsHash, timestamp: h.timestamp, data: r.success ? r.data : null });
        }
        detailed.sort((a,b) => b.timestamp - a.timestamp);
        setEntries(detailed);
      }
      setLoading(false);
    })();
  }, [aadhaar]);

  return (
    <div className="adminmain">
      <div className="admin-main">
        <div className="admin-card">
          <div className="content-area">
            <h2>Patient History</h2>
            {aadhaar && (
              <p style={{ marginBottom: 10 }}>Aadhaar: <strong>{aadhaar}</strong></p>
            )}
            {loading ? (
              <div className="spinner"></div>
            ) : entries.length === 0 ? (
              <div className="file-help">No previous records found.</div>
            ) : (
              <div className="selected-files">
                {entries.map((item, idx) => (
                  <div className="file-item" key={item.cid || idx}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span className="file-name">{new Date(item.timestamp).toLocaleString()}</span>
                      <span className="file-size">CID: {item.cid}</span>
                      {item.data ? (
                        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 4, columnGap: 8 }}>
                          <span className="file-size">Name:</span><span className="file-size">{item.data.name || '-'}</span>
                          <span className="file-size">Aadhaar:</span><span className="file-size">{item.data.aadhar || '-'}</span>
                          <span className="file-size">Age:</span><span className="file-size">{item.data.age || '-'}</span>
                          <span className="file-size">Gender:</span><span className="file-size">{item.data.gender || '-'}</span>
                          <span className="file-size">Disease:</span><span className="file-size">{item.data.disease || '-'}</span>
                          <span className="file-size">Blood Pressure:</span><span className="file-size">{item.data.bloodPressure || '-'}</span>
                          <span className="file-size">Heart Disease:</span><span className="file-size">{item.data.heartDisease || '-'}</span>
                          <span className="file-size">By (Admin):</span><span className="file-size">{item.data.adminAddress ? `${item.data.adminAddress.slice(0,6)}...${item.data.adminAddress.slice(-4)}` : '-'}</span>
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
                    {isRealIPFS() && item.cid ? (
                      <a
                        href={getIPFSGatewayURL(item.cid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="report-link"
                      >
                        View JSON
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


