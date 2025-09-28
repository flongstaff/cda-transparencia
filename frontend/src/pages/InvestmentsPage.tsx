import React, { useState } from 'react';
import { useMasterData } from '../hooks/useMasterData';
import PageYearSelector from '../components/forms/PageYearSelector';
import { formatCurrencyARS } from '../utils/formatters';
import { Building } from 'lucide-react';

const InvestmentsPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
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
    switchYear
  } = useMasterData(selectedYear);
  
  // Get investments data from masterData
  const currentInvestments = masterData?.yearData?.investments || masterData?.yearData?.budget?.investments || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Building className="w-8 h-8 inline-block mr-2" /> Inversiones
          </h1>
          <p className="text-gray-600">
            Activos e inversiones del municipio para el año {selectedYear}
          </p>
        </div>
        <PageYearSelector
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando datos de inversiones…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-700">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentInvestments && currentInvestments.items && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detalle de Inversiones</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depreciación</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Neto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condición</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentInvestments.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrencyARS(item.value)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrencyARS(item.depreciation)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrencyARS(item.net_value)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsPage;
