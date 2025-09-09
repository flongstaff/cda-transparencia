import React, { Suspense, lazy, ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

// Lazy load chart components to reduce initial bundle size
const BudgetAnalysisChart = lazy(() => 
  import('./BudgetAnalysisChartEnhanced').then(module => ({ default: module.default }))
);

const DebtAnalysisChart = lazy(() => 
  import('./DebtAnalysisChartTypeSafe').then(module => ({ default: module.default }))
);

const InvestmentAnalysisChart = lazy(() => 
  import('./InvestmentAnalysisChart').catch(() => 
    // Fallback to a basic chart if the specific one doesn't exist
    import('./UniversalChart').then(module => ({ default: module.default }))
  )
);

const SalaryAnalysisChart = lazy(() => 
  import('./SalaryAnalysisChart').catch(() => 
    import('./UniversalChart').then(module => ({ default: module.default }))
  )
);

const ContractAnalysisChart = lazy(() => 
  import('./ContractAnalysisChart').catch(() => 
    import('./UniversalChart').then(module => ({ default: module.default }))
  )
);

const PropertyDeclarationsChart = lazy(() => 
  import('./PropertyDeclarationsChart').catch(() => 
    import('./UniversalChart').then(module => ({ default: module.default }))
  )
);

// Chart types registry
export const ChartRegistry = {
  budget: BudgetAnalysisChart,
  debt: DebtAnalysisChart,
  investment: InvestmentAnalysisChart,
  salary: SalaryAnalysisChart,
  contract: ContractAnalysisChart,
  property: PropertyDeclarationsChart,
} as const;

export type ChartType = keyof typeof ChartRegistry;

// Loading fallback component
const ChartLoadingFallback: React.FC<{ chartType?: string }> = ({ chartType = 'chart' }) => (
  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">
        Cargando gráfico de {chartType}...
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
        Optimizando experiencia de usuario
      </p>
    </div>
  </div>
);

// Error fallback component
const ChartErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
  chartType?: string;
}> = ({ error, resetErrorBoundary, chartType = 'chart' }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
    <div className="flex items-start">
      <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Error al cargar gráfico de {chartType}
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">
          {error.message.includes('Loading chunk') 
            ? 'Error de conexión al cargar el componente. Verifique su conexión a internet.'
            : error.message
          }
        </p>
        <div className="flex space-x-3">
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Recargar página
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer">
              Detalles técnicos (desarrollo)
            </summary>
            <pre className="mt-2 text-xs text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-x-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  </div>
);

// Props interface for the lazy chart loader
interface LazyChartLoaderProps {
  chartType: ChartType;
  chartProps: Record<string, any>;
  fallbackComponent?: ComponentType<any>;
  onError?: (error: Error, errorInfo: any) => void;
  loadingMessage?: string;
}

// Main lazy chart loader component
const LazyChartLoader: React.FC<LazyChartLoaderProps> = ({
  chartType,
  chartProps,
  fallbackComponent: FallbackComponent,
  onError,
  loadingMessage
}) => {
  const ChartComponent = ChartRegistry[chartType];
  
  const handleError = (error: Error, errorInfo: any) => {
    // Log error for monitoring
    console.error(`Chart loading error (${chartType}):`, error, errorInfo);
    
    // Send to error tracking service
    if (onError) {
      onError(error, errorInfo);
    }
    
    // In production, could send to analytics
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('chart_load_error', {
      //   chartType,
      //   error: error.message,
      //   stack: error.stack
      // });
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ChartErrorFallback 
          error={error} 
          resetErrorBoundary={resetErrorBoundary}
          chartType={chartType}
        />
      )}
      onError={handleError}
      resetKeys={[chartType, chartProps]} // Reset error boundary when these change
    >
      <Suspense 
        fallback={
          FallbackComponent ? (
            <FallbackComponent {...chartProps} />
          ) : (
            <ChartLoadingFallback 
              chartType={loadingMessage || chartType} 
            />
          )
        }
      >
        <ChartComponent {...chartProps} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Utility function to preload a specific chart
export const preloadChart = (chartType: ChartType): Promise<ComponentType<any>> => {
  const ChartComponent = ChartRegistry[chartType];
  
  // TypeScript workaround for lazy component preloading
  if ('_payload' in ChartComponent && '_result' in ChartComponent) {
    // Already loaded
    return Promise.resolve(ChartComponent._result);
  }
  
  // Trigger the lazy load
  try {
    return import(`./${getChartFileName(chartType)}`).then(module => module.default);
  } catch (error) {
    console.warn(`Failed to preload chart ${chartType}:`, error);
    return Promise.reject(error);
  }
};

// Helper function to get chart file names
const getChartFileName = (chartType: ChartType): string => {
  const fileNames: Record<ChartType, string> = {
    budget: 'BudgetAnalysisChartEnhanced',
    debt: 'DebtAnalysisChartTypeSafe',
    investment: 'InvestmentAnalysisChart',
    salary: 'SalaryAnalysisChart',
    contract: 'ContractAnalysisChart',
    property: 'PropertyDeclarationsChart'
  };
  
  return fileNames[chartType] || 'UniversalChart';
};

// Hook for preloading charts based on user behavior
export const useChartPreloader = () => {
  const preloadedCharts = React.useRef<Set<ChartType>>(new Set());
  
  const preloadChartOnHover = React.useCallback((chartType: ChartType) => {
    if (preloadedCharts.current.has(chartType)) return;
    
    preloadedCharts.current.add(chartType);
    preloadChart(chartType).catch(error => {
      console.warn(`Chart preload failed for ${chartType}:`, error);
      preloadedCharts.current.delete(chartType); // Allow retry
    });
  }, []);
  
  const preloadMultipleCharts = React.useCallback((chartTypes: ChartType[]) => {
    chartTypes.forEach(chartType => {
      if (!preloadedCharts.current.has(chartType)) {
        setTimeout(() => preloadChartOnHover(chartType), Math.random() * 2000);
      }
    });
  }, [preloadChartOnHover]);
  
  return {
    preloadChartOnHover,
    preloadMultipleCharts,
    preloadedCharts: preloadedCharts.current
  };
};

// Higher-order component for easy chart loading
export const withLazyChart = <P extends object>(
  chartType: ChartType,
  defaultProps?: Partial<P>
) => {
  return React.forwardRef<HTMLDivElement, P>((props, ref) => (
    <div ref={ref}>
      <LazyChartLoader
        chartType={chartType}
        chartProps={{ ...defaultProps, ...props }}
      />
    </div>
  ));
};

// Bundle analysis helper (development only)
export const analyzeBundleSize = async (): Promise<Record<ChartType, number>> => {
  if (process.env.NODE_ENV !== 'development') {
    return {} as Record<ChartType, number>;
  }
  
  const sizes: Partial<Record<ChartType, number>> = {};
  
  for (const [chartType] of Object.entries(ChartRegistry)) {
    try {
      const start = performance.now();
      await preloadChart(chartType as ChartType);
      const end = performance.now();
      sizes[chartType as ChartType] = end - start;
    } catch (error) {
      console.warn(`Failed to analyze ${chartType}:`, error);
      sizes[chartType as ChartType] = -1; // Error indicator
    }
  }
  
  console.table(sizes);
  return sizes as Record<ChartType, number>;
};

export default LazyChartLoader;