// Test script to verify data loading from GitHub
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main';

async function testDataLoading() {
  console.log('Testing data loading from GitHub...');

  // Test budget data
  try {
    const budgetResponse = await fetch(`${GITHUB_RAW_BASE}/data/organized_analysis/financial_oversight/budget_analysis/budget_data_2024.json`);
    if (budgetResponse.ok) {
      const budgetData = await budgetResponse.json();
      console.log('Budget data loaded successfully:', budgetData);
    } else {
      console.error('Budget data not found:', budgetResponse.status);
    }
  } catch (error) {
    console.error('Error loading budget data:', error);
  }

  // Test salary data
  try {
    const salaryResponse = await fetch(`${GITHUB_RAW_BASE}/data/organized_analysis/financial_oversight/salary_oversight/salary_data_2024.json`);
    if (salaryResponse.ok) {
      const salaryData = await salaryResponse.json();
      console.log('Salary data loaded successfully:', salaryData);
    } else {
      console.error('Salary data not found:', salaryResponse.status);
    }
  } catch (error) {
    console.error('Error loading salary data:', error);
  }

  // Test comprehensive data index
  try {
    const indexResponse = await fetch(`${GITHUB_RAW_BASE}/frontend/src/data/comprehensive_data_index.json`);
    if (indexResponse.ok) {
      const indexData = await indexResponse.json();
      console.log('Data index loaded successfully:', Object.keys(indexData));
    } else {
      console.error('Data index not found:', indexResponse.status);
    }
  } catch (error) {
    console.error('Error loading data index:', error);
  }
}

// Run the test
testDataLoading();