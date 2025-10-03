#!/usr/bin/env node
/**
 * Test Script for External API Integration
 *
 * Tests all external data sources to ensure they're working correctly
 * Run with: node scripts/test-external-apis.js
 */

const axios = require('axios');

const PROXY_URL = process.env.PROXY_URL || 'http://localhost:3001';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`)
};

const endpoints = [
  // Health check
  {
    name: 'Health Check',
    method: 'GET',
    url: '/health',
    critical: true
  },

  // Carmen de Areco sources
  {
    name: 'Carmen de Areco Official',
    method: 'GET',
    url: '/api/carmen/official',
    category: 'Municipal'
  },
  {
    name: 'Carmen de Areco Transparency',
    method: 'GET',
    url: '/api/carmen/transparency',
    category: 'Municipal'
  },
  {
    name: 'Carmen de Areco Boletín',
    method: 'GET',
    url: '/api/carmen/boletin',
    category: 'Municipal'
  },
  {
    name: 'Carmen de Areco Licitaciones',
    method: 'GET',
    url: '/api/carmen/licitaciones',
    category: 'Municipal'
  },
  {
    name: 'Carmen de Areco Declaraciones',
    method: 'GET',
    url: '/api/carmen/declaraciones',
    category: 'Municipal'
  },
  {
    name: 'HCD Blog',
    method: 'GET',
    url: '/api/hcd/blog',
    category: 'Municipal'
  },

  // National level
  {
    name: 'Datos Argentina',
    method: 'GET',
    url: '/api/national/datos',
    category: 'National'
  },
  {
    name: 'Georef API',
    method: 'GET',
    url: '/api/national/georef',
    category: 'National'
  },
  {
    name: 'AAIP Transparency',
    method: 'GET',
    url: '/api/national/aaip',
    category: 'National'
  },
  {
    name: 'Series de Tiempo',
    method: 'POST',
    url: '/api/national/series-tiempo',
    category: 'National',
    data: {
      ids: '168.1_T_CAMBIOR_D_0_0_26',
      start_date: '2024-01-01',
      limit: 100
    }
  },
  {
    name: 'Obras Públicas',
    method: 'POST',
    url: '/api/national/obras-publicas',
    category: 'National',
    data: {
      municipality: 'Carmen de Areco',
      year: 2024,
      filters: {
        province: 'Buenos Aires',
        status: 'all'
      }
    }
  },
  {
    name: 'AFIP',
    method: 'POST',
    url: '/api/national/afip',
    category: 'National',
    data: {
      cuit: '30-99914050-5'
    }
  },
  {
    name: 'Contrataciones Abiertas',
    method: 'POST',
    url: '/api/national/contrataciones',
    category: 'National',
    data: {
      query: 'Carmen de Areco'
    }
  },
  {
    name: 'Boletín Oficial Nacional',
    method: 'POST',
    url: '/api/national/boletin',
    category: 'National',
    data: {
      query: 'Carmen de Areco'
    }
  },

  // Provincial level
  {
    name: 'Buenos Aires Open Data',
    method: 'GET',
    url: '/api/provincial/gba',
    category: 'Provincial'
  },
  {
    name: 'Buenos Aires Fiscal',
    method: 'GET',
    url: '/api/provincial/fiscal',
    category: 'Provincial'
  },
  {
    name: 'RAFAM (CRUCIAL)',
    method: 'POST',
    url: '/api/external/rafam',
    category: 'Provincial',
    critical: true,
    data: {
      municipalityCode: '270',
      url: 'https://www.rafam.ec.gba.gov.ar/'
    }
  },
  {
    name: 'Provincial Boletín',
    method: 'POST',
    url: '/api/provincial/boletin',
    category: 'Provincial',
    data: {
      query: 'Carmen de Areco'
    }
  },
  {
    name: 'Expedientes',
    method: 'POST',
    url: '/api/provincial/expedientes',
    category: 'Provincial',
    data: {
      query: 'Carmen de Areco'
    }
  }
];

async function testEndpoint(endpoint) {
  const url = `${PROXY_URL}${endpoint.url}`;
  const startTime = Date.now();

  try {
    const config = {
      method: endpoint.method,
      url: url,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (endpoint.data) {
      config.data = endpoint.data;
    }

    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    if (response.status === 200) {
      const cached = response.data.cached ? '(cached)' : '';
      log.success(`${endpoint.name} - ${responseTime}ms ${cached}`);
      return { success: true, responseTime, cached: response.data.cached };
    } else {
      log.warning(`${endpoint.name} - Status ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error.code === 'ECONNREFUSED') {
      log.error(`${endpoint.name} - Proxy server not running`);
      return { success: false, error: 'ECONNREFUSED' };
    } else if (error.response) {
      log.error(`${endpoint.name} - HTTP ${error.response.status}: ${error.response.statusText}`);
      return { success: false, status: error.response.status };
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      log.warning(`${endpoint.name} - Timeout after ${responseTime}ms`);
      return { success: false, error: 'TIMEOUT' };
    } else {
      log.error(`${endpoint.name} - ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

async function runTests() {
  console.log('\n🧪 Testing External API Integration\n');
  console.log(`Target: ${PROXY_URL}\n`);

  // Group endpoints by category
  const categories = {
    'Critical': endpoints.filter(e => e.critical),
    'Municipal': endpoints.filter(e => e.category === 'Municipal'),
    'National': endpoints.filter(e => e.category === 'National'),
    'Provincial': endpoints.filter(e => e.category === 'Provincial')
  };

  const results = {
    total: 0,
    success: 0,
    failed: 0,
    timeout: 0,
    cached: 0,
    totalTime: 0
  };

  // Test critical endpoints first
  if (categories.Critical.length > 0) {
    console.log(`\n📍 Critical Endpoints\n`);
    for (const endpoint of categories.Critical) {
      const result = await testEndpoint(endpoint);
      results.total++;

      if (!result.success && endpoint.critical) {
        log.error('CRITICAL ENDPOINT FAILED - Stopping tests');
        console.log('\n❌ Critical failure detected. Please fix and retry.\n');
        process.exit(1);
      }

      if (result.success) {
        results.success++;
        results.totalTime += result.responseTime;
        if (result.cached) results.cached++;
      } else if (result.error === 'TIMEOUT') {
        results.timeout++;
      } else {
        results.failed++;
      }
    }
  }

  // Test other categories
  for (const [category, categoryEndpoints] of Object.entries(categories)) {
    if (category === 'Critical') continue;
    if (categoryEndpoints.length === 0) continue;

    console.log(`\n${category === 'Municipal' ? '📍' : category === 'National' ? '🇦🇷' : '🏛️'}  ${category} Level\n`);

    for (const endpoint of categoryEndpoints) {
      const result = await testEndpoint(endpoint);
      results.total++;

      if (result.success) {
        results.success++;
        results.totalTime += result.responseTime;
        if (result.cached) results.cached++;
      } else if (result.error === 'TIMEOUT') {
        results.timeout++;
      } else {
        results.failed++;
      }

      // Small delay between requests to avoid overwhelming the proxy
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary\n');
  console.log(`Total Endpoints: ${results.total}`);
  log.success(`Successful: ${results.success}`);
  log.error(`Failed: ${results.failed}`);
  log.warning(`Timeouts: ${results.timeout}`);
  log.info(`Cached Responses: ${results.cached}`);

  if (results.success > 0) {
    const avgTime = Math.round(results.totalTime / results.success);
    log.info(`Average Response Time: ${avgTime}ms`);
  }

  const successRate = Math.round((results.success / results.total) * 100);
  console.log(`\nSuccess Rate: ${successRate}%`);

  if (successRate >= 80) {
    log.success('All systems operational! 🎉');
  } else if (successRate >= 50) {
    log.warning('Some systems degraded - check failed endpoints');
  } else {
    log.error('Multiple systems failing - immediate attention required');
  }

  console.log('\n');

  // Exit with appropriate code
  process.exit(successRate >= 80 ? 0 : 1);
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };
