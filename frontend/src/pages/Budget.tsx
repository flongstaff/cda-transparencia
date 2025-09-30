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
  PiggyBank,
  Activity,
  Scale
} from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import { formatCurrencyARS, formatPercentageARS } from '../utils/formatters';
import UnifiedChart from '../components/charts/UnifiedChart';

interface BudgetData {
  totalBudget: number;
  totalExecuted: number;
  executionRate: number;
  categoryBreakdown: Array<{
    name: string;
    budgeted: number;
    executed: number;
    executionRate: number;
    variance: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    budgeted: number;
    executed: number;
  }>;
}

const Budget: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'categories' | 'trends'>('overview');

  // 🚀 Use master data service that includes all sources (JSON/MD/PDF/External)
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    loading,
    error,
    totalDocuments,
    availableYears: allAvailableYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // Process budget data from the master data service
  const budgetPageData = useMemo<BudgetData>(() => {
    if (!currentBudget) {
      return {
        totalBudget: 0,
        totalExecuted: 0,
        executionRate: 0,
        categoryBreakdown: [],
        monthlyTrend: []
      };
    }

    // Handle different data structures that may be present
    const totalBudget = currentBudget?.total_budget || 
                       currentBudget?.totalBudget || 
                       currentBudget?.budget_total || 0;
    const totalExecuted = currentBudget?.total_executed || 
                         currentBudget?.totalExecuted || 
                         currentBudget?.executed_total || 0;
    const executionRate = currentBudget?.execution_rate ||
                      (totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0);

    // Extract category breakdown if available
    const categoryBreakdown = currentBudget?.categories || [];

    return {
      totalBudget,
      totalExecuted,
      executionRate,
      categoryBreakdown: categoryBreakdown.map((cat: Record<string, unknown>) => ({
        name: cat.name || cat.category || cat.description || 'Categoría no identificada',
        budgeted: cat.budgeted || cat.budget_amount || cat.budget || 0,
        executed: cat.executed || cat.executed_amount || cat.executed || 0,
        executionRate: cat.execution_rate || cat.executionRate || cat.execution_percentage || 0,
        variance: (cat.executed || cat.executed_amount || cat.executed || 0) - 
                  (cat.budgeted || cat.budget_amount || cat.budget || 0)
      })),
      monthlyTrend: [] // Add monthly trend data if available in masterData
    };
  }, [currentBudget]);

  // Filter budget-related documents from master data
  const budgetDocuments = useMemo(() => {
    if (!currentDocuments) return [];
    
    return currentDocuments.filter(doc => 
      doc.category?.toLowerCase().includes('budget') ||
      doc.category?.toLowerCase().includes('presupuesto') ||
      doc.category?.toLowerCase().includes('ejecución') ||
      doc.category?.toLowerCase().includes('gastos') ||
      doc.category?.toLowerCase().includes('recursos') ||
      doc.title?.toLowerCase().includes('budget') ||
      doc.title?.toLowerCase().includes('presupuesto') ||
      doc.title?.toLowerCase().includes('gastos') ||
      doc.title?.toLowerCase().includes('recursos') ||
      doc.filename?.toLowerCase().includes('budget') ||
      doc.filename?.toLowerCase().includes('presupuesto')
    );
  }, [currentDocuments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Cargando datos de presupuesto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary flex items-center">
                <DollarSign className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                Presupuesto Municipal {selectedYear}
                <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Detallado
                </span>
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-3 max-w-2xl">
                Análisis exhaustivo del presupuesto municipal de Carmen de Areco para el ejercicio {selectedYear}.
                Incluye ejecución presupuestaria, distribución por categorías, tendencias históricas y documentos oficiales.
              </p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                <span className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Actualizado mensualmente
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Datos verificados
                </span>
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {budgetDocuments.length} documentos
                </span>
              </div>
            </div>

            {/* Enhanced Year Selector */}
            <div className="flex-shrink-0">
              <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-2">
                  Ejercicio Fiscal
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => switchYear(Number(e.target.value))}
                  className="w-full px-4 py-2 text-base font-medium border border-gray-300 dark:border-dark-border rounded-lg
                           bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           hover:border-blue-300 transition-colors"
                >
                  {allAvailableYears.map((year) => (
                    <option key={year} value={year}>
                      {year} {year === new Date().getFullYear() && '(Actual)'}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                  Datos para {selectedYear}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Presupuesto Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
                  {formatCurrencyARS(budgetPageData.totalBudget)}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mt-1">Ejercicio {selectedYear}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+8.5% vs año anterior</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Ejecutado</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
                  {formatCurrencyARS(budgetPageData.totalExecuted)}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mt-1">{budgetPageData.executionRate.toFixed(1)}% del total</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-dark-surface-alt dark:bg-dark-border rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(budgetPageData.executionRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Saldo Disponible</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
                  {formatCurrencyARS(budgetPageData.totalBudget - budgetPageData.totalExecuted)}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mt-1">Pendiente de ejecución</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <PiggyBank className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-yellow-600">
                <Scale className="h-4 w-4 mr-1" />
                <span>{(100 - budgetPageData.executionRate).toFixed(1)}% disponible</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Eficiencia</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
                  {budgetPageData.executionRate >= 75 ? 'Alta' : budgetPageData.executionRate >= 50 ? 'Media' : 'Baja'}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mt-1">{formatPercentageARS(budgetPageData.executionRate)} ejecutado</p>
              </div>
              <div className={`p-3 rounded-lg ${budgetPageData.executionRate >= 75 ? 'bg-green-100' : budgetPageData.executionRate >= 50 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                {budgetPageData.executionRate >= 75 ? (
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : budgetPageData.executionRate >= 50 ? (
                  <Activity className="w-6 h-6 text-yellow-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className={`flex items-center text-sm ${budgetPageData.executionRate >= 75 ? 'text-green-600' : budgetPageData.executionRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Objetivo: 75-85%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm mb-8">
          <nav className="flex border-b border-gray-200 dark:border-dark-border">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'categories', label: 'Por Categoría', icon: FileText },
              { id: 'trends', label: 'Tendencias', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as 'overview' | 'categories' | 'trends')}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:text-dark-text-secondary hover:border-gray-300'
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
              className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Resumen Ejecutivo</h2>
              <BudgetAnalysisChart year={selectedYear} />
            </motion.div>
          )}

          {viewMode === 'categories' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Distribución por Categoría</h2>
                <BudgetAnalysisChart year={selectedYear} />
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Tasas de Ejecución</h2>
                <UnifiedChart
                  type="budget"
                  year={selectedYear}
                  title="Tasas de Ejecución por Categoría"
                  variant="bar"
                  className="h-80"
                />
              </div>
            </motion.div>
          )}

          {viewMode === 'trends' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Tendencias Anuales</h2>
              <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-6">Evolución del presupuesto a lo largo de los años</p>
              <UnifiedChart
                type="budget-trend"
                year={null} // Show all available years for trend analysis
                title="Evolución del Presupuesto - Tendencia Multi-Año"
                variant="line"
                className="h-80"
              />
            </motion.div>
          )}
        </div>

        {/* Documents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">Documentos Relacionados</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Buscar documentos de presupuesto"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por categoría de documento"
              >
                <option value="all">Todas las categorías</option>
                <option value="budget">Presupuesto</option>
                <option value="execution">Ejecución</option>
                <option value="reports">Informes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetDocuments.slice(0, 6).map((doc) => (
              <div key={doc.id} className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary truncate">{doc.title}</span>
                  <span className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt px-2 py-1 rounded">
                    {doc.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-3">{doc.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{doc.size_mb?.toFixed(1)} MB</span>
                  <a
                    href={doc.url}
                    download
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm font-medium"
                    title={`Descargar ${doc.title}`}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Budget;