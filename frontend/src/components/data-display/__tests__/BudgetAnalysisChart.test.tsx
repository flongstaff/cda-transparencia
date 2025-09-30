import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BudgetAnalysisChart from '../../charts/BudgetAnalysisChart';

// Mock the master data service
const mockBudgetData = {
  budget: {
    total_budgeted: 5000000000,
    total_executed: 4200000000,
    execution_rate: '84.0',
    categories: [
      {
        name: 'Gastos en Personal',
        budgeted: 2250000000,
        executed: 1900000000,
        execution_rate: '84.4'
      },
      {
        name: 'Servicios no Personales',
        budgeted: 1250000000,
        executed: 1050000000,
        execution_rate: '84.0'
      },
      {
        name: 'Bienes de Consumo',
        budgeted: 750000000,
        executed: 630000000,
        execution_rate: '84.0'
      },
      {
        name: 'Transferencias',
        budgeted: 750000000,
        executed: 620000000,
        execution_rate: '82.7'
      }
    ]
  }
};

// Create a query client for testing
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  });
};

// Mock the master data service
vi.mock('../../hooks/useMasterData', () => ({
  useMasterData: vi.fn(() => ({
    masterData: mockBudgetData,
    currentBudget: mockBudgetData.budget,
    loading: false,
    error: null
  }))
}));

// Wrapper component with React Query provider
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('BudgetAnalysisChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders budget chart with summary stats', async () => {
    render(<BudgetAnalysisChart year={2024} />, { wrapper });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Análisis Presupuestario 2024')).toBeInTheDocument();
    });
    
    // Check that chart data is displayed
    expect(screen.getByText('Gastos en Personal')).toBeInTheDocument();
    expect(screen.getByText('Servicios no Personales')).toBeInTheDocument();
  });

  test('handles loading state', () => {
    // Mock the useMasterData hook to return loading state
    const useMasterData = vi.fn(() => ({
      masterData: null,
      currentBudget: null,
      loading: true,
      error: null
    }));
    
    vi.doMock('../../hooks/useMasterData', () => ({
      useMasterData
    }));
    
    render(<BudgetAnalysisChart year={2024} />, { wrapper });
    
    // Check that loading state is displayed
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  test('handles error state', async () => {
    // Mock the useMasterData hook to return error state
    const useMasterData = vi.fn(() => ({
      masterData: null,
      currentBudget: null,
      loading: false,
      error: new Error('Failed to fetch budget data')
    }));
    
    vi.doMock('../../hooks/useMasterData', () => ({
      useMasterData
    }));
    
    render(<BudgetAnalysisChart year={2024} />, { wrapper });
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });
  });

  test('switches between chart types', async () => {
    render(<BudgetAnalysisChart year={2024} />, { wrapper });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Análisis Presupuestario 2024')).toBeInTheDocument();
    });
    
    // Check that bar chart is displayed by default
    expect(screen.getByTitle('Vista bar')).toHaveClass('bg-blue-100');
    
    // Switch to pie chart
    const pieButton = screen.getByTitle('Vista pie');
    pieButton.click();
    
    // Check that pie chart button is now active
    expect(pieButton).toHaveClass('bg-blue-100');
  });
});