import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useAccessibility } from '../../utils/accessibility';
import { monitoring } from '../../utils/monitoring';
import { chartAccessibility } from '../../utils/accessibility';
import ChartSkeleton from '../ui/ChartSkeleton';

// Data validation schema
const dataPointSchema = {
  isValid: (props: Record<string, unknown>) => 
    typeof item === 'object' &&
    item !== null &&
    typeof item.label === 'string' &&
    typeof item.value === 'number' &&
    ['start', 'increase', 'decrease', 'end'].includes(item.type),
};

interface WaterfallDataPoint {
  label: string;
  value: number;
  type: 'start' | 'increase' | 'decrease' | 'end';
}

interface WaterfallChartProps {
  data?: WaterfallDataPoint[];
  currency?: string;
  showTotal?: boolean;
  colorScheme?: {
    positive: string;
    negative: string;
    neutral: string;
    start: string;
    end: string;
  };
  onStepClick?: (dataPoint: any, index: number) => void;
  className?: string;
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  currency = 'ARS',
  showTotal = true,
  colorScheme = {
    positive: '#10B981',
    negative: '#EF4444',
    neutral: '#6B7280',
    start: '#3B82F6',
    end: '#8B5CF6',
  },
  onStepClick,
  className = '',
}) => {
  const { prefersReducedMotion, isScreenReader, language } = useAccessibility();
  const [error, setError] = useState<Error | null>(null);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    try {
      if (data == null) {
        // Handle case where data is explicitly null or undefined
        if (data === null) {
          const err = new Error("Data cannot be null.");
          setError(err);
          monitoring.captureError(err, { tags: { chartType: 'waterfall' } });
        }
        return;
      }

      if (!Array.isArray(data)) {
        throw new Error("Data must be an array.");
      }

      const validatedData = data.filter(item => {
        const isValid = dataPointSchema.isValid(item);
        if (!isValid) {
          monitoring.captureError(new Error('Invalid data point detected'), {
            tags: { chartType: 'waterfall' },
            extra: { item },
          });
        }
        return isValid;
      });

      let cumulative = 0;
      const processed = validatedData.map(item => {
        const prevCumulative = cumulative;
        if (item.type === 'start' || item.type === 'end') {
          cumulative = item.value;
          return { ...item, cumulative: item.value, previous: 0 };
        }
        cumulative += item.value;
        return { ...item, cumulative, previous: prevCumulative };
      });

      setProcessedData(processed);
      setTotal(cumulative);
      setError(null);

      const renderTime = performance.now() - startTime;
      monitoring.captureMetric({
        name: 'chart_render_time',
        value: renderTime,
        unit: 'ms',
        tags: { chartType: 'waterfall' },
      });

    } catch (err) {
      setError(err as Error);
      monitoring.captureError(err as Error, { tags: { chartType: 'waterfall' } });
    }
  }, [data]);

  const handleExport = useCallback(() => {
    // Basic export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Label,Value,Type\n"
      + processedData.map(d => `${d.label},${d.value},${d.type}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "waterfall-chart-data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    monitoring.captureMetric({
      name: 'chart_export',
      value: 1,
      unit: 'count',
      tags: { chartType: 'waterfall' },
    });
  }, [processedData]);

  const formatCurrency = useMemo(() => {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [currency, language]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const change = item.value;
      const percentageChange = item.previous !== 0 ? (change / item.previous) * 100 : 0;

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
          <p className="font-semibold text-gray-800">{label}</p>
          <p style={{ color: item.value > 0 ? colorScheme.positive : colorScheme.negative }}>
            Change: {formatCurrency.format(change)}
          </p>
          {item.type !== 'start' && (
            <p className="text-gray-600">
              {percentageChange.toFixed(2)}% vs previous
            </p>
          )}
          <p className="text-gray-600">Cumulative: {formatCurrency.format(item.cumulative)}</p>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 text-red-700 p-4 rounded-lg">
        Error al cargar el gráfico.
      </div>
    );
  }

  if (!data) {
    return <ChartSkeleton data-testid="chart-skeleton" />;
  }

  if (processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-4">
        No hay datos disponibles.
      </div>
    );
  }

  const chartDescription = chartAccessibility.generateChartDescription('waterfall', 'Budget evolution', processedData.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className} ${prefersReducedMotion ? 'motion-reduce:animate-none' : ''}`}
      role="img"
      aria-label={chartDescription}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={processedData} onClick={(e) => e && onStepClick && onStepClick(e.activePayload?.[0]?.payload, e.activeTooltipIndex)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis tickFormatter={(tick) => formatCurrency.format(tick)} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value">
            {processedData.map((entry, index) => {
              let color = colorScheme.neutral;
              if (entry.type === 'start') color = colorScheme.start;
              else if (entry.type === 'end') color = colorScheme.end;
              else if (entry.value > 0) color = colorScheme.positive;
              else if (entry.value < 0) color = colorScheme.negative;
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {showTotal && (
        <div className="text-right font-bold text-lg p-2">
          Total: {formatCurrency.format(total)}
        </div>
      )}
      {isScreenReader && (
        <div data-testid="waterfall-description" className="sr-only">
          {chartDescription}
        </div>
      )}
       <button onClick={handleExport} className="text-sm text-gray-600 hover:text-gray-900">
        Exportar
      </button>
    </motion.div>
  );
};

export default WaterfallChart;
