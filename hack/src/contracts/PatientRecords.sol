// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Optimized PatientRecords Contract
 * 
 * Optimizations:
 * 1. Removed redundant recordsExist mapping (check string length instead)
 * 2. Shorter error messages (saves gas)
 * 3. Packed storage layout (owner + recordsExist could be packed, but kept simple for clarity)
 * 4. More efficient existence check
 */
contract PatientRecords {
    event RecordAdded(bytes32 indexed patientIdHash, string ipfsHash, uint256 timestamp);
    event RecordUpdated(bytes32 indexed patientIdHash, string ipfsHash, uint256 timestamp);
    
    mapping(bytes32 => string) private patientRecords;
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Add or update patient record
     * Optimized: Removed redundant recordsExist mapping
     */
    function addOrUpdateRecord(bytes32 patientIdHash, string memory ipfsHash) external onlyOwner {
        require(patientIdHash != bytes32(0), "Invalid ID");
        require(bytes(ipfsHash).length > 0, "Invalid hash");
        
        // Check if record exists by checking current string length
        bool isUpdate = bytes(patientRecords[patientIdHash]).length > 0;
        
        // Store the record
        patientRecords[patientIdHash] = ipfsHash;
        
        // Emit appropriate event
        if (isUpdate) {
            emit RecordUpdated(patientIdHash, ipfsHash, block.timestamp);
        } else {
            emit RecordAdded(patientIdHash, ipfsHash, block.timestamp);
        }
    }
    
    /**
     * @dev Get IPFS hash for a patient record
     */
    function getRecord(bytes32 patientIdHash) external view returns (string memory) {
        string memory record = patientRecords[patientIdHash];
        require(bytes(record).length > 0, "Not found");
        return record;
    }
    
    /**
     * @dev Check if a patient record exists
     * Optimized: Direct check without separate mapping
     */
    function recordExists(bytes32 patientIdHash) external view returns (bool) {
        return bytes(patientRecords[patientIdHash]).length > 0;
    }
    
    /**
     * @dev Transfer contract ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }
}
