import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

interface WaterfallDataPoint {
  name: string;
  value: number;
  type: 'start' | 'increase' | 'decrease' | 'end';
  description?: string;
  category?: string;
}

interface WaterfallChartProps {
  data: WaterfallDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  locale?: string;
  currency?: string;
  showConnectors?: boolean;
  showNetChange?: boolean;
  colorScheme?: {
    start: string;
    increase: string;
    decrease: string;
    end: string;
    connector: string;
  };
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  title = 'Evolución Presupuestaria',
  subtitle = 'Seguimiento de cambios secuenciales en el presupuesto',
  height = 400,
  locale = 'es',
  currency = 'ARS',
  showConnectors = true,
  showNetChange = true,
  colorScheme = {
    start: '#3B82F6',    // Blue
    increase: '#10B981',  // Green
    decrease: '#EF4444',  // Red
    end: '#8B5CF6',      // Purple
    connector: '#6B7280'  // Gray
  }
}) => {
  const { t } = useTranslation();

  // Process data to create waterfall effect
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let cumulativeValue = 0;
    
    return data.map((item, index) => {
      const isFirst = index === 0;
      const isLast = index === data.length - 1;
      
      // Calculate positions for floating bars
      let barStart = 0;
      let barValue = item.value;
      
      if (item.type === 'start') {
        barStart = 0;
        barValue = item.value;
        cumulativeValue = item.value;
      } else if (item.type === 'end') {
        barStart = 0;
        barValue = cumulativeValue;
      } else {
        // For increase/decrease, bar starts at previous cumulative
        barStart = cumulativeValue;
        if (item.type === 'increase') {
          cumulativeValue += item.value;
        } else if (item.type === 'decrease') {
          cumulativeValue += item.value; // value is already negative
        }
        barValue = item.value;
      }

      return {
        ...item,
        barStart,
        barValue,
        cumulative: cumulativeValue,
        displayValue: Math.abs(barValue),
        color: colorScheme[item.type],
        isPositive: barValue >= 0,
        previousCumulative: index > 0 ? (processedData?.[index - 1]?.cumulative || 0) : 0
      };
    });
  }, [data, colorScheme]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (processedData.length === 0) return null;
    
    const startValue = processedData[0]?.barValue || 0;
    const endValue = processedData[processedData.length - 1]?.cumulative || 0;
    const totalIncrease = processedData
      .filter(d => d.type === 'increase')
      .reduce((sum, d) => sum + d.value, 0);
    const totalDecrease = processedData
      .filter(d => d.type === 'decrease')
      .reduce((sum, d) => sum + Math.abs(d.value), 0);
    const netChange = endValue - startValue;
    const percentChange = startValue !== 0 ? ((netChange / startValue) * 100) : 0;
    
    return {
      startValue,
      endValue,
      totalIncrease,
      totalDecrease,
      netChange,
      percentChange
    };
  }, [processedData]);

  // Custom bar shape for waterfall effect
  const CustomBarShape: React.FC<any> = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;
    
    const { type, barStart, barValue, color } = payload;
    
    // Calculate actual bar position and height
    let actualY = y;
    let actualHeight = height;
    
    if (type === 'increase' || type === 'decrease') {
      // For floating bars, adjust position based on barStart
      const chartHeight = 400; // This should match the chart height
      const yScale = chartHeight / Math.max(...processedData.map(d => Math.max(d.cumulative, d.barStart + d.displayValue)));
      
      if (type === 'increase') {
        actualHeight = Math.abs(barValue) * yScale;
        actualY = chartHeight - (barStart + barValue) * yScale;
      } else if (type === 'decrease') {
        actualHeight = Math.abs(barValue) * yScale;
        actualY = chartHeight - barStart * yScale;
      }
    }
    
    return (
      <g>
        <rect
          x={x}
          y={actualY}
          width={width}
          height={actualHeight}
          fill={color}
          stroke={color}
          strokeWidth={0}
          rx={4}
          ry={4}
        />
        
        {/* Value label on top of bar */}
        <text
          x={x + width / 2}
          y={actualY - 8}
          textAnchor="middle"
          fill="#374151"
          fontSize={12}
          fontWeight="600"
        >
          {type === 'decrease' ? '-' : '+'}{formatCurrency(Math.abs(barValue))}
        </text>
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-xs">
          <div className="font-semibold text-gray-900 dark:text-white mb-2">
            {data.name}
          </div>
          
          {data.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {data.description}
            </div>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Cambio:</span>
              <span className={`font-medium ${
                data.type === 'decrease' ? 'text-red-600' : 
                data.type === 'increase' ? 'text-green-600' : 
                'text-blue-600'
              }`}>
                {data.type === 'decrease' && '-'}
                {formatCurrency(Math.abs(data.value))}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Acumulado:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.cumulative)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {data.type === 'increase' ? 'Aumento' :
                 data.type === 'decrease' ? 'Reducción' :
                 data.type === 'start' ? 'Inicial' : 'Final'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get icon for change type
  const getChangeIcon = (type: string, isPositive: boolean) => {
    const baseClass = "h-5 w-5";
    
    switch (type) {
      case 'increase':
        return <TrendingUp className={`${baseClass} text-green-500`} />;
      case 'decrease':
        return <TrendingDown className={`${baseClass} text-red-500`} />;
      case 'start':
      case 'end':
        return <DollarSign className={`${baseClass} text-blue-500`} />;
      default:
        return <AlertCircle className={`${baseClass} text-gray-500`} />;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            </div>
          </div>
          
          {/* Net change indicator */}
          {summaryStats && showNetChange && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                summaryStats.netChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summaryStats.netChange >= 0 ? '+' : ''}
                {formatCurrency(summaryStats.netChange)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Cambio neto ({summaryStats.percentChange >= 0 ? '+' : ''}
                {summaryStats.percentChange.toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div 
          style={{ width: '100%', height }}
          role="img"
          aria-label={`${title} - Gráfico cascada mostrando evolución presupuestaria`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                opacity={0.6}
              />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                stroke="#6B7280"
              />
              <YAxis 
                fontSize={12}
                stroke="#6B7280"
                tickFormatter={(value) => formatCurrency(value).replace(/[₹$€£¥]/g, '')}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar
                dataKey="displayValue"
                shape={<CustomBarShape />}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Valor Inicial
                </span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(summaryStats.startValue)}
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Aumentos
                </span>
              </div>
              <div className="text-lg font-semibold text-green-600">
                +{formatCurrency(summaryStats.totalIncrease)}
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Reducciones
                </span>
              </div>
              <div className="text-lg font-semibold text-red-600">
                -{formatCurrency(summaryStats.totalDecrease)}
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Valor Final
                </span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(summaryStats.endValue)}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: colorScheme.start }}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Inicial</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: colorScheme.increase }}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Aumento</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: colorScheme.decrease }}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Reducción</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: colorScheme.end }}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Final</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 Las barras flotantes muestran cambios incrementales desde el valor anterior. 
            Las barras completas representan valores iniciales y finales.
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterfallChart;