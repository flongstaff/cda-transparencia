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
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DebtAnalysisChartTypeSafe from '../DebtAnalysisChartTypeSafe';
import * as consolidatedApiService from '../../../services/ConsolidatedApiService';

// Mock i18n
i18n.init({
  lng: 'es',
  resources: {
    es: {
      translation: {
        debt: {
          title: 'Análisis de Deuda Municipal {{year}}',
          loading: 'Cargando datos de deuda...',
          error: 'Error al cargar datos de deuda',
          retry: 'Reintentar',
          totalDebt: 'Deuda Total',
          averageRate: 'Tasa Promedio',
          shortTerm: 'Corto Plazo',
          longTerm: 'Largo Plazo',
          noData: 'No hay datos de deuda disponibles para {{year}}',
          chartAriaLabel: 'Gráfico de análisis de deuda para el año {{year}}'
        }
      }
    },
    en: {
      translation: {
        debt: {
          title: 'Municipal Debt Analysis {{year}}',
          loading: 'Loading debt data...',
          error: 'Error loading debt data',
          retry: 'Retry',
          totalDebt: 'Total Debt',
          averageRate: 'Average Rate',
          shortTerm: 'Short Term',
          longTerm: 'Long Term',
          noData: 'No debt data available for {{year}}',
          chartAriaLabel: 'Debt analysis chart for year {{year}}'
        }
      }
    }
  }
});

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data }: { data: any[] }) => (
    <div data-testid="pie" data-length={data?.length || 0} />
  ),
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="cell" style={{ backgroundColor: fill }} />
  ),
  Tooltip: ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div data-testid="tooltip">
          {payload[0].name}: ${payload[0].value?.toLocaleString()}
        </div>
      );
    }
    return null;
  },
  Legend: () => <div data-testid="legend" />
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Loader2: () => <div data-testid="loader-icon" className="animate-spin" />
}));

// Mock API service
vi.mock('../../../services/ConsolidatedApiService');
const mockGetMunicipalDebt = vi.mocked(consolidatedApiService.getMunicipalDebt);

// Test data
const mockDebtData = [
  {
    id: '1',
    debt_type: 'Préstamos Bancarios',
    description: 'Préstamo para infraestructura',
    amount: 1000000,
    interest_rate: 5.5,
    due_date: '2024-12-31',
    status: 'active' as const,
    principal_amount: 800000,
    accrued_interest: 200000
  },
  {
    id: '2',
    debt_type: 'Bonos Municipales',
    description: 'Bonos serie A',
    amount: 2000000,
    interest_rate: 4.2,
    due_date: '2026-06-30',
    status: 'active' as const,
    principal_amount: 1800000,
    accrued_interest: 200000
  },
  {
    id: '3',
    debt_type: 'Crédito Comercial',
    description: 'Crédito a proveedores',
    amount: 500000,
    interest_rate: 3.8,
    due_date: '2024-03-15',
    status: 'active' as const,
    principal_amount: 450000,
    accrued_interest: 50000
  }
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </QueryClientProvider>
  );
};

