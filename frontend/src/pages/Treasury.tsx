import React, { useState } from 'react';
import { Search, Filter, Download, Calendar, DollarSign, TrendingUp, TrendingDown, Activity, Loader2, BarChart3, PieChart as PieIcon, AlertTriangle } from 'lucide-react';
import { formatCurrencyARS } from '../utils/formatters';
import { useTransparencyData } from '../hooks/useTransparencyData';
import TreasuryAnalysisChart from '../components/charts/TreasuryAnalysisChart';
import PageYearSelector from '../components/selectors/PageYearSelector';

interface TreasuryMovement {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  balance: number;
  type: 'income' | 'expense';
  reference: string;
}

const Treasury: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'details' | 'charts'>('overview');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

  // Use unified data hook
  const { loading, error, treasuryData, financialOverview } = useTransparencyData(selectedYear);
  
  // Generate available years dynamically to match available data
  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const treasuryMovements = treasuryData?.movements || [];
  
  // Calculate summary from unified data
  const treasurySummary = treasuryData ? {
    totalIncome: treasuryData.totalIncome || 0,
    totalExpenses: treasuryData.totalExpenses || 0,
    netBalance: (treasuryData.totalIncome || 0) - (treasuryData.totalExpenses || 0),
    currentBalance: treasuryData.currentBalance || 0,
    movementCount: treasuryMovements.length
  } : null;

  const filteredMovements = treasuryMovements.filter(movement => 
    movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando movimientos de tesorería...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💰 Tesorería Municipal
            </h1>
            <p className="text-gray-600">
              Movimientos y balance de tesorería para el año {selectedYear}
            </p>
          </div>
          <PageYearSelector
            years={availableYears}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Summary Cards */}
      {treasurySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Ingresos</p>
                <p className="text-2xl font-semibold text-green-600">
                  {formatCurrencyARS(treasurySummary.totalIncome)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Egresos</p>
                <p className="text-2xl font-semibold text-red-600">
                  {formatCurrencyARS(treasurySummary.totalExpenses)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Balance Actual</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {formatCurrencyARS(treasurySummary.currentBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Movimientos</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {treasurySummary.movementCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setViewMode('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setViewMode('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Movimientos Detallados
            </button>
            <button
              onClick={() => setViewMode('charts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'charts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Análisis Gráfico
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {viewMode === 'overview' && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resumen de Tesorería {selectedYear}
              </h3>
              <p className="text-gray-600">
                Aquí se muestra el resumen general de los movimientos de tesorería para el año seleccionado.
              </p>
            </div>
          )}

          {viewMode === 'details' && (
            <div>
              {/* Search Bar */}
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Buscar movimientos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </button>
              </div>

              {/* Movements Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMovements.slice(0, 50).map((movement, index) => (
                      <tr key={movement.id || `movement-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movement.date ? new Date(movement.date).toLocaleDateString('es-AR') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {movement.description || 'Sin descripción'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.category || 'Sin categoría'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${
                            movement.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movement.type === 'income' ? '+' : '-'}{formatCurrencyARS(Math.abs(movement.amount || 0))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrencyARS(movement.balance || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredMovements.length > 50 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Mostrando los primeros 50 de {filteredMovements.length} movimientos
                </p>
              )}
            </div>
          )}

          {viewMode === 'charts' && (
            <div>
              {/* Chart Type Selection */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Análisis Gráfico de Tesorería
                </h3>
                <div className="flex items-center space-x-2">
                  {[
                    { key: 'bar', label: 'Barras', icon: <BarChart3 size={16} /> },
                    { key: 'pie', label: 'Circular', icon: <PieIcon size={16} /> },
                    { key: 'line', label: 'Líneas', icon: <Activity size={16} /> }
                  ].map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setChartType(type.key)}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                        chartType === type.key
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      {type.icon}
                      <span className="ml-2">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Rendering */}
              {chartType === 'bar' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Composición de Movimientos por Categoría
                  </h4>
                  <div className="h-96">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : error ? (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
                        <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    ) : (
                      <TreasuryAnalysisChart
                        year={selectedYear}
                        chartType="bar"
                      />
                    )}
                  </div>
                </div>
              )}

              {chartType === 'pie' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Distribución de Movimientos por Categoría
                  </h4>
                  <div className="h-96">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : error ? (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
                        <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    ) : (
                      <TreasuryAnalysisChart
                        year={selectedYear}
                        chartType="pie"
                      />
                    )}
                  </div>
                </div>
              )}

              {chartType === 'line' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Evolución de Movimientos por Mes
                  </h4>
                  <div className="h-96">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : error ? (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
                        <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    ) : (
                      <TreasuryAnalysisChart
                        year={selectedYear}
                        chartType="line"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Treasury;