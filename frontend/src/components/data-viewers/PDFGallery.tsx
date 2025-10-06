import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, Eye, Calendar, ExternalLink } from 'lucide-react';

interface PDFDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  lastUpdated: string;
  url: string;
  tags: string[];
  source: string;
  page: string;
}

interface PDFGalleryProps {
  documents: PDFDocument[];
  title?: string;
  description?: string;
  maxDocuments?: number;
}

const PDFGallery: React.FC<PDFGalleryProps> = ({
  documents,
  title = "Colección de Documentos PDF",
  description = "Acceda a la completa colección de documentos PDF oficiales del municipio",
  maxDocuments = 20
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredDocuments, setFilteredDocuments] = useState<PDFDocument[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const docsPerPage = maxDocuments || 12;

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(documents.map(doc => doc.category)));

  // Filter documents based on search and category
  useEffect(() => {
    let result = documents;

    if (searchTerm) {
      result = result.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(doc => doc.category === selectedCategory);
    }

    setFilteredDocuments(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, documents]);

  // Pagination
  const indexOfLastDoc = currentPage * docsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDoc, indexOfLastDoc);
  const totalPages = Math.ceil(filteredDocuments.length / docsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-3 text-red-600 dark:text-red-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
              {title}
            </h2>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredDocuments.length} documentos
          </span>
        </div>
        
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {description}
          </p>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
              aria-label="Buscar documentos PDF"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
              aria-label="Filtrar por categoría"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDocuments.length > 0 ? (
          currentDocuments.map((doc) => (
            <div 
              key={doc.id} 
              className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary truncate max-w-[200px]">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {doc.category}
                    </p>
                  </div>
                </div>
                
                <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full">
                  PDF
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {doc.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {doc.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index} 
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {doc.tags.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt text-gray-700 dark:text-dark-text-secondary rounded-full">
                    +{doc.tags.length - 3} más
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span>{doc.size}</span>
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(doc.lastUpdated)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </a>
                <div className="flex space-x-2">
                  <a
                    href={doc.url}
                    download
                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg flex items-center"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Descargar
                  </a>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm border border-gray-300 hover:border-gray-400 dark:border-gray-600 text-gray-700 dark:text-dark-text-primary px-3 py-1.5 rounded-lg flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intenta con otros términos de búsqueda o categorías
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {indexOfFirstDoc + 1}-{Math.min(indexOfLastDoc, filteredDocuments.length)} de{' '}
            {filteredDocuments.length} documentos
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-background'}`}
            >
              Anterior
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-background'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-background'}`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFGallery;