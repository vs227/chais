// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PatientRecords
 * @dev Smart contract for storing IPFS hashes of patient health records
 * @notice Only stores hashes of patient IDs and IPFS hashes - no sensitive data on-chain
 */
contract PatientRecords {
    // Events for tracking operations
    event RecordAdded(bytes32 indexed patientIdHash, string ipfsHash, uint256 timestamp);
    event RecordUpdated(bytes32 indexed patientIdHash, string ipfsHash, uint256 timestamp);
    
    // Mapping to store IPFS hashes by patient ID hash
    mapping(bytes32 => string) private patientRecords;
    
    // Mapping to track if a record exists
    mapping(bytes32 => bool) private recordsExist;
    
    // Owner of the contract
    address public owner;
    
    // Modifier to restrict access to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Add or update a patient record
     * @param patientIdHash Hash of patient ID (Aadhaar) for privacy
     * @param ipfsHash IPFS hash where the actual data is stored
     */
    function addOrUpdateRecord(bytes32 patientIdHash, string memory ipfsHash) external onlyOwner {
        require(patientIdHash != bytes32(0), "Invalid patient ID hash");
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");
        
        bool isUpdate = recordsExist[patientIdHash];
        patientRecords[patientIdHash] = ipfsHash;
        recordsExist[patientIdHash] = true;
        
        if (isUpdate) {
            emit RecordUpdated(patientIdHash, ipfsHash, block.timestamp);
        } else {
            emit RecordAdded(patientIdHash, ipfsHash, block.timestamp);
        }
    }
    
    /**
     * @dev Get IPFS hash for a patient record
     * @param patientIdHash Hash of patient ID
     * @return IPFS hash if record exists
     */
    function getRecord(bytes32 patientIdHash) external view returns (string memory) {
        require(recordsExist[patientIdHash], "Record does not exist");
        return patientRecords[patientIdHash];
    }
    
    /**
     * @dev Check if a patient record exists
     * @param patientIdHash Hash of patient ID
     * @return True if record exists, false otherwise
     */
    function recordExists(bytes32 patientIdHash) external view returns (bool) {
        return recordsExist[patientIdHash];
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }
}

