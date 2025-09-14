# Blockchain & IPFS Integration Setup Guide

This guide will help you set up the blockchain and IPFS integration for the patient health records system.

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MetaMask** browser extension
3. **Ganache** (for local blockchain testing)
4. **IPFS Node** (optional - can use public IPFS)

## Installation

1. Install dependencies:
```bash
cd hack
npm install
```

2. Install Ganache:
   - Download from: https://trufflesuite.com/ganache/
   - Or install via npm: `npm install -g ganache-cli`

## Setup Instructions

### 1. Smart Contract Deployment

1. **Deploy the Smart Contract:**
   - Open Ganache and create a new workspace
   - Note the RPC URL (usually `http://127.0.0.1:7545`)
   - Copy the contract ABI from `src/contracts/PatientRecords.sol`
   - Deploy using Remix IDE or Truffle:
     - Go to https://remix.ethereum.org/
     - Create new file `PatientRecords.sol`
     - Copy the contract code from `src/contracts/PatientRecords.sol`
     - Compile and deploy to Ganache network
     - Copy the deployed contract address

2. **Update Contract Address:**
   - Open `src/utils/blockchain.js`
   - Replace `CONTRACT_ADDRESS` with your deployed contract address
   - Update `GANACHE_RPC_URL` if different from default

### 2. IPFS Setup (Optional)

**Option A: Use Public IPFS (Default)**
- No additional setup required
- Uses public IPFS gateways

**Option B: Use Infura IPFS (Recommended for production)**
1. Create account at https://infura.io/
2. Create new IPFS project
3. Get Project ID and Secret
4. Create `.env` file in project root:
```env
REACT_APP_INFURA_PROJECT_ID=your_project_id
REACT_APP_INFURA_PROJECT_SECRET=your_project_secret
```

**Option C: Run Local IPFS Node**
1. Install IPFS: https://ipfs.io/docs/install/
2. Initialize: `ipfs init`
3. Start daemon: `ipfs daemon`
4. Update `src/utils/ipfs.js` to use local node:
```javascript
ipfsClient = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http'
});
```

### 3. MetaMask Configuration

1. **Install MetaMask** browser extension
2. **Connect to Ganache:**
   - Open MetaMask
   - Click network dropdown
   - Select "Custom RPC"
   - Enter:
     - Network Name: "Ganache Local"
     - RPC URL: `http://127.0.0.1:7545`
     - Chain ID: `1337`
     - Currency Symbol: `ETH`
3. **Import Account:**
   - Copy private key from Ganache
   - Import account in MetaMask
   - Ensure account has enough ETH for gas fees

### 4. Running the Application

1. **Start Ganache** (if not already running)
2. **Start the React app:**
```bash
npm start
```
3. **Open browser** to `http://localhost:3000`
4. **Connect MetaMask** when prompted

## Usage

### Admin Panel (Adding Patient Data)

1. Navigate to Admin Dashboard
2. Fill in patient information:
   - Name, Aadhaar, Age, Gender (required)
   - Disease, Blood Pressure, Heart Disease (optional)
   - Upload medical reports (PDF, JPG, PNG)
3. Click "Submit"
4. Confirm MetaMask transaction
5. Wait for confirmation

### User Panel (Retrieving Patient Data)

1. Navigate to User Dashboard
2. Enter Patient ID or Aadhaar number
3. Click "Retrieve Data"
4. Confirm MetaMask transaction
5. View patient information and medical reports

## Data Flow

1. **Admin submits form** → Data + files uploaded to IPFS → IPFS hash stored on blockchain
2. **User enters Patient ID** → Blockchain queried for IPFS hash → Data retrieved from IPFS → Displayed to user

## Security Features

- **Privacy**: Only hashes of Patient IDs stored on blockchain, no sensitive data
- **Immutable**: Data cannot be modified once stored
- **Decentralized**: Data stored on IPFS, accessible globally
- **Transparent**: All transactions visible on blockchain

## Troubleshooting

### Common Issues

1. **"MetaMask not detected"**
   - Ensure MetaMask is installed and unlocked
   - Refresh the page

2. **"Transaction failed"**
   - Check if you have enough ETH for gas fees
   - Ensure you're connected to the correct network

3. **"Record does not exist"**
   - Verify the Patient ID/Aadhaar number is correct
   - Check if the record was successfully added

4. **"IPFS upload failed"**
   - Check internet connection
   - Try using a different IPFS gateway
   - Verify file size (max 10MB per file)

5. **"Contract not found"**
   - Verify contract address is correct
   - Ensure contract is deployed to the current network
   - Check if Ganache is running

### Network Issues

- **Wrong Network**: Ensure MetaMask is connected to Ganache (Chain ID: 1337)
- **RPC Error**: Check if Ganache is running on the correct port
- **Gas Issues**: Increase gas limit in MetaMask if transactions fail

## File Structure

```
src/
├── contracts/
│   └── PatientRecords.sol          # Smart contract
├── utils/
│   ├── blockchain.js               # Blockchain utilities
│   └── ipfs.js                     # IPFS utilities
├── admindash/adminmain/
│   ├── adminmain.jsx              # Admin form component
│   └── adminmain.css              # Admin styles
└── userdash/usermain/
    ├── usermain.jsx               # User retrieval component
    └── usermain.css               # User styles
```

## Development Notes

- **Gas Optimization**: Smart contract uses minimal gas for storage
- **Error Handling**: Comprehensive error handling for all operations
- **File Validation**: Only PDF, JPG, PNG files allowed (max 10MB)
- **Responsive Design**: Works on desktop and mobile devices

## Production Deployment

For production deployment:

1. **Deploy to Mainnet/Testnet**: Use Infura/Alchemy for RPC
2. **Use IPFS Pin Service**: Pin important data to prevent garbage collection
3. **Add Access Control**: Implement proper authentication
4. **Monitor Gas Costs**: Optimize for lower transaction costs
5. **Backup Strategy**: Regular backups of critical data

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all setup steps are completed
3. Check browser console for error messages
4. Ensure all dependencies are installed correctly

