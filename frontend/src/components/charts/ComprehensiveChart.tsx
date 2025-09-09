import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  Loader2,
  RotateCcw,
  Download,
  Eye
} from 'lucide-react';
import { formatCurrencyARS, formatPercentage } from '../../utils/formatters';
import { consolidatedApiService } from '../../services';
import monitoring from '../../utils/monitoring';
import { useAccessibility } from '../../utils/accessibility';

export type ChartType = 
  | 'budget' 
  | 'debt' 
  | 'treasury' 
  | 'salary' 
  | 'contract' 
  | 'property' 
  | 'document'
  | 'investment'
  | 'revenue';

export type ChartVariant = 'bar' | 'pie' | 'line' | 'area';

interface Props {
  type: ChartType;
  year: number;
  variant?: ChartVariant;
  title?: string;
  className?: string;
  showControls?: boolean;
  height?: number;
}

const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#6B7280', '#F97316'
];

const CHART_VARIANTS = [
  { key: 'bar', label: 'Barras', icon: <BarChart3 size={16} /> },
  { key: 'pie', label: 'Circular', icon: <PieIcon size={16} /> },
  { key: 'line', label: 'Líneas', icon: <Activity size={16} /> },
  { key: 'area', label: 'Área', icon: <TrendingUp size={16} /> }
];

// Data fetching function based on chart type
const fetchChartData = async (type: ChartType, year: number) => {
  const startTime = performance.now();
  
  try {
    let data;
    switch (type) {
      case 'budget':
        data = await consolidatedApiService.getBudgetData(year);
        break;
      case 'debt':
        data = await consolidatedApiService.getDebtData(year);
        break;
      case 'treasury':
        data = await consolidatedApiService.getTreasuryData(year);
        break;
      case 'salary':
        data = await consolidatedApiService.getSalaryData(year);
        break;
      case 'contract':
        data = await consolidatedApiService.getContractData(year);
        break;
      case 'property':
        data = await consolidatedApiService.getPropertyData(year);
        break;
      case 'investment':
        data = await consolidatedApiService.getInvestmentData(year);
        break;
      case 'revenue':
        data = await consolidatedApiService.getRevenueData(year);
        break;
      case 'document':
        data = await consolidatedApiService.getDocumentAnalysis(year);
        break;
      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }

    const duration = performance.now() - startTime;
    monitoring.captureMetric({
      name: 'chart_data_fetch_time',
      value: duration,
      unit: 'ms',
      tags: { chartType: type, year: year.toString() }
    });

    return data;
  } catch (error) {
    monitoring.captureError(error as Error, {
      chartType: type,
      year: year.toString(),
      component: 'ComprehensiveChart'
    });
    throw error;
  }
};

// Transform data for different chart types
const transformDataForChart = (data: any, type: ChartType, variant: ChartVariant) => {
  if (!data?.data) return [];

  switch (type) {
    case 'budget':
      if (data.budget_data) {
        return Object.entries(data.budget_data.categories || {}).map(([category, info]: [string, any]) => ({
          name: category,
          budgeted: info.budgeted || 0,
          executed: info.executed || 0,
          execution_rate: info.execution_rate || 0,
          variance: info.variance || 0
        }));
      }
      break;
    
    case 'debt':
      if (data.debt_data) {
        return data.debt_data.map((item: any, index: number) => ({
          name: item.debt_type || `Deuda ${index + 1}`,
          amount: item.amount || 0,
          interest_rate: item.interest_rate || 0,
          status: item.status || 'active'
        }));
      }
      break;

    case 'treasury':
      if (data.treasury_data) {
        return data.treasury_data.map((item: any, index: number) => ({
          name: item.description || `Movimiento ${index + 1}`,
          amount: item.amount || 0,
          type: item.transaction_type || 'unknown',
          date: item.date
        }));
      }
      break;

    case 'salary':
      if (data.salary_data) {
        return data.salary_data.map((item: any, index: number) => ({
          name: item.employee_name || `Empleado ${index + 1}`,
          basic_salary: item.basic_salary || 0,
          total_salary: item.total_salary || 0,
          deductions: item.total_deductions || 0
        }));
      }
      break;

    case 'contract':
      if (data.contract_data) {
        return data.contract_data.map((item: any, index: number) => ({
          name: item.description || `Contrato ${index + 1}`,
          amount: item.amount || 0,
          type: item.contract_type || 'services',
          status: item.status || 'active'
        }));
      }
      break;

    case 'property':
      if (data.property_data) {
        return data.property_data.map((item: any, index: number) => ({
          name: item.official_name || `Declarante ${index + 1}`,
          total_assets: item.total_assets || 0,
          real_estate: item.real_estate_value || 0,
          vehicles: item.vehicle_value || 0
        }));
      }
      break;

    default:
      // Generic transformation for any data
      if (Array.isArray(data.data)) {
        return data.data.slice(0, 10); // Limit to 10 items for performance
      }
      return [];
  }

  return [];
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {
            typeof entry.value === 'number' 
              ? formatCurrencyARS(entry.value)
              : entry.value
          }
        </p>
      ))}
    </div>
  );
};

