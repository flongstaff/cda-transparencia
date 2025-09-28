/**
 * TRANSPARENCY DASHBOARD - MAIN DASHBOARD PAGE
 *
 * Simplified version to ensure proper JSX structure and routing
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMasterData } from '../hooks/useMasterData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  FileText,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  Coins,
  Users,
  Scale,
  PiggyBank,
  Shield,
  AlertTriangle,
  Database,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import ValidatedChart from '../components/charts/ValidatedChart';
import PageYearSelector from '../components/forms/PageYearSelector';

const DashboardTransparencia: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'financial' | 'documents' | 'contracts' | 'audit' | 'analysis' | 'data'>('overview');

  // Handle URL parameters for section navigation
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['overview', 'financial', 'documents', 'contracts', 'audit', 'analysis', 'data'].includes(section)) {
      setViewMode(section as typeof viewMode);
    }
  }, [searchParams]);

  // 🚀 Use unified master data service
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

  // Enhanced year change handler
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    switchYear(year);
    
    // Update URL parameters
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('year', year.toString());
    setSearchParams(newParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <h2 className="text-xl font-semibold text-gray-900 mt-4">Cargando Portal de Transparencia</h2>
          <p className="text-gray-600 mt-2">Preparando datos financieros y documentos municipales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200 max-w-2xl">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error del Sistema</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={refetch}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Reintentar Carga
          </button>
        </div>
      </div>
    );
  }

  // Calculate key financial metrics
  const totalBudget = currentBudget?.total_budget || currentBudget?.totalBudget || 0;
  const totalExecuted = currentBudget?.total_executed || currentBudget?.totalExecuted || currentBudget?.expenses || 0;
  const executionRate = totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0;
  const _personnel = currentBudget?._personnel || 0;
  const _executedInfra = currentBudget?.executed_infra || currentBudget?._executedInfra || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🏛️ Portal de Transparencia Municipal {selectedYear}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Acceso ciudadano a la información financiera y administrativa del Municipio de Carmen de Areco
              </p>
            </div>
            <div className="w-full md:w-auto">
              <PageYearSelector
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
                availableYears={availableYears}
                label="Año"
                showDataAvailability={true}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex flex-wrap">
            {[
              { id: 'overview', label: 'Resumen', icon: Eye },
              { id: 'financial', label: 'Finanzas', icon: DollarSign },
              { id: 'documents', label: 'Documentos', icon: FileText },
              { id: 'contracts', label: 'Contratos', icon: Scale },
              { id: 'audit', label: 'Auditoría', icon: Shield },
              { id: 'analysis', label: 'Análisis', icon: BarChart3 },
              { id: 'data', label: 'Datos', icon: Database }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setViewMode(tab.id as any);
                    // Update URL parameters
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.set('section', tab.id);
                    setSearchParams(newParams);
                  }}
                  className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-gray-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content based on view mode */}
        <div className="space-y-8">
          {/* Overview View */}
          {viewMode === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumen Ejecutivo {selectedYear}</h2>
              
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Documentos</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDocuments}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Presupuesto Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(totalBudget)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                      <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">% Ejecución</p>
                      <p className={`text-2xl font-bold ${
                        executionRate >= 90 ? 'text-green-600' :
                        executionRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {executionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-4">
                      <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentSalaries.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                    Análisis Presupuestario {selectedYear}
                  </h3>
                  <div className="h-80">
                    <ValidatedChart type="budget" year={selectedYear} />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-purple-500" />
                    Distribución de Gastos {selectedYear}
                  </h3>
                  <div className="h-80">
                    <ValidatedChart type="debt" year={selectedYear} />
                  </div>
                </div>
              </div>

              {/* Recent Documents */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-orange-500" />
                  Documentos Recientes
                </h3>
                <div className="space-y-4">
                  {currentDocuments.slice(0, 5).map((doc: any, index: number) => (
                    <div key={doc.id || index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{doc.title || 'Sin título'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{doc.filename || doc.category || 'Documento'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.size_mb ? `${doc.size_mb} MB` : ''}
                        </span>
                        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Financial View */}
          {viewMode === 'financial' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Análisis Financiero {selectedYear}</h2>
              
              {/* Financial Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                    Presupuesto vs Ejecutado
                  </h3>
                  <div className="h-80">
                    <ValidatedChart type="budget" year={selectedYear} />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                    Tasa de Ejecución
                  </h3>
                  <div className="h-80">
                    <ValidatedChart type="debt" year={selectedYear} />
                  </div>
                </div>
              </div>
              
              {/* Financial Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Resumen Financiero</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Presupuesto Total</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(totalBudget)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Ejecutado</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(totalExecuted)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">% Ejecución</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      executionRate >= 90 ? 'text-green-600' :
                      executionRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {executionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents View */}
          {viewMode === 'documents' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión Documental {selectedYear}</h2>
              
              {/* Document Search */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                
                {/* Document List */}
                <div className="space-y-4">
                  {currentDocuments
                    .filter(doc => 
                      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      doc.category?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 10)
                    .map((doc: any, index: number) => (
                      <div key={doc.id || index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{doc.title || 'Documento sin título'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{doc.category || 'Categoría no especificada'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.size_mb ? `${doc.size_mb} MB` : ''}
                          </span>
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
          )}

          {/* Contracts View */}
          {viewMode === 'contracts' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contratos y Licitaciones {selectedYear}</h2>
              
              {/* Contract Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Total Contratos</h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentContracts.length}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Valor Total</h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(currentContracts.reduce((sum: number, contract: any) => sum + (contract.amount || contract.value || 0), 0))}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Promedio</h3>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(currentContracts.length > 0 ? 
                      currentContracts.reduce((sum: number, contract: any) => sum + (contract.amount || contract.value || 0), 0) / currentContracts.length : 0)}
                  </p>
                </div>
              </div>
              
              {/* Contracts Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Scale className="h-5 w-5 mr-2 text-blue-500" />
                  Análisis de Contratos
                </h3>
                <div className="h-80">
                  <ValidatedChart type="contract" year={selectedYear} />
                </div>
              </div>
            </div>
          )}

          {/* Audit View */}
          {viewMode === 'audit' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Auditoría y Control {selectedYear}</h2>
              
              {/* Audit Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-500" />
                  Resumen de Auditoría
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Fuentes Externas</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Verificaciones</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">24</p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Hallazgos</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">2</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Recomendaciones</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">5</p>
                  </div>
                </div>
              </div>
              
              {/* Audit Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Análisis de Auditoría
                </h3>
                <div className="h-80">
                  <ValidatedChart type="audit" year={selectedYear} />
                </div>
              </div>
            </div>
          )}

          {/* Analysis View */}
          {viewMode === 'analysis' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Análisis y Riesgos {selectedYear}</h2>
              
              {/* Analysis Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    Tendencia Financiera
                  </h3>
                  <div className="h-80">
                    <ValidatedChart type="trend" year={selectedYear} />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                    Comparativa Anual
                  </h3>
                  <div className="h-80">
                    <ValidatedChart type="comparison" year={selectedYear} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data View */}
          {viewMode === 'data' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fuentes de Datos {selectedYear}</h2>
              
              {/* Data Sources */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Fuentes de Información</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Datos Locales</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300">Archivos PDF y JSON del municipio</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">API Externa</h4>
                    <p className="text-sm text-green-600 dark:text-green-300">Presupuesto Abierto y datos.gob.ar</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Validación Cruzada</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-300">Comparación de fuentes múltiples</p>
                  </div>
                </div>
              </div>
              
              {/* Data Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Estadísticas de Datos</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Documentos Totales</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDocuments}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Años Disponibles</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableYears.length}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Categorías</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fuentes Activas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{dataSourcesActive}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTransparencia;