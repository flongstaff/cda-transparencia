/**
 * DataQualityReport Component
 * Displays data quality assessment reports
 * Following AAIP guidelines for transparency and data protection
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Database, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { monitoringService } from '../services/monitoringService';

interface DataQualityReportProps {
  datasetId?: string;
}

const DataQualityReport: React.FC<DataQualityReportProps> = ({ datasetId }) => {
  const [dataQualityReport, setDataQualityReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDataQualityReport = async () => {
      try {
        setLoading(true);
        const report = await monitoringService.getDataQualityReport(datasetId);
        setDataQualityReport(report);
      } catch (err) {
        console.error('Error loading data quality report:', err);
        setError('Error al cargar el informe de calidad de datos');
      } finally {
        setLoading(false);
      }
    };

    loadDataQualityReport();
  }, [datasetId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-700 dark:text-gray-300">Cargando informe de calidad de datos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!dataQualityReport) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="text-center py-8">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Sin datos de calidad disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {datasetId 
              ? `No hay informe de calidad para el conjunto de datos: ${datasetId}` 
              : 'No hay informe de calidad de datos disponible'}
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for quality dimensions chart
  const qualityDimensions = [
    { name: 'Completitud', score: dataQualityReport.latestAssessment.completeness.score, color: '#10B981' },
    { name: 'Precisión', score: dataQualityReport.latestAssessment.accuracy.score, color: '#3B82F6' },
    { name: 'Consistencia', score: dataQualityReport.latestAssessment.consistency.score, color: '#8B5CF6' },
    { name: 'Actualización', score: dataQualityReport.latestAssessment.timeliness.score, color: '#F59E0B' },
    { name: 'Unicidad', score: dataQualityReport.latestAssessment.uniqueness.score, color: '#EC4899' },
    { name: 'Validez', score: dataQualityReport.latestAssessment.validity.score, color: '#EF4444' },
    { name: 'Accesibilidad', score: dataQualityReport.latestAssessment.accessibility.score, color: '#06B6D4' }
  ];

  // Prepare data for historical trend chart
  const historicalTrend = dataQualityReport.historicalTrend || {
    trend: 'insufficient_data',
    overallChange: 0,
    dimensions: {}
  };

  // Determine trend icon and color
  const getTrendIndicator = () => {
    const change = historicalTrend.overallChange;
    if (change > 5) {
      return { icon: <TrendingUp className="h-4 w-4 text-green-500" />, text: 'Mejorando' };
    } else if (change < -5) {
      return { icon: <TrendingDown className="h-4 w-4 text-red-500" />, text: 'Declinando' };
    } else {
      return { icon: <Minus className="h-4 w-4 text-gray-500" />, text: 'Estable' };
    }
  };

  const trendIndicator = getTrendIndicator();

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Informe de Calidad de Datos
              </h3>
              {datasetId && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Conjunto de datos: {datasetId}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              dataQualityReport.latestAssessment.overallScore >= 90
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                : dataQualityReport.latestAssessment.overallScore >= 75
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}>
              {dataQualityReport.latestAssessment.overallScore >= 90 ? (
                <CheckCircle className="h-4 w-4 mr-1" />
              ) : dataQualityReport.latestAssessment.overallScore >= 75 ? (
                <AlertTriangle className="h-4 w-4 mr-1" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Calidad: {dataQualityReport.latestAssessment.overallScore}%
            </div>
          </div>
        </div>
        
        {/* Overall Quality Score */}
        <div className="mt-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Puntaje general de calidad</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {dataQualityReport.latestAssessment.overallScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
            <div 
              className={`h-3 rounded-full ${
                dataQualityReport.latestAssessment.overallScore >= 90
                  ? 'bg-green-500'
                  : dataQualityReport.latestAssessment.overallScore >= 75
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${dataQualityReport.latestAssessment.overallScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Quality Dimensions Chart */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            Dimensiones de Calidad
          </h4>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={qualityDimensions}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#6B7280" 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-dark-surface p-3 rounded-lg shadow-lg border border-gray-200 dark:border-dark-border">
                          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Puntaje: {payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="score" 
                  name="Puntaje" 
                  radius={[4, 4, 0, 0]}
                >
                  {qualityDimensions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Trend */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Tendencia Histórica
            </h4>
            <div className="flex items-center text-sm">
              {trendIndicator.icon}
              <span className="ml-1 text-gray-600 dark:text-gray-400">
                {trendIndicator.text}
              </span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {historicalTrend.overallChange > 0 ? '+' : ''}{historicalTrend.overallChange}%
              </span>
            </div>
          </div>
          
          {historicalTrend.trend !== 'insufficient_data' ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Mejorado', value: Math.max(0, historicalTrend.overallChange), color: historicalTrend.overallChange >= 0 ? '#10B981' : '#EF4444' },
                      { name: 'Sin cambio', value: 100 - Math.abs(historicalTrend.overallChange), color: '#9CA3AF' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Mejorado', value: Math.max(0, historicalTrend.overallChange), color: historicalTrend.overallChange >= 0 ? '#10B981' : '#EF4444' },
                      { name: 'Sin cambio', value: 100 - Math.abs(historicalTrend.overallChange), color: '#9CA3AF' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Datos insuficientes para mostrar tendencia histórica</p>
            </div>
          )}
        </div>

        {/* Issues and Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Issues */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
            <h5 className="font-medium text-red-800 dark:text-red-200 flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Problemas Detectados
            </h5>
            {dataQualityReport.latestAssessment.issues && dataQualityReport.latestAssessment.issues.length > 0 ? (
              <ul className="space-y-2">
                {dataQualityReport.latestAssessment.issues.map((issue: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-300">{issue.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-700 dark:text-green-300">No se detectaron problemas</p>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 flex items-center mb-3">
              <TrendingUp className="h-5 w-5 mr-2" />
              Recomendaciones
            </h5>
            {dataQualityReport.latestAssessment.recommendations && dataQualityReport.latestAssessment.recommendations.length > 0 ? (
              <ul className="space-y-2">
                {dataQualityReport.latestAssessment.recommendations.map((recommendation: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{recommendation.description}</span>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{recommendation.action}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-700 dark:text-green-300">Calidad óptima alcanzada</p>
              </div>
            )}
          </div>
        </div>

        {/* Last Assessed */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-dark-border pt-4">
          <p>Última evaluación: {new Date(dataQualityReport.lastAssessed).toLocaleDateString('es-AR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>

      {/* AAIP Compliance Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-t border-blue-200 dark:border-blue-700">
        <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
          <Database className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
          <span>Este informe sigue los estándares de calidad de datos recomendados por la AAIP</span>
        </div>
      </div>
    </div>
  );
};

export default DataQualityReport;