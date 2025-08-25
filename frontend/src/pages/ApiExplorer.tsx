import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Play, Copy, CheckCircle, Globe, Database, Shield, Search } from 'lucide-react';

const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/data-integrity',
      description: 'Get real-time data verification and integrity status',
      response: {
        verification_status: '✅ Verified',
        total_documents: 708,
        verified_documents: 708,
        transparency_score: 94.2
      }
    },
    {
      method: 'GET', 
      endpoint: '/api/analytics/dashboard',
      description: 'Get transparency dashboard analytics and metrics',
      response: {
        transparency_score: 94.2,
        budget_execution: { year: 2024, executed: 87.3, efficiency: 'High' },
        citizen_engagement: { document_downloads: 2847, search_queries: 1523 }
      }
    },
    {
      method: 'GET',
      endpoint: '/api/documents',
      description: 'Get all available documents with metadata and verification',
      response: {
        documents: [
          {
            filename: 'BALANCE-GENERAL-2020.pdf',
            year: 2020,
            type: '.pdf',
            verification_status: 'verified',
            official_url: 'https://carmendeareco.gob.ar/transparencia/'
          }
        ]
      }
    },
    {
      method: 'GET',
      endpoint: '/api/search?q=budget',
      description: 'Advanced search with metadata and relevance scoring',
      response: {
        query: { term: 'budget', executed_at: '2025-01-25T12:00:00.000Z' },
        results: [
          {
            id: 'budget-2024-q4',
            title: 'Estado de Ejecución de Gastos Q4 2024',
            relevance_score: 95.2,
            verification_status: '✅ Verified'
          }
        ],
        total_results: 194
      }
    },
    {
      method: 'GET',
      endpoint: '/api/osint/compliance',
      description: 'OSINT compliance status and legal framework adherence',
      response: {
        overall_status: 'Compliant',
        compliance_score: 100.0,
        legal_frameworks: {
          argentina: { laws: ['Ley 27.275', 'Ley 25.326'], compliance: 'Full' }
        }
      }
    },
    {
      method: 'GET',
      endpoint: '/api/verify/2024/document.pdf',
      description: 'Verify specific document authenticity and integrity',
      response: {
        document: { filename: 'document.pdf', year: 2024, type: '.pdf' },
        verification: {
          status: '✅ Verified',
          hash_verified: true,
          authenticity_score: 98.5
        }
      }
    }
  ];

  const testEndpoint = async (endpoint: string) => {
    setIsLoading(true);
    setSelectedEndpoint(endpoint);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const url = endpoint.startsWith('/api/') ? `${API_BASE}${endpoint.slice(4)}` : `${API_BASE}${endpoint}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white mb-4">
            API Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Interactive documentation and testing interface for the Carmen de Areco Transparency Portal API. 
            All endpoints provide verified government data with full transparency compliance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-blue-800 dark:text-blue-200">708+ Documents</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">Verified & Accessible</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-green-800 dark:text-green-200">100% OSINT Compliant</h3>
              <p className="text-sm text-green-600 dark:text-green-400">Legal Framework</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-purple-800 dark:text-purple-200">Real-time Data</h3>
              <p className="text-sm text-purple-600 dark:text-purple-400">Live Updates</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
              <Search className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-orange-800 dark:text-orange-200">Advanced Search</h3>
              <p className="text-sm text-orange-600 dark:text-orange-400">Metadata & Context</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
              Available Endpoints
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Click on any endpoint to test it and see the live response
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-mono font-medium mr-3">
                        {endpoint.method}
                      </span>
                      <code className="text-gray-800 dark:text-gray-200 font-mono">
                        {endpoint.endpoint}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(endpoint.endpoint)}
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {endpoint.description}
                    </p>
                    <details className="mb-4">
                      <summary className="cursor-pointer text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                        Example Response
                      </summary>
                      <pre className="mt-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm overflow-x-auto">
                        <code>{JSON.stringify(endpoint.response, null, 2)}</code>
                      </pre>
                    </details>
                  </div>
                  <button
                    onClick={() => testEndpoint(endpoint.endpoint)}
                    disabled={isLoading && selectedEndpoint === endpoint.endpoint}
                    className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play size={16} className="mr-2" />
                    {isLoading && selectedEndpoint === endpoint.endpoint ? 'Testing...' : 'Test'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {response && (
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-gray-800 dark:text-white">
                  Live Response
                </h3>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">Response received</span>
                  <button 
                    onClick={() => copyToClipboard(response)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                <code className="text-gray-800 dark:text-gray-200">{response}</code>
              </pre>
            </div>
          </motion.div>
        )}

        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
          <h3 className="font-heading text-lg font-bold text-gray-800 dark:text-white mb-4">
            API Usage Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Authentication</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Public endpoints require no authentication. Administrative endpoints use JWT tokens.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Rate Limits</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                100 requests per minute for public endpoints. Contact us for higher limits.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Data Format</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                All responses are in JSON format with consistent error handling and status codes.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Support</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                API documentation and support available via the Contact page.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default ApiExplorer;