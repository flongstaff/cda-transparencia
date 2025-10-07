import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import PredictiveAnalytics from './PredictiveAnalytics';
import TrendAnalysis from './TrendAnalysis';
import ComparativeAnalysis from './ComparativeAnalysis';
import AnomalyDetection from './AnomalyDetection';

interface FinancialAnalyticsDashboardProps {
  budgetData: any[];
  spendingData: any[];
  revenueData: any[];
  treasuryData: any[];
  debtData: any[];
  currentYear: number;
  className?: string;
}

const FinancialAnalyticsDashboard: React.FC<FinancialAnalyticsDashboardProps> = ({
  budgetData,
  spendingData,
  revenueData,
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

  // Prepare treasury trend data
  const treasuryTrendData = treasuryData?.map((item: any) => ({
    year: item.year,
    value: item.balance || item.cash_balance || item.amount || 0,
    category: item.category || 'Tesorería'
  })) || [];

  // Prepare debt trend data
  const debtTrendData = debtData?.map((item: any) => ({
    year: item.year,
    value: item.total_debt || item.debt_amount || item.amount || 0,
    category: item.category || 'Deuda'
  })) || [];

  // Prepare comparative data with similar municipalities
  const comparativeData = [
    { municipality: 'Carmen de Areco', value: budgetForecastData[budgetForecastData.length - 1]?.budgeted || 0 },
    { municipality: 'San Andrés de Areco', value: 110000000 },
    { municipality: 'Chivilcoy', value: 180000000 },
    { municipality: 'Chacabuco', value: 95000000 },
    { municipality: 'Pergamino', value: 150000000 },
    { municipality: 'Salto', value: 85000000 },
    { municipality: 'Capitán Sarmiento', value: 75000000 },
    { municipality: 'San Antonio de Areco', value: 120000000 }
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
        <Card className="h-full">
          <CardHeader>
            <CardTitle>📊 Análisis Financiero Integral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Presupuesto Total</h3>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  ${(budgetForecastData[budgetForecastData.length - 1]?.budgeted || 0).toLocaleString('es-AR')}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Año {currentYear}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Ejecución</h3>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {Math.round((budgetForecastData[budgetForecastData.length - 1]?.executionRate || 0) * 100)}%
                </p>
                <p className="text-sm text-green-600 mt-1">
                  vs presupuestado
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Deuda Total</h3>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  ${(debtTrendData[debtTrendData.length - 1]?.value || 0).toLocaleString('es-AR')}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  Año {currentYear}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Indicadores Clave</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Relación Deuda/Presupuesto</span>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(
                        ((debtTrendData[debtTrendData.length - 1]?.value || 0) / 
                        (budgetForecastData[budgetForecastData.length - 1]?.budgeted || 1)) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, 
                          ((debtTrendData[debtTrendData.length - 1]?.value || 0) / 
                          (budgetForecastData[budgetForecastData.length - 1]?.budgeted || 1)) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Margen de Tesorería</span>
                    <span className="text-sm font-bold text-gray-900">
                      ${(treasuryTrendData[treasuryTrendData.length - 1]?.value || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (treasuryTrendData[treasuryTrendData.length - 1]?.value || 0) > 0 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`} 
                      style={{ 
                        width: `${Math.min(100, 
                          Math.abs(treasuryTrendData[treasuryTrendData.length - 1]?.value || 0) / 
                          (budgetForecastData[budgetForecastData.length - 1]?.budgeted || 1) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <PredictiveAnalytics 
          historicalData={budgetForecastData}
          currentYear={currentYear}
          title="Predicción de Presupuesto"
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ComparativeAnalysis
          data={comparativeData}
          currentMunicipality="Carmen de Areco"
          title="Comparativo Presupuestario Municipal"
          valueLabel="Presupuesto Total (ARS)"
          className="h-full"
        />
        
        <AnomalyDetection
          data={anomalyData}
          title="Detección de Anomalías en Gastos"
          xAxisLabel="Año"
          yAxisLabel="Monto (ARS)"
          className="h-full"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendAnalysis
          data={treasuryTrendData}
          title="Tendencia de Tesorería"
          dataKey="value"
          chartType="bar"
          className="h-full"
        />
        
        <TrendAnalysis
          data={debtTrendData}
          title="Evolución de la Deuda"
          dataKey="value"
          chartType="line"
          className="h-full"
        />
      </div>
    </div>
  );
};

export default FinancialAnalyticsDashboard;