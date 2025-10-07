#!/usr/bin/env node
/**
 * Test Frontend-Backend Connection
 * Verifies that the frontend can connect to the backend proxy server
 * and fetch external data sources successfully
 */

const API_BASE_URL = 'http://localhost:3001';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test endpoints
const endpoints = [
  {
    name: 'Health Check',
    url: `${API_BASE_URL}/health`,
    method: 'GET',
    category: 'utility'
  },
  {
    name: 'Carmen de Areco Official',
    url: `${API_BASE_URL}/api/carmen/official`,
    method: 'GET',
    category: 'municipal'
  },
  {
    name: 'RAFAM Data',
    url: `${API_BASE_URL}/api/external/rafam`,
    method: 'POST',
    body: { municipalityCode: '270', url: 'https://www.rafam.ec.gba.gov.ar/' },
    category: 'provincial'
  },
  {
    name: 'Buenos Aires GBA Data',
    url: `${API_BASE_URL}/api/provincial/gba`,
    method: 'GET',
    category: 'provincial'
  },
  {
    name: 'Datos Argentina',
    url: `${API_BASE_URL}/api/national/datos`,
    method: 'GET',
    category: 'national'
  },
  {
    name: 'Georef API',
    url: `${API_BASE_URL}/api/national/georef`,
    method: 'GET',
    category: 'national'
  }
];

// Test a single endpoint
async function testEndpoint(endpoint) {
  const startTime = Date.now();

  try {
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(endpoint.url, options);
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      status: response.status,
      responseTime,
      dataKeys: Object.keys(data),
      hasData: !!data.data || !!data.success,
      cached: data.cached || false
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
}

// Run all tests
async function runTests() {
  log('\n🧪 Testing Frontend-Backend Connection\n', 'bright');
  log('═'.repeat(60), 'blue');

  const results = {
    total: endpoints.length,
    passed: 0,
    failed: 0,
    byCategory: {}
  };

  for (const endpoint of endpoints) {
    logInfo(`Testing: ${endpoint.name} (${endpoint.category})`);

    const result = await testEndpoint(endpoint);

    if (result.success) {
      logSuccess(`${endpoint.name} - ${result.responseTime}ms`);
      logInfo(`  Status: ${result.status}, Data: ${result.hasData ? 'Yes' : 'No'}, Cached: ${result.cached}`);
      results.passed++;
    } else {
      logError(`${endpoint.name} - Failed`);
      logError(`  Error: ${result.error}`);
      results.failed++;
    }

    // Track by category
    if (!results.byCategory[endpoint.category]) {
      results.byCategory[endpoint.category] = { passed: 0, failed: 0 };
    }
    if (result.success) {
      results.byCategory[endpoint.category].passed++;
    } else {
      results.byCategory[endpoint.category].failed++;
    }

    log(''); // Empty line for readability
  }

  // Print summary
  log('═'.repeat(60), 'blue');
  log('\n📊 Test Summary\n', 'bright');

  log(`Total Tests: ${results.total}`, 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

  log('\n📂 By Category:\n', 'bright');
  Object.keys(results.byCategory).forEach(category => {
    const cat = results.byCategory[category];
    const total = cat.passed + cat.failed;
    const percentage = ((cat.passed / total) * 100).toFixed(1);
    log(`  ${category}: ${cat.passed}/${total} (${percentage}%)`, cat.failed > 0 ? 'yellow' : 'green');
  });

  log('\n═'.repeat(60), 'blue');

  // Exit with appropriate code
  if (results.failed > 0) {
    logWarning(`\n⚠️  ${results.failed} test(s) failed. Check configuration and ensure proxy server is running.\n`);
    process.exit(1);
  } else {
    logSuccess('\n🎉 All tests passed! Frontend-Backend connection is working correctly.\n');
    process.exit(0);
  }
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { testEndpoint, runTests };
