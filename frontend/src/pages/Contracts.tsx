import React, { useState, useEffect } from 'react';
import { Download, Search, Eye, FileText, TrendingUp, Calendar, AlertTriangle, CheckCircle, Clock, Building, DollarSign, ShieldCheck, Users, BarChart3 } from 'lucide-react';
import PageYearSelector from '../components/PageYearSelector';
import { robustDataService } from '../services/RobustDataService';

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
}

const Contracts: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('budget');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [contractsData, setContractsData] = useState<Contract[]>([]);

  const availableYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

  const loadContractsData = async (year: number) => {
    try {
      // Import API service dynamically to avoid circular dependencies
      const { default: ApiService } = await import('../services/ApiService');
      const contracts = await ApiService.getPublicTenders(year);
      
      // Transform API data to match our interface
      const transformedContracts: Contract[] = contracts.map((tender: any, index: number) => ({
        id: tender.id || `contract-${year}-${index}`,
        year: year,
        title: tender.title || tender.description || 'Sin título',
        description: tender.description || 'Sin descripción disponible',
        budget: tender.amount || tender.budget || 0,
        awarded_to: tender.awarded_to || tender.winner || 'No adjudicado',
        award_date: tender.award_date || tender.date || new Date().toISOString(),
        execution_status: getExecutionStatus(tender),
        delay_analysis: tender.delay_analysis || undefined,
        status: getContractStatus(tender),
        type: getContractType(tender),
        category: tender.category || 'General'
      }));
      
      setContractsData(transformedContracts);
    } catch (error) {
      console.error('Error loading contracts data:', error);
      // Fallback to comprehensive data service
      try {
        const { default: ComprehensiveDataService } = await import('../services/ComprehensiveDataService');
        const comprehensiveService = new ComprehensiveDataService();
        const data = await comprehensiveService.getAllSourcesData();
        
        const contractsFromService = data.contracts || data.tenders || [];
        const transformedContracts: Contract[] = contractsFromService
          .filter((item: any) => item.year === year || new Date(item.date).getFullYear() === year)
          .map((item: any, index: number) => ({
            id: item.id || `fallback-${year}-${index}`,
            year: year,
            title: item.title || item.description || 'Contrato sin título',
            description: item.description || 'Sin descripción',
            budget: item.amount || item.value || 0,
            awarded_to: item.contractor || item.winner || 'Sin adjudicar',
            award_date: item.date || new Date().toISOString(),
            execution_status: 'in_progress' as const,
            status: 'active' as const,
            type: 'services' as const,
            category: item.category || 'General'
          }));
        
        setContractsData(transformedContracts);
      } catch (fallbackError) {
        console.error('Fallback data loading failed:', fallbackError);
        
        // Final fallback: Use RobustDataService
        try {
          const municipalData = await robustDataService.getMunicipalData(year);
          const robustContracts: Contract[] = municipalData.contracts.items.map((item, index) => ({
            id: `robust-${year}-${index}`,
            year: year,
            title: item.title,
            description: `Contrato para ${item.title}`,
            budget: item.amount,
            awarded_to: item.contractor,
            award_date: new Date().toISOString(),
            execution_status: item.status === 'Activo' ? 'in_progress' : 
                            item.status === 'Completado' ? 'completed' : 'delayed',
            status: item.status === 'Activo' ? 'active' : 
                   item.status === 'Completado' ? 'closed' : 'bidding',
            type: item.category === 'Obras Públicas' ? 'public_works' : 
                 item.category === 'Servicios' ? 'services' : 'supplies',
            category: item.category
          }));
          setContractsData(robustContracts);
        } catch (robustError) {
          console.error('Error with robust data service:', robustError);
          setContractsData([]);
        }
      }
    }
  };

  const getExecutionStatus = (tender: any): 'completed' | 'in_progress' | 'delayed' => {
    if (tender.status === 'completed' || tender.execution_status === 'completed') return 'completed';
    if (tender.status === 'delayed' || tender.execution_status === 'delayed') return 'delayed';
    return 'in_progress';
  };

  const getContractStatus = (tender: any): 'active' | 'awarded' | 'closed' | 'bidding' => {
    if (tender.status === 'closed' || tender.status === 'completed') return 'closed';
    if (tender.status === 'awarded' || tender.winner) return 'awarded';
    if (tender.status === 'bidding' || tender.status === 'open') return 'bidding';
    return 'active';
  };

  const getContractType = (tender: any): 'public_works' | 'services' | 'supplies' | 'consulting' => {
    const category = (tender.category || tender.type || '').toLowerCase();
    if (category.includes('obra') || category.includes('construc')) return 'public_works';
    if (category.includes('consultor') || category.includes('asesor')) return 'consulting';
    if (category.includes('suminist') || category.includes('bien')) return 'supplies';
    return 'services';
  };

  const generateContractsDataFallback = (year: number): Contract[] => {
    const contractTypes = ['public_works', 'services', 'supplies', 'consulting'] as const;
    const contractors = [
      'Constructora Regional SRL',
      'Servicios Municipales SA',
      'Obras Carmen Ltda',
      'Infraestructura Buenos Aires',
      'Mantenimiento Urbano SA',
      'Técnica Municipal Ltda',
      'Desarrollo Urbano SA',
      'Ingeniería Civil SRL'
    ];

    const contracts: Contract[] = Array.from({ length: 15 }, (_, i) => {
      const contractType = contractTypes[i % contractTypes.length];
      const isDelayed = Math.random() > 0.85;
      const isCompleted = Math.random() > 0.4;
      
      return {
        id: `contract-${year}-${i}`,
        year: year,
        title: `${contractType === 'public_works' ? 'Obra Pública' : 
                 contractType === 'services' ? 'Servicio Municipal' : 
                 contractType === 'supplies' ? 'Suministro de Equipamiento' : 
                 'Consultoría Técnica'} ${year}-${String(i + 1).padStart(2, '0')}`,
        description: `${contractType === 'public_works' ? 'Proyecto de infraestructura municipal para mejoras en espacios públicos' : 
                      contractType === 'services' ? 'Prestación de servicios especializados para la administración municipal' : 
                      contractType === 'supplies' ? 'Provisión de equipamiento y materiales para operaciones municipales' : 
                      'Servicios de consultoría técnica especializada'} - Año ${year}`,
        budget: Math.floor(Math.random() * 8000000) + 500000,
        awarded_to: contractors[i % contractors.length],
        award_date: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        execution_status: isDelayed ? 'delayed' : (isCompleted ? 'completed' : 'in_progress'),
        delay_analysis: isDelayed ? 'Demora por condiciones climáticas adversas y ajustes en especificaciones técnicas requeridas' : undefined,
        status: Math.random() > 0.8 ? 'closed' : 'active',
        type: contractType,
        category: contractType === 'public_works' ? 'Obras Públicas' : 
                  contractType === 'services' ? 'Servicios' : 
                  contractType === 'supplies' ? 'Suministros' : 'Consultoría'
      };
    });

    return contracts;
  };

  useEffect(() => {
    loadContractsData(selectedYear);
  }, [selectedYear]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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

  const filteredContracts = contractsData
    .filter(contract => {
      const matchesSearch = searchTerm === '' || 
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.awarded_to.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'budget') {
        return b.budget - a.budget;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'award_date') {
        return new Date(b.award_date).getTime() - new Date(a.award_date).getTime();
      }
      return 0;
    });

  const aggregatedData = {
    totalContracts: contractsData.length,
    totalAmount: contractsData.reduce((sum, contract) => sum + contract.budget, 0),
    averageAmount: contractsData.length > 0 ? contractsData.reduce((sum, contract) => sum + contract.budget, 0) / contractsData.length : 0,
    contractsByType: Array.from(
      contractsData.reduce((acc, contract) => {
        const type = contract.type;
        const typeName = type === 'public_works' ? 'Obras Públicas' : 
                        type === 'services' ? 'Servicios' : 
                        type === 'supplies' ? 'Suministros' : 'Consultoría';
        if (!acc.has(type)) {
          acc.set(type, { 
            name: typeName, 
            value: 0, 
            amount: 0, 
            color: getTypeColor(type) 
          });
        }
        const item = acc.get(type)!;
        item.value += 1;
        item.amount += contract.budget;
        return acc;
      }, new Map<string, { name: string; value: number; amount: number; color: string }>())
    ).map(([, value]) => value),
    executionStats: {
      totalContracts: contractsData.length,
      completed: contractsData.filter(c => c.execution_status === 'completed').length,
      inProgress: contractsData.filter(c => c.execution_status === 'in_progress').length,
      delayed: contractsData.filter(c => c.execution_status === 'delayed').length,
      averageCompletion: contractsData.length > 0 ? Math.round((contractsData.filter(c => c.execution_status === 'completed').length / contractsData.length) * 100) : 0
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Contratos y Licitaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Seguimiento y análisis de contratos y licitaciones municipales
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <PageYearSelector 
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            availableYears={availableYears}
            label="Año"
          />

          <button className="inline-flex items-center py-2 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-150">
            <Download size={18} className="mr-2" />
            Exportar Datos
          </button>
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-700">
        <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
          📊 Panel de Contrataciones {selectedYear}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {aggregatedData.totalContracts}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-300">Total de Contratos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(aggregatedData.totalAmount)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-300">Monto Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
              {formatCurrency(aggregatedData.averageAmount)}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-300">Monto Promedio</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {aggregatedData.executionStats.averageCompletion}%
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-300">Tasa de Finalización</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Resumen', icon: TrendingUp },
              { id: 'contracts', name: 'Contratos', icon: FileText },
              { id: 'analysis', name: 'Análisis', icon: BarChart3 },
              { id: 'compliance', name: 'Cumplimiento', icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200`}
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
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-lg mr-4">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Contratos Activos
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {aggregatedData.totalContracts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-lg mr-4">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Monto Total Contratado
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(aggregatedData.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 rounded-lg mr-4">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tasa de Finalización
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {aggregatedData.executionStats.averageCompletion}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Types Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Distribución por Tipo de Contrato
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {aggregatedData.contractsByType.map((type, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: type.color }}>
                    {type.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{type.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">{formatCurrency(type.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contracts' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por título, contratista o descripción..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
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
                  <option value="active">Activos</option>
                  <option value="awarded">Adjudicados</option>
                  <option value="closed">Finalizados</option>
                  <option value="bidding">En licitación</option>
                </select>

                <select
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="budget">Monto</option>
                  <option value="title">Título</option>
                  <option value="award_date">Fecha de Adjudicación</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contrato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Adjudicado a
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ejecución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <Building size={20} className="text-gray-600 dark:text-gray-300" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {contract.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {contract.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {formatCurrency(contract.budget)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {contract.awarded_to}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                          {contract.status === 'active' ? 'Activo' : 
                           contract.status === 'awarded' ? 'Adjudicado' : 
                           contract.status === 'closed' ? 'Finalizado' : 'Licitando'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getExecutionColor(contract.execution_status)}`}>
                          {contract.execution_status === 'completed' ? 'Finalizado' : 
                           contract.execution_status === 'in_progress' ? 'En Progreso' : 'Demorado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => setSelectedContract(contract)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Execution Status Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Finalizados
                </h3>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {aggregatedData.executionStats.completed}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {((aggregatedData.executionStats.completed / aggregatedData.totalContracts) * 100).toFixed(1)}% del total
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  En Progreso
                </h3>
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {aggregatedData.executionStats.inProgress}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {((aggregatedData.executionStats.inProgress / aggregatedData.totalContracts) * 100).toFixed(1)}% del total
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Con Demoras
                </h3>
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {aggregatedData.executionStats.delayed}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {((aggregatedData.executionStats.delayed / aggregatedData.totalContracts) * 100).toFixed(1)}% del total
              </p>
            </div>
          </div>

          {/* Delay Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Análisis de Demoras en Contrataciones
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {contractsData.filter(c => c.delay_analysis).slice(0, 5).map((contract) => (
                  <div key={contract.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">
                          {contract.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {contract.delay_analysis}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Demorado
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {/* Compliance Requirements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Marco Normativo y Requisitos de Contratación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  category: 'Ley de Contrataciones Públicas',
                  requirement: 'Procedimiento transparente y competitivo',
                  frequency: 'Obligatorio para todos los contratos'
                },
                {
                  category: 'Transparencia Activa',
                  requirement: 'Publicación de licitaciones y contratos',
                  frequency: 'Permanente'
                },
                {
                  category: 'Control Interno',
                  requirement: 'Verificación de cumplimiento contractual',
                  frequency: 'Semestral'
                },
                {
                  category: 'Rendición de Cuentas',
                  requirement: 'Informe trimestral de ejecución',
                  frequency: 'Trimestral'
                }
              ].map((req, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {req.category}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {req.requirement}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Frecuencia: {req.frequency}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Scoring */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Puntuación de Cumplimiento Contractual
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {contractsData.slice(0, 5).map((contract) => {
                  const complianceScore = contract.execution_status === 'completed' ? 95 : 
                                        contract.execution_status === 'in_progress' ? 85 : 
                                        contract.execution_status === 'delayed' ? 65 : 75;
                  
                  return (
                    <div key={contract.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <Building size={20} className="text-gray-600 dark:text-gray-300" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {contract.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {contract.awarded_to}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-4">
                          <div 
                            className={`h-2 rounded-full ${
                              complianceScore >= 90 ? 'bg-green-500' :
                              complianceScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${complianceScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-lg font-semibold ${
                          complianceScore >= 90 ? 'text-green-600 dark:text-green-400' :
                          complianceScore >= 75 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {complianceScore}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Details Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detalle del Contrato
                </h2>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedContract.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedContract.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                    <p className="font-mono text-gray-900 dark:text-white">{formatCurrency(selectedContract.budget)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Adjudicado a:</span>
                    <p className="text-gray-900 dark:text-white">{selectedContract.awarded_to}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedContract.award_date)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Categoría:</span>
                    <p className="text-gray-900 dark:text-white">{selectedContract.category}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Descargar Contrato
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;