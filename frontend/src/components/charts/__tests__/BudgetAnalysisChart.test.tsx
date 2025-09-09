import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BudgetAnalysisChart from '../BudgetAnalysisChart';

// Mock the consolidated API service
const mockBudgetData = {
  total_budgeted: 5000000000,
  total_executed: 4200000000,
  execution_rate: '84.0',
  categories: {
    'Gastos en Personal': {
      budgeted: 2250000000,
      executed: 1900000000,
      execution_rate: '84.4'
    },
    'Servicios no Personales': {
      budgeted: 1250000000,
      executed: 1050000000,
      execution_rate: '84.0'
    },
    'Bienes de Consumo': {
      budgeted: 750000000,
      executed: 630000000,
      execution_rate: '84.0'
    },
    'Transferencias': {
      budgeted: 750000000,
      executed: 620000000,
      execution_rate: '82.7'
    }
  }
};

// Create a query client for testing
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0
      }
    }
  });
};

// Mock the consolidated API service
jest.mock('../../../services/ConsolidatedApiService', () => ({
  consolidatedApiService: {
    getBudgetData: jest.fn().mockResolvedValue(mockBudgetData)
  }
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
    jest.clearAllMocks();
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
    // Mock loading state by making the API call pending
    const mockConsolidatedApiService = require('../../../services/ConsolidatedApiService');
    mockConsolidatedApiService.consolidatedApiService.getBudgetData = jest.fn(() => 
      new Promise(() => {}) // Never resolves
    );
    
    render(<BudgetAnalysisChart year={2024} />, { wrapper });
    
    // Check that loading state is displayed
    expect(screen.getByText('Cargando análisis presupuestario...')).toBeInTheDocument();
  });

  test('handles error state', async () => {
    // Mock error state
    const mockConsolidatedApiService = require('../../../services/ConsolidatedApiService');
    mockConsolidatedApiService.consolidatedApiService.getBudgetData = jest.fn(() => 
      Promise.reject(new Error('Failed to fetch budget data'))
    );
    
    render(<BudgetAnalysisChart year={2024} />, { wrapper });
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los datos presupuestarios')).toBeInTheDocument();
    });
  });

  test('switches between chart types', async () => {
    render(<BudgetAnalysisChart year={2024} />, { wrapper });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Análisis Presupuestario 2024')).toBeInTheDocument();
    });
    
    // Check that bar chart is displayed by default
    expect(screen.getByLabelText('Cambiar a gráfico de barras')).toHaveAttribute('aria-pressed', 'true');
    
    // Switch to pie chart
    const pieButton = screen.getByLabelText('Cambiar a gráfico circular');
    pieButton.click();
    
    // Check that pie chart button is now active
    expect(pieButton).toHaveAttribute('aria-pressed', 'true');
  });
});