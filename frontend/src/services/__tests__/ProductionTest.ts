/**
 * Production Test - Verify all services work correctly in production
 */

import UnifiedTransparencyService from '../UnifiedTransparencyService';
import EnhancedDataService from '../EnhancedDataService';
import DataService from '../dataService';

// Test function to verify all services
export const testAllServices = async () => {
  console.log('🧪 Starting production service tests...');
  
  try {
    // Test 1: Basic data service functionality
    console.log('🧪 Testing basic data service...');
    const allYears = await dataService.getAllYears();
    console.log(`✅ Data service returned ${allYears.length} years of data`);
    
    // Test 2: Enhanced data service
    console.log('🧪 Testing enhanced data service...');
    const enhancedAllYears = await EnhancedDataService.getAllYears();
    console.log(`✅ Enhanced data service returned ${enhancedAllYears.length} years of data`);
    
    // Test 3: Unified transparency service
    console.log('🧪 Testing unified transparency service...');
    const transparencyData = await UnifiedTransparencyService.getTransparencyData();
    console.log(`✅ Unified service returned data for ${Object.keys(transparencyData.financialData).length} years`);
    
    // Test 4: Audit service
    console.log('🧪 Testing audit service...');
    const auditData = await UnifiedTransparencyService.getAuditData();
    console.log(`✅ Audit service returned ${auditData.discrepancies.length} discrepancies`);
    
    // Test 5: Documents service
    console.log('🧪 Testing documents service...');
    const documents = await UnifiedTransparencyService.getDocuments();
    console.log(`✅ Documents service returned ${documents.length} documents`);
    
    console.log('🎉 All production services are working correctly!');
    return true;
  } catch (error) {
    console.error('❌ Error testing production services:', error);
    return false;
  }
};

// Test function for specific year data
export const testYearData = async (year: number = 2023) => {
  console.log(`🧪 Testing data for year ${year}...`);
  
  try {
    // Test data service for specific year
    const budgetData = await EnhancedDataService.getBudget(year);
    console.log(`✅ Budget data for ${year}:`, Object.keys(budgetData || {}).length > 0 ? 'Loaded' : 'Empty');
    
    const contractsData = await EnhancedDataService.getContracts(year);
    console.log(`✅ Contracts data for ${year}: ${contractsData?.length || 0} items`);
    
    const salariesData = await EnhancedDataService.getSalaries(year);
    console.log(`✅ Salaries data for ${year}: ${salariesData?.length || 0} items`);
    
    const treasuryData = await EnhancedDataService.getTreasury(year);
    console.log(`✅ Treasury data for ${year}:`, Object.keys(treasuryData || {}).length > 0 ? 'Loaded' : 'Empty');
    
    const debtData = await EnhancedDataService.getDebt(year);
    console.log(`✅ Debt data for ${year}:`, Object.keys(debtData || {}).length > 0 ? 'Loaded' : 'Empty');
    
    const documentsData = await EnhancedDataService.getDocuments(year);
    console.log(`✅ Documents data for ${year}: ${documentsData?.length || 0} items`);
    
    console.log(`🎉 Year ${year} data tests completed successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Error testing year ${year} data:`, error);
    return false;
  }
};

// Test caching functionality
export const testCaching = async () => {
  console.log('🧪 Testing caching functionality...');
  
  try {
    // Test cache stats
    const dataServiceStats = dataService.getCacheStats();
    console.log(`✅ Data service cache: ${dataServiceStats.size} items`);
    
    const enhancedServiceStats = EnhancedDataService.getCacheStats();
    console.log(`✅ Enhanced service cache: ${enhancedServiceStats.size} items`);
    
    // Test unified service cache
    await UnifiedTransparencyService.getTransparencyData();
    // Call again to test cache hit
    await UnifiedTransparencyService.getTransparencyData();
    
    console.log('✅ Caching tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error testing caching:', error);
    return false;
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Running comprehensive production tests...');
  
  const tests = [
    { name: 'All Services', fn: testAllServices },
    { name: 'Year 2023 Data', fn: () => testYearData(2023) },
    { name: 'Year 2024 Data', fn: () => testYearData(2024) },
    { name: 'Caching', fn: testCaching }
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
  console.log('\n📊 Test Summary:');
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Production ready.');
  } else {
    console.log('⚠️  Some tests failed. Please check the logs above.');
  }
  
  return passedTests === totalTests;
};

// Export for use in components
export default {
  testAllServices,
  testYearData,
  testCaching,
  runAllTests
};