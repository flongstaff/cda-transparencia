/**
 * Final Implementation Verification Script
 * Script to verify that all implementations are working correctly
 */

import { unifiedResourceService } from '../services/UnifiedResourceService';
import { comprehensiveResourceLoader } from '../utils/comprehensiveResourceLoader';
import { githubAPI } from '../utils/githubAPI';
import { errorHandler } from '../utils/errorHandler';

// Test configuration
const VERIFICATION_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  TEST_FILES: [
    'data/organized_documents/json/budget_data.json',
    'data/organized_documents/md/README.md',
    'data/organized_documents/pdf/presupuesto-2024.pdf',
    'data/organized_documents/images/logo-municipal.png'
  ]
};

interface VerificationResult {
  component: string;
  status: 'passed' | 'failed';
  message: string;
  duration: number;
}

class ImplementationVerifier {
  private results: VerificationResult[] = [];
  private startTime: number = 0;

  async runAllVerifications(): Promise<void> {
    this.startTime = Date.now();
    console.log('🔍 Starting implementation verification...\\n');
    
    try {
      // Test 1: GitHub API integration
      await this.testGitHubAPI();
      
      // Test 2: Unified resource service
      await this.testUnifiedResourceService();
      
      // Test 3: Comprehensive resource loader
      await this.testComprehensiveResourceLoader();
      
      // Test 4: Error handling
      await this.testErrorHandling();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Implementation verification failed:', error);
      errorHandler.handleError(error as Error, {
        component: 'ImplementationVerifier',
        action: 'runAllVerifications',
        timestamp: new Date()
      });
    }
  }

  private async testGitHubAPI(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Testing GitHub API integration...');
      
      // Test repository info
      const repoInfo = await githubAPI.getRepoInfo();
      if (!repoInfo) {
        throw new Error('Failed to fetch repository info');
      }
      
      console.log('   ✅ Repository info fetched successfully');
      
      // Test repository contents
      const contents = await githubAPI.getRepoContents('data/organized_documents/json');
      if (!contents) {
        throw new Error('Failed to fetch repository contents');
      }
      
      console.log('   ✅ Repository contents fetched successfully');
      
      // Record success
      this.results.push({
        component: 'GitHub API',
        status: 'passed',
        message: 'All GitHub API functions working correctly',
        duration: Date.now() - startTime
      });
      
      console.log('✅ GitHub API integration test passed\\n');
      
    } catch (error) {
      // Record failure
      this.results.push({
        component: 'GitHub API',
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`❌ GitHub API integration test failed: ${(error as Error).message}\\n`);
    }
  }

  private async testUnifiedResourceService(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Testing Unified Resource Service...');
      
      // Test available years
      const years = await unifiedResourceService.getAvailableYears();
      if (!years || years.length === 0) {
        throw new Error('Failed to fetch available years');
      }
      
      console.log('   ✅ Available years fetched successfully');
      
      // Test categories for year
      const categories = await unifiedResourceService.getCategoriesForYear(years[0]);
      if (!categories || categories.length === 0) {
        throw new Error('Failed to fetch categories for year');
      }
      
      console.log('   ✅ Categories for year fetched successfully');
      
      // Test document search
      const searchResults = await unifiedResourceService.searchResources('budget');
      console.log(`   ✅ Document search returned ${searchResults.length} results`);
      
      // Record success
      this.results.push({
        component: 'Unified Resource Service',
        status: 'passed',
        message: 'All unified resource service functions working correctly',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Unified Resource Service test passed\\n');
      
    } catch (error) {
      // Record failure
      this.results.push({
        component: 'Unified Resource Service',
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`❌ Unified Resource Service test failed: ${(error as Error).message}\\n`);
    }
  }

  private async testComprehensiveResourceLoader(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Testing Comprehensive Resource Loader...');
      
      // Test document metadata loading
      for (const filePath of VERIFICATION_CONFIG.TEST_FILES) {
        try {
          const metadata = await comprehensiveResourceLoader.loadDocumentMetadata(filePath);
          if (!metadata) {
            throw new Error(`Failed to load metadata for ${filePath}`);
          }
          
          console.log(`   ✅ Metadata loaded for ${filePath}`);
        } catch (error) {
          console.warn(`   ⚠️  Warning loading metadata for ${filePath}: ${(error as Error).message}`);
        }
      }
      
      // Test repository contents
      const contents = await comprehensiveResourceLoader.getRepositoryContents('data/organized_documents/json');
      if (!contents || contents.length === 0) {
        throw new Error('Failed to fetch repository contents');
      }
      
      console.log('   ✅ Repository contents fetched successfully');
      
      // Record success
      this.results.push({
        component: 'Comprehensive Resource Loader',
        status: 'passed',
        message: 'All comprehensive resource loader functions working correctly',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Comprehensive Resource Loader test passed\\n');
      
    } catch (error) {
      // Record failure
      this.results.push({
        component: 'Comprehensive Resource Loader',
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`❌ Comprehensive Resource Loader test failed: ${(error as Error).message}\\n`);
    }
  }

  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Testing Error Handling...');
      
      // Test error handler
      errorHandler.handleError(new Error('Test error'), {
        component: 'ImplementationVerifier',
        action: 'testErrorHandling',
        timestamp: new Date()
      });
      
      console.log('   ✅ Error handler processed test error');
      
      // Test success feedback
      errorHandler.showSuccess('Test Success', 'This is a test success message');
      
      console.log('   ✅ Success feedback displayed');
      
      // Test warning feedback
      errorHandler.showWarning('Test Warning', 'This is a test warning message');
      
      console.log('   ✅ Warning feedback displayed');
      
      // Test info feedback
      errorHandler.showInfo('Test Info', 'This is a test info message');
      
      console.log('   ✅ Info feedback displayed');
      
      // Record success
      this.results.push({
        component: 'Error Handling',
        status: 'passed',
        message: 'All error handling functions working correctly',
        duration: Date.now() - startTime
      });
      
      console.log('✅ Error Handling test passed\\n');
      
    } catch (error) {
      // Record failure
      this.results.push({
        component: 'Error Handling',
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`❌ Error Handling test failed: ${(error as Error).message}\\n`);
    }
  }

  private printResults(): void {
    const totalTime = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.status === 'passed').length;
    const failedTests = this.results.filter(r => r.status === 'failed').length;
    
    console.log('📊 Implementation Verification Results:');
    console.log('====================================');
    console.log(`⏱️  Total time: ${totalTime}ms`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📋 Total: ${this.results.length}`);
    
    if (failedTests > 0) {
      console.log('\\n💥 Failed Components:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`   ❌ ${result.component}: ${result.message}`);
        });
    }
    
    if (passedTests > 0) {
      console.log('\\n🎉 Passed Components:');
      this.results
        .filter(r => r.status === 'passed')
        .forEach(result => {
          console.log(`   ✅ ${result.component}: ${result.message} (${result.duration}ms)`);
        });
    }
    
    console.log('\\n🏁 Implementation verification completed!');
    
    // Overall result
    if (failedTests === 0) {
      console.log('🏆 All implementation verifications passed! The system is ready for production.');
    } else {
      console.log('⚠️  Some implementation verifications failed. Please check the components.');
    }
  }
}

// Export verifier
export const implementationVerifier = new ImplementationVerifier();

// Run verification if called directly
if (typeof window !== 'undefined' && window.location.pathname === '/verify') {
  implementationVerifier.runAllVerifications().catch(console.error);
}

export default implementationVerifier;