import React from 'react';
import { useMainData } from '../hooks/useMainData';

const TestDataLoader: React.FC = () => {
  const { data, loading, error } = useMainData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Data Loader</h1>
      
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
          <span>Loading data...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      )}
      
      {data && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Success! Loaded {data.dataset.length} datasets</p>
          <p>Title: {data.title}</p>
          <p>Publisher: {data.publisher.name}</p>
        </div>
      )}
    </div>
  );
};

export default TestDataLoader;