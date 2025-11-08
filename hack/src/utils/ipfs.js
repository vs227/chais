// Multi-mode IPFS client: Pinata, Local IPFS Node, or Mock storage
import { create } from 'ipfs-http-client';
import { getIPFSGatewayURL as getMockGatewayUrl, retrievePatientData as retrieveMock, uploadPatientData as uploadMockPatientData } from './ipfs-mock';

// Configuration
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
const PINATA_API = 'https://api.pinata.cloud';
const PINATA_GATEWAY = (process.env.REACT_APP_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/');

const USE_LOCAL_IPFS = process.env.REACT_APP_USE_LOCAL_IPFS === 'true';
const LOCAL_IPFS_HOST = process.env.REACT_APP_LOCAL_IPFS_HOST || 'localhost';
const LOCAL_IPFS_PORT = process.env.REACT_APP_LOCAL_IPFS_PORT || 5001;
const LOCAL_IPFS_PROTOCOL = process.env.REACT_APP_LOCAL_IPFS_PROTOCOL || 'http';

// Gateway URLs for retrieval (fallback chain)
const GATEWAY_URLS = [
  process.env.REACT_APP_IPFS_GATEWAY_1 || 'https://gateway.pinata.cloud/ipfs/',
  process.env.REACT_APP_IPFS_GATEWAY_2 || 'https://ipfs.io/ipfs/',
  process.env.REACT_APP_IPFS_GATEWAY_3 || 'https://cloudflare-ipfs.com/ipfs/',
];

// Determine IPFS mode: Pinata > Local IPFS > Mock
const usePinata = Boolean(PINATA_JWT);
const useLocalIPFS = USE_LOCAL_IPFS && !usePinata; // Only use local if Pinata is not configured
const useRealIPFS = usePinata || useLocalIPFS;

// Initialize Local IPFS client if configured
let ipfsClient = null;
if (useLocalIPFS) {
  try {
    ipfsClient = create({
      host: LOCAL_IPFS_HOST,
      port: LOCAL_IPFS_PORT,
      protocol: LOCAL_IPFS_PROTOCOL,
    });
  } catch (error) {
    console.error('Failed to initialize local IPFS client:', error);
    console.warn('Falling back to mock IPFS storage');
  }
}

export const getIPFSGatewayURL = (cid) => {
  if (!cid) {
    console.warn('getIPFSGatewayURL: No CID provided');
    return '';
  }
  
  if (!useRealIPFS) return getMockGatewayUrl(cid);
  
  // Clean CID - remove any prefixes like "ipfs://" or "/ipfs/" 
  let cleanCid = String(cid)
    .replace(/^ipfs:\/\//, '')
    .replace(/^\/ipfs\//, '')
    .replace(/^\/+/, '') // Remove leading slashes
    .trim();
  
  // Remove any trailing slashes
  cleanCid = cleanCid.replace(/\/+$/, '');
  
  // Validate CID format (should start with Qm for CIDv0 or be a valid CIDv1)
  if (!cleanCid || cleanCid.length < 10) {
    console.error('getIPFSGatewayURL: Invalid CID format', { original: cid, cleaned: cleanCid });
    return '';
  }
  
  // For local IPFS, use the first available gateway (or local gateway if configured)
  if (useLocalIPFS) {
    return `${LOCAL_IPFS_PROTOCOL}://${LOCAL_IPFS_HOST}:${LOCAL_IPFS_PORT}/ipfs/${cleanCid}`;
  }
  
  // For Pinata, construct the URL exactly as Pinata expects: https://gateway.pinata.cloud/ipfs/HASH
  // PINATA_GATEWAY should already end with /ipfs/, so just append the hash
  let baseGateway = PINATA_GATEWAY;
  
  // Ensure gateway ends with /ipfs/ (not /ipfs or just /)
  if (!baseGateway.endsWith('/ipfs/')) {
    // Remove trailing slashes
    baseGateway = baseGateway.replace(/\/+$/, '');
    // Add /ipfs/ if not present
    if (!baseGateway.endsWith('/ipfs')) {
      baseGateway = `${baseGateway}/ipfs`;
    }
    baseGateway = `${baseGateway}/`;
  }
  
  // Construct final URL: https://gateway.pinata.cloud/ipfs/HASH
  return `${baseGateway}${cleanCid}`;
};

export const isRealIPFS = () => useRealIPFS;
export const getIPFSMode = () => {
  if (usePinata) return 'pinata';
  if (useLocalIPFS) return 'local';
  return 'mock';
};

// ===== Pinata Functions =====
async function pinFileToPinata(file) {
  try {
    const url = `${PINATA_API}/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    console.log(`📤 Uploading file to Pinata: ${file.name}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    });
    
    if (!res.ok) {
      const err = await res.text();
      console.error(`❌ Pinata file upload failed (${res.status}):`, err);
      throw new Error(`Pinata file upload failed: ${res.status} ${err}`);
    }
    
    const data = await res.json();
    console.log('Pinata file upload response:', data);
    
    // Pinata returns IpfsHash, but check for other possible field names
    const hash = data.IpfsHash || data.ipfsHash || data.hash || data.cid;
    
    if (!hash) {
      console.error('❌ Pinata response missing hash:', data);
      throw new Error('Pinata upload succeeded but no hash returned');
    }
    
    // Ensure hash is a string and clean it
    const cleanHash = String(hash).trim();
    console.log(`✅ File uploaded to Pinata: ${cleanHash}`);
    return cleanHash;
  } catch (error) {
    console.error('❌ Pinata file upload error:', error);
    throw error;
  }
}

async function pinJSONToPinata(json) {
  try {
    const url = `${PINATA_API}/pinning/pinJSONToIPFS`;
    console.log('📤 Uploading JSON to Pinata...');
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify(json),
    });
    
    if (!res.ok) {
      const err = await res.text();
      console.error(`❌ Pinata JSON upload failed (${res.status}):`, err);
      throw new Error(`Pinata JSON upload failed: ${res.status} ${err}`);
    }
    
    const data = await res.json();
    console.log('Pinata JSON upload response:', data);
    
    // Pinata returns IpfsHash, but check for other possible field names
    const hash = data.IpfsHash || data.ipfsHash || data.hash || data.cid;
    
    if (!hash) {
      console.error('❌ Pinata response missing hash:', data);
      throw new Error('Pinata upload succeeded but no hash returned');
    }
    
    // Ensure hash is a string and clean it
    const cleanHash = String(hash).trim();
    console.log(`✅ JSON uploaded to Pinata: ${cleanHash}`);
    return cleanHash;
  } catch (error) {
    console.error('❌ Pinata JSON upload error:', error);
    throw error;
  }
}

