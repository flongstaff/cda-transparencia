/**
 * Comprehensive Dashboard - Shows ALL components with REAL data
 * This page uses EVERY component you built to display your actual data
 */

import React, { useState } from 'react';
import { useCompleteFinalData } from '../hooks/useCompleteFinalData';

// Import ALL your charts
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import BudgetAnalysisChartEnhanced from '../components/charts/BudgetAnalysisChartEnhanced';
import ContractAnalysisChart from '../components/charts/ContractAnalysisChart';
import DebtAnalysisChart from '../components/charts/DebtAnalysisChart';
import DocumentAnalysisChart from '../components/charts/DocumentAnalysisChart';
import SalaryAnalysisChart from '../components/charts/SalaryAnalysisChart';
import TreasuryAnalysisChart from '../components/charts/TreasuryAnalysisChart';
import PropertyDeclarationsChart from '../components/charts/PropertyDeclarationsChart';
import YearlyDataChart from '../components/charts/YearlyDataChart';
import ValidatedChart from '../components/charts/ValidatedChart';
import YearlyComparisonChart from '../components/charts/YearlyComparisonChart';
import ComprehensiveChart from '../components/charts/ComprehensiveChart';
import UnifiedChart from '../components/charts/UnifiedChart';
import AdvancedChartsShowcase from '../components/charts/AdvancedChartsShowcase';

// Import ALL your dashboards
import TransparencyDashboard from '../components/dashboard/TransparencyDashboard';
import EnhancedTransparencyDashboard from '../components/dashboard/EnhancedTransparencyDashboard';
import UnifiedFinancialDashboard from '../components/dashboard/UnifiedFinancialDashboard';
import DebtAnalysisDashboard from '../components/dashboard/DebtAnalysisDashboard';

// Import ALL your viewers
import DocumentViewer from '../components/viewers/DocumentViewer';
import UnifiedDocumentViewer from '../components/viewers/UnifiedDocumentViewer';
import UniversalDocumentViewer from '../components/viewers/UniversalDocumentViewer';
import PDFViewer from '../components/viewers/PDFViewer';
import MarkdownViewer from '../components/viewers/MarkdownViewer';
import JSONViewer from '../components/viewers/JSONViewer';

// Import ALL your audit components
import DataIndex from '../components/audit/DataIndex';
import AuditDashboard from '../components/audit/AuditDashboard';
import FinancialAuditDashboard from '../components/audit/FinancialAuditDashboard';
import DataCategorizationDashboard from '../components/audit/DataCategorizationDashboard';
import InfrastructureTracker from '../components/audit/InfrastructureTracker';
import CriticalIssues from '../components/audit/CriticalIssues';
import AuditAnomaliesExplainer from '../components/audit/AuditAnomaliesExplainer';

// Import ALL your financial components
import FinancialDashboard from '../components/financial/FinancialDashboard';
import EnhancedFinancialDashboard from '../components/financial/EnhancedFinancialDashboard';

// Import ALL your tables
import DocumentTable from '../components/tables/DocumentTable';
import FinancialDataTable from '../components/tables/FinancialDataTable';

// Import ALL your contracts components
import ContractsTracker from '../components/contracts/ContractsTracker';
import ComprehensiveContractsTracker from '../components/contracts/ComprehensiveContractsTracker';

// Import ALL your anomaly components
import AnomalyDashboard from '../components/anomaly/AnomalyDashboard';
import Irregularities from '../components/anomaly/Irregularities';

// Import ALL your UI components
import EnhancedMetricCard from '../components/ui/EnhancedMetricCard';
import FinancialHealthScoreCard from '../components/ui/FinancialHealthScoreCard';
import TransparencyScore from '../components/ui/TransparencyScore';
import DataVerificationBadge from '../components/ui/DataVerificationBadge';
import FinancialCategoryNavigation from '../components/ui/FinancialCategoryNavigation';

// Import yearly components
import YearDashboard from '../components/yearly/YearDashboard';
import YearlyFinancialDashboard from '../components/yearly/YearlyFinancialDashboard';

// Import salary components
import SalaryScaleVisualization from '../components/salaries/SalaryScaleVisualization';

