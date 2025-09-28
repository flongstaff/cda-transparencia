import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import BudgetAnalysisChartEnhanced from '../../charts/BudgetAnalysisChartEnhanced';
import * as consolidatedApiService from '../../../services/ConsolidatedApiService';

// Mock i18n
i18n.init({
  lng: 'es',
  resources: {
    es: {
      translation: {
        budget: {
          title: 'Análisis Presupuestario {{year}}',
          loading: 'Cargando análisis presupuestario...',
          error: 'Error al cargar datos presupuestarios',
          retry: 'Reintentar',
          totalBudgeted: 'Presupuestado Total',
          totalExecuted: 'Ejecutado Total',
          executionRate: 'Tasa de Ejecución',
          noData: 'No hay datos presupuestarios para {{year}}',
          chartAriaLabel: 'Gráfico de análisis presupuestario para el año {{year}}'
        },
        common: {
          updated: 'Actualizado'
        }
      }
    },
    en: {
      translation: {
        budget: {
          title: 'Budget Analysis {{year}}',
          loading: 'Loading budget analysis...',
          error: 'Error loading budget data',
          retry: 'Retry',
          totalBudgeted: 'Total Budgeted',
          totalExecuted: 'Total Executed',
          executionRate: 'Execution Rate',
          noData: 'No budget data available for {{year}}',
          chartAriaLabel: 'Budget analysis chart for year {{year}}'
        },
        common: {
          updated: 'Updated'
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
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="bar-chart" data-length={data?.length || 0}>{children}</div>
  ),
  Bar: ({ dataKey, fill }: { dataKey: string; fill: string }) => (
    <div data-testid={`bar-${dataKey}`} style={{ backgroundColor: fill }} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
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
  Loader2: () => <div data-testid="loader-icon" className="animate-spin" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />
}));

// Mock API service
vi.mock('../../../services/ConsolidatedApiService');
const mockGetYearlyData = vi.mocked(consolidatedApiService.getYearlyData);

// Test data
const mockBudgetData = {
  total_budgeted: 10000000,
  total_executed: 8500000,
  execution_rate: 85.0,
  categories: {
    'Educación': {
      budgeted: 3000000,
      executed: 2800000,
      execution_rate: 93.3,
      variance: -200000,
      variance_percentage: -6.7
    },
    'Salud': {
      budgeted: 2500000,
      executed: 2200000,
      execution_rate: 88.0,
      variance: -300000,
      variance_percentage: -12.0
    },
    'Infraestructura': {
      budgeted: 2000000,
      executed: 1600000,
      execution_rate: 80.0,
      variance: -400000,
      variance_percentage: -20.0
    },
    'Servicios Públicos': {
      budgeted: 1500000,
      executed: 1300000,
      execution_rate: 86.7,
      variance: -200000,
      variance_percentage: -13.3
    },
    'Administración': {
      budgeted: 1000000,
      executed: 600000,
      execution_rate: 60.0,
      variance: -400000,
      variance_percentage: -40.0
    }
  }
};

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

describe('BudgetAnalysisChartEnhanced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset i18n to Spanish
    i18n.changeLanguage('es');
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Loading State', () => {
    it('renders loading skeleton while fetching data', async () => {
      mockGetYearlyData.mockImplementation(() => new Promise(() => {}));

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByText('Cargando análisis presupuestario...')).toBeInTheDocument();
    });

    it('shows skeleton elements with proper ARIA attributes', () => {
      mockGetYearlyData.mockImplementation(() => new Promise(() => {}));

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      const loadingContainer = screen.getByRole('status');
      expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Success State', () => {
    it('renders chart with budget data', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Análisis Presupuestario 2024')).toBeInTheDocument();
      });

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('displays correct budget metrics in summary cards', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('$10.000.000')).toBeInTheDocument(); // Total budgeted
        expect(screen.getByText('$8.500.000')).toBeInTheDocument(); // Total executed
        expect(screen.getByText('85,0%')).toBeInTheDocument(); // Execution rate
      });
    });

    it('renders category breakdown correctly', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const barChart = screen.getByTestId('bar-chart');
        expect(barChart).toHaveAttribute('data-length', '5'); // Five categories
      });

      // Check for category bars
      expect(screen.getByTestId('bar-budgeted')).toBeInTheDocument();
      expect(screen.getByTestId('bar-executed')).toBeInTheDocument();
    });

    it('handles empty budget data gracefully', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: {
          total_budgeted: 0,
          total_executed: 0,
          execution_rate: 0,
          categories: {}
        },
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
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('No hay datos presupuestarios para 2024')).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('renders error message on API failure', async () => {
      mockGetYearlyData.mockRejectedValue(new Error('Network error'));

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Error al cargar datos presupuestarios')).toBeInTheDocument();
      });

      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    });

    it('handles retry functionality with exponential backoff', async () => {
      mockGetYearlyData
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          data: mockBudgetData,
          metadata: {
            total_records: 5,
            year: 2024,
            last_updated: '2024-01-01T00:00:00Z',
            source: 'municipal_system',
            data_quality: 'HIGH',
            currency: 'ARS'
          }
        });

      render(
        <BudgetAnalysisChartEnhanced year={2024} retryAttempts={3} />,
        { wrapper: createWrapper() }
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Error al cargar datos presupuestarios')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: 'Reintentar' });
      fireEvent.click(retryButton);

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Análisis Presupuestario 2024')).toBeInTheDocument();
      });

      expect(mockGetYearlyData).toHaveBeenCalledTimes(2);
    });

    it('validates data with Zod schema', async () => {
      const invalidData = {
        total_budgeted: -1000, // Invalid: negative value
        total_executed: 'invalid', // Invalid: string instead of number
        execution_rate: 150, // Invalid: > 100%
        categories: null // Invalid: null instead of object
      };

      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: invalidData,
        metadata: {
          total_records: 0,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'LOW',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Error al cargar datos presupuestarios')).toBeInTheDocument();
      });
    });
  });

  describe('Caching', () => {
    it('caches successful responses in localStorage', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} enableCaching={true} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Análisis Presupuestario 2024')).toBeInTheDocument();
      });

      // Check if data was cached
      const cachedData = localStorage.getItem('budget_2024_es');
      expect(cachedData).toBeTruthy();
    });

    it('uses cached data when available and not expired', async () => {
      // Pre-populate cache
      const cacheData = {
        data: mockBudgetData,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem('budget_2024_es', JSON.stringify(cacheData));

      render(
        <BudgetAnalysisChartEnhanced year={2024} enableCaching={true} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Análisis Presupuestario 2024')).toBeInTheDocument();
      });

      // API should not have been called since we used cached data
      expect(mockGetYearlyData).not.toHaveBeenCalled();
    });

    it('fetches fresh data when cache is expired', async () => {
      // Pre-populate cache with expired data
      const expiredCacheData = {
        data: mockBudgetData,
        timestamp: Date.now() - (11 * 60 * 1000), // 11 minutes ago (expired)
        version: '1.0'
      };
      localStorage.setItem('budget_2024_es', JSON.stringify(expiredCacheData));

      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} enableCaching={true} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Análisis Presupuestario 2024')).toBeInTheDocument();
      });

      // API should have been called to fetch fresh data
      expect(mockGetYearlyData).toHaveBeenCalled();
    });
  });

  describe('Internationalization', () => {
    it('displays content in English when locale is changed', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
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
        <BudgetAnalysisChartEnhanced year={2024} locale="en" />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Budget Analysis 2024')).toBeInTheDocument();
      });

      expect(screen.getByText('Total Budgeted')).toBeInTheDocument();
      expect(screen.getByText('Total Executed')).toBeInTheDocument();
    });

    it('formats currency according to locale', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} locale="es" />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // Check for Spanish number formatting with periods as thousand separators
        expect(screen.getByText('$10.000.000')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const chartContainer = screen.getByRole('img');
        expect(chartContainer).toHaveAttribute(
          'aria-label',
          'Gráfico de análisis presupuestario para el año 2024'
        );
      });
    });

    it('announces data updates to screen readers', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Performance', () => {
    it('memoizes chart data calculations', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      const { rerender } = render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });

      // Re-render with same props should use memoized data
      rerender(<BudgetAnalysisChartEnhanced year={2024} />);

      // Chart should still be rendered
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('debounces year changes', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      const { rerender } = render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      // Rapidly change years
      rerender(<BudgetAnalysisChartEnhanced year={2023} />);
      rerender(<BudgetAnalysisChartEnhanced year={2022} />);
      rerender(<BudgetAnalysisChartEnhanced year={2021} />);

      // Wait for debounce
      await waitFor(() => {
        expect(mockGetYearlyData).toHaveBeenLastCalledWith(2021);
      }, { timeout: 1000 });
    });
  });

  describe('Data Quality and Metadata', () => {
    it('displays data quality indicators', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T10:30:00Z',
          source: 'municipal_system',
          data_quality: 'LOW',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText(/calidad de datos baja/i)).toBeInTheDocument();
      });
    });

    it('shows last updated timestamp', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T10:30:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText(/actualizado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Callback Functions', () => {
    it('calls onDataLoad callback when data loads successfully', async () => {
      const onDataLoadSpy = vi.fn();

      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} onDataLoad={onDataLoadSpy} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(onDataLoadSpy).toHaveBeenCalledWith(expect.any(Array));
      });
    });

    it('calls onError callback when error occurs', async () => {
      const onErrorSpy = vi.fn();

      mockGetYearlyData.mockRejectedValue(new Error('Network error'));

      render(
        <BudgetAnalysisChartEnhanced year={2024} onError={onErrorSpy} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(onErrorSpy).toHaveBeenCalledWith('Network error');
      });
    });
  });

  describe('Theme Support', () => {
    it('applies light theme styles', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} theme="light" />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const container = screen.getByText('Análisis Presupuestario 2024').closest('div');
        expect(container).toHaveClass('theme-light');
      });
    });

    it('applies dark theme styles', async () => {
      mockGetYearlyData.mockResolvedValue({
        success: true,
        data: mockBudgetData,
        metadata: {
          total_records: 5,
          year: 2024,
          last_updated: '2024-01-01T00:00:00Z',
          source: 'municipal_system',
          data_quality: 'HIGH',
          currency: 'ARS'
        }
      });

      render(
        <BudgetAnalysisChartEnhanced year={2024} theme="dark" />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const container = screen.getByText('Análisis Presupuestario 2024').closest('div');
        expect(container).toHaveClass('theme-dark');
      });
    });
  });
});