/**
 * GitHub Integration Test
 * Test script to verify our implementation works with real GitHub resources
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
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  duration: number;
}

class GitHubIntegrationTest {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<TestResult[]> {
    this.startTime = Date.now();
    this.results = [];
    console.log('🚀 Starting GitHub integration tests...\n');
    
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
      
      // Test 7: Fetch binary data
      await this.testFetchBinary();
      
      // Test 8: Cache statistics
      await this.testCacheStatistics();
      
      this.printResults();
      return this.results;
      
    } catch (error) {
      console.error('\n❌ GitHub resource tests failed:', error);
      throw error;
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
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\n`);
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
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\n`);
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
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\n`);
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
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\n`);
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
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\n`);
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
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\n`);
    }
  }

  private async testFetchBinary(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Fetch Binary Data';
    
    try {
      console.log(`🧪 Testing ${testName}...`);
      
      // Try to fetch a known binary file (PDF)
      try {
        const pdfData = await unifiedResourceService.fetchBinary('data/organized_documents/pdf/presupuesto-2024.pdf');
        
        if (!pdfData) {
          throw new Error('No binary data returned');
        }
        
        console.log(`   ✅ Binary data fetched successfully`);
        console.log(`   📏 Size: ${pdfData.size} bytes`);
        
        this.results.push({
          name: testName,
          status: 'passed',
          message: 'Successfully fetched PDF binary data',
          duration: Date.now() - startTime
        });
        
        return;
      } catch (binaryError) {
        console.log(`   ⚠️  PDF file not found, trying alternative...`);
      }
      
      // Try to find any binary file through search
      const binaryDocuments = await unifiedResourceService.searchResources('.pdf');
      
      if (binaryDocuments.length > 0) {
        const binaryData = await unifiedResourceService.fetchBinary(binaryDocuments[0].relative_path);
        
        if (!binaryData) {
          throw new Error('No binary data returned');
        }
        
        console.log(`   ✅ Binary data fetched successfully from search result`);
        console.log(`   📄 File: ${binaryDocuments[0].title}`);
        console.log(`   📏 Size: ${binaryData.size} bytes`);
        
        this.results.push({
          name: testName,
          status: 'passed',
          message: `Successfully fetched binary data from ${binaryDocuments[0].title}`,
          duration: Date.now() - startTime
        });
        
        return;
      }
      
      throw new Error('No binary files found for testing');
      
    } catch (error) {
      this.results.push({
        name: testName,
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\n`);
    }
  }

  private async testCacheStatistics(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Cache Statistics';
    
    try {
      console.log(`🧪 Testing ${testName}...`);
      
      const cacheStats = unifiedResourceService.getCacheStats();
      
      console.log(`   ✅ Cache stats retrieved successfully`);
      console.log(`   📊 Cache size: ${cacheStats.size}`);
      console.log(`   📋 Cached keys: ${cacheStats.keys.length}`);
      
      this.results.push({
        name: testName,
        status: 'passed',
        message: `Successfully retrieved cache statistics`,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.results.push({
        name: testName,
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`   ❌ ${testName} failed: ${(error as Error).message}\n`);
    }
  }

  private printResults(): void {
    const totalTime = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.status === 'passed').length;
    const failedTests = this.results.filter(r => r.status === 'failed').length;
    const skippedTests = this.results.filter(r => r.status === 'skipped').length;
    
    console.log('\n📊 GitHub Integration Test Results:');
    console.log('====================================');
    console.log(`⏱️  Total time: ${totalTime}ms`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏭️  Skipped: ${skippedTests}`);
    console.log(`📋 Total: ${this.results.length}`);
    
    if (failedTests > 0) {
      console.log('\n💥 Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`   ❌ ${result.name}: ${result.message}`);
        });
    }
    
    if (passedTests > 0) {
      console.log('\n🎉 Passed Tests:');
      this.results
        .filter(r => r.status === 'passed')
        .forEach(result => {
          console.log(`   ✅ ${result.name}: ${result.message} (${result.duration}ms)`);
        });
    }
    
    console.log('\n🏁 GitHub integration tests completed!');
    
    // Overall result
    if (failedTests === 0) {
      console.log('🏆 All GitHub integration tests passed! The system is properly integrated with GitHub.');
    } else {
      console.log('⚠️  Some GitHub integration tests failed. Please check the GitHub integration.');
    }
  }
}

// Export test instance
export const githubIntegrationTest = new GitHubIntegrationTest();

// Run tests if called directly
if (typeof window !== 'undefined' && window.location.pathname === '/test-github') {
  githubIntegrationTest.runAllTests().catch(console.error);
}

export default githubIntegrationTest;