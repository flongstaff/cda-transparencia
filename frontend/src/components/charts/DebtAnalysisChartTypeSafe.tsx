import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3, Activity, AlertTriangle, Loader2 } from 'lucide-react';
import { consolidatedApiService } from '../../services/ConsolidatedApiService';
import { formatCurrencyARS } from '../../utils/formatters';
import BaseChart from './BaseChart';
import type { ChartTooltipProps, DebtItem, DebtAnalytics } from '../../types/chart';

// Comprehensive Zod Schemas
const DebtItemSchema = z.object({
  debt_type: z.string().min(1, 'Debt type is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  interest_rate: z.number().min(0).max(100, 'Interest rate must be between 0-100%'),
  due_date: z.string().datetime().or(z.string().date()),
  status: z.enum(['active', 'paid', 'overdue']),
  principal_amount: z.number().min(0).optional(),
  accrued_interest: z.number().min(0).optional()
});

const DebtDataResponseSchema = z.object({
  debt_data: z.array(DebtItemSchema),
  total_debt: z.number().min(0),
  average_interest_rate: z.number().min(0),
  long_term_debt: z.number().min(0),
  short_term_debt: z.number().min(0),
  debt_by_type: z.record(z.number().min(0)),
  metadata: z.object({
    year: z.number().int().min(2000).max(2030),
    last_updated: z.string(),
    source: z.string()
  })
});

type DebtDataResponse = z.infer<typeof DebtDataResponseSchema>;

interface Props {
  year: number;
  locale?: string;
  theme?: 'light' | 'dark';
  enableCache?: boolean;
  onDataLoad?: (data: DebtAnalytics) => void;
  onError?: (error: Error) => void;
}

// Chart colors with accessibility in mind
const COLORS = [
  '#3B82F6', // Blue - Primary debt
  '#EF4444', // Red - High-risk debt  
  '#10B981', // Green - Low-risk/performing debt
  '#F59E0B', // Amber - Medium-risk debt
  '#8B5CF6', // Purple - Government bonds
  '#EC4899', // Pink - Special financing
  '#6B7280', // Gray - Other/miscellaneous
  '#14B8A6'  // Teal - Infrastructure debt
];

const CHART_TYPES = [
  { key: 'bar', label: 'Barras', icon: <BarChart3 size={16} />, ariaLabel: 'Gráfico de barras' },
  { key: 'pie', label: 'Circular', icon: <PieIcon size={16} />, ariaLabel: 'Gráfico circular' },
  { key: 'line', label: 'Líneas', icon: <Activity size={16} />, ariaLabel: 'Gráfico de líneas' }
] as const;

type ChartType = typeof CHART_TYPES[number]['key'];

// Proper debt calculation utilities
const calculateDebtAnalytics = (debtItems: DebtItem[]): DebtAnalytics => {
  if (!debtItems.length) {
    return {
      totalDebt: 0,
      averageInterestRate: 0,
      longTermDebt: 0,
      shortTermDebt: 0,
      debtByType: [],
      riskMetrics: {
        debtRatio: 0,
        interestBurden: 0,
        maturityProfile: 'short'
      }
    };
  }

  const currentDate = new Date();
  const totalDebt = debtItems.reduce((sum, debt) => sum + debt.amount, 0);
  const averageInterestRate = debtItems.reduce((sum, debt) => sum + debt.interest_rate, 0) / debtItems.length;

  // Calculate short-term vs long-term debt based on actual due dates
  let shortTermDebt = 0;
  let longTermDebt = 0;

  debtItems.forEach(debt => {
    try {
      const dueDate = new Date(debt.due_date);
      const daysDifference = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference <= 365) {
        shortTermDebt += debt.amount;
      } else {
        longTermDebt += debt.amount;
      }
    } catch (error) {
      console.warn('Invalid due date for debt item:', debt, error);
      // Default to long-term if date parsing fails
      longTermDebt += debt.amount;
    }
  });

  // Group debt by type with proper aggregation
  const debtByTypeMap = debtItems.reduce((acc, debt) => {
    const type = debt.debt_type || 'Otros';
    acc[type] = (acc[type] || 0) + debt.amount;
    return acc;
  }, {} as Record<string, number>);

  const debtByType = Object.entries(debtByTypeMap)
    .map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
      percentage: totalDebt > 0 ? (value / totalDebt) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate risk metrics
  const averageMaturityDays = debtItems
    .map(debt => {
      try {
        const dueDate = new Date(debt.due_date);
        return Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      } catch {
        return 365; // Default to 1 year if parsing fails
      }
    })
    .reduce((sum, days) => sum + days, 0) / debtItems.length;

  const maturityProfile: 'short' | 'medium' | 'long' = 
    averageMaturityDays < 365 ? 'short' :
    averageMaturityDays < 1095 ? 'medium' : // 3 years
    'long';

  const totalInterestBurden = debtItems.reduce((sum, debt) => 
    sum + (debt.amount * debt.interest_rate / 100), 0
  );

  return {
    totalDebt,
    averageInterestRate: parseFloat(averageInterestRate.toFixed(2)),
    longTermDebt,
    shortTermDebt,
    debtByType,
    riskMetrics: {
      debtRatio: shortTermDebt / totalDebt,
      interestBurden: totalInterestBurden,
      maturityProfile
    }
  };
};