const ComprehensiveChart: React.FC<Props> = ({ 
  type, 
  year, 
  variant = 'bar', 
  title,
  className = '',
  showControls = true,
  height = 400 
}) => {
  const { t } = useTranslation();
  const { prefersReducedMotion } = useAccessibility();
  const [activeVariant, setActiveVariant] = useState<ChartVariant>(variant);

  // Data fetching with React Query
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['chart-data', type, year],
    queryFn: () => fetchChartData(type, year),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: 1000
  });

  // Transform data for charts
  const chartData = useMemo(() => {
    return transformDataForChart(data, type, activeVariant);
  }, [data, type, activeVariant]);

  // Chart title
  const chartTitle = useMemo(() => {
    if (title) return title;
    
    const titles = {
      budget: `Análisis Presupuestario ${year}`,
      debt: `Análisis de Deuda ${year}`,
      treasury: `Movimientos de Tesorería ${year}`,
      salary: `Análisis Salarial ${year}`,
      contract: `Análisis de Contratos ${year}`,
      property: `Declaraciones Patrimoniales ${year}`,
      investment: `Análisis de Inversiones ${year}`,
      revenue: `Análisis de Ingresos ${year}`,
      document: `Análisis Documental ${year}`
    };
    
    return titles[type] || `Análisis ${year}`;
  }, [title, type, year]);

  // Handle export
  const handleExport = useCallback(() => {
    const csvData = chartData.map(item => Object.values(item).join(',')).join('\n');
    const headers = Object.keys(chartData[0] || {}).join(',');
    const csv = `${headers}\n${csvData}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_${year}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);

    monitoring.captureMetric({
      name: 'chart_export',
      value: 1,
      unit: 'count',
      tags: { chartType: type, format: 'csv' }
    });
  }, [chartData, type, year]);

  // Render chart based on variant
  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <Eye size={48} className="mx-auto mb-2 opacity-50" />
            <p>No hay datos disponibles para {year}</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (activeVariant) {
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip type={type} />} />
            <Legend />
          </PieChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrencyARS} />
            <Tooltip content={<CustomTooltip type={type} />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke={CHART_COLORS[0]} 
              strokeWidth={2}
              dot={{ r: 4 }}
              animationDuration={prefersReducedMotion ? 0 : 1000}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrencyARS} />
            <Tooltip content={<CustomTooltip type={type} />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke={CHART_COLORS[0]} 
              fill={CHART_COLORS[0]}
              fillOpacity={0.6}
              animationDuration={prefersReducedMotion ? 0 : 1000}
            />
          </AreaChart>
        );

      default: // bar
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrencyARS} />
            <Tooltip content={<CustomTooltip type={type} />} />
            <Legend />
            <Bar 
              dataKey="amount" 
              fill={CHART_COLORS[0]}
              animationDuration={prefersReducedMotion ? 0 : 1000}
            />
          </BarChart>
        );
    }
  };

  if (error) {
    return (
      <motion.div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {chartTitle}
          </h3>
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <AlertTriangle size={48} className="mb-2" />
          <p className="text-center mb-4">Error al cargar los datos</p>
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RotateCcw size={16} />
            <span>Reintentar</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {chartTitle}
        </h3>
        
        <div className="flex items-center space-x-2">
          {isRefetching && (
            <Loader2 size={16} className="text-blue-500 animate-spin" />
          )}
          
          {showControls && (
            <>
              <button
                onClick={handleExport}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Exportar datos"
              >
                <Download size={16} />
              </button>
              
              <button
                onClick={() => refetch()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Actualizar datos"
              >
                <RotateCcw size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chart variant selector */}
      {showControls && (
        <div className="flex flex-wrap gap-2 mb-4">
          {CHART_VARIANTS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveVariant(key as ChartVariant)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                activeVariant === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chart content */}
      <div style={{ height: `${height}px` }}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <Loader2 size={48} className="mx-auto mb-2 animate-spin text-blue-500" />
                <p className="text-gray-500 dark:text-gray-400">Cargando datos...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary stats */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {chartData.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Año</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {year}
            </p>
          </div>
          {chartData[0]?.amount && (
            <>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Mayor Valor</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyARS(Math.max(...chartData.map(d => d.amount || 0)))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyARS(chartData.reduce((sum, d) => sum + (d.amount || 0), 0))}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ComprehensiveChart;