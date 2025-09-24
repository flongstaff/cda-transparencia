/**
 * Dashboard Page Component - ELECTION READY VERSION
 * Shows ALL years data from complete repository: PDFs->JSONs, MD, CSV, XLSX
 * Real financial tracking from budget to contracts to execution
 */

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Building,
  FileText,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Download,
  ExternalLink,
  BarChart3,
  PieChart,
  LineChart,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRepositoryData } from '../hooks/useRepositoryData';
import { useUnifiedSystemData } from '../hooks/useUnifiedSystemData';
import { useGitHubPagesData } from '../hooks/useGitHubPagesData';
import PageYearSelector from '../components/selectors/PageYearSelector';
import DataStatusIndicator from '../components/debug/DataStatusIndicator';

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // 🔥 LOAD ALL REPOSITORY DATA - API, JSONs, MD, PDFs, CSV, XLSX
  const {
    data,
    documents,
    budget,
    contracts,
    moneyFlow,
    metadata,
    loading,
    error,
    selectYear
  } = useRepositoryData({ year: selectedYear });

  // 🚀 LOAD COMPLETE UNIFIED SYSTEM DATA - ALL 9+ SERVICES
  const {
    systemData,
    systemHealth,
    servicesActive,
    totalServices,
    dataIntegrity,
    loading: systemLoading
  } = useUnifiedSystemData();

  // 🌐 GITHUB PAGES DATA - ALL YEARS FOR ELECTIONS
  const {
    allYearsData,
    currentYearData,
    totalDocuments: pagesDocuments,
    availableYears: pagesYears,
    loading: pagesLoading
  } = useGitHubPagesData(selectedYear);

  // Handle year changes
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    selectYear(year);
  };

  // Calculate metrics from REAL repository data
  const metrics = useMemo(() => {
    if (!data) return {
      totalBudget: 0,
      totalExecuted: 0,
      executionRate: 0,
      totalRevenue: 0,
      totalDebt: 0,
      transparencyScore: 0,
      totalDocuments: 0,
      verifiedDocuments: 0,
      categoriesCount: 0,
      contractsCount: 0,
      moneyFlowTracked: false
    };

    // Financial metrics from actual data
    const totalBudget = budget.execution.reduce((sum, item) => sum + item.budgeted, 0);
    const totalExecuted = budget.execution.reduce((sum, item) => sum + item.executed, 0);
    const executionRate = totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0;

    // Additional data
    const totalRevenue = budget.summary?.totalRevenue || totalBudget;
    const totalDebt = budget.summary?.totalDebt || 0;
    const allDocuments = documents.all.length;
    const yearDocuments = documents.byYear.length;
    const verified = documents.byYear.filter(doc => doc.verified !== false).length;
    const categories = metadata.categories.length;
    const contractsCount = contracts.tenders.length;
    const transparencyScore = Math.min(100, Math.floor((allDocuments / 100) * 100));
    const moneyFlowTracked = moneyFlow.budgetToContracts.length > 0;

    return {
      totalBudget,
      totalExecuted,
      executionRate,
      totalRevenue,
      totalDebt,
      transparencyScore,
      totalDocuments: allDocuments,
      verifiedDocuments: verified,
      categoriesCount: categories,
      contractsCount,
      moneyFlowTracked
    };
  }, [data, budget, contracts, documents, metadata, moneyFlow]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos completos del repositorio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Transparencia</h1>
        <p className="text-gray-600">
          Sistema completo de transparencia municipal para {selectedYear} - Datos en tiempo real
        </p>
      </div>

      {/* Year Selector - ALL SOURCES COMBINED */}
      <PageYearSelector
        availableYears={[
          ...new Set([
            ...(metadata?.availableYears || []),
            ...(pagesYears || []),
            // Ensure 2021-2025 for elections
            2021, 2022, 2023, 2024, 2025
          ])
        ].sort().reverse()}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
      />

      {/* Data Status */}
      <DataStatusIndicator
        structured={data}
        documents={documents}
        loading={loading}
        error={error}
        selectedYear={selectedYear}
      />

      {/* System Health Status - ALL SERVICES */}
      {systemHealth && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema Electoral</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemHealth.status === 'healthy' ? 'bg-green-100 text-green-800' :
                systemHealth.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {systemHealth.status === 'healthy' ? '✅ Operativo' :
                 systemHealth.status === 'warning' ? '⚠️ Advertencia' :
                 '❌ Crítico'}
              </div>
            </div>
            <p className="text-gray-600 mt-1">
              {servicesActive} de {totalServices} servicios activos • {dataIntegrity}% integridad de datos
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Servicios Activos</p>
                    <p className="text-2xl font-bold text-blue-600">{servicesActive}/{totalServices}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Integridad de Datos</p>
                    <p className="text-2xl font-bold text-green-600">{dataIntegrity}%</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">Fuentes Integradas</p>
                    <p className="text-2xl font-bold text-purple-600">9+</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
            {systemHealth.errors && systemHealth.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-900 mb-2">Servicios con Problemas:</p>
                <ul className="text-xs text-red-700 space-y-1">
                  {systemHealth.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Presupuesto Total</h3>
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(metrics.totalBudget)}
          </p>
          <p className="text-sm text-gray-500">
            Ejercicio {selectedYear}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ejecutado</h3>
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(metrics.totalExecuted)}
          </p>
          <div className="flex items-center">
            <span className="text-sm font-medium text-green-600">
              {metrics.executionRate.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">
              del presupuesto
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Índice de Transparencia</h3>
            <Shield className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.transparencyScore}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${metrics.transparencyScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Additional Financial & Transparency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contratos</h3>
            <Building className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.contractsCount}
          </p>
          <p className="text-sm text-gray-500">
            Licitaciones y contratos
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
            <FileText className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.totalDocuments}
          </p>
          <p className="text-sm text-gray-500">
            {metrics.verifiedDocuments} verificados
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
            <BarChart3 className="w-6 h-6 text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.categoriesCount}
          </p>
          <p className="text-sm text-gray-500">
            Áreas monitoreadas
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Seguimiento</h3>
            <Activity className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.moneyFlowTracked ? '✓' : '⚠'}
          </p>
          <p className="text-sm text-gray-500">
            Flujo de dinero
          </p>
        </div>
      </div>

      {/* Money Flow Summary */}
      {moneyFlow.discrepancies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Seguimiento Presupuesto → Contratos</h3>
            <p className="text-gray-600 mt-1">Rastreabilidad completa del dinero público</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {moneyFlow.discrepancies.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.category}</h4>
                    <p className="text-xs text-gray-500">
                      Presupuestado: {formatCurrency(item.budgeted)} |
                      Ejecutado: {formatCurrency(item.executed)}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.discrepancy_percentage > 0 ? '+' : ''}{item.discrepancy_percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/budget"
          className="block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <DollarSign className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Análisis Presupuestario</h3>
          </div>
          <p className="text-gray-600">Ver ejecución detallada del presupuesto municipal</p>
        </Link>

        <Link
          to="/contracts"
          className="block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <Building className="w-8 h-8 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Contratos y Licitaciones</h3>
          </div>
          <p className="text-gray-600">Explorar licitaciones públicas y contratos</p>
        </Link>

        <Link
          to="/documents"
          className="block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <FileText className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
          </div>
          <p className="text-gray-600">Acceder a todos los documentos municipales</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;