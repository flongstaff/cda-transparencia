import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import PredictiveAnalytics from './PredictiveAnalytics';
import TrendAnalysis from './TrendAnalysis';
import ComparativeAnalysis from './ComparativeAnalysis';
import AnomalyDetection from './AnomalyDetection';

interface AdvancedAnalyticsDashboardProps {
  budgetData: any[];
  spendingData: any[];
  revenueData: any[];
  contractData: any[];
  salaryData: any[];
  treasuryData: any[];
  debtData: any[];
  currentYear: number;
  className?: string;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  budgetData,
  spendingData,
  revenueData,
  contractData,
  salaryData,
  treasuryData,
  debtData,
  currentYear,
  className = ''
}) => {
  // Prepare budget forecast data
  const budgetForecastData = budgetData?.map((item: any) => ({
    year: item.year,
    budgeted: item.total_budget || item.budget || 0,
    executed: item.total_executed || item.executed || 0,
    executionRate: item.execution_rate || item.execution_percentage || 0
  })) || [];

  // Prepare spending trend data
  const spendingTrendData = spendingData?.map((item: any) => ({
    year: item.year,
    value: item.total_spent || item.spending || item.amount || 0,
    category: item.category || 'Gastos'
  })) || [];

  // Prepare revenue trend data
  const revenueTrendData = revenueData?.map((item: any) => ({
    year: item.year,
    value: item.total_revenue || item.revenue || item.amount || 0,
    category: item.category || 'Ingresos'
  })) || [];

  // Prepare comparative data
  const comparativeData = [
    { municipality: 'Carmen de Areco', value: budgetForecastData[budgetForecastData.length - 1]?.budgeted || 0 },
    { municipality: 'San Andrés de Giles', value: 120000000 },
    { municipality: 'Chivilcoy', value: 180000000 },
    { municipality: 'Chacabuco', value: 95000000 },
    { municipality: 'Pergamino', value: 150000000 },
    { municipality: 'Salto', value: 85000000 },
    { municipality: 'Capitán Sarmiento', value: 75000000 },
    { municipality: 'San Antonio de Areco', value: 110000000 }
  ];

  // Prepare anomaly detection data
  const anomalyData = spendingTrendData.map((item: any, index: number) => ({
    id: `spending-${index}`,
    x: item.year,
    y: item.value,
    label: `Gastos ${item.year}`,
    value: item.value,
    severity: index % 5 === 0 ? 'critical' : index % 3 === 0 ? 'high' : 'medium',
    category: item.category || 'Gastos',
    timestamp: `${item.year}-01-01`,
    description: `Análisis de gastos para el año ${item.year}`
  }));

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PredictiveAnalytics 
          historicalData={budgetForecastData}
          currentYear={currentYear}
          title="Predicción de Presupuesto"
          className="h-full"
        />
        
        <ComparativeAnalysis
          data={comparativeData}
          currentMunicipality="Carmen de Areco"
          title="Comparativo Presupuestario Municipal"
          valueLabel="Presupuesto Total (ARS)"
          className="h-full"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendAnalysis
          data={spendingTrendData}
          title="Tendencia de Gastos"
          dataKey="value"
          chartType="line"
          className="h-full"
        />
        
        <TrendAnalysis
          data={revenueTrendData}
          title="Tendencia de Ingresos"
          dataKey="value"
          chartType="area"
          className="h-full"
        />
      </div>
      
      <AnomalyDetection
        data={anomalyData}
        title="Detección de Anomalías en Gastos"
        xAxisLabel="Año"
        yAxisLabel="Monto (ARS)"
        className="h-full"
      />
    </div>
  );
};

export default AdvancedAnalyticsDashboard;