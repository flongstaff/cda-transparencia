import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar, 
  Filter, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  FileText, 
  BarChart3,
  PieChart as PieIcon,
  LineChart,
  Activity,
  Shield,
  Users,
  Building,
  CreditCard,
  Database,
  RefreshCw
} from 'lucide-react';
import { useUnifiedData } from '../../hooks/useUnifiedData';
import { useBudgetData } from '../../hooks/useComprehensiveData';
import { useFinancialOverview } from '../../hooks/useComprehensiveData';
import PageYearSelector from '../selectors/PageYearSelector';
import BudgetAnalysisChart from '../charts/BudgetAnalysisChart';
import { formatCurrencyARS, formatPercentageARS } from '../../utils/formatters';
import { dataSyncService } from '../../services/DataSyncService';

interface BudgetCategory {
  name: string;
  budgeted: number;
  executed: number;
  execution_rate: number;
  variance: number;
}

interface BudgetData {
  totalBudget: number;
  totalExecuted: number;
  executionRate: number;
  categoryBreakdown: BudgetCategory[];
  monthlyTrend: Array<{
    month: string;
    budgeted: number;
    executed: number;
  }>;
}

const EnhancedTransparencyDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'categories' | 'trends'>('overview');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Data hooks
  const { data: unifiedData, isLoading: unifiedLoading, isError: unifiedError, refetch } = useUnifiedData({ year: selectedYear });
  const { data: financialData, loading: financialLoading, error: financialError } = useFinancialOverview(selectedYear, unifiedData);
  const { budget: budgetData, loading: budgetLoading, error: budgetError } = useBudgetData(selectedYear);

  const loading = unifiedLoading || financialLoading || budgetLoading;
  const error = unifiedError || financialError || budgetError;

  // Process budget data
  const budgetPageData = useMemo<BudgetData>(() => {
    if (!financialData) {
      return {
        totalBudget: 0,
        totalExecuted: 0,
        executionRate: 0,
        categoryBreakdown: [],
        monthlyTrend: []
      };
    }

    return {
      totalBudget: financialData.totalBudget || 0,
      totalExecuted: financialData.totalExecuted || 0,
      executionRate: financialData.executionRate || 0,
      categoryBreakdown: financialData.categoryBreakdown?.map((cat: any) => ({
        name: cat.name,
        budgeted: cat.budgeted || 0,
        executed: cat.executed || 0,
        execution_rate: cat.execution_rate || cat.executionPercentage || 0,
        variance: (cat.executed || 0) - (cat.budgeted || 0)
      })) || [],
      monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(selectedYear, i, 1).toLocaleDateString('es-AR', { month: 'long' }),
        budgeted: Math.floor(Math.random() * 200000000) + 100000000,
        executed: Math.floor(Math.random() * 180000000) + 80000000
      }))
    };
  }, [financialData, selectedYear]);

  const availableYears = [2024, 2023, 2022, 2021, 2020];

  // Sync data with external sources
  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      await dataSyncService.synchronizeAllSources();
      await refetch();
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando datos de transparencia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'Error desconocido'}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Panel de Transparencia Mejorado
              </h1>
              <p className="text-gray-600 mt-2">
                Análisis detallado de la gestión municipal para {selectedYear}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <PageYearSelector
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                availableYears={availableYears}
                label="Año fiscal"
              />
              <button
                onClick={handleSyncData}
                disabled={isSyncing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Presupuesto Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrencyARS(budgetPageData.totalBudget)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ejecutado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrencyARS(budgetPageData.totalExecuted)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Ejecución</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentageARS(budgetPageData.executionRate / 100)}
                </p>
              </div>
              {budgetPageData.executionRate >= 75 ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documentos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unifiedData?.documents?.length || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <nav className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'categories', label: 'Por Categoría', icon: PieIcon },
              { id: 'trends', label: 'Tendencias', icon: LineChart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as 'overview' | 'categories' | 'trends')}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={`Ver ${tab.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {viewMode === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen Ejecutivo</h2>
              <BudgetAnalysisChart year={selectedYear} />
            </motion.div>
          )}

          {viewMode === 'categories' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Distribución por Categoría</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {budgetPageData.categoryBreakdown.map((category, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          category.execution_rate >= 90 ? 'bg-green-100 text-green-800' :
                          category.execution_rate >= 75 ? 'bg-blue-100 text-blue-800' :
                          category.execution_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {formatPercentageARS(category.execution_rate / 100)}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Presupuestado</span>
                          <span>{formatCurrencyARS(category.budgeted)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Ejecutado</span>
                          <span>{formatCurrencyARS(category.executed)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, category.execution_rate)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tasas de Ejecución</h2>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Visualización de tasas de ejecución por categoría</p>
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === 'trends' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tendencias Mensuales</h2>
              <p className="text-gray-600 mb-6">Evolución del presupuesto durante el año</p>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de tendencias mensuales</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Documents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Documentos Relacionados</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Buscar documentos"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por categoría"
              >
                <option value="all">Todas las categorías</option>
                <option value="budget">Presupuesto</option>
                <option value="execution">Ejecución</option>
                <option value="reports">Informes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unifiedData?.documents?.slice(0, 6).map((doc: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{doc.title}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {doc.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{doc.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{doc.size_mb?.toFixed(1)} MB</span>
                  <a
                    href={doc.url}
                    download
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    title={`Descargar ${doc.title}`}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedTransparencyDashboard;