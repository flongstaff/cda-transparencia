import React, { useState, useEffect } from 'react';

const APITestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Test the API connection using the configured VITE_API_URL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        console.log('Testing API connection to:', apiUrl);
        
        // Test health endpoint
        const healthResponse = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (!healthResponse.ok) {
          throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
        }
        
        const healthData = await healthResponse.json();
        
        // Test external data endpoint
        const externalResponse = await fetch(`${apiUrl}/api/external/carmen-de-areco`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (!externalResponse.ok) {
          throw new Error(`External data fetch failed: ${externalResponse.status} ${externalResponse.statusText}`);
        }
        
        const externalData = await externalResponse.json();
        
        setTestResults({
          health: healthData,
          external: externalData,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('API Test Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Testing API connection...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 ml-2">API Connection Test Failed</h3>
        </div>
        <div className="mt-2 text-sm text-red-700">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">API Connection Test Results</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <svg className="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Connected
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Health Check</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2 font-medium">{testResults.health.status}</span>
            </div>
            <div>
              <span className="text-gray-500">Timestamp:</span>
              <span className="ml-2 font-medium">{new Date(testResults.health.timestamp).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Service:</span>
              <span className="ml-2 font-medium">{testResults.health.service}</span>
            </div>
            <div>
              <span className="text-gray-500">Version:</span>
              <span className="ml-2 font-medium">{testResults.health.version}</span>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">External Data</h4>
          <div className="text-sm">
            <p>Data successfully fetched from external sources</p>
            <p className="text-gray-500 mt-1">
              API is properly configured and CORS is working correctly
            </p>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-4">
          Last tested: {new Date(testResults.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default APITestComponent;