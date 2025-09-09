import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import UniversalChart from './UniversalChart';
import { consolidatedApiService } from '../../services';
import { formatCurrencyARS } from '../../utils/formatters';
import { RefreshCw, AlertCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';

// Zod Schema for Budget Data Validation
const BudgetDataSchema = z.object({
  total_budgeted: z.number().min(0),
  total_executed: z.number().min(0),
  execution_rate: z.string().or(z.number()),
  categories: z.record(z.object({
    budgeted: z.number().min(0),
    executed: z.number().min(0),
    execution_rate: z.string().or(z.number())
  })).optional()
});

type BudgetData = z.infer<typeof BudgetDataSchema>;

interface BudgetAnalysisChartProps {
  year: number;
  locale?: string;
  theme?: 'light' | 'dark';
  enableCaching?: boolean;
  retryAttempts?: number;
  timeout?: number;
  onDataLoad?: (data: BudgetItem[]) => void;
  onError?: (error: string) => void;
}

interface BudgetItem {
  name: string;
  value: number;
  budgeted?: number;
  executed?: number;
  source?: string;
  category?: string;
  efficiency?: number;
  trend?: 'up' | 'down' | 'stable';
}

// Constants
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const DEFAULT_TIMEOUT = 15000; // 15 seconds
const DEBOUNCE_DELAY = 500; // 500ms

// Performance monitoring
const logPerformance = (operation: string, startTime: number) => {
  const duration = performance.now() - startTime;
  console.log(`🚀 BudgetChart: ${operation} took ${duration.toFixed(2)}ms`);
  
  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // analytics.track('chart_performance', { operation, duration });
  }
};

