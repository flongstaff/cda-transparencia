import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  Database,
  Search,
  TrendingUp,
  Users,
  FileText,
  Calendar
} from 'lucide-react';

interface DataSource {
  name: string;
  url: string;
  status: string;
  last_checked: string;
  documents_count: number;
}

interface IntegrityReport {
  verification_status: string;
  total_documents: number;
  verified_documents: number;
  data_sources: DataSource[];
  verification_methods: string[];
  osint_compliance: {
    legal_framework: string[];
    compliance_rate: string;
    last_audit: string;
  };
  generated_at: string;
}

interface DashboardData {
  transparency_score: number;
  key_metrics: {
    budget_execution: {
      year: number;
      executed: number;
      planned: number;
      efficiency: string;
    };
    contracts_awarded: {
      total: number;
      public_tenders: number;
      direct_awards: number;
      transparency_rating: string;
    };
    salary_transparency: {
      officials_declared: number;
      declarations_up_to_date: number;
      compliance_rate: number;
    };
  };
  recent_updates: Array<{
    date: string;
    type: string;
    description: string;
  }>;
  data_quality: {
    completeness: number;
    timeliness: number;
    accuracy: number;
    consistency: number;
  };
  citizen_engagement: {
    document_downloads: number;
    search_queries: number;
    most_requested: string[];
  };
}

export const DataIntegrityDashboard: React.FC = () => {
  const [integrityData, setIntegrityData] = useState<IntegrityReport | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('integrity');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const [integrityResponse, dashboardResponse] = await Promise.all([
          fetch(`${API_BASE}/data-integrity`),
          fetch(`${API_BASE}/analytics/dashboard`)
        ]);

        const integrityData = await integrityResponse.json();
        const dashboardData = await dashboardResponse.json();

        setIntegrityData(integrityData);
        setDashboardData(dashboardData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Integridad de Datos</h1>
            <p className="text-blue-100">
              Monitoreo en tiempo real de la calidad y verificación de datos
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              {dashboardData?.transparency_score.toFixed(1)}%
            </div>
            <div className="text-blue-100">Índice de Transparencia</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'integrity', label: 'Integridad de Datos', icon: Shield },
          { id: 'dashboard', label: 'Panel de Control', icon: TrendingUp },
          { id: 'compliance', label: 'Cumplimiento OSINT', icon: CheckCircle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'integrity' && integrityData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification Status */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="text-green-600" size={24} />
              <h3 className="text-xl font-semibold">Estado de Verificación</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estado General:</span>
                <span className="text-green-600 font-medium flex items-center">
                  <CheckCircle size={16} className="mr-1" />
                  {integrityData.verification_status}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Documentos Totales:</span>
                <span className="font-semibold">{integrityData.total_documents.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Documentos Verificados:</span>
                <span className="text-green-600 font-semibold">
                  {integrityData.verified_documents.toLocaleString()}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ 
                    width: `${(integrityData.verified_documents / integrityData.total_documents) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold">Fuentes de Datos</h3>
            </div>
            
            <div className="space-y-3">
              {integrityData.data_sources.map((source, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{source.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      source.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {source.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{source.documents_count} documentos</p>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {source.url}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Methods */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="text-indigo-600" size={24} />
              <h3 className="text-xl font-semibold">Métodos de Verificación</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {integrityData.verification_methods.map((method, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm">{method}</span>
                </div>
              ))}
            </div>
          </div>

          {/* OSINT Compliance */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="text-purple-600" size={24} />
              <h3 className="text-xl font-semibold">Cumplimiento OSINT</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tasa de Cumplimiento:</span>
                <span className="text-green-600 font-semibold">
                  {integrityData.osint_compliance.compliance_rate}
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Marco Legal:</p>
                <div className="flex flex-wrap gap-2">
                  {integrityData.osint_compliance.legal_framework.map((law, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      {law}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics Cards */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="text-green-600" size={24} />
              <h3 className="text-lg font-semibold">Ejecución Presupuestaria</h3>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {dashboardData.key_metrics.budget_execution.executed}%
              </div>
              <p className="text-sm text-gray-600">
                Año {dashboardData.key_metrics.budget_execution.year}
              </p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                dashboardData.key_metrics.budget_execution.efficiency === 'High'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                Eficiencia {dashboardData.key_metrics.budget_execution.efficiency}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold">Contratos Adjudicados</h3>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {dashboardData.key_metrics.contracts_awarded.total}
              </div>
              <p className="text-sm text-gray-600">
                {dashboardData.key_metrics.contracts_awarded.public_tenders} licitaciones públicas
              </p>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {dashboardData.key_metrics.contracts_awarded.transparency_rating}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="text-purple-600" size={24} />
              <h3 className="text-lg font-semibold">Transparencia Salarial</h3>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">
                {dashboardData.key_metrics.salary_transparency.compliance_rate}%
              </div>
              <p className="text-sm text-gray-600">
                {dashboardData.key_metrics.salary_transparency.declarations_up_to_date} de {dashboardData.key_metrics.salary_transparency.officials_declared} funcionarios
              </p>
            </div>
          </div>

          {/* Data Quality Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Calidad de Datos</h3>
            <div className="space-y-4">
              {Object.entries(dashboardData.data_quality).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-sm text-gray-600">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Engagement */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="text-orange-600" size={24} />
              <h3 className="text-lg font-semibold">Participación Ciudadana</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData.citizen_engagement.document_downloads.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Descargas de documentos</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData.citizen_engagement.search_queries.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Consultas de búsqueda</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Más solicitados:</p>
                {dashboardData.citizen_engagement.most_requested.map((item, index) => (
                  <p key={index} className="text-xs text-gray-600">• {item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-12">
            <Shield size={64} className="mx-auto text-green-600 mb-4" />
            <h3 className="text-2xl font-semibold text-green-600 mb-2">
              Cumplimiento OSINT Completo
            </h3>
            <p className="text-gray-600 mb-4">
              Todas las actividades de recopilación de datos cumplen con el marco legal argentino
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Marco Legal Nacional</h4>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Ley 27.275 (Acceso a la Información)</li>
                  <li>• Ley 25.326 (Protección de Datos)</li>
                  <li>• Código Penal Argentino</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">Estándares Internacionales</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Convención de la ONU contra la Corrupción</li>
                  <li>• Convención Interamericana OEA</li>
                  <li>• Principios de Gobierno Abierto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataIntegrityDashboard;