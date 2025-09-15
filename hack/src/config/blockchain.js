
export const BLOCKCHAIN_CONFIG = {
  CONTRACT_ADDRESS: '0x001fE43aEFC1D497e0ae6eBD0cD1Fa7fF53e96AC', 
  
  GANACHE_RPC_URL: 'http://127.0.0.1:7545',
  CHAIN_ID: 1337,
  
  GANACHE_PRIVATE_KEY: '0x76665fa654d0c9f5ce01f3ca5d48684fccea2f85c70ecbc959ba86f429beb854',
  GANACHE_ACCOUNT_ADDRESS: '0x0F305835cCe0c988e42bA59bf3ef8b16AB47a076',
  
  NETWORK_NAME: 'Ganache Local',
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
    METAMASK_NOT_FOUND: 'MetaMask not detected. Please install MetaMask to use this application.',
    TRANSACTION_FAILED: 'Transaction failed. Please check your MetaMask and try again.',
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
