import React from 'react';
import DocumentGallery from '../components/data-display/DocumentGallery';
import DataTester from '../components/debug/DataTester';

const APITestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Integration Test</h2>
        <DataTester />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Document Gallery</h2>
        <DocumentGallery />
      </div>
    </div>
  );
};

export default APITestPage;