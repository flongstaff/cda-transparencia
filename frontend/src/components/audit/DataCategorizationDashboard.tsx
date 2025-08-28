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
      // In a real implementation, this would fetch from your API
      // For now, we'll use mock data to demonstrate the UI
      const mockData: CategorizedData = {
        timestamp: new Date().toISOString(),
        statistics: {
          total_documents: 156,
          categorized_documents: 142,
          uncategorized_documents: 14,
          categories: {
            'budget_and_financial': 45,
            'salaries_and_personnel': 28,
            'contracts_and_procurement': 32,
            'infrastructure_and_public_works': 21,
            'municipal_governance': 16,
            'transparency_and_reports': 18,
            'general_administration': 12,
            'powerbi_data': 8,
            'uncategorized': 14
          },
          years: {
            '2025': 25,
            '2024': 38,
            '2023': 32,
            '2022': 28,
            '2021': 22,
            '2020': 18,
            '2019': 15,
            'unknown': 14
          },
          file_types: {
            '.pdf': 95,
            '.xlsx': 32,
            '.docx': 18,
            '.csv': 8,
            'dataset': 3
          }
        },
        category_hierarchy: {
          'budget_and_financial': {
            name: 'Presupuesto y Finanzas',
            count: 45,
            subcategories: {
              'budget_planning': {
                name: 'Planificación Presupuestaria',
                count: 18,
                sample_documents: [
                  {
                    url: 'http://carmendeareco.gob.ar/wp-content/uploads/2024/03/PRESUPUESTO-2024.pdf',
                    filename: 'PRESUPUESTO-2024.pdf',
                    file_size: 2450000,
                    file_type: '.pdf',
                    category: 'budget_and_financial',
                    discovered_date: '2024-03-15',
                    year: 2024,
                    source: 'discovery'
                  }
                ]
              },
              'budget_execution': {
                name: 'Ejecución Presupuestaria',
                count: 27,
                sample_documents: [
                  {
                    url: 'http://carmendeareco.gob.ar/wp-content/uploads/2024/06/EJECUCION-PRESUPUESTARIA-SEMESTRE-1-2024.pdf',
                    filename: 'EJECUCION-PRESUPUESTARIA-SEMESTRE-1-2024.pdf',
                    file_size: 1890000,
                    file_type: '.pdf',
                    category: 'budget_and_financial',
                    discovered_date: '2024-06-30',
                    year: 2024,
                    source: 'discovery'
                  }
                ]
              }
            }
          },
          'salaries_and_personnel': {
            name: 'Sueldos y Personal',
            count: 28,
            subcategories: {
              'salary_scales': {
                name: 'Escalas Salariales',
                count: 15,
                sample_documents: [
                  {
                    url: 'http://carmendeareco.gob.ar/wp-content/uploads/2024/02/ESCALA-SALARIAL-FEBRERO-2024.pdf',
                    filename: 'ESCALA-SALARIAL-FEBRERO-2024.pdf',
                    file_size: 1250000,
                    file_type: '.pdf',
                    category: 'salaries_and_personnel',
                    discovered_date: '2024-02-15',
                    year: 2024,
                    source: 'discovery'
                  }
                ]
              },
              'declarations': {
                name: 'Declaraciones Juradas',
                count: 13,
                sample_documents: [
                  {
                    url: 'http://carmendeareco.gob.ar/wp-content/uploads/2024/01/DDJJ-2024.pdf',
                    filename: 'DDJJ-2024.pdf',
                    file_size: 3200000,
                    file_type: '.pdf',
                    category: 'salaries_and_personnel',
                    discovered_date: '2024-01-20',
                    year: 2024,
                    source: 'discovery'
                  }
                ]
              }
            }
          }
        },
        yearly_analysis: {
          '2024': {
            total_documents: 38,
            by_category: {
              'budget_and_financial': 12,
              'salaries_and_personnel': 8,
              'contracts_and_procurement': 10,
              'infrastructure_and_public_works': 6,
              'municipal_governance': 4
            },
            by_file_type: {
              '.pdf': 28,
              '.xlsx': 7,
              '.docx': 3
            },
            data_completeness: {
              score: 85.7,
              missing_categories: ['transparency_and_reports'],
              available_categories: [
                'budget_and_financial',
                'salaries_and_personnel', 
                'contracts_and_procurement',
                'infrastructure_and_public_works',
                'municipal_governance'
              ]
            }
          },
          '2023': {
            total_documents: 32,
            by_category: {
              'budget_and_financial': 10,
              'salaries_and_personnel': 7,
              'contracts_and_procurement': 8,
              'infrastructure_and_public_works': 5,
              'municipal_governance': 3
            },
            by_file_type: {
              '.pdf': 25,
              '.xlsx': 5,
              '.docx': 2
            },
            data_completeness: {
              score: 71.4,
              missing_categories: ['transparency_and_reports', 'general_administration'],
              available_categories: [
                'budget_and_financial',
                'salaries_and_personnel', 
                'contracts_and_procurement',
                'infrastructure_and_public_works',
                'municipal_governance'
              ]
            }
          }
        },
        sample_documents: {
          recent: [
            {
              url: 'http://carmendeareco.gob.ar/wp-content/uploads/2024/07/Situacion-Economico-Financiera-al-30-06-24-1.pdf',
              filename: 'Situacion-Economico-Financiera-al-30-06-24-1.pdf',
              file_size: 1150000,
              file_type: '.pdf',
              category: 'budget_and_financial',
              discovered_date: '2024-07-01',
              year: 2024,
              source: 'discovery'
            }
          ],
          by_category: {}
        }
      };
      
      setCategorizedData(mockData);
    } catch (err) {
      setError('Error al cargar los datos de categorización');
      console.error('Categorization data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'budget_and_financial':
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case 'salaries_and_personnel':
        return <Database className="h-5 w-5 text-green-500" />;
      case 'contracts_and_procurement':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'infrastructure_and_public_works':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      default:
        return <FolderOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCompletenessColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow mb-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar documentos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {Object.entries(categorizedData.statistics.categories)
                .filter(([cat]) => cat !== 'uncategorized')
                .map(([category, count]) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({count})
                  </option>
                ))}
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">Todos los años</option>
              {Object.entries(categorizedData.statistics.years)
                .filter(([year]) => year !== 'unknown')
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([year, count]) => (
                  <option key={year} value={year}>{year} ({count})</option>
                ))}
            </select>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="mt-4 flex space-x-2">
          {(['categories', 'years', 'documents'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {mode === 'categories' && 'Categorías'}
              {mode === 'years' && 'Por Año'}
              {mode === 'documents' && 'Documentos'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Based on View Mode */}
      {viewMode === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(categorizedData.category_hierarchy).map(([categoryKey, category]) => (
            <motion.div
              key={categoryKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getCategoryIcon(categoryKey)}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.count} documentos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="font-medium text-gray-800 dark:text-white mb-4">Subcategorías</h4>
                <div className="space-y-3">
                  {Object.entries(category.subcategories).map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {subcat.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {subcat.count} documentos
                        </div>
                      </div>
                      <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {Math.round((subcat.count / category.count) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {viewMode === 'years' && (
        <div className="space-y-6">
          {Object.entries(categorizedData.yearly_analysis)
            .filter(([year]) => year !== 'unknown')
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .map(([year, analysis]) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Año {year}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {analysis.total_documents} documentos totales
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCompletenessColor(analysis.data_completeness.score)}`}>
                        Completitud: {analysis.data_completeness.score}%
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {analysis.data_completeness.available_categories.length} de 7 categorías
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white mb-3">Por Categoría</h4>
                    <div className="space-y-2">
                      {Object.entries(analysis.by_category)
                        .sort(([,a], [,b]) => b - a)
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white mb-3">Por Tipo de Archivo</h4>
                    <div className="space-y-2">
                      {Object.entries(analysis.by_file_type)
                        .sort(([,a], [,b]) => b - a)
                        .map(([filetype, count]) => (
                          <div key={filetype} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {filetype.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {viewMode === 'documents' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Documentos Recientes
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Año
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {categorizedData.sample_documents.recent.map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {doc.filename}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.year || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(doc.file_size)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(doc.discovered_date).toLocaleDateString('es-AR')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Information Banner */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Sistema de Categorización Completo
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Este sistema organiza automáticamente los más de 150 documentos municipales en categorías significativas
                para facilitar el acceso ciudadano a la información. La categorización se actualiza continuamente
                mediante nuestro sistema de descubrimiento automatizado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCategorizationDashboard;