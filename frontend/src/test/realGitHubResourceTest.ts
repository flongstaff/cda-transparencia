/**
 * Real GitHub Resource Test
 * Test that actually uses real GitHub resources to verify functionality
 */

import { unifiedResourceService } from '../services/UnifiedResourceService';
import { DocumentMetadata } from '../types/documents';

// Test configuration
const TEST_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRIES: 3
};

interface TestResult {
  name: string;
  status: 'passed' | 'failed';
  message?: string;
  duration: number;
}

class RealGitHubResourceTest {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<void> {
    this.startTime = Date.now();
    console.log('🚀 Starting real GitHub resource tests...\\n');
    
    try {
      // Test 1: Get available years
      await this.testGetAvailableYears();
      
      // Test 2: Get categories for year
      await this.testGetCategoriesForYear();
      
      // Test 3: Search resources
      await this.testSearchResources();
      
      // Test 4: Fetch document metadata
      await this.testFetchDocumentMetadata();
      
      // Test 5: Fetch JSON data
      await this.testFetchJSON();
      
      // Test 6: Fetch text data
      await this.testFetchText();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Real GitHub resource tests failed:', error);
    }
  }

  private async testGetAvailableYears(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Get Available Years';
    
    try {
      console.log(`🧪 Testing ${testName}...`);
      
      const years = await unifiedResourceService.getAvailableYears();
      
      if (!years || years.length === 0) {
        throw new Error('No years returned');
      }
      
      console.log(`   ✅ ${years.length} years found:`, years);
      
      this.results.push({
        name: testName,
        status: 'passed',
        message: `Successfully retrieved ${years.length} years`,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.results.push({
        name: testName,
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\\n`);
    }
  }

  private async testGetCategoriesForYear(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Get Categories for Year';
    
    try {
      console.log(`🧪 Testing ${testName}...`);
      
      // Get available years first
      const years = await unifiedResourceService.getAvailableYears();
      
      if (years.length === 0) {
        throw new Error('No years available');
      }
      
      // Test with the most recent year
      const latestYear = Math.max(...years);
      const categories = await unifiedResourceService.getCategoriesForYear(latestYear);
      
      if (!categories || categories.length === 0) {
        throw new Error('No categories returned');
      }
      
      console.log(`   ✅ ${categories.length} categories found for year ${latestYear}:`, categories);
      
      this.results.push({
        name: testName,
        status: 'passed',
        message: `Successfully retrieved ${categories.length} categories for year ${latestYear}`,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.results.push({
        name: testName,
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\\n`);
    }
  }

  private async testSearchResources(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Search Resources';
    
    try {
      console.log(`🧪 Testing ${testName}...`);
      
      // Search for budget-related documents
      const results = await unifiedResourceService.searchResources('budget');
      
      console.log(`   ✅ Search returned ${results.length} results`);
      
      if (results.length > 0) {
        console.log(`   📄 Sample result: ${results[0].title} (${results[0].file_type})`);
      }
      
      this.results.push({
        name: testName,
        status: 'passed',
        message: `Successfully searched for 'budget' and found ${results.length} results`,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.results.push({
        name: testName,
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\\n`);
    }
  }

  private async testFetchDocumentMetadata(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Fetch Document Metadata';
    
    try {
      console.log(`🧪 Testing ${testName}...`);
      
      // Search for a document to test with
      const results = await unifiedResourceService.searchResources('budget');
      
      if (results.length === 0) {
        throw new Error('No documents found for testing');
      }
      
      // Test with the first document
      const document = results[0];
      const metadata = await unifiedResourceService.fetchDocumentMetadata(document.relative_path);
      
      if (!metadata) {
        throw new Error('No metadata returned');
      }
      
      console.log(`   ✅ Metadata fetched for: ${metadata.title}`);
      console.log(`   📁 File type: ${metadata.file_type}`);
      console.log(`   📏 Size: ${metadata.size_mb} MB`);
      
      this.results.push({
        name: testName,
        status: 'passed',
        message: `Successfully fetched metadata for ${metadata.title}`,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.results.push({
        name: testName,
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\\n`);
    }
  }

  private async testFetchJSON(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Fetch JSON Data';
    
    try {
      console.log(`🧪 Testing ${testName}...`);
      
      // Try to fetch a known JSON file
      try {
        const jsonData = await unifiedResourceService.fetchJSON('data/organized_documents/json/budget_data.json');
        
        if (!jsonData) {
          throw new Error('No JSON data returned');
        }
        
        console.log(`   ✅ JSON data fetched successfully`);
        console.log(`   📊 Data keys: ${Object.keys(jsonData).join(', ')}`);
        
        this.results.push({
          name: testName,
          status: 'passed',
          message: 'Successfully fetched JSON data',
          duration: Date.now() - startTime
        });
        
        return;
      } catch (jsonError) {
        // Try another JSON file
        console.log(`   ⚠️  First JSON file not found, trying alternative...`);
      }
      
      // Try to fetch another JSON file
      try {
        const jsonData = await unifiedResourceService.fetchJSON('data/organized_analysis/financial_summary.json');
        
        if (!jsonData) {
          throw new Error('No JSON data returned');
        }
        
        console.log(`   ✅ JSON data fetched successfully`);
        console.log(`   📊 Data keys: ${Object.keys(jsonData).join(', ')}`);
        
        this.results.push({
          name: testName,
          status: 'passed',
          message: 'Successfully fetched JSON data from alternative source',
          duration: Date.now() - startTime
        });
        
        return;
      } catch (jsonError) {
        console.log(`   ⚠️  Second JSON file not found, trying generic search...`);
      }
      
      // Try to find any JSON file through search
      const jsonDocuments = await unifiedResourceService.searchResources('.json');
      
      if (jsonDocuments.length > 0) {
        const jsonData = await unifiedResourceService.fetchJSON(jsonDocuments[0].relative_path);
        
        if (!jsonData) {
          throw new Error('No JSON data returned');
        }
        
        console.log(`   ✅ JSON data fetched successfully from search result`);
        console.log(`   📄 File: ${jsonDocuments[0].title}`);
        
        this.results.push({
          name: testName,
          status: 'passed',
          message: `Successfully fetched JSON data from ${jsonDocuments[0].title}`,
          duration: Date.now() - startTime
        });
        
        return;
      }
      
      throw new Error('No JSON files found for testing');
      
    } catch (error) {
      this.results.push({
        name: testName,
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\\n`);
    }
  }

  private async testFetchText(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Fetch Text Data';
    
    try {
      console.log(`🧪 Testing ${testName}...`);
      
      // Try to fetch a known text file (README.md)
      try {
        const textData = await unifiedResourceService.fetchText('README.md');
        
        if (!textData) {
          throw new Error('No text data returned');
        }
        
        console.log(`   ✅ Text data fetched successfully`);
        console.log(`   📝 First 100 characters: ${textData.substring(0, 100)}...`);
        
        this.results.push({
          name: testName,
          status: 'passed',
          message: 'Successfully fetched README.md',
          duration: Date.now() - startTime
        });
        
        return;
      } catch (textError) {
        console.log(`   ⚠️  README.md not found, trying alternative...`);
      }
      
      // Try to find any text file through search
      const textDocuments = await unifiedResourceService.searchResources('.md');
      
      if (textDocuments.length > 0) {
        const textData = await unifiedResourceService.fetchText(textDocuments[0].relative_path);
        
        if (!textData) {
          throw new Error('No text data returned');
        }
        
        console.log(`   ✅ Text data fetched successfully from search result`);
        console.log(`   📄 File: ${textDocuments[0].title}`);
        console.log(`   📝 First 100 characters: ${textData.substring(0, 100)}...`);
        
        this.results.push({
          name: testName,
          status: 'passed',
          message: `Successfully fetched text data from ${textDocuments[0].title}`,
          duration: Date.now() - startTime
        });
        
        return;
      }
      
      throw new Error('No text files found for testing');
      
    } catch (error) {
      this.results.push({
        name: testName,
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\\n`);
    }
  }

  private printResults(): void {
    const totalTime = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.status === 'passed').length;
    const failedTests = this.results.filter(r => r.status === 'failed').length;
    
    console.log('\\n📊 Real GitHub Resource Test Results:');
    console.log('====================================');
    console.log(`⏱️  Total time: ${totalTime}ms`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📋 Total: ${this.results.length}`);
    
    if (failedTests > 0) {
      console.log('\\n💥 Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`   ❌ ${result.name}: ${result.message}`);
        });
    }
    
    if (passedTests > 0) {
      console.log('\\n🎉 Passed Tests:');
      this.results
        .filter(r => r.status === 'passed')
        .forEach(result => {
          console.log(`   ✅ ${result.name}: ${result.message} (${result.duration}ms)`);
        });
    }
    
    console.log('\\n🏁 Real GitHub resource tests completed!');
    
    // Overall result
    if (failedTests === 0) {
      console.log('🏆 All real GitHub resource tests passed! The system is properly integrated with GitHub.');
    } else {
      console.log('⚠️  Some real GitHub resource tests failed. Please check the GitHub integration.');
    }
  }
}

// Export test instance
export const realGitHubResourceTest = new RealGitHubResourceTest();

// Run tests if called directly
if (typeof window !== 'undefined' && window.location.pathname === '/test-real-github') {
  realGitHubResourceTest.runAllTests().catch(console.error);
}

export default realGitHubResourceTest;