import React, { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { formatCurrency, formatPercentage } from '@utils/formatters';

interface TrendDataPoint {
  year: number;
  value: number;
  [key: string]: number | string;
}

interface TrendAnalysisProps {
  data: TrendDataPoint[];
  title?: string;
  dataKey: string;
  comparisonDataKey?: string;
  className?: string;
  chartType?: 'line' | 'area' | 'bar';
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ 
  data, 
  title = "Análisis de Tendencias",
  dataKey,
  comparisonDataKey,
  className = "",
  chartType = "line"
}) => {
  const trendData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Calculate trend metrics
    const values = data.map(d => Number(d[dataKey]));
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate percentage change year over year
    const withTrends = data.map((d, i) => {
      const value = Number(d[dataKey]);
      const prevValue = i > 0 ? Number(data[i - 1][dataKey]) : null;
      const percentageChange = prevValue !== null && prevValue !== 0 
        ? ((value - prevValue) / prevValue) * 100 
        : 0;
      
      return {
        ...d,
        value,
        percentageChange,
        aboveAverage: value > avg ? 1 : 0,
        trend: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable'
      };
    });
    
    return withTrends;
  }, [data, dataKey]);
  
  if (!trendData || trendData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No hay datos suficientes para análisis de tendencias
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const maxValue = Math.max(...trendData.map(d => d.value));
  const minValue = Math.min(...trendData.map(d => d.value));
  
  const formatValue = (value: number) => {
    if (dataKey.includes('percentage') || dataKey.includes('rate')) {
      return formatPercentage(value);
    }
    return formatCurrency(value);
  };
  
  const renderChart = () => {
    const commonProps = {
      data: trendData,
      margin: { top: 20, right: 30, left: 20, bottom: 30 }
    };
    
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Año', position: 'insideBottom', offset: -10 }} 
              />
              <YAxis 
                domain={[minValue * 0.8, maxValue * 1.2]}
                tickFormatter={formatValue}
                label={{ value: 'Valor', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [formatValue(Number(value)), 'Valor']}
                labelFormatter={(value) => `Año: ${value}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                name={title} 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.2}
              />
              {comparisonDataKey && (
                <Area 
                  type="monotone" 
                  dataKey={comparisonDataKey} 
                  name={comparisonDataKey} 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.1}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Año', position: 'insideBottom', offset: -10 }} 
              />
              <YAxis 
                domain={[minValue * 0.8, maxValue * 1.2]}
                tickFormatter={formatValue}
                label={{ value: 'Valor', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [formatValue(Number(value)), 'Valor']}
                labelFormatter={(value) => `Año: ${value}`}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name={title} 
                fill="#3B82F6" 
              />
              {comparisonDataKey && (
                <Bar 
                  dataKey={comparisonDataKey} 
                  name={comparisonDataKey} 
                  fill="#10B981" 
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Año', position: 'insideBottom', offset: -10 }} 
              />
              <YAxis 
                domain={[minValue * 0.8, maxValue * 1.2]}
                tickFormatter={formatValue}
                label={{ value: 'Valor', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [formatValue(Number(value)), 'Valor']}
                labelFormatter={(value) => `Año: ${value}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={title} 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              {comparisonDataKey && (
                <Line 
                  type="monotone" 
                  dataKey={comparisonDataKey} 
                  name={comparisonDataKey} 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };
  
  // Calculate trend summary
  const latestValue = trendData[trendData.length - 1].value;
  const previousValue = trendData.length > 1 ? trendData[trendData.length - 2].value : null;
  const percentageChange = previousValue !== null && previousValue !== 0 
    ? ((latestValue - previousValue) / previousValue) * 100 
    : 0;
  
  const overallTrend = trendData.reduce((acc, curr) => {
    if (curr.trend === 'up') return acc + 1;
    if (curr.trend === 'down') return acc - 1;
    return acc;
  }, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {renderChart()}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Último valor</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {formatValue(latestValue)}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {previousValue !== null && (
                <span className={percentageChange >= 0 ? "text-green-600" : "text-red-600"}>
                  {percentageChange >= 0 ? "↑" : "↓"} {formatPercentage(Math.abs(percentageChange))} 
                  {" "}vs año anterior
                </span>
              )}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Tendencia general</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {overallTrend > 0 ? "Ascendente" : overallTrend < 0 ? "Descendente" : "Estable"}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Basado en {trendData.length} años de datos
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Volatilidad</h3>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {Math.round(
                (trendData.reduce((sum, d) => sum + Math.abs(d.percentageChange), 0) / 
                trendData.length) * 100
              ) / 100}%
            </p>
            <p className="text-sm text-purple-600 mt-1">
              Cambio promedio anual
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysis;