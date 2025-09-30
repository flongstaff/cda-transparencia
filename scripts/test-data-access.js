const fs = require('fs');
const path = require('path');

/**
 * Test script to verify that the frontend can properly access our generated data
 */

async function testDataAccess() {
  console.log('🧪 Testing data access for frontend services...');
  
  const baseDir = path.join(__dirname, '../frontend/public/data/consolidated');
  
  // Check if the base directory exists
  if (!fs.existsSync(baseDir)) {
    console.error('❌ Base consolidated data directory does not exist');
    return;
  }
  
  // Get all year directories
  const yearDirs = fs.readdirSync(baseDir).filter(item => {
    return fs.statSync(path.join(baseDir, item)).isDirectory() && 
           /^\d{4}$/.test(item);
  }).sort();
  
  console.log(`📅 Found ${yearDirs.length} years of data:`, yearDirs);
  
  // Test each year
  for (const year of yearDirs) {
    const yearDir = path.join(baseDir, year);
    
    // Check if all required files exist
    const requiredFiles = [
      'budget.json',
      'contracts.json',
      'salaries.json',
      'documents.json',
      'treasury.json',
      'debt.json',
      'summary.json'
    ];
    
    let allFilesExist = true;
    
    for (const file of requiredFiles) {
      const filePath = path.join(yearDir, file);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Missing file for ${year}: ${file}`);
        allFilesExist = false;
      }
    }
    
    if (!allFilesExist) {
      console.log(`❌ Year ${year} is missing required files`);
      continue;
    }
    
    // Test loading a few key files to verify data integrity
    try {
      const budgetData = JSON.parse(fs.readFileSync(path.join(yearDir, 'budget.json'), 'utf8'));
      const summaryData = JSON.parse(fs.readFileSync(path.join(yearDir, 'summary.json'), 'utf8'));
      
      // Verify key data points
      if (!budgetData.year || !budgetData.total_budget || !budgetData.total_executed) {
        console.log(`❌ Year ${year} budget data is missing key fields`);
        continue;
      }
      
      if (!summaryData.year || !summaryData.financial_overview) {
        console.log(`❌ Year ${year} summary data is missing key fields`);
        continue;
      }
      
      console.log(`✅ Year ${year}: Budget $${(budgetData.total_budget/1000000).toFixed(1)}M, Execution Rate ${budgetData.execution_rate}%`);
      
    } catch (error) {
      console.log(`❌ Error reading data for year ${year}:`, error.message);
      continue;
    }
  }
  
  console.log('✅ Data access test complete!');
  
  // Test the index file
  const indexFile = path.join(baseDir, 'index.json');
  if (fs.existsSync(indexFile)) {
    try {
      const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
      console.log(`📋 Index file found with ${indexData.available_years.length} years available`);
      console.log(`   Latest year: ${indexData.latest_year}`);
      console.log(`   Earliest year: ${indexData.earliest_year}`);
    } catch (error) {
      console.log('⚠️  Error reading index file:', error.message);
    }
  } else {
    console.log('⚠️  Index file not found');
  }
}

// Run the test
testDataAccess();