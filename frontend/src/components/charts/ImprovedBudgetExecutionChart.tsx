import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrencyARS } from '../../utils/formatters';
import StandardizedSection from '../ui/StandardizedSection';

interface BudgetExecutionData {
  sector: string;
  budget: number;
  execution: number;
  underspent?: number;
  execution_rate?: number;
}

interface ImprovedBudgetExecutionChartProps {
  data: BudgetExecutionData[];
  year: number;
  title?: string;
  className?: string;
}

const ImprovedBudgetExecutionChart: React.FC<ImprovedBudgetExecutionChartProps> = ({
  data,
  year,
  title = "Presupuesto vs Ejecución",
  className = ""
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      underspent: item.budget - item.execution,
      execution_rate: item.budget > 0 ? (item.execution / item.budget) * 100 : 0
    }));
  }, [data]);

  // Custom tooltip for better UX
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-surface p-4 border border-gray-200 dark:border-dark-border rounded-lg shadow-xl">
          <p className="font-semibold text-gray-900 dark:text-dark-text-primary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'budget' ? 'Presupuesto:' : 'Ejecutado:'} {formatCurrencyARS(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <StandardizedSection
      title={`${title} ${year}`}
      description="Comparación entre presupuesto aprobado y ejecutado por sector"
      className={className}
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
            <XAxis 
              dataKey="sector" 
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
              tickFormatter={(value) => formatCurrencyARS(value).replace('ARS', '').trim()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="budget" name="Presupuesto" fill="#3B82F6" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`budget-${index}`} fill="#3B82F6" />
              ))}
            </Bar>
            <Bar dataKey="execution" name="Ejecutado" fill="#10B981" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`execution-${index}`} fill="#10B981" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Nota importante</h4>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              ⚠️ Ejecución alta ({'>'}95%) puede indicar devengado vs pagado. Verificar si se traduce en obras reales.
            </p>
          </div>
        </div>
      </div>
    </StandardizedSection>
  );
};

export default ImprovedBudgetExecutionChart;