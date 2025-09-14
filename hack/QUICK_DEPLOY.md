# Quick Deploy Guide

## Your Ganache Details:
- **Private Key**: `0x5d181b7119a47364f94023b502912250c723841191c8a6663ea003fbc6cb1859`
- **Account**: `0x7BdCc0BFa641152Df320E77Ea558753aA44d4804`

## Deploy Contract (2 minutes):

1. **Go to Remix**: https://remix.ethereum.org/
2. **Create file**: `PatientRecords.sol`
3. **Copy code** from `src/contracts/PatientRecords.sol`
4. **Compile** (Solidity 0.8.0+)
5. **Deploy**:
   - Environment: "Injected Provider - MetaMask"
   - Account: `0x7BdCc0BFa641152Df320E77Ea558753aA44d4804`
   - Deploy
6. **Copy contract address** and update `src/config/blockchain.js`

## Start App:
```bash
npm install
npm start
```

## Test:
- Admin: Add patient data
- User: Retrieve with Patient ID

Done! 🚀

