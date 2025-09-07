import React, { useState, useEffect } from 'react';
import { unifiedDataService } from '../services';

interface DataSource {
  name: string;
  endpoint: string;
  data?: any;
  status: 'loading' | 'loaded' | 'error' | 'empty';
  error?: string;
}

const DataDashboard: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    { name: 'Available Years', endpoint: 'http://localhost:3001/api/years', status: 'loading' },
    { name: 'Health Status', endpoint: 'http://localhost:3001/health', status: 'loading' },
    { name: 'Property Declarations', endpoint: 'http://localhost:3001/api/declarations', status: 'loading' },
    { name: 'Documents', endpoint: 'http://localhost:3001/api/documents', status: 'loading' },
    { name: 'Public Tenders', endpoint: 'http://localhost:3001/api/tenders', status: 'loading' },
    { name: 'Financial Reports', endpoint: 'http://localhost:3001/api/reports', status: 'loading' }
  ]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearlyData, setYearlyData] = useState<any>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const updatedSources = await Promise.all(
      dataSources.map(async (source) => {
        try {
          const response = await fetch(source.endpoint);
          const data = await response.json();
          
          const hasData = data && (
            (Array.isArray(data) && data.length > 0) ||
            (typeof data === 'object' && Object.keys(data).length > 0)
          );

          return {
            ...source,
            data,
            status: hasData ? 'loaded' : 'empty'
          } as DataSource;
        } catch (error) {
          return {
            ...source,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          } as DataSource;
        }
      })
    );
    
    setDataSources(updatedSources);

    // If we successfully loaded years, set the first available year
    const yearsSource = updatedSources.find(s => s.name === 'Available Years');
    if (yearsSource?.data?.years && Array.isArray(yearsSource.data.years)) {
      setSelectedYear(yearsSource.data.years[0]);
    }
  };

  const loadYearlyData = async (year: number) => {
    try {
      setYearlyData(null);
      const data = await unifiedDataService.getYearlyData(year);
      setYearlyData(data);
    } catch (error) {
      console.error('Error loading yearly data:', error);
    }
  };

  useEffect(() => {
    if (selectedYear) {
      loadYearlyData(selectedYear);
    }
  }, [selectedYear]);

  const renderDataPreview = (data: any, maxItems = 3) => {
    if (!data) return null;

    if (Array.isArray(data)) {
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Array with {data.length} items:</div>
          {data.slice(0, maxItems).map((item, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded text-xs">
              <pre className="whitespace-pre-wrap overflow-hidden">
                {JSON.stringify(item, null, 2).substring(0, 200)}...
              </pre>
            </div>
          ))}
          {data.length > maxItems && (
            <div className="text-xs text-gray-500">
              ...and {data.length - maxItems} more items
            </div>
          )}
        </div>
      );
    }

    if (typeof data === 'object') {
      const keys = Object.keys(data);
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Object with {keys.length} properties:</div>
          <div className="bg-gray-50 p-2 rounded text-xs">
            <pre className="whitespace-pre-wrap overflow-hidden">
              {JSON.stringify(data, null, 2).substring(0, 400)}...
            </pre>
          </div>
        </div>
      );
    }

    return <div className="text-sm text-gray-600">{String(data)}</div>;
  };

  const getStatusBadge = (status: DataSource['status']) => {
    const styles = {
      loading: 'bg-blue-100 text-blue-800',
      loaded: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      empty: 'bg-yellow-100 text-yellow-800'
    };

    const labels = {
      loading: 'Loading...',
      loaded: 'Data Available',
      error: 'Error',
      empty: 'No Data'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const workingSources = dataSources.filter(s => s.status === 'loaded');
  const yearsData = dataSources.find(s => s.name === 'Available Years');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📊 Carmen de Areco - Data Dashboard
          </h1>
          <div className="text-gray-600">
            Comprehensive view of all available municipal transparency data
          </div>
          
          <div className="flex gap-4 mt-4">
            <button
              onClick={loadAllData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              🔄 Refresh All Data
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Working Sources:</span>
              <span className="font-bold text-green-600">{workingSources.length}</span>
              <span>/</span>
              <span>{dataSources.length}</span>
            </div>
          </div>
        </div>

        {/* Year Selector */}
        {yearsData?.data?.years && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">📅 Available Years</h2>
            <div className="flex flex-wrap gap-2">
              {yearsData.data.years.map((year: number) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    selectedYear === year
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Yearly Data Display */}
        {selectedYear && yearlyData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">📈 Data for {selectedYear}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(yearlyData).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm">
                    {renderDataPreview(value, 2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Sources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dataSources.map((source, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {source.name}
                </h3>
                {getStatusBadge(source.status)}
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {source.endpoint}
                </code>
              </div>

              {source.status === 'loaded' && source.data ? (
                <div>
                  {renderDataPreview(source.data)}
                </div>
              ) : source.status === 'error' ? (
                <div className="text-red-600 bg-red-50 p-3 rounded">
                  <div className="font-semibold">Error:</div>
                  <div className="text-sm">{source.error}</div>
                </div>
              ) : source.status === 'empty' ? (
                <div className="text-yellow-600 bg-yellow-50 p-3 rounded">
                  Endpoint responded but contains no data
                </div>
              ) : (
                <div className="text-gray-500">Loading...</div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Working APIs', 
              value: workingSources.length, 
              color: 'text-green-600',
              icon: '✅'
            },
            { 
              label: 'Empty APIs', 
              value: dataSources.filter(s => s.status === 'empty').length, 
              color: 'text-yellow-600',
              icon: '⚠️'
            },
            { 
              label: 'Failed APIs', 
              value: dataSources.filter(s => s.status === 'error').length, 
              color: 'text-red-600',
              icon: '❌'
            },
            { 
              label: 'Total APIs', 
              value: dataSources.length, 
              color: 'text-blue-600',
              icon: '📊'
            }
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-4 text-center">
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                {stat.icon} {stat.value}
              </div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataDashboard;