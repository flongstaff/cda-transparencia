/**
 * DocumentAnalysisPage Component
 * Main page for document analysis functionality
 */

import React from 'react';
import DocumentAnalyzer from '../components/DocumentAnalyzer';

const DocumentAnalysisPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <DocumentAnalyzer />
    </div>
  );
};

export default DocumentAnalysisPage;