/**
 * Search Page - Comprehensive Search Across All Resources
 * Allows users to search across all documents, data, and content in the portal
 * Enhanced with AI-powered semantic search capabilities
 */

import React, { useState, useEffect } from 'react';
import SearchWithAI from '../components/SearchWithAI';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);

  // Simple handler to receive results from SearchWithAI component
  const handleResults = (results: any[]) => {
    setResults(results);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SearchWithAI onResults={handleResults} />
    </div>
  );
};

export default SearchPage;