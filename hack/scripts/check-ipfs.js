/**
 * IPFS Configuration Checker
 * 
 * This script checks your IPFS configuration and verifies connectivity
 * Run with: node scripts/check-ipfs.js
 */

const fs = require('fs');
const path = require('path');
// Note: ipfs-http-client is ESM-only, so we'll test connection differently
let ipfsClient = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  log('\n=== Checking Environment Configuration ===', 'blue');
  
  if (!fs.existsSync(envPath)) {
    log('⚠️  .env file not found', 'yellow');
    if (fs.existsSync(envExamplePath)) {
      log('   Copy .env.example to .env and configure it', 'yellow');
    } else {
      log('   Create a .env file with your IPFS configuration', 'yellow');
    }
    return null;
  }
  
  log('✅ .env file found', 'green');
  
  // Read and parse .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return envVars;
}

async function checkPinata(envVars) {
  log('\n=== Checking Pinata Configuration ===', 'blue');
  
  const pinataJWT = envVars.REACT_APP_PINATA_JWT;
  
  if (!pinataJWT || pinataJWT === 'your_pinata_jwt_token_here') {
    log('ℹ️  Pinata not configured', 'yellow');
    return false;
  }
  
  log('✅ Pinata JWT token found', 'green');
  
  // Test Pinata API connection
  try {
    // Use https module for better Node.js compatibility
    const https = require('https');
    const url = require('url');
    
    return new Promise((resolve) => {
      const options = url.parse('https://api.pinata.cloud/data/testAuthentication');
      options.method = 'GET';
      options.headers = {
        'Authorization': `Bearer ${pinataJWT}`
      };
      
      const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          log('✅ Pinata API connection successful', 'green');
          resolve(true);
        } else {
          log(`❌ Pinata API connection failed: ${res.statusCode} ${res.statusMessage}`, 'red');
          log('   Please check your JWT token', 'yellow');
          resolve(false);
        }
        res.on('data', () => {}); // Consume response
        res.on('end', () => {});
      });
      
      req.on('error', (error) => {
        log(`❌ Pinata API connection error: ${error.message}`, 'red');
        resolve(false);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        log('❌ Pinata API connection timeout', 'red');
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    log(`❌ Error testing Pinata: ${error.message}`, 'red');
    return false;
  }
}

async function checkLocalIPFS(envVars) {
  log('\n=== Checking Local IPFS Node ===', 'blue');
  
  const useLocalIPFS = envVars.REACT_APP_USE_LOCAL_IPFS === 'true';
  
  if (!useLocalIPFS) {
    log('ℹ️  Local IPFS not enabled', 'yellow');
    return false;
  }
  
  log('✅ Local IPFS is enabled in configuration', 'green');
  
  const host = envVars.REACT_APP_LOCAL_IPFS_HOST || 'localhost';
  const port = envVars.REACT_APP_LOCAL_IPFS_PORT || 5001;
  const protocol = envVars.REACT_APP_LOCAL_IPFS_PROTOCOL || 'http';
  
  log(`   Configuration: ${protocol}://${host}:${port}`, 'blue');
  
  try {
    // Test connection by making HTTP request to IPFS API
    const https = require('https');
    const http = require('http');
    const url = require('url');
    
    const apiUrl = `${protocol}://${host}:${port}/api/v0/version`;
    const parsedUrl = url.parse(apiUrl);
    const client = protocol === 'https' ? https : http;
    
    return new Promise((resolve) => {
      const req = client.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: 'POST',
        timeout: 5000
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const version = JSON.parse(data);
              log(`✅ Local IPFS node is running (version: ${version.Version})`, 'green');
              resolve(true);
            } catch (e) {
              log(`✅ Local IPFS node is running (response received)`, 'green');
              resolve(true);
            }
          } else {
            log(`❌ Local IPFS node responded with status: ${res.statusCode}`, 'red');
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        log(`❌ Local IPFS node not accessible: ${error.message}`, 'red');
        log('   Make sure IPFS daemon is running: ipfs daemon', 'yellow');
        resolve(false);
      });
      
      req.on('timeout', () => {
        req.destroy();
        log('❌ Local IPFS node connection timeout', 'red');
        log('   Make sure IPFS daemon is running: ipfs daemon', 'yellow');
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    log(`❌ Error checking Local IPFS: ${error.message}`, 'red');
    return false;
  }
}

function determineIPFSMode(envVars, pinataOk, localIPFSOk) {
  log('\n=== IPFS Mode Detection ===', 'blue');
  
  const pinataJWT = envVars?.REACT_APP_PINATA_JWT;
  const useLocalIPFS = envVars?.REACT_APP_USE_LOCAL_IPFS === 'true';
  
  if (pinataJWT && pinataOk) {
    log('✅ Mode: Pinata (Production)', 'green');
    return 'pinata';
  } else if (useLocalIPFS && localIPFSOk) {
    log('✅ Mode: Local IPFS Node', 'green');
    return 'local';
  } else {
    log('⚠️  Mode: Mock Storage (Development)', 'yellow');
    log('   No IPFS provider is configured or accessible', 'yellow');
    return 'mock';
  }
}

function printRecommendations(envVars, pinataOk, localIPFSOk, mode) {
  log('\n=== Recommendations ===', 'blue');
  
  if (mode === 'mock') {
    log('📝 To use real IPFS:', 'yellow');
    log('   1. Set up Pinata: https://app.pinata.cloud/', 'yellow');
    log('      Add REACT_APP_PINATA_JWT to your .env file', 'yellow');
    log('   2. Or set up Local IPFS:', 'yellow');
    log('      Install IPFS and run: ipfs daemon', 'yellow');
    log('      Add REACT_APP_USE_LOCAL_IPFS=true to your .env file', 'yellow');
  } else if (mode === 'local') {
    log('💡 For production, consider using Pinata for better reliability', 'yellow');
  }
  
  // Check gateway configuration
  const gateways = [
    envVars?.REACT_APP_IPFS_GATEWAY_1,
    envVars?.REACT_APP_IPFS_GATEWAY_2,
    envVars?.REACT_APP_IPFS_GATEWAY_3,
  ].filter(Boolean);
  
  if (gateways.length === 0) {
    log('💡 Consider configuring multiple IPFS gateways for redundancy', 'yellow');
  }
}

async function main() {
  log('🔍 IPFS Configuration Checker', 'blue');
  log('='.repeat(40), 'blue');
  
  const envVars = checkEnvFile();
  
  let pinataOk = false;
  let localIPFSOk = false;
  
  if (envVars) {
    pinataOk = await checkPinata(envVars);
    localIPFSOk = await checkLocalIPFS(envVars);
  }
  
  const mode = determineIPFSMode(envVars, pinataOk, localIPFSOk);
  
  if (envVars) {
    printRecommendations(envVars, pinataOk, localIPFSOk, mode);
  }
  
  log('\n' + '='.repeat(40), 'blue');
  log('✅ Check complete!', 'green');
  
  process.exit(0);
}

// Run the check
main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});

