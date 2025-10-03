import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { 
  FinancialHealthScoreCard, 
  EnhancedMetricCard, 
  DataVerificationBadge, 
  TransparencyScore,
  FinancialCategoryNavigation
} from './index';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  DollarSign: () => <svg data-testid="dollar-sign-icon" />,
  TrendingUp: () => <svg data-testid="trending-up-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  FileText: () => <svg data-testid="file-text-icon" />,
  PieChart: () => <svg data-testid="pie-chart-icon" />,
  Coins: () => <svg data-testid="coins-icon" />,
  CreditCard: () => <svg data-testid="credit-card-icon" />,
  Briefcase: () => <svg data-testid="briefcase-icon" />,
  Users: () => <svg data-testid="users-icon" />,
  BarChart3: () => <svg data-testid="bar-chart-icon" />,
  Activity: () => <svg data-testid="activity-icon" />,
  Calendar: () => <svg data-testid="calendar-icon" />,
  Globe: () => <svg data-testid="globe-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
  TrendingDown: () => <svg data-testid="trending-down-icon" />,
  AlertTriangle: () => <svg data-testid="alert-triangle-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
  Clock: () => <svg data-testid="clock-icon" />,
  Star: () => <svg data-testid="star-icon" />,
  StarHalf: () => <svg data-testid="star-half-icon" />
}));

describe('UI Components', () => {
  describe('FinancialHealthScoreCard', () => {
    it('renders correctly with required props', () => {
      render(
        <FinancialHealthScoreCard 
          score={85}
          title="Financial Health"
          description="Overall financial health score"
        />
      );
      
      expect(screen.getByText('Financial Health')).toBeInTheDocument();
      expect(screen.getByText('Overall financial health score')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('displays the correct score color', () => {
      render(
        <FinancialHealthScoreCard 
          score={85}
          title="Financial Health"
          description="Overall financial health score"
        />
      );
      
      const scoreElement = screen.getByText('85%');
      expect(scoreElement).toHaveClass('text-green-500');
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      render(
        <FinancialHealthScoreCard 
          score={85}
          title="Financial Health"
          description="Overall financial health score"
          onClick={handleClick}
        />
      );
      
      const card = screen.getByRole('button');
      fireEvent.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('EnhancedMetricCard', () => {
    it('renders correctly with required props', () => {
      // Using a simple SVG element instead of the actual icon component
      const TestIcon = () => <svg data-testid="test-icon" />;
      
      render(
        <EnhancedMetricCard
          title="Budget Execution"
          value="$12.4M"
          description="Total budget executed"
          icon={<TestIcon />}
        />
      );
      
      expect(screen.getByText('Budget Execution')).toBeInTheDocument();
      expect(screen.getByText('$12.4M')).toBeInTheDocument();
      expect(screen.getByText('Total budget executed')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('shows trend indicator when provided', () => {
      const TestIcon = () => <svg data-testid="test-icon" />;
      
      render(
        <EnhancedMetricCard
          title="Budget Execution"
          value="$12.4M"
          description="Total budget executed"
          icon={<TestIcon />}
          trend={{ value: 12, isPositive: true }}
        />
      );
      
      // Check for the presence of the trend container and its elements
      const trendElements = screen.getAllByText(/12|%/, { exact: false });
      expect(trendElements.length).toBeGreaterThan(0);
      
      // Check for the trending up icon
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    });
  });

  describe('DataVerificationBadge', () => {
    it('renders verified status correctly', () => {
      render(
        <DataVerificationBadge 
          status="verified" 
          lastUpdated={new Date('2025-01-15')} 
          source="Integrated System" 
        />
      );
      
      expect(screen.getByText('Verificado')).toBeInTheDocument();
    });

    it('renders processing status correctly', () => {
      render(
        <DataVerificationBadge 
          status="processing" 
          lastUpdated={new Date('2025-01-15')} 
          source="Integrated System" 
        />
      );
      
      expect(screen.getByText('Procesando')).toBeInTheDocument();
    });
  });

  describe('TransparencyScore', () => {
    it('renders correctly with required props', () => {
      render(
        <TransparencyScore 
          score={92}
          totalPossible={100}
          description="Based on documents published"
          lastAudit={new Date('2025-01-15')}
        />
      );
      
      expect(screen.getByText('92/100')).toBeInTheDocument();
      expect(screen.getByText('Based on documents published')).toBeInTheDocument();
    });
  });

  describe('FinancialCategoryNavigation', () => {
    const mockCategories = [
      { id: 'all', name: 'All' },
      { id: 'budget', name: 'Budget' },
      { id: 'revenue', name: 'Revenue' },
      { id: 'expenses', name: 'Expenses' }
    ];

    it('renders categories correctly', () => {
      render(
        <FinancialCategoryNavigation 
          categories={mockCategories}
          activeCategory="all"
          onCategoryChange={() => {}}
        />
      );
      
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Budget')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Expenses')).toBeInTheDocument();
    });
  });
});