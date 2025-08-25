// Test script to verify API endpoints
const axios = require('axios');

async function testApiEndpoints() {
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    console.log('Testing API endpoints...\n');
    
    // Test property declarations endpoint
    console.log('1. Testing property declarations endpoint...');
    const declarationsResponse = await axios.get(`${baseUrl}/declarations`);
    console.log(`   Status: ${declarationsResponse.status}`);
    console.log(`   Data count: ${declarationsResponse.data.length}\n`);
    
    // Test salaries endpoint
    console.log('2. Testing salaries endpoint...');
    const salariesResponse = await axios.get(`${baseUrl}/salaries`);
    console.log(`   Status: ${salariesResponse.status}`);
    console.log(`   Data count: ${salariesResponse.data.length}\n`);
    
    // Test public tenders endpoint
    console.log('3. Testing public tenders endpoint...');
    const tendersResponse = await axios.get(`${baseUrl}/tenders`);
    console.log(`   Status: ${tendersResponse.status}`);
    console.log(`   Data count: ${tendersResponse.data.length}\n`);
    
    // Test financial reports endpoint
    console.log('4. Testing financial reports endpoint...');
    const reportsResponse = await axios.get(`${baseUrl}/reports`);
    console.log(`   Status: ${reportsResponse.status}`);
    console.log(`   Data count: ${reportsResponse.data.length}\n`);
    
    // Test treasury movements endpoint
    console.log('5. Testing treasury movements endpoint...');
    const treasuryResponse = await axios.get(`${baseUrl}/treasury`);
    console.log(`   Status: ${treasuryResponse.status}`);
    console.log(`   Data count: ${treasuryResponse.data.length}\n`);
    
    // Test fees and rights endpoint
    console.log('6. Testing fees and rights endpoint...');
    const feesResponse = await axios.get(`${baseUrl}/fees`);
    console.log(`   Status: ${feesResponse.status}`);
    console.log(`   Data count: ${feesResponse.data.length}\n`);
    
    // Test operational expenses endpoint
    console.log('7. Testing operational expenses endpoint...');
    const expensesResponse = await axios.get(`${baseUrl}/expenses`);
    console.log(`   Status: ${expensesResponse.status}`);
    console.log(`   Data count: ${expensesResponse.data.length}\n`);
    
    // Test municipal debt endpoint
    console.log('8. Testing municipal debt endpoint...');
    const debtResponse = await axios.get(`${baseUrl}/debt`);
    console.log(`   Status: ${debtResponse.status}`);
    console.log(`   Data count: ${debtResponse.data.length}\n`);
    
    // Test investments and assets endpoint
    console.log('9. Testing investments and assets endpoint...');
    const investmentsResponse = await axios.get(`${baseUrl}/investments`);
    console.log(`   Status: ${investmentsResponse.status}`);
    console.log(`   Data count: ${investmentsResponse.data.length}\n`);
    
    // Test financial indicators endpoint
    console.log('10. Testing financial indicators endpoint...');
    const indicatorsResponse = await axios.get(`${baseUrl}/indicators`);
    console.log(`    Status: ${indicatorsResponse.status}`);
    console.log(`    Data count: ${indicatorsResponse.data.length}\n`);
    
    console.log('✅ All API endpoints tested successfully!');
    
  } catch (error) {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} - ${error.response.statusText}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: Unable to reach the API server');
      console.error('Make sure the backend server is running on port 3000');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run the test script
if (require.main === module) {
  testApiEndpoints();
}

module.exports = testApiEndpoints;