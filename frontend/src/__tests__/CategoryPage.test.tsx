import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryPage from '../pages/CategoryPage';

// Mock the necessary modules
jest.mock('../services/ConsolidatedApiService', () => ({
  consolidatedApiService: {
    getAvailableYears: jest.fn().mockResolvedValue([2023, 2022, 2021]),
    getDocuments: jest.fn().mockResolvedValue([]),
    getBudgetData: jest.fn().mockResolvedValue({
      budgeted: 1000000,
      executed: 800000,
      execution_rate: 80,
      category_breakdown: []
    })
  }
}));

jest.mock('../components/ValidatedChart', () => {
  return function MockValidatedChart() {
    return <div data-testid="validated-chart">Chart Component</div>;
  };
});

jest.mock('../components/DocumentViewer', () => {
  return function MockDocumentViewer() {
    return <div>Document Viewer Component</div>;
  };
});

jest.mock('../components/PageYearSelector', () => {
  return function MockPageYearSelector() {
    return <div>Year Selector Component</div>;
  };
});

describe('CategoryPage', () => {
  test('renders with default props', () => {
    render(<CategoryPage />);
    
    // Check that the default title is rendered
    expect(screen.getByText('Presupuesto')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
  });

  test('renders with custom props', () => {
    render(<CategoryPage category="expenses" title="Gastos" icon="💸" />);
    
    // Check that the custom title is rendered
    expect(screen.getByText('Gastos')).toBeInTheDocument();
    expect(screen.getByText('💸')).toBeInTheDocument();
  });
});