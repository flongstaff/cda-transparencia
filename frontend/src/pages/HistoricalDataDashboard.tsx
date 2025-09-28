import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMasterData } from '../hooks/useMasterData';
import UnifiedChart from '../components/charts/UnifiedChart';

const HistoricalDataDashboard: React.FC = () => {
  const [selectedYear] = useState<number>(new Date().getFullYear());
  
  // Use unified master data service
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    currentDebt,
    loading,
    error,
    totalDocuments,
    availableYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear,
    multiYearData,
    budgetHistoricalData,
    contractsHistoricalData,
    salariesHistoricalData,
    documentsHistoricalData,
    debtHistoricalData,
    treasuryHistoricalData
  } = useMasterData(selectedYear);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800">Error al cargar los datos</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Histórico</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800">Años Disponibles</h3>
            <p className="text-2xl font-bold text-blue-600">{availableYears.length}</p>
            <p className="text-sm text-blue-600">{availableYears.join(', ')}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-medium text-green-800">Total Documentos</h3>
            <p className="text-2xl font-bold text-green-600">{masterData?.metadata.totalDocuments || 0}</p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <h3 className="font-medium text-amber-800">Categorías</h3>
            <p className="text-2xl font-bold text-amber-600">{masterData?.metadata.categories.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Budget Trends Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Evolución Presupuestaria</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Presupuesto Total vs Ejecutado</h3>
            <UnifiedChart 
              type="budget-trend" 
              year={new Date().getFullYear()} 
              variant="line"
              height={300}
            />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Tasa de Ejecución</h3>
            <UnifiedChart 
              type="budget-trend" 
              year={new Date().getFullYear()} 
              variant="bar"
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Contracts and Documents Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Evolución de Contratos</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <UnifiedChart 
              type="contract-trend" 
              year={new Date().getFullYear()} 
              variant="line"
              height={300}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documentos por Año</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <UnifiedChart 
              type="document-trend" 
              year={new Date().getFullYear()} 
              variant="bar"
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Multi-year Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Comparación Multi-Año</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableYears.slice(0, 6).map((year) => {
            const yearData = multiYearData[year];
            if (!yearData) return null;
            
            return (
              <div key={year} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{year}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Presupuesto:</span>
                    <span className="font-medium">
                      {yearData.budget?.total_budget ? `${(yearData.budget?.total_budget / 1000000).toFixed(1)}M` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contratos:</span>
                    <span className="font-medium">{yearData.contracts?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Empleados:</span>
                    <span className="font-medium">{yearData.salaries?.length || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default HistoricalDataDashboard;