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
  BarChart3
} from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';
import PageYearSelector from '../components/forms/PageYearSelector';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import UniversalChart from '../components/charts/UnifiedChart'; // Updated to use the unified chart
import { formatCurrencyARS, formatPercentageARS } from '../utils/formatters';

interface SpendingData {
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

const Spending: React.FC = () => {
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
    availableYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // Process spending data from master data service
  const spendingData = useMemo(() => {
    if (!currentBudget) {
      return {
        totalBudget: 0,
        totalExecuted: 0,
        executionRate: 0,
        categoryBreakdown: [],
        monthlyTrend: []
      };
    }

    // Handle different possible data structures for budget
    const totalBudget = currentBudget?.total_budget || 
                       currentBudget?.totalBudget || 
                       currentBudget?.budget_total || 0;
    const totalExecuted = currentBudget?.total_executed || 
                         currentBudget?.totalExecuted || 
                         currentBudget?.executed_total || 0;
    const executionRate = totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0;

    // Extract category breakdown if available
    const categoryBreakdown = currentBudget?.categories || [];

    return {
      totalBudget,
      totalExecuted,
      executionRate,
      categoryBreakdown: categoryBreakdown.map((props: Record<string, unknown>) => ({
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

  // Filter spending-related documents from master data
  const spendingDocuments = useMemo(() => {
    if (!currentDocuments) return [];
    
    return currentDocuments.filter(doc => 
      doc.category?.toLowerCase().includes('gasto') ||
      doc.category?.toLowerCase().includes('spending') ||
      doc.category?.toLowerCase().includes('presupuesto') ||
      doc.category?.toLowerCase().includes('budget') ||
      doc.title?.toLowerCase().includes('gasto') ||
      doc.title?.toLowerCase().includes('spending') ||
      doc.title?.toLowerCase().includes('presupuesto') ||
      doc.title?.toLowerCase().includes('budget')
    );
  }, [currentDocuments]);

  // Spending efficiency and audit overview from comprehensive data
  const spendingEfficiency = masterData?.chartsData?.budget?.spending_efficiency;
  const auditOverview = masterData?.chartsData?.budget?.audit_overview;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando datos de gastos...</p>
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
          <p className="text-gray-600">{error}</p>
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
                <DollarSign className="w-8 h-8 mr-3 text-green-600" />
                Gastos Municipales
              </h1>
              <p className="text-gray-600 mt-2">
                Análisis detallado del gasto público para {selectedYear}
              </p>
            </div>
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={switchYear}
              availableYears={availableYears}
              label="Año fiscal"
            />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  {formatCurrencyARS(spendingData.totalBudget)}
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
                  {formatCurrencyARS(spendingData.totalExecuted)}
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
                  {formatPercentageARS(spendingData.executionRate)}
                </p>
              </div>
              {spendingData.executionRate >= 75 ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500" />
              )}
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <nav className="flex border-b border-gray-200">
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
                <UniversalChart
                  type="budget"
                  year={selectedYear}
                  title="Distribución de Gastos por Categoría"
                  variant="pie"
                  showControls={false}
                  height={400}
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tasas de Ejecución</h2>
                <UniversalChart
                  type="budget"
                  year={selectedYear}
                  title="Tasas de Ejecución por Categoría"
                  variant="bar"
                  showControls={false}
                  height={400}
                />
              </div>
            </motion.div>
          )}

          {viewMode === 'trends' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tendencias Anuales</h2>
              <p className="text-gray-600 mb-6">Evolución del gasto a lo largo de los años</p>
              <UniversalChart
                type="budget-trend"
                year={selectedYear}
                title={`Evolución del Gasto - ${selectedYear}`}
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
                  aria-label="Buscar documentos de gastos"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            {spendingDocuments.slice(0, 6).map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
              </div>
            ))}
          </div>
        </motion.div>

        {/* Spending Efficiency and Audit Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 mt-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
              Eficiencia del Gasto
            </h2>

            {spendingEfficiency ? (
              <div className="bg-white rounded-xl shadow p-4 mb-6">
                <p className="text-sm text-gray-600">Puntuación de Eficiencia</p>
                <p className="text-2xl font-semibold">{spendingEfficiency.efficiency_score ?? 'N/A'}</p>
                <p className="mt-2 text-gray-600">{spendingEfficiency.recommendations?.join(', ')}</p>
              </div>
            ) : (
              <p className="text-gray-600 mb-4">No hay datos de eficiencia de gasto.</p>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Resumen de Auditoría
            </h2>

            {auditOverview ? (
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-600">Hallazgos</p>
                <p className="text-xl font-semibold">{auditOverview.findings}</p>
                <p className="mt-2 text-sm text-gray-600">Recomendaciones: {auditOverview.recommendations}</p>
                <p className="mt-2 text-sm text-gray-600">Puntuación de Cumplimiento: {auditOverview.compliance_score}</p>
              </div>
            ) : (
              <p className="text-gray-600">No hay datos de auditoría disponibles.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Spending;