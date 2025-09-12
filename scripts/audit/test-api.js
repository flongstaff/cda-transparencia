#!/usr/bin/env node

/**
 * Test Script for Carmen de Areco Transparency Portal
 * Verifies that all pages are working correctly with the API
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001/api';
const TEST_YEAR = 2024;

// Test cases
const testCases = [
  {
    name: 'Health Check',
    endpoint: '/health',
    expectedStatus: 200
  },
  {
    name: 'Available Years',
    endpoint: '/years',
    expectedStatus: 200
  },
  {
    name: 'Yearly Data',
    endpoint: `/years/${TEST_YEAR}`,
    expectedStatus: 200
  },
  {
    name: 'Budget Data',
    endpoint: `/budget/${TEST_YEAR}`,
    expectedStatus: 200
  },
  {
    name: 'Salary Data',
    endpoint: `/salary/${TEST_YEAR}`,
    expectedStatus: 200
  },
  {
    name: 'Documents',
    endpoint: '/documents',
    expectedStatus: 200
  },
  {
    name: 'Documents by Year',
    endpoint: `/documents?year=${TEST_YEAR}`,
    expectedStatus: 200
  },
  {
    name: 'Contracts Data',
    endpoint: `/contracts/${TEST_YEAR}`,
    expectedStatus: 200
  },
  {
    name: 'Debt Data',
    endpoint: `/debt/${TEST_YEAR}`,
    expectedStatus: 200
  }
];

async function runTests() {
  console.log('🚀 Starting Transparency Portal API Tests...\\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testCase of testCases) {
    try {
      const url = `${BASE_URL}${testCase.endpoint}`;
      console.log(`⏳ Testing ${testCase.name} (${url})...`);
      
      const response = await axios.get(url);
      
      if (response.status === testCase.expectedStatus) {
        console.log(`✅ ${testCase.name}: PASSED (Status ${response.status})`);
        passedTests++;
        
        // Log some basic info about the response
        if (response.data) {
          const dataKeys = Object.keys(response.data);
          console.log(`   📦 Response contains: ${dataKeys.length} fields`);
          
          // Show a sample of the data structure
          if (dataKeys.length > 0) {
            const sampleField = dataKeys[0];
            const sampleValue = response.data[sampleField];
            console.log(`   📋 Sample: ${sampleField} = ${typeof sampleValue === 'object' ? '[Object]' : sampleValue}`);
          }
        }
      } else {
        console.log(`❌ ${testCase.name}: FAILED (Expected ${testCase.expectedStatus}, got ${response.status})`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: FAILED (${error.message})`);
      failedTests++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Results Summary:');
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   🧪 Total:  ${testCases.length}`);
  
  if (failedTests === 0) {
    console.log('\\n🎉 All tests passed! The Transparency Portal API is working correctly.');
  } else {
    console.log(`\\n⚠️  ${failedTests} test(s) failed. Please check the API endpoints.`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('🚨 Test script failed:', error.message);
  process.exit(1);
});