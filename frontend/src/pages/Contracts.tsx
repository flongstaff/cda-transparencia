import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Search,
  Eye,
  FileText,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  DollarSign,
  Users,
  BarChart3,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useCompleteFinalData } from '../hooks/useCompleteFinalData';
import ContractAnalysisChart from '../components/charts/ContractAnalysisChart';
import ValidatedChart from '../components/charts/ValidatedChart';
import PageYearSelector from '../components/selectors/PageYearSelector';
import { formatCurrencyARS } from '../utils/formatters';

interface Contract {
  id: string;
  year: number;
  title: string;
  description: string;
  budget: number;
  awarded_to: string;
  award_date: string;
  execution_status: 'completed' | 'in_progress' | 'delayed';
  delay_analysis?: string;
  status: 'active' | 'awarded' | 'closed' | 'bidding';
  type: 'public_works' | 'services' | 'supplies' | 'consulting';
  category: string;
  url?: string;
  filename?: string;
}

const Contracts: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'contracts' | 'performance'>('overview');
  const [sortBy, setSortBy] = useState('budget');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 🚀 Use real Carmen de Areco data
  const {
    completeData,
    currentYearData,
    loading,
    error,
    availableYears: allAvailableYears
  } = useCompleteFinalData(selectedYear);

  // Process contract data from the comprehensive data service
  const contractsData: Contract[] = useMemo(() => {
    const contracts: Contract[] = [];

    if (currentYearData && currentYearData.contracts) {
      // Process contracts from current year data
      const yearContracts = currentYearData.contracts;

      // Handle different possible data structures
      if (Array.isArray(yearContracts)) {
        yearContracts.forEach((contract: any, index) => {
          contracts.push({
            id: contract.id || `contract-${index}`,
            year: selectedYear,
            title: contract.title || contract.description || `Contrato ${index + 1}`,
            description: contract.description || `Contrato de ${selectedYear}`,
            budget: contract.amount || contract.budget || 0,
            awarded_to: contract.contractor || contract.awarded_to || 'Información en archivo',
            award_date: contract.date || contract.award_date || new Date(selectedYear, 0, 1).toISOString(),
            execution_status: getExecutionStatus(contract),
            delay_analysis: contract.delay_analysis,
            status: getContractStatus(contract),
            type: getContractTypeFromCategory(contract.category || contract.type),
            category: contract.category || 'Contrataciones',
            url: contract.url,
            filename: contract.filename
          });
        });
      } else if (yearContracts.documents && Array.isArray(yearContracts.documents)) {
        // Handle documents array structure
        yearContracts.documents.forEach((doc: any, index) => {
          contracts.push({
            id: doc.id || `contract-doc-${index}`,
            year: selectedYear,
            title: doc.title || doc.filename || `Contrato ${index + 1}`,
            description: doc.description || `Documento de contratación ${selectedYear}`,
            budget: doc.amount || doc.budget || 0,
            awarded_to: doc.contractor || 'Detalle en documento',
            award_date: doc.date || doc.award_date || new Date(selectedYear, 0, 1).toISOString(),
            execution_status: getExecutionStatus(doc),
            delay_analysis: doc.delay_analysis,
            status: getContractStatus(doc),
            type: getContractTypeFromCategory(doc.category),
            category: doc.category || 'Contrataciones',
            url: doc.url,
            filename: doc.filename
          });
        });
      }
    }

    // Process all documents for contract-related content
    if (currentYearData?.documents) {
      currentYearData.documents
        .filter(doc => 
          doc.category?.toLowerCase().includes('contrat') ||
          doc.category?.toLowerCase().includes('licitaci') ||
          doc.title?.toLowerCase().includes('contrat') ||
          doc.filename?.toLowerCase().includes('contrat') ||
          doc.category?.toLowerCase().includes('compra') ||
          doc.category?.toLowerCase().includes('adjudicaci')
        )
        .forEach((doc, index) => {
          contracts.push({
            id: doc.id || `doc-contract-${index}`,
            year: doc.year || selectedYear,
            title: doc.title || doc.filename || `Contrato ${index + 1}`,
            description: `Documento contractual - ${doc.category || 'Contrataciones'}`,
            budget: doc.metadata?.amount || doc.budget || 0,
            awarded_to: doc.metadata?.contractor || doc.contractor || 'Ver documento para detalles',
            award_date: doc.processing_date || doc.date || new Date(selectedYear, 0, 1).toISOString(),
            execution_status: getExecutionStatus(doc),
            delay_analysis: doc.metadata?.delay_analysis,
            status: getContractStatus(doc),
            type: getContractTypeFromCategory(doc.category),
            category: doc.category || 'Contrataciones',
            url: doc.url,
            filename: doc.filename
          });
        });
    }

    return contracts.slice(0, 25); // Limit to reasonable number
  }, [currentYearData, selectedYear]);

  const getContractTypeFromCategory = (category?: string): 'public_works' | 'services' | 'supplies' | 'consulting' => {
    if (!category) return 'services';

    const cat = category.toLowerCase();
    if (cat.includes('obra') || cat.includes('construcción') || cat.includes('infraestructura')) return 'public_works';
    if (cat.includes('consultor') || cat.includes('asesor') || cat.includes('técnico')) return 'consulting';
    if (cat.includes('suministro') || cat.includes('equipamiento') || cat.includes('material')) return 'supplies';
    return 'services';
  };

  const getExecutionStatus = (tender: any): 'completed' | 'in_progress' | 'delayed' => {
    if (tender.status === 'completed' || tender.execution_status === 'completed') return 'completed';
    if (tender.status === 'delayed' || tender.execution_status === 'delayed') return 'delayed';
    return 'in_progress';
  };

  const getContractStatus = (tender: any): 'active' | 'awarded' | 'closed' | 'bidding' => {
    if (tender.status === 'closed' || tender.status === 'completed') return 'closed';
    if (tender.status === 'awarded' || tender.winner || tender.awarded_to) return 'awarded';
    if (tender.status === 'bidding' || tender.status === 'open') return 'bidding';
    return 'active';
  };

  const getContractTypeName = (type: 'public_works' | 'services' | 'supplies' | 'consulting'): string => {
    switch (type) {
      case 'public_works': return 'Obras Públicas';
      case 'services': return 'Servicios';
      case 'supplies': return 'Suministros';
      case 'consulting': return 'Consultoría';
      default: return 'Otros';
    }
  };

  const getExecutionStatusName = (status: 'completed' | 'in_progress' | 'delayed'): string => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      case 'delayed': return 'Demorado';
      default: return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'awarded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'bidding':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getExecutionColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delayed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public_works':
        return '#3B82F6';
      case 'services':
        return '#10B981';
      case 'supplies':
        return '#F59E0B';
      case 'consulting':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    let filtered = contractsData;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(contract => contract.status === filterStatus);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.awarded_to.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'budget':
          return b.budget - a.budget;
        case 'date':
          return new Date(b.award_date).getTime() - new Date(a.award_date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [contractsData, filterStatus, searchTerm, sortBy]);

  // Calculate statistics
  const totalContracts = contractsData.length;
  const totalBudget = contractsData.reduce((sum, contract) => sum + contract.budget, 0);
  const activeContracts = contractsData.filter(c => c.status === 'active').length;
  const completedContracts = contractsData.filter(c => c.execution_status === 'completed').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando contratos y licitaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar los datos</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building className="w-8 h-8 text-blue-600 mr-3" />
              Contratos y Licitaciones
            </h1>
            <p className="text-gray-600 mt-2">
              Gestión transparente de contrataciones públicas del municipio
            </p>
          </div>

          <div className="flex items-center gap-4">
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              availableYears={allAvailableYears}
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Datos verificados
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Resumen', icon: BarChart3 },
              { id: 'analytics', name: 'Análisis', icon: TrendingUp },
              { id: 'contracts', name: 'Contratos', icon: FileText },
              { id: 'performance', name: 'Rendimiento', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Contratos</p>
                      <p className="text-3xl font-bold">{totalContracts}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Presupuesto Total</p>
                      <p className="text-3xl font-bold">{formatCurrencyARS(totalBudget)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Contratos Activos</p>
                      <p className="text-3xl font-bold">{activeContracts}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Completados</p>
                      <p className="text-3xl font-bold">{completedContracts}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ValidatedChart
                  data={[
                    { name: 'Obras Públicas', value: contractsData.filter(c => c.type === 'public_works').length },
                    { name: 'Servicios', value: contractsData.filter(c => c.type === 'services').length },
                    { name: 'Suministros', value: contractsData.filter(c => c.type === 'supplies').length },
                    { name: 'Consultoría', value: contractsData.filter(c => c.type === 'consulting').length }
                  ]}
                  title="Distribución por Tipo de Contrato"
                  chartType="pie"
                  dataKey="value"
                  nameKey="name"
                  sources={['Datos estructurados', 'Análisis documental']}
                />

                <ValidatedChart
                  data={[
                    { name: 'Activos', value: contractsData.filter(c => c.status === 'active').length },
                    { name: 'Adjudicados', value: contractsData.filter(c => c.status === 'awarded').length },
                    { name: 'Cerrados', value: contractsData.filter(c => c.status === 'closed').length },
                    { name: 'Licitación', value: contractsData.filter(c => c.status === 'bidding').length }
                  ]}
                  title="Estado de Contratos"
                  chartType="bar"
                  dataKey="value"
                  nameKey="name"
                  sources={['Datos estructurados', 'Análisis documental']}
                />
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-6">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar contratos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="awarded">Adjudicados</option>
                  <option value="closed">Cerrados</option>
                  <option value="bidding">En licitación</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="budget">Ordenar por presupuesto</option>
                  <option value="date">Ordenar por fecha</option>
                  <option value="title">Ordenar por título</option>
                </select>
              </div>

              {/* Contracts Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contrato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Adjudicado a
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Presupuesto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ejecución
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {contract.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {contract.category} • {formatDate(contract.award_date)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{contract.awarded_to}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {contract.budget > 0 ? formatCurrencyARS(contract.budget) : 'No especificado'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                              {contract.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getExecutionColor(contract.execution_status)}`}>
                              {getExecutionStatusName(contract.execution_status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedContract(contract)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {contract.url && (
                                <a
                                  href={contract.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-900"
                                  title="Descargar documento"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredContracts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron contratos</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterStatus !== 'all'
                      ? 'Intente ajustar los filtros de búsqueda'
                      : 'No hay contratos disponibles para el año seleccionado'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ContractAnalysisChart
                  contracts={contractsData}
                  year={selectedYear}
                />

                {/* Additional analytics can be added here */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis Avanzado</h3>
                  <p className="text-gray-600">
                    Funcionalidades de análisis adicionales en desarrollo
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis de Rendimiento</h3>
                <p className="text-gray-600">
                  Métricas de rendimiento y cumplimiento de contratos en desarrollo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalles del Contrato
                </h3>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedContract.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedContract.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adjudicado a</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedContract.awarded_to}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Presupuesto</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedContract.budget > 0 ? formatCurrencyARS(selectedContract.budget) : 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Adjudicación</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedContract.award_date)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="mt-1 text-sm text-gray-900">{getContractTypeName(selectedContract.type)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedContract.status)}`}>
                      {selectedContract.status}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getExecutionColor(selectedContract.execution_status)}`}>
                      {getExecutionStatusName(selectedContract.execution_status)}
                    </span>
                  </div>
                </div>

                {selectedContract.delay_analysis && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Análisis de Demoras</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedContract.delay_analysis}</p>
                  </div>
                )}

                {selectedContract.url && (
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={selectedContract.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Ver Documento
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;