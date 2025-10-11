import React, { useState, useEffect } from 'react';
import { FileText, Folder, Calendar, Filter, Download, ExternalLink, Search } from 'lucide-react';
import { DocumentMetadata } from '../../types/documents';
import { useSitemapData } from '../../hooks/useSitemapData';
import { useMainData } from '../../hooks/useMainData';

// Define the DocumentGallery component
interface DocumentGalleryProps {
  className?: string;
}

const DocumentGallery: React.FC<DocumentGalleryProps> = ({ className = '' }) => {
  const { data: sitemapData, loading: sitemapLoading, error: sitemapError } = useSitemapData();
  const { data: mainData, loading: mainLoading, error: mainError } = useMainData();
  
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentMetadata[]>([]);

  // Process main data to create document objects compatible with our DocumentMetadata type
  useEffect(() => {
    if (mainData && mainData.dataset) {
      const documents: DocumentMetadata[] = [];
      
      mainData.dataset.forEach(dataset => {
        if (dataset.distribution && dataset.distribution.length > 0) {
          dataset.distribution.forEach(dist => {
            // Extract year from the date (we'll use the issued date or modified date)
            const dateStr = dataset.issued || dataset.modified || new Date().toISOString();
            const year = new Date(dateStr).getFullYear().toString();
            
            // Extract category from theme
            const category = dataset.theme || 'General';
            
            // Create a document object
            const doc: DocumentMetadata = {
              id: `${dataset.identifier}-${dist.title}`,
              title: `${dataset.title} - ${dist.title}`,
              filename: dist.fileName || dist.title,
              year: parseInt(year),
              category: category,
              size_mb: '0.1', // Placeholder
              url: dist.accessURL,
              official_url: dist.downloadURL,
              verification_status: 'verified',
              processing_date: dataset.modified || dataset.issued || new Date().toISOString(),
              relative_path: '',
              content: '',
              file_type: 'pdf',
            };
            
            documents.push(doc);
          });
        }
      });
      
      setFilteredDocuments(documents);
    }
  }, [mainData]);

  // Apply filters when selections change
  useEffect(() => {
    if (!filteredDocuments || filteredDocuments.length === 0) return;
    
    let result = [...filteredDocuments];
    
    // Apply year filter
    if (selectedYear !== 'all') {
      result = result.filter(doc => doc.year.toString() === selectedYear);
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(doc => doc.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(doc => 
        doc.title.toLowerCase().includes(term) || 
        doc.filename.toLowerCase().includes(term) ||
        doc.category.toLowerCase().includes(term)
      );
    }
    
    setFilteredDocuments(result);
  }, [selectedYear, selectedCategory, searchTerm, filteredDocuments]);

  // Get available years and categories from sitemap if available
  const availableYears = sitemapData ? Object.keys(sitemapData.years).sort((a, b) => parseInt(b) - parseInt(a)) : [];
  const availableCategories = sitemapData ? Object.keys(sitemapData.categories) : [];

  // Handle document download
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading and error states
  if (sitemapLoading || mainLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if ((sitemapError || mainError) && (!sitemapData || !mainData)) {
    return (
      <div className={`p-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-2">Error al cargar los datos</p>
          <p className="text-red-600 text-sm">{sitemapError || mainError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Galería de Documentos</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Explora los documentos organizados por año y categoría
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            Año
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los años</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Folder className="inline h-4 w-4 mr-1" />
            Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todas las categorías</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="relative md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Search className="inline h-4 w-4 mr-1" />
            Buscar
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar documentos..."
            className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Search className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron documentos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Intenta cambiar los filtros de búsqueda
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc, index) => (
            <div 
              key={doc.id || index} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <FileText className="h-5 w-5 text-red-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      {doc.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="inline-flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {doc.year}
                    </span>
                    <span className="inline-flex items-center">
                      <Folder className="h-4 w-4 mr-1" />
                      {doc.category}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {doc.filename}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDownload(doc.url, doc.filename)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </button>
                    
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver en línea
                    </a>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    PDF
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentGallery;