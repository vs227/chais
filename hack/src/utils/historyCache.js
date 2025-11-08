// Lightweight local cache to augment on-chain event history for fast prototypes

const KEY_PREFIX = 'historyCache:';

export const addHistoryEntry = (aadhaar, cid, timestampMs) => {
  try {
    const key = KEY_PREFIX + aadhaar;
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    // avoid duplicates by cid
    if (!arr.find(e => e.cid === cid)) {
      arr.push({ cid, timestamp: timestampMs });
      localStorage.setItem(key, JSON.stringify(arr));
    }
  } catch {}
};

export const getHistoryEntries = (aadhaar) => {
  try {
    const key = KEY_PREFIX + aadhaar;
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

export const mergeHistory = (aadhaar, chainEvents) => {
  const cache = getHistoryEntries(aadhaar);
  const map = new Map();
  for (const e of chainEvents || []) {
    map.set(e.ipfsHash, { cid: e.ipfsHash, timestamp: e.timestamp });
  }
  for (const e of cache) {
    if (!map.has(e.cid)) {
      map.set(e.cid, { cid: e.cid, timestamp: e.timestamp });
    }
  }
  return Array.from(map.values()).sort((a,b) => b.timestamp - a.timestamp);
};



