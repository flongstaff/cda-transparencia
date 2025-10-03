import React, { useMemo } from 'react';
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  formatCurrencyARS, 
  formatPercentageARS, 
  formatDateARS 
} from '../../utils/formatters';
import { useUnifiedData } from '../../hooks/useUnifiedData';

// Define consistent color palette for all charts
const CHART_COLORS = {
  primary: '#2563eb',    // Blue for primary series
  secondary: '#10B981',   // Green for secondary series
  tertiary: '#f97316',   // Orange for tertiary series
  quaternary: '#8B5CF6',  // Purple for quaternary series
  quintenary: '#EC4899',  // Pink for quintenary series
  sextant: '#6B7280',    // Gray for sextant series
  septenary: '#14B8A6',   // Teal for septenary series
  octonary: '#F59E0B',    // Amber for octenary series
  danger: '#dc3545',     // Red for alerts/warnings
  success: '#28a745',    // Green for success/positive data
  warning: '#ffc107'     // Yellow for warnings
};

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'combo';

interface ConsistentDataVisualizationProps {
  visualizationType: 'chart' | 'table' | 'grid';
  chartType?: ChartType;
  tableType?: 'summary' | 'detail' | 'comparison';
  pageType: 'budget' | 'treasury' | 'debt' | 'contracts' | 'salaries' | 'documents';
  year: number;
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  valueFormatter?: (value: number) => string;
  xAxisKey?: string;
  yAxisKeys?: string[];
  multiSourceComparison?: boolean; // Whether to include data from multiple sources (RAFAM, GBA, etc.)
}

/**
 * Consistent Data Visualization Component
 * Provides standardized visualization across all pages using unified data sources
 * Integrates local CSV/JSON with external API data (RAFAM, GBA, AFIP, etc.)
 */
