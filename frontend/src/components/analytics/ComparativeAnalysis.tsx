import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { formatCurrency, formatPercentage } from '@utils/formatters';

interface ComparativeDataPoint {
  municipality: string;
  value: number;
  category?: string;
  rank?: number;
}

interface ComparativeAnalysisProps {
  data: ComparativeDataPoint[];
  currentMunicipality: string;
  title?: string;
  valueLabel?: string;
  className?: string;
}

const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({ 
  data, 
  currentMunicipality,
  title = "Análisis Comparativo",
  valueLabel = "Valor",
  className = ""
}) => {
  const comparativeData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort by value descending
    const sorted = [...data].sort((a, b) => b.value - a.value);
    
    // Add ranking
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
      isCurrent: item.municipality === currentMunicipality
    }));
  }, [data, currentMunicipality]);
  
  if (!comparativeData || comparativeData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No hay datos comparativos disponibles
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Find current municipality data
  const currentData = comparativeData.find(d => d.isCurrent);
  const currentPosition = currentData ? currentData.rank : 0;
  const currentValue = currentData ? currentData.value : 0;
  
  // Get top 3 for highlighting
  const topThree = comparativeData.slice(0, 3);
  
  // Colors for bars
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
  
  const formatValue = (value: number) => {
    return formatCurrency(value);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparativeData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                tickFormatter={formatValue}
              />
              <YAxis 
                dataKey="municipality" 
                type="category" 
                width={90}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [formatValue(Number(value)), valueLabel]}
                labelFormatter={(value) => `Municipio: ${value}`}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name={valueLabel} 
                radius={[0, 4, 4, 0]}
              >
                {comparativeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.isCurrent 
                        ? '#F59E0B' 
                        : index < 3 
                          ? COLORS[index] 
                          : '#9CA3AF'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Posición actual</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              #{currentPosition} de {comparativeData.length}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Entre municipios comparados
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">{valueLabel}</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatValue(currentValue)}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Valor para {currentMunicipality}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Comparación</h3>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {topThree.length > 0 
                ? formatPercentage((currentValue / topThree[0].value) * 100) 
                : 'N/A'}
            </p>
            <p className="text-sm text-purple-600 mt-1">
              Respecto al líder
            </p>
          </div>
        </div>
        
        {topThree.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Top 3 Municipios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topThree.map((muni, index) => (
                <div 
                  key={muni.municipality} 
                  className={`p-3 rounded-lg ${
                    muni.isCurrent 
                      ? 'bg-amber-100 border border-amber-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {muni.municipality}
                    </span>
                    <span className="text-sm font-semibold px-2 py-1 rounded-full bg-gray-200 text-gray-800">
                      #{muni.rank}
                    </span>
                  </div>
                  <p className="text-lg font-bold mt-1">
                    {formatValue(muni.value)}
                  </p>
                  {muni.category && (
                    <p className="text-xs text-gray-500 mt-1">
                      {muni.category}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparativeAnalysis;