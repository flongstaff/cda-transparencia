import React, { useState } from 'react';
import { Search, Filter, Download, Calendar, TrendingDown, DollarSign, BarChart3, Eye } from 'lucide-react';
import { formatCurrencyARS } from '../utils/formatters';
import { useTransparencyData } from '../hooks/useTransparencyData';
import ValidatedChart from '../components/charts/ValidatedChart';
import PageYearSelector from '../components/PageYearSelector';
import UniversalChart from '../components/charts/UniversalChart';

interface SpendingData {
  category: string;
  budgeted: number;
  executed: number;
  execution_rate: number;
  documents: any[];
}

const Spending: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Use unified data hook
  const { loading, error, budgetBreakdown, documents, financialOverview } = useTransparencyData(selectedYear);
  
  // Generate available years dynamically to match available data
  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  
  // Transform budget data into spending categories
  const spendingData: SpendingData[] = budgetBreakdown?.map((item, index) => ({
    category: item.name || `Categoría ${index + 1}`,
    budgeted: item.budgeted || 0,
    executed: item.executed || 0,
    execution_rate: item.execution_rate || 0,
    documents: documents?.filter(doc => 
      doc.category?.toLowerCase().includes(item.name?.toLowerCase() || '') ||
      doc.title?.toLowerCase().includes(item.name?.toLowerCase() || '')
    ) || []
  })) || [];

  const totalSpending = spendingData.reduce((sum, item) => sum + item.executed, 0);

  const filteredSpending = spendingData.filter(item =>
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = filteredSpending.map(item => ({
    name: item.category,
    value: item.executed,
    budgeted: item.budgeted,
    executed: item.executed,
    execution_rate: item.execution_rate
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de gastos públicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <TrendingDown className="mr-3 h-8 w-8" />
              Gastos Públicos
            </h1>
            <p className="text-orange-100">
              Análisis detallado del gasto municipal en {selectedYear}
            </p>
          </div>
          <PageYearSelector
            years={availableYears}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-600 bg-opacity-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-100">Total Gastado</h3>
            <p className="text-2xl font-bold">{formatCurrencyARS(totalSpending)}</p>
          </div>
          <div className="bg-orange-600 bg-opacity-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-100">Categorías</h3>
            <p className="text-2xl font-bold">{spendingData.length}</p>
          </div>
          <div className="bg-orange-600 bg-opacity-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-100">Año</h3>
            <p className="text-2xl font-bold">{selectedYear}</p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar categoría de gasto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              Detalle
            </button>
          </div>
        </div>

        {/* Tabs Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Chart */}
            <UniversalChart
              data={chartData}
              chartType="bar"
              title={`Gastos por Categoría - ${selectedYear}`}
              height={400}
              showControls={true}
              additionalSeries={[
                { dataKey: 'budgeted', name: 'Presupuestado', color: '#f97316' },
                { dataKey: 'executed', name: 'Ejecutado', color: '#ea580c' }
              ]}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpending.slice(0, 6).map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{item.category}</h3>
                    <DollarSign className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrencyARS(item.executed)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.execution_rate.toFixed(1)}% ejecutado
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Presupuestado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ejecutado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Ejecución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documentos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSpending.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {formatCurrencyARS(item.budgeted)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-orange-600">
                        {formatCurrencyARS(item.executed)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.execution_rate >= 90 ? 'bg-green-100 text-green-700' :
                          item.execution_rate >= 75 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.execution_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {item.documents.length} docs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Spending;