
export const BLOCKCHAIN_CONFIG = {
  CONTRACT_ADDRESS: '0x9237Daf167344736D3C6AAe466EA6A7F306BC583', 
  
  // Contract deployed on Sepolia Testnet
  // Make sure MetaMask is connected to Sepolia network
  NETWORK_NAME: 'Sepolia Testnet',
  NETWORK_CHAIN_ID: 11155111, // Sepolia Chain ID
  CURRENCY_SYMBOL: 'ETH',
  
  GAS_LIMIT: 500000, 
  GAS_PRICE: '20000000000', 
};

export const IPFS_CONFIG = {
  GATEWAY_URL: 'https://gateway.pinata.cloud/ipfs/' ,
  
  API_URL: 'https://api.pinata.cloud',
  
  MAX_FILE_SIZE: 10 * 1024 * 1024, 
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ],
  
  INFURA_PROJECT_ID: process.env.REACT_APP_INFURA_PROJECT_ID,
  INFURA_PROJECT_SECRET: process.env.REACT_APP_INFURA_PROJECT_SECRET,
};

export const UI_CONFIG = {
  STATUS_MESSAGE_DURATION: 5000,
  
  LOADING_MESSAGES: {
    UPLOADING: 'Uploading data to IPFS...',
    STORING: 'Storing IPFS hash on blockchain...',
    RETRIEVING: 'Retrieving data from blockchain...',
    FETCHING: 'Retrieving data from IPFS...',
  },
  
  ERROR_MESSAGES: {
    METAMASK_NOT_FOUND: 'MetaMask not found. Please install MetaMask extension and refresh the page.',
    METAMASK_NOT_CONNECTED: 'Please connect your MetaMask wallet to continue.',
    WRONG_NETWORK: 'Please switch to Sepolia testnet in MetaMask (Chain ID: 11155111).',
    TRANSACTION_FAILED: 'Transaction failed. Please check your MetaMask connection and try again.',
    RECORD_NOT_FOUND: 'Record does not exist for the provided Patient ID.',
    IPFS_UPLOAD_FAILED: 'Failed to upload data to IPFS. Please check your connection and try again.',
    INVALID_FILE_TYPE: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.',
    FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  },
  
  SUCCESS_MESSAGES: {
    DATA_STORED: 'Patient data successfully stored!',
    DATA_RETRIEVED: 'Patient data retrieved successfully!',
  },
};
