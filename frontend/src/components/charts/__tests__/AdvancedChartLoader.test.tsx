import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import AdvancedChartLoader, { 
  preloadAdvancedChart, 
  useAdvancedChartPreloader,
  AdvancedChartType
} from '../AdvancedChartLoader';

// Mock React.lazy and Suspense
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: vi.fn((importFn) => {
      const MockComponent = vi.fn(({ title = 'Mock Chart' }) => (
        <div data-testid="mock-advanced-chart">
          <h3>{title}</h3>
          <div>Advanced Chart Component Loaded</div>
        </div>
      ));
      MockComponent.displayName = 'MockAdvancedChartComponent';
      return MockComponent;
    }),
    Suspense: ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
      return <div data-testid="suspense">{children}</div>;
    }
  };
});

// Mock react-error-boundary
vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children, FallbackComponent, onError }: {
    children: React.ReactNode;
    FallbackComponent: any;
    onError: (error: Error, errorInfo: any) => void;
  }) => {
    return <div data-testid="error-boundary">{children}</div>;
  }
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    }
  })
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon" className="animate-spin" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Share2: () => <div data-testid="share-icon" />
}));

// Mock chart imports
vi.mock('../TreemapChart', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="treemap-chart">Treemap Chart: {JSON.stringify(data)}</div>
  )
}));

vi.mock('../WaterfallChart', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="waterfall-chart">Waterfall Chart: {JSON.stringify(data)}</div>
  )
}));

vi.mock('../FunnelChart', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="funnel-chart">Funnel Chart: {JSON.stringify(data)}</div>
  )
}));

vi.mock('../SankeyDiagram', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="sankey-diagram">Sankey Diagram: {JSON.stringify(data)}</div>
  )
}));

vi.mock('../DebtAnalysisChart', () => ({
  default: ({ year }: { year: number }) => (
    <div data-testid="debt-analysis-chart">Debt Analysis Chart: {year}</div>
  )
}));

vi.mock('../BudgetAnalysisChartEnhanced', () => ({
  default: ({ year }: { year: number }) => (
    <div data-testid="budget-analysis-chart">Budget Analysis Chart: {year}</div>
  )
}));

describe('AdvancedChartLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Component Rendering', () => {
    it('renders loading fallback for each chart type', () => {
      const chartTypes: AdvancedChartType[] = ['treemap', 'waterfall', 'funnel', 'sankey', 'debt', 'budget'];
      
      chartTypes.forEach((chartType) => {
        const { unmount } = render(
          <AdvancedChartLoader
            chartType={chartType}
            chartProps={{ data: [], year: 2024 }}
          />
        );

        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
        expect(screen.getByText(`Cargando gráfico ${chartType}...`)).toBeInTheDocument();
        
        unmount();
      });
    });

    it('renders chart component after loading', async () => {
      render(
        <AdvancedChartLoader
          chartType="treemap"
          chartProps={{ data: [{ name: 'Test', value: 100 }] }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-advanced-chart')).toBeInTheDocument();
      });
    });

    it('passes props correctly to chart components', async () => {
      const chartProps = { 
        data: [{ name: 'Budget', value: 1000000 }], 
        year: 2024, 
        locale: 'es' 
      };

      render(
        <AdvancedChartLoader
          chartType="budget"
          chartProps={chartProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-advanced-chart')).toBeInTheDocument();
      });
    });

    it('renders custom loading component when provided', () => {
      const CustomLoadingComponent = ({ title }: { title: string }) => (
        <div data-testid="custom-loading">Custom Loading for {title}...</div>
      );

      render(
        <AdvancedChartLoader
          chartType="waterfall"
          chartProps={{ title: 'Custom Waterfall' }}
          fallbackComponent={CustomLoadingComponent}
        />
      );

      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
      expect(screen.getByText('Custom Loading for Custom Waterfall...')).toBeInTheDocument();
    });

    it('displays custom loading message', () => {
      render(
        <AdvancedChartLoader
          chartType="funnel"
          chartProps={{ data: [] }}
          loadingMessage="Cargando embudo personalizado..."
        />
      );

      expect(screen.getByText('Cargando embudo personalizado...')).toBeInTheDocument();
    });

    it('shows chart information in loading state', () => {
      render(
        <AdvancedChartLoader
          chartType="sankey"
          chartProps={{ data: { nodes: [], links: [] } }}
          showChartInfo={true}
        />
      );

      expect(screen.getByText('Diagrama de flujo de fondos entre áreas')).toBeInTheDocument();
    });

    it('hides chart information when disabled', () => {
      render(
        <AdvancedChartLoader
          chartType="sankey"
          chartProps={{ data: { nodes: [], links: [] } }}
          showChartInfo={false}
        />
      );

      expect(screen.queryByText('Diagrama de flujo de fondos entre áreas')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('renders error fallback when chart fails to load', async () => {
      // Mock React.lazy to throw an error
      vi.mocked(React.lazy).mockImplementation(() => {
        throw new Error('Failed to load chart');
      });

      render(
        <AdvancedChartLoader
          chartType="treemap"
          chartProps={{ data: [] }}
        />
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('calls onError callback when error occurs', async () => {
      const onErrorSpy = vi.fn();

      render(
        <AdvancedChartLoader
          chartType="waterfall"
          chartProps={{ data: [] }}
          onError={onErrorSpy}
        />
      );

      // Simulate an error by calling the error handler directly
      act(() => {
        const error = new Error('Chart loading failed');
        const errorInfo = { componentStack: 'MockComponent' };
        onErrorSpy(error, errorInfo);
      });

      expect(onErrorSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: 'MockComponent' })
      );
    });

    it('handles unknown chart type gracefully', () => {
      render(
        <AdvancedChartLoader
          chartType={'unknown' as AdvancedChartType}
          chartProps={{ data: [] }}
        />
      );

      expect(screen.getByText('Tipo de gráfico no compatible')).toBeInTheDocument();
      expect(screen.getByText('El tipo "unknown" no está registrado en el sistema.')).toBeInTheDocument();
    });

    it('displays error message with retry functionality', () => {
      const resetErrorBoundary = vi.fn();

      // Simulate error state by rendering error component
      const { container } = render(
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div data-testid="alert-triangle-icon" className="h-12 w-12 text-red-600" />
            <h3 className="text-xl font-semibold text-red-800 mb-3">
              Error al cargar gráfico treemap
            </h3>
            <button
              onClick={resetErrorBoundary}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              <div data-testid="refresh-icon" className="h-4 w-4 mr-2" />
              Reintentar Carga
            </button>
          </div>
        </div>
      );

      expect(screen.getByText('Error al cargar gráfico treemap')).toBeInTheDocument();
      expect(screen.getByText('Reintentar Carga')).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });
  });

  describe('Chart Registry', () => {
    it('supports all registered chart types', () => {
      const supportedTypes: AdvancedChartType[] = ['treemap', 'waterfall', 'funnel', 'sankey', 'debt', 'budget'];
      
      supportedTypes.forEach(chartType => {
        const { unmount } = render(
          <AdvancedChartLoader
            chartType={chartType}
            chartProps={{ data: [], year: 2024 }}
          />
        );
        
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
        unmount();
      });
    });

    it('displays correct icons for each chart type', () => {
      const chartIconMap = {
        treemap: 'bar-chart-icon',
        waterfall: 'trending-up-icon', 
        funnel: 'filter-icon',
        sankey: 'share-icon',
        debt: 'pie-chart-icon',
        budget: 'bar-chart-icon'
      };

      Object.entries(chartIconMap).forEach(([chartType, iconTestId]) => {
        const { unmount } = render(
          <AdvancedChartLoader
            chartType={chartType as AdvancedChartType}
            chartProps={{ data: [] }}
          />
        );
        
        expect(screen.getByTestId(iconTestId)).toBeInTheDocument();
        unmount();
      });
    });

    it('shows appropriate descriptions for each chart type', () => {
      const descriptions = {
        treemap: 'Visualización jerárquica de distribución presupuestaria',
        waterfall: 'Análisis de evolución secuencial del presupuesto',
        funnel: 'Embudo de procesos con tasas de conversión',
        sankey: 'Diagrama de flujo de fondos entre áreas',
        debt: 'Análisis comprehensivo de deuda municipal',
        budget: 'Análisis presupuestario con métricas avanzadas'
      };

      Object.entries(descriptions).forEach(([chartType, description]) => {
        const { unmount } = render(
          <AdvancedChartLoader
            chartType={chartType as AdvancedChartType}
            chartProps={{ data: [] }}
            showChartInfo={true}
          />
        );
        
        expect(screen.getByText(description)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Preloading Functionality', () => {
    it('preloads specific chart types', async () => {
      const mockImport = vi.fn().mockResolvedValue({ default: () => null });
      vi.stubGlobal('import', mockImport);

      await act(async () => {
        await preloadAdvancedChart('treemap');
      });

      expect(mockImport).toHaveBeenCalledWith('./TreemapChart');
    });

    it('handles preload errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));
      
      vi.stubGlobal('import', mockImport);

      await expect(preloadAdvancedChart('waterfall')).rejects.toThrow('Import failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to preload advanced chart waterfall:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('throws error for unknown chart type', async () => {
      await expect(preloadAdvancedChart('unknown' as AdvancedChartType))
        .rejects.toThrow('Unknown chart type: unknown');
    });
  });

  describe('useAdvancedChartPreloader Hook', () => {
    it('preloads single chart', async () => {
      const { result } = renderHook(() => useAdvancedChartPreloader());

      const mockImport = vi.fn().mockResolvedValue({ default: () => null });
      vi.stubGlobal('import', mockImport);

      await act(async () => {
        await result.current.preloadChart('funnel');
      });

      expect(result.current.preloadedCharts.has('funnel')).toBe(true);
    });

    it('preloads multiple charts', async () => {
      const { result } = renderHook(() => useAdvancedChartPreloader());

      const mockImport = vi.fn().mockResolvedValue({ default: () => null });
      vi.stubGlobal('import', mockImport);

      await act(async () => {
        await result.current.preloadMultipleCharts(['treemap', 'sankey', 'debt']);
      });

      expect(result.current.preloadedCharts.has('treemap')).toBe(true);
      expect(result.current.preloadedCharts.has('sankey')).toBe(true);
      expect(result.current.preloadedCharts.has('debt')).toBe(true);
    });

    it('tracks preloading state', async () => {
      const { result } = renderHook(() => useAdvancedChartPreloader());

      const mockImport = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      vi.stubGlobal('import', mockImport);

      act(() => {
        result.current.preloadChart('budget');
      });

      expect(result.current.isPreloading).toBe(true);

      await waitFor(() => {
        expect(result.current.isPreloading).toBe(false);
      });
    });

    it('skips already preloaded charts', async () => {
      const { result } = renderHook(() => useAdvancedChartPreloader());

      const mockImport = vi.fn().mockResolvedValue({ default: () => null });
      vi.stubGlobal('import', mockImport);

      // Preload once
      await act(async () => {
        await result.current.preloadChart('waterfall');
      });

      mockImport.mockClear();

      // Try to preload again
      await act(async () => {
        await result.current.preloadChart('waterfall');
      });

      expect(mockImport).not.toHaveBeenCalled();
    });

    it('handles multiple chart preloading errors', async () => {
      const { result } = renderHook(() => useAdvancedChartPreloader());

      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));
      vi.stubGlobal('import', mockImport);

      await act(async () => {
        await result.current.preloadMultipleCharts(['treemap', 'funnel']);
      });

      // Should not have any preloaded charts due to errors
      expect(result.current.preloadedCharts.size).toBe(0);
      expect(result.current.isPreloading).toBe(false);
    });

    it('only loads unloaded charts in multiple preload', async () => {
      const { result } = renderHook(() => useAdvancedChartPreloader());

      const mockImport = vi.fn().mockResolvedValue({ default: () => null });
      vi.stubGlobal('import', mockImport);

      // Preload one chart first
      await act(async () => {
        await result.current.preloadChart('treemap');
      });

      mockImport.mockClear();

      // Try to preload multiple including the already loaded one
      await act(async () => {
        await result.current.preloadMultipleCharts(['treemap', 'sankey']);
      });

      // Should only import sankey since treemap is already loaded
      expect(mockImport).toHaveBeenCalledTimes(1);
      expect(mockImport).toHaveBeenCalledWith('./SankeyDiagram');
    });
  });

  describe('Performance Monitoring', () => {
    it('logs performance metrics in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(
        <AdvancedChartLoader
          chartType="treemap"
          chartProps={{ data: [] }}
          enablePerformanceMonitoring={true}
        />
      );

      // Simulate chart load completion
      window.dispatchEvent(new Event('load'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Advanced Chart Performance: treemap loaded in')
        );
      });

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('skips performance monitoring when disabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(
        <AdvancedChartLoader
          chartType="waterfall"
          chartProps={{ data: [] }}
          enablePerformanceMonitoring={false}
        />
      );

      window.dispatchEvent(new Event('load'));

      // Wait a bit to ensure no logging occurs
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Advanced Chart Performance')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', async () => {
      render(
        <AdvancedChartLoader
          chartType="funnel"
          chartProps={{ data: [] }}
        />
      );

      await waitFor(() => {
        const chartContainer = screen.getByRole('img');
        expect(chartContainer).toHaveAttribute('aria-label', 'Gráfico avanzado tipo funnel');
        expect(chartContainer).toHaveClass('advanced-chart-container');
      });
    });

    it('maintains accessibility during error states', () => {
      render(
        <AdvancedChartLoader
          chartType={'invalid' as AdvancedChartType}
          chartProps={{ data: [] }}
        />
      );

      const errorContainer = screen.getByText('Tipo de gráfico no compatible').closest('div');
      expect(errorContainer).toBeInTheDocument();
    });
  });

  describe('Error Boundary Reset', () => {
    it('resets error boundary when chart type changes', () => {
      const { rerender } = render(
        <AdvancedChartLoader
          chartType="treemap"
          chartProps={{ data: [] }}
        />
      );

      // Change chart type to trigger reset
      rerender(
        <AdvancedChartLoader
          chartType="waterfall"
          chartProps={{ data: [] }}
        />
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('resets error boundary when props change', () => {
      const { rerender } = render(
        <AdvancedChartLoader
          chartType="sankey"
          chartProps={{ data: { nodes: [], links: [] } }}
        />
      );

      // Change props to trigger reset
      rerender(
        <AdvancedChartLoader
          chartType="sankey"
          chartProps={{ data: { nodes: [{ id: 'test', label: 'Test' }], links: [] } }}
        />
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('works with all chart types end-to-end', async () => {
      const chartTypes: AdvancedChartType[] = ['treemap', 'waterfall', 'funnel', 'sankey', 'debt', 'budget'];
      
      for (const chartType of chartTypes) {
        const { unmount } = render(
          <AdvancedChartLoader
            chartType={chartType}
            chartProps={{ 
              data: chartType === 'sankey' ? { nodes: [], links: [] } : [],
              year: 2024
            }}
          />
        );

        // Should show loading state initially
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
        
        // Should eventually render the chart
        await waitFor(() => {
          expect(screen.getByTestId('mock-advanced-chart')).toBeInTheDocument();
        });

        unmount();
      }
    });
  });
});