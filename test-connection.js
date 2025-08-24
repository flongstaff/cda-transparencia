const ApiService = require('./frontend/src/services/ApiService');

async function testConnection() {
  try {
    console.log('Testing API connection...');
    
    // Test property declarations
    console.log('Fetching property declarations...');
    const declarations = await ApiService.getPropertyDeclarations(2024);
    console.log('Property declarations:', declarations.length);
    
    // Test salaries
    console.log('Fetching salaries...');
    const salaries = await ApiService.getSalaries(2024);
    console.log('Salaries:', salaries.length);
    
    console.log('API connection test completed successfully!');
  } catch (error) {
    console.error('API connection test failed:', error.message);
  }
}

testConnection();