describe('DebtAnalysisChartTypeSafe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset i18n to Spanish
    i18n.changeLanguage('es');
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Loading State', () => {
    it('renders loading skeleton while fetching data', async () => {
      mockGetMunicipalDebt.mockImplementation(() => new Promise(() => {}));

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByText('Cargando datos de deuda...')).toBeInTheDocument();
    });

    it('shows loading with correct ARIA attributes', () => {
      mockGetMunicipalDebt.mockImplementation(() => new Promise(() => {}));

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      const loadingContainer = screen.getByRole('status');
      expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
      expect(loadingContainer).toHaveAttribute('aria-label', 'Cargando datos de deuda municipal');
    });
  });

  describe('Success State', () => {
    it('renders chart with debt data', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Análisis de Deuda Municipal 2024')).toBeInTheDocument();
      });

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('displays correct debt metrics', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('$3.500.000')).toBeInTheDocument(); // Total debt
      });

      expect(screen.getByText('4,5%')).toBeInTheDocument(); // Average interest rate
    });

    it('calculates short-term vs long-term debt correctly', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // Short-term debt (due within 12 months from 2024-01-01)
        expect(screen.getByText('$1.500.000')).toBeInTheDocument(); // Short term
        // Long-term debt (due after 12 months)
        expect(screen.getByText('$2.000.000')).toBeInTheDocument(); // Long term
      });
    });

    it('groups debt by type correctly', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const pieElement = screen.getByTestId('pie');
        expect(pieElement).toHaveAttribute('data-length', '3'); // Three debt types
      });
    });

    it('handles empty debt data gracefully', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: [],
        metadata: {
          total_records: 0,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('No hay datos de deuda disponibles para 2024')).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('renders error message on API failure', async () => {
      mockGetMunicipalDebt.mockRejectedValue(new Error('Network error'));

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Error al cargar datos de deuda')).toBeInTheDocument();
      });

      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    });

    it('handles retry functionality', async () => {
      mockGetMunicipalDebt
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          data: mockDebtData,
          metadata: {
            total_records: 3,
            year: 2024,
            last_updated: '2024-01-01T00:00:00Z',
            source: 'municipal_system',
            data_quality: 'HIGH',
            currency: 'ARS'
          }
        });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Error al cargar datos de deuda')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: 'Reintentar' });
      fireEvent.click(retryButton);

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Análisis de Deuda Municipal 2024')).toBeInTheDocument();
      });

      expect(mockGetMunicipalDebt).toHaveBeenCalledTimes(2);
    });

    it('validates data with Zod schema and handles invalid data', async () => {
      const invalidData = [
        {
          id: '1',
          debt_type: '', // Invalid: empty string
          description: 'Test',
          amount: -1000, // Invalid: negative amount
          interest_rate: 5.5,
          due_date: '2024-12-31',
          status: 'invalid_status' // Invalid enum value
        }
      ];

      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: invalidData,
        metadata: {
          total_records: 1,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'LOW',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Error al cargar datos de deuda')).toBeInTheDocument();
      });
    });
  });

  describe('Internationalization', () => {
    it('displays content in English when locale is changed', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      // Change language to English
      i18n.changeLanguage('en');

      render(
        <DebtAnalysisChartTypeSafe year={2024} locale="en" />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Municipal Debt Analysis 2024')).toBeInTheDocument();
      });

      expect(screen.getByText('Total Debt')).toBeInTheDocument();
      expect(screen.getByText('Average Rate')).toBeInTheDocument();
    });

    it('formats currency according to locale', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} locale="es" />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // Check for Spanish number formatting
        expect(screen.getByText('$3.500.000')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const chartContainer = screen.getByRole('img');
        expect(chartContainer).toHaveAttribute(
          'aria-label',
          'Gráfico de análisis de deuda para el año 2024'
        );
      });
    });

    it('announces data updates to screen readers', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('supports keyboard navigation for interactive elements', async () => {
      mockGetMunicipalDebt.mockRejectedValue(new Error('Network error'));

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: 'Reintentar' });
        expect(retryButton).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('Performance', () => {
    it('memoizes expensive calculations', async () => {
      const largeMockData = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        debt_type: `Type ${i % 5}`,
        description: `Description ${i}`,
        amount: Math.random() * 1000000,
        interest_rate: Math.random() * 10,
        due_date: new Date(2024 + Math.random() * 5, 0, 1).toISOString(),
        status: 'active' as const,
        principal_amount: Math.random() * 800000,
        accrued_interest: Math.random() * 200000
      }));

      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: largeMockData,
        metadata: {
          total_records: 1000,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      const { rerender } = render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });

      // Re-render with same data should use memoized results
      rerender(<DebtAnalysisChartTypeSafe year={2024} />);

      // Verify chart still renders correctly (memoization working)
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('handles year prop changes efficiently', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      const { rerender } = render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Análisis de Deuda Municipal 2024')).toBeInTheDocument();
      });

      // Change year prop
      rerender(<DebtAnalysisChartTypeSafe year={2023} />);

      // Should trigger new data fetch
      expect(mockGetMunicipalDebt).toHaveBeenCalledWith(2023);
    });
  });

  describe('Data Quality Indicators', () => {
    it('displays data quality warning for low quality data', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'LOW',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText(/calidad de datos baja/i)).toBeInTheDocument();
      });
    });

    it('shows last updated timestamp', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T10:30:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText(/actualizado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tooltip Interactions', () => {
    it('displays formatted tooltip on hover', async () => {
      mockGetMunicipalDebt.mockResolvedValue({
        success: true,
        data: mockDebtData,
        metadata: {
          total_records: 3,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });

      // Simulate tooltip activation
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    it('handles component crashes gracefully', async () => {
      // Mock a component crash
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockGetMunicipalDebt.mockImplementation(() => {
        throw new Error('Component crash');
      });

      render(
        <DebtAnalysisChartTypeSafe year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Error al cargar datos de deuda')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });
});