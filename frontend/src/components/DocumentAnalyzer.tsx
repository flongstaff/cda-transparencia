/**
 * DocumentAnalyzer Component
 * UI for analyzing documents with AI-powered classification and information extraction
 * Following AAIP guidelines for transparency and accessibility
 */

import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, FileText, Search, Download, AlertTriangle, CheckCircle, Clock, Eye, X, Loader2 } from 'lucide-react';
import { documentAnalysisService, DocumentAnalysisResult, DocumentCategory } from '../services/documentAnalysisService';

interface DocumentAnalyzerProps {
  onAnalysisComplete?: (result: DocumentAnalysisResult) => void;
  compact?: boolean;
}

const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({ onAnalysisComplete, compact = false }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load document categories on component mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await documentAnalysisService.getDocumentCategories();
        setDocumentCategories(categories);
      } catch (err) {
        console.error('Failed to load document categories:', err);
      }
    };

    loadCategories();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setAnalysisResult(null);
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no soportado. Por favor sube un archivo PDF, DOCX, TXT, CSV, XLS o XLSX.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. El tamaño máximo es de 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona un archivo para analizar.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await documentAnalysisService.analyzeDocument(selectedFile);
      setAnalysisResult(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      console.error('Document analysis error:', err);
      setError('Error al analizar el documento. Por favor inténtalo de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalyzer = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence > 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (compact) {
    return (
      <div className="relative">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
          }`}
          onClick={triggerFileInput}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
          />
          <Upload className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {selectedFile ? selectedFile.name : 'Haz clic o arrastra un documento aquí'}
          </p>
          {selectedFile && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>

        {selectedFile && (
          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={analyzeDocument}
              disabled={isAnalyzing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analizando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analizar
                </>
              )}
            </button>
            <button
              onClick={resetAnalyzer}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Limpiar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <FileText className="w-7 h-7 mr-3 text-blue-600" />
          Análisis Inteligente de Documentos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analiza documentos municipales para extraer información clave, clasificarlos automáticamente y generar resúmenes.
          <br />
          <span className="text-sm italic">
            Sigue las directrices de la AAIP para transparencia y protección de datos
          </span>
        </p>
      </div>

      {/* File Upload Area */}
      <div className="mb-8">
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-opacity-50' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
          }`}
          onClick={triggerFileInput}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {selectedFile ? selectedFile.name : 'Selecciona o arrastra un documento'}
          </p>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {selectedFile 
              ? `Tamaño: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
              : 'PDF, DOCX, TXT, CSV, XLS, XLSX (máx. 10MB)'}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            El documento no se almacena permanentemente y se procesa de forma segura
          </p>
        </div>

        {/* File info and actions */}
        {selectedFile && (
          <div className="mt-4 flex justify-between items-center bg-gray-50 dark:bg-dark-surface-alt p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium">{selectedFile.name}</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={analyzeDocument}
                disabled={isAnalyzing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analizar Documento
                  </>
                )}
              </button>
              <button
                onClick={resetAnalyzer}
                className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Error</h3>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Result */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Analizando documento...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            El sistema está procesando y extrayendo información del documento
          </p>
        </div>
      )}

      {analysisResult && !isAnalyzing && (
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Resultado del Análisis
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Análisis automático realizado por IA especializada
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex items-center mr-4 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(analysisResult.processingMetadata.processedAt).toLocaleString('es-AR')}
                </div>
                <button
                  onClick={resetAnalyzer}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Limpiar análisis"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Document Classification */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Clasificación del Documento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Categoría Identificada</h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analysisResult.summary.category}
                </p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Confianza:</span>
                  <span className={`font-medium ${getConfidenceColor(analysisResult.classification.confidence)}`}>
                    {Math.round(analysisResult.classification.confidence * 100)}%
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Análisis de IA</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <span className="font-medium">Método:</span> {analysisResult.aiProcessing.method}
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                  <span className="font-medium">Modelo:</span> {analysisResult.aiProcessing.model}
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                  <span className="font-medium">Explicable:</span> {analysisResult.aiProcessing.explainable ? 'Sí' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Key Information Extracted */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              Información Extraída
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Points */}
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Puntos Clave</h4>
                <ul className="space-y-2">
                  {analysisResult.summary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Financial Highlights */}
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Destacados Financieros</h4>
                {analysisResult.summary.financialHighlights.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisResult.summary.financialHighlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <FileText className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No se identificaron datos financieros clave</p>
                )}
              </div>
            </div>
            
            {/* Amounts and Dates */}
            {(analysisResult.extractedInformation.amounts.length > 0 || 
              analysisResult.extractedInformation.dates.length > 0) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysisResult.extractedInformation.amounts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Montos Identificados</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.extractedInformation.amounts.slice(0, 5).map((amount, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm"
                        >
                          {amount.value}
                        </span>
                      ))}
                      {analysisResult.extractedInformation.amounts.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                          +{analysisResult.extractedInformation.amounts.length - 5} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {analysisResult.extractedInformation.dates.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Fechas Identificadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.extractedInformation.dates.slice(0, 5).map((dateObj, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {dateObj.date}
                        </span>
                      ))}
                      {analysisResult.extractedInformation.dates.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                          +{analysisResult.extractedInformation.dates.length - 5} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transparency and Compliance */}
          <div className="p-6 bg-gray-50 dark:bg-dark-surface-alt">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Download className="h-5 w-5 mr-2 text-blue-600" />
              Transparencia del Proceso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-dark-border">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Procesamiento</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="block">IA: {analysisResult.compliance.aiProcessed ? 'Sí' : 'No'}</span>
                  <span className="block">Método: {analysisResult.compliance.aiMethod}</span>
                </p>
              </div>
              <div className="bg-white dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-dark-border">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Privacidad</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="block">Protección: {analysisResult.compliance.privacyCompliant ? 'Sí' : 'No'}</span>
                  <span className="block">Datos Sensibles: {analysisResult.extractedInformation.sensitive ? 'Sí' : 'No'}</span>
                </p>
              </div>
              <div className="bg-white dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-dark-border">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Cumplimiento</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="block">AAIP: {analysisResult.compliance.follows_AAIP_guidelines ? 'Sí' : 'No'}</span>
                  <span className="block">Revisión: {analysisResult.compliance.humanReviewRequired ? 'Requerida' : 'No'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Categories Info */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Categorías de Documentos
        </h3>
        <p className="text-blue-700 dark:text-blue-300 mb-4">
          El sistema clasifica documentos según las categorías definidas por la AAIP para transparencia activa:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentCategories.slice(0, 6).map((category, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-dark-border"
            >
              <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {category.keywords.slice(0, 3).map((keyword, kwIndex) => (
                  <span 
                    key={kwIndex} 
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;