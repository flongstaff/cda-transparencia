import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Database,
  FileText,
  TrendingUp,
  Activity,
  Eye,
  Download,
  Calendar,
  BarChart3,
  Info
} from 'lucide-react';

interface DataSourceMetadata {
  source: string;
  type: 'csv' | 'json' | 'pdf' | 'external' | 'manual';
  lastUpdate: string;
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  nextUpdate: string;
  records: number;
  quality: number; // 0-100
  completeness: number; // 0-100
  verified: boolean;
  url?: string;
}

interface PageTransparencyMetrics {
  pageName: string;
  route: string;
  category: 'financial' | 'procurement' | 'audit' | 'transparency' | 'data';
  dataQuality: number;
  updateFrequency: number;
  publicAccess: number;
  documentation: number;
  overallScore: number;
  dataSources: DataSourceMetadata[];
  lastModified: string;
}

interface MetaTransparencyTrackerProps {
  compact?: boolean;
  pageName?: string;
  dataSources?: DataSourceMetadata[];
  showFullReport?: boolean;
}

const MetaTransparencyTracker: React.FC<MetaTransparencyTrackerProps> = ({
  compact = false,
  pageName,
  dataSources,
  showFullReport = false
}) => {
  const [expandedView, setExpandedView] = useState(showFullReport);

  // Mock comprehensive data - In production, this would come from a metadata API
  const allPagesMetrics: PageTransparencyMetrics[] = useMemo(() => [
    {
      pageName: 'Presupuesto Municipal',
      route: '/budget',
      category: 'financial',
      dataQuality: 95,
      updateFrequency: 90,
      publicAccess: 100,
      documentation: 85,
      overallScore: 92.5,
      lastModified: '2024-09-30',
      dataSources: [
        {
          source: 'Presupuesto 2024',
          type: 'pdf',
          lastUpdate: '2024-01-15',
          updateFrequency: 'annual',
          nextUpdate: '2025-01-15',
          records: 450,
          quality: 95,
          completeness: 98,
          verified: true,
          url: '/data/local/PRESUPUESTO-2025-APROBADO-ORD-3280-24.xlsx'
        },
        {
          source: 'Ejecución Presupuestaria',
          type: 'csv',
          lastUpdate: '2024-09-30',
          updateFrequency: 'monthly',
          nextUpdate: '2024-10-31',
          records: 2840,
          quality: 92,
          completeness: 95,
          verified: true
        }
      ]
    },
    {
      pageName: 'Tesorería',
      route: '/treasury',
      category: 'financial',
      dataQuality: 88,
      updateFrequency: 85,
      publicAccess: 95,
      documentation: 80,
      overallScore: 87,
      lastModified: '2024-09-28',
      dataSources: [
        {
          source: 'Situación Económico-Financiera',
          type: 'pdf',
          lastUpdate: '2024-09-28',
          updateFrequency: 'quarterly',
          nextUpdate: '2024-12-31',
          records: 156,
          quality: 90,
          completeness: 92,
          verified: true
        },
        {
          source: 'Flujo de Caja',
          type: 'json',
          lastUpdate: '2024-09-25',
          updateFrequency: 'monthly',
          nextUpdate: '2024-10-25',
          records: 520,
          quality: 85,
          completeness: 88,
          verified: true
        }
      ]
    },
    {
      pageName: 'Contrataciones',
      route: '/contracts',
      category: 'procurement',
      dataQuality: 78,
      updateFrequency: 75,
      publicAccess: 90,
      documentation: 70,
      overallScore: 78.25,
      lastModified: '2024-09-20',
      dataSources: [
        {
          source: 'Licitaciones Públicas',
          type: 'pdf',
          lastUpdate: '2024-09-20',
          updateFrequency: 'monthly',
          nextUpdate: '2024-10-20',
          records: 45,
          quality: 82,
          completeness: 75,
          verified: true
        },
        {
          source: 'Contratos Adjudicados',
          type: 'manual',
          lastUpdate: '2024-08-15',
          updateFrequency: 'monthly',
          nextUpdate: '2024-10-15',
          records: 89,
          quality: 75,
          completeness: 70,
          verified: false
        }
      ]
    },
    {
      pageName: 'Auditorías',
      route: '/audits',
      category: 'audit',
      dataQuality: 92,
      updateFrequency: 70,
      publicAccess: 85,
      documentation: 95,
      overallScore: 85.5,
      lastModified: '2024-09-15',
      dataSources: [
        {
          source: 'Informes de Auditoría',
          type: 'pdf',
          lastUpdate: '2024-09-15',
          updateFrequency: 'quarterly',
          nextUpdate: '2024-12-15',
          records: 12,
          quality: 98,
          completeness: 95,
          verified: true
        }
      ]
    },
    {
      pageName: 'Declaraciones Juradas',
      route: '/property-declarations',
      category: 'transparency',
      dataQuality: 100,
      updateFrequency: 95,
      publicAccess: 100,
      documentation: 90,
      overallScore: 96.25,
      lastModified: '2024-09-30',
      dataSources: [
        {
          source: 'DDJJ Funcionarios 2024',
          type: 'pdf',
          lastUpdate: '2024-09-30',
          updateFrequency: 'annual',
          nextUpdate: '2025-09-30',
          records: 45,
          quality: 100,
          completeness: 100,
          verified: true,
          url: '/data/markdown_documents/DDJJ-2024.md'
        }
      ]
    },
    {
      pageName: 'Ingresos Municipales',
      route: '/revenue',
      category: 'financial',
      dataQuality: 90,
      updateFrequency: 88,
      publicAccess: 95,
      documentation: 82,
      overallScore: 88.75,
      lastModified: '2024-09-28',
      dataSources: [
        {
          source: 'Recursos por Procedencia',
          type: 'csv',
          lastUpdate: '2024-09-28',
          updateFrequency: 'monthly',
          nextUpdate: '2024-10-28',
          records: 1250,
          quality: 92,
          completeness: 90,
          verified: true
        },
        {
          source: 'Cobranza Tributaria',
          type: 'external',
          lastUpdate: '2024-09-30',
          updateFrequency: 'weekly',
          nextUpdate: '2024-10-07',
          records: 3200,
          quality: 88,
          completeness: 85,
          verified: true
        }
      ]
    }
  ], []);

  const currentPageMetrics = useMemo(() => {
    if (!pageName) return null;
    return allPagesMetrics.find(p => p.pageName === pageName || p.route === pageName);
  }, [pageName, allPagesMetrics]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 75) return <Activity className="w-5 h-5 text-blue-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getUpdateStatus = (source: DataSourceMetadata) => {
    const lastUpdate = new Date(source.lastUpdate);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    let maxDays = 365;
    if (source.updateFrequency === 'daily') maxDays = 2;
    else if (source.updateFrequency === 'weekly') maxDays = 10;
    else if (source.updateFrequency === 'monthly') maxDays = 35;
    else if (source.updateFrequency === 'quarterly') maxDays = 100;

    if (daysSinceUpdate <= maxDays) return { status: 'current', color: 'green', label: 'Actualizado' };
    if (daysSinceUpdate <= maxDays * 1.5) return { status: 'warning', color: 'yellow', label: 'Próximo a vencer' };
    return { status: 'outdated', color: 'red', label: 'Desactualizado' };
  };

  const globalStats = useMemo(() => {
    const avgQuality = allPagesMetrics.reduce((sum, p) => sum + p.dataQuality, 0) / allPagesMetrics.length;
    const avgFrequency = allPagesMetrics.reduce((sum, p) => sum + p.updateFrequency, 0) / allPagesMetrics.length;
    const avgAccess = allPagesMetrics.reduce((sum, p) => sum + p.publicAccess, 0) / allPagesMetrics.length;
    const avgDocs = allPagesMetrics.reduce((sum, p) => sum + p.documentation, 0) / allPagesMetrics.length;
    const avgScore = allPagesMetrics.reduce((sum, p) => sum + p.overallScore, 0) / allPagesMetrics.length;
    const totalSources = allPagesMetrics.reduce((sum, p) => sum + p.dataSources.length, 0);

    return { avgQuality, avgFrequency, avgAccess, avgDocs, avgScore, totalSources };
  }, [allPagesMetrics]);

  if (compact && currentPageMetrics) {
    // Compact widget for individual pages
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Meta-Transparencia
          </h4>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(currentPageMetrics.overallScore)}`}>
            {currentPageMetrics.overallScore.toFixed(1)}%
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600 mb-1">Calidad</div>
            <div className="text-lg font-bold text-gray-900">{currentPageMetrics.dataQuality}%</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600 mb-1">Actualización</div>
            <div className="text-lg font-bold text-gray-900">{currentPageMetrics.updateFrequency}%</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-700 mb-1">Fuentes de datos:</div>
          {currentPageMetrics.dataSources.slice(0, 2).map((source, idx) => {
            const updateStatus = getUpdateStatus(source);
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 truncate flex-1">{source.source}</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-${updateStatus.color}-600 bg-${updateStatus.color}-50`}>
                  {updateStatus.label}
                </span>
              </div>
            );
          })}
          {currentPageMetrics.dataSources.length > 2 && (
            <div className="text-xs text-gray-500">
              +{currentPageMetrics.dataSources.length - 2} más
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Última modificación: {new Date(currentPageMetrics.lastModified).toLocaleDateString('es-AR')}
        </div>
      </motion.div>
    );
  }

  // Full dashboard view
  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500">Score Global</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {globalStats.avgScore.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            Promedio de todas las páginas
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500">Calidad de Datos</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {globalStats.avgQuality.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            Verificación y completitud
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-orange-500" />
            <span className="text-sm text-gray-500">Frecuencia</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {globalStats.avgFrequency.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            Actualización regular
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-gray-500">Fuentes Totales</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {globalStats.totalSources}
          </div>
          <div className="text-sm text-gray-600">
            Documentos y datasets
          </div>
        </motion.div>
      </div>

      {/* Pages Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Eye className="w-6 h-6 text-blue-600" />
          Transparencia por Página
        </h3>
        <div className="space-y-4">
          {allPagesMetrics.map((page, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{page.pageName}</h4>
                  <p className="text-sm text-gray-600">{page.route}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getScoreIcon(page.overallScore)}
                  <div className={`px-4 py-2 rounded-lg text-lg font-bold ${getScoreColor(page.overallScore)}`}>
                    {page.overallScore.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Calidad</div>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-green-500 rounded-full"
                      style={{ width: `${page.dataQuality}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mt-1">{page.dataQuality}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Frecuencia</div>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                      style={{ width: `${page.updateFrequency}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mt-1">{page.updateFrequency}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Acceso</div>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-purple-500 rounded-full"
                      style={{ width: `${page.publicAccess}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mt-1">{page.publicAccess}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Documentación</div>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-orange-500 rounded-full"
                      style={{ width: `${page.documentation}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mt-1">{page.documentation}%</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Database className="w-3 h-3" />
                {page.dataSources.length} fuente{page.dataSources.length !== 1 ? 's' : ''} de datos
                <span className="mx-2">•</span>
                <Calendar className="w-3 h-3" />
                Actualizado {new Date(page.lastModified).toLocaleDateString('es-AR')}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Data Sources Detail */}
      {expandedView && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Download className="w-6 h-6 text-green-600" />
            Detalle de Fuentes de Datos
          </h3>
          <div className="space-y-6">
            {allPagesMetrics.map((page, pageIdx) => (
              <div key={pageIdx} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-3">{page.pageName}</h4>
                <div className="space-y-3">
                  {page.dataSources.map((source, sourceIdx) => {
                    const updateStatus = getUpdateStatus(source);
                    return (
                      <div key={sourceIdx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{source.source}</h5>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                              <span className="uppercase font-semibold">{source.type}</span>
                              <span>{source.records.toLocaleString()} registros</span>
                              {source.verified && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-3 h-3" />
                                  Verificado
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-${updateStatus.color}-600 bg-${updateStatus.color}-50`}>
                            {updateStatus.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          <div>
                            <div className="text-xs text-gray-600">Calidad</div>
                            <div className="text-sm font-bold text-gray-900">{source.quality}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Completitud</div>
                            <div className="text-sm font-bold text-gray-900">{source.completeness}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Última actualización</div>
                            <div className="text-sm font-bold text-gray-900">
                              {new Date(source.lastUpdate).toLocaleDateString('es-AR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Sistema de Meta-Transparencia</p>
            <p>
              Este sistema monitorea la calidad, actualización y accesibilidad de todos los datos publicados
              en el portal de transparencia, garantizando que la información sea confiable, actualizada y
              fácilmente accesible para la ciudadanía.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MetaTransparencyTracker;
