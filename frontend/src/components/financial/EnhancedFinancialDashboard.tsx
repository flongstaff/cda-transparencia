import React, { useState } from 'react';
import { Search, Filter, Download, Calendar, FileText, BarChart3, Eye, DollarSign, TrendingUp, Coins, Users, CreditCard, PieChart, Table, AlertTriangle } from 'lucide-react';
import ValidatedChart from '../charts/ValidatedChart';
import DocumentViewer from '../DocumentViewer';
import PageYearSelector from '../PageYearSelector';

interface Document {
  id: string;
  title: string;
  filename: string;
  year: number;
  category: string;
  type: string;
  size_mb: number;
  url: string;
  official_url: string;
  verification_status: string;
  processing_date: string;
}

interface FinancialData {
  budgeted: number;
  executed: number;
  execution_rate: number;
  category_breakdown: Array<{
    name: string;
    budgeted: number;
    executed: number;
    execution_rate: number;
  }>;
}

interface CategoryData {
  name: string;
  total_documents: number;
  total_size_mb: number;
  financial_data: FinancialData;
  documents: Document[];
  // Debt-specific data
  debt_data?: {
    total_debt: number;
    debt_breakdown: Array<{
      type: string;
      amount: number;
      interest_rate: number;
      due_date: string;
    }>;
  };
}

interface EnhancedFinancialDashboardProps {
  categoryData: CategoryData;
  selectedYear: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'overview' | 'documents' | 'data' | 'charts' | 'debt';
  setViewMode: (mode: 'overview' | 'documents' | 'data' | 'charts' | 'debt') => void;
  category: string;
  title: string;
  icon: string;
}