// ===== Local IPFS Node Functions =====
async function addFileToLocalIPFS(file) {
  if (!ipfsClient) {
    throw new Error('Local IPFS client not initialized. Make sure IPFS daemon is running.');
  }
  
  try {
    // ipfs-http-client can handle File objects directly in browser
    // For Node.js environments, we'd need to convert to buffer
    const result = await ipfsClient.add(file, {
      pin: true, // Pin the file to keep it available
    });
    
    // Handle both v0 and v1 CID formats
    const cid = result.cid ? result.cid.toString() : result.path;
    return cid;
  } catch (error) {
    throw new Error(`Local IPFS file upload failed: ${error.message}`);
  }
}

async function addJSONToLocalIPFS(json) {
  if (!ipfsClient) {
    throw new Error('Local IPFS client not initialized. Make sure IPFS daemon is running.');
  }
  
  try {
    const jsonString = JSON.stringify(json);
    
    // Create a Blob from the JSON string (browser-friendly)
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Add JSON to IPFS
    const result = await ipfsClient.add(blob, {
      pin: true, // Pin the data to keep it available
    });
    
    // Handle both v0 and v1 CID formats
    const cid = result.cid ? result.cid.toString() : result.path;
    return cid;
  } catch (error) {
    throw new Error(`Local IPFS JSON upload failed: ${error.message}`);
  }
}

