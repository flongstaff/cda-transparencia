// Test component to verify data loading
import React, { useEffect, useState } from 'react';

const DataTestComponent: React.FC = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
    // // console.log('Attempting to load data from /data/multi_source_report.json');
        const response = await fetch('/data/multi_source_report.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
    // // console.log('Data loaded successfully:', jsonData);
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-blue-800">🔄 Loading data from /data/multi_source_report.json...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-800">❌ Error loading data: {error}</p>
        <p className="text-red-600 dark:text-red-400 mt-2">Please check browser console for more details.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <h2 className="text-xl font-bold text-green-800 mb-2">✅ Data Loaded Successfully!</h2>
      <p className="text-green-700">Multi-year data available: {data?.multi_year_summary?.length || 0} years</p>
      {data?.multi_year_summary && (
        <div className="mt-4">
          <h3 className="font-semibold text-green-800">Years:</h3>
          <ul className="list-disc pl-5 text-green-700">
            {data.multi_year_summary.map((yearData: any, index: number) => (
              <li key={index}>
                {yearData.year}: {new Intl.NumberFormat('es-AR', { 
                  style: 'currency', 
                  currency: 'ARS', 
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(yearData.total_budget)} budget
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DataTestComponent;