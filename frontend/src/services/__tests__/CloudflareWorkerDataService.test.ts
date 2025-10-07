/**
 * Cloudflare Worker Data Service Test
 * 
 * Test the CloudflareWorkerDataService to ensure it works correctly
 * with the Cloudflare worker and caching/analytics features.
 */

import { cloudflareWorkerDataService } from './CloudflareWorkerDataService';

async function testCloudflareWorkerDataService() {
  console.log('🧪 Testing Cloudflare Worker Data Service...');
  
  try {
    // Test 1: Get available years
    console.log('\n1. Testing available years...');
    const years = await cloudflareWorkerDataService.getAvailableYears();
    console.log(`✅ Available years: ${years.join(', ')}`);
    
    // Test 2: Load year data
    console.log('\n2. Testing year data loading...');
    const yearData = await cloudflareWorkerDataService.loadYearData(2024);
    console.log(`✅ Year data load result: ${yearData.success ? 'SUCCESS' : 'FAILED'}`);
    if (yearData.success && yearData.data) {
      console.log(`   - Budget data: ${!!yearData.data.budget}`);
      console.log(`   - Contracts data: ${Array.isArray(yearData.data.contracts) ? yearData.data.contracts.length : 0} items`);
      console.log(`   - Salaries data: ${Array.isArray(yearData.data.salaries) ? yearData.data.salaries.length : 0} items`);
      console.log(`   - Documents data: ${Array.isArray(yearData.data.documents) ? yearData.data.documents.length : 0} items`);
    }
    
    // Test 3: Load all data
    console.log('\n3. Testing all data loading...');
    const allData = await cloudflareWorkerDataService.loadAllData();
    console.log(`✅ All data load result: ${allData.success ? 'SUCCESS' : 'FAILED'}`);
    if (allData.success && allData.data) {
      console.log(`   - Years covered: ${allData.data.summary.years_covered.length}`);
      console.log(`   - Total documents: ${allData.data.summary.total_documents}`);
      console.log(`   - Categories: ${allData.data.summary.categories.length}`);
    }
    
    // Test 4: Cache stats
    console.log('\n4. Testing cache stats...');
    const cacheStats = cloudflareWorkerDataService.getCacheStats();
    console.log(`✅ Cache stats: ${cacheStats.size} entries`);
    
    // Test 5: Fetch specific data files
    console.log('\n5. Testing specific data file fetching...');
    
    // Test budget data
    const budgetResponse = await cloudflareWorkerDataService.fetchJson('data/consolidated/2024/budget.json');
    console.log(`✅ Budget data fetch: ${budgetResponse.success ? 'SUCCESS' : 'FAILED'}`);
    
    // Test contracts data
    const contractsResponse = await cloudflareWorkerDataService.fetchJson('data/consolidated/2024/contracts.json');
    console.log(`✅ Contracts data fetch: ${contractsResponse.success ? 'SUCCESS' : 'FAILED'}`);
    
    // Test salaries data
    const salariesResponse = await cloudflareWorkerDataService.fetchJson('data/consolidated/2024/salaries.json');
    console.log(`✅ Salaries data fetch: ${salariesResponse.success ? 'SUCCESS' : 'FAILED'}`);
    
    console.log('\n🎉 All Cloudflare Worker Data Service tests completed!');
    
  } catch (error) {
    console.error('❌ Cloudflare Worker Data Service test failed:', error);
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  testCloudflareWorkerDataService().catch(console.error);
}

export default testCloudflareWorkerDataService;