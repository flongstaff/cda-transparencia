import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import CategoryPage from '../pages/CategoryPage';

// Mock the necessary modules
vi.mock('../services/ConsolidatedApiService', () => ({
  consolidatedApiService: {
    getAvailableYears: vi.fn().mockResolvedValue([2023, 2022, 2021]),
    getDocuments: vi.fn().mockResolvedValue([]),
    getBudgetData: vi.fn().mockResolvedValue({
      budgeted: 1000000,
      executed: 800000,
      execution_rate: 80,
      category_breakdown: []
    })
  }
}));

vi.mock('../components/ValidatedChart', () => ({
  default: () => <div data-testid="validated-chart">Chart Component</div>
}));

vi.mock('../components/DocumentViewer', () => ({
  default: () => <div>Document Viewer Component</div>
}));

vi.mock('../components/PageYearSelector', () => ({
  default: () => <div>Year Selector Component</div>
}));

describe('CategoryPage', () => {
  const queryClient = new QueryClient();

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  test('renders with default props', () => {
    renderWithProviders(<CategoryPage />);
    
    // Check that the default title is rendered
    expect(screen.getByText('Presupuesto')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
  });

  test('renders with custom props', () => {
    renderWithProviders(<CategoryPage category="expenses" title="Gastos" icon="💸" />);
    
    // Check that the custom title is rendered
    expect(screen.getByText('Gastos')).toBeInTheDocument();
    expect(screen.getByText('💸')).toBeInTheDocument();
  });
});