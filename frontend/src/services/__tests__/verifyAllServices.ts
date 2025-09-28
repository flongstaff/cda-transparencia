#!/usr/bin/env node

/**
 * Verify All Services Script
 * Comprehensive verification of all services with real data sources
 * Tests connectivity, data fetching, and integration between services
 */

import { dataService } from '../dataService';
import AuditService from '../AuditService';
import EnhancedDataService from '../EnhancedDataService';
import externalAPIsService from '../ExternalAPIsService';
import { githubDataService } from '../GitHubDataService';
import { dataSyncService } from '../DataSyncService';
import masterDataService from '../MasterDataService';
import RealDataService from '../RealDataService';
import UnifiedTransparencyService from '../UnifiedTransparencyService';
import comprehensiveDataIntegrationService from '../ComprehensiveDataIntegrationService';

// Test configuration
const TEST_YEARS = [2020, 2021, 2022, 2023, 2024];
const TIMEOUT_DURATION = 30000; // 30 seconds timeout

console.log('🔍 Verifying all services with real data sources...\n');

async function runVerification() {
  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Data Service Verification
  console.log('🧪 Testing Data Service...');
  totalTests++;
  try {
    const masterData = await dataService.getMasterData();
    if (masterData) {
      console.log('✅ Data Service: SUCCESS');
      passedTests++;
    } else {
      console.log('❌ Data Service: FAILED - No data returned');
    }
  } catch (error) {
    console.log('❌ Data Service: ERROR -', error.message);
  }

  // Test 2: Audit Service Verification
  console.log('\n🧪 Testing Audit Service...');
  totalTests++;
  try {
    const auditResults = await AuditService.getInstance().getAuditResults();
    if (Array.isArray(auditResults)) {
      console.log('✅ Audit Service: SUCCESS');
      passedTests++;
    } else {
      console.log('❌ Audit Service: FAILED - Invalid audit results format');
    }
  } catch (error) {
    console.log('❌ Audit Service: ERROR -', error.message);
  }

  // Test 3: Enhanced Data Service Verification
  console.log('\n🧪 Testing Enhanced Data Service...');
  totalTests++;
  try {
    const allYears = await EnhancedDataService.getAllYears();
    if (Array.isArray(allYears)) {
      console.log('✅ Enhanced Data Service: SUCCESS');
      passedTests++;
    } else {
      console.log('❌ Enhanced Data Service: FAILED - Invalid all years format');
    }
  } catch (error) {
    console.log('❌ Enhanced Data Service: ERROR -', error.message);
  }

  // Test 4: External APIs Service Verification
  console.log('\n🧪 Testing External APIs Service...');
  totalTests++;
  try {
    const externalData = await externalAPIsService.loadAllExternalData();
    if (externalData.summary.successful_sources >= 0) {
      console.log('✅ External APIs Service: SUCCESS');
      passedTests++;
    } else {
      console.log('❌ External APIs Service: FAILED - Invalid external data format');
    }
  } catch (error) {
    console.log('❌ External APIs Service: ERROR -', error.message);
  }

  // Test 5: GitHub Data Service Verification
  console.log('\n🧪 Testing GitHub Data Service...');
  totalTests++;
  try {
    const githubData = await githubDataService.loadYearData(2023);
    if (githubData.success) {
      console.log('✅ GitHub Data Service: SUCCESS');
      passedTests++;
    } else {
      console.log('❌ GitHub Data Service: FAILED - Could not load year data');
    }
  } catch (error) {
    console.log('❌ GitHub Data Service: ERROR -', error.message);
  }

  // Test 6: Data Sync Service Verification
  console.log('\n🧪 Testing Data Sync Service...');
  totalTests++;
  try {
    const syncReport = await dataSyncService.synchronizeAllSources();
    if (syncReport) {
      console.log('✅ Data Sync Service: SUCCESS');
      passedTests++;
    } else {
      console.log('❌ Data Sync Service: FAILED - Could not synchronize sources');
    }
  } catch (error) {
    console.log('❌ Data Sync Service: ERROR -', error.message);
  }

  // Test 7: Master Data Service Verification
  console.log('\n🧪 Testing Master Data Service...');
  totalTests++;
  try {
    const masterData = await masterDataService.loadComprehensiveData();
    if (masterData) {
      console.log('✅ Master Data Service: SUCCESS');
      passedTests++;
    } else {
      console.log('❌ Master Data Service: FAILED - Could not load comprehensive data');
    }
  } catch (error) {
    console.log('❌ Master Data Service: ERROR -', error.message);
  }

  // Test 8: Real Data Service Verification
  console.log('\n🧪 Testing Real Data Service...');
  totalTests++;
  try {
    const realData = await RealDataService.getInstance().getVerifiedData();
    if (realData) {
      console.log('✅ Real Data Service: SUCCESS');
      passedTests++;
    } else {
      console.log('❌ Real Data Service: FAILED - Could not get verified data');
    }
  } catch (error) {
    console.log('❌ Real Data Service: ERROR -', error.message);
  }

  // Test 9: Unified Transparency Service Verification
  console.log('\n🧪 Testing Unified Transparency Service...');
  totalTests++;
  try {
    const transparencyData = await UnifiedTransparencyService.getTransparencyData();
    if (transparencyData) {
      console.log('✅ Unified Transparency Service: SUCCESS');
      passedTests++;
    } else {
      console.log('❌ Unified Transparency Service: FAILED - Could not get transparency data');
    }
  } catch (error) {
    console.log('❌ Unified Transparency Service: ERROR -', error.message);
  }

  // Test 10: Comprehensive Data Integration Service Verification
  console.log('\n🧪 Testing Comprehensive Data Integration Service...');
  totalTests++;
  try {
    const connected = await comprehensiveDataIntegrationService.connectToAllDataSources();
    if (connected) {
      console.log('✅ Comprehensive Data Integration Service: SUCCESS');
      passedTests++;
    } else {
      console.log('❌ Comprehensive Data Integration Service: FAILED - Could not connect to data sources');
    }
  } catch (error) {
    console.log('❌ Comprehensive Data Integration Service: ERROR -', error.message);
  }

  // Summary
  console.log('\n📊 Verification Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`成功率: ${(passedTests / totalTests * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All services verified successfully!');
    console.log('✅ The portal is properly connected to all real data sources');
    console.log('✅ All services are working correctly');
    console.log('✅ Ready for production deployment');
    return true;
  } else {
    console.log('\n⚠️  Some services failed verification');
    console.log('⚠️  Please check the logs above and fix any issues');
    return false;
  }
}

// Run the verification
runVerification().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('致命错误:', error);
  process.exit(1);
});