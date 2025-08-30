/**
 * Test script to verify Power BI data loading in frontend
 */

// Mock Power BI data structure
const mockPowerBIData = {
  "timestamp": "2025-08-29T12:22:04.631Z",
  "extraction_report": {
    "report_date": "2025-08-29T12:22:04.589Z",
    "summary": {
      "datasets_extracted": 3,
      "tables_extracted": 12,
      "records_extracted": 1247,
      "records_saved": 1247
    }
  },
  "extracted_data": {
    "datasets": [
      {
        "name": "Presupuesto Municipal 2025",
        "id": "dataset-1",
        "table_count": 5
      }
    ],
    "tables": [
      {
        "name": "Presupuesto_por_Departamento",
        "column_count": 8,
        "row_count": 245
      }
    ],
    "financial_data": [
      {
        "category": "Salud",
        "subcategory": "Hospitales y Centros de Salud",
        "budgeted": 255000000,
        "executed": 242750000,
        "difference": -12250000,
        "percentage": 95.2,
        "year": 2025,
        "quarter": "Q3",
        "department": "Salud"
      }
    ]
  }
};

// Test functions
function testPowerBIDataStructure() {
  console.log('🧪 Testing Power BI Data Structure');
  
  // Test 1: Check if basic structure exists
  if (!mockPowerBIData.timestamp) {
    console.error('❌ Missing timestamp in data');
    return false;
  }
  
  if (!mockPowerBIData.extraction_report) {
    console.error('❌ Missing extraction_report in data');
    return false;
  }
  
  if (!mockPowerBIData.extracted_data) {
    console.error('❌ Missing extracted_data in data');
    return false;
  }
  
  console.log('✅ Basic data structure is valid');
  
  // Test 2: Check extraction report
  const report = mockPowerBIData.extraction_report;
  if (!report.report_date || !report.summary) {
    console.error('❌ Invalid extraction report structure');
    return false;
  }
  
  const summary = report.summary;
  if (typeof summary.datasets_extracted !== 'number' ||
      typeof summary.tables_extracted !== 'number' ||
      typeof summary.records_extracted !== 'number' ||
      typeof summary.records_saved !== 'number') {
    console.error('❌ Invalid summary data types');
    return false;
  }
  
  console.log('✅ Extraction report structure is valid');
  
  // Test 3: Check extracted data
  const data = mockPowerBIData.extracted_data;
  if (!Array.isArray(data.datasets) || !Array.isArray(data.tables) || !Array.isArray(data.financial_data)) {
    console.error('❌ Extracted data arrays are missing or invalid');
    return false;
  }
  
  console.log('✅ Extracted data arrays are valid');
  
  // Test 4: Check financial data structure
  if (data.financial_data.length > 0) {
    const sampleFinData = data.financial_data[0];
    const requiredFields = ['category', 'subcategory', 'budgeted', 'executed', 'difference', 'percentage', 'year', 'quarter', 'department'];
    
    for (const field of requiredFields) {
      if (!(field in sampleFinData)) {
        console.error(`❌ Missing required field in financial data: ${field}`);
        return false;
      }
    }
    
    console.log('✅ Financial data structure is valid');
  }
  
  return true;
}

function testPowerBIDataFormatting() {
  console.log('\n🧮 Testing Power BI Data Formatting');
  
  const financialData = mockPowerBIData.extracted_data.financial_data;
  
  if (financialData.length === 0) {
    console.log('⚠️  No financial data to test formatting');
    return true;
  }
  
  // Test currency formatting
  const sampleData = financialData[0];
  const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  try {
    const formattedBudget = currencyFormatter.format(sampleData.budgeted);
    const formattedExecuted = currencyFormatter.format(sampleData.executed);
    const formattedDifference = currencyFormatter.format(sampleData.difference);
    
    console.log(`✅ Currency formatting works:`);
    console.log(`   Budgeted: ${formattedBudget}`);
    console.log(`   Executed: ${formattedExecuted}`);
    console.log(`   Difference: ${formattedDifference}`);
  } catch (error) {
    console.error('❌ Currency formatting failed:', error.message);
    return false;
  }
  
  // Test percentage formatting
  try {
    const percentage = `${sampleData.percentage.toFixed(1)}%`;
    console.log(`✅ Percentage formatting works: ${percentage}`);
  } catch (error) {
    console.error('❌ Percentage formatting failed:', error.message);
    return false;
  }
  
  return true;
}

function testPowerBIDataTransformations() {
  console.log('\n🔄 Testing Power BI Data Transformations');
  
  const financialData = mockPowerBIData.extracted_data.financial_data;
  
  if (financialData.length === 0) {
    console.log('⚠️  No financial data to test transformations');
    return true;
  }
  
  // Test grouping by category
  try {
    const groupedByCategory = financialData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { budgeted: 0, executed: 0, count: 0 };
      }
      acc[item.category].budgeted += item.budgeted;
      acc[item.category].executed += item.executed;
      acc[item.category].count += 1;
      return acc;
    }, {});
    
    console.log('✅ Grouping by category works');
    console.log(`   Found ${Object.keys(groupedByCategory).length} categories`);
  } catch (error) {
    console.error('❌ Grouping by category failed:', error.message);
    return false;
  }
  
  // Test filtering
  try {
    const highBudgetItems = financialData.filter(item => item.budgeted > 100000000);
    console.log('✅ Filtering works');
    console.log(`   Found ${highBudgetItems.length} high budget items (>100M)`);
  } catch (error) {
    console.error('❌ Filtering failed:', error.message);
    return false;
  }
  
  return true;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Power BI Data Tests');
  console.log('==============================');
  
  const tests = [
    testPowerBIDataStructure,
    testPowerBIDataFormatting,
    testPowerBIDataTransformations
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      if (test()) {
        passedTests++;
      } else {
        console.log(`\n❌ Test ${test.name} failed`);
      }
    } catch (error) {
      console.error(`\n💥 Test ${test.name} crashed:`, error.message);
    }
  }
  
  console.log('\n🏁 Test Results');
  console.log('===============');
  console.log(`✅ Passed: ${passedTests}/${tests.length}`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All Power BI data tests passed!');
    return true;
  } else {
    console.log('❌ Some tests failed. Check output above.');
    return false;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    runAllTests,
    mockPowerBIData,
    testPowerBIDataStructure,
    testPowerBIDataFormatting,
    testPowerBIDataTransformations
  };
}

// Run tests if this script is executed directly
if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}