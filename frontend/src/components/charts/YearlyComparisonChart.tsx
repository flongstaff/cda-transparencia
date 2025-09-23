import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { formatCurrencyARS } from '../../utils/formatters';
import { useYearlyComparisonData } from '../../hooks/useYearlyComparisonData';

interface YearlyComparisonChartProps {
  type: 'budget' | 'debt' | 'revenue' | 'investment';
  title?: string;
  years?: number[];
  height?: number;
}

const YearlyComparisonChart: React.FC<YearlyComparisonChartProps> = ({
  type,
  title,
  years,
  height = 300
}) => {
  const { data, loading, error } = useYearlyComparisonData(type, years);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Error al cargar datos históricos: {error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No hay datos históricos disponibles para {title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: height }}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(value) => formatCurrencyARS(Number(value))} />
          <Tooltip formatter={(value) => formatCurrencyARS(Number(value))} />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name={title} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YearlyComparisonChart;
