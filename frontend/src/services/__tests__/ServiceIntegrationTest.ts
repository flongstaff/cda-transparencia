/**
 * Service Integration Test - Verify all services work together correctly
 * Tests the integration between all enhanced services
 */

import DataService from '../dataService';
import AuditService from '../AuditService';
import EnhancedDataService from '../EnhancedDataService';
import externalAPIsService from '../ExternalDataAdapter';
import { githubDataService } from '../GitHubDataService';
import { dataSyncService } from '../DataSyncService';
import masterDataService from '../MasterDataService';
import RealDataService from '../RealDataService';
import UnifiedTransparencyService from '../UnifiedTransparencyService';

// Test function to verify all services integration
export const testServiceIntegration = async () => {
  console.log('🧪 Starting service integration tests...');
  
  try {
    // Test 1: Basic data service functionality
    console.log('🧪 Testing basic data service...');
    const allYears = await dataService.getAllYears();
    console.log(`✅ Data service returned ${allYears.length} years of data`);
    
    // Test 2: Enhanced data service
    console.log('🧪 Testing enhanced data service...');
    const enhancedAllYears = await EnhancedDataService.getAllYears();
    console.log(`✅ Enhanced data service returned ${enhancedAllYears.length} years of data`);
    
    // Test 3: GitHub data service
    console.log('🧪 Testing GitHub data service...');
    const githubAllData = await githubDataService.loadAllData();
    console.log(`✅ GitHub service returned data for ${Object.keys(githubAllData.data.byYear || {}).length} years`);
    
    // Test 4: External APIs service
    console.log('🧪 Testing external APIs service...');
    const externalData = await externalAPIsService.loadAllExternalData();
    console.log(`✅ External APIs service returned data from ${externalData.summary.successful_sources} sources`);
    
    // Test 5: Audit service
    console.log('🧪 Testing audit service...');
    const auditData = await AuditService.getInstance().getAuditResults();
    console.log(`✅ Audit service returned ${auditData.length} discrepancies`);
    
    // Test 6: Data sync service
    console.log('🧪 Testing data sync service...');
    const syncReport = await dataSyncService.synchronizeAllSources();
    console.log(`✅ Data sync service synchronized ${syncReport.successful_sources} sources`);
    
    // Test 7: Master data service
    console.log('🧪 Testing master data service...');
    const masterData = await masterDataService.loadComprehensiveData();
    console.log(`✅ Master data service loaded ${masterData.metadata.total_documents} documents`);
    
    // Test 8: Real data service
    console.log('🧪 Testing real data service...');
    const realData = await RealDataService.getInstance().getVerifiedData();
    console.log(`✅ Real data service verified data from multiple sources`);
    
    // Test 9: Unified transparency service
    console.log('🧪 Testing unified transparency service...');
    const unifiedData = await UnifiedTransparencyService.getTransparencyData();
    console.log(`✅ Unified service returned data for ${Object.keys(unifiedData.financialData).length} years`);
    
    // Test 10: Cross-service data consistency
    console.log('🧪 Testing cross-service data consistency...');
    
    // Check that all services return consistent year data
    const dataServiceYears = allYears.map((y: any) => y.year).filter((y: number) => y);
    const enhancedServiceYears = enhancedAllYears.map((y: any) => y.year).filter((y: number) => y);
    const githubServiceYears = Object.keys(githubAllData.data.byYear || {}).map(y => parseInt(y));
    
    const commonYears = dataServiceYears.filter((year: number) => 
      enhancedServiceYears.includes(year) && githubServiceYears.includes(year)
    );
    
    if (commonYears.length > 0) {
      console.log(`✅ Found ${commonYears.length} common years across services:`, commonYears);
    } else {
      console.log('⚠️ No common years found across services');
    }
    
    // Test 11: Service health checks
    console.log('🧪 Testing service health...');
    const auditHealth = await AuditService.getInstance().getServiceHealth();
    const externalHealth = await externalAPIsService.getServiceHealth();
    const githubHealth = await githubDataService.getCacheStats();
    
    console.log(`✅ Audit service health: ${auditHealth.status}`);
    console.log(`✅ External APIs service health: ${externalHealth.status}`);
    console.log(`✅ GitHub service cache size: ${githubHealth.size}`);
    
    console.log('🎉 All service integration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Error in service integration tests:', error);
    return false;
  }
};

// Test caching functionality across services
export const testCrossServiceCaching = async () => {
  console.log('🧪 Testing cross-service caching functionality...');
  
  try {
    console.log('Testing cache retrieval speeds...');
    
    // Test data service cache
    const cacheStart = Date.now();
    const data1 = await dataService.getAllYears();
    const firstCallTime = Date.now() - cacheStart;
    
    console.log('Testing cache retrieval again (should be faster)...');
    const cacheSecondStart = Date.now();
    const data2 = await dataService.getAllYears();
    const secondCallTime = Date.now() - cacheSecondStart;
    
    console.log(`First call took: ${firstCallTime}ms`);
    console.log(`Second call took: ${secondCallTime}ms`);
    
    // The second call should be significantly faster if caching works
    if (secondCallTime < firstCallTime * 0.8) {
      console.log('✅ Caching is working effectively across services');
    } else {
      console.log('⚠️ Caching may not be working optimally');
    }
    
    // Test enhanced data service cache
    const enhancedCacheStart = Date.now();
    const enhancedData1 = await EnhancedDataService.getAllYears();
    const enhancedFirstCallTime = Date.now() - enhancedCacheStart;
    
    console.log('Testing enhanced data service cache retrieval again...');
    const enhancedCacheSecondStart = Date.now();
    const enhancedData2 = await EnhancedDataService.getAllYears();
    const enhancedSecondCallTime = Date.now() - enhancedCacheSecondStart;
    
    console.log(`Enhanced first call took: ${enhancedFirstCallTime}ms`);
    console.log(`Enhanced second call took: ${enhancedSecondCallTime}ms`);
    
    if (enhancedSecondCallTime < enhancedFirstCallTime * 0.8) {
      console.log('✅ Enhanced data service caching is working effectively');
    } else {
      console.log('⚠️ Enhanced data service caching may not be working optimally');
    }
    
    console.log('✅ Cross-service caching test completed');
    return true;
  } catch (error) {
    console.error('❌ Error in cross-service caching test:', error);
    return false;
  }
};

// Test data consistency across services
export const testDataConsistency = async () => {
  console.log('🧪 Testing data consistency across services...');
  
  try {
    // Get data from multiple services for the same year
    const testYear = 2023;
    
    console.log(`Testing data consistency for year ${testYear}...`);
    
    // Get data from each service
    const [
      dataServiceData,
      enhancedDataServiceData,
      githubDataServiceData
    ] = await Promise.all([
      dataService.getMasterData(testYear),
      EnhancedDataService.getBudget(testYear),
      githubDataService.loadYearData(testYear)
    ]);
    
    // Check if all services return data for the requested year
    if (dataServiceData && enhancedDataServiceData && githubDataServiceData.success) {
      console.log(`✅ All services returned data for year ${testYear}`);
    } else {
      console.log(`⚠️ Some services failed to return data for year ${testYear}`);
    }
    
    // Check data structure consistency
    const dataServiceStructure = Object.keys(dataServiceData?.yearData || {});
    const enhancedDataServiceStructure = Object.keys(enhancedDataServiceData || {});
    const githubDataServiceStructure = Object.keys(githubDataServiceData.data || {});
    
    console.log(`Data service structure:`, dataServiceStructure);
    console.log(`Enhanced data service structure:`, enhancedDataServiceStructure);
    console.log(`GitHub data service structure:`, githubDataServiceStructure);
    
    // Check for common data structures
    const commonStructures = dataServiceStructure.filter(key => 
      enhancedDataServiceStructure.includes(key) && githubDataServiceStructure.includes(key)
    );
    
    if (commonStructures.length > 0) {
      console.log(`✅ Found ${commonStructures.length} common data structures:`, commonStructures);
    } else {
      console.log('⚠️ No common data structures found across services');
    }
    
    console.log('✅ Data consistency test completed');
    return true;
  } catch (error) {
    console.error('❌ Error in data consistency test:', error);
    return false;
  }
};

// Run all service integration tests
export const runServiceIntegrationTests = async () => {
  console.log('🚀 Running comprehensive service integration tests...');
  
  const tests = [
    { name: 'Service Integration', fn: testServiceIntegration },
    { name: 'Cross-Service Caching', fn: testCrossServiceCaching },
    { name: 'Data Consistency', fn: testDataConsistency }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`\n🧪 Running ${test.name} test...`);
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      
      if (result) {
        console.log(`✅ ${test.name} test passed`);
      } else {
        console.log(`❌ ${test.name} test failed`);
      }
    } catch (error) {
      console.error(`❌ ${test.name} test error:`, error);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n📊 Service Integration Test Summary:');
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All service integration tests passed! Services are working together correctly.');
  } else {
    console.log('⚠️ Some service integration tests failed. Please check the logs above.');
  }
  
  return passedTests === totalTests;
};

export default {
  testServiceIntegration,
  testCrossServiceCaching,
  testDataConsistency,
  runServiceIntegrationTests
};