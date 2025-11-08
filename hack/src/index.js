import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { getIPFSMode, isRealIPFS } from './utils/ipfs';

// Log IPFS configuration status
const ipfsMode = getIPFSMode();
const isReal = isRealIPFS();

console.log('%cIPFS Configuration', 'color: #4CAF50; font-weight: bold; font-size: 14px');
console.log(`Mode: ${ipfsMode.toUpperCase()}`);
if (isReal) {
  console.log('%cReal IPFS is enabled', 'color: #4CAF50');
  if (ipfsMode === 'pinata') {
    console.log('Provider: Pinata (Production-ready)');
  } else if (ipfsMode === 'local') {
    console.log('Provider: Local IPFS Node');
    console.log('%cMake sure IPFS daemon is running!', 'color: #FF9800');
  }
} else {
  console.log('%cMock IPFS storage (development mode)', 'color: #FF9800');
  console.log('Data is stored in localStorage only. For production, configure Pinata or Local IPFS.');
  console.log('See README_IPFS_SETUP.md for setup instructions.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
