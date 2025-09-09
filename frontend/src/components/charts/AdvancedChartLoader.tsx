import React, { Suspense, lazy, ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Loader2, AlertTriangle, RefreshCw, BarChart3, PieChart, TrendingUp, Filter, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Lazy load advanced chart components
const TreemapChart = lazy(() => import('./TreemapChart'));
const WaterfallChart = lazy(() => import('./WaterfallChart'));
const FunnelChart = lazy(() => import('./FunnelChart'));
const SankeyDiagram = lazy(() => import('./SankeyDiagram'));
const DebtAnalysisChart = lazy(() => import('./DebtAnalysisChart'));
const BudgetAnalysisChartEnhanced = lazy(() => import('./BudgetAnalysisChartEnhanced'));

// Chart types registry
export type AdvancedChartType = 
  | 'treemap' 
  | 'waterfall' 
  | 'funnel' 
  | 'sankey'
  | 'debt' 
  | 'budget';

const ChartRegistry: Record<AdvancedChartType, ComponentType<any>> = {
  treemap: TreemapChart,
  waterfall: WaterfallChart,
  funnel: FunnelChart,
  sankey: SankeyDiagram,
  debt: DebtAnalysisChart,
  budget: BudgetAnalysisChartEnhanced,
};

const ChartIcons: Record<AdvancedChartType, ComponentType<any>> = {
  treemap: BarChart3,
  waterfall: TrendingUp,
  funnel: Filter,
  sankey: Share2,
  debt: PieChart,
  budget: BarChart3,
};

const ChartDescriptions: Record<AdvancedChartType, string> = {
  treemap: 'Visualización jerárquica de distribución presupuestaria',
  waterfall: 'Análisis de evolución secuencial del presupuesto',
  funnel: 'Embudo de procesos con tasas de conversión',
  sankey: 'Diagrama de flujo de fondos entre áreas',
  debt: 'Análisis comprehensivo de deuda municipal',
  budget: 'Análisis presupuestario con métricas avanzadas',
};

interface AdvancedChartLoaderProps {
  chartType: AdvancedChartType;
  chartProps: Record<string, any>;
  fallbackComponent?: ComponentType<any>;
  onError?: (error: Error, errorInfo: any) => void;
  loadingMessage?: string;
  showChartInfo?: boolean;
  enablePerformanceMonitoring?: boolean;
}

// Performance monitoring hook
const usePerformanceMonitoring = (chartType: AdvancedChartType, enabled: boolean = false) => {
  React.useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      console.log(`🚀 Advanced Chart Performance: ${chartType} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Send to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        // analytics.track('advanced_chart_performance', {
        //   chartType,
        //   loadTime,
        //   timestamp: new Date().toISOString()
        // });
      }
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, [chartType, enabled]);
};

// Advanced loading fallback component
const AdvancedChartLoadingFallback: React.FC<{ 
  chartType: AdvancedChartType; 
  loadingMessage?: string;
  showChartInfo?: boolean;
}> = ({ chartType, loadingMessage, showChartInfo = true }) => {
  const { t } = useTranslation();
  const IconComponent = ChartIcons[chartType];

  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="text-center max-w-sm">
        {/* Animated icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-full animate-ping"></div>
          <div className="relative p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <IconComponent className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
          <div className="text-left">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {loadingMessage || `Cargando gráfico ${chartType}...`}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Optimizando visualización avanzada
            </p>
          </div>
        </div>

        {/* Chart information */}
        {showChartInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {ChartDescriptions[chartType]}
            </p>
          </div>
        )}

        {/* Loading progress animation */}
        <div className="mt-6">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced error fallback component
const AdvancedChartErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
  chartType: AdvancedChartType;
}> = ({ error, resetErrorBoundary, chartType }) => {
  const { t } = useTranslation();
  const IconComponent = ChartIcons[chartType];

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md">
        {/* Error icon */}
        <div className="relative mb-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto w-fit">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error message */}
        <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-3">
          Error al cargar gráfico {chartType}
        </h3>
        
        <p className="text-red-700 dark:text-red-300 mb-6 leading-relaxed">
          {error.message.includes('Loading chunk') 
            ? 'Error de conexión al cargar el componente. Verifique su conexión a internet.'
            : error.message.includes('fetch')
            ? 'Error al obtener los datos. El servidor puede estar temporalmente no disponible.'
            : `Error técnico: ${error.message}`
          }
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar Carga
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
          >
            Recargar Página
          </button>
        </div>

        {/* Chart info */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <IconComponent className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              Gráfico {chartType}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {ChartDescriptions[chartType]}
          </p>
        </div>

        {/* Development error details */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer font-medium mb-2">
              Detalles técnicos (desarrollo)
            </summary>
            <pre className="text-xs text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

// Main Advanced Chart Loader component
const AdvancedChartLoader: React.FC<AdvancedChartLoaderProps> = ({
  chartType,
  chartProps,
  fallbackComponent: FallbackComponent,
  onError,
  loadingMessage,
  showChartInfo = true,
  enablePerformanceMonitoring = process.env.NODE_ENV === 'development'
}) => {
  const { t } = useTranslation();
  const ChartComponent = ChartRegistry[chartType];
  
  // Performance monitoring
  usePerformanceMonitoring(chartType, enablePerformanceMonitoring);

  const handleError = React.useCallback((error: Error, errorInfo: any) => {
    // Log error for monitoring
    console.error(`🚨 Advanced Chart Error (${chartType}):`, error, errorInfo);
    
    // Send to error tracking service
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Analytics tracking in production
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('advanced_chart_error', {
      //   chartType,
      //   error: error.message,
      //   stack: error.stack,
      //   timestamp: new Date().toISOString()
      // });
    }
  }, [chartType, onError]);

  if (!ChartComponent) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Tipo de gráfico no compatible
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              El tipo "{chartType}" no está registrado en el sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <AdvancedChartErrorFallback 
          error={error} 
          resetErrorBoundary={resetErrorBoundary}
          chartType={chartType}
        />
      )}
      onError={handleError}
      resetKeys={[chartType, JSON.stringify(chartProps)]} // Reset when these change
    >
      <Suspense 
        fallback={
          FallbackComponent ? (
            <FallbackComponent {...chartProps} />
          ) : (
            <AdvancedChartLoadingFallback 
              chartType={chartType}
              loadingMessage={loadingMessage}
              showChartInfo={showChartInfo}
            />
          )
        }
      >
        <div 
          role="img"
          aria-label={`Gráfico avanzado tipo ${chartType}`}
          className="advanced-chart-container"
        >
          <ChartComponent {...chartProps} />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

// Utility function to preload specific advanced chart
export const preloadAdvancedChart = async (chartType: AdvancedChartType): Promise<ComponentType<any>> => {
  try {
    switch (chartType) {
      case 'treemap':
        return (await import('./TreemapChart')).default;
      case 'waterfall':
        return (await import('./WaterfallChart')).default;
      case 'funnel':
        return (await import('./FunnelChart')).default;
      case 'sankey':
        return (await import('./SankeyDiagram')).default;
      case 'debt':
        return (await import('./DebtAnalysisChart')).default;
      case 'budget':
        return (await import('./BudgetAnalysisChartEnhanced')).default;
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }
  } catch (error) {
    console.warn(`Failed to preload advanced chart ${chartType}:`, error);
    throw error;
  }
};

// Hook for preloading multiple charts
export const useAdvancedChartPreloader = () => {
  const [preloadedCharts, setPreloadedCharts] = React.useState<Set<AdvancedChartType>>(new Set());
  const [isPreloading, setIsPreloading] = React.useState(false);

  const preloadChart = React.useCallback(async (chartType: AdvancedChartType) => {
    if (preloadedCharts.has(chartType)) return;
    
    setIsPreloading(true);
    try {
      await preloadAdvancedChart(chartType);
      setPreloadedCharts(prev => new Set(prev).add(chartType));
    } catch (error) {
      console.warn(`Failed to preload ${chartType}:`, error);
    } finally {
      setIsPreloading(false);
    }
  }, [preloadedCharts]);

  const preloadMultipleCharts = React.useCallback(async (chartTypes: AdvancedChartType[]) => {
    const unloadedCharts = chartTypes.filter(type => !preloadedCharts.has(type));
    
    if (unloadedCharts.length === 0) return;
    
    setIsPreloading(true);
    try {
      await Promise.allSettled(
        unloadedCharts.map(chartType => preloadAdvancedChart(chartType))
      );
      setPreloadedCharts(prev => {
        const newSet = new Set(prev);
        unloadedCharts.forEach(type => newSet.add(type));
        return newSet;
      });
    } catch (error) {
      console.warn('Failed to preload multiple charts:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [preloadedCharts]);

  return {
    preloadChart,
    preloadMultipleCharts,
    preloadedCharts,
    isPreloading
  };
};

export default AdvancedChartLoader;