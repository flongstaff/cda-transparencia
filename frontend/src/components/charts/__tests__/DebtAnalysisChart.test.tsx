// Mock the unified data hook
const mockDebtData = {
  debt_data: [
    {
      debt_type: 'Deuda Pública',
      description: 'Bonos municipales',
      amount: 1000000000,
      interest_rate: 8.5,
      due_date: '2025-12-31',
      status: 'active'
    },
    {
      debt_type: 'Deuda Comercial',
      description: 'Proveedores',
      amount: 300000000,
      interest_rate: 12.0,
      due_date: '2024-06-30',
      status: 'active'
    }
  ],
  total_debt: 1300000000,
  average_interest_rate: 9.5,
  long_term_debt: 1000000000,
  short_term_debt: 300000000,
  debt_by_type: {
    'Deuda Pública': 1000000000,
    'Deuda Comercial': 300000000
  },
  metadata: {
    year: 2024,
    last_updated: new Date().toISOString(),
    source: 'mock_data'
  }
};

// Mock the unified data hook
jest.mock('../../hooks/useUnifiedData', () => ({
  useDebtData: jest.fn().mockReturnValue({
    data: mockDebtData,
    isLoading: false,
    error: null,
    refetch: jest.fn()
  }),
  transformDebtData: jest.fn().mockImplementation((data) => data)
}));
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DebtAnalysisChart from './DebtAnalysisChart';


// Wrapper component with React Query provider
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('DebtAnalysisChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders debt chart with summary stats', async () => {
    render(<DebtAnalysisChart year={2024} />, { wrapper });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Análisis de Deuda 2024')).toBeInTheDocument();
    });
    
    // Check that summary stats are displayed
    expect(screen.getByText('$1.3B')).toBeInTheDocument();
    expect(screen.getByText('9.50%')).toBeInTheDocument();
    expect(screen.getByText('$300M')).toBeInTheDocument();
    expect(screen.getByText('$1B')).toBeInTheDocument();
  });

  test('displays debt composition', async () => {
    render(<DebtAnalysisChart year={2024} />, { wrapper });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Deuda Pública')).toBeInTheDocument();
    });
    
    // Check that debt composition is displayed
    expect(screen.getByText('Deuda Pública')).toBeInTheDocument();
    expect(screen.getByText('$1B')).toBeInTheDocument();
    expect(screen.getByText('76.9%')).toBeInTheDocument();
    
    expect(screen.getByText('Deuda Comercial')).toBeInTheDocument();
    expect(screen.getByText('$300M')).toBeInTheDocument();
    expect(screen.getByText('23.1%')).toBeInTheDocument();
  });

  test('handles loading state', () => {
    // Mock loading state by making the API call pending
    const mockConsolidatedApiService = require('../../services/ConsolidatedApiService');
    mockConsolidatedApiService.consolidatedApiService.getMunicipalDebt = jest.fn(() => 
      new Promise(() => {}) // Never resolves
    );
    
    render(<DebtAnalysisChart year={2024} />, { wrapper });
    
    // Check that loading state is displayed
    expect(screen.getByText('Cargando análisis de deuda...')).toBeInTheDocument();
  });

  test('handles error state', async () => {
    // Mock error state
    const mockConsolidatedApiService = require('../../services/ConsolidatedApiService');
    mockConsolidatedApiService.consolidatedApiService.getMunicipalDebt = jest.fn(() => 
      Promise.reject(new Error('Failed to fetch debt data'))
    );
    
    render(<DebtAnalysisChart year={2024} />, { wrapper });
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error al cargar datos de deuda')).toBeInTheDocument();
    });
  });

  test('switches between chart types', async () => {
    render(<DebtAnalysisChart year={2024} />, { wrapper });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Análisis de Deuda 2024')).toBeInTheDocument();
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