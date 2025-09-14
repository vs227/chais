const getMockStorage = () => {
  const storage = localStorage.getItem('mockIPFSStorage');
  return storage ? new Map(JSON.parse(storage)) : new Map();
};

const saveMockStorage = (storage) => {
  localStorage.setItem('mockIPFSStorage', JSON.stringify([...storage]));
};

export const uploadToIPFS = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15);
  
  const storage = getMockStorage();
  storage.set(mockHash, data);
  saveMockStorage(storage);
  
  return {
    success: true,
    ipfsHash: mockHash,
    size: JSON.stringify(data).length
  };
};

export const uploadFileToIPFS = async (file) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15);
  
  return {
    success: true,
    ipfsHash: mockHash,
    size: file.size,
    fileName: file.name,
    fileType: file.type
  };
};

export const uploadFilesToIPFS = async (files) => {
  const uploadPromises = Array.from(files).map(file => uploadFileToIPFS(file));
  return Promise.all(uploadPromises);
};

export const retrieveFromIPFS = async (ipfsHash) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const storage = getMockStorage();
  const data = storage.get(ipfsHash);
  
  if (!data) {
    return {
      success: false,
      error: 'Data not found in mock storage'
    };
  }
  
  return {
    success: true,
    data: data,
    type: 'json'
  };
};

export const uploadPatientData = async (patientData, files = null) => {
  const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15);
  
  const combinedData = {
    ...patientData,
    files: files ? files.map(f => ({ 
      ipfsHash: 'Qm' + Math.random().toString(36).substring(2, 15), 
      fileName: f.name, 
      fileType: f.type, 
      size: f.size 
    })) : [],
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  };
  
  const storage = getMockStorage();
  storage.set(mockHash, combinedData);
  saveMockStorage(storage);
  
  return {
    success: true,
    ipfsHash: mockHash,
    size: JSON.stringify(combinedData).length,
    details: combinedData
  };
};

export const retrievePatientData = async (ipfsHash) => {
  // Retrieve actual data from persistent mock storage
  const storage = getMockStorage();
  const data = storage.get(ipfsHash);
  
  if (!data) {
    return {
      success: false,
      error: 'Patient data not found'
    };
  }
  
  return {
    success: true,
    data: data
  };
};

export const getIPFSGatewayURL = (ipfsHash) => {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};

export const validateFileType = (file) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  return allowedTypes.includes(file.type);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
