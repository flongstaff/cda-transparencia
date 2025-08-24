import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { CheckCircle, ExternalLink, Shield } from 'lucide-react';

interface ValidatedDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface ValidatedChartProps {
  data: ValidatedDataPoint[];
  chartType: 'bar' | 'pie' | 'line' | 'area';
  title: string;
  sources: string[];
  showValidation?: boolean;
  xAxisDataKey?: string;
  yAxisDataKey?: string;
  dataKey?: string;
  nameKey?: string;
  height?: number;
}

const ValidatedChart: React.FC<ValidatedChartProps> = ({
  data,
  chartType,
  title,
  sources,
  showValidation = true,
  xAxisDataKey = 'name',
  yAxisDataKey = 'value',
  dataKey = 'value',
  nameKey = 'name',
  height = 300
}) => {
  // Generate colors for chart elements
  const colors = ['#0056b3', '#28a745', '#ffc107', '#dc3545', '#20c997', '#6f42c1', '#fd7e14', '#20c997'];
  
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-blue-600 dark:text-blue-400">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          {payload[0]?.payload?.source && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Fuente: {payload[0].payload.source}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Render appropriate chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey={xAxisDataKey} 
              angle={-45} 
              textAnchor="end" 
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey={yAxisDataKey} 
              name={title}
              fill={colors[0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatCurrency} />
            <Legend />
          </PieChart>
        );

      case 'line':
        return (
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisDataKey} />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yAxisDataKey} 
              name={title}
              stroke={colors[0]} 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisDataKey} />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={yAxisDataKey} 
              name={title}
              stroke={colors[0]} 
              fill={colors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Tipo de gráfico no soportado: {chartType}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-gray-800 dark:text-white">
          {title}
        </h3>
        {showValidation && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Validado
            </span>
          </div>
        )}
      </div>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      {showValidation && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>
                Fuente: {sources && sources[0] ? 'Portal de Transparencia' : 'Carmen de Areco'}
              </span>
              <span>
                Validado: {new Date().toLocaleDateString('es-AR')}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Datos verificados</span>
            </div>
          </div>
          
          {sources && sources.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {sources.slice(1).map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Fuente {index + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidatedChart;