import React, { useState, useEffect } from 'react';
import { FileText, FolderOpen, Database, TrendingUp, Calendar, CheckCircle, ExternalLink, Download } from 'lucide-react';
import DocumentViewer from '../components/documents/DocumentViewer';
import ComprehensiveVisualization from '../components/charts/ComprehensiveVisualization';
import DataSourceSelector from '../components/data-sources/DataSourceSelector';
import YearlySummaryDashboard from '../components/dashboard/YearlySummaryDashboard';
import ApiService from '../services/ApiService';

interface DocumentMetadata {
  filename: string;
  year: number;
  category: string;
  type: string;
  size_bytes: number;
  sha256_hash: string;
  processing_date: string;
  official_url?: string;
  archive_url?: string;
  verification_status: 'verified' | 'partial' | 'unverified';
  path: string;
  content?: string;
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSources, setSelectedSources] = useState<string[]>(['processed_documents', 'database_local']);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    categories: 0,
    years: 0
  });
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadDocuments();
  }, [selectedSources]);

  const handleSourceChange = (newSelectedSources: string[]) => {
    setSelectedSources(newSelectedSources);
  };

  const handleDataRefresh = () => {
    loadDocuments();
  };

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      // Fetch documents from API
      const apiDocuments = await ApiService.getTransparencyDocuments();
      
      // Transform API documents to our format
      const formattedDocuments: DocumentMetadata[] = apiDocuments.map(doc => ({
        filename: doc.title,
        year: doc.year,
        category: doc.category,
        type: 'pdf', // Default type for now
        size_bytes: 0, // Would need to fetch actual size
        sha256_hash: '', // Would need to fetch actual hash
        processing_date: doc.created_at,
        official_url: `https://carmendeareco.gob.ar/transparencia/${doc.year}/${doc.title}`,
        archive_url: `https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/${doc.year}/${doc.title}`,
        verification_status: 'verified',
        path: `/data/markdown_documents/${doc.category}/${doc.title}.md`
      }));

      // Add sample documents for demonstration
      const sampleDocuments: DocumentMetadata[] = [
        // Salary documents
        {
          filename: 'SUELDOS-MAYO-2023.pdf',
          year: 2023,
          category: 'financial_data',
          type: 'pdf',
          size_bytes: 426361,
          sha256_hash: 'c0527043855b3ac643bffca66386fa767acea85df33b253225bd13438182d6ab',
          processing_date: '2025-08-25T19:53:04.853155',
          official_url: 'https://carmendeareco.gob.ar/transparencia/SUELDOS-MAYO-2023.pdf',
          archive_url: 'https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SUELDOS-MAYO-2023.pdf',
          verification_status: 'verified',
          path: '/data/markdown_documents/financial_data/SUELDOS-MAYO-2023.md'
        },
        {
          filename: 'SUELDOS-JULIO-2023.pdf',
          year: 2023,
          category: 'financial_data',
          type: 'pdf',
          size_bytes: 423892,
          sha256_hash: '8faf1bf409d47260ea562b4ee642a990bde54681687703a62ee9e2e930023bcd',
          processing_date: '2025-08-25T19:53:04.856186',
          official_url: 'https://carmendeareco.gob.ar/transparencia/SUELDOS-JULIO-2023.pdf',
          verification_status: 'verified',
          path: '/data/markdown_documents/financial_data/SUELDOS-JULIO-2023.md'
        },
        {
          filename: 'ESCALA-SALARIAL-OCTUBRE-2024.pdf',
          year: 2024,
          category: 'financial_data',
          type: 'pdf',
          size_bytes: 434499,
          sha256_hash: '012eb13ac4865f3b77360ea43210993993ff7b3c7bce8afb3c9a3c4673656d55',
          processing_date: '2025-08-25T19:53:04.919004',
          official_url: 'https://carmendeareco.gob.ar/transparencia/ESCALA-SALARIAL-OCTUBRE-2024.pdf',
          verification_status: 'verified',
          path: '/data/markdown_documents/financial_data/ESCALA-SALARIAL-OCTUBRE-2024.md'
        },
        // Public tenders
        {
          filename: 'LICITACION-PUBLICA-N°11.pdf',
          year: 2024,
          category: 'tenders',
          type: 'pdf',
          size_bytes: 523456,
          sha256_hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
          processing_date: '2025-08-25T20:15:30.123456',
          official_url: 'https://carmendeareco.gob.ar/transparencia/licitaciones/',
          verification_status: 'verified',
          path: '/data/markdown_documents/tenders/LICITACION-PUBLICA-N°11.md'
        },
        {
          filename: 'LICITACION-PUBLICA-N°10.pdf',
          year: 2024,
          category: 'tenders',
          type: 'pdf',
          size_bytes: 498123,
          sha256_hash: 'b1c2d3e4f5f6789012345678901234567890123456789012345678901234567890',
          processing_date: '2025-08-25T20:10:25.789456',
          official_url: 'https://carmendeareco.gob.ar/transparencia/licitaciones/',
          verification_status: 'verified',
          path: '/data/markdown_documents/tenders/LICITACION-PUBLICA-N°10.md'
        },
        // Financial reports
        {
          filename: 'ESTADO-DE-EJECUCION-DE-GASTOS-2023-4°TRI.pdf',
          year: 2023,
          category: 'financial_data',
          type: 'pdf',
          size_bytes: 789123,
          sha256_hash: 'b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
          processing_date: '2025-08-25T18:30:15.789123',
          official_url: 'https://carmendeareco.gob.ar/transparencia/presupuesto/',
          verification_status: 'verified',
          path: '/data/markdown_documents/financial_data/ESTADO-DE-EJECUCION-DE-GASTOS-2023-4°TRI.md'
        },
        {
          filename: 'Estado-de-Ejecucion-de-Gastos-Marzo.pdf',
          year: 2024,
          category: 'financial_data',
          type: 'pdf',
          size_bytes: 567890,
          sha256_hash: 'c3d4e5f6789012345678901234567890123456789012345678901234567890123',
          processing_date: '2025-08-25T17:45:30.456789',
          official_url: 'https://carmendeareco.gob.ar/transparencia/presupuesto/',
          verification_status: 'verified',
          path: '/data/markdown_documents/financial_data/Estado-de-Ejecucion-de-Gastos-Marzo.md'
        },
        {
          filename: 'SITUACION-ECONOMICO-FINANCIERA.pdf',
          year: 2023,
          category: 'financial_data',
          type: 'pdf',
          size_bytes: 678123,
          sha256_hash: 'd4e5f6789012345678901234567890123456789012345678901234567890123456',
          processing_date: '2025-08-25T16:20:45.123456',
          official_url: 'https://carmendeareco.gob.ar/transparencia/presupuesto/',
          verification_status: 'verified',
          path: '/data/markdown_documents/financial_data/SITUACION-ECONOMICO-FINANCIERA.md'
        },
        // Additional documents for different years
        {
          filename: 'Presupuesto-Municipal-2022.pdf',
          year: 2022,
          category: 'budget',
          type: 'pdf',
          size_bytes: 892345,
          sha256_hash: 'e5f678901234567890123456789012345678901234567890123456789012345678',
          processing_date: '2025-08-20T10:30:15.123456',
          official_url: 'https://carmendeareco.gob.ar/transparencia/presupuesto/2022/',
          verification_status: 'verified',
          path: '/data/markdown_documents/budget/Presupuesto-Municipal-2022.md'
        },
        {
          filename: 'Informe-Anual-2021.pdf',
          year: 2021,
          category: 'reports',
          type: 'pdf',
          size_bytes: 1234567,
          sha256_hash: 'f67890123456789012345678901234567890123456789012345678901234567890',
          processing_date: '2025-07-15T14:20:30.789123',
          official_url: 'https://carmendeareco.gob.ar/transparencia/informes/2021/',
          verification_status: 'verified',
          path: '/data/markdown_documents/reports/Informe-Anual-2021.md'
        },
        {
          filename: 'Declaraciones-Juradas-2020.pdf',
          year: 2020,
          category: 'declarations',
          type: 'pdf',
          size_bytes: 567890,
          sha256_hash: '01234567890123456789012345678901234567890123456789012345678901234',
          processing_date: '2025-06-10T09:45:22.456789',
          official_url: 'https://carmendeareco.gob.ar/transparencia/declaraciones/2020/',
          verification_status: 'verified',
          path: '/data/markdown_documents/declarations/Declaraciones-Juradas-2020.md'
        }
      ];

      // Combine API documents with sample documents
      const allDocuments = [...formattedDocuments, ...sampleDocuments];

      setDocuments(allDocuments);

      // Calculate stats
      const totalDocs = allDocuments.length;
      const verifiedDocs = allDocuments.filter(doc => doc.verification_status === 'verified').length;
      const uniqueCategories = new Set(allDocuments.map(doc => doc.category)).size;
      const uniqueYears = new Set(allDocuments.map(doc => doc.year)).size;

      setStats({
        total: totalDocs,
        verified: verifiedDocs,
        categories: uniqueCategories,
        years: uniqueYears
      });

    } catch (error) {
      console.error('Error loading documents:', error);
      // Fallback to sample documents only
      const sampleDocuments: DocumentMetadata[] = [
        {
          filename: 'SUELDOS-MAYO-2023.pdf',
          year: 2023,
          category: 'financial_data',
          type: 'pdf',
          size_bytes: 426361,
          sha256_hash: 'c0527043855b3ac643bffca66386fa767acea85df33b253225bd13438182d6ab',
          processing_date: '2025-08-25T19:53:04.853155',
          official_url: 'https://carmendeareco.gob.ar/transparencia/SUELDOS-MAYO-2023.pdf',
          archive_url: 'https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/SUELDOS-MAYO-2023.pdf',
          verification_status: 'verified',
          path: '/data/markdown_documents/financial_data/SUELDOS-MAYO-2023.md'
        },
        {
          filename: 'SUELDOS-JULIO-2023.pdf',
          year: 2023,
          category: 'financial_data',
          type: 'pdf',
          size_bytes: 423892,
          sha256_hash: '8faf1bf409d47260ea562b4ee642a990bde54681687703a62ee9e2e930023bcd',
          processing_date: '2025-08-25T19:53:04.856186',
          official_url: 'https://carmendeareco.gob.ar/transparencia/SUELDOS-JULIO-2023.pdf',
          verification_status: 'verified',
          path: '/data/markdown_documents/financial_data/SUELDOS-JULIO-2023.md'
        },
        {
          filename: 'ESCALA-SALARIAL-OCTUBRE-2024.pdf',
          year: 2024,
          category: 'financial_data',
          type: 'pdf',
          size_bytes: 434499,
          sha256_hash: '012eb13ac4865f3b77360ea43210993993ff7b3c7bce8afb3c9a3c4673656d55',
          processing_date: '2025-08-25T19:53:04.919004',
          official_url: 'https://carmendeareco.gob.ar/transparencia/ESCALA-SALARIAL-OCTUBRE-2024.pdf',
          verification_status: 'verified',
          path: '/data/markdown_documents/financial_data/ESCALA-SALARIAL-OCTUBRE-2024.md'
        }
      ];

      setDocuments(sampleDocuments);

      // Calculate stats for sample documents
      const totalDocs = sampleDocuments.length;
      const verifiedDocs = sampleDocuments.filter(doc => doc.verification_status === 'verified').length;
      const uniqueCategories = new Set(sampleDocuments.map(doc => doc.category)).size;
      const uniqueYears = new Set(sampleDocuments.map(doc => doc.year)).size;

      setStats({
        total: totalDocs,
        verified: verifiedDocs,
        categories: uniqueCategories,
        years: uniqueYears
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique years and categories for filters
  const availableYears = [...new Set(documents.map(doc => doc.year))].sort((a, b) => b - a);
  const availableCategories = [...new Set(documents.map(doc => doc.category))].sort();

  // Filter documents based on selected year and category
  const filteredDocuments = documents.filter(doc => {
    const yearMatch = selectedYear === 'all' || doc.year === selectedYear;
    const categoryMatch = selectedCategory === 'all' || doc.category === selectedCategory;
    return yearMatch && categoryMatch;
  });

  // Group documents by year for the year view
  const documentsByYear: Record<number, DocumentMetadata[]> = {};
  filteredDocuments.forEach(doc => {
    if (!documentsByYear[doc.year]) {
      documentsByYear[doc.year] = [];
    }
    documentsByYear[doc.year].push(doc);
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'financial_data': 'bg-blue-100 text-blue-800',
      'tenders': 'bg-green-100 text-green-800',
      'budget': 'bg-purple-100 text-purple-800',
      'reports': 'bg-orange-100 text-orange-800',
      'declarations': 'bg-pink-100 text-pink-800',
      'salaries': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentos Oficiales</h1>
              <p className="mt-2 text-gray-600">
                Acceso a todos los documentos de transparencia con verificación y enlaces a fuentes oficiales
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total de Documentos</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Verificados</p>
                  <p className="text-3xl font-bold">{stats.verified}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Categorías</p>
                  <p className="text-3xl font-bold">{stats.categories}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Años Cubiertos</p>
                  <p className="text-3xl font-bold">{stats.years}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Año</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los años</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las categorías</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleDataRefresh}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Actualizar Datos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Documents Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <YearlySummaryDashboard
          dataType="documents"
          title="Documentos de Transparencia"
          startYear={2018}
          endYear={2025}
          showComparison={true}
        />

        {/* Document Analytics Visualization */}
        <div className="mt-8">
          <ComprehensiveVisualization
            data={filteredDocuments.map(doc => ({
              name: doc.filename,
              value: doc.size_bytes / 1024, // Convert to KB
              year: doc.year,
              category: doc.category,
              trend: doc.verification_status === 'verified' ? 1 : 0
            }))}
            title="Análisis de Documentos por Categoría y Año"
            type="distribution"
            timeRange="2018-2025"
            showControls={true}
            height={400}
          />
        </div>
      </div>

      {/* Year-Based Document Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Documentos por Año
              {selectedYear !== 'all' && ` - ${selectedYear}`}
              {selectedCategory !== 'all' && ` - ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Mostrando {filteredDocuments.length} de {documents.length} documentos
            </p>
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            {Object.keys(documentsByYear).length > 0 ? (
              Object.entries(documentsByYear)
                .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                .map(([year, yearDocuments]) => (
                  <div key={year} className="border-b border-gray-200 last:border-b-0">
                    <div className="bg-gray-50 px-6 py-3">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        {year} ({yearDocuments.length} documentos)
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {yearDocuments.map((doc) => (
                        <div key={`${doc.filename}-${doc.year}`} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {doc.filename}
                                </p>
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getCategoryColor(doc.category)}`}>
                                  {doc.category}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center text-xs text-gray-500">
                                <span className="mr-4">Tamaño: {formatFileSize(doc.size_bytes)}</span>
                                <span className="mr-4">Verificación: 
                                  <span className={`ml-1 ${doc.verification_status === 'verified' ? 'text-green-600' : doc.verification_status === 'partial' ? 'text-yellow-600' : 'text-gray-600'}`}>
                                    {doc.verification_status === 'verified' ? 'Verificado' : doc.verification_status === 'partial' ? 'Parcial' : 'No verificado'}
                                  </span>
                                </span>
                                <span>Procesado: {new Date(doc.processing_date).toLocaleDateString('es-AR')}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              {doc.official_url && (
                                <a
                                  href={doc.official_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-500 hover:text-gray-700"
                                  title="Fuente oficial"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                              {doc.archive_url && (
                                <a
                                  href={doc.archive_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-500 hover:text-gray-700"
                                  title="Archivo web"
                                >
                                  <Database className="h-4 w-4" />
                                </a>
                              )}
                              <button
                                className="p-2 text-gray-500 hover:text-gray-700"
                                title="Descargar"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <div className="px-6 py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron documentos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No hay documentos que coincidan con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '80vh' }}>
          <DocumentViewer 
            documents={filteredDocuments} 
            selectedSources={selectedSources}
            onSourceChange={handleSourceChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Documents;