const ConsistentDataVisualization: React.FC<ConsistentDataVisualizationProps> = ({
  visualizationType,
  chartType = 'bar',
  tableType = 'summary',
  pageType,
  year,
  title,
  description,
  height = 400,
  className = '',
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  valueFormatter = formatCurrencyARS,
  xAxisKey = 'name',
  yAxisKeys = ['value'],
  multiSourceComparison = false
}) => {
  // Use the unified data hook to fetch data from all sources
  const { data, externalData, loading, error, sources } = useUnifiedData({ 
    page: pageType, 
    year,
    includeExternal: multiSourceComparison
  });

  // Format data for visualization based on page type
  const formattedData = useMemo(() => {
    if (!data) return [];

    // Process data based on page type and apply standardization
    switch (pageType) {
      case 'budget':
        return Array.isArray(data.budget_execution) ? 
          data.budget_execution.map((item: any) => ({
            name: item.sector || item.category || item.name || 'N/A',
            budgeted: Number(item.budgeted || item.budget || item.presupuesto || 0),
            executed: Number(item.executed || item.execution || item.ejecutado || 0),
            execution_rate: Number(item.execution_rate || item.rate || 0),
            difference: Number(item.budgeted || item.budget || item.presupuesto || 0) - 
                       Number(item.executed || item.execution || item.ejecutado || 0)
          })) : [{
            name: 'Total',
            budgeted: Number(data.total_budget || data.total_presupuesto || 0),
            executed: Number(data.total_executed || data.total_ejecutado || 0),
            execution_rate: Number(data.execution_rate || data.ejecucion_rate || 0),
            difference: Number(data.total_budget || data.total_presupuesto || 0) - 
                       Number(data.total_executed || data.total_ejecutado || 0)
          }];

      case 'treasury':
        return Array.isArray(data.entries) ? 
          data.entries.map((item: any) => ({
            name: item.category || item.source || item.name || 'N/A',
            income: Number(item.income || item.ingreso || 0),
            expense: Number(item.expense || item.gasto || 0),
            balance: Number(item.balance || item.saldo || 0)
          })) : [{
            name: 'Total',
            income: Number(data.total_income || data.total_ingreso || 0),
            expense: Number(data.total_expense || data.total_gasto || 0),
            balance: Number(data.total_balance || data.total_saldo || 0)
          }];

      case 'debt':
        return Array.isArray(data.debts) ? 
          data.debts.map((item: any) => ({
            name: item.type || item.category || item.name || 'N/A',
            amount: Number(item.amount || item.monto || 0),
            service: Number(item.service || item.service_debt || 0)
          })) : [{
            name: 'Total',
            amount: Number(data.total_debt || data.total_monto || 0),
            service: Number(data.total_service || data.total_service_debt || 0)
          }];

      case 'contracts':
        return Array.isArray(data.contracts) ? 
          data.contracts.map((item: any) => ({
            name: item.title || item.description || item.name || 'Contrato',
            amount: Number(item.amount || item.monto || 0),
            status: item.status || 'Pendiente'
          })) : [];

      case 'salaries':
        return Array.isArray(data.salaries) ? 
          data.salaries.map((item: any) => ({
            name: item.position || item.role || item.category || 'Cargo',
            count: Number(item.count || item.quantity || 1),
            avg_salary: Number(item.avg_salary || item.average || 0),
            total: Number(item.total || item.total_salary || 0)
          })) : [{
            name: 'Total',
            count: Number(data.employee_count || data.total_employees || 0),
            avg_salary: Number(data.average_salary || data.salario_promedio || 0),
            total: Number(data.total_payroll || data.nomina_total || 0)
          }];

      case 'documents':
        return Array.isArray(data.documents) ? 
          data.documents.map((item: any) => ({
            name: item.category || item.type || item.area || 'Categoría',
            count: Number(item.count || item.quantity || 1),
            year: Number(item.year || year)
          })) : [{
            name: 'Total',
            count: Number(data.total_documents || data.document_count || 0),
            year
          }];

      default:
        return Array.isArray(data) ? data : [];
    }
  }, [data, pageType, year]);

  // External data for multi-source comparison
  const externalComparisonData = useMemo(() => {
    if (!multiSourceComparison || !externalData) return [];

    // Process external data for comparison charts
    const comparisonData = [];

    if (externalData.rafam) {
      comparisonData.push({
        source: 'RAFAM',
        ...externalData.rafam
      });
    }

    if (externalData.gba) {
      comparisonData.push({
        source: 'Provincial',
        ...externalData.gba
      });
    }

    if (externalData.carmenOfficial) {
      comparisonData.push({
        source: 'Municipal',
        ...externalData.carmenOfficial
      });
    }

    return comparisonData;
  }, [externalData, multiSourceComparison]);

  // Combined data for comparison
  const combinedData = useMemo(() => {
    if (multiSourceComparison && externalComparisonData.length > 0) {
      // Combine local and external data for comparison
      return [...formattedData, ...externalComparisonData];
    }
    return formattedData;
  }, [formattedData, externalComparisonData, multiSourceComparison]);

  // Format tooltip values
  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [valueFormatter(value), name];
    }
    return [value, name];
  };

  // Custom tooltip component with consistent styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-3"
        >
          <p className="font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
            {label || 'Datos'}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-dark-text-secondary">
                    {entry.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  {formatTooltipValue(entry.value, entry.name)[0]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom legend component with consistent styling
  const CustomLegend = ({ payload }: any) => {
    if (!payload || !showLegend) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700 dark:text-dark-text-secondary">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render appropriate visualization based on type
  const renderVisualization = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center p-4">
            <div className="text-red-500 text-2xl mb-2">⚠️</div>
            <p className="text-gray-600">Error al cargar datos: {error}</p>
            <p className="text-sm text-gray-500 mt-1">Verificando fuentes alternativas...</p>
          </div>
        </div>
      );
    }

    if (combinedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 text-2xl mb-2">📊</div>
            <p className="text-gray-600">No hay datos disponibles para mostrar</p>
            <p className="text-sm text-gray-500 mt-1">Integrando fuentes de datos...</p>
          </div>
        </div>
      );
    }

    if (visualizationType === 'chart') {
      return renderChart();
    } else if (visualizationType === 'table') {
      return renderTable();
    } else {
      return renderGrid();
    }
  };

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: combinedData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                className="dark:stroke-gray-700" 
              />
            )}
            <XAxis 
              dataKey={xAxisKey}
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              height={60}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis 
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              tickFormatter={(value) => valueFormatter(value).replace(/ARS/g, '').replace(/$/g, '').trim()}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend content={<CustomLegend />} />}
            {yAxisKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                name={key}
                fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                radius={[4, 4, 0, 0]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {combinedData.map((entry, entryIndex) => (
                  <Cell 
                    key={`cell-${entryIndex}`} 
                    fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]} 
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                className="dark:stroke-gray-700" 
              />
            )}
            <XAxis 
              dataKey={xAxisKey}
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              height={60}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis 
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              tickFormatter={(value) => valueFormatter(value).replace(/ARS/g, '').replace(/$/g, '').trim()}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend content={<CustomLegend />} />}
            {yAxisKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                className="cursor-pointer"
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                className="dark:stroke-gray-700" 
              />
            )}
            <XAxis 
              dataKey={xAxisKey}
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              height={60}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis 
              tick={{ 
                fontSize: 12,
                fill: '#4b5563',
                className: 'dark:fill-gray-300'
              }}
              tickFormatter={(value) => valueFormatter(value).replace(/ARS/g, '').replace(/$/g, '').trim()}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend content={<CustomLegend />} />}
            {yAxisKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                fillOpacity={0.2}
                strokeWidth={2}
                className="cursor-pointer"
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        const pieData = combinedData.map((item, index) => ({
          name: item[xAxisKey],
          value: item[yAxisKeys[0]] || 0,
          fill: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]
        })).filter(item => item.value > 0);

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [valueFormatter(Number(value)), 'Valor']}
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderColor: '#e5e7eb',
                color: '#000',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
          </PieChart>
        );

      default:
        return null;
    }
  };

  // Render table visualization
  const renderTable = () => {
    if (combinedData.length === 0) return null;

    const headers = Object.keys(combinedData[0]).filter(key => 
      key !== 'fill' && key !== 'source' // Exclude styling keys
    );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {headers.map((header) => (
                <th 
                  key={header} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {header
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                  }
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {combinedData.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
              >
                {headers.map((header) => (
                  <td 
                    key={header} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                  >
                    {typeof row[header] === 'number' && (header.includes('amount') || header.includes('budget') || header.includes('value') || header.includes('total'))
                      ? valueFormatter(row[header])
                      : String(row[header])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render grid visualization
  const renderGrid = () => {
    if (combinedData.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {combinedData.map((item, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {item[xAxisKey] || `Item ${index + 1}`}
            </h3>
            {yAxisKeys.map((key, keyIndex) => (
              <div key={keyIndex} className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {typeof item[key] === 'number' 
                    ? valueFormatter(item[key]) 
                    : String(item[key])
                  }
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 ${className}`}
    >
      {/* Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {description}
            </p>
          )}
          
          {/* Data source indicator */}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              📊 Datos Integrados
            </span>
            {multiSourceComparison && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                🔗 Fuentes Múltiples
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              📅 Año {year}
            </span>
          </div>
        </div>
      )}

      {/* Visualization container */}
      <div className={`h-80 w-full max-w-full overflow-x-auto ${visualizationType === 'grid' ? 'h-auto' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          {renderVisualization()}
        </ResponsiveContainer>
      </div>

      {/* Data source footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between items-center">
          <span>
            Fuentes: {sources ? sources.join(', ') : 'Datos locales y API'}
          </span>
          <span>
            Actualizado: {new Date().toLocaleDateString('es-AR')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsistentDataVisualization;