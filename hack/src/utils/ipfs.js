import { create } from 'ipfs-http-client';
import { IPFS_CONFIG } from '../config/blockchain';

// IPFS configuration
const IPFS_GATEWAY_URL = IPFS_CONFIG.GATEWAY_URL;
const IPFS_API_URL = IPFS_CONFIG.API_URL;

// Initialize IPFS client
let ipfsClient = null;

/**
 * Initialize IPFS client
 * @returns {Object} IPFS client instance
 */
const initializeIPFS = () => {
  if (!ipfsClient) {
    try {
      ipfsClient = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: 'Basic ' + btoa(IPFS_CONFIG.INFURA_PROJECT_ID + ':' + IPFS_CONFIG.INFURA_PROJECT_SECRET)
        }
      });
    } catch (error) {
      console.error('Error initializing IPFS client:', error);
      // Fallback to local IPFS node or alternative gateway
      try {
        ipfsClient = create({
          host: 'localhost',
          port: 5001,
          protocol: 'http'
        });
      } catch (localError) {
        // Final fallback - use a different public gateway
        ipfsClient = create({
          host: 'ipfs.infura.io',
          port: 5001,
          protocol: 'https'
        });
      }
    }
  }
  return ipfsClient;
};

/**
 * Upload data to IPFS
 * @param {Object} data - Data object to upload
 * @returns {Promise<Object>} Result containing IPFS hash or error
 */
export const uploadToIPFS = async (data) => {
  try {
    const ipfs = initializeIPFS();
    
    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2);
    
    // Add data to IPFS
    const result = await ipfs.add(jsonData);
    
    return {
      success: true,
      ipfsHash: result.path,
      size: result.size
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload file to IPFS
 * @param {File} file - File to upload
 * @returns {Promise<Object>} Result containing IPFS hash or error
 */
export const uploadFileToIPFS = async (file) => {
  try {
    const ipfs = initializeIPFS();
    
    // Add file to IPFS
    const result = await ipfs.add(file);
    
    return {
      success: true,
      ipfsHash: result.path,
      size: result.size,
      fileName: file.name,
      fileType: file.type
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload multiple files to IPFS
 * @param {FileList} files - Files to upload
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadFilesToIPFS = async (files) => {
  const uploadPromises = Array.from(files).map(file => uploadFileToIPFS(file));
  return Promise.all(uploadPromises);
};

/**
 * Retrieve data from IPFS
 * @param {string} ipfsHash - IPFS hash of the data
 * @returns {Promise<Object>} Result containing data or error
 */
export const retrieveFromIPFS = async (ipfsHash) => {
  try {
    const ipfs = initializeIPFS();
    
    // Get data from IPFS
    const chunks = [];
    for await (const chunk of ipfs.cat(ipfsHash)) {
      chunks.push(chunk);
    }
    
    // Combine chunks and convert to string
    const data = Buffer.concat(chunks).toString();
    
    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(data);
      return {
        success: true,
        data: jsonData,
        type: 'json'
      };
    } catch (parseError) {
      // If not JSON, return as raw data
      return {
        success: true,
        data: data,
        type: 'raw'
      };
    }
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get IPFS gateway URL for a hash
 * @param {string} ipfsHash - IPFS hash
 * @returns {string} Full URL to access the data
 */
export const getIPFSGatewayURL = (ipfsHash) => {
  return `${IPFS_GATEWAY_URL}${ipfsHash}`;
};

/**
 * Upload patient data with files to IPFS
 * @param {Object} patientData - Patient data object
 * @param {FileList} files - Medical report files
 * @returns {Promise<Object>} Result containing combined IPFS hash or error
 */
export const uploadPatientData = async (patientData, files = null) => {
  try {
    const uploadResults = {
      patientData: null,
      files: []
    };
    
    // Upload patient data
    const dataResult = await uploadToIPFS(patientData);
    if (!dataResult.success) {
      return dataResult;
    }
    uploadResults.patientData = dataResult;
    
    // Upload files if provided
    if (files && files.length > 0) {
      const fileResults = await uploadFilesToIPFS(files);
      uploadResults.files = fileResults;
      
      // Check if any file upload failed
      const failedUploads = fileResults.filter(result => !result.success);
      if (failedUploads.length > 0) {
        return {
          success: false,
          error: `Failed to upload ${failedUploads.length} file(s)`,
          details: failedUploads
        };
      }
    }
    
    // Create a combined data structure
    const combinedData = {
      patientData: {
        ipfsHash: uploadResults.patientData.ipfsHash,
        size: uploadResults.patientData.size
      },
      files: uploadResults.files.map(result => ({
        ipfsHash: result.ipfsHash,
        fileName: result.fileName,
        fileType: result.fileType,
        size: result.size
      })),
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    // Upload the combined metadata
    const combinedResult = await uploadToIPFS(combinedData);
    if (!combinedResult.success) {
      return combinedResult;
    }
    
    return {
      success: true,
      ipfsHash: combinedResult.ipfsHash,
      size: combinedResult.size,
      details: combinedData
    };
  } catch (error) {
    console.error('Error uploading patient data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Retrieve and parse patient data from IPFS
 * @param {string} ipfsHash - IPFS hash of the patient data
 * @returns {Promise<Object>} Result containing parsed patient data or error
 */
export const retrievePatientData = async (ipfsHash) => {
  try {
    const result = await retrieveFromIPFS(ipfsHash);
    
    if (!result.success) {
      return result;
    }
    
    if (result.type !== 'json') {
      return {
        success: false,
        error: 'Invalid data format - expected JSON'
      };
    }
    
    const data = result.data;
    
    // Validate the data structure
    if (!data.patientData || !data.patientData.ipfsHash) {
      return {
        success: false,
        error: 'Invalid patient data structure'
      };
    }
    
    // Retrieve the actual patient data
    const patientDataResult = await retrieveFromIPFS(data.patientData.ipfsHash);
    if (!patientDataResult.success) {
      return patientDataResult;
    }
    
    // Parse patient data
    let patientData;
    try {
      patientData = JSON.parse(patientDataResult.data);
    } catch (parseError) {
      return {
        success: false,
        error: 'Failed to parse patient data'
      };
    }
    
    return {
      success: true,
      data: {
        ...patientData,
        files: data.files || [],
        metadata: {
          timestamp: data.timestamp,
          version: data.version
        }
      }
    };
  } catch (error) {
    console.error('Error retrieving patient data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validate file type for medical reports
 * @param {File} file - File to validate
 * @returns {boolean} True if file type is allowed
 */
export const validateFileType = (file) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  return allowedTypes.includes(file.type);
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
