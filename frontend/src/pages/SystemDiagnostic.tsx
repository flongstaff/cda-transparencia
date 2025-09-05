import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { integratedBackendService } from '../services/IntegratedBackendService';
import { unifiedDataService } from '../services/UnifiedDataService';
import { logError, logSuccess, logWarning } from '../utils/errorLogger';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: any;
  error?: any;
}

const SystemDiagnostic: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: any, error?: any) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      const newTest: TestResult = { name, status, message, details, error };
      
      if (existing) {
        return prev.map(t => t.name === name ? newTest : t);
      } else {
        return [...prev, newTest];
      }
    });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTests([]);
    
    const currentYear = new Date().getFullYear();
    
    // Test 1: IntegratedBackendService - System Health
    updateTest('IntegratedBackendService.getSystemHealth', 'loading', 'Testing system health...');
    try {
      const health = await integratedBackendService.getSystemHealth();
      updateTest('IntegratedBackendService.getSystemHealth', 'success', 'System health check passed', health);
      logSuccess('SystemDiagnostic', 'System health check passed', health);
    } catch (error) {
      updateTest('IntegratedBackendService.getSystemHealth', 'error', 'System health check failed', null, error);
      logError('SystemDiagnostic', 'System health check failed', error);
    }

    // Test 2: IntegratedBackendService - Statistics
    updateTest('IntegratedBackendService.getStatistics', 'loading', 'Testing statistics...');
    try {
      const stats = await integratedBackendService.getStatistics();
      updateTest('IntegratedBackendService.getStatistics', 'success', 'Statistics loaded successfully', stats);
      logSuccess('SystemDiagnostic', 'Statistics loaded', stats);
    } catch (error) {
      updateTest('IntegratedBackendService.getStatistics', 'error', 'Statistics loading failed', null, error);
      logError('SystemDiagnostic', 'Statistics loading failed', error);
    }

    // Test 3: IntegratedBackendService - Transparency Score
    updateTest('IntegratedBackendService.getTransparencyScore', 'loading', 'Testing transparency score...');
    try {
      const transparency = await integratedBackendService.getTransparencyScore(currentYear);
      updateTest('IntegratedBackendService.getTransparencyScore', 'success', 'Transparency score loaded', transparency);
      logSuccess('SystemDiagnostic', 'Transparency score loaded', transparency);
    } catch (error) {
      updateTest('IntegratedBackendService.getTransparencyScore', 'error', 'Transparency score failed', null, error);
      logError('SystemDiagnostic', 'Transparency score failed', error);
    }

    // Test 4: UnifiedDataService - Municipal Data
    updateTest('UnifiedDataService.getMunicipalData', 'loading', 'Testing municipal data...');
    try {
      const municipal = await unifiedDataService.getMunicipalData(currentYear);
      updateTest('UnifiedDataService.getMunicipalData', 'success', 'Municipal data loaded', municipal);
      logSuccess('SystemDiagnostic', 'Municipal data loaded', municipal);
    } catch (error) {
      updateTest('UnifiedDataService.getMunicipalData', 'error', 'Municipal data failed', null, error);
      logError('SystemDiagnostic', 'Municipal data failed', error);
    }

    // Test 5: UnifiedDataService - Yearly Data
    updateTest('UnifiedDataService.getYearlyData', 'loading', 'Testing yearly data...');
    try {
      const yearlyData = await unifiedDataService.getYearlyData(currentYear);
      updateTest('UnifiedDataService.getYearlyData', 'success', 'Yearly data loaded', yearlyData);
      logSuccess('SystemDiagnostic', 'Yearly data loaded', yearlyData);
    } catch (error) {
      updateTest('UnifiedDataService.getYearlyData', 'error', 'Yearly data failed', null, error);
      logError('SystemDiagnostic', 'Yearly data failed', error);
    }

    // Test 6: UnifiedDataService - Salaries
    updateTest('UnifiedDataService.getSalaries', 'loading', 'Testing salary data...');
    try {
      const salaries = await unifiedDataService.getSalaries(currentYear);
      updateTest('UnifiedDataService.getSalaries', 'success', 'Salary data loaded', salaries);
      logSuccess('SystemDiagnostic', 'Salary data loaded', salaries);
    } catch (error) {
      updateTest('UnifiedDataService.getSalaries', 'error', 'Salary data failed', null, error);
      logError('SystemDiagnostic', 'Salary data failed', error);
    }

    // Test 7: Environment Variables
    updateTest('Environment Variables', 'loading', 'Checking environment variables...');
    const envVars = {
      NODE_ENV: import.meta.env.NODE_ENV,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      BASE_URL: import.meta.env.BASE_URL
    };
    updateTest('Environment Variables', 'success', 'Environment variables checked', envVars);
    logSuccess('SystemDiagnostic', 'Environment variables', envVars);

    // Test 8: Network Connectivity
    updateTest('Network Connectivity', 'loading', 'Testing network connectivity...');
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      // Try multiple endpoints to test connectivity
      const endpoints = [
        `${API_BASE}/health`,
        `${API_BASE}/`,
        `${API_BASE.replace('/api', '')}/health`, // Try without /api
        'http://localhost:3001/health', // Direct port test
      ];
      
      let connected = false;
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
          
          const response = await fetch(endpoint, { 
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            updateTest('Network Connectivity', 'success', `Connected to ${endpoint}`, { 
              endpoint, 
              status: response.status 
            });
            connected = true;
            break;
          }
        } catch (err) {
          lastError = err;
          continue;
        }
      }
      
      if (!connected) {
        updateTest('Network Connectivity', 'warning', 
          'Backend server not running - using offline mode with fallback data', 
          { 
            mode: 'offline',
            endpoints_tested: endpoints,
            fallback_active: true
          });
        logWarning('SystemDiagnostic', 'Backend not available, using fallback data', { endpoints });
      }
      
    } catch (error) {
      updateTest('Network Connectivity', 'warning', 
        'No backend connection - application running in offline mode', 
        { 
          mode: 'offline', 
          fallback_active: true 
        });
      logWarning('SystemDiagnostic', 'Running in offline mode with fallback data', error);
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🔧 System Diagnostic</h1>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span>Success: {successCount}</span>
          </div>
          <div className="flex items-center">
            <XCircle className="w-4 h-4 text-red-500 mr-1" />
            <span>Errors: {errorCount}</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
            <span>Warnings: {warningCount}</span>
          </div>
        </div>
        
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Diagnostics Again'
          )}
        </button>
      </div>

      <div className="space-y-4">
        {tests.map((test, index) => (
          <div key={index} className={`p-4 border rounded-lg ${getStatusColor(test.status)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.status)}
                <div>
                  <h3 className="font-semibold text-gray-900">{test.name}</h3>
                  <p className="text-gray-600 text-sm">{test.message}</p>
                </div>
              </div>
            </div>
            
            {test.details && (
              <div className="mt-3 p-3 bg-gray-100 rounded text-xs">
                <strong>Details:</strong>
                <pre className="whitespace-pre-wrap mt-1">{JSON.stringify(test.details, null, 2)}</pre>
              </div>
            )}
            
            {test.error && (
              <div className="mt-3 p-3 bg-red-100 rounded text-xs text-red-800">
                <strong>Error:</strong>
                <pre className="whitespace-pre-wrap mt-1">{test.error.toString()}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemDiagnostic;