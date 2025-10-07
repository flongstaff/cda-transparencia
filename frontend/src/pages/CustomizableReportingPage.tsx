/***
 * Customizable Reporting Page for Carmen de Areco Transparency Portal
 * Integrates customizable reporting features with various export options
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Table,
  Users,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Settings,
  Printer,
  Mail,
  Share2,
  Layout,
  Type,
  Palette,
  Image,
  ChartNoAxesColumn,
  ListOrdered,
  CalendarDays,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Upload,
  Trash2,
  Copy,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useDashboardData } from '../hooks/useUnifiedData';
import { YearSelector } from '../components/common/YearSelector';
import { DataSourcesIndicator } from '../components/common/DataSourcesIndicator';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Import chart components for reports
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import RevenueBySourceChart from '../components/charts/RevenueBySourceChart';
import ExpenditureByProgramChart from '../components/charts/ExpenditureByProgramChart';
import DebtAnalysisChart from '../components/charts/DebtAnalysisChart';
import PersonnelExpensesChart from '../components/charts/PersonnelExpensesChart';
import InfrastructureProjectsChart from '../components/charts/InfrastructureProjectsChart';
import ContractAnalysisChart from '../components/charts/ContractAnalysisChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import MultiYearRevenueChart from '../components/charts/MultiYearRevenueChart';
import QuarterlyExecutionChart from '../components/charts/QuarterlyExecutionChart';
import WaterfallExecutionChart from '../components/charts/WaterfallExecutionChart';

interface CustomizableReportingPageProps {
  initialYear?: number;
  municipality?: string;
}

const CustomizableReportingPage: React.FC<CustomizableReportingPageProps> = ({
  initialYear = new Date().getFullYear(),
  municipality = 'Carmen de Areco'
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [activeTab, setActiveTab] = useState<'create' | 'templates' | 'history'>('create');
  const [reportName, setReportName] = useState<string>('Informe de Transparencia');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [reportTemplate, setReportTemplate] = useState<string>('standard');
  const [selectedSections, setSelectedSections] = useState<string[]>(['executive', 'financial', 'projects']);
  const [reportTheme, setReportTheme] = useState<'light' | 'dark' | 'municipal'>('municipal');
  const [reportSections, setReportSections] = useState<any[]>([
    { id: 'executive', title: 'Resumen Ejecutivo', enabled: true },
    { id: 'financial', title: 'Análisis Financiero', enabled: true },
    { id: 'projects', title: 'Proyectos de Infraestructura', enabled: true },
    { id: 'contracts', title: 'Contratos y Licitaciones', enabled: false },
    { id: 'personnel', title: 'Gastos de Personal', enabled: false },
    { id: 'revenue', title: 'Ingresos Municipales', enabled: false },
    { id: 'expenditure', title: 'Gastos Municipales', enabled: false },
    { id: 'debt', title: 'Análisis de Deuda', enabled: false },
  ]);
  const [reportData, setReportData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedReports, setGeneratedReports] = useState<any[]>([
    { 
      id: 1, 
      name: 'Informe Financiero 2024', 
      date: '2024-12-15', 
      format: 'pdf', 
      size: '2.4 MB',
      status: 'completed'
    },
    { 
      id: 2, 
      name: 'Informe de Proyectos Q4 2024', 
      date: '2024-11-30', 
      format: 'excel', 
      size: '1.8 MB',
      status: 'completed'
    },
    { 
      id: 3, 
      name: 'Análisis de Contratos 2024', 
      date: '2024-10-25', 
      format: 'pdf', 
      size: '3.1 MB',
      status: 'completed'
    },
  ]);
  
  const reportFormatOptions = [
    { id: 'pdf', label: 'PDF', icon: FileText },
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { id: 'csv', label: 'CSV', icon: FileText },
    { id: 'json', label: 'JSON', icon: FileJson },
  ];

  const reportTemplateOptions = [
    { id: 'standard', label: 'Estándar' },
    { id: 'executive', label: 'Ejecutivo' },
    { id: 'detailed', label: 'Detallado' },
    { id: 'summary', label: 'Resumen' },
    { id: 'compliance', label: 'Cumplimiento' },
  ];

  const reportThemeOptions = [
    { id: 'light', label: 'Claro' },
    { id: 'dark', label: 'Oscuro' },
    { id: 'municipal', label: 'Municipal' },
  ];

  // Use unified data service
  const {
    data: dashboardData,
    externalData,
    sources,
    activeSources,
    loading,
    error,
    refetch,
    availableYears,
    liveDataEnabled
  } = useDashboardData(selectedYear);

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Toggle report section
  const toggleSection = (sectionId: string) => {
    setReportSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, enabled: !section.enabled } 
          : section
      )
    );
  };

  // Generate report
  const generateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        name: reportName || `Informe-${selectedYear}`,
        date: new Date().toISOString().split('T')[0],
        format: reportFormat,
        size: reportFormat === 'pdf' ? '2.1 MB' : reportFormat === 'excel' ? '1.5 MB' : '0.8 MB',
        status: 'completed'
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
    }, 2000);
  };

  // Filter report templates based on search
  const filteredTemplates = reportTemplateOptions.filter(template =>
    template.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-blue-600" />
                Informes Personalizados - {municipality}
              </h1>
              <p className="mt-2 text-gray-600">
                Generación y personalización de informes con datos financieros municipales
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <YearSelector
                selectedYear={selectedYear}
                availableYears={availableYears}
                onChange={handleYearChange}
                label="Año del informe"
                className="min-w-[200px]"
              />
            </div>
          </div>

          {/* Data Sources Indicator */}
          <div className="mt-6">
            <DataSourcesIndicator
              activeSources={activeSources}
              externalData={externalData}
              loading={loading}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Crear Informe
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Layout className="h-4 w-4 mr-2" />
              Plantillas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Historial
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'create' && 'Crear Informe Personalizado'}
              {activeTab === 'templates' && 'Plantillas de Informe'}
              {activeTab === 'history' && 'Historial de Informes'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'create' && 'Configura y genera tu informe personalizado'}
              {activeTab === 'templates' && 'Selecciona una plantilla predefinida'}
              {activeTab === 'history' && 'Gestiona tus informes generados previamente'}
            </p>
          </div>
          
          {activeTab === 'create' && (
            <div className="flex items-center space-x-3">
              <button
                onClick={refetch}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generar Informe
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Search Bar for Templates */}
        {activeTab === 'templates' && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar plantillas de informe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Cargando datos del informe...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error en el Sistema</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {!loading && !error && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeTab === 'create' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Report Name */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Type className="h-5 w-5 mr-2 text-blue-600" />
                      Nombre del Informe
                    </h3>
                    <input
                      type="text"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingrese nombre del informe..."
                    />
                  </div>

                  {/* Format Selection */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-blue-600" />
                      Formato de Exportación
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {reportFormatOptions.map((format) => (
                        <button
                          key={format.id}
                          onClick={() => setReportFormat(format.id as any)}
                          className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                            reportFormat === format.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <format.icon className="h-6 w-6 mb-1" />
                          <span className="text-sm">{format.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Selection */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Layout className="h-5 w-5 mr-2 text-blue-600" />
                      Plantilla
                    </h3>
                    <div className="space-y-2">
                      {reportTemplateOptions.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => setReportTemplate(template.id)}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            reportTemplate === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{template.label}</p>
                          </div>
                          {reportTemplate === template.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Theme Selection */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Palette className="h-5 w-5 mr-2 text-blue-600" />
                      Tema Visual
                    </h3>
                    <div className="space-y-2">
                      {reportThemeOptions.map((theme) => (
                        <div
                          key={theme.id}
                          onClick={() => setReportTheme(theme.id as any)}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            reportTheme === theme.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{theme.label}</p>
                          </div>
                          {reportTheme === theme.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Report Sections */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ListOrdered className="h-5 w-5 mr-2 text-blue-600" />
                        Secciones del Informe
                      </h3>
                      <span className="text-sm text-gray-500">
                        {reportSections.filter(s => s.enabled).length} secciones activas
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportSections.map((section) => (
                        <div
                          key={section.id}
                          onClick={() => toggleSection(section.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            section.enabled
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 mt-0.5 h-4 w-4 rounded-full border ${
                              section.enabled
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300'
                            }`}>
                              {section.enabled && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{section.title}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {section.id === 'executive' && 'Resumen de indicadores clave'}
                                {section.id === 'financial' && 'Análisis presupuestario'}
                                {section.id === 'projects' && 'Proyectos de infraestructura'}
                                {section.id === 'contracts' && 'Contratos y licitaciones'}
                                {section.id === 'personnel' && 'Gastos de personal'}
                                {section.id === 'revenue' && 'Ingresos municipales'}
                                {section.id === 'expenditure' && 'Gastos municipales'}
                                {section.id === 'debt' && 'Análisis de deuda'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-blue-600" />
                        Vista Previa del Informe
                      </h3>
                      <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                        <Printer className="h-4 w-4 mr-1" />
                        Imprimir Vista Previa
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[400px]">
                      <div className="text-center py-16">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Vista previa del informe</p>
                        <p className="text-sm text-gray-400">
                          {isGenerating 
                            ? 'Generando vista previa...' 
                            : 'El informe se generará con base en la configuración seleccionada'}
                        </p>
                      </div>
                      
                      {/* Preview Elements */}
                      {reportSections.filter(s => s.enabled).map((section, index) => (
                        <div key={index} className="mt-4">
                          <h4 className="font-medium text-gray-800">{section.title}</h4>
                          <div className="mt-2 bg-white rounded border p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                            </div>
                            <div className="h-32 bg-gray-100 rounded mt-2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{template.label}</h3>
                            <p className="text-sm text-gray-500 mt-1">Plantilla predefinida</p>
                          </div>
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Layout className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                          {template.id === 'standard' && 'Plantilla estándar con secciones básicas'}
                          {template.id === 'executive' && 'Resumen para ejecutivos con indicadores clave'}
                          {template.id === 'detailed' && 'Información detallada para análisis profundo'}
                          {template.id === 'summary' && 'Resumen general con métricas clave'}
                          {template.id === 'compliance' && 'Informe para cumplimiento regulatorio'}
                        </p>
                      </div>
                      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => setReportTemplate(template.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                        Historial de Informes
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <Upload className="h-3 w-3 mr-1" />
                          Importar
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formato</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {generatedReports.map((report) => (
                          <tr key={report.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{report.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {report.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {report.format.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {report.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                report.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {report.status === 'completed' ? 'Completado' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900 flex items-center">
                                  <Download className="h-4 w-4 mr-1" />
                                  Descargar
                                </button>
                                <button className="text-gray-600 hover:text-gray-900 flex items-center">
                                  <Share2 className="h-4 w-4 mr-1" />
                                  Compartir
                                </button>
                                <button className="text-red-600 hover:text-red-900 flex items-center">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Report Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Informes</p>
                        <p className="text-2xl font-bold text-gray-900">{generatedReports.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg mr-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completados</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {generatedReports.filter(r => r.status === 'completed').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg mr-4">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Formatos</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {[...new Set(generatedReports.map(r => r.format))].length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informes Personalizados</h3>
              <p className="text-gray-600 text-sm">
                Generación de informes personalizados con datos financieros municipales en diferentes formatos.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Formatos Disponibles</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <FileText className="h-4 w-4 text-red-600 mr-2" />
                  <span>PDF - Documentos con formato profesional</span>
                </li>
                <li className="flex items-center">
                  <FileSpreadsheet className="h-4 w-4 text-green-600 mr-2" />
                  <span>Excel - Hojas de cálculo editables</span>
                </li>
                <li className="flex items-center">
                  <FileCsv className="h-4 w-4 text-blue-600 mr-2" />
                  <span>CSV - Datos en formato tabla</span>
                </li>
                <li className="flex items-center">
                  <FileJson className="h-4 w-4 text-yellow-600 mr-2" />
                  <span>JSON - Datos estructurados</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    <span>Descargar plantilla</span>
                  </button>
                </li>
                <li>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center">
                    <Share2 className="h-4 w-4 mr-1" />
                    <span>Compartir informe</span>
                  </button>
                </li>
                <li>
                  <a href="/reports" className="text-blue-600 hover:text-blue-800 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>Enviar por correo</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 Informes Personalizados - {municipality}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Wrap with error boundary for production safety
const CustomizableReportingPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">
                  Error al Cargar el Sistema de Informes
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Ocurrió un error al cargar la herramienta de informes personalizados. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 p-2 rounded">
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
      <CustomizableReportingPage />
    </ErrorBoundary>
  );
};

export default CustomizableReportingPageWithErrorBoundary;