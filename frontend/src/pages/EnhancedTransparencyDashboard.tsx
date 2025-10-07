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
import { useMasterData } from '../hooks/useMasterData';
import PageYearSelector from '../components/forms/PageYearSelector';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import { formatCurrencyARS, formatPercentageARS } from '../utils/formatters';
import ErrorBoundary from '../components/common/ErrorBoundary';

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

  // Use unified master data service
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
  } = useMasterData();

  // Process budget data
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

    const totalBudget = currentBudget?.total_budget || currentBudget?.totalBudget || 0;
    const totalExecuted = currentBudget?.total_executed || currentBudget?.totalExecuted || 0;
    const executionRate = totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0;

    const categoryBreakdown = currentBudget?.categories?.map((cat: Record<string, unknown>) => ({
      name: cat.name || cat.category || '',
      budgeted: cat.budgeted || cat.budget_amount || cat.budget || 0,
      executed: cat.executed || cat.executed_amount || cat.executed || 0,
      execution_rate: cat.execution_rate || cat.executionPercentage || 0,
      variance: (cat.executed || cat.executed_amount || cat.executed || 0) - 
                (cat.budgeted || cat.budget_amount || cat.budget || 0)
    })) || [];

    return {
      totalBudget,
      totalExecuted,
      executionRate,
      categoryBreakdown,
      monthlyTrend: [] // Add monthly trend data if available in masterData
    };
  }, [currentBudget]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Cargando datos de transparencia...</p>
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
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">{error?.message || 'Error desconocido'}</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                Panel de Transparencia Mejorado
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-2">
                Análisis detallado de la gestión municipal para {selectedYear}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Presupuesto Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
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
            className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Ejecutado</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
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
            className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Tasa de Ejecución</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
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
            className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Documentos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
                  {totalDocuments}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* Content - Using a simplified view since this is a dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Resumen Ejecutivo</h2>
          <BudgetAnalysisChart year={selectedYear} />
        </motion.div>
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const EnhancedTransparencyDashboardWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Error al Cargar Página
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Ocurrió un error al cargar esta página. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                      {error.message}
                    </p>
                  )}
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md"
                  >
                    Recargar
                  </button>
                  <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                  >
                    Volver al Inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <EnhancedTransparencyDashboard />
    </ErrorBoundary>
  );
};

export default EnhancedTransparencyDashboardWithErrorBoundary;