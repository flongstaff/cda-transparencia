/**
 * Development Test Script - Run in browser console to test services
 */

import { runAllTests } from './ProductionTest';

// Run tests when script loads
console.log('🚀 Loading production test script...');

// Add to window for easy access in browser console
(window as any).runProductionTests = async () => {
  console.log('🚀 Starting production tests...');
  try {
    const result = await runAllTests();
    console.log(result ? '✅ All tests passed!' : '❌ Some tests failed');
    return result;
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return false;
  }
};

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode detected, auto-running tests...');
  setTimeout(() => {
    (window as any).runProductionTests();
  }, 2000);
}

export {};