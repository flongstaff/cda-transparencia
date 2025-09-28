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
import { motion } from 'framer-motion';
import { formatCurrencyARS } from '../../utils/formatters';

interface BudgetExecutionData {
  sector: string;
  budget: number;
  execution: number;
  underspent?: number;
  execution_rate?: number;
}

interface BudgetExecutionChartProps {
  data: BudgetExecutionData[];
  year: number;
  title?: string;
  className?: string;
}

const BudgetExecutionChart: React.FC<BudgetExecutionChartProps> = ({
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title} {year}</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Presupuesto</span>
          <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
          <span>Ejecutado</span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="sector" 
              tick={{ fontSize: 12 }} 
              height={60}
              angle={-45}
              textAnchor="end"
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={(value) => formatCurrencyARS(value).replace('ARS', '').trim()}
            />
            <Tooltip 
              formatter={(value, name) => [
                formatCurrencyARS(Number(value)), 
                name === 'budget' ? 'Presupuesto' : 'Ejecutado'
              ]}
            />
            <Legend />
            <Bar dataKey="budget" name="Presupuesto" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="execution" name="Ejecutado" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Nota:</p>
        <p>⚠️ Ejecución alta ({'>'}95%) puede indicar devengado vs pagado. Verificar si se traduce en obras reales.</p>
      </div>
    </motion.div>
  );
};

export default BudgetExecutionChart;
