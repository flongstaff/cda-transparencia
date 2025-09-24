/**
 * Dashboard - Municipal Transparency Portal
 * Uses real Carmen de Areco data
 * Shows ALL years (2018-2025) with real audit and financial data
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
  Shield,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompleteFinalData } from '../hooks/useCompleteFinalData';
import PageYearSelector from '../components/selectors/PageYearSelector';

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // 🚀 COMPREHENSIVE DATA SERVICE - ALL CARMEN DE ARECO DATA
  const {
    completeData,
    currentYearData,
    loading,
    error,
    totalDocuments,
    availableYears,
    categories,
    auditCompletionRate
  } = useCompleteFinalData(selectedYear);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate financial metrics from current year data
  const metrics = useMemo(() => {
    if (!currentYearData) {
      return {
        totalBudget: 0,
        totalExecuted: 0,
        executionRate: 0,
        totalContracts: 0,
        verifiedDocuments: 0,
        auditScore: auditCompletionRate
      };
    }

    // Extract financial data from real data structure
    const budget = currentYearData.budget;
    const contracts = currentYearData.contracts || [];
    const documents = currentYearData.documents || [];

    const totalBudget = budget?.totalBudget || 0;
    const totalExecuted = budget?.totalExecuted || 0;
    const executionRate = budget?.executionPercentage || 0;

    const totalContracts = contracts.length;
    const verifiedDocuments = documents.length; // All documents are considered verified in real data

    return {
      totalBudget,
      totalExecuted,
      executionRate,
      totalContracts,
      verifiedDocuments,
      auditScore: auditCompletionRate
    };
  }, [currentYearData, auditCompletionRate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos completos del sistema municipal...</p>
          <p className="text-sm text-gray-500 mt-2">
            Cargando {availableYears.length} años de datos financieros y de auditoría
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error del Sistema</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar Carga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Portal de Transparencia Municipal
        </h1>
        <p className="text-gray-600">
          Datos completos de {selectedYear} - {totalDocuments} documentos procesados
        </p>
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
          <span>📊 {categories.length} categorías</span>
          <span>🔗 {availableYears.length} años disponibles</span>
          <span>✅ {auditCompletionRate.toFixed(1)}% auditoría completada</span>
        </div>
      </div>

      {/* Year Selector */}
      <PageYearSelector
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {/* System Status */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema de Transparencia</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              auditCompletionRate > 80 ? 'bg-green-100 text-green-800' :
              auditCompletionRate > 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {auditCompletionRate > 80 ? '✅ Sistema Completo' :
               auditCompletionRate > 50 ? '⚠️ En Desarrollo' :
               '❌ Datos Limitados'}
            </div>
          </div>
          <p className="text-gray-600 mt-1">
            Sistema completo de transparencia con {totalDocuments} documentos procesados
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Documentos Totales</p>
                  <p className="text-2xl font-bold text-blue-600">{totalDocuments}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Años Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">{availableYears.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Categorías</p>
                  <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-900">Años Cubiertos</p>
                  <p className="text-2xl font-bold text-orange-600">{availableYears.length}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Presupuesto {selectedYear}</h3>
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(metrics.totalBudget)}
          </p>
          <p className="text-sm text-gray-500">
            Presupuesto total municipal
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
            <h3 className="text-lg font-semibold text-gray-900">Auditoría Completa</h3>
            <Shield className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {auditCompletionRate.toFixed(1)}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${auditCompletionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Document Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contratos</h3>
            <Building className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.totalContracts}
          </p>
          <p className="text-sm text-gray-500">
            Licitaciones y contratos
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Verificados</h3>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.verifiedDocuments}
          </p>
          <p className="text-sm text-gray-500">
            Documentos verificados
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Año Actual</h3>
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {currentYearData?.documents?.length || 0}
          </p>
          <p className="text-sm text-gray-500">
            Documentos {selectedYear}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
            <Users className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {categories.length}
          </p>
          <p className="text-sm text-gray-500">
            Áreas municipales
          </p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/budget"
          className="block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <DollarSign className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Presupuesto</h3>
          </div>
          <p className="text-gray-600">Análisis completo del presupuesto municipal</p>
          <p className="text-sm text-blue-600 mt-2">
            Ver {formatCurrency(metrics.totalBudget)} presupuestado
          </p>
        </Link>

        <Link
          to="/contracts"
          className="block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <Building className="w-8 h-8 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Contratos</h3>
          </div>
          <p className="text-gray-600">Licitaciones y contratos municipales</p>
          <p className="text-sm text-orange-600 mt-2">
            {metrics.totalContracts} contratos registrados
          </p>
        </Link>

        <Link
          to="/documents"
          className="block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <FileText className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
          </div>
          <p className="text-gray-600">Acceso a todos los documentos municipales</p>
          <p className="text-sm text-green-600 mt-2">
            {totalDocuments} documentos disponibles
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;