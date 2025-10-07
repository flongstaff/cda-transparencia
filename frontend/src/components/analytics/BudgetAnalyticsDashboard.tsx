import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import PredictiveAnalytics from './PredictiveAnalytics';
import TrendAnalysis from './TrendAnalysis';
import ComparativeAnalysis from './ComparativeAnalysis';
import AnomalyDetection from './AnomalyDetection';

interface BudgetAnalyticsDashboardProps {
  budgetData: any[];
  contractsData: any[];
  salariesData: any[];
  treasuryData: any[];
  debtData: any[];
  documentsData: any[];
  currentYear: number;
  className?: string;
}

const BudgetAnalyticsDashboard: React.FC<BudgetAnalyticsDashboardProps> = ({
  budgetData,
  contractsData,
  salariesData,
  treasuryData,
  debtData,
  documentsData,
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

  // Prepare contracts trend data
  const contractsTrendData = contractsData?.map((item: any) => ({
    year: item.year,
    value: item.total_amount || item.amount || 0,
    count: item.total_contracts || item.contracts_count || 0
  })) || [];

  // Prepare salaries trend data
  const salariesTrendData = salariesData?.map((item: any) => ({
    year: item.year,
    value: item.average_salary || item.avg_salary || 0,
    employees: item.total_employees || item.employee_count || 0
  })) || [];

  // Prepare treasury trend data
  const treasuryTrendData = treasuryData?.map((item: any) => ({
    year: item.year,
    value: item.balance || item.cash_balance || 0,
    revenue: item.total_revenue || item.revenue || 0,
    expenses: item.total_expenses || item.expenses || 0
  })) || [];

  // Prepare debt trend data
  const debtTrendData = debtData?.map((item: any) => ({
    year: item.year,
    value: item.total_debt || item.debt_amount || 0,
    type: item.debt_type || 'Deuda'
  })) || [];

  // Prepare documents trend data
  const documentsTrendData = documentsData?.map((item: any) => ({
    year: item.year,
    value: item.total_documents || item.documents_count || 0,
    category: item.category || 'Documentos'
  })) || [];

  // Prepare comparative data for budget analysis
  const budgetComparativeData = [
    { municipality: 'Carmen de Areco', value: budgetForecastData[budgetForecastData.length - 1]?.budgeted || 0 },
    { municipality: 'San Andrés de Areco', value: 110000000 },
    { municipality: 'Chivilcoy', value: 180000000 },
    { municipality: 'Chacabuco', value: 95000000 },
    { municipality: 'Pergamino', value: 150000000 },
    { municipality: 'Salto', value: 85000000 },
    { municipality: 'Capitán Sarmiento', value: 75000000 },
    { municipality: 'San Antonio de Areco', value: 120000000 }
  ];

  // Prepare anomaly detection data for budget
  const budgetAnomalyData = budgetForecastData.map((item: any, index: number) => ({
    id: `budget-${index}`,
    x: item.year,
    y: item.executionRate,
    label: `Ejecución presupuestaria ${item.year}`,
    value: item.executionRate,
    expected: 0.85, // Expected execution rate
    deviation: Math.abs((item.executionRate || 0) - 0.85),
    severity: item.executionRate < 0.7 ? 'critical' : 
              item.executionRate < 0.8 ? 'high' : 
              item.executionRate > 1.1 ? 'medium' : 'low',
    category: 'budget',
    timestamp: `${item.year}-01-01`,
    description: `Tasa de ejecución presupuestaria para el año ${item.year}`
  }));

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>💰 Análisis Presupuestario Avanzado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <h3 className="font-semibold text-green-800">Ejecutado</h3>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ${(budgetForecastData[budgetForecastData.length - 1]?.executed || 0).toLocaleString('es-AR')}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {(budgetForecastData[budgetForecastData.length - 1]?.executionRate || 0) * 100}%
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Contratos</h3>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {contractsTrendData[contractsTrendData.length - 1]?.count || 0}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  ${(contractsTrendData[contractsTrendData.length - 1]?.value || 0).toLocaleString('es-AR')}
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800">Personal</h3>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {salariesTrendData[salariesTrendData.length - 1]?.employees || 0}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  Avg: ${(salariesTrendData[salariesTrendData.length - 1]?.value || 0).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Indicadores Presupuestarios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Ejecución vs Año Anterior</span>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(
                        (((budgetForecastData[budgetForecastData.length - 1]?.executed || 0) - 
                        (budgetForecastData[budgetForecastData.length - 2]?.executed || 0)) / 
                        (budgetForecastData[budgetForecastData.length - 2]?.executed || 1)) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (((budgetForecastData[budgetForecastData.length - 1]?.executed || 0) - 
                        (budgetForecastData[budgetForecastData.length - 2]?.executed || 0)) >= 0 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`} 
                      style={{ 
                        width: `${Math.min(100, 
                          Math.abs(
                            (((budgetForecastData[budgetForecastData.length - 1]?.executed || 0) - 
                            (budgetForecastData[budgetForecastData.length - 2]?.executed || 0)) / 
                            (budgetForecastData[budgetForecastData.length - 2]?.executed || 1))
                          ) * 100)
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Presupuesto vs Ejecutado</span>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(
                        (((budgetForecastData[budgetForecastData.length - 1]?.budgeted || 0) - 
                        (budgetForecastData[budgetForecastData.length - 1]?.executed || 0)) / 
                        (budgetForecastData[budgetForecastData.length - 1]?.budgeted || 1)) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, 
                          Math.abs(
                            (((budgetForecastData[budgetForecastData.length - 1]?.budgeted || 0) - 
                            (budgetForecastData[budgetForecastData.length - 1]?.executed || 0)) / 
                            (budgetForecastData[budgetForecastData.length - 1]?.budgeted || 1)
                          ) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Documentos Procesados</span>
                    <span className="text-sm font-bold text-gray-900">
                      {documentsTrendData[documentsTrendData.length - 1]?.value || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, 
                          (documentsTrendData[documentsTrendData.length - 1]?.value || 0) / 1000 * 100
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
          data={budgetForecastData.map((item: any) => ({
            year: item.year,
            value: item.executionRate,
            budgeted: item.budgeted,
            executed: item.executed
          }))}
          title="Tendencia de Ejecución Presupuestaria"
          dataKey="value"
          chartType="line"
          className="h-full"
        />
        
        <TrendAnalysis
          data={contractsTrendData}
          title="Tendencia de Contrataciones"
          dataKey="value"
          chartType="area"
          className="h-full"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ComparativeAnalysis
          data={budgetComparativeData}
          currentMunicipality="Carmen de Areco"
          title="Comparativo Presupuestario Municipal"
          valueLabel="Presupuesto Total (ARS)"
          className="h-full"
        />
        
        <AnomalyDetection
          data={budgetAnomalyData}
          title="Detección de Anomalías Presupuestarias"
          xAxisLabel="Año"
          yAxisLabel="Tasa de Ejecución"
          className="h-full"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendAnalysis
          data={salariesTrendData}
          title="Tendencia Salarial"
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

export default BudgetAnalyticsDashboard;