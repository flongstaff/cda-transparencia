/**
 * Data Connectivity Test Component
 * Tests all data sources to ensure they're working properly
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Database, AlertTriangle } from 'lucide-react';
import { useMasterData } from '../../hooks/useMasterData';
import { useMultiYearData } from '../../hooks/useMultiYearData';
import { useUnifiedData } from '../../hooks/useUnifiedData';

interface TestResult {
  service: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  data?: any;
}

const DataConnectivityTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test hooks
  const masterDataTest = useMasterData(2024);
  const multiYearTest = useMultiYearData({ autoLoad: false });
  const unifiedDataTest = useUnifiedData({ page: 'budget', year: 2024, autoRefresh: false });

  const runConnectivityTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests: TestResult[] = [
      {
        service: 'Master Data Service',
        status: 'loading',
        message: 'Testing master data connection...'
      },
      {
        service: 'Multi-Year Data Service',
        status: 'loading',
        message: 'Testing multi-year data connection...'
      },
      {
        service: 'Unified Data Service',
        status: 'loading',
        message: 'Testing unified data connection...'
      },
      {
        service: 'CSV Files Access',
        status: 'loading',
        message: 'Testing CSV files access...'
      },
      {
        service: 'JSON API Access',
        status: 'loading',
        message: 'Testing JSON API access...'
      }
    ];

    setTestResults([...tests]);

    // Test Master Data Service
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Give time for hook to load
      if (masterDataTest.masterData || !masterDataTest.loading) {
        tests[0] = {
          service: 'Master Data Service',
          status: masterDataTest.error ? 'error' : 'success',
          message: masterDataTest.error || `Loaded ${masterDataTest.totalDocuments} documents`,
          data: masterDataTest.masterData
        };
      }
    } catch (error) {
      tests[0] = {
        service: 'Master Data Service',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Test Multi-Year Data Service
    try {
      if (multiYearTest.summary || !multiYearTest.loading) {
        tests[1] = {
          service: 'Multi-Year Data Service',
          status: multiYearTest.error ? 'error' : 'success',
          message: multiYearTest.error || `Loaded ${multiYearTest.summary?.totalDataPoints || 0} data points`,
          data: multiYearTest.summary
        };
      }
    } catch (error) {
      tests[1] = {
        service: 'Multi-Year Data Service',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Test Unified Data Service
    try {
      if (unifiedDataTest.data || !unifiedDataTest.loading) {
        tests[2] = {
          service: 'Unified Data Service',
          status: unifiedDataTest.error ? 'error' : 'success',
          message: unifiedDataTest.error || `Loaded budget data for ${unifiedDataTest.availableYears?.length || 0} years`,
          data: unifiedDataTest.data
        };
      }
    } catch (error) {
      tests[2] = {
        service: 'Unified Data Service',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Test CSV Files Access
    try {
      const csvResponse = await fetch('/data/charts/Budget_Execution_consolidated_2019-2025.csv');
      tests[3] = {
        service: 'CSV Files Access',
        status: csvResponse.ok ? 'success' : 'error',
        message: csvResponse.ok ? 'CSV files accessible' : `HTTP ${csvResponse.status}`
      };
    } catch (error) {
      tests[3] = {
        service: 'CSV Files Access',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Test JSON API Access
    try {
      const jsonResponse = await fetch('/api/index.json');
      tests[4] = {
        service: 'JSON API Access',
        status: jsonResponse.ok ? 'success' : 'error',
        message: jsonResponse.ok ? 'JSON API accessible' : `HTTP ${jsonResponse.status}`
      };
    } catch (error) {
      tests[4] = {
        service: 'JSON API Access',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    setTestResults([...tests]);
    setIsRunning(false);
  };

  useEffect(() => {
    runConnectivityTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'loading':
        return <Clock className="w-5 h-5 text-yellow-600 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'loading':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const successCount = testResults.filter(t => t.status === 'success').length;
  const errorCount = testResults.filter(t => t.status === 'error').length;
  const loadingCount = testResults.filter(t => t.status === 'loading').length;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Database className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            Data Connectivity Test
          </h3>
        </div>
        <button
          onClick={runConnectivityTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isRunning ? 'Testing...' : 'Retest'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            {testResults.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary">Total Tests</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{successCount}</div>
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary">Successful</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary">Failed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{loadingCount}</div>
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary">Running</div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        {testResults.map((test, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getStatusColor(test.status)} transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(test.status)}
                <div className="ml-3">
                  <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                    {test.service}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                    {test.message}
                  </div>
                </div>
              </div>
              {test.data && (
                <div className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                  Data loaded
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Status */}
      <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-dark-surface-alt">
        <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
          <strong>Overall Status:</strong> {errorCount === 0 ? '✅ All systems operational' :
            errorCount < testResults.length ? '⚠️ Some systems have issues' : '❌ Multiple system failures'}
        </div>
        {errorCount > 0 && (
          <div className="text-sm text-red-600 mt-2">
            Please check the failed services and ensure all data files are accessible.
          </div>
        )}
      </div>
    </div>
  );
};

export default DataConnectivityTest;