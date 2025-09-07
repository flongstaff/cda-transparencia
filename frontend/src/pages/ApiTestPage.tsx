import React, { useState, useEffect } from 'react';
import { unifiedDataService } from '../services';

interface TestResult {
  endpoint: string;
  status: 'loading' | 'success' | 'error' | 'empty';
  data?: any;
  error?: string;
  dataSize?: number;
}

const API_ENDPOINTS = [
  { name: 'Health Check', url: '/health', base: 'http://localhost:3001' },
  { name: 'Available Years', url: '/api/years', base: 'http://localhost:3001' },
  { name: 'Property Declarations', url: '/api/declarations', base: 'http://localhost:3001' },
  { name: 'Documents', url: '/api/documents', base: 'http://localhost:3001' },
  { name: 'Public Tenders', url: '/api/tenders', base: 'http://localhost:3001' },
  { name: 'Financial Reports', url: '/api/reports', base: 'http://localhost:3001' },
  { name: 'Treasury Movements', url: '/api/treasury', base: 'http://localhost:3001' },
  { name: 'Municipal Debt', url: '/api/debt', base: 'http://localhost:3001' },
  { name: 'Investment Assets', url: '/api/investments', base: 'http://localhost:3001' }
];

const ApiTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [workingData, setWorkingData] = useState<any[]>([]);

  const testEndpoint = async (endpoint: { name: string; url: string; base: string }): Promise<TestResult> => {
    try {
      const fullUrl = `${endpoint.base}${endpoint.url}`;
      console.log(`Testing: ${fullUrl}`);
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      const hasData = data && (
        (Array.isArray(data) && data.length > 0) ||
        (typeof data === 'object' && Object.keys(data).length > 0)
      );
      
      const dataSize = Array.isArray(data) ? data.length : Object.keys(data || {}).length;
      
      return {
        endpoint: endpoint.name,
        status: response.ok ? (hasData ? 'success' : 'empty') : 'error',
        data,
        dataSize
      };
    } catch (error) {
      return {
        endpoint: endpoint.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: TestResult[] = [];
    const working: any[] = [];

    for (const endpoint of API_ENDPOINTS) {
      const result = await testEndpoint(endpoint);
      results.push(result);
      setTestResults([...results]);
      
      if (result.status === 'success' && result.data) {
        working.push({
          name: result.endpoint,
          data: result.data,
          size: result.dataSize
        });
      }
      
      // Brief pause between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setWorkingData(working);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'empty': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'empty': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 API Testing Dashboard
          </h1>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className={`px-6 py-2 rounded-lg font-semibold ${
                isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRunning ? '🔄 Testing...' : '🚀 Run All Tests'}
            </button>
            
            <div className="text-sm text-gray-600 flex items-center">
              Total Endpoints: {API_ENDPOINTS.length} | 
              Tested: {testResults.length} | 
              Working: {testResults.filter(r => r.status === 'success').length}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📊 Test Results</h2>
            
            <div className="space-y-3">
              {API_ENDPOINTS.map((endpoint, index) => {
                const result = testResults[index];
                return (
                  <div key={endpoint.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold">{endpoint.name}</div>
                      <div className="text-sm text-gray-600">{endpoint.url}</div>
                    </div>
                    <div className={`text-right ${result ? getStatusColor(result.status) : 'text-gray-400'}`}>
                      <div className="text-2xl">{result ? getStatusIcon(result.status) : '⏸️'}</div>
                      {result && result.status === 'success' && (
                        <div className="text-xs">Size: {result.dataSize}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Working Data Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">✅ Working Endpoints Data</h2>
            
            {workingData.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No working endpoints with data found yet.
                <br />
                Run the tests to see available data.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {workingData.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-semibold text-green-600 mb-2">
                      {item.name} ({item.size} items)
                    </div>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(item.data, null, 2).substring(0, 300)}...
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Working', count: testResults.filter(r => r.status === 'success').length, color: 'text-green-600' },
              { label: 'Empty Data', count: testResults.filter(r => r.status === 'empty').length, color: 'text-yellow-600' },
              { label: 'Errors', count: testResults.filter(r => r.status === 'error').length, color: 'text-red-600' },
              { label: 'Total', count: testResults.length, color: 'text-blue-600' }
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-lg shadow p-4 text-center">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.count}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTestPage;