// Test script to verify DashboardCompleto page accessibility
async function testDashboardCompleto() {
  try {
    // Test the main dashboard route
    const dashboardResponse = await fetch('http://localhost:5173/dashboard');
    console.log('Dashboard route status:', dashboardResponse.status);
    
    // Test the completo route
    const completoResponse = await fetch('http://localhost:5173/completo');
    console.log('Completo route status:', completoResponse.status);
    
    // Check if both routes return successful responses
    if (dashboardResponse.ok && completoResponse.ok) {
      console.log('✅ DashboardCompleto page is accessible');
      return true;
    } else {
      console.log('❌ DashboardCompleto page is not accessible');
      return false;
    }
  } catch (error) {
    console.error('Error testing DashboardCompleto page:', error);
    return false;
  }
}

// Run the test
testDashboardCompleto().then(success => {
  if (success) {
    console.log('🎉 DashboardCompleto page fix successful!');
  } else {
    console.log('💥 DashboardCompleto page fix failed.');
  }
});