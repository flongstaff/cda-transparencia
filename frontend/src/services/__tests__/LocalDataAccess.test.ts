/**
 * LOCAL DATA ACCESS TEST
 * 
 * Test to verify that data files are accessible through local paths
 * in the deployed site to avoid CORS issues.
 */

import { githubDataService } from './GitHubDataService';

async function testLocalDataAccess() {
  console.log('🧪 Testing local data access for deployed site...');
  
  try {
    // Test accessing data files through local paths (for deployed site)
    const testDataFiles = [
      'data/consolidated/2025/budget.json',
      'data/consolidated/2025/contracts.json',
      'data/consolidated/2025/salaries.json',
      'data/consolidated/2025/documents.json',
      'data/consolidated/2025/treasury.json',
      'data/consolidated/2025/summary.json'
    ];

    // Test each file
    for (const filePath of testDataFiles) {
      console.log(`\n📥 Testing local access for: ${filePath}`);
      
      try {
        const response = await githubDataService.fetchJson(filePath);
        console.log(`✅ ${filePath}: ${response.success ? 'SUCCESS' : 'FAILED'}`);
        
        if (response.success) {
          console.log(`   - Source: ${response.source}`);
          console.log(`   - Data keys: ${Object.keys(response.data || {}).join(', ')}`);
        } else {
          console.log(`   - Error: ${response.error}`);
        }
      } catch (error) {
        console.error(`❌ ${filePath} failed with error:`, error);
      }
    }
    
    console.log('\n🎉 Local data access test completed!');
    
  } catch (error) {
    console.error('❌ Local data access test failed:', error);
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  testLocalDataAccess().catch(console.error);
}

export default testLocalDataAccess;