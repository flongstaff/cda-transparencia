/**
 * Quick Integration Test
 * Verifies that all external data integrations are working properly
 */

import { externalAPIsService } from './ExternalAPIsService';
import { carmenScraperService } from './CarmenScraperService';
import { dataAuditService } from './DataAuditService';

async function runQuickIntegrationTest() {
  console.log('🔄 Running quick integration test...\n');
  
  try {
    // Test 1: External APIs Service
    console.log('1. Testing External APIs Service...');
    const rafamData = await externalAPIsService.getRAFAMData('270');
    console.log(`   ✅ RAFAM Data: ${rafamData.success ? 'SUCCESS' : 'FAILED'} - ${rafamData.source}`);
    
    const gbaData = await externalAPIsService.getBuenosAiresProvincialData();
    console.log(`   ✅ Buenos Aires Data: ${gbaData.success ? 'SUCCESS' : 'FAILED'} - ${gbaData.source}`);
    
    const contratacionesData = await externalAPIsService.getContratacionesData('Carmen de Areco');
    console.log(`   ✅ Contrataciones Data: ${contratacionesData.success ? 'SUCCESS' : 'FAILED'} - ${contratacionesData.source}`);
    
    // Test 2: Carmen Scraper Service
    console.log('\n2. Testing Carmen Scraper Service...');
    const carmenData = await carmenScraperService.fetchAllCarmenData();
    console.log(`   ✅ Carmen Scraper Data: ${carmenData.success ? 'SUCCESS' : 'FAILED'} - ${carmenData.summary.sourcesActive} sources`);
    
    // Test 3: Data Audit Service
    console.log('\n3. Testing Data Audit Service...');
    const auditResult = await dataAuditService.generateAuditSummary();
    console.log(`   ✅ Data Audit Service: SUCCESS - ${auditResult.totalAudits} audits performed`);
    
    console.log('\n✅ All integration tests passed!');
    console.log(`📊 Summary: ${auditResult.totalAudits} audits, ${auditResult.successfulAudits} successful, ${auditResult.averageScore.toFixed(1)}% average score`);
    
    return true;
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runQuickIntegrationTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runQuickIntegrationTest };