// ===== Unified Upload Functions =====
async function pinFileToIPFS(file) {
  if (usePinata) {
    return pinFileToPinata(file);
  } else if (useLocalIPFS) {
    return addFileToLocalIPFS(file);
  } else {
    throw new Error('No IPFS provider configured');
  }
}

async function pinJSONToIPFS(json) {
  if (usePinata) {
    return pinJSONToPinata(json);
  } else if (useLocalIPFS) {
    return addJSONToLocalIPFS(json);
  } else {
    throw new Error('No IPFS provider configured');
  }
}

export const uploadPatientData = async (patientData, files = []) => {
  if (!useRealIPFS) {
    return uploadMockPatientData(patientData, files);
  }

  try {
    console.log('📤 Starting IPFS upload...', { patientData, fileCount: files.length });
    
    // Upload files first, get their CIDs
    const filesArray = Array.from(files || []);
    const uploadedFiles = [];
    
    for (const f of filesArray) {
      try {
        console.log(`📁 Uploading file: ${f.name} (${f.size} bytes)`);
        const cid = await pinFileToIPFS(f);
        console.log(`✅ File uploaded: ${f.name} -> ${cid}`);
        uploadedFiles.push({ ipfsHash: cid, fileName: f.name, fileType: f.type, size: f.size });
      } catch (fileError) {
        console.error(`❌ Failed to upload file ${f.name}:`, fileError);
        throw new Error(`Failed to upload file ${f.name}: ${fileError.message}`);
      }
    }

    const combinedData = {
      ...patientData,
      files: uploadedFiles,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    };

    console.log('📦 Uploading combined data to IPFS...');
    const rootCid = await pinJSONToIPFS(combinedData);
    console.log('✅ Root CID generated:', rootCid);
    
    if (!rootCid) {
      throw new Error('IPFS upload succeeded but no CID was returned');
    }
    
    return { 
      success: true, 
      ipfsHash: rootCid, 
      size: JSON.stringify(combinedData).length, 
      details: combinedData 
    };
  } catch (error) {
    console.error('❌ IPFS upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload data to IPFS'
    };
  }
};

export const retrievePatientData = async (cid) => {
  if (!useRealIPFS) {
    return retrieveMock(cid);
  }
  
  // Clean CID - remove any prefixes
  const cleanCid = cid.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '').trim();
  
  // Try multiple gateways in sequence (fallback chain)
  const gateways = useLocalIPFS 
    ? [getIPFSGatewayURL(cleanCid), ...GATEWAY_URLS.map(g => `${g}${cleanCid}`)]
    : GATEWAY_URLS.map(g => `${g}${cleanCid}`);
  
  let lastError = null;
  
  for (const url of gateways) {
    try {
      const res = await fetch(url, { 
        method: 'GET',
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (res.ok) {
        const data = await res.json();
        return { success: true, data };
      }
    } catch (e) {
      lastError = e;
      // Continue to next gateway
      continue;
    }
  }
  
  // If all gateways failed, try direct local IPFS node retrieval
  if (useLocalIPFS && ipfsClient) {
    try {
      // Collect all chunks
      const chunks = [];
      for await (const chunk of ipfsClient.cat(cleanCid)) {
        chunks.push(chunk);
      }
      
      // Convert chunks to string (browser-friendly)
      const decoder = new TextDecoder();
      let jsonString = '';
      
      // Process chunks sequentially to handle async operations
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (chunk instanceof Uint8Array) {
          jsonString += decoder.decode(chunk, { stream: i < chunks.length - 1 });
        } else if (typeof chunk === 'string') {
          jsonString += chunk;
        } else if (chunk instanceof ArrayBuffer) {
          jsonString += decoder.decode(new Uint8Array(chunk));
        } else if (chunk instanceof Blob) {
          const text = await chunk.text();
          jsonString += text;
        } else {
          // Try to convert to string
          jsonString += String(chunk);
        }
      }
      
      const data = JSON.parse(jsonString);
      return { success: true, data };
    } catch (e) {
      // Fall through to error
      console.warn('Direct IPFS node retrieval failed:', e);
    }
  }
  
  return { 
    success: false, 
    error: lastError ? lastError.message : 'Failed to retrieve data from all IPFS gateways' 
  };
};