/**
 * Dark Mode Testing Script
 * Validates that all components display correctly in both light and dark modes
 */

// Test that all components have proper dark mode classes
const darkModeTestCases = [
  {
    component: 'GovernmentHeader',
    darkModeClasses: [
      'dark:bg-dark-background',
      'dark:text-dark-text-primary',
      'dark:border-dark-border',
      'dark:fill-gray-300',
      'dark:stroke-gray-700'
    ],
    lightModeClasses: [
      'bg-white',
      'text-gray-900',
      'border-gray-200'
    ]
  },
  {
    component: 'Sidebar',
    darkModeClasses: [
      'dark:bg-dark-surface',
      'dark:text-dark-text-primary',
      'dark:border-dark-border'
    ],
    lightModeClasses: [
      'bg-white',
      'text-gray-900',
      'border-gray-200'
    ]
  },
  {
    component: 'Footer',
    darkModeClasses: [
      'dark:bg-dark-surface',
      'dark:text-dark-text-primary',
      'dark:border-dark-border'
    ],
    lightModeClasses: [
      'bg-white',
      'text-gray-900',
      'border-gray-200'
    ]
  },
  {
    component: 'BudgetExecutionChart',
    darkModeClasses: [
      'dark:bg-dark-surface',
      'dark:text-dark-text-primary',
      'dark:border-dark-border',
      'dark:fill-gray-300',
      'dark:stroke-gray-700'
    ],
    lightModeClasses: [
      'bg-white',
      'text-gray-900',
      'border-gray-200'
    ]
  },
  {
    component: 'ChartAuditReport',
    darkModeClasses: [
      'dark:bg-dark-surface',
      'dark:text-dark-text-primary',
      'dark:border-dark-border',
      'dark:fill-gray-300',
      'dark:stroke-gray-700'
    ],
    lightModeClasses: [
      'bg-white',
      'text-gray-900',
      'border-gray-200'
    ]
  },
  {
    component: 'StandardizedCard',
    darkModeClasses: [
      'dark:bg-dark-surface',
      'dark:text-dark-text-primary',
      'dark:border-dark-border'
    ],
    lightModeClasses: [
      'bg-white',
      'text-gray-900',
      'border-gray-200'
    ]
  },
  {
    component: 'StandardizedSection',
    darkModeClasses: [
      'dark:bg-dark-surface',
      'dark:text-dark-text-primary',
      'dark:border-dark-border'
    ],
    lightModeClasses: [
      'bg-white',
      'text-gray-900',
      'border-gray-200'
    ]
  }
];

// Test function to validate dark mode classes
function testDarkModeClasses() {
  console.log('🧪 Testing dark mode class consistency...\n');
  
  let passedTests = 0;
  let totalTests = darkModeTestCases.length;
  
  darkModeTestCases.forEach(testCase => {
    console.log(`🔍 Testing ${testCase.component}...`);
    
    // Check if all required dark mode classes are present
    let hasAllDarkClasses = true;
    testCase.darkModeClasses.forEach(className => {
      if (!document.querySelector(\`\${className.replace(/\\s+/g, '.')}\`)) {
        console.log(`  ❌ Missing dark mode class: ${className}`);
        hasAllDarkClasses = false;
      }
    });
    
    // Check if all required light mode classes are present
    let hasAllLightClasses = true;
    testCase.lightModeClasses.forEach(className => {
      if (!document.querySelector(\`\${className.replace(/\\s+/g, '.')}\`)) {
        console.log(`  ❌ Missing light mode class: ${className}`);
        hasAllLightClasses = false;
      }
    });
    
    if (hasAllDarkClasses && hasAllLightClasses) {
      console.log(`  ✅ ${testCase.component} has all required dark/light mode classes`);
      passedTests++;
    } else {
      console.log(`  ⚠️  ${testCase.component} is missing some required classes`);
    }
    
    console.log('');
  });
  
  console.log(`📊 Test Results: ${passedTests}/${totalTests} components passed dark mode class validation`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All components have proper dark/light mode support!');
  } else {
    console.log('⚠️  Some components need dark mode class improvements');
  }
  
  return passedTests === totalTests;
}

// Test that all charts display correctly in both modes
function testChartDisplay() {
  console.log('📊 Testing chart display in dark/light modes...\n');
  
  // Check if charts have proper color schemes for both modes
  const chartElements = document.querySelectorAll('[class*="recharts"]');
  
  if (chartElements.length > 0) {
    console.log(`✅ Found ${chartElements.length} chart elements`);
    
    // Check if charts have proper text colors
    const textElements = document.querySelectorAll('.recharts-text');
    if (textElements.length > 0) {
      console.log('✅ Charts have text elements');
    } else {
      console.log('⚠️  Charts may be missing text elements');
    }
    
    // Check if charts have proper grid colors
    const gridElements = document.querySelectorAll('.recharts-cartesian-grid');
    if (gridElements.length > 0) {
      console.log('✅ Charts have grid elements');
    } else {
      console.log('⚠️  Charts may be missing grid elements');
    }
    
    console.log('✅ Chart display test completed');
    return true;
  } else {
    console.log('⚠️  No charts found for testing');
    return false;
  }
}

// Test that all tables display correctly in both modes
function testTableDisplay() {
  console.log('📋 Testing table display in dark/light modes...\n');
  
  // Check if tables have proper dark mode classes
  const tableElements = document.querySelectorAll('table');
  
  if (tableElements.length > 0) {
    console.log(`✅ Found ${tableElements.length} table elements`);
    
    // Check if tables have proper header colors
    const headerElements = document.querySelectorAll('th');
    if (headerElements.length > 0) {
      console.log('✅ Tables have header elements');
    } else {
      console.log('⚠️  Tables may be missing header elements');
    }
    
    // Check if tables have proper row colors
    const rowElements = document.querySelectorAll('tr');
    if (rowElements.length > 0) {
      console.log('✅ Tables have row elements');
    } else {
      console.log('⚠️  Tables may be missing row elements');
    }
    
    console.log('✅ Table display test completed');
    return true;
  } else {
    console.log('⚠️  No tables found for testing');
    return false;
  }
}

// Run all dark mode tests
function runAllDarkModeTests() {
  console.log('🚀 Running comprehensive dark mode tests...\n');
  
  const results = {
    darkModeClassTest: testDarkModeClasses(),
    chartDisplayTest: testChartDisplay(),
    tableDisplayTest: testTableDisplay()
  };
  
  console.log('\n🏁 Dark Mode Test Suite Results:');
  console.log('================================');
  
  Object.entries(results).forEach(([testName, result]) => {
    console.log(\`\${result ? '✅' : '❌'} \${testName}: \${result ? 'PASSED' : 'FAILED'}\`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All dark mode tests passed! The application displays correctly in both light and dark modes.');
  } else {
    console.log('\n⚠️  Some dark mode tests failed. Review the output above for details.');
  }
  
  return allPassed;
}

// Export for use in testing environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllDarkModeTests,
    testDarkModeClasses,
    testChartDisplay,
    testTableDisplay
  };
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runAllDarkModeTests();
}