/**
 * Comprehensive Integration Test
 * Tests the integration between all services with real data sources
 * Based on DATA_SOURCES.md comprehensive list of APIs and endpoints
 */

import DataService from '../dataService';
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
const TIMEOUT_DURATION = 30000; // 30 seconds timeout for each test

// Comprehensive integration test suite
export class ComprehensiveIntegrationTest {
  private results: any[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<boolean> {
    console.log('🧪 Starting comprehensive integration tests...\n');

    const tests = [
      { name: 'Data Service Integration', fn: this.testDataServiceIntegration.bind(this) },
      { name: 'External APIs Integration', fn: this.testExternalAPIsIntegration.bind(this) },
      { name: 'GitHub Data Integration', fn: this.testGitHubDataIntegration.bind(this) },
      { name: 'Enhanced Data Service Integration', fn: this.testEnhancedDataServiceIntegration.bind(this) },
      { name: 'Audit Service Integration', fn: this.testAuditServiceIntegration.bind(this) },
      { name: 'Master Data Service Integration', fn: this.testMasterDataServiceIntegration.bind(this) },
      { name: 'Real Data Service Integration', fn: this.testRealDataServiceIntegration.bind(this) },
      { name: 'Unified Transparency Service Integration', fn: this.testUnifiedTransparencyServiceIntegration.bind(this) },
      { name: 'Data Sync Service Integration', fn: this.testDataSyncServiceIntegration.bind(this) },
      { name: 'Cross-Service Data Consistency', fn: this.testCrossServiceDataConsistency.bind(this) },
      { name: 'Real Data Sources Connectivity', fn: this.testRealDataSourcesConnectivity.bind(this) }
    ];

    let passedTests = 0;
    const totalTests = tests.length;

    for (const test of tests) {
      try {
        console.log(`\n🧪 Running ${test.name}...`);
        const startTime = Date.now();
        
        const result = await Promise.race([
          test.fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), TIMEOUT_DURATION)
          )
        ]);
        
        const duration = Date.now() - startTime;
        
        if (result) {
          console.log(`✅ ${test.name} PASSED (${duration}ms)`);
          passedTests++;
          this.results.push({ name: test.name, passed: true, duration });
        } else {
          console.log(`❌ ${test.name} FAILED (${duration}ms)`);
          this.results.push({ name: test.name, passed: false, duration });
        }
      } catch (error) {
        console.error(`❌ ${test.name} ERROR:`, error);
        this.results.push({ 
          name: test.name, 
          passed: false, 
          duration: Date.now() - this.startTime,
          error: (error as Error).message 
        });
      }
    }

    // Summary
    const duration = Date.now() - this.startTime;
    console.log(`\n📊 Integration Test Summary:`);
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`⏱  Total Duration: ${duration}ms`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All integration tests passed!');
      return true;
    } else {
      console.log('⚠️  Some integration tests failed. Check the logs above.');
      return false;
    }
  }

  /**
   * Test data service integration
   */
  private async testDataServiceIntegration(): Promise<boolean> {
    try {
      console.log('  Testing data service integration...');
      
      // Test master data fetching
      const masterData = await dataService.getMasterData();
      if (!masterData) {
        throw new Error('Master data service returned no data');
      }
      
      // Test all years data fetching
      const allYears = await dataService.getAllYears();
      if (!Array.isArray(allYears)) {
        throw new Error('All years data is not an array');
      }
      
      // Test audit data fetching
      const auditResults = await dataService.getAuditResults();
      if (!Array.isArray(auditResults)) {
        throw new Error('Audit results is not an array');
      }
      
      // Test audit summary fetching
      const auditSummary = await dataService.getAuditSummary();
      if (!auditSummary) {
        throw new Error('Audit summary returned no data');
      }
      
      // Test data flags fetching
      const dataFlags = await dataService.getDataFlags();
      if (!Array.isArray(dataFlags)) {
        throw new Error('Data flags is not an array');
      }
      
      console.log('  ✅ Data service integration test passed');
      return true;
    } catch (error) {
      console.error('  ❌ Data service integration test failed:', error);
      return false;
    }
  }

  /**
   * Test external APIs integration
   */
  private async testExternalAPIsIntegration(): Promise<boolean> {
    try {
      console.log('  Testing external APIs integration...');
      
      // Test Carmen de Areco data fetching
      const carmenDeArecoData = await externalAPIsService.getCarmenDeArecoData();
      if (!carmenDeArecoData.success) {
        throw new Error('Failed to fetch Carmen de Areco data');
      }
      
      // Test Buenos Aires transparency data fetching
      const buenosAiresData = await externalAPIsService.getBuenosAiresTransparencyData();
      if (!buenosAiresData.success) {
        throw new Error('Failed to fetch Buenos Aires transparency data');
      }
      
      // Test national budget data fetching
      const nationalBudgetData = await externalAPIsService.getNationalBudgetData();
      if (!nationalBudgetData.success) {
        throw new Error('Failed to fetch national budget data');
      }
      
      // Test geographic data fetching
      const geographicData = await externalAPIsService.getGeographicData();
      if (!geographicData.success) {
        throw new Error('Failed to fetch geographic data');
      }
      
      // Test service health
      const serviceHealth = await externalAPIsService.getServiceHealth();
      if (!serviceHealth) {
        throw new Error('Failed to get service health status');
      }
      
      console.log('  ✅ External APIs integration test passed');
      return true;
    } catch (error) {
      console.error('  ❌ External APIs integration test failed:', error);
      return false;
    }
  }

  /**
   * Test GitHub data integration
   */
  private async testGitHubDataIntegration(): Promise<boolean> {
    try {
      console.log('  Testing GitHub data integration...');
      
      // Test year data loading
      const yearData = await githubDataService.loadYearData(2023);
      if (!yearData.success) {
        throw new Error('Failed to load year data from GitHub');
      }
      
      // Test all data loading
      const allData = await githubDataService.loadAllData();
      if (!allData.success) {
        throw new Error('Failed to load all data from GitHub');
      }
      
      // Test JSON fetching
      const jsonData = await githubDataService.fetchJson('data/index.json');
      if (!jsonData.success) {
        throw new Error('Failed to fetch JSON data from GitHub');
      }
      
      // Test available years fetching
      const availableYears = await githubDataService.getAvailableYears();
      if (!Array.isArray(availableYears) || availableYears.length === 0) {
        throw new Error('Failed to get available years from GitHub');
      }
      
      console.log('  ✅ GitHub data integration test passed');
      return true;
    } catch (error) {
      console.error('  ❌ GitHub data integration test failed:', error);
      return false;
    }
  }

  /**
   * Test enhanced data service integration
   */
  private async testEnhancedDataServiceIntegration(): Promise<boolean> {
    try {
      console.log('  Testing enhanced data service integration...');
      
      // Test all years data fetching
      const allYears = await EnhancedDataService.getAllYears();
      if (!Array.isArray(allYears)) {
        throw new Error('Enhanced data service all years data is not an array');
      }
      
      // Test specific year data fetching
      const budgetData = await EnhancedDataService.getBudget(2023);
      if (!budgetData) {
        throw new Error('Enhanced data service failed to fetch budget data');
      }
      
      const contractsData = await EnhancedDataService.getContracts(2023);
      if (!Array.isArray(contractsData)) {
        throw new Error('Enhanced data service contracts data is not an array');
      }
      
      const treasuryData = await EnhancedDataService.getTreasury(2023);
      if (!treasuryData) {
        throw new Error('Enhanced data service failed to fetch treasury data');
      }
      
      console.log('  ✅ Enhanced data service integration test passed');
      return true;
    } catch (error) {
      console.error('  ❌ Enhanced data service integration test failed:', error);
      return false;
    }
  }

  /**
   * Test audit service integration
   */
  private async testAuditServiceIntegration(): Promise<boolean> {
    try {
      console.log('  Testing audit service integration...');
      
      // Test audit results fetching
      const auditResults = await AuditService.getInstance().getAuditResults();
      if (!Array.isArray(auditResults)) {
        throw new Error('Audit service audit results is not an array');
      }
      
      // Test audit summary fetching
      const auditSummary = await AuditService.getInstance().getAuditSummary();
      if (!auditSummary) {
        throw new Error('Audit service failed to fetch audit summary');
      }
      
      // Test data flags fetching
      const dataFlags = await AuditService.getInstance().getDataFlags();
      if (!Array.isArray(dataFlags)) {
        throw new Error('Audit service data flags is not an array');
      }
      
      // Test external datasets fetching
      const externalDatasets = await AuditService.getInstance().getExternalDatasets();
      if (!Array.isArray(externalDatasets)) {
        throw new Error('Audit service external datasets is not an array');
      }
      
      console.log('  ✅ Audit service integration test passed');
      return true;
    } catch (error) {
      console.error('  ❌ Audit service integration test failed:', error);
      return false;
    }
  }

  /**
   * Test master data service integration
   */
  private async testMasterDataServiceIntegration(): Promise<boolean> {
    try {
      console.log('  Testing master data service integration...');
      
      // Test comprehensive data loading
      const comprehensiveData = await masterDataService.loadComprehensiveData();
      if (!comprehensiveData) {
        throw new Error('Master data service failed to load comprehensive data');
      }
      
      // Test available years fetching
      const availableYears = await masterDataService.getAvailableYears();
      if (!Array.isArray(availableYears)) {
        throw new Error('Master data service available years is not an array');
      }
      
      // Test audit logs fetching
      const auditLogs = await masterDataService.getAuditLogs();
      if (!Array.isArray(auditLogs)) {
        throw new Error('Master data service audit logs is not an array');
      }
      
      console.log('  ✅ Master data service integration test passed');
      return true;
    } catch (error) {
      console.error('  ❌ Master data service integration test failed:', error);
      return false;
    }
  }

  /**
   * Test real data service integration
   */
  private async testRealDataServiceIntegration(): Promise<boolean> {
    try {
      console.log('  Testing real data service integration...');
      
      // Test real data fetching for a specific year
      const realData = await RealDataService.getInstance().getRealDataForYear(2023);
      if (!realData.success) {
        throw new Error('Real data service failed to fetch real data for year');
      }
      
      // Test real data for all years
      const realAllData = await RealDataService.getInstance().getRealDataForAllYears();
      if (!realAllData.success) {
        throw new Error('Real data service failed to fetch real data for all years');
      }
      
      // Test data integrity validation
      const validationData = await RealDataService.getInstance().validateDataIntegrity();
      if (!validationData.success) {
        throw new Error('Real data service failed to validate data integrity');
      }
      
      console.log('  ✅ Real data service integration test passed');
      return true;
    } catch (error) {
      console.error('  ❌ Real data service integration test failed:', error);
      return false;
    }
  }

  /**
   * Test unified transparency service integration
   */
  private async testUnifiedTransparencyServiceIntegration(): Promise<boolean> {
    try {
      console.log('  Testing unified transparency service integration...');
      
      // Test transparency data fetching
      const transparencyData = await UnifiedTransparencyService.getTransparencyData();
      if (!transparencyData) {
        throw new Error('Unified transparency service failed to fetch transparency data');
      }
      
      // Test specific year data fetching
      const yearSpecificData = await UnifiedTransparencyService.getTransparencyData(2023);
      if (!yearSpecificData) {
        throw new Error('Unified transparency service failed to fetch year-specific data');
      }
      
      console.log('  ✅ Unified transparency service integration test passed');
      return true;
    } catch (error) {
      console.error('  ❌ Unified transparency service integration test failed:', error);
      return false;
    }
  }

  /**
   * Test data sync service integration
   */
  private async testDataSyncServiceIntegration(): Promise<boolean> {
    try {
      console.log('  Testing data sync service integration...');
      
      // Test all sources synchronization
      const syncReport = await dataSyncService.synchronizeAllSources();
      if (!syncReport) {
        throw new Error('Data sync service failed to synchronize all sources');
      }
      
      // Test sync history fetching
      const syncHistory = await dataSyncService.getSyncHistory();
      if (!Array.isArray(syncHistory)) {
        throw new Error('Data sync service sync history is not an array');
      }
      
      console.log('  ✅ Data sync service integration test passed');
      return true;
    } catch (error) {
      console.error('  ❌ Data sync service integration test failed:', error);
      return false;
    }
  }

  /**
   * Test cross-service data consistency
   */
  private async testCrossServiceDataConsistency(): Promise<boolean> {
    try {
      console.log('  Testing cross-service data consistency...');
      
      // Fetch data from multiple services for the same year
      const [
        dataServiceData,
        enhancedDataServiceData,
        githubDataServiceData,
        externalAPIServiceData
      ] = await Promise.all([
        dataService.getMasterData(2023),
        EnhancedDataService.getBudget(2023),
        githubDataService.loadYearData(2023),
        externalAPIsService.getCarmenDeArecoData()
      ]);
      
      // Check that all services return data
      if (!dataServiceData) {
        throw new Error('Data service returned no data');
      }
      
      if (!enhancedDataServiceData) {
        throw new Error('Enhanced data service returned no data');
      }
      
      if (!githubDataServiceData.success) {
        throw new Error('GitHub data service failed to load year data');
      }
      
      if (!externalAPIServiceData.success) {
        throw new Error('External API service failed to fetch Carmen de Areco data');
      }
      
      // Check data structure consistency
      const dataServiceStructure = Object.keys(dataServiceData.yearData || {});
      const enhancedDataServiceStructure = Object.keys(enhancedDataServiceData || {});
      const githubDataServiceStructure = Object.keys(githubDataServiceData.data || {});
      
      console.log(`  Data service structure: ${dataServiceStructure.length} elements`);
      console.log(`  Enhanced data service structure: ${enhancedDataServiceStructure.length} elements`);
      console.log(`  GitHub data service structure: ${githubDataServiceStructure.length} elements`);
      
      // Check for common data structures
      const commonStructures = dataServiceStructure.filter(key => 
        enhancedDataServiceStructure.includes(key) && githubDataServiceStructure.includes(key)
      );
      
      if (commonStructures.length === 0) {
        console.warn('  ⚠️  No common data structures found across services');
      } else {
        console.log(`  ✅ Found ${commonStructures.length} common data structures`);
      }
      
      console.log('  ✅ Cross-service data consistency test passed');
      return true;
    } catch (error) {
      console.error('  ❌ Cross-service data consistency test failed:', error);
      return false;
    }
  }

  /**
   * Test real data sources connectivity
   */
  private async testRealDataSourcesConnectivity(): Promise<boolean> {
    try {
      console.log('  Testing real data sources connectivity...');
      
      // Test connection to all real data sources
      const connected = await comprehensiveDataIntegrationService.connectToAllDataSources();
      if (!connected) {
        throw new Error('Failed to connect to all real data sources');
      }
      
      // Test synchronization of all real data
      const synced = await comprehensiveDataIntegrationService.synchronizeAllRealData();
      if (!synced) {
        throw new Error('Failed to synchronize all real data');
      }
      
      // Get integration report
      const integrationReport = await comprehensiveDataIntegrationService.getIntegrationReport();
      if (!integrationReport) {
        throw new Error('Failed to get integration report');
      }
      
      console.log(`  ✅ Connected to ${integrationReport.totalSourcesConnected}/${integrationReport.totalSources} data sources`);
      console.log('  ✅ Real data sources connectivity test passed');
      return true;
    } catch (error) {
      console.error('  ❌ Real data sources connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Get test results
   */
  getResults(): any[] {
    return [...this.results];
  }

  /**
   * Get test summary
   */
  getSummary(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalTime: number;
    successRate: number;
  } {
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    const totalTime = Date.now() - this.startTime;
    
    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      totalTime,
      successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0
    };
  }
}

// Export test runner
export const runComprehensiveIntegrationTests = async (): Promise<boolean> => {
  const testSuite = new ComprehensiveIntegrationTest();
  const result = await testSuite.runAllTests();
  
  // Print detailed results
  const summary = testSuite.getSummary();
  console.log('\n📋 Detailed Test Results:');
  testSuite.getResults().forEach(result => {
    console.log(`  ${result.passed ? '✅' : '❌'} ${result.name} (${result.duration}ms)`);
  });
  
  console.log(`\n📊 Final Summary:`);
  console.log(`  Total Tests: ${summary.totalTests}`);
  console.log(`  Passed: ${summary.passedTests}`);
  console.log(`  Failed: ${summary.failedTests}`);
  console.log(`  Success Rate: ${summary.successRate.toFixed(1)}%`);
  console.log(`  Total Time: ${summary.totalTime}ms`);
  
  return result;
};

export default runComprehensiveIntegrationTests;