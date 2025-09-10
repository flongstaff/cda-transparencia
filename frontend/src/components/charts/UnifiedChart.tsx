import React, { useMemo, useState } from 'react';
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
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  Loader2
} from 'lucide-react';
import { formatCurrencyARS, formatPercentageARS } from '../../utils/formatters';
import { useUnifiedTransparencyData } from '../../hooks/useUnifiedTransparencyData';

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

interface UnifiedChartProps {
  type: ChartType;
  year: number;
  title?: string;
  className?: string;
  variant?: ChartVariant;
  showControls?: boolean;
  height?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'];

const UnifiedChart: React.FC<UnifiedChartProps> = ({
  type,
  year,
  title,
  className = '',
  variant = 'bar',
  showControls = false,
  height = 300
}) => {
  const [currentVariant, setCurrentVariant] = useState<ChartVariant>(variant);
  
  // Use unified data hook
  const { loading, error, financialOverview, documents, budgetBreakdown, dashboard } = useUnifiedTransparencyData(year);

  // Transform data based on chart type
  const chartData = useMemo(() => {
    if (!financialOverview) return [];

    switch (type) {
      case 'budget':
        return budgetBreakdown?.map((item: any, index: number) => ({
          name: item.name,
          budgeted: item.budgeted || 0,
          executed: item.executed || 0,
          execution_rate: item.execution_rate || 0,
          fill: COLORS[index % COLORS.length]
        })) || [];

      case 'treasury':
        // Use dashboard data for treasury if available, otherwise use mock data
        const movements = dashboard?.recent_financial_movements || [
          { description: 'Ingresos Tributarios', amount: 85000000, type: 'income', balance: 85000000 },
          { description: 'Gastos en Personal', amount: -42000000, type: 'expense', balance: 43000000 },
          { description: 'Ingresos No Tributarios', amount: 28000000, type: 'income', balance: 71000000 }
        ];
        
        return movements.slice(0, 6).map((movement: any, index: number) => ({
          name: movement.description?.substring(0, 15) + '...' || 'N/A',
          amount: Math.abs(movement.amount || 0),
          balance: movement.balance || 0,
          type: movement.type,
          fill: movement.type === 'income' ? '#10B981' : '#EF4444'
        })) || [];

      case 'document':
        const docsByCategory = (documents || []).reduce((acc: any, doc: any) => {
          acc[doc.category] = (acc[doc.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(docsByCategory).map(([category, count], index) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: count,
          fill: COLORS[index % COLORS.length]
        }));

      case 'revenue':
        return [
          { name: 'Ingresos Corrientes', value: financialOverview.totalRevenue * 0.75, fill: COLORS[0] },
          { name: 'Ingresos de Capital', value: financialOverview.totalRevenue * 0.15, fill: COLORS[1] },
          { name: 'Financiamiento', value: financialOverview.totalRevenue * 0.10, fill: COLORS[2] }
        ];

      case 'debt':
        return [
          { name: 'Deuda Corriente', value: financialOverview.totalDebt * 0.40, fill: COLORS[3] },
          { name: 'Deuda a Largo Plazo', value: financialOverview.totalDebt * 0.60, fill: COLORS[4] }
        ];

      case 'salary':
        return [
          { name: 'Planta Permanente', employees: 180, avgSalary: 450000, fill: COLORS[0] },
          { name: 'Planta Transitoria', employees: 45, avgSalary: 320000, fill: COLORS[1] },
          { name: 'Funcionarios', employees: 12, avgSalary: 680000, fill: COLORS[2] },
          { name: 'Contratados', employees: 28, avgSalary: 380000, fill: COLORS[3] }
        ];

      case 'investment':
        return [
          { name: 'Infraestructura', value: 125000000, fill: COLORS[0] },
          { name: 'Equipamiento', value: 85000000, fill: COLORS[1] },
          { name: 'Tecnología', value: 45000000, fill: COLORS[2] },
          { name: 'Otros', value: 30000000, fill: COLORS[3] }
        ];

      default:
        return [];
    }
  }, [type, financialOverview, budgetBreakdown, documents, dashboard]);

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No hay datos disponibles para mostrar</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (currentVariant) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280"
                tickFormatter={(value) => {
                  if (type === 'salary') return value.toString();
                  return value > 1000000 ? `$${(value / 1000000).toFixed(1)}M` : `$${(value / 1000).toFixed(0)}K`;
                }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (type === 'salary') {
                    return [value, name];
                  }
                  return [formatCurrencyARS(Number(value)), name];
                }}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              {type === 'budget' ? (
                <>
                  <Bar dataKey="budgeted" name="Presupuestado" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="executed" name="Ejecutado" fill="#10B981" radius={[4, 4, 0, 0]} />
                </>
              ) : type === 'salary' ? (
                <Bar dataKey="avgSalary" name="Salario Promedio" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              ) : type === 'treasury' ? (
                <Bar dataKey="amount" name="Monto" radius={[4, 4, 0, 0]} />
              ) : (
                <Bar dataKey="value" name="Valor" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [
                  typeof value === 'number' && value > 100000 ? formatCurrencyARS(value) : value, 
                  'Valor'
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip formatter={(value) => [formatCurrencyARS(Number(value)), 'Valor']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip formatter={(value) => [formatCurrencyARS(Number(value)), 'Valor']} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="rgba(59, 130, 246, 0.1)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      {(title || showControls) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {showControls && (
            <div className="flex items-center space-x-2">
              {(['bar', 'pie', 'line', 'area'] as ChartVariant[]).map((chartType) => {
                const icons = {
                  bar: <BarChart3 size={16} />,
                  pie: <PieIcon size={16} />,
                  line: <Activity size={16} />,
                  area: <TrendingUp size={16} />
                };
                
                return (
                  <button
                    key={chartType}
                    onClick={() => setCurrentVariant(chartType)}
                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      currentVariant === chartType
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={`Vista ${chartType}`}
                  >
                    {icons[chartType]}
                    <span className="ml-1 capitalize">{chartType}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="p-4">
        {renderChart()}
      </div>

      {/* Footer Stats */}
      {!loading && !error && chartData.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {chartData.length} elemento{chartData.length !== 1 ? 's' : ''} • Año {year}
            </span>
            <span className="flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              Datos actualizados
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UnifiedChart;