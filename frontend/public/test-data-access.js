// Simple script to test data access
async function testLocalDataAccess() {
  console.log('Testing local data access...');
  
  const testFiles = [
    '/data/organized_analysis/financial_oversight/budget_analysis/budget_data_2024.json',
    '/data/organized_analysis/financial_oversight/salary_oversight/salary_data_2024.json',
    '/data/organized_analysis/financial_oversight/debt_monitoring/debt_data_2024.json'
  ];

  for (const file of testFiles) {
    try {
      console.log(`Attempting to fetch: ${file}`);
      const response = await fetch(file);
      if (response.ok) {
        const data = await response.json();
        console.log(`✓ Successfully loaded ${file}`);
        console.log(`  Data sample:`, JSON.stringify(data).substring(0, 100) + '...');
      } else {
        console.log(`✗ Failed to load ${file}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`✗ Error loading ${file}: ${error.message}`);
    }
  }
}

// Run the test
testLocalDataAccess();