/**
 * DocumentAnalysisPage Component
 * Main page for document analysis functionality
 */

import React, { useState } from 'react';
import DocumentAnalyzer from '../components/DocumentAnalyzer';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useMasterData } from '../hooks/useMasterData';
import { BarChart3, PieChart, FileText, TrendingUp, Database, AlertTriangle } from 'lucide-react';
import { ChartContainer } from '../components/common/ChartContainer';
import UnifiedChart from '../components/charts/UnifiedChart';
import DocumentAnalysisChart from '../components/charts/DocumentAnalysisChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';

const DocumentAnalysisPage: React.FC = () => {
  const { data, loading, error } = useMasterData();
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResults(result);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
            <FileText className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
            Análisis de Documentos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-dark-text-secondary">
            Clasificación automatizada y extracción de información de documentos municipales
          </p>
        </div>

        {/* Document Analyzer */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6 mb-8">
          <DocumentAnalyzer onAnalysisComplete={handleAnalysisComplete} />
        </div>

        {/* Analysis Results Visualization */}
        {analysisResults && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-dark-text-tertiary">Documento Analizado</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {analysisResults.fileName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                    <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-dark-text-tertiary">Categoría Detectada</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {analysisResults.category}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-dark-text-tertiary">Confianza</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {(analysisResults.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution Chart */}
              <ChartContainer
                title="Distribución por Categoría"
                description="Clasificación de documentos por tipo"
                icon={PieChart}
                height={350}
              >
                <UnifiedChart
                  type="document_categories"
                  year={new Date().getFullYear()}
                  title="Categorías de Documentos"
                  height={300}
                />
              </ChartContainer>

              {/* Confidence Analysis Chart */}
              <ChartContainer
                title="Análisis de Confianza"
                description="Nivel de confianza en la clasificación"
                icon={BarChart3}
                height={350}
              >
                <DocumentAnalysisChart
                  type="confidence_analysis"
                  year={new Date().getFullYear()}
                  height={300}
                />
              </ChartContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Processing Trends */}
              <ChartContainer
                title="Tendencias de Procesamiento"
                description="Histórico de documentos analizados"
                icon={TrendingUp}
                height={350}
              >
                <TimeSeriesChart
                  type="document_processing"
                  year={null}
                  title="Documentos Procesados"
                  height={300}
                />
              </ChartContainer>

              {/* Data Quality Analysis */}
              <ChartContainer
                title="Análisis de Calidad de Datos"
                description="Integridad y verificación de documentos"
                icon={AlertTriangle}
                height={350}
              >
                <DocumentAnalysisChart
                  type="data_quality"
                  year={new Date().getFullYear()}
                  height={300}
                />
              </ChartContainer>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                Resultados Detallados del Análisis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-3">Entidades Extraídas</h4>
                  <ul className="space-y-2">
                    {analysisResults.extractedEntities?.map((entity: any, index: number) => (
                      <li key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-dark-background rounded">
                        <span className="text-gray-700 dark:text-dark-text-secondary">{entity.text}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                          {entity.type}
                        </span>
                      </li>
                    )) || <li className="text-gray-500 dark:text-dark-text-tertiary">No se encontraron entidades</li>}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-3">Palabras Clave Detectadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.keywords?.map((keyword: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-full">
                        {keyword}
                      </span>
                    )) || <span className="text-gray-500 dark:text-dark-text-tertiary">No se encontraron palabras clave</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Processing Statistics */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">
            Estadísticas de Procesamiento de Documentos
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartContainer
              title="Tipos de Documentos"
              description="Distribución por formato de archivo"
              icon={FileText}
              height={300}
            >
              <UnifiedChart
                type="document_types"
                year={new Date().getFullYear()}
                height={250}
              />
            </ChartContainer>
            
            <ChartContainer
              title="Categorías Principales"
              description="Clasificación por categoría de contenido"
              icon={Database}
              height={300}
            >
              <UnifiedChart
                type="document_categories_pie"
                year={new Date().getFullYear()}
                height={250}
              />
            </ChartContainer>
            
            <ChartContainer
              title="Precisión de Análisis"
              description="Historial de precisión en clasificaciones"
              icon={TrendingUp}
              height={300}
            >
              <DocumentAnalysisChart
                type="accuracy_history"
                year={new Date().getFullYear()}
                height={250}
              />
            </ChartContainer>
          </div>
        </div>

        {/* Comprehensive Document Analysis */}
        <ChartContainer
          title="Análisis Integral de Documentos"
          description="Visión completa del procesamiento y análisis de documentos"
          icon={Database}
          height={450}
          className="mt-8"
        >
          <UnifiedChart
            type="comprehensive_document_analysis"
            year={new Date().getFullYear()}
            title="Análisis Integral"
            height={400}
          />
        </ChartContainer>
      </div>
    </div>
  );
};


// Wrap with error boundary for production safety
const DocumentAnalysisPageWithErrorBoundary: React.FC = () => {
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
      <DocumentAnalysisPage />
    </ErrorBoundary>
  );
};

export default DocumentAnalysisPageWithErrorBoundary;