const BudgetAnalysisChart: React.FC<BudgetAnalysisChartProps> = ({
  year,
  locale = 'es',
  theme = 'light',
  enableCaching = true,
  retryAttempts = 3,
  timeout = DEFAULT_TIMEOUT,
  onDataLoad,
  onError
}) => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Health check and monitoring
  const healthCheck = useCallback(async () => {
    try {
      const health = await consolidatedApiService.getSystemHealth();
      console.log('📊 System Health:', health);
      return health.status === 'success';
    } catch {
      return false;
    }
  }, []);

  // Cache management with TTL
  const getCachedData = useCallback((cacheKey: string): BudgetItem[] | null => {
    if (!enableCaching) return null;
    
    try {
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < CACHE_DURATION) {
          console.log('📦 Using cached budget data');
          return JSON.parse(cached);
        } else {
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_time`);
        }
      }
    } catch (err) {
      console.warn('Cache read error:', err);
    }
    
    return null;
  }, [enableCaching]);

  const setCachedData = useCallback((cacheKey: string, data: BudgetItem[]) => {
    if (!enableCaching) return;
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
      console.log('💾 Cached budget data');
    } catch (err) {
      console.warn('Cache write error:', err);
    }
  }, [enableCaching]);

  // Memoized data transformation with performance optimization
  const processedData = useMemo(() => {
    const startTime = performance.now();
    
    if (!data || data.length === 0) return [];

    const processed = data.map((item, index) => ({
      ...item,
      id: `budget-item-${index}`,
      formattedValue: formatCurrencyARS(item.value, true),
      formattedBudgeted: item.budgeted ? formatCurrencyARS(item.budgeted, true) : '',
      formattedExecuted: item.executed ? formatCurrencyARS(item.executed, true) : '',
      efficiency: item.budgeted && item.budgeted > 0 
        ? Math.round((item.executed || 0) / item.budgeted * 100)
        : 0,
      trend: item.budgeted && item.executed 
        ? (item.executed > item.budgeted * 1.05 ? 'up' : 
           item.executed < item.budgeted * 0.95 ? 'down' : 'stable')
        : 'stable'
    }));

    logPerformance('Data Processing', startTime);
    return processed;
  }, [data]);

  // Analytics and insights
  const analytics = useMemo(() => {
    if (!processedData.length) return null;

    const totalBudgeted = processedData.reduce((sum, item) => sum + (item.budgeted || 0), 0);
    const totalExecuted = processedData.reduce((sum, item) => sum + (item.executed || 0), 0);
    const executionRate = totalBudgeted > 0 ? (totalExecuted / totalBudgeted) * 100 : 0;
    
    const overBudgetItems = processedData.filter(item => 
      item.executed && item.budgeted && item.executed > item.budgeted
    );
    
    const underBudgetItems = processedData.filter(item => 
      item.executed && item.budgeted && item.executed < item.budgeted * 0.8
    );

    return {
      totalBudgeted,
      totalExecuted,
      executionRate,
      overBudgetCount: overBudgetItems.length,
      underBudgetCount: underBudgetItems.length,
      efficiencyScore: executionRate > 80 && executionRate < 110 ? 'excellent' : 
                      executionRate > 70 && executionRate < 120 ? 'good' : 'needs_improvement'
    };
  }, [processedData]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Debounced data loading function
  const loadBudgetData = useCallback(async (force = false) => {
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const startTime = performance.now();
      const cacheKey = `budget_${year}_${locale}`;

      // Check cache first
      if (!force) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          onDataLoad?.(cachedData);
          logPerformance('Cache Load', startTime);
          return;
        }
      }

      // Check network status
      if (networkStatus === 'offline') {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setError(t('budget.offlineMode', 'Modo sin conexión - datos del caché'));
        } else {
          setError(t('budget.noConnection', 'Sin conexión y sin datos en caché'));
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        // Set timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new Error(t('budget.timeout', 'Tiempo de carga agotado')));
          }, timeout);
        });

        // Health check before data fetch
        const isHealthy = await healthCheck();
        if (!isHealthy && retryCount === 0) {
          console.warn('⚠️ System health check failed, proceeding anyway...');
        }

        // Fetch data with timeout race
        const dataPromise = consolidatedApiService.getBudgetData(year);
        const budgetData = await Promise.race([dataPromise, timeoutPromise]) as BudgetData;

        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Validate data with Zod
        const validatedData = BudgetDataSchema.parse(budgetData);
        console.log('✅ Budget data validation passed');

        // Transform to chart format
        const chartData: BudgetItem[] = [
          {
            name: t('budget.totalBudget', 'Presupuesto Total'),
            value: validatedData.total_budgeted,
            budgeted: validatedData.total_budgeted,
            executed: validatedData.total_executed,
            source: t('budget.officialSource', 'Datos oficiales del municipio'),
            category: 'total'
          },
          ...(validatedData.categories 
            ? Object.entries(validatedData.categories)
                .slice(0, 8) // Limit for performance
                .map(([name, cat]) => ({
                  name: t(`budget.category.${name}`, name),
                  value: cat.executed || 0,
                  budgeted: cat.budgeted || 0,
                  executed: cat.executed || 0,
                  source: t('budget.categorySource', 'Datos de categorías presupuestarias'),
                  category: 'category'
                }))
            : []
          )
        ];

        setData(chartData);
        setLastFetch(Date.now());
        setRetryCount(0);
        
        // Cache successful result
        setCachedData(cacheKey, chartData);
        
        // Callbacks
        onDataLoad?.(chartData);
        
        logPerformance('Data Fetch', startTime);

      } catch (err: any) {
        console.error('❌ Error loading budget data:', err);
        
        // Handle different error types
        let errorMessage = t('budget.genericError', 'Error al cargar datos del presupuesto');
        
        if (err.name === 'AbortError') {
          errorMessage = t('budget.cancelled', 'Solicitud cancelada');
        } else if (err.message.includes('timeout') || err.message.includes('Tiempo')) {
          errorMessage = t('budget.timeout', 'Tiempo de carga agotado');
        } else if (err instanceof z.ZodError) {
          errorMessage = t('budget.validationError', 'Error de validación de datos');
          console.error('Validation errors:', err.errors);
        } else if (err.message.includes('fetch')) {
          errorMessage = t('budget.networkError', 'Error de conexión');
        }

        // Try fallback cache on error
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setError(t('budget.errorFallback', `${errorMessage} - usando datos del caché`));
          onDataLoad?.(cachedData);
        } else {
          // Retry logic
          if (retryCount < retryAttempts) {
            console.log(`🔄 Retrying (${retryCount + 1}/${retryAttempts})...`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => loadBudgetData(true), Math.pow(2, retryCount) * 1000); // Exponential backoff
            return;
          }
          
          setError(errorMessage);
          setData([{ 
            name: t('budget.noData', 'Sin datos'), 
            value: 0, 
            source: t('budget.errorSource', 'Error de carga')
          }]);
        }

        onError?.(errorMessage);
      } finally {
        setLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    }, DEBOUNCE_DELAY);
  }, [
    year, locale, getCachedData, setCachedData, networkStatus, retryCount, 
    retryAttempts, timeout, healthCheck, onDataLoad, onError, t
  ]);

  // Effect for year changes with cleanup
  useEffect(() => {
    loadBudgetData();

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadBudgetData]);

  // Locale change effect
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  // Skeleton UI component
  const SkeletonLoader = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6" role="status" aria-live="polite">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
        
        {/* Skeleton bars */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div 
                className="h-6 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-600 rounded" 
                style={{ width: `${Math.random() * 60 + 20}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
      
      <span className="sr-only">{t('budget.loading', 'Cargando análisis presupuestario...')}</span>
    </div>
  );

  // Error state with retry
  const ErrorState = ({ error }: { error: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            {t('budget.errorTitle', 'Error en el análisis presupuestario')}
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          
          {networkStatus === 'offline' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
              <Info className="h-4 w-4 text-yellow-500 inline mr-2" />
              <span className="text-yellow-700 dark:text-yellow-300 text-sm">
                {t('budget.offlineWarning', 'Actualmente sin conexión. Los datos pueden estar desactualizados.')}
              </span>
            </div>
          )}
          
          <button
            onClick={() => loadBudgetData(true)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={t('budget.retryLabel', 'Reintentar carga de datos presupuestarios')}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading 
              ? t('budget.retrying', 'Reintentando...') 
              : t('budget.retry', 'Reintentar')
            }
          </button>
          
          {retryCount > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              {t('budget.retryCount', 'Intento {{count}} de {{total}}', { 
                count: retryCount, 
                total: retryAttempts 
              })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Loading state
  if (loading && data.length === 0) {
    return <SkeletonLoader />;
  }

  // Error state
  if (error && data.length === 0) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="space-y-4" aria-live="polite">
      {/* Analytics Summary */}
      <AnimatePresence>
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {t('budget.totalBudgeted', 'Total Presupuestado')}
                  </p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {formatCurrencyARS(analytics.totalBudgeted, true)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {t('budget.totalExecuted', 'Total Ejecutado')}
                  </p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {formatCurrencyARS(analytics.totalExecuted, true)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {t('budget.executionRate', 'Tasa de Ejecución')}
                  </p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {analytics.executionRate.toFixed(1)}%
                  </p>
                </div>
                {analytics.executionRate > 85 ? 
                  <TrendingUp className="h-8 w-8 text-purple-500" /> :
                  <TrendingDown className="h-8 w-8 text-purple-500" />
                }
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    {t('budget.efficiency', 'Eficiencia')}
                  </p>
                  <p className="text-lg font-bold text-orange-800 dark:text-orange-200">
                    {t(`budget.efficiency.${analytics.efficiencyScore}`, 
                      analytics.efficiencyScore.replace('_', ' ')
                    )}
                  </p>
                </div>
                <Info className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error banner if data loaded from cache */}
      {error && data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3"
          role="alert"
        >
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
            <span className="text-yellow-700 dark:text-yellow-300 text-sm">{error}</span>
            <button
              onClick={() => loadBudgetData(true)}
              className="ml-auto text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200"
              aria-label={t('budget.refreshData', 'Actualizar datos')}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Chart */}
      <UniversalChart
        data={processedData}
        chartType="bar"
        title={t('budget.title', 'Análisis Presupuestario {{year}}', { year })}
        subtitle={t('budget.subtitle', 'Comparación entre presupuesto planificado y ejecutado')}
        xAxisDataKey="name"
        yAxisDataKey="value"
        height={450}
        timeRange={`${year}`}
        sources={[t('budget.source', 'Portal de Transparencia - Carmen de Areco')]}
        additionalSeries={[
          { 
            dataKey: 'budgeted', 
            name: t('budget.budgeted', 'Presupuestado'), 
            color: '#3b82f6',
            type: 'bar'
          },
          { 
            dataKey: 'executed', 
            name: t('budget.executed', 'Ejecutado'), 
            color: '#10b981',
            type: 'bar'
          }
        ]}
        metadata={{
          dataQuality: error ? 'CACHED' : 'HIGH',
          lastUpdated: new Date(lastFetch || Date.now()).toISOString(),
          source: 'municipal_budget_data',
          recordCount: processedData.length,
          networkStatus,
          cacheUsed: enableCaching
        }}
        onRetry={() => loadBudgetData(true)}
        error={null} // Handle errors locally
        loading={loading}
        enableTooltips={true}
        enableLegend={true}
        enableGrid={true}
        enableZoom={true}
        enableExport={true}
        ariaLabel={t('budget.chartAriaLabel', 'Gráfico de análisis presupuestario para el año {{year}}', { year })}
        className={`theme-${theme}`}
      />

      {/* Data freshness indicator */}
      {lastFetch > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          {t('budget.lastUpdated', 'Última actualización')}: {' '}
          {new Intl.DateTimeFormat(locale, {
            dateStyle: 'short',
            timeStyle: 'short'
          }).format(new Date(lastFetch))}
          {networkStatus === 'offline' && (
            <span className="ml-2 text-yellow-600 dark:text-yellow-400">
              ({t('budget.offline', 'sin conexión')})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(BudgetAnalysisChart);