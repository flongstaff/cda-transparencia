/**
 * File Type Testing Component
 * Component to test all file type handling with real GitHub resources
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileImage, 
  Archive, 
  Braces, 
  FileSpreadsheet,
  Presentation,
  FileWord,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { unifiedResourceService } from '../services/UnifiedResourceService';
import { DocumentMetadata, SupportedFileType } from '../types/documents';

// Test file configurations
const TEST_FILES: { path: string; type: SupportedFileType; description: string }[] = [
  { path: 'data/pdf_extracts/2024/ORDENANZA-3200-24-PRESUPUESTO-2024.pdf', type: 'pdf', description: 'PDF Document' },
  { path: 'data/organized_documents/2024/Resoluciones/Resolucion-2024-001.md', type: 'md', description: 'Markdown Document' },
  { path: 'data/organized_documents/2024/Imagenes/logo-municipal.png', type: 'png', description: 'PNG Image' },
  { path: 'data/organized_documents/2024/Datos/empleados.json', type: 'json', description: 'JSON Data' },
  { path: 'data/organized_documents/2024/Documentos/archivo-comprimido.zip', type: 'zip', description: 'ZIP Archive' },
  { path: 'data/organized_documents/2024/Documentos/informe-anual.docx', type: 'docx', description: 'Word Document' },
  { path: 'data/organized_documents/2024/Documentos/presupuesto.xlsx', type: 'xlsx', description: 'Excel Spreadsheet' },
  { path: 'data/organized_documents/2024/Documentos/presentacion.pptx', type: 'pptx', description: 'PowerPoint Presentation' },
  { path: 'data/organized_documents/2024/Documentos/informe.txt', type: 'txt', description: 'Text File' },
  { path: 'data/organized_documents/2024/Documentos/datos.csv', type: 'csv', description: 'CSV Data' }
];

// Test result interface
interface TestResult {
  path: string;
  type: SupportedFileType;
  description: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
  metadata?: DocumentMetadata;
}

const FileTypeTesting: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>(TEST_FILES.map(file => ({
    ...file,
    status: 'pending'
  })));
  const [isTesting, setIsTesting] = useState(false);
  const [testSummary, setTestSummary] = useState({
    total: TEST_FILES.length,
    passed: 0,
    failed: 0,
    pending: TEST_FILES.length
  });

  // Run tests
  const runTests = async () => {
    setIsTesting(true);
    setTestResults(TEST_FILES.map(file => ({
      ...file,
      status: 'loading'
    })));
    
    setTestSummary({
      total: TEST_FILES.length,
      passed: 0,
      failed: 0,
      pending: TEST_FILES.length
    });

    // Test each file sequentially
    for (let i = 0; i < TEST_FILES.length; i++) {
      const file = TEST_FILES[i];
      
      try {
        // Update status to loading
        setTestResults(prev => prev.map((result, index) => 
          index === i ? { ...result, status: 'loading' } : result
        ));
        
        // Fetch document metadata
        const metadata = await unifiedResourceService.fetchDocumentMetadata(file.path);
        
        if (metadata) {
          // Update with success
          setTestResults(prev => prev.map((result, index) => 
            index === i ? { ...result, status: 'success', metadata } : result
          ));
          
          // Update summary
          setTestSummary(prev => ({
            ...prev,
            passed: prev.passed + 1,
            pending: prev.pending - 1
          }));
        } else {
          // Update with error
          setTestResults(prev => prev.map((result, index) => 
            index === i ? { ...result, status: 'error', message: 'Metadata not found' } : result
          ));
          
          // Update summary
          setTestSummary(prev => ({
            ...prev,
            failed: prev.failed + 1,
            pending: prev.pending - 1
          }));
        }
      } catch (error) {
        // Update with error
        setTestResults(prev => prev.map((result, index) => 
          index === i ? { 
            ...result, 
            status: 'error', 
            message: (error as Error).message || 'Unknown error' 
          } : result
        ));
        
        // Update summary
        setTestSummary(prev => ({
          ...prev,
          failed: prev.failed + 1,
          pending: prev.pending - 1
        }));
      }
    }
    
    setIsTesting(false);
  };

  // Reset tests
  const resetTests = () => {
    setTestResults(TEST_FILES.map(file => ({
      ...file,
      status: 'pending'
    })));
    
    setTestSummary({
      total: TEST_FILES.length,
      passed: 0,
      failed: 0,
      pending: TEST_FILES.length
    });
  };

  // Get icon for file type
  const getFileIcon = (type: SupportedFileType) => {
    switch (type) {
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

  // Get status icon
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get status text
  const getStatusText = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return 'Testing...';
      case 'success':
        return 'Passed';
      case 'error':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  // Get status class
  const getStatusClass = (status: TestResult['status']) => {
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h1 className="text-2xl font-bold text-white">File Type Testing</h1>
          <p className="text-blue-100 mt-2">
            Testing all file type handling with real GitHub resources
          </p>
        </div>
        
        <div className="p-6">
          {/* Test Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{testSummary.total}</div>
              <div className="text-sm text-blue-600">Total Tests</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{testSummary.passed}</div>
              <div className="text-sm text-green-600">Passed</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-700">{testSummary.failed}</div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">{testSummary.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
          
          {/* Test Controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={runTests}
              disabled={isTesting}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isTesting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isTesting ? 'Testing...' : 'Run All Tests'}
            </button>
            
            <button
              onClick={resetTests}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Reset Tests
            </button>
          </div>
          
          {/* Test Results */}
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getFileIcon(result.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{result.description}</h3>
                      <p className="text-sm text-gray-500 mt-1">{result.path}</p>
                      {result.metadata && (
                        <div className="mt-2 text-xs text-gray-500">
                          <p>Size: {result.metadata.size_mb} MB</p>
                          <p>Modified: {new Date(result.metadata.processing_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(result.status)}`}>
                    {getStatusIcon(result.status)}
                    <span>{getStatusText(result.status)}</span>
                  </div>
                </div>
                
                {result.message && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{result.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileTypeTesting;