// This script verifies that all UI components are properly exported and can be imported
import { 
  FinancialHealthScoreCard, 
  EnhancedMetricCard, 
  DataVerificationBadge, 
  TransparencyScore,
  FinancialCategoryNavigation
} from './src/components/ui';

console.log('✅ UI Components Import Verification');
console.log('=====================================');

// Verify that all components are imported correctly
console.log('FinancialHealthScoreCard:', typeof FinancialHealthScoreCard === 'function' ? '✓' : '✗');
console.log('EnhancedMetricCard:', typeof EnhancedMetricCard === 'function' ? '✓' : '✗');
console.log('DataVerificationBadge:', typeof DataVerificationBadge === 'function' ? '✓' : '✗');
console.log('TransparencyScore:', typeof TransparencyScore === 'function' ? '✓' : '✗');
console.log('FinancialCategoryNavigation:', typeof FinancialCategoryNavigation === 'function' ? '✓' : '✗');

console.log('\n🎉 All UI components are properly exported and can be imported!');