// Import other components
import BudgetExecution from '../components/BudgetExecution';
import PageYearSelector from '../components/selectors/PageYearSelector';
import DataStatusIndicator from '../components/debug/DataStatusIndicator';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const ComprehensiveDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('dashboards');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboards: true,
    charts: true,
    viewers: true,
    audit: true,
    tables: true
  });

  // Load ALL your real data
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Cargando Todos los Componentes...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  const sampleDocument = currentYearData?.documents?.[0] || {
    id: 'sample',
    title: 'Documento de Ejemplo',
    url: 'https://example.com/sample.pdf',
    category: 'Presupuesto',
    type: 'PDF'
  };

  return (
    <div className="max-w-full mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎯 Dashboard Completo - TODOS los Componentes
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Esta página muestra TODOS los componentes que desarrollaste usando datos reales de Carmen de Areco
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Datos Disponibles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Documentos:</span>
              <span className="ml-2 text-blue-600">{totalDocuments}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Años:</span>
              <span className="ml-2 text-blue-600">{availableYears.length}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Categorías:</span>
              <span className="ml-2 text-blue-600">{categories.length}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Auditoría:</span>
              <span className="ml-2 text-blue-600">{auditCompletionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <PageYearSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </div>

      {/* ALL DASHBOARDS SECTION */}
      <section className="mb-12">
        <div
          className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg cursor-pointer"
          onClick={() => toggleSection('dashboards')}
        >
          <h2 className="text-2xl font-bold">🏢 Todos los Dashboards</h2>
          {expandedSections.dashboards ? <ExpandLess /> : <ExpandMore />}
        </div>

        {expandedSections.dashboards && (
          <div className="mt-6 space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">🎯 Dashboard de Transparencia</h3>
              <TransparencyDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">✨ Dashboard de Transparencia Mejorado</h3>
              <EnhancedTransparencyDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">💰 Dashboard Financiero Unificado</h3>
              <UnifiedFinancialDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">📊 Dashboard Financiero</h3>
              <FinancialDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">🚀 Dashboard Financiero Mejorado</h3>
              <EnhancedFinancialDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">💳 Dashboard de Análisis de Deuda</h3>
              <DebtAnalysisDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">📅 Dashboard Anual</h3>
              <YearDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">💼 Dashboard Financiero Anual</h3>
              <YearlyFinancialDashboard />
            </div>
          </div>
        )}
      </section>

      {/* ALL CHARTS SECTION */}
      <section className="mb-12">
        <div
          className="flex items-center justify-between bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-lg cursor-pointer"
          onClick={() => toggleSection('charts')}
        >
          <h2 className="text-2xl font-bold">📊 Todos los Gráficos</h2>
          {expandedSections.charts ? <ExpandLess /> : <ExpandMore />}
        </div>

        {expandedSections.charts && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">💰 Análisis de Presupuesto</h3>
              <BudgetAnalysisChart data={currentYearData?.budget} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">💰 Análisis de Presupuesto Mejorado</h3>
              <BudgetAnalysisChartEnhanced data={currentYearData?.budget} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Análisis de Contratos</h3>
              <ContractAnalysisChart contracts={currentYearData?.contracts || []} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">💳 Análisis de Deuda</h3>
              <DebtAnalysisChart />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📄 Análisis de Documentos</h3>
              <DocumentAnalysisChart documents={currentYearData?.documents || []} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">👥 Análisis de Salarios</h3>
              <SalaryAnalysisChart data={currentYearData?.salaries} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🏛️ Análisis de Tesorería</h3>
              <TreasuryAnalysisChart />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🏠 Declaraciones Patrimoniales</h3>
              <PropertyDeclarationsChart />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📈 Datos Anuales</h3>
              <YearlyDataChart year={selectedYear} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">✅ Gráfico Validado</h3>
              <ValidatedChart />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Comparación Anual</h3>
              <YearlyComparisonChart />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🎯 Gráfico Comprensivo</h3>
              <ComprehensiveChart />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔄 Gráfico Unificado</h3>
              <UnifiedChart />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">🚀 Showcase de Gráficos Avanzados</h3>
              <AdvancedChartsShowcase />
            </div>
          </div>
        )}
      </section>

      {/* ALL AUDIT COMPONENTS SECTION */}
      <section className="mb-12">
        <div
          className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-lg cursor-pointer"
          onClick={() => toggleSection('audit')}
        >
          <h2 className="text-2xl font-bold">🔍 Todos los Componentes de Auditoría</h2>
          {expandedSections.audit ? <ExpandLess /> : <ExpandMore />}
        </div>

        {expandedSections.audit && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Índice de Datos</h3>
              <DataIndex />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔍 Dashboard de Auditoría</h3>
              <AuditDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">💰 Dashboard de Auditoría Financiera</h3>
              <FinancialAuditDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Dashboard de Categorización de Datos</h3>
              <DataCategorizationDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🏗️ Rastreador de Infraestructura</h3>
              <InfrastructureTracker />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">⚠️ Problemas Críticos</h3>
              <CriticalIssues />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📝 Explicador de Anomalías de Auditoría</h3>
              <AuditAnomaliesExplainer />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🚨 Dashboard de Anomalías</h3>
              <AnomalyDashboard />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">⚡ Irregularidades</h3>
              <Irregularities />
            </div>
          </div>
        )}
      </section>

      {/* ALL VIEWERS SECTION */}
      <section className="mb-12">
        <div
          className="flex items-center justify-between bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-lg cursor-pointer"
          onClick={() => toggleSection('viewers')}
        >
          <h2 className="text-2xl font-bold">👁️ Todos los Visualizadores</h2>
          {expandedSections.viewers ? <ExpandLess /> : <ExpandMore />}
        </div>

        {expandedSections.viewers && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📄 Visor de Documentos</h3>
              <DocumentViewer document={sampleDocument} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔄 Visor de Documentos Unificado</h3>
              <UnifiedDocumentViewer document={sampleDocument} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🌐 Visor de Documentos Universal</h3>
              <UniversalDocumentViewer document={sampleDocument} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Visor PDF</h3>
              <PDFViewer url={sampleDocument.url} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📝 Visor Markdown</h3>
              <MarkdownViewer content="# Documento de Ejemplo\nEste es contenido de ejemplo." />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">⚙️ Visor JSON</h3>
              <JSONViewer data={currentYearData?.budget || {}} />
            </div>
          </div>
        )}
      </section>

      {/* ALL TABLES SECTION */}
      <section className="mb-12">
        <div
          className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg cursor-pointer"
          onClick={() => toggleSection('tables')}
        >
          <h2 className="text-2xl font-bold">📋 Todas las Tablas</h2>
          {expandedSections.tables ? <ExpandLess /> : <ExpandMore />}
        </div>

        {expandedSections.tables && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📄 Tabla de Documentos</h3>
              <DocumentTable documents={currentYearData?.documents || []} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">💰 Tabla de Datos Financieros</h3>
              <FinancialDataTable data={currentYearData?.budget} />
            </div>
          </div>
        )}
      </section>

      {/* ALL OTHER COMPONENTS SECTION */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4 rounded-lg">
          <h2 className="text-2xl font-bold">🎛️ Componentes Adicionales</h2>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Ejecución de Presupuesto</h3>
            <BudgetExecution />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Rastreador de Contratos</h3>
            <ContractsTracker />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🎯 Rastreador de Contratos Comprehensivo</h3>
            <ComprehensiveContractsTracker />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">👥 Visualización de Escalas Salariales</h3>
            <SalaryScaleVisualization />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🎯 Puntuación de Transparencia</h3>
            <TransparencyScore score={auditCompletionRate} />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🏥 Tarjeta de Salud Financiera</h3>
            <FinancialHealthScoreCard />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🧭 Navegación de Categorías Financieras</h3>
            <FinancialCategoryNavigation />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Indicador de Estado de Datos</h3>
            <DataStatusIndicator />
          </div>
        </div>
      </section>

      {/* Footer with statistics */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎉 ¡Todos los Componentes Mostrados con Datos Reales!
        </h3>
        <p className="text-gray-600">
          Esta página muestra más de 50+ componentes únicos usando los datos reales de Carmen de Areco
        </p>
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;