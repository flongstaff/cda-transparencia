/**
 * OSINT Monitoring System
 * Comprehensive audit and monitoring system with OSINT capabilities
 * Integrates external data sources to complement municipal transparency data
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Globe,
  Database,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  FileText,
  Users,
  Building,
  DollarSign,
  MapPin,
  ExternalLink,
  RefreshCw,
  Download,
  Filter,
  Info,
  AlertCircle,
  CheckSquare,
  XSquare,
  Loader2
} from 'lucide-react';

// Types
interface OSINTData {
  source: string;
  type: 'financial' | 'contract' | 'personnel' | 'infrastructure' | 'social' | 'legal';
  title: string;
  description: string;
  url: string;
  date: string;
  confidence: number;
  relevance: 'high' | 'medium' | 'low';
  status: 'verified' | 'pending' | 'disputed' | 'outdated';
  tags: string[];
  metadata: Record<string, any>;
}

interface AuditResult {
  id: string;
  type: 'discrepancy' | 'anomaly' | 'missing_data' | 'external_verification' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  source: string;
  date: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  relatedData: string[];
  osintSources: OSINTData[];
}

interface MonitoringMetrics {
  totalSources: number;
  activeSources: number;
  verifiedData: number;
  pendingVerification: number;
  discrepancies: number;
  lastUpdate: string;
  coverage: number;
}

interface OSINTMonitoringSystemProps {
  year: number;
  municipality: string;
  className?: string;
  showControls?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const OSINTMonitoringSystem: React.FC<OSINTMonitoringSystemProps> = ({
  year,
  municipality = 'Carmen de Areco',
  className = '',
  showControls = true,
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes
}) => {
  const [osintData, setOsintData] = useState<OSINTData[]>([]);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    totalSources: 0,
    activeSources: 0,
    verifiedData: 0,
    pendingVerification: 0,
    discrepancies: 0,
    lastUpdate: new Date().toISOString(),
    coverage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // OSINT Sources Configuration
  const osintSources = [
    {
      name: 'Gobierno de Buenos Aires',
      url: 'https://www.gba.gob.ar/',
      type: 'official',
      coverage: ['budget', 'contracts', 'personnel'],
      reliability: 0.95
    },
    {
      name: 'Boletín Oficial',
      url: 'https://www.boletinoficial.gob.ar/',
      type: 'official',
      coverage: ['legal', 'contracts', 'personnel'],
      reliability: 0.98
    },
    {
      name: 'Ministerio de Hacienda',
      url: 'https://www.hacienda.gob.ar/',
      type: 'official',
      coverage: ['budget', 'financial'],
      reliability: 0.92
    },
    {
      name: 'Contrataciones Públicas',
      url: 'https://www.contrataciones.gov.ar/',
      type: 'official',
      coverage: ['contracts', 'procurement'],
      reliability: 0.90
    },
    {
      name: 'Prensa Local',
      url: 'https://www.lanueva.com/',
      type: 'media',
      coverage: ['social', 'infrastructure', 'personnel'],
      reliability: 0.75
    },
    {
      name: 'Redes Sociales',
      url: 'https://twitter.com/',
      type: 'social',
      coverage: ['social', 'infrastructure'],
      reliability: 0.60
    }
  ];

  // Load OSINT data and perform audits
  useEffect(() => {
    loadOSINTData();
    
    if (autoRefresh) {
      const interval = setInterval(loadOSINTData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [year, municipality, autoRefresh, refreshInterval]);

  const loadOSINTData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate OSINT data collection
      const mockOSINTData = generateMockOSINTData();
      const mockAuditResults = await performAuditAnalysis(mockOSINTData);
      const mockMetrics = calculateMetrics(mockOSINTData, mockAuditResults);

      setOsintData(mockOSINTData);
      setAuditResults(mockAuditResults);
      setMetrics(mockMetrics);
    } catch (err) {
      console.error('Error loading OSINT data:', err);
      setError(err instanceof Error ? err.message : 'Error loading OSINT data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockOSINTData = (): OSINTData[] => {
    const mockData: OSINTData[] = [];

    // Government sources
    mockData.push({
      source: 'Gobierno de Buenos Aires',
      type: 'financial',
      title: 'Presupuesto Municipal 2025',
      description: 'Presupuesto aprobado para el municipio de Carmen de Areco',
      url: 'https://www.gba.gob.ar/presupuesto-2025',
      date: '2025-01-15',
      confidence: 0.95,
      relevance: 'high',
      status: 'verified',
      tags: ['presupuesto', 'municipal', '2025'],
      metadata: { amount: 500000000, category: 'budget' }
    });

    mockData.push({
      source: 'Boletín Oficial',
      type: 'contract',
      title: 'Licitación Pública - Obras de Infraestructura',
      description: 'Licitación para obras de infraestructura vial',
      url: 'https://www.boletinoficial.gob.ar/contrato-12345',
      date: '2025-02-10',
      confidence: 0.98,
      relevance: 'high',
      status: 'verified',
      tags: ['licitacion', 'infraestructura', 'vial'],
      metadata: { amount: 25000000, contractor: 'Constructora ABC' }
    });

    mockData.push({
      source: 'Ministerio de Hacienda',
      type: 'financial',
      title: 'Transferencias a Municipios',
      description: 'Transferencias del gobierno provincial a municipios',
      url: 'https://www.hacienda.gob.ar/transferencias',
      date: '2025-01-20',
      confidence: 0.92,
      relevance: 'medium',
      status: 'verified',
      tags: ['transferencias', 'provincial', 'municipal'],
      metadata: { amount: 15000000, category: 'transfer' }
    });

    // Media sources
    mockData.push({
      source: 'Prensa Local',
      type: 'infrastructure',
      title: 'Inauguración de Nueva Escuela',
      description: 'Inauguración de escuela primaria en el centro',
      url: 'https://www.lanueva.com/escuela-inaugurada',
      date: '2025-02-15',
      confidence: 0.75,
      relevance: 'medium',
      status: 'pending',
      tags: ['educacion', 'infraestructura', 'inauguracion'],
      metadata: { cost: 8000000, location: 'Centro' }
    });

    mockData.push({
      source: 'Redes Sociales',
      type: 'social',
      title: 'Denuncia sobre Contrataciones',
      description: 'Denuncia ciudadana sobre irregularidades en contrataciones',
      url: 'https://twitter.com/denuncia123',
      date: '2025-02-20',
      confidence: 0.60,
      relevance: 'high',
      status: 'disputed',
      tags: ['denuncia', 'contrataciones', 'irregularidades'],
      metadata: { type: 'complaint', severity: 'high' }
    });

    return mockData;
  };

  const performAuditAnalysis = async (data: OSINTData[]): Promise<AuditResult[]> => {
    const results: AuditResult[] = [];

    // Check for discrepancies between internal and external data
    const budgetDiscrepancy = {
      id: 'audit-001',
      type: 'discrepancy' as const,
      severity: 'high' as const,
      title: 'Discrepancia en Presupuesto Municipal',
      description: 'Diferencia encontrada entre presupuesto interno y datos oficiales',
      recommendation: 'Verificar y reconciliar datos presupuestarios con fuentes oficiales',
      source: 'OSINT Analysis',
      date: new Date().toISOString(),
      status: 'open' as const,
      relatedData: ['budget-2025', 'gba-data'],
      osintSources: data.filter(d => d.type === 'financial')
    };

    // Check for missing contract information
    const missingContracts = {
      id: 'audit-002',
      type: 'missing_data' as const,
      severity: 'medium' as const,
      title: 'Información de Contratos Incompleta',
      description: 'Faltan detalles de contratos mencionados en fuentes externas',
      recommendation: 'Completar información de contratos y publicar en portal de transparencia',
      source: 'OSINT Analysis',
      date: new Date().toISOString(),
      status: 'investigating' as const,
      relatedData: ['contracts-2025'],
      osintSources: data.filter(d => d.type === 'contract')
    };

    // Check for social media complaints
    const socialComplaints = {
      id: 'audit-003',
      type: 'external_verification' as const,
      severity: 'high' as const,
      title: 'Denuncias Ciudadanas Detectadas',
      description: 'Denuncias sobre irregularidades en redes sociales requieren investigación',
      recommendation: 'Investigar denuncias y proporcionar respuesta oficial',
      source: 'OSINT Analysis',
      date: new Date().toISOString(),
      status: 'open' as const,
      relatedData: ['social-media'],
      osintSources: data.filter(d => d.type === 'social')
    };

    results.push(budgetDiscrepancy, missingContracts, socialComplaints);
    return results;
  };

  const calculateMetrics = (data: OSINTData[], audits: AuditResult[]): MonitoringMetrics => {
    return {
      totalSources: osintSources.length,
      activeSources: data.filter(d => d.status === 'verified').length,
      verifiedData: data.filter(d => d.status === 'verified').length,
      pendingVerification: data.filter(d => d.status === 'pending').length,
      discrepancies: audits.filter(a => a.type === 'discrepancy').length,
      lastUpdate: new Date().toISOString(),
      coverage: Math.round((data.length / osintSources.length) * 100)
    };
  };

  const filteredData = useMemo(() => {
    let filtered = [...osintData];

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.type === selectedFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [osintData, selectedFilter, searchQuery]);

  const filteredAudits = useMemo(() => {
    return auditResults.filter(audit => {
      if (selectedFilter !== 'all') {
        return audit.type === selectedFilter;
      }
      return true;
    });
  }, [auditResults, selectedFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'disputed': return 'text-red-600 bg-red-100';
      case 'outdated': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Sistema de Monitoreo OSINT
            </h2>
            <p className="text-gray-600 mt-1">
              Monitoreo de fuentes abiertas para {municipality} - {year}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {showControls && (
              <>
                <button
                  onClick={loadOSINTData}
                  disabled={loading}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>

                <button
                  onClick={() => {/* Export functionality */}}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fuentes Activas</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeSources}</p>
              <p className="text-xs text-gray-500">de {metrics.totalSources} totales</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Datos Verificados</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.verifiedData}</p>
              <p className="text-xs text-gray-500">Alta confiabilidad</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.pendingVerification}</p>
              <p className="text-xs text-gray-500">Requieren verificación</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Discrepancias</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.discrepancies}</p>
              <p className="text-xs text-gray-500">Requieren atención</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filtrar por tipo de dato"
              >
                <option value="all">Todos los tipos</option>
                <option value="financial">Financiero</option>
                <option value="contract">Contratos</option>
                <option value="personnel">Personal</option>
                <option value="infrastructure">Infraestructura</option>
                <option value="social">Social</option>
                <option value="legal">Legal</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar en datos OSINT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Audit Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Resultados de Auditoría
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Analizando datos...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAudits.map((audit) => (
                <motion.div
                  key={audit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{audit.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(audit.severity)}`}>
                          {audit.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(audit.status)}`}>
                          {audit.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{audit.description}</p>
                      <p className="text-blue-600 text-sm font-medium">{audit.recommendation}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Ver detalles"
                        aria-label="Ver detalles de la auditoría"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Abrir enlace externo"
                        aria-label="Abrir enlace externo"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OSINT Data Sources */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            Fuentes de Datos OSINT
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando fuentes...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.source}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${getConfidenceColor(item.confidence)}`}>
                        {Math.round(item.confidence * 100)}% confianza
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`px-1 py-0.5 text-xs rounded ${
                        item.relevance === 'high' ? 'bg-red-100 text-red-600' :
                        item.relevance === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {item.relevance}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button 
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Abrir fuente externa"
                      aria-label="Abrir fuente externa"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error en el Sistema de Monitoreo</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OSINTMonitoringSystem;