const EnhancedFinancialDashboard: React.FC<EnhancedFinancialDashboardProps> = ({ 
  categoryData, 
  selectedYear, 
  searchTerm, 
  setSearchTerm, 
  viewMode, 
  setViewMode,
  category,
  title,
  icon
}) => {
  const formatCurrencyARS = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredDocuments = categoryData?.documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const renderOverview = () => {
    if (!categoryData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Documentos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categoryData.total_documents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tamaño Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categoryData.total_size_mb.toFixed(1)} MB</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Año</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedYear}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4">
                {category === 'debt' ? (
                  <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                ) : category === 'budget' ? (
                  <Coins className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                ) : (
                  <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {category === 'debt' ? 'Deuda Total' : 
                   category === 'budget' ? 'Presupuesto' : 
                   'Ejecutado'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category === 'debt' ? 
                    formatCurrencyARS(categoryData.debt_data?.total_debt || 0) :
                    formatCurrencyARS(categoryData.financial_data.executed)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Chart */}
        {categoryData.financial_data.category_breakdown.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribución {title}
            </h3>
            <ValidatedChart
              data={categoryData.financial_data.category_breakdown.map(item => ({
                name: item.name,
                presupuestado: Math.round(item.budgeted / 1000000),
                ejecutado: Math.round(item.executed / 1000000)
              }))}
              chartType="bar"
              title={`${title} (Millones ARS)`}
              sources={['https://carmendeareco.gob.ar/transparencia/']}
              showValidation={true}
            />
          </div>
        )}

        {/* Recent Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Documentos Recientes
          </h3>
          <div className="space-y-4">
            {categoryData.documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{doc.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{doc.filename}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{doc.size_mb.toFixed(1)} MB</span>
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    if (!categoryData) return null;

    return (
      <div className="space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredDocuments.length} de {categoryData.documents.length} documentos
            </span>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {doc.filename}
                    </p>
                    <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(doc.processing_date).toLocaleDateString('es-AR')}</span>
                      <span className="mx-2">•</span>
                      <span>{doc.size_mb.toFixed(1)} MB</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doc.verification_status === 'verified' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {doc.verification_status === 'verified' ? 'Verificado' : 'Procesado'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Eye className="h-4 w-4" />
                    </button>
                    <a 
                      href={doc.url} 
                      download 
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No hay documentos que coincidan con tu búsqueda.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderData = () => {
    if (!categoryData) return null;

    return (
      <div className="space-y-6">
        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Presupuesto Total</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrencyARS(categoryData.financial_data.budgeted)}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ejecutado</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrencyARS(categoryData.financial_data.executed)}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${categoryData.financial_data.execution_rate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">% Ejecución</h3>
            <p className={`text-2xl font-bold ${
              categoryData.financial_data.execution_rate >= 90 ? 'text-green-600' :
              categoryData.financial_data.execution_rate >= 75 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {categoryData.financial_data.execution_rate.toFixed(1)}%
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {categoryData.financial_data.execution_rate >= 90 ? 'Ejecución óptima' :
               categoryData.financial_data.execution_rate >= 75 ? 'Ejecución buena' : 'Ejecución baja'}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Desglose por Categorías
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Presupuestado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ejecutado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    % Ejecución
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {categoryData.financial_data.category_breakdown.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrencyARS(item.budgeted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrencyARS(item.executed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2 dark:bg-gray-700">
                          <div 
                            className={`h-2 rounded-full ${
                              item.execution_rate >= 90 ? 'bg-green-600' :
                              item.execution_rate >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${item.execution_rate}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                          item.execution_rate >= 90 ? 'text-green-600' :
                          item.execution_rate >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {item.execution_rate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    if (!categoryData) return null;

    return (
      <div className="space-y-6">
        {/* Execution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ejecución Presupuestaria
          </h3>
          <ValidatedChart
            data={[
              { name: 'Presupuestado', value: Math.round(categoryData.financial_data.budgeted / 1000000) },
              { name: 'Ejecutado', value: Math.round(categoryData.financial_data.executed / 1000000) }
            ]}
            chartType="bar"
            title={`Presupuesto vs Ejecutado ${selectedYear} (Millones ARS)`}
            sources={['https://carmendeareco.gob.ar/transparencia/']}
            showValidation={true}
          />
        </div>

        {/* Category Breakdown Chart */}
        {categoryData.financial_data.category_breakdown.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribución por Categorías
            </h3>
            <ValidatedChart
              data={categoryData.financial_data.category_breakdown.map(item => ({
                name: item.name,
                value: Math.round(item.executed / 1000000)
              }))}
              chartType="pie"
              title={`Distribución de ${title} ${selectedYear} (Millones ARS)`}
              sources={['https://carmendeareco.gob.ar/transparencia/']}
              showValidation={true}
            />
          </div>
        )}

        {/* Execution Rate Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tasa de Ejecución por Categoría
          </h3>
          <ValidatedChart
            data={categoryData.financial_data.category_breakdown.map(item => ({
              name: item.name,
              value: item.execution_rate
            }))}
            chartType="bar"
            title={`Tasa de Ejecución ${selectedYear} (%)`}
            sources={['https://carmendeareco.gob.ar/transparencia/']}
            showValidation={true}
          />
        </div>
      </div>
    );
  };

  const renderDebtView = () => {
    if (!categoryData || !categoryData.debt_data) return null;

    return (
      <div className="space-y-6">
        {/* Debt Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4">
                <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Deuda Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyARS(categoryData.debt_data.total_debt)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4">
                <Scale className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Relación Deuda/PBI</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">15.2%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                <PiggyBank className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interés Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8.2%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Debt Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Desglose de la Deuda
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo de Deuda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tasa de Interés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cuota Mensual
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {categoryData.debt_data.debt_breakdown.map((debt, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {debt.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrencyARS(debt.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        debt.interest_rate > 10 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        debt.interest_rate > 8 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {debt.interest_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(debt.due_date).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrencyARS((debt.amount * (debt.interest_rate / 100)) / 12)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Debt Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Composición de la Deuda
            </h3>
            <ValidatedChart
              data={categoryData.debt_data.debt_breakdown.map(debt => ({
                name: debt.type,
                value: Math.round(debt.amount / 1000000)
              }))}
              chartType="pie"
              title={`Composición de la Deuda ${selectedYear} (Millones ARS)`}
              sources={['https://carmendeareco.gob.ar/transparencia/']}
              showValidation={true}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tasa de Interés Comparativa
            </h3>
            <ValidatedChart
              data={categoryData.debt_data.debt_breakdown.map(debt => ({
                name: debt.type,
                value: debt.interest_rate
              }))}
              chartType="bar"
              title={`Tasas de Interés por Tipo de Deuda (%)`}
              sources={['https://carmendeareco.gob.ar/transparencia/']}
              showValidation={true}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {icon} {title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Análisis financiero detallado para el año {selectedYear}
            </p>
          </div>
          
          <PageYearSelector
            selectedYear={selectedYear}
            onYearChange={() => {}}
            availableYears={[selectedYear]}
            label="Año"
          />
        </div>

        {/* View Mode Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
              { id: 'documents', label: 'Documentos', icon: <FileText className="h-4 w-4 mr-2" /> },
              { id: 'data', label: 'Datos', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
              { id: 'charts', label: 'Gráficos', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
              ...(category === 'debt' ? [{ id: 'debt', label: 'Deuda', icon: <CreditCard className="h-4 w-4 mr-2" /> }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as any)}
                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'documents' && renderDocuments()}
        {viewMode === 'data' && renderData()}
        {viewMode === 'charts' && renderCharts()}
        {viewMode === 'debt' && renderDebtView()}
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              ¿Dónde va mi dinero en impuestos?
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Esta sección muestra cómo se utiliza el dinero recaudado en impuestos para beneficiar a la comunidad. 
                Todos los documentos son oficiales y provienen del municipio de Carmen de Areco.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFinancialDashboard;