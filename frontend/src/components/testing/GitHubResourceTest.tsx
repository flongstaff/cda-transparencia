/**
 * GitHub Resource Test Component
 * Component to test GitHub resource loading with real resources
 */

import React, { useState, useEffect } from 'react';
import { 
  Github, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  FileImage,
  Archive,
  Braces,
  FileSpreadsheet,
  Presentation,
  FileWord,
  ExternalLink,
  Download
} from 'lucide-react';
import { comprehensiveResourceLoader } from '../utils/comprehensiveResourceLoader';
import { DocumentMetadata, SupportedFileType } from '../types/documents';

interface TestResult {
  path: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
  data?: any;
  duration: number;
}

const GitHubResourceTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'failure'>('idle');

  // Test paths for different file types
  const testPaths: { path: string; type: SupportedFileType; description: string }[] = [
    { path: 'data/organized_documents/json/budget_data.json', type: 'json', description: 'Datos presupuestarios' },
    { path: 'data/organized_documents/md/README.md', type: 'md', description: 'Documento README' },
    { path: 'data/organized_documents/pdf/presupuesto-2024.pdf', type: 'pdf', description: 'Presupuesto anual' },
    { path: 'data/organized_documents/images/logo-municipal.png', type: 'png', description: 'Logo municipal' },
    { path: 'data/organized_documents/archives/documents.zip', type: 'zip', description: 'Archivos comprimidos' },
    { path: 'data/organized_documents/docs/informe-anual.docx', type: 'docx', description: 'Informe anual' },
    { path: 'data/organized_documents/spreadsheets/presupuesto.xlsx', type: 'xlsx', description: 'Presupuesto detallado' },
    { path: 'data/organized_documents/text/asistencia.txt', type: 'txt', description: 'Registro de asistencia' }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTestResults(testPaths.map(test => ({
      path: test.path,
      status: 'pending',
      description: test.description,
      duration: 0
    })));

    let allPassed = true;

    for (let i = 0; i < testPaths.length; i++) {
      const test = testPaths[i];
      const startTime = Date.now();

      // Update status to loading
      setTestResults(prev => prev.map((result, index) => 
        index === i ? { ...result, status: 'loading', duration: 0 } : result
      ));

      try {
        // Test document metadata loading
        const metadata = await comprehensiveResourceLoader.loadDocumentMetadata(test.path);
        
        if (!metadata) {
          throw new Error('No metadata returned');
        }

        // Test document content loading
        const content = await comprehensiveResourceLoader.loadDocumentContent(test.path, test.type);
        
        if (!content) {
          throw new Error('No content returned');
        }

        // Calculate duration
        const duration = Date.now() - startTime;

        // Update status to success
        setTestResults(prev => prev.map((result, index) => 
          index === i ? { 
            ...result, 
            status: 'success', 
            message: 'Documento cargado correctamente',
            data: { metadata, content },
            duration
          } : result
        ));
      } catch (error) {
        allPassed = false;
        const duration = Date.now() - startTime;

        // Update status to error
        setTestResults(prev => prev.map((result, index) => 
          index === i ? { 
            ...result, 
            status: 'error', 
            message: (error as Error).message,
            duration
          } : result
        ));
      }
    }

    setIsRunning(false);
    setOverallStatus(allPassed ? 'success' : 'failure');
  };

  const resetTests = () => {
    setTestResults([]);
    setOverallStatus('idle');
  };

  const getFileIcon = (type: SupportedFileType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'md':
      case 'markdown':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <FileImage className="w-5 h-5 text-green-500" />;
      case 'json':
        return <Braces className="w-5 h-5 text-yellow-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="w-5 h-5 text-purple-500" />;
      case 'doc':
      case 'docx':
        return <FileWord className="w-5 h-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="w-5 h-5 text-orange-500" />;
      case 'txt':
      case 'csv':
        return <FileText className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: 'pending' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusClass = (status: 'pending' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const passedTests = testResults.filter(r => r.status === 'success').length;
  const failedTests = testResults.filter(r => r.status === 'error').length;
  const pendingTests = testResults.filter(r => r.status === 'pending' || r.status === 'loading').length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Github className="w-6 h-6 mr-2" />
            Prueba de Recursos de GitHub
          </h1>
          <p className="text-blue-100 mt-2">
            Verificación de carga de recursos desde el repositorio de GitHub
          </p>
        </div>
        
        <div className="p-6">
          {/* Test Controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isRunning 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Ejecutando...' : 'Ejecutar pruebas'}
            </button>
            
            <button
              onClick={resetTests}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </button>
          </div>
          
          {/* Test Results Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{testPaths.length}</div>
              <div className="text-sm text-blue-600">Total de pruebas</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{passedTests}</div>
              <div className="text-sm text-green-600">Pruebas exitosas</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-700">{failedTests}</div>
              <div className="text-sm text-red-600">Pruebas fallidas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">{pendingTests}</div>
              <div className="text-sm text-gray-600">Pruebas pendientes</div>
            </div>
          </div>
          
          {/* Overall Status */}
          {overallStatus !== 'idle' && (
            <div className={`mb-6 p-4 rounded-lg border text-center ${
              overallStatus === 'running' ? 'bg-blue-50 border-blue-200 text-blue-700' :
              overallStatus === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
              'bg-red-50 border-red-200 text-red-700'
            }`}>
              {overallStatus === 'running' && (
                <>
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
                  <p className="font-medium">Ejecutando pruebas...</p>
                </>
              )}
              {overallStatus === 'success' && (
                <>
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">¡Todas las pruebas pasaron exitosamente!</p>
                </>
              )}
              {overallStatus === 'failure' && (
                <>
                  <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className="font-medium">Algunas pruebas fallaron. Revise los resultados.</p>
                </>
              )}
            </div>
          )}
          
          {/* Test Results */}
          <div className="space-y-4">
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Github className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>Haga clic en "Ejecutar pruebas" para comenzar</p>
              </div>
            ) : (
              testResults.map((result, index) => {
                const test = testPaths[index];
                return (
                  <div 
                    key={result.path} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getFileIcon(test.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{test.description}</h3>
                          <p className="text-sm text-gray-500 mt-1">{result.path}</p>
                          {result.data?.metadata && (
                            <div className="mt-2 text-xs text-gray-500">
                              <p>Título: {result.data.metadata.title}</p>
                              <p>Tamaño: {result.data.metadata.size_mb} MB</p>
                              <p>Modificado: {new Date(result.data.metadata.processing_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(result.status)}`}>
                        {getStatusIcon(result.status)}
                        <span className="capitalize">
                          {result.status === 'loading' ? 'Cargando...' :
                           result.status === 'success' ? 'Éxito' :
                           result.status === 'error' ? 'Error' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    
                    {result.message && (
                      <div className={`mt-3 p-3 rounded-lg text-sm ${
                        result.status === 'error'
                          ? 'bg-red-50 border border-red-200 text-red-700'
                          : 'bg-green-50 border border-green-200 text-green-700'
                      }`}>
                        <p>{result.message}</p>
                      </div>
                    )}
                    
                    {result.data && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={result.data.metadata?.url || result.data.metadata?.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center text-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Ver en GitHub
                        </a>
                        
                        <a
                          href={result.data.metadata?.url || result.data.metadata?.official_url}
                          download={result.data.metadata?.filename}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center text-sm"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Descargar
                        </a>
                      </div>
                    )}
                    
                    {result.duration > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Tiempo: {result.duration} ms
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubResourceTest;