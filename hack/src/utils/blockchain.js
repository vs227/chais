import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';

const CONTRACT_ADDRESS = BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "patientIdHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "RecordAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "patientIdHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "RecordUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "patientIdHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "name": "addOrUpdateRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "patientIdHash",
        "type": "bytes32"
      }
    ],
    "name": "getRecord",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "patientIdHash",
        "type": "bytes32"
      }
    ],
    "name": "recordExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * Initialize blockchain connection using MetaMask
 * @returns {Object} Provider and signer objects
 */
export const initializeBlockchain = async () => {
  try {
    // Check if MetaMask is installed
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension.');
    }

    console.log('Connecting to MetaMask...');
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('Please connect your MetaMask wallet.');
    }

    console.log('MetaMask connected. Account:', accounts[0]);
    
    // Create provider from MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Check network
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, 'Chain ID:', network.chainId.toString());
    
    // Verify we're on Sepolia (Chain ID: 11155111)
    const SEPOLIA_CHAIN_ID = 11155111n;
    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      // Network mismatch - will attempt to switch automatically
      
      // Try to prompt user to switch network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
        });
        // If successful, reload the page
        window.location.reload();
      } catch (switchError) {
        // User rejected or network doesn't exist
        if (switchError.code === 4902) {
          // Network not added, try to add it
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }]
            });
            window.location.reload();
          } catch (addError) {
            console.error('Failed to add Sepolia network:', addError);
          }
        }
      }
    }
    
    // Get signer from MetaMask
    const signer = await provider.getSigner();
    
    // Verify contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x' || !code || code.length < 10) {
      console.error('Contract not found at address:', CONTRACT_ADDRESS);
      console.error('   Current network:', network.name, 'Chain ID:', network.chainId.toString());
      console.error('   Please make sure you are on Sepolia testnet (Chain ID: 11155111)');
      throw new Error(`Contract not found at ${CONTRACT_ADDRESS}. Please switch to Sepolia testnet in MetaMask.`);
    }
    
    console.log('Contract found at address:', CONTRACT_ADDRESS);
    
    return { provider, signer };
  } catch (error) {
    console.error('Error initializing blockchain:', error);
    throw error;
  }
};

/**
 * Get contract instance
 * @param {Object} signer - Ethers signer object
 * @returns {Object} Contract instance
 */
