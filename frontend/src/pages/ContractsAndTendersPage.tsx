import React, { useState, useEffect } from 'react';
import {
  Building,
  FileText,
  Search,
  Filter,
  Calendar,
  Download,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Shield,
  Eye,
  BarChart3,
  Activity,
  Target,
  Database,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import SankeyDiagram from '../components/data-display/SankeyDiagram';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMasterData } from '../hooks/useMasterData';
import ProcurementTimelineChart from '../components/charts/ProcurementTimelineChart';
import TimeSeriesAnomalyChart from '../components/charts/TimeSeriesAnomalyChart';
import TreemapChart from '../components/charts/TreemapChart';
import UnifiedChart from '../components/charts/UnifiedChart';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { motion } from 'framer-motion';
import { externalAPIsService } from "../services/ExternalDataAdapter";
import { StatCard } from '../components/common/StatCard';
import { ChartContainer } from '../components/common/ChartContainer';

// Mock data for demonstration
const mockTendersData = [
  {
    id: 1,
    title: 'Licitación Obras Viales 2023',
    vendor: 'Construcciones S.A.',
    amount: 50000000,
    category: 'Obras Públicas',
    year: 2023,
    status: 'completed',
    startDate: '2023-03-15',
    endDate: '2023-12-20',
    execution: 47500000,
    executionRate: 95
  },
  {
    id: 2,
    title: 'Mantenimiento Parques y Plazas',
    vendor: 'Verde Urbano S.R.L.',
    amount: 15000000,
    category: 'Servicios Públicos',
    year: 2023,
    status: 'in-progress',
    startDate: '2023-05-10',
    endDate: '2024-02-15',
    execution: 8500000,
    executionRate: 56.7
  },
  {
    id: 3,
    title: 'Suministro de Equipamiento Médico',
    vendor: 'Salud Técnica S.A.',
    amount: 25000000,
    category: 'Salud y Acción Social',
    year: 2023,
    status: 'completed',
    startDate: '2023-01-20',
    endDate: '2023-08-30',
    execution: 25000000,
    executionRate: 100
  },
  {
    id: 4,
    title: 'Software Gestión Municipal',
    vendor: 'Tech Solutions S.A.',
    amount: 8000000,
    category: 'Administración',
    year: 2023,
    status: 'pending',
    startDate: '2023-10-05',
    endDate: '2024-05-15',
    execution: 0,
    executionRate: 0
  }
];

// Sankey data
const sankeyData = {
  nodes: [
    { id: 'contratos', name: 'Contratos 2023' },
    { id: 'obras', name: 'Obras Públicas' },
    { id: 'servicios', name: 'Servicios Públicos' },
    { id: 'salud', name: 'Salud' },
    { id: 'admin', name: 'Administración' },
    { id: 'ejecutado', name: 'Total Ejecutado' }
  ],
  links: [
    { source: 'contratos', target: 'obras', value: 50000000 }, // Obras Viales
    { source: 'contratos', target: 'servicios', value: 15000000 }, // Parques
    { source: 'contratos', target: 'salud', value: 25000000 }, // Equipamiento Médico
    { source: 'contratos', target: 'admin', value: 8000000 },  // Software
    { source: 'obras', target: 'ejecutado', value: 47500000 }, // Obras Ejecutado
    { source: 'servicios', target: 'ejecutado', value: 8500000 },  // Parques Ejecutado
    { source: 'salud', target: 'ejecutado', value: 25000000 }, // Salud Ejecutado
    { source: 'admin', target: 'ejecutado', value: 0 }         // Software Ejecutado
  ]
};

const ContractsAndTendersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('amount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'overview' | 'procurement' | 'corruption' | 'timeline' | 'analysis' | 'sources'>('overview');

  // 🚀 Use master data service that includes all contract sources
  const {
    currentContracts,
    availableYears,
    loading,
    error,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // 🌐 External API integration
  const [externalData, setExternalData] = useState<{
    contrataciones: any;
    carmenOfficial: any;
  }>({
    contrataciones: null,
    carmenOfficial: null
  });
  const [externalLoading, setExternalLoading] = useState(true);
  const [dataSources, setDataSources] = useState<string[]>(['local']);

  // Load external data on mount
  useEffect(() => {
    loadExternalData();
  }, [selectedYear]);

  const loadExternalData = async () => {
    try {
      setExternalLoading(true);
      console.log('Fetching external contracts data...');

      const [contratacionesResult, carmenResult] = await Promise.allSettled([
        externalAPIsService.getContratacionesData('Carmen de Areco'),
        externalAPIsService.getCarmenDeArecoData()
      ]);

      const newExternalData: any = {
        contrataciones: contratacionesResult.status === 'fulfilled' && contratacionesResult.value.success
          ? contratacionesResult.value.data
          : null,
        carmenOfficial: carmenResult.status === 'fulfilled'
          ? carmenResult.value
          : null
      };

      setExternalData(newExternalData);

      const activeSources = ['local'];
      if (newExternalData.contrataciones) activeSources.push('contrataciones');
      if (newExternalData.carmenOfficial) activeSources.push('carmen');

      setDataSources(activeSources);

      console.log('External contracts data loaded:', {
        contrataciones: !!newExternalData.contrataciones,
        carmen: !!newExternalData.carmenOfficial
      });
    } catch (error) {
      console.error('Error loading external contracts data:', error);
    } finally {
      setExternalLoading(false);
    }
  };

  // Format currency function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Use real contract data if available, fallback to mock data for demo
  const contractsData = currentContracts && currentContracts.length > 0 ? currentContracts : mockTendersData;

  // Filter and sort data
  let filteredData = [...contractsData];

  if (searchTerm) {
    filteredData = filteredData.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterCategory !== 'all') {
    filteredData = filteredData.filter(item => item.category === filterCategory);
  }

  if (filterStatus !== 'all') {
    filteredData = filteredData.filter(item => item.status === filterStatus);
  }

  if (filterYear !== 'all') {
    filteredData = filteredData.filter(item => item.year === parseInt(filterYear));
  }

  filteredData.sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'vendor') {
      comparison = a.vendor.localeCompare(b.vendor);
    } else if (sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortBy === 'year') {
      comparison = a.year - b.year;
    } else if (sortBy === 'executionRate') {
      comparison = a.executionRate - b.executionRate;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Prepare data for charts
  const categoryTotals = filteredData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { category: item.category, total: 0, executed: 0 };
    }
    acc[item.category].total += item.amount;
    acc[item.category].executed += item.execution;
    return acc;
  }, {} as Record<string, { category: string; total: number; executed: number }>);

  const categoryData = Object.values(categoryTotals).map(cat => ({
    name: cat.category,
    total: cat.total,
    executed: cat.executed
  }));

  // Get unique years and categories for filters
  const uniqueYears = Array.from(new Set(contractsData.map(item => item.year))).sort((a, b) => b - a);
  const uniqueCategories = Array.from(new Set(contractsData.map(item => item.category)));

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">Cargando contratos y licitaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">Error al cargar los datos</h3>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Contratos y Licitaciones {selectedYear}
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Seguimiento de contratos y licitaciones municipales para el ejercicio {selectedYear}
            </p>
          </div>

          {/* Year Selector */}
          <div className="flex-shrink-0">
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Año Fiscal
              </label>
              <select
                value={selectedYear}
                onChange={(e) => switchYear(Number(e.target.value))}
                className="w-full px-4 py-2 text-base font-medium border border-gray-300 dark:border-dark-border rounded-lg
                         bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         hover:border-blue-300 transition-colors"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year} {year === new Date().getFullYear() && '(Actual)'}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs text-gray-500 dark:text-dark-text-tertiary">
                Contratos {selectedYear}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources Status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-white dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
            Fuentes de Datos Activas
          </h3>
          {externalLoading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-gray-700 dark:text-dark-text-secondary">CSV Local ({contractsData.length} contratos)</span>
          </div>
          {externalData.contrataciones ? (
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-gray-700 dark:text-dark-text-secondary">Contrataciones Abiertas</span>
              <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
            </div>
          ) : (
            <div className="flex items-center text-sm">
              <AlertTriangle className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-400">Contrataciones Abiertas</span>
            </div>
          )}
          {externalData.carmenOfficial ? (
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-gray-700 dark:text-dark-text-secondary">Portal Carmen de Areco</span>
              <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
            </div>
          ) : (
            <div className="flex items-center text-sm">
              <AlertTriangle className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-400">Portal Carmen de Areco</span>
            </div>
          )}
          <div className="ml-auto text-xs text-gray-500 dark:text-dark-text-tertiary">
            Fuentes activas: {dataSources.length}
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-dark-border">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Resumen General', icon: BarChart3 },
              { id: 'procurement', name: 'Análisis de Procuración', icon: Target },
              { id: 'corruption', name: 'Detección de Anomalías', icon: Shield },
              { id: 'timeline', name: 'Cronología', icon: Activity },
              { id: 'analysis', name: 'Análisis Avanzado', icon: TrendingUp },
              { id: 'sources', name: 'Fuentes de Datos', icon: Database }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as any)}
                  className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-sm font-medium text-center hover:text-blue-600 focus:z-10 ${
                    viewMode === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <span className="truncate">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content based on view mode */}
      <ErrorBoundary>
        {viewMode === 'overview' && (
          <div>
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar contratos, proveedores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Categoría</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Estado</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="in-progress">En Progreso</option>
                  <option value="completed">Completado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Año</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="amount">Monto</option>
                  <option value="title">Título</option>
                  <option value="vendor">Proveedor</option>
                  <option value="year">Año</option>
                  <option value="executionRate">Tasa Ejecución</option>
                </select>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold mb-4">Contratos por Categoría</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                      <Tooltip
                        formatter={(value) => [formatCurrency(Number(value)), 'Monto']}
                        labelFormatter={(label) => `Categoría: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="total" name="Total Contratado" fill="#3B82F6" />
                      <Bar dataKey="executed" name="Total Ejecutado" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold mb-4">Flujo de Contratos</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {mockTendersData && mockTendersData.length > 0 ? (
                      <SankeyDiagram
                        data={sankeyData}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-dark-text-tertiary">
                        No hay datos suficientes para mostrar el diagrama Sankey
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Contracts Table */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow border overflow-hidden">
              <h3 className="text-xl font-semibold p-4 border-b">Lista de Contratos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-dark-background">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">Título</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">Proveedor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">Monto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">Ejecutado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">Tasa Ejecución</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
                    {filteredData.map((contract) => (
                      <tr key={contract.id} className={contract.id % 2 === 0 ? 'bg-white' : 'bg-gray-50 dark:bg-dark-background'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">{contract.title}</div>
                          <div className="text-sm text-gray-500 dark:text-dark-text-tertiary">ID: {contract.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary">{contract.vendor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary">{contract.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary">{formatCurrency(contract.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary">{formatCurrency(contract.execution)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 dark:text-dark-text-tertiary mr-2">{contract.executionRate}%</span>
                            <div className="w-24 bg-gray-200 dark:bg-dark-border rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  contract.executionRate >= 90 ? 'bg-green-500' :
                                  contract.executionRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(contract.executionRate, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            contract.status === 'completed' ? 'bg-green-100 text-green-800' :
                            contract.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {contract.status === 'completed' ? 'Completado' :
                             contract.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900">
                              <FileText className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 dark:text-green-400 hover:text-green-900">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contract Details Panel */}
            <div className="mt-8 bg-white dark:bg-dark-surface rounded-lg shadow border p-6">
              <h3 className="text-xl font-semibold mb-4">Análisis de Contratos</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Contratos"
                  value={filteredData.length.toString()}
                  subtitle="Licitaciones y contratos"
                  icon={Building}
                  iconColor="blue"
                  delay={0}
                />

                <StatCard
                  title="Monto Total Contratado"
                  value={formatCurrency(filteredData.reduce((sum, c) => sum + c.amount, 0))}
                  subtitle="Suma de todos los contratos"
                  icon={DollarSign}
                  iconColor="green"
                  delay={0.1}
                />

                <StatCard
                  title="Tasa de Ejecución Promedio"
                  value={`${filteredData.length > 0
                    ? (filteredData.reduce((sum, c) => sum + c.executionRate, 0) / filteredData.length).toFixed(1)
                    : '0'}%`}
                  subtitle="Promedio de cumplimiento"
                  icon={TrendingUp}
                  iconColor="purple"
                  trend={filteredData.length > 0 ? {
                    value: filteredData.reduce((sum, c) => sum + c.executionRate, 0) / filteredData.length,
                    direction: ((filteredData.reduce((sum, c) => sum + c.executionRate, 0) / filteredData.length) >= 80) ? 'up' : 'down',
                    label: 'ejecutado'
                  } : undefined}
                  delay={0.2}
                />
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Contratos con Anomalías</h4>
                <div className="space-y-2">
                  {filteredData.filter(c => c.executionRate < 75).map(contract => (
                    <div key={`anomaly-${contract.id}`} className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                      <span className="text-sm">
                        <span className="font-medium">{contract.title}</span> - Solo {contract.executionRate}% ejecutado
                      </span>
                    </div>
                  ))}
                  {filteredData.filter(c => c.executionRate < 75).length === 0 && (
                    <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm">No se encontraron contratos con ejecución crítica</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'procurement' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-lg shadow border p-6"
            >
              <h3 className="text-xl font-semibold mb-6">Análisis de Procuración</h3>

              {/* Procurement Timeline */}
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4">Cronología de Procesos</h4>
                <div className="h-96">
                  <ProcurementTimelineChart
                    height={384}
                    chartType="scatter"
                    years={[selectedYear]}
                  />
                </div>
              </div>

              {/* Procurement by Category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-4">Distribución por Categoría</h4>
                  <TreemapChart
                    data={categoryData.map(item => ({
                      name: item.name,
                      value: item.total,
                      children: [{ name: item.name, value: item.total }]
                    }))}
                    height={300}
                    title="Contratos por Categoría"
                  />
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-4">Métricas de Procuración</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Tiempo Promedio de Proceso', value: '45 días', trend: 'down' },
                      { label: 'Proveedores Únicos', value: filteredData.length, trend: 'up' },
                      { label: 'Competencia Promedio', value: '3.2 ofertas', trend: 'stable' },
                      { label: 'Ahorro vs. Presupuesto', value: '12.5%', trend: 'up' }
                    ].map((metric, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-background rounded-lg">
                        <span className="text-sm font-medium">{metric.label}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">{metric.value}</span>
                          <span className={`text-xs ${
                            metric.trend === 'up' ? 'text-green-600' :
                            metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {viewMode === 'corruption' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-lg shadow border p-6"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-red-500" />
                Detección de Anomalías y Corrupción
              </h3>

              {/* Red Flags Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Procesos Sin Competencia', count: filteredData.filter(c => c.vendor.includes('S.A.')).length, severity: 'high' },
                  { label: 'Sobrecostos Detectados', count: 2, severity: 'medium' },
                  { label: 'Pagos Fuera de Término', count: 1, severity: 'low' },
                  { label: 'Modificaciones Excesivas', count: 3, severity: 'medium' }
                ].map((flag, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    flag.severity === 'high' ? 'bg-red-50 border-red-500 dark:bg-red-900/20' :
                    flag.severity === 'medium' ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20' :
                    'bg-green-50 border-green-500 dark:bg-green-900/20'
                  }`}>
                    <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">{flag.count}</div>
                    <div className="text-sm text-gray-600 dark:text-dark-text-secondary">{flag.label}</div>
                  </div>
                ))}
              </div>

              {/* Anomaly Detection Chart */}
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4">Análisis de Series Temporales - Detección de Anomalías</h4>
                <div className="h-96">
                  <TimeSeriesAnomalyChart
                    chartType="line"
                    height={384}
                    years={[selectedYear]}
                  />
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h4 className="text-lg font-medium mb-4">Evaluación de Riesgos por Contrato</h4>
                <div className="space-y-3">
                  {contractsData.map(contract => {
                    const riskScore = (
                      (contract.executionRate < 75 ? 30 : 0) +
                      (contract.amount > 30000000 ? 25 : 0) +
                      (contract.vendor.includes('S.A.') ? 20 : 0) +
                      (contract.status === 'pending' ? 25 : 0)
                    );

                    return (
                      <div key={contract.id} className={`p-4 rounded-lg border ${
                        riskScore > 70 ? 'bg-red-50 border-red-200 dark:bg-red-900/20' :
                        riskScore > 40 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20' :
                        'bg-green-50 border-green-200 dark:bg-green-900/20'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-dark-text-primary">{contract.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                              {contract.vendor} • {formatCurrency(contract.amount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              riskScore > 70 ? 'text-red-600' :
                              riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {riskScore}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                              {riskScore > 70 ? 'Alto Riesgo' :
                               riskScore > 40 ? 'Riesgo Medio' : 'Bajo Riesgo'}
                            </div>
                          </div>
                        </div>

                        {riskScore > 40 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
                            <div className="flex flex-wrap gap-2">
                              {contract.executionRate < 75 && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  Baja Ejecución
                                </span>
                              )}
                              {contract.amount > 30000000 && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                  Alto Monto
                                </span>
                              )}
                              {contract.vendor.includes('S.A.') && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                  Proveedor Recurrente
                                </span>
                              )}
                              {contract.status === 'pending' && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Estado Pendiente
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-lg shadow border p-6"
            >
              <h3 className="text-xl font-semibold mb-6">Cronología de Contratos</h3>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-dark-border"></div>

                <div className="space-y-6">
                  {contractsData
                    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                    .map((contract) => (
                    <div key={contract.id} className="relative flex items-start">
                      <div className={`absolute left-2 w-4 h-4 rounded-full border-2 bg-white ${
                        contract.status === 'completed' ? 'border-green-500' :
                        contract.status === 'in-progress' ? 'border-yellow-500' :
                        'border-red-500'
                      }`}></div>

                      <div className="ml-10 flex-1">
                        <div className="bg-gray-50 dark:bg-dark-background rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">{contract.title}</h4>
                            <span className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                              {new Date(contract.startDate).toLocaleDateString('es-AR')}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-2">
                            <strong>Proveedor:</strong> {contract.vendor}
                          </p>

                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">
                              {formatCurrency(contract.amount)}
                            </span>

                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              contract.status === 'completed' ? 'bg-green-100 text-green-800' :
                              contract.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {contract.status === 'completed' ? 'Completado' :
                               contract.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {viewMode === 'analysis' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-lg shadow border p-6"
            >
              <h3 className="text-xl font-semibold mb-6">Análisis Avanzado</h3>

              {/* Advanced Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium mb-4">Análisis de Tendencias</h4>
                  <UnifiedChart
                    data={contractsData.map(contract => ({
                      name: contract.category,
                      value: contract.amount,
                      executed: contract.execution,
                      rate: contract.executionRate
                    }))}
                    type="line"
                    height={300}
                    title="Relación Monto vs Ejecución"
                  />
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-4">Distribución de Proveedores</h4>
                  <div className="space-y-3">
                    {Array.from(new Set(contractsData.map(c => c.vendor)))
                      .map(vendor => {
                        const vendorContracts = contractsData.filter(c => c.vendor === vendor);
                        const totalAmount = vendorContracts.reduce((sum, c) => sum + c.amount, 0);
                        return { vendor, count: vendorContracts.length, amount: totalAmount };
                      })
                      .sort((a, b) => b.amount - a.amount)
                      .map((vendor) => (
                        <div key={vendor.vendor} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-background rounded-lg">
                          <div>
                            <div className="font-medium">{vendor.vendor}</div>
                            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                              {vendor.count} contrato{vendor.count !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(vendor.amount)}</div>
                            <div className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                              {((vendor.amount / contractsData.reduce((sum, c) => sum + c.amount, 0)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {viewMode === 'sources' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-lg shadow border p-6"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Database className="w-6 h-6 mr-2" />
                Fuentes de Datos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Contratos CSV',
                    description: 'Datos estructurados de contratos y licitaciones',
                    status: 'active',
                    lastUpdate: new Date().toISOString().split('T')[0],
                    recordCount: currentContracts?.length || contractsData.length
                  },
                  {
                    name: 'Contrataciones Abiertas',
                    description: 'API Nacional de Contrataciones del Gobierno de Argentina',
                    status: externalData.contrataciones ? 'active' : 'error',
                    lastUpdate: new Date().toISOString().split('T')[0],
                    recordCount: externalData.contrataciones?.data?.length || 0,
                    external: true
                  },
                  {
                    name: 'Portal Carmen de Areco',
                    description: 'Portal oficial municipal de transparencia',
                    status: externalData.carmenOfficial ? 'active' : 'error',
                    lastUpdate: new Date().toISOString().split('T')[0],
                    recordCount: externalData.carmenOfficial?.contracts?.length || 0,
                    external: true
                  },
                  {
                    name: 'Documentos PDF',
                    description: 'Pliegos y documentos de licitaciones',
                    status: 'active',
                    lastUpdate: '2024-01-12',
                    recordCount: 299
                  },
                  {
                    name: 'Boletín Oficial Provincial',
                    description: 'Publicaciones oficiales de contrataciones',
                    status: 'pending',
                    lastUpdate: '2024-01-13',
                    recordCount: 0
                  },
                  {
                    name: 'Sistema RAFAM',
                    description: 'Registro de proveedores y adjudicaciones',
                    status: 'pending',
                    lastUpdate: '2024-01-08',
                    recordCount: 0
                  }
                ].map((source, index) => (
                  <div key={index} className="border border-gray-200 dark:border-dark-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">{source.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        source.status === 'active' ? 'bg-green-100 text-green-800' :
                        source.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        source.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {source.status === 'active' ? 'Activo' :
                         source.status === 'processing' ? 'Procesando' :
                         source.status === 'pending' ? 'Pendiente' : 'Error'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-3">
                      {source.description}
                    </p>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-dark-text-tertiary">
                        {source.recordCount} registros
                      </span>
                      <span className="text-gray-500 dark:text-dark-text-tertiary">
                        {new Date(source.lastUpdate).toLocaleDateString('es-AR')}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
                      <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Ver detalles →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Integration Status */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Estado de Integración</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Sistema configurado para integración multi-fuente con normalización automática de datos.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    CSV Processing
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    JSON Parsing
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    PDF Extraction
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 text-blue-500 mr-1" />
                    Real-time Monitoring
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default ContractsAndTendersPage;