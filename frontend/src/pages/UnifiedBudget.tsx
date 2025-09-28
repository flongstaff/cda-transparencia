/**
 * Unified Budget Page - Municipal Budget Analysis
 * Clean, single-source approach to budget data
 */

import React, { useState } from 'react';
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
import { formatCurrencyARS, formatPercentageARS } from '../utils/formatters';

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

const UnifiedBudget: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'categories' | 'trends'>('overview');

  // Use unified master data service
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

  // Process budget data from master data source
  const budgetData: BudgetData = {
    totalBudget: currentBudget?.total_budget || currentBudget?.totalBudget || 0,
    totalExecuted: currentBudget?.expenses || currentBudget?.totalExecuted || 0,
    executionRate: currentBudget?.execution_rate || currentBudget?.executionPercentage || 0,
    categoryBreakdown: currentBudget?.categories || [],
    monthlyTrend: [] // Add monthly trend data if available
  };

  // Filter budget-related documents
  const budgetDocuments = currentDocuments?.filter(doc => 
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
  ) || [];

  // Extract metrics from currentBudget
  const metrics = {
    totalBudget: currentBudget?.total_budget || currentBudget?.totalBudget || 0,
    totalExecuted: currentBudget?.expenses || currentBudget?.totalExecuted || 0,
    executionRate: currentBudget?.execution_rate || currentBudget?.executionPercentage || 0,
    personnel: currentBudget?.personnel || 0,
    infra: currentBudget?.executed_infra || 0,
    availableYears: availableYears,
    // Add other metrics as needed
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando datos de presupuesto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500 mr-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DollarSign className="w-8 h-8 mr-3 text-blue-600" />
              Presupuesto Anual
            </h1>
            <p className="text-gray-600 mt-2">
              Análisis detallado del presupuesto para {selectedYear}
            </p>
          </div>
          <PageYearSelector
            availableYears={metrics.availableYears}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            label="Año fiscal"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Presupuesto Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrencyARS(budgetData.totalBudget)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ejecutado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrencyARS(budgetData.totalExecuted)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Ejecución</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentageARS(budgetData.executionRate)}
                </p>
              </div>
              {budgetData.executionRate >= 75 ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500" />
              )}
            </div>
          </div>
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen Ejecutivo</h2>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de análisis presupuestario</p>
              </div>
            </div>
          )}

          {viewMode === 'categories' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Distribución por Categoría</h2>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de distribución del presupuesto</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tasas de Ejecución</h2>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de tasas de ejecución</p>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'trends' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tendencias Mensuales</h2>
              <p className="text-gray-600 mb-6">Evolución del presupuesto durante el año</p>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de tendencias mensuales</p>
              </div>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
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
                  aria-label="Buscar documentos de presupuesto"
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
            {budgetDocuments.slice(0, 6).map((doc) => (
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
        </div>
      </div>
    </div>
  );
};

export default UnifiedBudget;