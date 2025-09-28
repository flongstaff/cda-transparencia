import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, Wallet, CreditCard } from 'lucide-react';
import PageYearSelector from '../components/forms/PageYearSelector';

interface DebtAnalysisDashboardProps {
  year?: number;
  className?: string;
}

const DebtAnalysisDashboard: React.FC<DebtAnalysisDashboardProps> = ({ 
  year = new Date().getFullYear(),
  className = '' 
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(year);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              💳 Análisis de Deuda Municipal
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Análisis integral de la deuda pública para el año {selectedYear}
            </p>
          </div>
          
          <PageYearSelector
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            availableYears={Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)}
          />
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debt Overview Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <ComprehensiveChart
            type="debt"
            year={selectedYear}
            title={`Evolución de la Deuda ${selectedYear}`}
            variant="bar"
            showControls={true}
            className="h-96"
          />
        </div>

        {/* Debt Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <ComprehensiveChart
            type="debt"
            year={selectedYear}
            title={`Distribución por Tipo de Deuda ${selectedYear}`}
            variant="pie"
            showControls={false}
            className="h-96"
          />
        </div>

        {/* Debt Trend Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 col-span-full">
          <ComprehensiveChart
            type="debt"
            year={selectedYear}
            title={`Tendencia de Deuda Histórica`}
            variant="line"
            showControls={true}
            className="h-96"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deuda Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Cargando...</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Servicio de Deuda</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Cargando...</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ratio Deuda/Presupuesto</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Cargando...</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado de Riesgo</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Evaluando...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtAnalysisDashboard;