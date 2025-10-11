import React from 'react';
import { useSitemapData } from '../../hooks/useSitemapData';
import { useMainData } from '../../hooks/useMainData';

const DataTester: React.FC = () => {
  const { data: sitemapData, loading: sitemapLoading, error: sitemapError } = useSitemapData();
  const { data: mainData, loading: mainLoading, error: mainError } = useMainData();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Data Tester Component</h1>
      
      {/* Sitemap Data Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Sitemap Data</h2>
        {sitemapLoading && <p className="text-blue-600">Loading sitemap data...</p>}
        {sitemapError && <p className="text-red-600">Error: {sitemapError}</p>}
        {sitemapData && (
          <div>
            <p className="mb-2"><strong>Generated at:</strong> {sitemapData.generated_at}</p>
            <p className="mb-2"><strong>Total documents:</strong> {sitemapData.total_documents}</p>
            <p className="mb-2"><strong>Base URL:</strong> {sitemapData.base_url}</p>
            <p className="mb-2"><strong>Available years:</strong> {Object.keys(sitemapData.years).join(', ')}</p>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Categories:</h3>
              <ul className="list-disc pl-5">
                {Object.entries(sitemapData.categories).map(([category, info]) => (
                  <li key={category} className="mb-1">
                    <strong>{category}:</strong> {info.document_count} documents in {info.years.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Section */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Main Data</h2>
        {mainLoading && <p className="text-blue-600">Loading main data...</p>}
        {mainError && <p className="text-red-600">Error: {mainError}</p>}
        {mainData && (
          <div>
            <p className="mb-2"><strong>Title:</strong> {mainData.title}</p>
            <p className="mb-2"><strong>Description:</strong> {mainData.description}</p>
            <p className="mb-2"><strong>Last Updated:</strong> {mainData.lastUpdated}</p>
            <p className="mb-4"><strong>Number of datasets:</strong> {mainData.dataset?.length || 0}</p>
            
            {mainData.dataset && mainData.dataset.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">First few datasets:</h3>
                <ul className="list-disc pl-5">
                  {mainData.dataset.slice(0, 3).map((dataset, index) => (
                    <li key={index} className="mb-1">
                      <strong>{dataset.title}</strong> - {dataset.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTester;