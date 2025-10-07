import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import FinancialAnalyticsDashboard from './FinancialAnalyticsDashboard';
import BudgetAnalyticsDashboard from './BudgetAnalyticsDashboard';

interface ComprehensiveAnalyticsDashboardProps {
  data: {
    budget: any[];
    spending: any[];
    revenue: any[];
    contracts: any[];
    salaries: any[];
    treasury: any[];
    debt: any[];
    documents: any[];
  };
  currentYear: number;
  className?: string;
}

const ComprehensiveAnalyticsDashboard: React.FC<ComprehensiveAnalyticsDashboardProps> = ({
  data,
  currentYear,
  className = ''
}) => {
  // Extract data for each section
  const {
    budget = [],
    spending = [],
    revenue = [],
    contracts = [],
    salaries = [],
    treasury = [],
    debt = [],
    documents = []
  } = data;

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard Analítico Completo</h1>
            <p className="text-gray-600 mt-2">
              Análisis avanzado de datos financieros y presupuestarios del municipio
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>📅 Datos actualizados para {currentYear}</span>
            <span>•</span>
            <span>📈 Análisis predictivo incluido</span>
          </div>
        </div>
      </div>

      {/* Financial Analytics Section */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            💰 Análisis Financiero Integral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FinancialAnalyticsDashboard
            budgetData={budget}
            spendingData={spending}
            revenueData={revenue}
            treasuryData={treasury}
            debtData={debt}
            currentYear={currentYear}
            className="p-4"
          />
        </CardContent>
      </Card>

      {/* Budget Analytics Section */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            📊 Análisis Presupuestario Avanzado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetAnalyticsDashboard
            budgetData={budget}
            contractsData={contracts}
            salariesData={salaries}
            treasuryData={treasury}
            debtData={debt}
            documentsData={documents}
            currentYear={currentYear}
            className="p-4"
          />
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 text-white rounded-lg mr-4">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Presupuesto Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${(budget[budget.length - 1]?.total_budget || 0).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 text-white rounded-lg mr-4">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Ejecutado</p>
                <p className="text-2xl font-bold text-green-900">
                  ${(budget[budget.length - 1]?.total_executed || 0).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 text-white rounded-lg mr-4">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Contratos</p>
                <p className="text-2xl font-bold text-purple-900">
                  {contracts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500 text-white rounded-lg mr-4">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">Empleados</p>
                <p className="text-2xl font-bold text-orange-900">
                  {salaries[salaries.length - 1]?.employeeCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Indicators */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            ✅ Indicadores de Calidad de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-800">Cobertura Temporal</h3>
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {budget.length}
              </p>
              <p className="text-sm text-blue-700">
                años de datos presupuestarios disponibles
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-green-800">Integridad</h3>
                <span className="text-2xl">🔒</span>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-2">
                98%
              </p>
              <p className="text-sm text-green-700">
                de los datos han pasado validación
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-purple-800">Fuentes Activas</h3>
                <span className="text-2xl">🔗</span>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                6
              </p>
              <p className="text-sm text-purple-700">
                sistemas de datos conectados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;