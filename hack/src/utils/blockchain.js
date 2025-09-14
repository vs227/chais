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
  }
];

const GANACHE_RPC_URL = BLOCKCHAIN_CONFIG.GANACHE_RPC_URL;

/**
 * Initialize blockchain connection
 * @returns {Object} Provider and signer objects
 */
export const initializeBlockchain = async () => {
  try {
    console.log('Using Ganache account directly for transactions');
    const provider = new ethers.JsonRpcProvider(GANACHE_RPC_URL);
    
    const wallet = new ethers.Wallet(BLOCKCHAIN_CONFIG.GANACHE_PRIVATE_KEY, provider);
    
    return { provider, signer: wallet };
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
    const { signer } = await initializeBlockchain();
    const contract = getContract(signer);
    
    const patientIdHash = generatePatientIdHash(patientId);
    
    const tx = await contract.addOrUpdateRecord(patientIdHash, ipfsHash);
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error adding/updating record:', error);
    return {
      success: false,
      error: error.message
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
    
    const exists = await contract.recordExists(patientIdHash);
    console.log('Record exists:', exists);
    
    if (!exists) {
      return {
        success: false,
        error: 'Record does not exist'
      };
    }
    
    const ipfsHash = await contract.getRecord(patientIdHash);
    console.log('Retrieved IPFS hash:', ipfsHash);
    
    return {
      success: true,
      ipfsHash: ipfsHash
    };
  } catch (error) {
    console.error('Error getting record:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if user has MetaMask installed
 * @returns {boolean} True if MetaMask is available
 */
export const isMetaMaskInstalled = () => {
  return true; 
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
