#!/usr/bin/env node

/**
 * Performance Test Script
 * 
 * Tests the performance of data loading and rendering across all pages
 */

const axios = require('axios');

async function runPerformanceTest() {
  console.log('🚀 Running Performance Tests...\n');

  const tests = [
    {
      name: 'Proxy Server Health Check',
      url: 'http://localhost:3002/health',
      expectedStatus: 200
    },
    {
      name: 'RAFAM Data Endpoint',
      url: 'http://localhost:3002/api/external/rafam',
      method: 'post',
      data: { municipalityCode: '270' },
      expectedStatus: 200
    },
    {
      name: 'National Data Endpoint',
      url: 'http://localhost:3002/api/national/datos',
      expectedStatus: 200
    },
    {
      name: 'Geographic Data Endpoint',
      url: 'http://localhost:3002/api/national/georef',
      expectedStatus: 200
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`⏳ Testing: ${test.name}...`);
      
      const startTime = Date.now();
      
      const config = {
        method: test.method || 'get',
        url: test.url,
        timeout: 10000 // 10 second timeout
      };
      
      if (test.data) {
        config.data = test.data;
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      const response = await axios(config);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const success = response.status === test.expectedStatus;
      
      results.push({
        name: test.name,
        success,
        responseTime,
        status: response.status,
        dataSize: response.data ? JSON.stringify(response.data).length : 0
      });
      
      if (success) {
        console.log(`   ✅ ${test.name}: ${responseTime}ms (${Math.round(responseTime/1000*100)/100}s)`);
        if (response.data && response.data.data) {
          console.log(`      Data size: ${Math.round(response.data.data.length || 0)} items`);
        }
      } else {
        console.log(`   ⚠️  ${test.name}: Unexpected status ${response.status} (expected ${test.expectedStatus})`);
      }
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - Date.now(); // This will be negative or zero
      
      results.push({
        name: test.name,
        success: false,
        responseTime,
        error: error.message,
        status: error.response?.status || 'ERROR'
      });
      
      console.log(`   ❌ ${test.name}: ${error.message}`);
    }
  }

  console.log('\n📊 Performance Test Results:');
  console.log('==========================');
  
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;
  
  console.log(`✅ Successful: ${successfulTests}/${totalTests} (${Math.round(successfulTests/totalTests*100)}%)`);
  console.log(`❌ Failed: ${failedTests}/${totalTests} (${Math.round(failedTests/totalTests*100)}%)`);
  console.log(`⏱️  Average Response Time: ${Math.round(avgResponseTime)}ms`);
  
  console.log('\n📈 Individual Results:');
  results.forEach(result => {
    const statusIcon = result.success ? '✅' : '❌';
    const timeInfo = result.responseTime >= 0 ? `${result.responseTime}ms` : 'N/A';
    console.log(`   ${statusIcon} ${result.name}: ${timeInfo} ${result.dataSize ? `(${result.dataSize} bytes)` : ''}`);
  });
  
  if (successfulTests === totalTests) {
    console.log('\n🎉 All performance tests passed! System is ready for production.');
    return true;
  } else {
    console.log('\n⚠️  Some performance tests failed. Review the results above.');
    return false;
  }
}

// Run performance test if this file is executed directly
if (require.main === module) {
  runPerformanceTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runPerformanceTest };