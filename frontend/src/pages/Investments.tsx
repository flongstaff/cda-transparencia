import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  Calendar,
  Filter,
  Eye,
  FileText,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  DollarSign,
  Users,
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useComprehensiveData, useFinancialOverview, useBudgetAnalysis } from '../hooks/useComprehensiveData';
// InvestmentChart is replaced by UniversalChart
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import UniversalChart from '../components/charts/UniversalChart'; // Import UniversalChart
import PageYearSelector from '../components/selectors/PageYearSelector';
import { formatCurrencyARS } from '../utils/formatters';

interface Investment {
  id: string;
  name: string;
  description: string;
  category: string;
  amount: number;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  startDate: string;
  endDate: string;
  progress: number;
  documents: string[];
}

const Investments: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'list' | 'analysis'>('overview');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  // Unified data hooks
  const { documents = [], loading: docsLoading, error: docsError } = useComprehensiveData({ 
    year: selectedYear,
    category: 'investment'
  });
  const { data: financial, loading: financialLoading, error: financialError } = useFinancialOverview(selectedYear);
  const { budget, loading: budgetLoading, error: budgetError } = useBudgetAnalysis(selectedYear);

  const loading = docsLoading || financialLoading || budgetLoading;
  const error = financialError || budgetError || docsError;

  // Generate investment data from available sources
  const investmentsData: Investment[] = useMemo(() => {
    return financial.investmentData?.topInvestments || []; // Use actual investment data
  }, [financial.investmentData]);

  const availableYears = getAvailableYears(); // Use getAvailableYears()

  const filteredInvestments = useMemo(() => {
    return investmentsData.filter(inv => {
      const matchesSearch = searchTerm === '' || 
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || inv.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [investmentsData, searchTerm, selectedCategory, selectedStatus]);

  const totalInvestment = useMemo(() => {
    return financial.investmentData?.totalInvestment ?? 0; // Use actual investment data
  }, [financial.investmentData]);

  const investmentByCategory = useMemo(() => {
    return financial.investmentData?.investmentByType || {}; // Use actual investment data
  }, [financial.investmentData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'planned': return 'text-yellow-600 bg-yellow-50';
      case 'delayed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      case 'planned': return 'Planificado';
      case 'delayed': return 'Demorado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando datos de inversiones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <DollarSign className="w-8 h-8 mr-3 text-green-600" />
                Inversiones Municipales
              </h1>
              <p className="text-gray-600 mt-2">
                Gestión y seguimiento de proyectos de inversión pública para {selectedYear}
              </p>
            </div>
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              availableYears={availableYears}
              label="Año de inversión"
            />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invertido</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrencyARS(totalInvestment)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Proyectos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredInvestments.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(investmentByCategory).length}
                </p>
              </div>
              <Building className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Finalización</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((filteredInvestments.filter(inv => inv.status === 'completed').length / filteredInvestments.length) * 100)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar proyectos de inversión..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar proyectos de inversión"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por categoría de inversión"
              >
                <option value="all">Todas las categorías</option>
                {Array.from(new Set(investmentsData.map(inv => inv.category))).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por estado del proyecto"
              >
                <option value="all">Todos los estados</option>
                <option value="planned">Planificado</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completado</option>
                <option value="delayed">Demorado</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    viewMode === 'overview' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  title="Vista general"
                >
                  Resumen
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  title="Lista de proyectos"
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('analysis')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    viewMode === 'analysis' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  title="Análisis detallado"
                >
                  Análisis
                </button>
              </div>

              <button
                onClick={() => {
                  // Export functionality
                  const csvContent = [
                    ['Nombre', 'Categoría', 'Monto', 'Estado', 'Progreso'],
                    ...filteredInvestments.map(inv => [
                      inv.name,
                      inv.category,
                      inv.amount,
                      inv.status,
                      inv.progress
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `inversiones-${selectedYear}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                title="Exportar datos de inversiones"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
        {/* Investment breakdown chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Inversiones</h2>
          <UniversalChart
            data={financial.investmentData?.investmentByType || []} // Use actual investment data
            chartType="pie"
            title="Distribución de Inversiones"
            height={400}
            showControls={false}
          />
        </div>

            {/* Budget Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ejecución Presupuestaria</h2>
              <BudgetAnalysisChart year={selectedYear} />
            </div>
          </motion.div>
        )}

        {viewMode === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvestments.map((investment) => (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {investment.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {investment.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {investment.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrencyARS(investment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(investment.status)}`}>
                        {getStatusText(investment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${investment.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{investment.progress}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedInvestment(investment)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Ver detalles del proyecto"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Ver
                      </button>
                      <a
                        href={`/documents/${investment.documents[0]}`}
                        className="text-green-600 hover:text-green-900"
                        title="Descargar documentación"
                      >
                        <Download className="w-4 h-4 inline mr-1" />
                        Docs
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {viewMode === 'analysis' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Análisis de Inversiones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Inversión Total por Categoría</h3>
                <ul className="space-y-2">
                  {Object.entries(investmentByCategory)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, amount]) => (
                      <li key={category} className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span className="font-medium">{formatCurrencyARS(amount)}</span>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Estado de Proyectos</h3>
                <ul className="space-y-2">
                  {['planned', 'in_progress', 'completed', 'delayed'].map(status => {
                    const count = filteredInvestments.filter(inv => inv.status === status).length;
                    const percentage = (count / filteredInvestments.length) * 100;
                    return (
                      <li key={status} className="flex justify-between text-sm">
                        <span>{getStatusText(status)}</span>
                        <span className="font-medium">{count} ({percentage.toFixed(1)}%)</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Investment Detail Modal */}
        {selectedInvestment && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{selectedInvestment.name}</h3>
                    <button
                      onClick={() => setSelectedInvestment(null)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Cerrar detalles del proyecto"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Descripción</h4>
                      <p className="text-sm text-gray-600">{selectedInvestment.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Categoría</h4>
                        <p className="text-sm text-gray-600">{selectedInvestment.category}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Monto</h4>
                        <p className="text-sm text-gray-600">{formatCurrencyARS(selectedInvestment.amount)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Estado</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedInvestment.status)}`}>
                          {getStatusText(selectedInvestment.status)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Progreso</h4>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${selectedInvestment.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{selectedInvestment.progress}%</span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <button
                        onClick={() => setSelectedInvestment(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cerrar
                      </button>
                      <a
                        href={`/documents/${selectedInvestment.documents[0]}`}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        Ver Documentos
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Investments;