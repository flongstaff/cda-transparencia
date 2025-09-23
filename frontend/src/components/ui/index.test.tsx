import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  FinancialHealthScoreCard, 
  EnhancedMetricCard, 
  DataVerificationBadge, 
  TransparencyScore,
  FinancialCategoryNavigation
} from './index';

describe('UI Component Exports', () => {
  it('exports all components correctly', () => {
    // Test that all components can be imported without errors
    expect(FinancialHealthScoreCard).toBeDefined();
    expect(EnhancedMetricCard).toBeDefined();
    expect(DataVerificationBadge).toBeDefined();
    expect(TransparencyScore).toBeDefined();
    expect(FinancialCategoryNavigation).toBeDefined();
    
    // Test that all components are React components
    expect(typeof FinancialHealthScoreCard).toBe('function');
    expect(typeof EnhancedMetricCard).toBe('function');
    expect(typeof DataVerificationBadge).toBe('function');
    expect(typeof TransparencyScore).toBe('function');
    expect(typeof FinancialCategoryNavigation).toBe('function');
  });
  
  it('renders all components without crashing', () => {
    // Test that all components can render without crashing
    const { container } = render(
      <div>
        <FinancialHealthScoreCard 
          score={85}
          title="Financial Health"
          description="Overall financial health score"
        />
        <EnhancedMetricCard
          title="Budget Execution"
          value="$12.4M"
          description="Total budget executed"
          icon={<div>Icon</div>}
        />
        <DataVerificationBadge 
          status="verified" 
          lastUpdated={new Date()} 
          source="Test Source" 
        />
        <TransparencyScore 
          score={92}
          totalPossible={100}
          description="Based on documents published"
          lastAudit={new Date()}
        />
        <FinancialCategoryNavigation 
          categories={[{ id: 'test', name: 'Test Category' }]}
          activeCategory="test"
          onCategoryChange={() => {}}
        />
      </div>
    );
    
    expect(container).toBeInTheDocument();
  });
});