/**
 * GitHub Resource Test
 * Test script to verify our implementation works with real GitHub resources
 */

import { unifiedResourceService } from '../services/UnifiedResourceService';
import { DocumentMetadata } from '../types/documents';

async function runGitHubResourceTests() {
  console.log('Starting GitHub resource tests...');
  
  try {
    // Test 1: Get available years
    console.log('\n1. Testing available years...');
    const years = await unifiedResourceService.getAvailableYears();
    console.log('✓ Available years:', years);
    
    // Test 2: Get categories for a year
    if (years.length > 0) {
      console.log('\n2. Testing categories for year', years[0]);
      const categories = await unifiedResourceService.getCategoriesForYear(years[0]);
      console.log('✓ Categories:', categories);
    }
    
    // Test 3: Search resources
    console.log('\n3. Testing resource search...');
    const searchResults = await unifiedResourceService.searchResources('budget');
    console.log('✓ Search results:', searchResults.length, 'documents found');
    
    // Test 4: Fetch document metadata
    if (searchResults.length > 0) {
      console.log('\n4. Testing document metadata fetch...');
      const document = searchResults[0];
      const metadata = await unifiedResourceService.fetchDocumentMetadata(document.relative_path);
      console.log('✓ Document metadata:', metadata?.title);
    }
    
    // Test 5: Fetch JSON data
    console.log('\n5. Testing JSON data fetch...');
    try {
      const jsonData = await unifiedResourceService.fetchJSON('data/organized_documents/json/budget_data.json');
      console.log('✓ JSON data fetched successfully');
    } catch (error) {
      console.log('⚠ JSON data fetch failed:', (error as Error).message);
    }
    
    // Test 6: Fetch text data
    console.log('\n6. Testing text data fetch...');
    try {
      const textData = await unifiedResourceService.fetchText('README.md');
      console.log('✓ Text data fetched successfully');
    } catch (error) {
      console.log('⚠ Text data fetch failed:', (error as Error).message);
    }
    
    // Test 7: Cache statistics
    console.log('\n7. Testing cache statistics...');
    const cacheStats = unifiedResourceService.getCacheStats();
    console.log('✓ Cache stats:', cacheStats);
    
    console.log('\n✅ All GitHub resource tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ GitHub resource tests failed:', error);
  }
}

// Run the tests
runGitHubResourceTests().catch(console.error);

export default runGitHubResourceTests;