import React, { useState } from 'react';
import { TrendingUp, DollarSign, Building, Calendar, Search, Filter, BarChart3 } from 'lucide-react';
import { formatCurrencyARS } from '../utils/formatters';
import PageYearSelector from '../components/selectors/PageYearSelector';
import ComprehensiveChart from '../components/charts/ComprehensiveChart';
import { useTransparencyData } from '../hooks/useTransparencyData';

const Investments: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Use unified data hook
  const {
    loading,
    error,
    financialOverview
  } = useTransparencyData(selectedYear);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Generate available years
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando datos de inversiones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error al cargar datos de inversiones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🏗️ Inversiones Públicas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Proyectos de inversión municipal para el año {selectedYear}
              </p>
            </div>
            
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              availableYears={availableYears}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inversión Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {financialOverview ? formatCurrencyARS(financialOverview.totalInvestment || 0) : 'Cargando...'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {financialOverview ? (financialOverview.activeProjects || 0) : 'Cargando...'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progreso Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {financialOverview ? `${financialOverview.averageProgress || 0}%` : 'Cargando...'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {financialOverview ? (financialOverview.completedProjects || 0) : 'Cargando...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar proyecto, categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </button>
            </div>

            <div className="flex space-x-2">
              {['overview', 'projects'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === tab
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab === 'overview' ? 'Resumen' : 'Proyectos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Investment by Category Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <ComprehensiveChart
                type="investment"
                year={selectedYear}
                title={`Inversión por Categoría ${selectedYear}`}
                variant="pie"
                showControls={false}
                className="h-96"
              />
            </div>

            {/* Investment Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <ComprehensiveChart
                type="investment"
                year={selectedYear}
                title={`Tendencia de Inversiones`}
                variant="line"
                showControls={true}
                className="h-96"
              />
            </div>

            {/* Investment Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 col-span-full">
              <ComprehensiveChart
                type="investment"
                year={selectedYear}
                title={`Inversión por Proyecto ${selectedYear}`}
                variant="bar"
                showControls={true}
                className="h-96"
              />
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Vista detallada de proyectos disponible próximamente
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Investments;