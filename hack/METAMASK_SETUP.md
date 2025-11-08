# 🦊 MetaMask Setup Guide

## ✅ Configuration Complete!

Your application has been updated to use **MetaMask only** (Ganache removed).

## 📋 What Changed

### Removed:
- ❌ Ganache RPC URL configuration
- ❌ Ganache private key
- ❌ Direct Ganache connection
- ❌ All Ganache-specific error messages

### Added:
- ✅ MetaMask provider connection
- ✅ MetaMask account request
- ✅ MetaMask-specific error messages
- ✅ Browser-based wallet integration

---

## 🚀 How to Use

### Step 1: Install MetaMask

1. Go to: **https://metamask.io/**
2. Click **"Download"**
3. Install the browser extension
4. Create a new wallet or import existing one

### Step 2: Connect MetaMask to Your Network

**If you deployed to a test network (like Sepolia, Goerli, etc.):**

1. Open MetaMask
2. Click network dropdown (top)
3. Select your test network OR add it manually:
   - **Network Name:** Your test network name
   - **RPC URL:** Network RPC URL
   - **Chain ID:** Network chain ID
   - **Currency Symbol:** ETH

**If you deployed to Ganache (local):**

1. Open MetaMask
2. Click network dropdown
3. Click **"Add Network"** or **"Add a network manually"**
4. Enter:
   - **Network Name:** `Ganache Local`
   - **RPC URL:** `http://127.0.0.1:7545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** `ETH`
5. Click **"Save"**

### Step 3: Import Account (if using Ganache)

If you're using Ganache and want to use the same account:

1. **In Ganache:**
   - Find your account
   - Click the **key icon** 🔑
   - Copy the **private key**

2. **In MetaMask:**
   - Click account icon (top right)
   - Click **"Import Account"**
   - Paste the private key
   - Click **"Import"**

### Step 4: Use the Application

1. **Start the app:**
   ```bash
   cd hack
   npm start
   ```

2. **When you use the app:**
   - MetaMask will automatically prompt you to connect
   - Click **"Connect"** in MetaMask popup
   - Select the account you want to use
   - Click **"Next"** → **"Connect"**

3. **For transactions:**
   - When you submit data, MetaMask will ask for confirmation
   - Review the transaction details
   - Click **"Confirm"** to send

---

## ⚠️ Important Notes

### Contract Address
Your contract is deployed at: **`0xdD9f6b6F7B0b15937197447a7407d7bF9C444913`**

**Make sure:**
- ✅ Contract is deployed on the network you're connected to in MetaMask
- ✅ You're using the correct network in MetaMask
- ✅ Your account has enough ETH for gas fees

### Network Requirements

**For Admin (adding records):**
- Must be the contract owner
- Must have ETH for gas fees
- Must be on the correct network

**For Users (retrieving records):**
- Just needs to be connected to MetaMask
- No gas fees for reading data
- Must be on the correct network

---

## 🔧 Troubleshooting

### Issue: "MetaMask not found"
**Solution:**
- Install MetaMask extension
- Refresh the page
- Make sure MetaMask is unlocked

### Issue: "Please connect your MetaMask wallet"
**Solution:**
- Click MetaMask extension icon
- Make sure you're logged in
- Try refreshing the page

### Issue: "Contract not found"
**Solution:**
- Check you're on the correct network in MetaMask
- Verify contract address is correct
- Make sure contract is deployed on that network

### Issue: "Only contract owner can add records"
**Solution:**
- Make sure you're using the account that deployed the contract
- Check contract owner in Remix or Etherscan
- Switch to the owner account in MetaMask

### Issue: "Transaction failed"
**Solution:**
- Check you have enough ETH for gas
- Check network is correct
- Try increasing gas limit in MetaMask

---

## 📝 Current Configuration

**Contract Address:** `0xdD9f6b6F7B0b15937197447a7407d7bF9C444913`

**Network:** Configured in MetaMask (user selects)

**Connection:** MetaMask Browser Provider

---

## ✅ Next Steps

1. **Install MetaMask** (if not already installed)
2. **Connect to your network** (testnet or Ganache)
3. **Import account** (if using Ganache)
4. **Start the app** and connect MetaMask when prompted
5. **Test the application!**

---

## 🎯 Summary

- ✅ Ganache removed
- ✅ MetaMask integration complete
- ✅ All configurations updated
- ✅ Error messages updated
- ✅ Ready to use!

**Just install MetaMask and connect!** 🚀

