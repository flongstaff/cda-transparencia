import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, DollarSign, TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react';
import { consolidatedApiService } from '../services';
import { formatCurrencyARS } from '../utils/formatters';
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [treasuryMovements, setTreasuryMovements] = useState<TreasuryMovement[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'details' | 'charts'>('overview');
  const [treasurySummary, setTreasurySummary] = useState<any>(null);

  useEffect(() => {
    loadAvailableYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadTreasuryData();
    }
  }, [selectedYear]);

  const loadAvailableYears = async () => {
    try {
      const years = await consolidatedApiService.getAvailableYears();
      setAvailableYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch (error) {
      console.error('Error loading available years:', error);
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear, currentYear - 1, currentYear - 2]);
      setSelectedYear(currentYear);
    }
  };

  const loadTreasuryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const movements = await consolidatedApiService.getTreasuryMovements(selectedYear);
      setTreasuryMovements(movements);
      
      // Calculate summary
      const totalIncome = movements
        .filter(m => m.type === 'income')
        .reduce((sum, m) => sum + m.amount, 0);
      
      const totalExpenses = movements
        .filter(m => m.type === 'expense')
        .reduce((sum, m) => sum + Math.abs(m.amount), 0);
      
      const currentBalance = movements.length > 0 ? movements[movements.length - 1].balance : 0;
      
      setTreasurySummary({
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        currentBalance,
        movementCount: movements.length
      });
      
    } catch (err) {
      console.error('Error loading treasury data:', err);
      setError('Error al cargar los datos de tesorería');
      setTreasuryMovements([]);
      setTreasurySummary(null);
    } finally {
      setLoading(false);
    }
  };

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
                    {filteredMovements.slice(0, 50).map((movement) => (
                      <tr key={movement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(movement.date).toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {movement.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${
                            movement.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movement.type === 'income' ? '+' : '-'}{formatCurrencyARS(Math.abs(movement.amount))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrencyARS(movement.balance)}
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
              <TreasuryAnalysisChart year={selectedYear} />
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