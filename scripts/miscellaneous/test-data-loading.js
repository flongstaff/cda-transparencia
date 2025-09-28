// Simple test to verify data loading
async function testDataLoading() {
  try {
    console.log('Testing data loading...');
    
    // Test fetching multi_source_report.json
    const response = await fetch('/data/multi_source_report.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully loaded multi_source_report.json');
    console.log('Data structure:', Object.keys(data));
    console.log('Years available:', data.multi_year_summary?.length || 0);
    
    if (data.multi_year_summary) {
      console.log('Sample year data:', data.multi_year_summary[0]);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error loading data:', error);
    throw error;
  }
}

// Run the test
testDataLoading().then(data => {
  console.log('✅ Test completed successfully');
}).catch(error => {
  console.error('❌ Test failed:', error);
});