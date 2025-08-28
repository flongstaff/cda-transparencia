import React, { useState, useEffect } from 'react';
import { Building, Clock, AlertTriangle, CheckCircle, DollarSign, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface InfrastructureProject {
  project_name: string;
  project_type: string;
  budgeted_amount: number;
  actual_spent: number;
  contractor: string;
  award_date: string;
  scheduled_completion: string;
  actual_completion: string;
  status: string;
  location: string;
  description: string;
}

interface ContractorAnalysis {
  contractor_name: string;
  total_projects: number;
  total_amount: number;
  completion_rate: number;
  delay_rate: number;
  first_project_date: string;
  last_project_date: string;
}

interface ProjectFlag {
  project_name: string;
  flag_type: string;
  description: string;
  severity: string;
  budgeted_amount: number;
}

interface InfrastructureData {
  projects: InfrastructureProject[];
  contractor_analysis: ContractorAnalysis[];
  flags: ProjectFlag[];
  summary: {
    total_projects: number;
    total_budget: number;
    delayed_projects: number;
    flagged_projects: number;
    completion_rate: number;
  };
  timestamp: string;
}

const InfrastructureTracker: React.FC = () => {
  const [infrastructureData, setInfrastructureData] = useState<InfrastructureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadInfrastructureData();
  }, []);

  const loadInfrastructureData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from your API
      // For now, we'll use mock data to demonstrate the UI
      const mockData: InfrastructureData = {
        timestamp: new Date().toISOString(),
        projects: [
          {
            project_name: "Pavimentación Avenida Principal",
            project_type: "Road Construction",
            budgeted_amount: 25000000,
            actual_spent: 25000000,
            contractor: "Constructora ABC S.A.",
            award_date: "2024-03-15",
            scheduled_completion: "2024-12-15",
            actual_completion: "",
            status: "In Progress",
            location: "Centro de la ciudad",
            description: "Pavimentación de 3 km de avenida principal"
          },
          {
            project_name: "Parque Municipal Nuevo",
            project_type: "Park Development",
            budgeted_amount: 18000000,
            actual_spent: 18000000,
            contractor: "Obras Verdes S.R.L.",
            award_date: "2023-11-20",
            scheduled_completion: "2024-08-30",
            actual_completion: "",
            status: "Delayed",
            location: "Barrio Norte",
            description: "Desarrollo de parque con canchas y áreas verdes"
          },
          {
            project_name: "Reparación Red Cloacal Sector Sur",
            project_type: "Infrastructure Repair",
            budgeted_amount: 32000000,
            actual_spent: 28000000,
            contractor: "Sistemas Hidráulicos S.A.",
            award_date: "2024-01-10",
            scheduled_completion: "2024-10-10",
            actual_completion: "",
            status: "In Progress",
            location: "Sector Sur",
            description: "Reparación y ampliación de red cloacal"
          },
          {
            project_name: "Ampliación Escuela Primaria N°5",
            project_type: "Educational Infrastructure",
            budgeted_amount: 15000000,
            actual_spent: 15000000,
            contractor: "Construcciones Educativas S.A.",
            award_date: "2023-09-05",
            scheduled_completion: "2024-06-05",
            actual_completion: "",
            status: "Completed",
            location: "Barrio Oeste",
            description: "Ampliación de aulas y áreas recreativas"
          }
        ],
        contractor_analysis: [
          {
            contractor_name: "Constructora ABC S.A.",
            total_projects: 3,
            total_amount: 65000000,
            completion_rate: 0.67,
            delay_rate: 0.33,
            first_project_date: "2022-01-15",
            last_project_date: "2024-03-15"
          },
          {
            contractor_name: "Obras Verdes S.R.L.",
            total_projects: 2,
            total_amount: 28000000,
            completion_rate: 0.50,
            delay_rate: 0.50,
            first_project_date: "2023-05-10",
            last_project_date: "2023-11-20"
          },
          {
            contractor_name: "Sistemas Hidráulicos S.A.",
            total_projects: 1,
            total_amount: 32000000,
            completion_rate: 1.00,
            delay_rate: 0.00,
            first_project_date: "2024-01-10",
            last_project_date: "2024-01-10"
          }
        ],
        flags: [
          {
            project_name: "Pavimentación Avenida Principal",
            flag_type: "delayed_completion",
            description: "Project awarded 2024-03-15 but still not completed after 150 days",
            severity: "high",
            budgeted_amount: 25000000
          },
          {
            project_name: "Parque Municipal Nuevo",
            flag_type: "delayed_completion",
            description: "Project awarded 2023-11-20 but still not completed after 280 days",
            severity: "high",
            budgeted_amount: 18000000
          }
        ],
        summary: {
          total_projects: 4,
          total_budget: 90000000,
          delayed_projects: 2,
          flagged_projects: 2,
          completion_rate: 0.25
        }
      };
      
      setInfrastructureData(mockData);
    } catch (err) {
      setError('Error al cargar los datos de infraestructura');
      console.error('Infrastructure data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delayed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredProjects = infrastructureData?.projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'delayed') return project.status.toLowerCase() === 'delayed';
    if (filter === 'completed') return project.status.toLowerCase() === 'completed';
    if (filter === 'in-progress') return project.status.toLowerCase() === 'in progress';
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de infraestructura...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={loadInfrastructureData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!infrastructureData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            No hay datos de infraestructura disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Los datos de seguimiento de infraestructura aún no han sido generados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
          🏗️ Seguimiento de Proyectos de Infraestructura
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Monitoreo de proyectos de infraestructura en el municipio de Carmen de Areco
        </p>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {new Date(infrastructureData.timestamp).toLocaleDateString('es-AR')}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Proyectos</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {infrastructureData.summary.total_projects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Presupuesto Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(infrastructureData.summary.total_budget)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos Atrasados</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {infrastructureData.summary.delayed_projects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos Flagelados</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {infrastructureData.summary.flagged_projects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Finalización</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {(infrastructureData.summary.completion_rate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'in-progress', label: 'En Progreso' },
            { id: 'completed', label: 'Completados' },
            { id: 'delayed', label: 'Atrasados' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === option.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'projects', label: 'Proyectos', icon: <Building className="h-4 w-4 mr-2" /> },
            { id: 'contractors', label: 'Contratistas', icon: <DollarSign className="h-4 w-4 mr-2" /> },
            { id: 'flags', label: 'Alertas', icon: <AlertTriangle className="h-4 w-4 mr-2" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {activeTab === 'projects' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Proyectos de Infraestructura
            </h2>
            
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {project.project_name}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {project.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Presupuesto
                        </div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {formatCurrency(project.budgeted_amount)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          Ubicación
                        </div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {project.location}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Adjudicado
                        </div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {formatDate(project.award_date)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                          <Clock className="h-4 w-4 mr-1" />
                          Finalización
                        </div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {formatDate(project.scheduled_completion)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Contratista: <span className="font-medium text-gray-800 dark:text-white">{project.contractor}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No se encontraron proyectos
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No hay proyectos que coincidan con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contractors' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Análisis de Contratistas
            </h2>
            
            {infrastructureData.contractor_analysis.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contratista
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Proyectos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Monto Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tasa de Finalización
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tasa de Atraso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {infrastructureData.contractor_analysis.map((contractor, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {contractor.contractor_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {contractor.total_projects}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-800 dark:text-white">
                            {formatCurrency(contractor.total_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {(contractor.completion_rate * 100).toFixed(0)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {(contractor.delay_rate * 100).toFixed(0)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No hay datos de contratistas
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se encontraron registros de análisis de contratistas.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'flags' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Alertas de Proyectos
            </h2>
            
            {infrastructureData.flags.length > 0 ? (
              <div className="space-y-4">
                {infrastructureData.flags.map((flag, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${getSeverityColor(flag.severity)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{flag.project_name}</h3>
                        <p className="text-sm mt-1">{flag.description}</p>
                      </div>
                      <span className="font-semibold">{formatCurrency(flag.budgeted_amount)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No hay alertas
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se identificaron proyectos con alertas significativas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Information Banner */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Información Importante
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Esta información es generada automáticamente mediante análisis de documentos oficiales del municipio.
                Los datos de seguimiento reflejan el estado actual de los proyectos de infraestructura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureTracker;