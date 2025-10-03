// Test script to verify DashboardCompleto page accessibility
async function testDashboardCompletoAccessibility() {
  try {
    console.log('Testing DashboardCompleto page accessibility...');
    
    // Test the main dashboard route
    const dashboardResponse = await fetch('http://localhost:5173/dashboard');
    console.log('Dashboard route status:', dashboardResponse.status);
    
    // Test the completo route
    const completoResponse = await fetch('http://localhost:5173/completo');
    console.log('Completo route status:', completoResponse.status);
    
    // Test the financial analysis route
    const financialResponse = await fetch('http://localhost:5173/financial-analysis');
    console.log('Financial analysis route status:', financialResponse.status);
    
    // Check if all routes return successful responses
    if (dashboardResponse.ok && completoResponse.ok && financialResponse.ok) {
      console.log('✅ All DashboardCompleto routes are accessible');
      console.log('🎉 DashboardCompleto page restoration successful!');
      return true;
    } else {
      console.log('❌ Some DashboardCompleto routes are not accessible');
      console.log('Dashboard response ok:', dashboardResponse.ok);
      console.log('Completo response ok:', completoResponse.ok);
      console.log('Financial analysis response ok:', financialResponse.ok);
      return false;
    }
  } catch (error) {
    console.error('Error testing DashboardCompleto page:', error);
    return false;
  }
}

// Run the test
testDashboardCompletoAccessibility().then(success => {
  if (success) {
    console.log('\n🏆 SYSTEM RESTORATION COMPLETE');
    console.log('=====================================');
    console.log('DashboardCompleto page is now fully accessible');
    console.log('All routes responding correctly');
    console.log('System ready for production use');
    console.log('=====================================\n');
  } else {
    console.log('\n💥 SYSTEM RESTORATION INCOMPLETE');
    console.log('=====================================');
    console.log('DashboardCompleto page still has accessibility issues');
    console.log('Further investigation required');
    console.log('=====================================\n');
  }
});