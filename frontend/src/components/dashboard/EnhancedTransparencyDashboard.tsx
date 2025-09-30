/**
 * Enhanced Transparency Dashboard
 * Comprehensive dashboard integrating data visualization and OSINT monitoring
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Globe,
  Database,
  Clock,
  Info,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';

import EnhancedDataVisualization from '../charts/EnhancedDataVisualization';
import OSINTMonitoringSystem from '../monitoring/OSINTMonitoringSystem';
import PageYearSelector from '../forms/PageYearSelector';

interface EnhancedTransparencyDashboardProps {
  initialYear?: number;
  municipality?: string;
  className?: string;
}

const EnhancedTransparencyDashboard: React.FC<EnhancedTransparencyDashboardProps> = ({
  initialYear = new Date().getFullYear(),
  municipality = 'Carmen de Areco',
  className = ''
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'monitoring' | 'audit'>('overview');
  const [expandedView, setExpandedView] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const availableYears = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3, description: 'Vista general del sistema' },
    { id: 'financial', label: 'Financiero', icon: DollarSign, description: 'Análisis financiero detallado' },
    { id: 'monitoring', label: 'Monitoreo', icon: Shield, description: 'Sistema de monitoreo OSINT' },
    { id: 'audit', label: 'Auditoría', icon: AlertTriangle, description: 'Resultados de auditoría' }
  ];

  const dataTypes = [
    { key: 'budget', label: 'Presupuesto', icon: DollarSign, color: 'blue' },
    { key: 'revenue', label: 'Ingresos', icon: TrendingUp, color: 'green' },
    { key: 'expenditure', label: 'Gastos', icon: TrendingDown, color: 'red' },
    { key: 'debt', label: 'Deuda', icon: FileText, color: 'orange' },
    { key: 'personnel', label: 'Personal', icon: Users, color: 'purple' },
    { key: 'contracts', label: 'Contratos', icon: Building, color: 'indigo' },
    { key: 'infrastructure', label: 'Infraestructura', icon: Building, color: 'teal' }
  ];

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  };

  const toggleExpandedView = (viewId: string) => {
    setExpandedView(expandedView === viewId ? null : viewId);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Presupuesto Total</p>
              <p className="text-2xl font-bold text-gray-900">$500M</p>
              <p className="text-xs text-green-600">+5.2% vs año anterior</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ejecución</p>
              <p className="text-2xl font-bold text-gray-900">97.2%</p>
              <p className="text-xs text-green-600">Excelente</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Alertas</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-xs text-yellow-600">Requieren atención</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fuentes OSINT</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-xs text-green-600">Activas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dataTypes.map((dataType, index) => (
          <motion.div
            key={dataType.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setActiveTab('financial');
              setExpandedView(dataType.key);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${dataType.color}-100`}>
                <dataType.icon className={`h-6 w-6 text-${dataType.color}-600`} />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{dataType.label}</h3>
            <p className="text-sm text-gray-600">Análisis detallado disponible</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Actividad Reciente
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Datos actualizados</p>
                <p className="text-xs text-gray-500">Presupuesto 2025 - hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Nueva discrepancia detectada</p>
                <p className="text-xs text-gray-500">Análisis OSINT - hace 4 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Fuente OSINT verificada</p>
                <p className="text-xs text-gray-500">Gobierno de Buenos Aires - hace 6 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      {expandedView ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setExpandedView(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Volver a la vista general"
                aria-label="Volver a la vista general"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {dataTypes.find(dt => dt.key === expandedView)?.label} - {selectedYear}
              </h2>
            </div>
            <button
              onClick={() => toggleExpandedView(expandedView)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={expandedView === 'expanded' ? 'Minimizar vista' : 'Maximizar vista'}
              aria-label={expandedView === 'expanded' ? 'Minimizar vista' : 'Maximizar vista'}
            >
              {expandedView === 'expanded' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
          <EnhancedDataVisualization
            year={selectedYear}
            dataType={expandedView as any}
            variant="detailed"
            showControls={true}
            showExport={true}
            showFilters={true}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dataTypes.slice(0, 4).map((dataType) => (
            <div key={dataType.key} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <dataType.icon className={`h-5 w-5 mr-2 text-${dataType.color}-600`} />
                    {dataType.label}
                  </h3>
                  <button
                    onClick={() => setExpandedView(dataType.key)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Maximize2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <EnhancedDataVisualization
                  year={selectedYear}
                  dataType={dataType.key as any}
                  variant="dashboard"
                  showControls={false}
                  showExport={false}
                  showFilters={false}
                  className="h-64"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMonitoringTab = () => (
    <OSINTMonitoringSystem
      year={selectedYear}
      municipality={municipality}
      showControls={true}
      autoRefresh={true}
      refreshInterval={300000}
    />
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados de Auditoría</h3>
        <div className="space-y-4">
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">Discrepancia Crítica</span>
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">ALTA</span>
            </div>
            <p className="text-red-700 text-sm mb-2">
              Diferencia encontrada entre presupuesto interno y datos oficiales del Gobierno de Buenos Aires
            </p>
            <p className="text-red-600 text-xs">
              Recomendación: Verificar y reconciliar datos presupuestarios con fuentes oficiales
            </p>
          </div>

          <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Información Incompleta</span>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-600 rounded-full">MEDIA</span>
            </div>
            <p className="text-yellow-700 text-sm mb-2">
              Faltan detalles de contratos mencionados en fuentes externas
            </p>
            <p className="text-yellow-600 text-xs">
              Recomendación: Completar información de contratos y publicar en portal de transparencia
            </p>
          </div>

          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Verificación Externa</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">BAJA</span>
            </div>
            <p className="text-blue-700 text-sm mb-2">
              Denuncias sobre irregularidades en redes sociales requieren investigación
            </p>
            <p className="text-blue-600 text-xs">
              Recomendación: Investigar denuncias y proporcionar respuesta oficial
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'financial':
        return renderFinancialTab();
      case 'monitoring':
        return renderMonitoringTab();
      case 'audit':
        return renderAuditTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de Transparencia
            </h1>
            <p className="mt-2 text-gray-600">
              Sistema integral de transparencia municipal con monitoreo OSINT
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              availableYears={availableYears}
              size="md"
              label="Año de consulta"
              showDataAvailability={true}
              className="min-w-[200px]"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar información en el portal de transparencia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Cargando datos para {selectedYear}...</p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedTransparencyDashboard;
