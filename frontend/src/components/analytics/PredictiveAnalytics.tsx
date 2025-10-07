import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { formatCurrency } from '@utils/formatters';

interface BudgetDataPoint {
  year: number;
  budgeted: number;
  executed: number;
  executionRate: number;
}

interface PredictiveAnalyticsProps {
  historicalData: BudgetDataPoint[];
  currentYear: number;
  title?: string;
  className?: string;
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ 
  historicalData, 
  currentYear,
  title = "Predicción de Presupuesto",
  className = ""
}) => {
  // Simple linear regression for budget prediction
  const predictiveData = useMemo(() => {
    if (!historicalData || historicalData.length < 2) return [];
    
    // Calculate trend lines
    const years = historicalData.map(d => d.year);
    const budgetedValues = historicalData.map(d => d.budgeted);
    const executedValues = historicalData.map(d => d.executed);
    
    // Linear regression function
    const linearRegression = (x: number[], y: number[]) => {
      const n = x.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      
      for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
      }
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return { slope, intercept };
    };
    
    const budgetedTrend = linearRegression(years, budgetedValues);
    const executedTrend = linearRegression(years, executedValues);
    
    // Generate predictions for next 3 years
    const predictions = [];
    for (let i = 0; i < 3; i++) {
      const year = currentYear + i + 1;
      const predictedBudgeted = Math.max(0, budgetedTrend.slope * year + budgetedTrend.intercept);
      const predictedExecuted = Math.max(0, executedTrend.slope * year + executedTrend.intercept);
      const predictedExecutionRate = predictedBudgeted > 0 ? (predictedExecuted / predictedBudgeted) * 100 : 0;
      
      predictions.push({
        year,
        budgeted: predictedBudgeted,
        executed: predictedExecuted,
        executionRate: predictedExecutionRate,
        type: 'prediction'
      });
    }
    
    // Combine historical and predicted data
    const combinedData = [
      ...historicalData.map(d => ({ ...d, type: 'historical' })),
      ...predictions
    ];
    
    return combinedData;
  }, [historicalData, currentYear]);
  
  if (!predictiveData || predictiveData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No hay suficientes datos históricos para realizar predicciones
          </p>
        </CardContent>
      </Card>
    );
  }
  
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
              data={predictiveData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Año', position: 'insideBottom', offset: -10 }} 
              />
              <YAxis 
                tickFormatter={formatValue}
                label={{ value: 'Monto (ARS)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [formatValue(Number(value)), 'Monto']}
                labelFormatter={(value) => `Año: ${value}`}
              />
              <Legend />
              <Bar 
                dataKey="budgeted" 
                name="Presupuestado" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="executed" 
                name="Ejecutado" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Próximos 3 años</h3>
            <p className="text-sm text-blue-600 mt-1">
              Predicción basada en tendencias históricas
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">
              Ejecución promedio: {
                predictiveData
                  .filter(d => d.type === 'prediction')
                  .reduce((sum, d) => sum + d.executionRate, 0) / 
                predictiveData.filter(d => d.type === 'prediction').length
              }%
            </h3>
            <p className="text-sm text-green-600 mt-1">
              Basado en predicciones futuras
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">
              Crecimiento esperado: {
                Math.round((
                  (predictiveData[predictiveData.length - 1].budgeted - 
                   predictiveData[0].budgeted) / 
                  predictiveData[0].budgeted
                ) * 100)
              }%
            </h3>
            <p className="text-sm text-purple-600 mt-1">
              Proyectado para los próximos años
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveAnalytics;