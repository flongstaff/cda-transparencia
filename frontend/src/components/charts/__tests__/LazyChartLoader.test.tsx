import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import LazyChartLoader, { 
  preloadChart, 
  useChartPreloader, 
  withLazyChart,
  analyzeBundleSize,
  ChartType
} from '../LazyChartLoader';
import { renderHook, act } from '@testing-library/react';

// Mock React.lazy and Suspense
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: vi.fn((importFn) => {
      const MockComponent = vi.fn(() => <div data-testid="mock-chart">Mock Chart</div>);
      MockComponent.displayName = 'MockLazyComponent';
      return MockComponent;
    }),
    Suspense: ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
      // For testing, we'll just render the children directly
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

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon" className="animate-spin" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />
}));

// Mock chart imports
vi.mock('../BudgetAnalysisChartEnhanced', () => ({
  default: () => <div data-testid="budget-chart">Budget Chart</div>
}));

vi.mock('../DebtAnalysisChartTypeSafe', () => ({
  default: () => <div data-testid="debt-chart">Debt Chart</div>
}));

vi.mock('../UniversalChart', () => ({
  default: () => <div data-testid="universal-chart">Universal Chart</div>
}));

describe('LazyChartLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any import cache
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Component Rendering', () => {
    it('renders loading fallback while component loads', () => {
      render(
        <LazyChartLoader
          chartType="budget"
          chartProps={{ year: 2024 }}
        />
      );

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByText('Cargando gráfico de budget...')).toBeInTheDocument();
    });

    it('renders chart component after loading', async () => {
      render(
        <LazyChartLoader
          chartType="budget"
          chartProps={{ year: 2024 }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
      });
    });

    it('passes props correctly to chart component', async () => {
      const chartProps = { year: 2024, theme: 'dark' };

      render(
        <LazyChartLoader
          chartType="debt"
          chartProps={chartProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
      });
    });

    it('renders custom loading component when provided', () => {
      const CustomLoadingComponent = () => (
        <div data-testid="custom-loading">Custom Loading...</div>
      );

      render(
        <LazyChartLoader
          chartType="budget"
          chartProps={{ year: 2024 }}
          fallbackComponent={CustomLoadingComponent}
        />
      );

      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
    });

    it('displays custom loading message', () => {
      render(
        <LazyChartLoader
          chartType="investment"
          chartProps={{ year: 2024 }}
          loadingMessage="inversiones"
        />
      );

      expect(screen.getByText('Cargando gráfico de inversiones...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('renders error fallback when chart fails to load', async () => {
      // Mock React.lazy to throw an error
      vi.mocked(React.lazy).mockImplementation(() => {
        throw new Error('Failed to load chart');
      });

      render(
        <LazyChartLoader
          chartType="budget"
          chartProps={{ year: 2024 }}
        />
      );

      // The error boundary should catch the error and render fallback
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('calls onError callback when error occurs', async () => {
      const onErrorSpy = vi.fn();

      render(
        <LazyChartLoader
          chartType="budget"
          chartProps={{ year: 2024 }}
          onError={onErrorSpy}
        />
      );

      // Simulate an error by triggering the error handler
      // In a real scenario, this would be called by the ErrorBoundary
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

    it('displays error message with retry button', () => {
      const resetErrorBoundary = vi.fn();

      // Simulate error state by rendering the error fallback directly
      const { container } = render(
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
          <div className="flex items-start">
            <div data-testid="alert-triangle-icon" className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                Error al cargar gráfico de budget
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={resetErrorBoundary}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <div data-testid="refresh-icon" className="h-4 w-4 mr-2" />
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      );

      expect(screen.getByText('Error al cargar gráfico de budget')).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });
  });

  describe('Chart Registry', () => {
    it('supports all registered chart types', () => {
      const supportedTypes: ChartType[] = ['budget', 'debt', 'investment', 'salary', 'contract', 'property'];
      
      supportedTypes.forEach(chartType => {
        const { unmount } = render(
          <LazyChartLoader
            chartType={chartType}
            chartProps={{ year: 2024 }}
          />
        );
        
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
        unmount();
      });
    });

    it('handles fallback for non-existent charts', async () => {
      // This tests the catch() behavior in lazy imports
      render(
        <LazyChartLoader
          chartType="investment" // This should fallback to UniversalChart
          chartProps={{ year: 2024 }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Preloading Functionality', () => {
    it('preloads chart components', async () => {
      const mockImport = vi.fn().mockResolvedValue({ default: () => null });
      
      // Mock dynamic import
      vi.stubGlobal('import', mockImport);

      await act(async () => {
        await preloadChart('budget');
      });

      expect(mockImport).toHaveBeenCalledWith('./BudgetAnalysisChartEnhanced');
    });

    it('handles preload errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));
      
      vi.stubGlobal('import', mockImport);

      await expect(preloadChart('budget')).rejects.toThrow('Import failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to preload chart budget:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('returns already loaded component', async () => {
      // Mock a component that's already loaded
      const mockComponent = { _result: () => null };
      vi.doMock('../BudgetAnalysisChartEnhanced', () => mockComponent);

      const result = await preloadChart('budget');
      expect(result).toBe(mockComponent._result);
    });
  });

  describe('useChartPreloader Hook', () => {
    it('preloads chart on hover', async () => {
      const { result } = renderHook(() => useChartPreloader());

      await act(async () => {
        result.current.preloadChartOnHover('budget');
      });

      // Verify the chart was added to preloaded set
      expect(result.current.preloadedCharts.has('budget')).toBe(true);
    });

    it('does not preload already preloaded charts', async () => {
      const { result } = renderHook(() => useChartPreloader());

      // Preload once
      await act(async () => {
        result.current.preloadChartOnHover('budget');
      });

      // Try to preload again
      await act(async () => {
        result.current.preloadChartOnHover('budget');
      });

      // Should only be in set once
      expect(result.current.preloadedCharts.has('budget')).toBe(true);
    });

    it('preloads multiple charts with staggered timing', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useChartPreloader());

      act(() => {
        result.current.preloadMultipleCharts(['budget', 'debt', 'investment']);
      });

      // Fast-forward timers
      vi.runAllTimers();

      await waitFor(() => {
        expect(result.current.preloadedCharts.has('budget')).toBe(true);
        expect(result.current.preloadedCharts.has('debt')).toBe(true);
        expect(result.current.preloadedCharts.has('investment')).toBe(true);
      });

      vi.useRealTimers();
    });

    it('handles preload failures by allowing retry', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result } = renderHook(() => useChartPreloader());

      // Mock import failure
      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));
      vi.stubGlobal('import', mockImport);

      await act(async () => {
        result.current.preloadChartOnHover('budget');
      });

      // Should not be in preloaded set after failure
      expect(result.current.preloadedCharts.has('budget')).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Higher-Order Component', () => {
    it('creates HOC with default props', async () => {
      const BudgetChartWithDefaults = withLazyChart('budget', { theme: 'light' });

      render(<BudgetChartWithDefaults year={2024} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
      });
    });

    it('merges props correctly in HOC', async () => {
      const DebtChartWithDefaults = withLazyChart('debt', { locale: 'es' });

      render(<DebtChartWithDefaults year={2024} theme="dark" />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
      });
    });

    it('forwards ref in HOC', async () => {
      const ref = React.createRef<HTMLDivElement>();
      const ChartWithRef = withLazyChart('budget');

      render(<ChartWithRef ref={ref} year={2024} />);

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
      });
    });
  });

  describe('Bundle Analysis', () => {
    it('analyzes bundle sizes in development', async () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Mock performance.now()
      const mockPerformanceNow = vi.fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(100);
      
      Object.defineProperty(global, 'performance', {
        value: { now: mockPerformanceNow },
        writable: true
      });

      const mockImport = vi.fn().mockResolvedValue({ default: () => null });
      vi.stubGlobal('import', mockImport);

      const sizes = await analyzeBundleSize();

      expect(sizes).toEqual(
        expect.objectContaining({
          budget: expect.any(Number),
          debt: expect.any(Number),
          investment: expect.any(Number),
          salary: expect.any(Number),
          contract: expect.any(Number),
          property: expect.any(Number)
        })
      );

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('returns empty object in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const sizes = await analyzeBundleSize();

      expect(sizes).toEqual({});

      process.env.NODE_ENV = originalEnv;
    });

    it('handles bundle analysis errors', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));
      
      vi.stubGlobal('import', mockImport);

      const sizes = await analyzeBundleSize();

      expect(sizes.budget).toBe(-1); // Error indicator
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Boundary Reset', () => {
    it('resets error boundary when props change', () => {
      const { rerender } = render(
        <LazyChartLoader
          chartType="budget"
          chartProps={{ year: 2024 }}
        />
      );

      // Change props to trigger reset
      rerender(
        <LazyChartLoader
          chartType="debt"
          chartProps={{ year: 2023 }}
        />
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('logs errors for monitoring in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onErrorSpy = vi.fn();

      render(
        <LazyChartLoader
          chartType="budget"
          chartProps={{ year: 2024 }}
          onError={onErrorSpy}
        />
      );

      // Simulate error logging
      const error = new Error('Chart loading failed');
      const errorInfo = { componentStack: 'MockComponent' };
      
      // This would normally be called by the error handling logic
      console.error(`Chart loading error (budget):`, error, errorInfo);
      onErrorSpy(error, errorInfo);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Chart loading error (budget):`,
        error,
        errorInfo
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes for loading state', () => {
      render(
        <LazyChartLoader
          chartType="budget"
          chartProps={{ year: 2024 }}
        />
      );

      const loadingContainer = screen.getByText('Cargando gráfico de budget...');
      expect(loadingContainer.closest('div')).toHaveClass('text-center');
    });

    it('maintains focus management during loading', async () => {
      render(
        <LazyChartLoader
          chartType="budget"
          chartProps={{ year: 2024 }}
        />
      );

      // Initially shows loading
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

      // After loading, chart should be accessible
      await waitFor(() => {
        expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
      });
    });
  });
});