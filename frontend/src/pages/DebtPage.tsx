import React, { useState, useMemo } from 'react';
import { useMasterData } from '../hooks/useMasterData';
import PageYearSelector from '../components/forms/PageYearSelector';
import { formatCurrencyARS } from '../utils/formatters';
import { CreditCard, AlertCircle, TrendingUp } from 'lucide-react';

const DebtPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // 🚀 Use the unified master data service
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

  // Extract debt data from comprehensive data service
  const debtData = useMemo(() => {
    if (!currentDebt) return null;
    
    // Try different possible debt data sources
    return currentDebt;
  }, [currentDebt]);

  // Calculate total debt amount
  const totalDebt = useMemo(() => {
    if (!debtData) return 0;
    
    // Try different ways to get total debt
    if (debtData.items && Array.isArray(debtData.items)) {
      return debtData.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    }
    
    // If debtData is not an array, try to get a total amount from the object
    return debtData.total_debt || debtData.total_amount || debtData.amount || debtData.total || 0;
  }, [debtData]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <CreditCard className="w-8 h-8 inline-block mr-2" /> Deuda Pública
          </h1>
          <p className="text-gray-600">
            Deuda pública del municipio para el año {selectedYear}
          </p>
          <div className="mt-2 flex items-center">
            <TrendingUp className="w-5 h-5 text-red-500 mr-1" />
            <span className="text-lg font-semibold text-gray-900">
              Total Deuda: {formatCurrencyARS(totalDebt)}
            </span>
          </div>
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
            <p className="text-gray-600 dark:text-gray-400">Cargando datos de deuda…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-700">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400" />
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

      {debtData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detalle de la Deuda</h2>
          
          {Array.isArray(debtData.items) && debtData.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Deuda</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa de Interés</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Vencimiento</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {debtData.items.map((item: any, index: number) => (
                    <tr key={item.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.debt_type || 'Deuda'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description || 'Sin descripción'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrencyARS(item.amount || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.interest_rate || 0}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status || 'Pendiente'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos de deuda</h3>
              <p className="text-gray-600">No se encontraron registros de deuda para el año {selectedYear}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Multi-year debt comparison section - only shown when we have multi-year data */}
      {(masterData?.financialData && Object.keys(masterData.financialData).length > 1) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Comparativa Multi-Año de Deuda</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deuda Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deuda por Habitante</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relación con Presupuesto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(masterData.financialData).map(([year, data]: [string, any]) => (
                  <tr key={year} className={parseInt(year) === selectedYear ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrencyARS(data.debt?.total_debt || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.debt?.total_debt ? 
                        formatCurrencyARS(data.debt.total_debt / 27000) // Assuming ~27,000 inhabitants for Carmen de Areco
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {data.debt?.total_debt && data.budget?.total_budget ? 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {((data.debt.total_debt / data.budget.total_budget) * 100).toFixed(1)}%
                        </span>
                        : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">N/A</span>
                      }
                    </td>
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

export default DebtPage;