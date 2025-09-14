// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract PatientRecordsSimple {
    event RecordAdded(bytes32 indexed patientIdHash, string ipfsHash, uint256 timestamp);
    
    mapping(bytes32 => string) private patientRecords;
    
    mapping(bytes32 => bool) private recordsExist;
    
    /**
     * @dev Add or update a patient record (anyone can call this)
     * @param patientIdHash Hash of patient ID (Aadhaar) for privacy
     * @param ipfsHash IPFS hash where the actual data is stored
     */
    function addOrUpdateRecord(bytes32 patientIdHash, string memory ipfsHash) external {
        require(patientIdHash != bytes32(0), "Invalid patient ID hash");
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");
        
        patientRecords[patientIdHash] = ipfsHash;
        recordsExist[patientIdHash] = true;
        
        emit RecordAdded(patientIdHash, ipfsHash, block.timestamp);
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
}
