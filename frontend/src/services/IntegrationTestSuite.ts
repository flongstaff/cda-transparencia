/**
 * Integration Tests for Carmen de Areco Transparency Portal
 * Tests all the integrations between components and services
 */

import { externalAPIsService } from '../services/ExternalAPIsService';
import { carmenScraperService } from '../services/CarmenScraperService';
import { dataAuditService } from '../services/DataAuditService';

class IntegrationTestSuite {
  static async runAllTests(): Promise<{ 
    passed: number; 
    failed: number; 
    results: Array<{ name: string; status: 'pass' | 'fail'; details: string }> 
  }> {
    const results: Array<{ name: string; status: 'pass' | 'fail'; details: string }> = [];
    let passed = 0;
    let failed = 0;

    console.log('Starting integration tests...\n');

    // Test 1: External APIs Service
    const externalApiTest = await this.testExternalApiService();
    results.push(externalApiTest);
    if (externalApiTest.status === 'pass') passed++; else failed++;
    console.log(`${externalApiTest.status === 'pass' ? '✅' : '❌'} ${externalApiTest.name}: ${externalApiTest.details}\n`);

    // Test 2: Carmen Scraper Service
    const carmenScraperTest = await this.testCarmenScraperService();
    results.push(carmenScraperTest);
    if (carmenScraperTest.status === 'pass') passed++; else failed++;
    console.log(`${carmenScraperTest.status === 'pass' ? '✅' : '❌'} ${carmenScraperTest.name}: ${carmenScraperTest.details}\n`);

    // Test 3: Data Audit Service
    const dataAuditTest = await this.testDataAuditService();
    results.push(dataAuditTest);
    if (dataAuditTest.status === 'pass') passed++; else failed++;
    console.log(`${dataAuditTest.status === 'pass' ? '✅' : '❌'} ${dataAuditTest.name}: ${dataAuditTest.details}\n`);

    // Test 4: Data Comparison
    const dataComparisonTest = await this.testDataComparison();
    results.push(dataComparisonTest);
    if (dataComparisonTest.status === 'pass') passed++; else failed++;
    console.log(`${dataComparisonTest.status === 'pass' ? '✅' : '❌'} ${dataComparisonTest.name}: ${dataComparisonTest.details}\n`);

    // Test 5: Integration between Carmen Scraper and External APIs
    const integrationTest = await this.testCarmenScraperExternalApiIntegration();
    results.push(integrationTest);
    if (integrationTest.status === 'pass') passed++; else failed++;
    console.log(`${integrationTest.status === 'pass' ? '✅' : '❌'} ${integrationTest.name}: ${integrationTest.details}\n`);

    console.log(`\nIntegration Tests Summary: ${passed} passed, ${failed} failed`);
    
    return { passed, failed, results };
  }

  private static async testExternalApiService(): Promise<{ name: string; status: 'pass' | 'fail'; details: string }> {
    try {
      // Test a simple external API call
      const result = await externalAPIsService.getCarmenDeArecoData();
      
      if (result.success) {
        return {
          name: 'External APIs Service Connection',
          status: 'pass',
          details: 'Successfully connected to Carmen de Areco data via proxy'
        };
      } else {
        return {
          name: 'External APIs Service Connection',
          status: 'fail',
          details: `Failed to connect to Carmen de Areco data: ${result.error || 'Unknown error'}`
        };
      }
    } catch (error) {
      return {
        name: 'External APIs Service Connection',
        status: 'fail',
        details: `Error testing External APIs Service: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testCarmenScraperService(): Promise<{ name: string; status: 'pass' | 'fail'; details: string }> {
    try {
      // Test Carmen scraper service
      const result = await carmenScraperService.fetchAllCarmenData();
      
      if (result.success) {
        return {
          name: 'Carmen Scraper Service Connection',
          status: 'pass',
          details: `Successfully fetched data from ${result.summary.sourcesActive.length} Carmen data sources`
        };
      } else {
        return {
          name: 'Carmen Scraper Service Connection',
          status: 'fail',
          details: `Failed to fetch Carmen data: ${result.error || 'Unknown error'}`
        };
      }
    } catch (error) {
      return {
        name: 'Carmen Scraper Service Connection',
        status: 'fail',
        details: `Error testing Carmen Scraper Service: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testDataAuditService(): Promise<{ name: string; status: 'pass' | 'fail'; details: string }> {
    try {
      // Test Data Audit Service
      const summary = await dataAuditService.generateAuditSummary();
      
      return {
        name: 'Data Audit Service Functionality',
        status: 'pass',
        details: `Audit summary generated successfully with ${summary.totalAudits} audits`
      };
    } catch (error) {
      return {
        name: 'Data Audit Service Functionality',
        status: 'fail',
        details: `Error testing Data Audit Service: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testDataComparison(): Promise<{ name: string; status: 'pass' | 'fail'; details: string }> {
    try {
      // Test basic data comparison by comparing two simple datasets
      const datasetA = [
        { id: 1, name: 'Budget 2023', amount: 1000000 },
        { id: 2, name: 'Budget 2024', amount: 1100000 }
      ];
      
      const datasetB = [
        { id: 1, name: 'Budget 2023', amount: 1000000 },
        { id: 2, name: 'Budget 2024', amount: 1150000 } // Different amount
      ];
      
      const comparison = await dataAuditService.compareDataSources(
        datasetA,
        datasetB,
        'Dataset A',
        'Dataset B'
      );
      
      // Check that it found the difference (amount of 1100000 vs 1150000)
      const differences = comparison.discrepancies.filter((d: any) => d.field === 'amount' || d.field === undefined);
      
      if (differences.length > 0) {
        return {
          name: 'Data Comparison Functionality',
          status: 'pass',
          details: `Successfully detected ${differences.length} differences between datasets`
        };
      } else {
        return {
          name: 'Data Comparison Functionality',
          status: 'fail',
          details: 'Failed to detect expected differences between datasets'
        };
      }
    } catch (error) {
      return {
        name: 'Data Comparison Functionality',
        status: 'fail',
        details: `Error testing Data Comparison: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testCarmenScraperExternalApiIntegration(): Promise<{ name: string; status: 'pass' | 'fail'; details: string }> {
    try {
      // Fetch data from both services
      const [carmenScraperData, externalApiData] = await Promise.all([
        carmenScraperService.fetchAllCarmenData(),
        externalAPIsService.getCarmenDeArecoData()
      ]);
      
      if (carmenScraperData.success && externalApiData.success) {
        return {
          name: 'Carmen Scraper - External API Integration',
          status: 'pass',
          details: 'Successfully fetched data from both Carmen Scraper and External APIs'
        };
      } else {
        const errors = [
          carmenScraperData.success ? null : 'Carmen Scraper failed',
          externalApiData.success ? null : 'External APIs failed'
        ].filter(Boolean).join('; ');
        
        return {
          name: 'Carmen Scraper - External API Integration',
          status: 'fail',
          details: errors
        };
      }
    } catch (error) {
      return {
        name: 'Carmen Scraper - External API Integration',
        status: 'fail',
        details: `Error testing integration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  // Only run if we're in a browser or Node environment
  console.log('Running integration tests...\n');
  IntegrationTestSuite.runAllTests().then(results => {
    console.log('\nFinal test results:', results);
  });
}

export { IntegrationTestSuite };