const DebtAnalysisChart: React.FC<Props> = ({ 
  year, 
  locale = 'es',
  theme = 'light',
  enableCache = true,
  onDataLoad,
  onError 
}) => {
  const { t } = useTranslation();
  const [activeChartType, setActiveChartType] = useState<ChartType>('bar');
  const abortControllerRef = useRef<AbortController | null>(null);

  // React Query with proper typing and caching
  const {
    data: rawDebtData,
    isLoading,
    error,
    refetch,
    isError,
    isFetched
  } = useQuery<DebtDataResponse, Error>({
    queryKey: ['debt-analysis', year, locale],
    queryFn: async ({ signal }) => {
      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        
        const rawData = await consolidatedApiService.getMunicipalDebt(year);
        
        // Validate data with Zod
        const validatedData = DebtDataResponseSchema.parse(rawData);
        
        console.log('✅ Debt data validation passed:', {
          totalRecords: validatedData.debt_data.length,
          totalDebt: validatedData.total_debt,
          year: validatedData.metadata.year
        });

        return validatedData;
      } catch (err) {
        if (err instanceof z.ZodError) {
          const validationError = new Error(
            `Debt data validation failed: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
          );
          console.error('❌ Zod validation errors:', err.errors);
          throw validationError;
        }
        throw err;
      }
    },
    staleTime: enableCache ? 5 * 60 * 1000 : 0, // 5 minutes
    gcTime: enableCache ? 10 * 60 * 1000 : 0, // 10 minutes
    retry: (failureCount, error) => {
      if (error.message.includes('validation')) return false; // Don't retry validation errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Memoized analytics calculation
  const analytics = useMemo<DebtAnalytics | null>(() => {
    if (!rawDebtData?.debt_data) return null;

    const calculatedAnalytics = calculateDebtAnalytics(rawDebtData.debt_data);
    
    // Call data load callback
    if (onDataLoad && isFetched && !isError) {
      onDataLoad(calculatedAnalytics);
    }

    return calculatedAnalytics;
  }, [rawDebtData, onDataLoad, isFetched, isError]);

  // Error handling callback
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Properly typed custom tooltip
  const CustomTooltip = useCallback(({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload?.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl"
        role="tooltip"
        aria-live="polite"
      >
        <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {entry.name}: {formatCurrencyARS(entry.value)}
              {analytics && analytics.totalDebt > 0 && (
                <span className="ml-1 text-xs text-gray-500">
                  ({((entry.value / analytics.totalDebt) * 100).toFixed(1)}%)
                </span>
              )}
            </span>
          </div>
        ))}
      </motion.div>
    );
  }, [analytics]);

  // Chart rendering with proper types
  const renderChart = useCallback(() => {
    if (!analytics) return null;

    const chartProps = {
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    switch (activeChartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.debtByType} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 12 }}
                aria-label="Tipos de deuda"
              />
              <YAxis 
                tickFormatter={(value) => formatCurrencyARS(value, true)} 
                width={100}
                aria-label="Monto de deuda"
              />
              <Tooltip content={CustomTooltip} />
              <Legend />
              <Bar dataKey="value" name="Monto de Deuda" radius={[4, 4, 0, 0]}>
                {analytics.debtByType.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    aria-label={`${entry.name}: ${formatCurrencyARS(entry.value)}`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={analytics.debtByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={140}
                dataKey="value"
                nameKey="name"
              >
                {analytics.debtByType.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    aria-label={`${entry.name}: ${entry.percentage.toFixed(1)}% del total`}
                  />
                ))}
              </Pie>
              <Tooltip content={CustomTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
      default: {
        // Generate time series based on actual debt maturity dates
        const timeSeriesData = rawDebtData?.debt_data
          ?.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
          ?.slice(0, 12) // Show next 12 debt payments
          ?.map((debt, index) => ({
            month: new Date(debt.due_date).toLocaleDateString(locale, { month: 'short' }),
            debt: debt.amount,
            cumulative: rawDebtData.debt_data
              .slice(0, index + 1)
              .reduce((sum, d) => sum + d.amount, 0),
            interest: debt.amount * (debt.interest_rate / 100)
          })) || [];
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeSeriesData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                aria-label="Cronograma de vencimientos"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => formatCurrencyARS(value, true)}
                aria-label="Monto"
              />
              <Tooltip content={CustomTooltip} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="debt" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                name="Deuda por Vencimiento"
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="interest" 
                stroke="#EF4444" 
                strokeWidth={2} 
                name="Interés Estimado"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    }
  }, [analytics, activeChartType, rawDebtData, locale, CustomTooltip]);

  // Risk assessment component
  const RiskAssessment = ({ riskMetrics }: { riskMetrics: DebtAnalytics['riskMetrics'] }) => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
        Evaluación de Riesgo Financiero
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {(riskMetrics.debtRatio * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ratio Deuda Corto Plazo</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrencyARS(riskMetrics.interestBurden, true)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Carga de Intereses Anual</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 capitalize">
            {t(`debt.maturity.${riskMetrics.maturityProfile}`, riskMetrics.maturityProfile)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Perfil de Vencimientos</p>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center h-64" 
        role="status" 
        aria-live="polite"
        aria-label={t('debt.loading', 'Cargando análisis de deuda')}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('debt.loading', 'Cargando análisis de deuda...')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !analytics) {
    return (
      <div 
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
            {t('debt.error.title', 'Error al cargar datos de deuda')}
          </h3>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300">
          {error?.message || t('debt.error.generic', 'No se pudieron cargar los datos de deuda municipal')}
        </p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={t('debt.retry.label', 'Reintentar carga de datos de deuda')}
        >
          {t('debt.retry', 'Reintentar')}
        </button>
      </div>
    );
  }

  return (
    <BaseChart
      title={t('debt.title', `Análisis de Deuda Municipal ${year}`)}
      subtitle={t('debt.subtitle', 'Composición, riesgo y evolución de la deuda pública')}
      loading={isLoading}
      error={error?.message || null}
      onRetry={() => refetch()}
      controls={
        <div className="flex items-center space-x-2" role="group" aria-label="Tipos de gráfico">
          {CHART_TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => setActiveChartType(type.key)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                activeChartType === type.key
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={type.ariaLabel}
              aria-pressed={activeChartType === type.key}
            >
              {type.icon}
              <span className="ml-1 hidden sm:inline">{type.label}</span>
            </button>
          ))}
        </div>
      }
    >
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrencyARS(analytics.totalDebt, true)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Deuda Total</p>
        </div>
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.averageInterestRate.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tasa Promedio</p>
        </div>
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrencyARS(analytics.shortTermDebt, true)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Corto Plazo (&lt;1 año)</p>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrencyARS(analytics.longTermDebt, true)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Largo Plazo (&gt;1 año)</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 mb-6" role="img" aria-label={`Gráfico de ${activeChartType} mostrando análisis de deuda municipal`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChartType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderChart()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Risk Assessment */}
      <RiskAssessment riskMetrics={analytics.riskMetrics} />

      {/* Debt Composition Details */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg mt-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Composición Detallada de la Deuda</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.debtByType.map((debtType, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center flex-1">
                <div 
                  className="w-4 h-4 rounded-full mr-3" 
                  style={{ backgroundColor: debtType.color }}
                  aria-hidden="true"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white block">
                    {debtType.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {debtType.percentage.toFixed(1)}% del total
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrencyARS(debtType.value, true)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Metadata */}
      {rawDebtData?.metadata && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-600 pt-4">
          <p>
            Fuente: {rawDebtData.metadata.source} | 
            Última actualización: {new Date(rawDebtData.metadata.last_updated).toLocaleDateString(locale)} | 
            {rawDebtData.debt_data.length} registros de deuda
          </p>
        </div>
      )}
    </BaseChart>
  );
};

export default React.memo(DebtAnalysisChart);