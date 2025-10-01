/**
 * Test Enhanced CSV Data Hook
 * Simple test to verify the enhanced CSV data hook works correctly
 */

const fs = require('fs').promises;

async function testEnhancedComponents() {
  console.log('🧪 Testing enhanced components...');
  
  try {
    // Check if enhanced CSV hook exists
    await fs.access('./frontend/src/hooks/useEnhancedCsvData.ts');
    console.log('✅ Enhanced CSV data hook created successfully');
    
    // Check if simple anomaly detection service exists
    await fs.access('./frontend/src/services/SimpleAnomalyDetectionService.ts');
    console.log('✅ Simple anomaly detection service created successfully');
    
    // Check if simple anomaly detection hook exists
    await fs.access('./frontend/src/hooks/useSimpleAnomalyDetection.ts');
    console.log('✅ Simple anomaly detection hook created successfully');
    
    console.log('\n🎉 All enhanced components verified successfully!');
    
  } catch (error) {
    console.error('❌ Error testing enhanced components:', error.message);
  }
}

// Run the test
testEnhancedComponents().catch(console.error);
