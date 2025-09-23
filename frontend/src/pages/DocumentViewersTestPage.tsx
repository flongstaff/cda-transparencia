/**
 * Document Viewers Test Page
 * Test page to verify all document viewer components work correctly with real GitHub resources
 */

import React, { useState } from 'react';
import {
  FileText,
  FileImage,
  Archive,
  Braces,
  FileSpreadsheet,
  Presentation,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
  Eye,
  Share2,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  GitBranch
} from 'lucide-react';
import { unifiedResourceService } from '../services/UnifiedResourceService';
import { DocumentMetadata, SupportedFileType } from '../types/documents';

interface TestResult {
  name: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
  duration: number;
}

const DocumentViewersTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Visor PDF', status: 'pending', duration: 0 },
    { name: 'Visor Markdown', status: 'pending', duration: 0 },
    { name: 'Visor de Imágenes', status: 'pending', duration: 0 },
    { name: 'Visor JSON', status: 'pending', duration: 0 },
    { name: 'Visor de Archivos', status: 'pending', duration: 0 },
    { name: 'Visor Office', status: 'pending', duration: 0 }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'failure'>('idle');

  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    const startTime = Date.now();
    
    // Update status to loading
    setTestResults(prev => prev.map(result => 
      result.name === testName 
        ? { ...result, status: 'loading', duration: 0 } 
        : result
    ));
    
    try {
      await testFunction();
      
      // Update status to success
      setTestResults(prev => prev.map(result => 
        result.name === testName 
          ? { ...result, status: 'success', message: 'Prueba exitosa', duration: Date.now() - startTime } 
          : result
      ));
    } catch (error) {
      // Update status to error
      setTestResults(prev => prev.map(result => 
        result.name === testName 
          ? { ...result, status: 'error', message: (error as Error).message, duration: Date.now() - startTime } 
          : result
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    
    // Reset all tests to pending
    setTestResults(prev => prev.map(result => ({ ...result, status: 'pending', duration: 0 })));
    
    // Run each test
    await Promise.all([
      runTest('Visor PDF', testPDFViewer),
      runTest('Visor Markdown', testMarkdownViewer),
      runTest('Visor de Imágenes', testImageViewer),
      runTest('Visor JSON', testJSONViewer),
      runTest('Visor de Archivos', testArchiveViewer),
      runTest('Visor Office', testOfficeViewer)
    ]);
    
    // Check overall status
    const failedTests = testResults.filter(r => r.status === 'error').length;
    setOverallStatus(failedTests === 0 ? 'success' : 'failure');
    setIsRunning(false);
  };

  const resetTests = () => {
    setTestResults(prev => prev.map(result => ({ ...result, status: 'pending', duration: 0 })));
    setOverallStatus('idle');
    setIsRunning(false);
  };

  // Test functions for each viewer
  const testPDFViewer = async () => {
    try {
      // Search for PDF documents
      const results = await unifiedResourceService.searchResources('.pdf');
      
      if (results.length === 0) {
        throw new Error('No se encontraron documentos PDF');
      }
      
      // Test fetching metadata for the first PDF
      const pdfDoc = results[0];
      const metadata = await unifiedResourceService.fetchDocumentMetadata(pdfDoc.relative_path);
      
      if (!metadata) {
        throw new Error('No se pudo obtener metadatos del documento PDF');
      }
      
      console.log('✅ PDF Viewer test passed:', metadata.title);
    } catch (error) {
      throw new Error(`Error en visor PDF: ${(error as Error).message}`);
    }
  };

  const testMarkdownViewer = async () => {
    try {
      // Search for Markdown documents
      const results = await unifiedResourceService.searchResources('.md');
      
      if (results.length === 0) {
        throw new Error('No se encontraron documentos Markdown');
      }
      
      // Test fetching content for the first Markdown file
      const mdDoc = results[0];
      const content = await unifiedResourceService.fetchText(mdDoc.relative_path);
      
      if (!content) {
        throw new Error('No se pudo obtener contenido del documento Markdown');
      }
      
      console.log('✅ Markdown Viewer test passed:', mdDoc.title);
    } catch (error) {
      throw new Error(`Error en visor Markdown: ${(error as Error).message}`);
    }
  };

  const testImageViewer = async () => {
    try {
      // Search for image documents
      const results = await unifiedResourceService.searchResources('.jpg');
      
      if (results.length === 0) {
        // Try other image formats
        const pngResults = await unifiedResourceService.searchResources('.png');
        if (pngResults.length === 0) {
          throw new Error('No se encontraron documentos de imagen');
        }
        results.push(...pngResults);
      }
      
      // Test fetching URL for the first image
      const imgDoc = results[0];
      const metadata = await unifiedResourceService.fetchDocumentMetadata(imgDoc.relative_path);
      
      if (!metadata || !metadata.url) {
        throw new Error('No se pudo obtener URL del documento de imagen');
      }
      
      console.log('✅ Image Viewer test passed:', imgDoc.title);
    } catch (error) {
      throw new Error(`Error en visor de imágenes: ${(error as Error).message}`);
    }
  };

  const testJSONViewer = async () => {
    try {
      // Search for JSON documents
      const results = await unifiedResourceService.searchResources('.json');
      
      if (results.length === 0) {
        throw new Error('No se encontraron documentos JSON');
      }
      
      // Test fetching JSON data for the first file
      const jsonDoc = results[0];
      const data = await unifiedResourceService.fetchJSON(jsonDoc.relative_path);
      
      if (!data) {
        throw new Error('No se pudo obtener datos JSON del documento');
      }
      
      console.log('✅ JSON Viewer test passed:', jsonDoc.title);
    } catch (error) {
      throw new Error(`Error en visor JSON: ${(error as Error).message}`);
    }
  };

  const testArchiveViewer = async () => {
    try {
      // Search for archive documents
      const results = await unifiedResourceService.searchResources('.zip');
      
      if (results.length === 0) {
        // Try other archive formats
        const rarResults = await unifiedResourceService.searchResources('.rar');
        if (rarResults.length === 0) {
          throw new Error('No se encontraron archivos comprimidos');
        }
        results.push(...rarResults);
      }
      
      // Test fetching metadata for the first archive
      const archiveDoc = results[0];
      const metadata = await unifiedResourceService.fetchDocumentMetadata(archiveDoc.relative_path);
      
      if (!metadata) {
        throw new Error('No se pudo obtener metadatos del archivo comprimido');
      }
      
      console.log('✅ Archive Viewer test passed:', archiveDoc.title);
    } catch (error) {
      throw new Error(`Error en visor de archivos: ${(error as Error).message}`);
    }
  };

  const testOfficeViewer = async () => {
    try {
      // Search for Office documents
      const results = await unifiedResourceService.searchResources('.docx');
      
      if (results.length === 0) {
        // Try other Office formats
        const xlsxResults = await unifiedResourceService.searchResources('.xlsx');
        if (xlsxResults.length === 0) {
          throw new Error('No se encontraron documentos de Office');
        }
        results.push(...xlsxResults);
      }
      
      // Test fetching metadata for the first Office document
      const officeDoc = results[0];
      const metadata = await unifiedResourceService.fetchDocumentMetadata(officeDoc.relative_path);
      
      if (!metadata) {
        throw new Error('No se pudo obtener metadatos del documento de Office');
      }
      
      console.log('✅ Office Viewer test passed:', officeDoc.title);
    } catch (error) {
      throw new Error(`Error en visor Office: ${(error as Error).message}`);
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h1 className="text-2xl font-bold text-white">Prueba de Visores de Documentos</h1>
          <p className="text-blue-100 mt-2">
            Verificación de todos los componentes de visualización de documentos con recursos reales de GitHub
          </p>
        </div>
        
        <div className="p-6">
          {/* Test Controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isRunning 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Ejecutando...' : 'Ejecutar todas las pruebas'}
            </button>
            
            <button
              onClick={resetTests}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </button>
            
            <a
              href="https://github.com/flongstaff/cda-transparencia"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              Ver Repositorio
            </a>
          </div>
          
          {/* Test Results Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">6</div>
              <div className="text-sm text-blue-600">Visores totales</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{passedTests}</div>
              <div className="text-sm text-green-600">Visores funcionales</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-700">{failedTests}</div>
              <div className="text-sm text-red-600">Visores con errores</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">{pendingTests}</div>
              <div className="text-sm text-gray-600">Visores pendientes</div>
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
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-semibold">Ejecutando pruebas...</p>
                  <p className="text-sm">Verificando integración con GitHub</p>
                </>
              )}
              {overallStatus === 'success' && (
                <>
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¡Todas las pruebas pasaron exitosamente!
                  </h3>
                  <p className="text-gray-600">
                    Los visores de documentos están correctamente integrados con GitHub
                  </p>
                </>
              )}
              {overallStatus === 'failure' && (
                <>
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Algunas pruebas fallaron
                  </h3>
                  <p className="text-gray-600">
                    Revise los resultados y corrija los problemas de integración
                  </p>
                </>
              )}
            </div>
          )}
          
          {/* Individual Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testResults.map((result, index) => (
              <div 
                key={result.name} 
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-4">
                  {index === 0 && <FileText className="w-8 h-8 text-red-500 mr-3" />}
                  {index === 1 && <FileText className="w-8 h-8 text-blue-500 mr-3" />}
                  {index === 2 && <FileImage className="w-8 h-8 text-green-500 mr-3" />}
                  {index === 3 && <Braces className="w-8 h-8 text-yellow-500 mr-3" />}
                  {index === 4 && <Archive className="w-8 h-8 text-purple-500 mr-3" />}
                  {index === 5 && <FileText className="w-8 h-8 text-blue-500 mr-3" />}
                  <h3 className="text-lg font-semibold text-gray-900">{result.name}</h3>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">
                  {index === 0 && 'Componente para visualizar documentos PDF con zoom, rotación y descarga'}
                  {index === 1 && 'Componente para visualizar documentos Markdown con resaltado de sintaxis'}
                  {index === 2 && 'Componente para visualizar imágenes con zoom y rotación'}
                  {index === 3 && 'Componente para visualizar documentos JSON con formato de árbol'}
                  {index === 4 && 'Componente para visualizar contenido de archivos comprimidos'}
                  {index === 5 && 'Componente para visualizar documentos de Office con aplicaciones recomendadas'}
                </p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>
                      {index === 0 && 'Soporte completo de PDF'}
                      {index === 1 && 'Renderizado de Markdown'}
                      {index === 2 && 'Soporte para JPG, PNG, GIF, SVG'}
                      {index === 3 && 'Vista de árbol y código fuente'}
                      {index === 4 && 'Soporte para ZIP, RAR, 7Z'}
                      {index === 5 && 'Soporte para DOC, XLS, PPT'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>
                      {index === 0 && 'Controles de zoom y rotación'}
                      {index === 1 && 'Resaltado de código'}
                      {index === 2 && 'Controles de zoom y rotación'}
                      {index === 3 && 'Resaltado de sintaxis'}
                      {index === 4 && 'Listado de contenido'}
                      {index === 5 && 'Recomendaciones de software'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>
                      {index === 0 && 'Descarga y compartir'}
                      {index === 1 && 'Vista de código fuente'}
                      {index === 2 && 'Vista a pantalla completa'}
                      {index === 3 && 'Búsqueda y filtrado'}
                      {index === 4 && 'Extracción de archivos'}
                      {index === 5 && 'Descarga directa'}
                    </span>
                  </div>
                </div>
                
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium border ${getStatusClass(result.status)}`}>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <span>
                      {result.status === 'pending' && 'Pendiente'}
                      {result.status === 'loading' && 'Ejecutando...'}
                      {result.status === 'success' && 'Éxito'}
                      {result.status === 'error' && 'Error'}
                    </span>
                  </div>
                  
                  {result.duration > 0 && (
                    <span className="text-xs">
                      {result.duration} ms
                    </span>
                  )}
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
              </div>
            ))}
          </div>

          {/* Test Results */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Resultados de Prueba
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">6</div>
                <div className="text-sm text-blue-600">Visores probados</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-700">{passedTests}</div>
                <div className="text-sm text-green-600">Visores funcionales</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-700">{failedTests}</div>
                <div className="text-sm text-red-600">Visores con errores</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-700">
                  {testResults.length > 0 
                    ? Math.round((passedTests / testResults.length) * 100) 
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Tasa de éxito</div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Instrucciones de Prueba
            </h3>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Haga clic en "Ejecutar todas las pruebas" para verificar el funcionamiento de todos los visores</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Los visores se conectan a recursos reales de GitHub para verificar compatibilidad</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>En caso de errores, revise los mensajes para identificar el problema</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Los resultados se muestran en tiempo real durante las pruebas</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewersTestPage;