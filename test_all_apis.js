#!/usr/bin/env node

/**
 * Comprehensive API Testing Script
 * Tests all endpoints in the Carmen de Areco Transparency Portal
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

// All API endpoints based on the routes structure
const ENDPOINTS = {
  // Core Data Endpoints
  'Health Check': '/health',
  'Years Available': '/api/years',
  'Budget Data': '/api/budget-data',
  'Salary Data': '/api/salary-data',
  
  // Financial Data
  'Property Declarations': '/api/declarations',
  'Public Tenders': '/api/tenders', 
  'Financial Reports': '/api/reports',
  'Treasury Movements': '/api/treasury',
  'Fees & Rights': '/api/fees',
  'Operational Expenses': '/api/expenses',
  'Municipal Debt': '/api/debt',
  'Investment Assets': '/api/investments',
  'Financial Indicators': '/api/indicators',
  'Documents': '/api/documents',
  
  // PowerBI Integration
  'PowerBI Data': '/api/powerbi',
  
  // Anti-Corruption System
  'Corruption Detection': '/api/corruption-detection',
  'Transparency Metrics': '/api/transparency-metrics', 
  'Audit Trail': '/api/audit-trail',
  'Anti-Corruption Dashboard': '/api/anti-corruption-dashboard',
  'Advanced Fraud Detection': '/api/advanced-fraud-detection',
  'Anomaly Detection': '/api/anomaly-detection',
  'Financial Audit': '/api/financial-audit',
  'Vendor Relationships': '/api/vendor-relationships'
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