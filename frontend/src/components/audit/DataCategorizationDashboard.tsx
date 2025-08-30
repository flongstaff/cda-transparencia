import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  FileText, 
  Calendar, 
  Database, 
  Search, 
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Document {
  url: string;
  filename: string;
  file_size: number;
  file_type: string;
  category: string;
  discovered_date: string;
  year?: number;
  source: string;
}

interface Category {
  name: string;
  count: number;
  subcategories: {
    [key: string]: {
      name: string;
      count: number;
      sample_documents: Document[];
    };
  };
}

interface YearlyAnalysis {
  [year: string]: {
    total_documents: number;
    by_category: { [category: string]: number };
    by_file_type: { [filetype: string]: number };
    data_completeness: {
      score: number;
      missing_categories: string[];
      available_categories: string[];
    };
  };
}

interface CategorizedData {
  timestamp: string;
  statistics: {
    total_documents: number;
    categorized_documents: number;
    uncategorized_documents: number;
    categories: { [category: string]: number };
    years: { [year: string]: number };
    file_types: { [filetype: string]: number };
  };
  category_hierarchy: { [category: string]: Category };
  yearly_analysis: YearlyAnalysis;
  sample_documents: {
    recent: Document[];
    by_category: { [category: string]: Document[] };
  };
}

const DataCategorizationDashboard: React.FC = () => {
  const [categorizedData, setCategorizedData] = useState<CategorizedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'categories' | 'years' | 'documents'>('categories');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to load real categorization data from API
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      try {
        const response = await fetch(`${API_BASE}/api/data/categorization`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const realData = await response.json();
          setCategorizedData(realData);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('API not available, showing empty state');
      }
      
      // Show empty state when no real data is available
      const emptyData: CategorizedData = {
        timestamp: new Date().toISOString(),
        statistics: {
          total_documents: 0,
          categorized_documents: 0,
          uncategorized_documents: 0,
          categories: {},
          years: {},
          file_types: {}
        },
        category_hierarchy: {},
        yearly_analysis: {},
        sample_documents: {
          recent: [],
          by_category: {}
        }
      };
      
      setCategorizedData(emptyData);
    } catch (err) {
      setError('Error al cargar los datos de categorización');
      console.error('Categorization data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de categorización...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!categorizedData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            No hay datos de categorización disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Los datos de categorización aún no han sido generados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
          📁 Sistema de Categorización de Documentos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Organización de todos los documentos municipales por categoría, año y tipo
        </p>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {new Date(categorizedData.timestamp).toLocaleDateString('es-AR')}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documentos</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {categorizedData.statistics.total_documents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorizados</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {categorizedData.statistics.categorized_documents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorías</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {Object.keys(categorizedData.statistics.categories).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Años</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {Object.keys(categorizedData.statistics.years).filter(y => y !== 'unknown').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {categorizedData.statistics.total_documents === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
          <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            No hay documentos categorizados
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            El sistema aún no ha procesado documentos municipales.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataCategorizationDashboard;