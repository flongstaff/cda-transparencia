import React, { useState, useEffect } from 'react';
import { Building, Clock, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { externalAPIsService } from "../services/ExternalDataAdapter";
import ErrorBoundary from '@components/common/ErrorBoundary';

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
      
      // Try to load infrastructure data from external APIs service
      console.log('Loading infrastructure data from external APIs...');
      
      try {
        const externalResult = await externalAPIsService.getObrasPublicasData();
        console.log('Obras Públicas data:', externalResult);
        
        // Process Obras Públicas data
        if (externalResult.success && externalResult.data) {
          console.log('Found Obras Públicas data:', externalResult);
          
          // Process the actual data structure
          const infrastructureData: InfrastructureData = {
            timestamp: new Date().toISOString(),
            projects: externalResult.data.projects || [],
            contractor_analysis: externalResult.data.contractor_analysis || [],
            flags: externalResult.data.flags || [],
            summary: {
              total_projects: externalResult.data.summary?.total_projects || 0,
              total_budget: externalResult.data.summary?.total_budget || 0,
              delayed_projects: externalResult.data.summary?.delayed_projects || 0,
              flagged_projects: externalResult.data.summary?.flagged_projects || 0,
              completion_rate: externalResult.data.summary?.completion_rate || 0,
            }
          };
          
          setInfrastructureData(infrastructureData);
          setLoading(false);
          return;
        }
      } catch (externalError) {
        console.warn('Obras Públicas API not available:', externalError);
      }
      
      // Show empty state when no real data is available
      const emptyData: InfrastructureData = {
        timestamp: new Date().toISOString(),
        projects: [],
        contractor_analysis: [],
        flags: [],
        summary: {
          total_projects: 0,
          total_budget: 0,
          delayed_projects: 0,
          flagged_projects: 0,
          completion_rate: 0,
        }
      };
      
      setInfrastructureData(emptyData);
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

  const _getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const _getStatusColor = (status: _string): _string => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            Los datos de proyectos de infraestructura aún no han sido generados.
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
          🏗️ Seguimiento de Infraestructura
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Control y auditoría de proyectos de infraestructura municipal
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos Retrasados</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos Marcados</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa Completado</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {infrastructureData.summary.completion_rate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {infrastructureData.projects.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            No hay proyectos de infraestructura
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            El sistema aún no ha procesado proyectos de infraestructura municipal.
          </p>
        </div>
      )}
    </div>
  );
};


// Wrap with error boundary for production safety
const InfrastructureTrackerWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Error al Cargar Página
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Ocurrió un error al cargar esta página. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
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
      <InfrastructureTracker />
    </ErrorBoundary>
  );
};

export default InfrastructureTrackerWithErrorBoundary;