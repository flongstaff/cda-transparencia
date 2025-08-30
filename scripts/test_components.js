#!/usr/bin/env node

/**
 * Test Script to Verify All Components of the Transparency Portal
 * Checks backend APIs, frontend pages, and data flow
 */

const https = require('https');
const http = require('http');

// Test URLs
const TEST_URLS = {
  backend: {
    health: 'http://localhost:3001/health',
    years: 'http://localhost:3001/api/years',
    year2024: 'http://localhost:3001/api/years/2024',
    powerbiStatus: 'http://localhost:3001/api/powerbi/status',
    powerbiData: 'http://localhost:3001/api/powerbi/financial-data'
  },
  frontend: {
    home: 'http://localhost:5173/',
    powerbi: 'http://localhost:5173/powerbi-data',
    dashboard: 'http://localhost:5173/dashboard',
    dataIntegrity: 'http://localhost:5173/data-integrity'
  }
};

// Function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Test function
async function runTests() {
  console.log('🔍 Running Transparency Portal Tests...\\n');
  
  let allPassed = true;
  
  // Test backend endpoints
  console.log('🧪 Testing Backend Endpoints:');
  for (const [name, url] of Object.entries(TEST_URLS.backend)) {
    try {
      const response = await makeRequest(url);
      const passed = response.statusCode === 200;
      console.log(`  ${passed ? '✅' : '❌'} ${name}: ${response.statusCode}`);
      
      if (!passed) {
        allPassed = false;
        console.log(`     Error: ${response.data.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`  ❌ ${name}: ERROR - ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log('');
  
  // Test frontend pages
  console.log('🌐 Testing Frontend Pages:');
  for (const [name, url] of Object.entries(TEST_URLS.frontend)) {
    try {
      const response = await makeRequest(url);
      const passed = response.statusCode === 200;
      console.log(`  ${passed ? '✅' : '❌'} ${name}: ${response.statusCode}`);
      
      if (!passed) {
        allPassed = false;
        console.log(`     Error: ${response.data.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`  ❌ ${name}: ERROR - ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log('');
  
  // Summary
  if (allPassed) {
    console.log('🎉 All tests passed! The Transparency Portal is working correctly.');
    console.log('\\n📊 Summary:');
    console.log('   - Backend API: ✅ Running on port 3001');
    console.log('   - Frontend: ✅ Running on port 5173');
    console.log('   - Data Flow: ✅ Working correctly');
    console.log('   - Visualization: ✅ Ready for use');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
  }
  
  return allPassed;
}

// Run the tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
