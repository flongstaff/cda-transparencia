#!/usr/bin/env node

/**
 * Comprehensive API Testing Script
 * Tests all endpoints in the Carmen de Areco Transparency Portal
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';

// All API endpoints based on the routes structure
const ENDPOINTS = {
  // Health and Core Endpoints
  'Health Check': '/api/health',
  
  // Comprehensive Transparency System Endpoints
  'Transparency Dashboard': '/api/transparency/dashboard',
  'Available Years': '/api/transparency/available-years',
  'Financial Overview 2024': '/api/transparency/financial/2024',
  'Budget Breakdown 2024': '/api/transparency/budget/2024',
  'Municipal Debt 2024': '/api/transparency/debt/2024',
  'Investments 2024': '/api/transparency/investments/2024',
  
  // Document Endpoints
  'All Documents': '/api/transparency/documents',
  'Document Search': '/api/transparency/search?q=gastos',
  
  // Static Data Endpoints
  'Static Dashboard': '/api/data/dashboard',
  'Budget Data': '/api/data/financial/budget/2024',
  'Salary Data': '/api/data/financial/salaries/2024',
  'Debt Data': '/api/data/financial/debt/2024',
  'Anomaly Data': '/api/data/analysis/anomalies/2024',
  'Audit Results': '/api/data/analysis/audit-results',
  'Inventory Summary': '/api/data/analysis/inventory',
  'Comparison Report': '/api/data/analysis/comparison',
  'Carmen Export': '/api/data/documents/carmen-export',
  'Markdown Index': '/api/data/documents/markdown-index',
  'Web Sources': '/api/data/governance/web-sources',
  'Audit Cycle': '/api/data/governance/audit-cycle',
  
  // Cache Management
  'Cache Stats': '/api/data/cache/stats',
  
  // GitHub Data Access
  'GitHub Data': '/api/transparency/github/clarius/normas'
};

class APITester {
  constructor() {
    this.results = {
      working: [],
      broken: [],
      noData: [],
      errors: []
    };
  }

  async testEndpoint(name, endpoint) {
    console.log(`\n🔍 Testing: ${name}`);
    console.log(`📡 Endpoint: ${endpoint}`);
    
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 10000,
        validateStatus: (status) => status < 500 // Accept 4xx as valid responses
      });
      
      const status = response.status;
      const data = response.data;
      const hasData = data && (
        (Array.isArray(data) && data.length > 0) ||
        (typeof data === 'object' && Object.keys(data).length > 0)
      );
      
      console.log(`✅ Status: ${status}`);
      console.log(`📊 Has Data: ${hasData ? 'Yes' : 'No'}`);
      
      if (typeof data === 'object') {
        console.log(`🔢 Data Keys: ${Object.keys(data).join(', ')}`);
        if (Array.isArray(data)) {
          console.log(`📝 Array Length: ${data.length}`);
        }
      }
      
      const result = {
        name,
        endpoint,
        status,
        hasData,
        dataType: Array.isArray(data) ? 'array' : typeof data,
        dataSize: Array.isArray(data) ? data.length : Object.keys(data || {}).length,
        sample: JSON.stringify(data).substring(0, 200) + '...'
      };
      
      if (status === 200) {
        if (hasData) {
          this.results.working.push(result);
        } else {
          this.results.noData.push(result);
        }
      } else {
        this.results.broken.push(result);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      this.results.errors.push({
        name,
        endpoint,
        error: error.message,
        code: error.code
      });
    }
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive API testing...\n');
    console.log('=' .repeat(60));
    
    for (const [name, endpoint] of Object.entries(ENDPOINTS)) {
      await this.testEndpoint(name, endpoint);
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between requests
    }
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE API TEST REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n✅ WORKING ENDPOINTS (${this.results.working.length}):`);
    this.results.working.forEach(result => {
      console.log(`  ✓ ${result.name}: ${result.endpoint}`);
      console.log(`    Status: ${result.status}, Data: ${result.hasData ? 'Yes' : 'No'}, Size: ${result.dataSize}`);
    });
    
    console.log(`\n⚠️  ENDPOINTS WITH NO DATA (${this.results.noData.length}):`);
    this.results.noData.forEach(result => {
      console.log(`  ⚠ ${result.name}: ${result.endpoint}`);
      console.log(`    Status: ${result.status}, Data: ${result.hasData ? 'Yes' : 'No'}`);
    });
    
    console.log(`\n❌ BROKEN ENDPOINTS (${this.results.broken.length}):`);
    this.results.broken.forEach(result => {
      console.log(`  ❌ ${result.name}: ${result.endpoint}`);
      console.log(`    Status: ${result.status}`);
    });
    
    console.log(`\n🚨 ERROR ENDPOINTS (${this.results.errors.length}):`);
    this.results.errors.forEach(result => {
      console.log(`  🚨 ${result.name}: ${result.endpoint}`);
      console.log(`    Error: ${result.error}`);
    });
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Total Endpoints: ${Object.keys(ENDPOINTS).length}`);
    console.log(`  Working with Data: ${this.results.working.length}`);
    console.log(`  Working but No Data: ${this.results.noData.length}`);
    console.log(`  Broken: ${this.results.broken.length}`);
    console.log(`  Errors: ${this.results.errors.length}`);
    
    // Save detailed report
    const reportPath = './api_test_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    
    console.log('\n' + '='.repeat(80));
  }
}

// Run the tests
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;