/**
 * Data Verification Page - Test all data from 2018 to today
 * This page verifies that all financial and transparency data is accessible
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, DollarSign, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';
import ErrorBoundary from '@components/common/ErrorBoundary';

const DataVerificationPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [verificationResults, setVerificationResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'warning' | 'error'>('pending');

  // Use unified master data service
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    currentDebt,
    loading: dataLoading,
    error,
    totalDocuments,
    availableYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // Verify data for all years from 2018 to today
  useEffect(() => {
    const verifyAllYearsData = async () => {
      setLoading(true);
      const results = [];
      
      // Test all years from 2018 to current year
      for (let year = 2018; year <= new Date().getFullYear(); year++) {
        try {
          // Switch to the year and wait for data
          await switchYear(year);
          
          // Wait a bit for data to load
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Check if data is available for this year
          const hasBudgetData = currentBudget && (currentBudget.total_budget || currentBudget.totalBudget);
          const hasDocuments = currentDocuments && currentDocuments.length > 0;
          const hasContracts = currentContracts && currentContracts.length > 0;
          const hasSalaries = currentSalaries && currentSalaries.length > 0;
          const hasTreasury = currentTreasury && Object.keys(currentTreasury).length > 0;
          const hasDebt = currentDebt && Object.keys(currentDebt).length > 0;
          
          const allDataAvailable = hasBudgetData && hasDocuments && hasContracts && hasSalaries && hasTreasury && hasDebt;
          
          results.push({
            year,
            status: allDataAvailable ? 'success' : 'warning',
            details: {
              budget: hasBudgetData,
              documents: hasDocuments,
              contracts: hasContracts,
              salaries: hasSalaries,
              treasury: hasTreasury,
              debt: hasDebt,
              total_items: (currentDocuments?.length || 0) + (currentContracts?.length || 0) + (currentSalaries?.length || 0)
            },
            message: allDataAvailable 
              ? '✅ All data available' 
              : '⚠️ Some data missing or incomplete'
          });
        } catch (error) {
          results.push({
            year,
            status: 'error',
            details: {},
            message: `❌ Error loading data: ${(error as Error).message}`
          });
        }
      }
      
      setVerificationResults(results);
      
      // Determine overall status
      const hasErrors = results.some(r => r.status === 'error');
      const hasWarnings = results.some(r => r.status === 'warning');
      
      if (hasErrors) {
        setOverallStatus('error');
      } else if (hasWarnings) {
        setOverallStatus('warning');
      } else {
        setOverallStatus('success');
      }
      
      setLoading(false);
    };

    if (!dataLoading) {
      verifyAllYearsData();
    }
  }, [dataLoading]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <XCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Data Verification - Complete Historical Coverage
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Verifying data availability from 2018 to {new Date().getFullYear()}
        </p>
      </div>

      {/* Overall Status */}
      <div className={`mb-8 p-6 rounded-xl border ${
        overallStatus === 'success' ? 'bg-green-50 border-green-200' :
        overallStatus === 'warning' ? 'bg-yellow-50 border-yellow-200' :
        overallStatus === 'error' ? 'bg-red-50 border-red-200' :
        'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center">
          {getStatusIcon(overallStatus)}
          <div className="ml-4">
            <h2 className="text-xl font-semibold">
              {overallStatus === 'success' && '🎉 All Data Verified Successfully!'}
              {overallStatus === 'warning' && '⚠️ Some Data Issues Detected'}
              {overallStatus === 'error' && '❌ Critical Data Errors Found'}
              {overallStatus === 'pending' && '🔍 Verifying Data Availability...'}
            </h2>
            <p className="mt-1 text-gray-600">
              {overallStatus === 'success' && 'Complete data coverage from 2018 to present confirmed'}
              {overallStatus === 'warning' && 'Some years have incomplete data'}
              {overallStatus === 'error' && 'Critical errors in data loading'}
              {overallStatus === 'pending' && 'Checking all years and data sources...'}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Verifying data for all years 2018-{new Date().getFullYear()}...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verificationResults.map((result) => (
            <div 
              key={result.year}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">📅 {result.year}</h3>
                {getStatusIcon(result.status)}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Budget Data</span>
                  <span className={result.details.budget ? 'text-green-600' : 'text-red-600'}>
                    {result.details.budget ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Documents</span>
                  <span className={result.details.documents ? 'text-green-600' : 'text-red-600'}>
                    {result.details.documents ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Contracts</span>
                  <span className={result.details.contracts ? 'text-green-600' : 'text-red-600'}>
                    {result.details.contracts ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Salaries</span>
                  <span className={result.details.salaries ? 'text-green-600' : 'text-red-600'}>
                    {result.details.salaries ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Treasury</span>
                  <span className={result.details.treasury ? 'text-green-600' : 'text-red-600'}>
                    {result.details.treasury ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Debt</span>
                  <span className={result.details.debt ? 'text-green-600' : 'text-red-600'}>
                    {result.details.debt ? '✅' : '❌'}
                  </span>
                </div>
                
                {result.details.total_items > 0 && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {result.details.total_items} total items
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className={`text-sm ${
                  result.status === 'success' ? 'text-green-600' :
                  result.status === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📊 Data Coverage Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {new Date().getFullYear() - 2018 + 1}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Years Covered</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {totalDocuments || 0}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">Total Documents</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {availableYears.length}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Available Years</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-2" />
                <div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {dataSourcesActive || 0}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Active Sources</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Available Years:</h4>
            <div className="flex flex-wrap gap-2">
              {availableYears.map((year) => (
                <span 
                  key={year} 
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                >
                  {year}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Wrap with error boundary for production safety
const DataVerificationPageWithErrorBoundary: React.FC = () => {
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
      <DataVerificationPage />
    </ErrorBoundary>
  );
};

export default DataVerificationPageWithErrorBoundary;