export const getContract = (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/**
 * Generate hash from patient ID (Aadhaar)
 * @param {string} patientId - Patient ID or Aadhaar number
 * @returns {string} Keccak256 hash of the patient ID
 */
export const generatePatientIdHash = (patientId) => {
  return ethers.keccak256(ethers.toUtf8Bytes(patientId));
};

/**
 * Check contract owner
 * @returns {Object} Owner address or error
 */
export const getContractOwner = async () => {
  try {
    const { provider } = await initializeBlockchain();
    const contract = getContract(provider);
    const owner = await contract.owner();
    return {
      success: true,
      owner: owner
    };
  } catch (error) {
    console.error('Error getting contract owner:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Add or update patient record on blockchain
 * @param {string} patientId - Patient ID or Aadhaar number
 * @param {string} ipfsHash - IPFS hash of the stored data
 * @returns {Object} Transaction receipt
 */
export const addOrUpdateRecord = async (patientId, ipfsHash) => {
  try {
    console.log('addOrUpdateRecord called:', { patientId, ipfsHash });
    
    const { signer } = await initializeBlockchain();
    const contract = getContract(signer);
    
    const patientIdHash = generatePatientIdHash(patientId);
    console.log('Patient ID hash:', patientIdHash);
    console.log('Contract address:', CONTRACT_ADDRESS);
    console.log('Signer address:', await signer.getAddress());
    
    // Verify contract owner
    try {
      const owner = await contract.owner();
      console.log('Contract owner:', owner);
      const signerAddress = await signer.getAddress();
      if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        console.error('Signer is not the contract owner!');
        return {
          success: false,
          error: `Only contract owner can add records. Owner: ${owner}, Your address: ${signerAddress}`
        };
      }
      console.log('Signer is the contract owner');
    } catch (ownerError) {
      // Could not verify contract owner
    }
    
    console.log('Sending transaction to add/update record...');
    const tx = await contract.addOrUpdateRecord(patientIdHash, ipfsHash, {
      gasLimit: 500000 // Set explicit gas limit
    });
    
    console.log('Transaction sent, waiting for confirmation...', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    // Verify the record was stored
    try {
      const storedHash = await contract.getRecord.staticCall(patientIdHash);
      console.log('Verified record stored, IPFS hash:', storedHash);
      if (storedHash !== ipfsHash) {
        // Stored hash does not match
      }
    } catch (verifyError) {
      // Could not verify stored record
    }
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error adding/updating record:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      data: error.data
    });
    
    // Provide more helpful error messages
    let errorMessage = error.message;
    if (error.message.includes('Only owner')) {
      errorMessage = 'Only the contract owner can add records. Please check your account configuration.';
    } else if (error.message.includes('Invalid patient ID')) {
      errorMessage = 'Invalid patient ID hash';
    } else if (error.message.includes('Invalid IPFS')) {
      errorMessage = 'Invalid IPFS hash';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Get patient record from blockchain
 * @param {string} patientId - Patient ID or Aadhaar number
 * @returns {Object} Result containing IPFS hash or error
 */
export const getRecord = async (patientId) => {
  try {
    const { provider } = await initializeBlockchain();
    const contract = getContract(provider);
    
    const patientIdHash = generatePatientIdHash(patientId);
    console.log('Looking for record with hash:', patientIdHash);
    console.log('Contract address:', CONTRACT_ADDRESS);
    
    // Check if record exists - this function doesn't throw, it returns false
    let exists = false;
    try {
      exists = await contract.recordExists(patientIdHash);
      console.log('Record exists check result:', exists);
    } catch (checkError) {
      // If recordExists fails, assume record doesn't exist
      // recordExists check failed
      exists = false;
    }
    
    // If record doesn't exist, return early with friendly message
    if (!exists) {
      console.log('Record does not exist for patient:', patientId);
      return {
        success: false,
        error: 'No record found for this Patient ID/Aadhaar number. Please contact admin to add your records.'
      };
    }
    
    // Try to get the record - this will throw if record doesn't exist (due to require)
    try {
      const ipfsHash = await contract.getRecord(patientIdHash);
      console.log('Retrieved IPFS hash:', ipfsHash);
      
      // Check if hash is empty or invalid
      if (!ipfsHash || ipfsHash === '' || ipfsHash === '0x' || ipfsHash.trim() === '') {
        // IPFS hash is empty
        return {
          success: false,
          error: 'Record exists but IPFS hash is empty'
        };
      }
      
      return {
        success: true,
        ipfsHash: ipfsHash
      };
    } catch (getError) {
      // If getRecord fails, the record doesn't exist (contract's require throws)
      // This is expected when no data has been stored
      console.log('getRecord failed - record does not exist:', getError.message);
      return {
        success: false,
        error: 'No record found for this Patient ID/Aadhaar number. Please contact admin to add your records.'
      };
    }
  } catch (error) {
    console.error('Error getting record:', error);
    
    // Check if it's a contract connection issue
    if (error.message.includes('could not decode') || error.message.includes('BAD_DATA')) {
      return {
        success: false,
        error: 'Record does not exist for this Patient ID/Aadhaar number'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to retrieve record'
    };
  }
};

/**
 * Get full record history (all IPFS hashes) for a patient by scanning events
 * @param {string} patientId - Patient ID or Aadhaar number
 * @returns {Object} { success, history: Array<{ ipfsHash, timestamp, blockNumber, transactionHash }> }
 */
export const getRecordHistory = async (patientId) => {
  try {
    const { provider } = await initializeBlockchain();
    const contract = getContract(provider);

    const patientIdHash = generatePatientIdHash(patientId);

    // Fetch all RecordAdded events
    const addedFilter = contract.filters.RecordAdded();
    const addedEvents = await contract.queryFilter(addedFilter, 0, "latest");

    // Fetch all RecordUpdated events
    const updatedFilter = contract.filters.RecordUpdated();
    const updatedEvents = await contract.queryFilter(updatedFilter, 0, "latest");

    const allEvents = [...addedEvents, ...updatedEvents];

    const history = allEvents
      .filter((e) => e.args && e.args.patientIdHash && e.args.patientIdHash.toLowerCase() === patientIdHash.toLowerCase())
      .map((e) => ({
      ipfsHash: e.args.ipfsHash,
      timestamp: Number(e.args.timestamp) * 1000,
      blockNumber: e.blockNumber,
      transactionHash: e.transactionHash,
    }))
    // sort by timestamp ascending (oldest first)
    .sort((a, b) => a.timestamp - b.timestamp);

    return { success: true, history };
  } catch (error) {
    console.error('Error getting record history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if MetaMask is installed
 * @returns {boolean} True if MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Get current account address
 * @returns {Promise<string>} Current account address
 */
export const getCurrentAccount = async () => {
  try {
    const { signer } = await initializeBlockchain();
    return await signer.getAddress();
  } catch (error) {
    console.error('Error getting current account:', error);
    throw error;
  }
};
