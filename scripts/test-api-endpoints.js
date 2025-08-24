// Test API endpoints
const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test root endpoint
    console.log('1. Testing root endpoint...');
    const rootResponse = await axios.get('http://localhost:3002/');
    console.log(`   Status: ${rootResponse.status}`);
    console.log(`   Message: ${rootResponse.data.message}\n`);
    
    // Test declarations endpoint
    console.log('2. Testing declarations endpoint...');
    const declarationsResponse = await axios.get('http://localhost:3002/api/declarations');
    console.log(`   Status: ${declarationsResponse.status}`);
    console.log(`   Data count: ${declarationsResponse.data.length}`);
    if (declarationsResponse.data.length > 0) {
      console.log(`   First item: ${JSON.stringify(declarationsResponse.data[0], null, 2)}
`);
    } else {
      console.log(`   No data found for declarations.
`);
    }
    
    // Test a specific year
    console.log('3. Testing declarations for year 2024...');
    const yearResponse = await axios.get('http://localhost:3002/api/declarations/year/2024');
    console.log(`   Status: ${yearResponse.status}`);
    console.log(`   Data count: ${yearResponse.data.length}
`);
    
    console.log('✅ All API tests passed!');
    
  } catch (error) {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} - ${error.response.statusText}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: Unable to reach the API server');
      console.error('Make sure the backend server is running on port 3002');
      console.error('Error message:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAPI();