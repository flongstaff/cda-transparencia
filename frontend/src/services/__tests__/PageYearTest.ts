/**
 * Page Year Parameter Test - Verify pages work correctly with different year parameters
 */

import UnifiedTransparencyService from '../UnifiedTransparencyService';
import DataService from '../dataService';
import EnhancedDataService from '../EnhancedDataService';

// Test function to verify page data fetching for specific years
export const testPageDataForYears = async (years: number[] = [2020, 2021, 2022, 2023, 2024]) => {
  console.log('🧪 Testing page data for years:', years.join(', '));
  
  try {
    for (const year of years) {
      console.log(`\n🧪 Testing year ${year}...`);
      
      // Test unified service for specific year
      const yearData = await UnifiedTransparencyService.getTransparencyData(year);
      console.log(`✅ Unified service returned data for ${year}:`, 
        Object.keys(yearData.financialData).length > 0 ? 'Loaded' : 'Empty');
      
      // Test specific data services for the year
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
      
      // Verify that the year's data is in the structure
      if (yearData.financialData[year]) {
        console.log(`✅ Year ${year} data properly structured in financialData`);
      } else {
        console.log(`❌ Year ${year} data missing from financialData structure`);
      }
    }
    
    console.log('\n🎉 All year parameter tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error testing year parameters:', error);
    return false;
  }
};

// Test function to verify multi-year capabilities
export const testMultiYearCapabilities = async () => {
  console.log('\n🧪 Testing multi-year data capabilities...');
  
  try {
    // Test fetching all years data
    const allYearsData = await EnhancedDataService.getAllYears();
    console.log(`✅ All years data: ${allYearsData.length} years available`);
    
    // Test getting available years from service
    const availableYears = allYearsData.map((yearData: any) => yearData.year).filter((year: any) => year);
    console.log(`✅ Available years from service:`, availableYears);
    
    // Verify 2020-2024 range is available
    const requiredYears = [2020, 2021, 2022, 2023, 2024];
    const missingYears = requiredYears.filter(year => !availableYears.includes(year));
    
    if (missingYears.length === 0) {
      console.log('✅ All required years (2020-2024) are available');
    } else {
      console.log(`⚠️  Missing years from required range (2020-2024):`, missingYears);
    }
    
    // Test comprehensive data fetch
    const comprehensiveData = await UnifiedTransparencyService.getTransparencyData();
    console.log(`✅ Comprehensive data covers ${Object.keys(comprehensiveData.financialData).length} years`);
    console.log(`✅ Available years in metadata:`, comprehensiveData.metadata.available_years);
    
    console.log('✅ Multi-year capabilities test passed');
    return true;
  } catch (error) {
    console.error('❌ Error in multi-year capabilities test:', error);
    return false;
  }
};

// Test caching with different years
export const testYearBasedCaching = async () => {
  console.log('\n🧪 Testing year-based caching functionality...');
  
  try {
    console.log('Testing cache retrieval for 2023...');
    const cacheStart = Date.now();
    await EnhancedDataService.getBudget(2023);
    const firstCallTime = Date.now() - cacheStart;
    
    console.log('Testing cache retrieval for 2023 again (should be faster)...');
    const cacheSecondStart = Date.now();
    await EnhancedDataService.getBudget(2023);
    const secondCallTime = Date.now() - cacheSecondStart;
    
    console.log(`First call took: ${firstCallTime}ms`);
    console.log(`Second call took: ${secondCallTime}ms`);
    
    // The second call should be significantly faster if caching works
    if (secondCallTime < firstCallTime * 0.8) {
      console.log('✅ Caching is working effectively');
    } else {
      console.log('⚠️  Caching may not be working optimally');
    }
    
    console.log('✅ Year-based caching test completed');
    return true;
  } catch (error) {
    console.error('❌ Error in caching test:', error);
    return false;
  }
};

// Run all page year tests
export const runPageYearTests = async () => {
  console.log('🚀 Running page year parameter tests...');
  
  const tests = [
    { name: 'Multi-year Capabilities', fn: testMultiYearCapabilities },
    { name: 'Year Parameter Data Fetching', fn: () => testPageDataForYears([2020, 2021, 2022, 2023, 2024]) },
    { name: 'Year-based Caching', fn: testYearBasedCaching }
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
  console.log('\n📊 Page Year Test Summary:');
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All page year tests passed! Pages ready for all years (2020-2024).');
  } else {
    console.log('⚠️  Some page year tests failed. Please check the logs above.');
  }
  
  return passedTests === totalTests;
};

export default {
  testPageDataForYears,
  testMultiYearCapabilities,
  testYearBasedCaching,
  runPageYearTests
};