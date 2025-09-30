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

    const categoryBreakdown = currentBudget?.categories?.map((props: Record<string, unknown>) => ({
      name: cat.name,
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

export default EnhancedTransparencyDashboard;