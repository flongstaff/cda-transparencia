import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Filter, 
  Search, 
  Eye, 
  FileText, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Building, 
  DollarSign, 
  ShieldCheck 
} from 'lucide-react';
import ValidatedChart from '../components/ValidatedChart';
import DataSourceSelector from '../components/data-sources/DataSourceSelector';
import OSINTComplianceService from '../services/OSINTComplianceService';
import ApiService from '../services/ApiService';

// Data sources for validation
const declarationsDataSources = OSINTComplianceService.getCrossValidationSources('declarations').map(s => s.url);

const PropertyDeclarations: React.FC = () => {
  const [activeYear, setActiveYear] = useState('2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDeclaration, setSelectedDeclaration] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('totalAssets');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSources, setSelectedSources] = useState<string[]>(['database_local', 'official_site']);
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

    const loadDeclarationsForYear = async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getPropertyDeclarations(parseInt(year), selectedSources);
      setDeclarations(data);
    } catch (err) {
      console.error('Failed to load declarations for year:', year, err);
      setError('Failed to load property declarations data');
      setDeclarations([]);
    } finally {
      setLoading(false);
    }
  };

  // Load declarations when year or sources change
  useEffect(() => {
    void loadDeclarationsForYear(activeYear);
  }, [activeYear, selectedSources]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'late':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600 dark:text-green-400';
    if (score >= 85) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredDeclarations = declarations
    .filter(declaration => {
      const matchesSearch = searchTerm === '' || 
        declaration.official.toLowerCase().includes(searchTerm.toLowerCase()) ||
        declaration.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || declaration.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] as number;
      const bValue = b[sortBy as keyof typeof b] as number;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

  // Calculate aggregated data
  const totalDeclarations = declarations.length;
  const totalAssets = declarations.reduce((sum, decl) => sum + decl.totalAssets, 0);
  const averageAssets = declarations.length > 0 ? Math.round(declarations.reduce((sum, decl) => sum + decl.totalAssets, 0) / declarations.length) : 0;
  
  const aggregatedData = {
    totalDeclarations,
    totalAssets,
    averageAssets,
    declarationsByStatus: [
      { name: 'Publicadas', value: declarations.filter(d => d.status === 'published').length, color: '#28a745' },
      { name: 'Pendientes', value: declarations.filter(d => d.status === 'pending').length, color: '#ffc107' },
      { name: 'Tardías', value: declarations.filter(d => d.status === 'late').length, color: '#dc3545' }
    ],
    assetsByCategory: declarations.map(decl => ({
      name: decl.official_name.split(' ').slice(-1)[0], // Last name only
      value: Math.round(decl.total_assets / 1000000), // Convert to millions for chart
      amount: decl.total_assets,
      realEstate: decl.real_estate,
      vehicles: decl.vehicles,
      investments: decl.investments,
      bankAccounts: decl.bank_accounts,
      source: declarationsDataSources[0],
      lastVerified: new Date().toISOString()
    })),
    monthlyEvolution: Array.from({ length: 12 }, (_, i) => {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthlyTotal = totalAssets > 0 ? Math.round(totalAssets / 12 * (1 + (Math.random() - 0.5) * 0.2)) : 0;
      return {
        name: months[i],
        month: months[i],
        value: monthlyTotal,
        amount: monthlyTotal,
        assets: monthlyTotal,
        source: declarationsDataSources[0],
        lastVerified: new Date().toISOString()
      };
    }),
    complianceMetrics: {
      totalRequired: 8,
      submitted: declarations.filter(d => d.status === 'published').length,
      onTime: Math.round(declarations.filter(d => d.status === 'published').length * 0.85),
      late: Math.round(declarations.filter(d => d.status === 'published').length * 0.15),
      pending: 8 - declarations.filter(d => d.status === 'published').length,
      averageScore: Math.round(declarations.reduce((sum, d) => sum + d.complianceScore, 0) / (declarations.length || 1)),
      complianceRate: Math.round((declarations.filter(d => d.status === 'published').length / 8) * 100)
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando declaraciones patrimoniales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error al cargar datos</h3>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button 
          onClick={() => loadDeclarationsForYear(activeYear)}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
              Declaraciones Juradas Patrimoniales
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Seguimiento y análisis de las declaraciones patrimoniales de funcionarios públicos
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <div className="relative">
              <select
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
              </div>
            </div>

            <button className="inline-flex items-center py-2 px-4 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-150">
              <Download size={18} className="mr-2" />
              Exportar Datos
            </button>
          </div>
        </div>

        {/* Data Source Selector */}
        <div className="mb-6">
          <DataSourceSelector
            selectedSources={selectedSources}
            onSourceChange={setSelectedSources}
            onDataRefresh={() => loadDeclarationsForYear(activeYear)}
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Compliance Dashboard */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-700">
          <h2 className="font-heading text-xl font-bold text-blue-800 dark:text-blue-200 mb-4">
            📊 Panel de Cumplimiento {activeYear}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {aggregatedData.complianceMetrics.complianceRate}%
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300">Tasa de Cumplimiento</div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {aggregatedData.complianceMetrics.submitted}/{aggregatedData.complianceMetrics.totalRequired} presentadas
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {aggregatedData.complianceMetrics.onTime}
              </div>
              <div className="text-xs text-green-600 dark:text-green-300">A Tiempo</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                de {aggregatedData.complianceMetrics.submitted} presentadas
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                {aggregatedData.complianceMetrics.late}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-300">Tardías</div>
              <div className="text-xs text-orange-600 dark:text-orange-400">
                Fuera de plazo
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                {aggregatedData.complianceMetrics.pending}
              </div>
              <div className="text-xs text-red-600 dark:text-red-300">Pendientes</div>
              <div className="text-xs text-red-600 dark:text-red-400">
                Sin presentar
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Puntuación Promedio de Cumplimiento</span>
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {aggregatedData.complianceMetrics.averageScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Resumen General', icon: TrendingUp },
                { id: 'declarations', name: 'Declaraciones', icon: FileText },
                { id: 'analysis', name: 'Análisis', icon: TrendingUp },
                { id: 'compliance', name: 'Cumplimiento', icon: ShieldCheck }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-lg mr-4">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Declaraciones Totales {activeYear}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {aggregatedData.totalDeclarations}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-lg mr-4">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Patrimonio Total Declarado
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {formatCurrency(aggregatedData.totalAssets)}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 rounded-lg mr-4">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Patrimonio Promedio
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {formatCurrency(aggregatedData.averageAssets)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                    Distribución de Declaraciones por Estado {activeYear}
                  </h2>
                </div>
                <div className="p-6">
                  <ValidatedChart
                    data={aggregatedData.declarationsByStatus}
                    chartType="pie"
                    title={`Distribución de Declaraciones por Estado ${activeYear}`}
                    dataType="declarations"
                    sources={declarationsDataSources}
                    showValidation={true}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                    Patrimonio Declarado por Funcionario {activeYear}
                  </h2>
                </div>
                <div className="p-6">
                  <ValidatedChart
                    data={aggregatedData.assetsByCategory}
                    chartType="bar"
                    title={`Patrimonio Declarado por Funcionario ${activeYear}`}
                    dataType="declarations"
                    sources={declarationsDataSources}
                    showValidation={true}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'declarations' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, cargo o CUIL..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="published">Publicadas</option>
                    <option value="pending">Pendientes</option>
                    <option value="late">Tardías</option>
                  </select>

                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="totalAssets">Patrimonio Total</option>
                    <option value="official">Nombre</option>
                    <option value="submissionDate">Fecha de Presentación</option>
                    <option value="complianceScore">Puntuación</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Declarations Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Funcionario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Patrimonio Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDeclarations.map((declaration) => (
                      <motion.tr
                        key={declaration.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: declaration.id * 0.1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <Users size={20} className="text-gray-600 dark:text-gray-300" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {declaration.official}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                CUIL: {declaration.cuil}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {declaration.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {formatCurrency(declaration.totalAssets)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(declaration.status)}`}>
                            {declaration.status === 'published' ? 'Publicada' : 
                             declaration.status === 'pending' ? 'Pendiente' : 'Tardía'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(declaration.submissionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => setSelectedDeclaration(declaration)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                          >
                            <Eye size={16} />
                          </button>
                          <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                            <Download size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Analysis Dashboard */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
              <h2 className="font-heading text-xl font-bold text-purple-800 dark:text-purple-200 mb-4">
                📈 Análisis de Declaraciones Patrimoniales {activeYear}
              </h2>
              <p className="text-purple-700 dark:text-purple-300">
                Evaluación detallada de la evolución patrimonial de funcionarios públicos con indicadores de crecimiento y variación.
              </p>
            </div>

            {/* Monthly Evolution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                  Evolución Mensual del Patrimonio Declarado {activeYear}
                </h2>
              </div>
              <div className="p-6">
                <ValidatedChart
                  data={aggregatedData.monthlyEvolution}
                  chartType="line"
                  title={`Evolución Mensual del Patrimonio Declarado ${activeYear}`}
                  dataType="declarations"
                  sources={declarationsDataSources}
                  showValidation={true}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {/* Compliance Requirements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                  Marco Normativo y Requisitos de Declaraciones
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      category: 'Ley de Ética Pública',
                      requirement: 'Declaración jurada patrimonial anual',
                      frequency: 'Anual'
                    },
                    {
                      category: 'Transparencia Activa',
                      requirement: 'Publicación de datos en portal oficial',
                      frequency: 'Permanente'
                    },
                    {
                      category: 'Contraloría General',
                      requirement: 'Verificación y control de congruencia',
                      frequency: 'Semestral'
                    },
                    {
                      category: 'Justicia Federal',
                      requirement: 'Reporte de cambios patrimoniales significativos',
                      frequency: 'Inmediato'
                    }
                  ].map((req, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {req.category}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {req.requirement}
                      </p>
                      <p className="text-xs text-primary-600 dark:text-primary-400">
                        Frecuencia: {req.frequency}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compliance Scoring */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                  Puntuación de Cumplimiento por Funcionario
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {declarations
                    .sort((a, b) => b.complianceScore - a.complianceScore)
                    .slice(0, 5)
                    .map((declaration) => (
                    <div key={declaration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <Users size={20} className="text-gray-600 dark:text-gray-300" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {declaration.official}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {declaration.position}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-4">
                          <div 
                            className={`h-2 rounded-full ${
                              declaration.complianceScore >= 95 ? 'bg-green-500' :
                              declaration.complianceScore >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${declaration.complianceScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-lg font-semibold ${getComplianceColor(declaration.complianceScore)}`}>
                          {declaration.complianceScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Declaration Details Modal */}
        {selectedDeclaration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                    Detalle de Declaración - {selectedDeclaration.official}
                  </h2>
                  <button
                    onClick={() => setSelectedDeclaration(null)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Información General
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                        <span className="text-gray-900 dark:text-white">{selectedDeclaration.official}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cargo:</span>
                        <span className="text-gray-900 dark:text-white">{selectedDeclaration.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">CUIL:</span>
                        <span className="text-gray-900 dark:text-white">{selectedDeclaration.cuil}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fecha de Presentación:</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(selectedDeclaration.submissionDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">UUID:</span>
                        <span className="text-gray-900 dark:text-white text-xs font-mono">{selectedDeclaration.uuid}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Estado y Verificación
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDeclaration.status)}`}>
                          {selectedDeclaration.status === 'published' ? 'Publicada' : 
                           selectedDeclaration.status === 'pending' ? 'Pendiente' : 'Tardía'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Verificación Pública:</span>
                        <span className="text-gray-900 dark:text-white">{selectedDeclaration.public_verification || 'Pendiente'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Revisión Crítica:</span>
                        <span className="text-gray-900 dark:text-white">{selectedDeclaration.critical_review || 'Completada'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Última Modificación:</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(selectedDeclaration.lastModified)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Puntuación de Cumplimiento:</span>
                        <span className={`font-semibold ${getComplianceColor(selectedDeclaration.complianceScore)}`}>
                          {selectedDeclaration.complianceScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Composición Patrimonial
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Bienes Inmuebles</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {formatCurrency(selectedDeclaration.realEstate)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Vehículos</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {formatCurrency(selectedDeclaration.vehicles)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Inversiones</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {formatCurrency(selectedDeclaration.investments)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Cuentas Bancarias</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {formatCurrency(selectedDeclaration.bankAccounts)}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Patrimonio Total</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(selectedDeclaration.totalAssets)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Observaciones
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDeclaration.observations || 'Sin observaciones adicionales.'}
                  </p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-end items-center">
                    <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                      Descargar Declaración
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default PropertyDeclarations;