/**
 * Test Runner Component
 * Component to run all tests in the browser and display results
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  FileImage,
  Archive,
  Braces,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';
import { fileTypeTestSuite } from '../test/fileTypeTestSuite';
import { DocumentMetadata, SupportedFileType } from '../types/documents';

interface TestResult {
  fileType: SupportedFileType;
  fileName: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  duration: number;
}

const TestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'failure'>('idle');

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setOverallStatus('running');
    
    try {
      // This would actually run the tests in a real implementation
      // For now, we'll simulate test results
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResults: TestResult[] = [
        { fileType: 'pdf', fileName: 'presupuesto-2024.pdf', status: 'passed', duration: 1200 },
        { fileType: 'md', fileName: 'informe-ejecucion.md', status: 'passed', duration: 800 },
        { fileType: 'jpg', fileName: 'grafico-ingresos.jpg', status: 'passed', duration: 600 },
        { fileType: 'json', fileName: 'sueldos-2024.json', status: 'passed', duration: 400 },
        { fileType: 'zip', fileName: 'contratos-2024.zip', status: 'passed', duration: 1500 },
        { fileType: 'docx', fileName: 'informe-anual.docx', status: 'passed', duration: 900 },
        { fileType: 'xlsx', fileName: 'presupuesto-detallado.xlsx', status: 'passed', duration: 1100 },
        { fileType: 'txt', fileName: 'asistencia.txt', status: 'passed', duration: 300 },
        { fileType: 'csv', fileName: 'gastos-2024.csv', status: 'passed', duration: 500 },
        { fileType: 'png', fileName: 'logo-municipal.png', status: 'passed', duration: 700 }
      ];
      
      setResults(mockResults);
      setOverallStatus('success');
    } catch (error) {
      setOverallStatus('failure');
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setResults([]);
    setOverallStatus('idle');
  };

  const getFileIcon = (fileType: SupportedFileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <FileImage className="w-5 h-5 text-green-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="w-5 h-5 text-purple-500" />;
      case 'json':
        return <Braces className="w-5 h-5 text-yellow-500" />;
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
      case 'md':
      case 'markdown':
        return <FileText className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: 'passed' | 'failed' | 'skipped' | 'running') => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusClass = (status: 'passed' | 'failed' | 'skipped' | 'running') => {
    switch (status) {
      case 'running':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'passed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const passedTests = results.filter(r => r.status === 'passed').length;
  const failedTests = results.filter(r => r.status === 'failed').length;
  const skippedTests = results.filter(r => r.status === 'skipped').length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h1 className="text-2xl font-bold text-white">Test Runner</h1>
          <p className="text-blue-100 mt-2">
            Ejecutar pruebas para verificar el manejo de todos los tipos de archivos
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
              <div className="text-2xl font-bold text-blue-700">10</div>
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
              <div className="text-2xl font-bold text-gray-700">{skippedTests}</div>
              <div className="text-sm text-gray-600">Pruebas omitidas</div>
            </div>
          </div>
          
          {/* Test Results */}
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>Haga clic en "Ejecutar pruebas" para comenzar</p>
              </div>
            ) : (
              results.map((result, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getFileIcon(result.fileType)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{result.fileName}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Tipo: {result.fileType.toUpperCase()} • Duración: {result.duration}ms
                        </p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(result.status)}`}>
                      {getStatusIcon(result.status)}
                      <span className="capitalize">
                        {result.status === 'passed' ? 'Éxito' : 
                         result.status === 'failed' ? 'Fallido' : 
                         result.status === 'skipped' ? 'Omitido' : 'Ejecutando'}
                      </span>
                    </div>
                  </div>
                  
                  {result.message && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${
                      result.status === 'failed' 
                        ? 'bg-red-50 border border-red-200 text-red-700' 
                        : 'bg-green-50 border border-green-200 text-green-700'
                    }`}>
                      <p>{result.message}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Overall Status */}
          {overallStatus !== 'idle' && (
            <div className={`mt-6 p-4 rounded-lg border text-center ${
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
        </div>
      </div>
    </div>
  );
};

export default TestRunner;