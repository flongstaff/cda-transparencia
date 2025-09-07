import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Users, 
  AlertCircle,
  Search,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  Star,
  CheckCircle,
  ExternalLink,
  Archive,
  Loader2
} from 'lucide-react';

interface CitizenOverview {
  total_municipal_budget: number;
  total_executed: number;
  execution_rate: string;
  budget_per_citizen: string;
  executed_per_citizen: string;
  unexecuted_amount: number;
  transparency_level: string;
  citizen_impact: {
    yearly_tax_contribution_estimate: number;
    services_delivered_value: number;
    efficiency_rating: string;
  };
}

interface DocumentAccess {
  id: number;
  title: string;
  filename: string;
  year: number;
  category: string;
  citizen_description: string;
  access_url: string;
  download_url: string;
  relevance_score: number;
}

const CitizenTransparency: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [overview, setOverview] = useState<CitizenOverview | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<DocumentAccess[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [dashboard, setDashboard] = useState<any>(null);

  const availableYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018];

  useEffect(() => {
    loadCitizenData();
    loadDashboard();
  }, [selectedYear]);

  const loadCitizenData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/transparency/citizen/financial/${selectedYear}`);
      const data = await response.json();
      
      if (response.ok && data.overview) {
        setOverview(data.overview);
      } else {
        console.error('Error loading citizen data:', data);
      }
    } catch (error) {
      console.error('Error fetching citizen data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/transparency/dashboard');
      const data = await response.json();
      
      if (response.ok) {
        setDashboard(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const searchDocuments = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      const response = await fetch(`http://localhost:3001/api/transparency/search/${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.results || []);
      } else {
        console.error('Search error:', data);
      }
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchDocuments();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatLargeNumber = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return formatCurrency(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-700">Cargando datos de transparencia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🏛️ Portal de Transparencia Municipal
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Carmen de Areco - Conoce cómo se invierten tus impuestos
            </p>
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">100% Datos Verificados</span>
              <span className="mx-2">•</span>
              <span>{dashboard?.overview?.total_documents || 0} Documentos Disponibles</span>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex justify-center mt-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedYear === year
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Citizen Overview Cards */}
        {overview && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <DollarSign className="w-10 h-10 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Presupuesto Total {selectedYear}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatLargeNumber(overview.total_municipal_budget)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <TrendingUp className="w-10 h-10 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Tu Contribución Anual</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(parseFloat(overview.budget_per_citizen))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <BarChart3 className="w-10 h-10 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Ejecución Presupuestaria</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.execution_rate}%</p>
                  <p className="text-sm text-gray-500">{overview.citizen_impact.efficiency_rating}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <Star className="w-10 h-10 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Transparencia</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.transparency_level}%</p>
                  <p className="text-sm text-gray-500">Documentos Verificados</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Citizen Impact Section */}
        {overview && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              Impacto en tu Comunidad
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">💰 Inversión Ciudadana</h3>
                  <p className="text-gray-700">
                    Cada ciudadano contribuye aproximadamente{' '}
                    <span className="font-bold text-blue-600">
                      {formatCurrency(parseFloat(overview.budget_per_citizen))}
                    </span>{' '}
                    anuales para financiar servicios públicos municipales.
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🏛️ Servicios Recibidos</h3>
                  <p className="text-gray-700">
                    En retorno, cada ciudadano recibe servicios por valor de{' '}
                    <span className="font-bold text-green-600">
                      {formatCurrency(parseFloat(overview.executed_per_citizen))}
                    </span>{' '}
                    incluyendo: seguridad, limpieza, alumbrado, mantenimiento urbano.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Eficiencia Municipal</h3>
                  <p className="text-gray-700">
                    La gestión municipal tiene una calificación de{' '}
                    <span className="font-bold text-purple-600">
                      {overview.citizen_impact.efficiency_rating}
                    </span>{' '}
                    en ejecución presupuestaria.
                  </p>
                </div>
                
                {overview.unexecuted_amount > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      Fondos No Ejecutados
                    </h3>
                    <p className="text-gray-700">
                      {formatLargeNumber(overview.unexecuted_amount)} del presupuesto no fueron ejecutados.
                      <span className="block text-sm text-gray-600 mt-1">
                        Esto representa una oportunidad de mejora en la gestión municipal.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Document Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            Acceso a Documentos Municipales
          </h2>
          
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar documentos (ej: presupuesto, salarios, contratos...)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {searchLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span className="ml-2">Buscar</span>
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Resultados de búsqueda ({searchResults.length} documentos)
              </h3>
              
              <div className="grid gap-4">
                {searchResults.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{doc.title}</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {doc.year}
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Relevancia: {doc.relevance_score}/100
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{doc.citizen_description}</p>
                        <p className="text-sm text-gray-500">Categoría: {doc.category}</p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <a
                          href={doc.access_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </a>
                        <a
                          href={doc.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Descargar
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Access Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceso Rápido</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setSearchQuery('presupuesto');
                  setTimeout(() => searchDocuments(), 100);
                }}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>📊 Presupuestos</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
              
              <button
                onClick={() => {
                  setSearchQuery('salarios');
                  setTimeout(() => searchDocuments(), 100);
                }}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>💰 Salarios Públicos</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
              
              <button
                onClick={() => {
                  setSearchQuery('contrato');
                  setTimeout(() => searchDocuments(), 100);
                }}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>📋 Contrataciones</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 text-white rounded-xl p-8"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">🏛️ Transparencia Municipal</h3>
            <p className="text-gray-300 mb-6">
              Este portal permite a los ciudadanos de Carmen de Areco acceder de forma transparente 
              a información sobre el uso de los recursos públicos municipales.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex justify-center mb-2">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="font-semibold mb-2">Datos Verificados</h4>
                <p className="text-sm text-gray-400">
                  Toda la información proviene de fuentes oficiales verificadas
                </p>
              </div>
              
              <div>
                <div className="flex justify-center mb-2">
                  <Archive className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="font-semibold mb-2">Acceso Completo</h4>
                <p className="text-sm text-gray-400">
                  Documentos originales, enlaces oficiales y copias de respaldo
                </p>
              </div>
              
              <div>
                <div className="flex justify-center mb-2">
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="font-semibold mb-2">Análisis Ciudadano</h4>
                <p className="text-sm text-gray-400">
                  Interpretación clara del impacto en los servicios públicos
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CitizenTransparency;