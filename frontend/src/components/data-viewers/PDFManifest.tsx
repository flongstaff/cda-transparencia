import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, Calendar, ExternalLink, Eye } from 'lucide-react';

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
  year: number;
  department: string;
}

// Mock data for demonstration - in real app this would come from an API
const mockPDFDocuments: PDFDocument[] = [
  {
    id: 'pdf-budget-law-2025',
    title: 'Ley de Presupuesto 2025',
    description: 'Documento oficial de la ley de presupuesto para el ejercicio fiscal 2025',
    category: 'Presupuesto y Financiero',
    size: '8.5 MB',
    lastUpdated: '2024-12-01',
    url: '/data/budget-law-2025.pdf',
    tags: ['presupuesto', 'ley', '2025'],
    source: 'Municipal',
    page: 'finances',
    year: 2025,
    department: 'Hacienda'
  },
  {
    id: 'pdf-budget-execution-report-2024',
    title: 'Informe de Ejecución Presupuestaria 2024',
    description: 'Reporte trimestral de ejecución presupuestaria 2024',
    category: 'Presupuesto y Financiero',
    size: '12.3 MB',
    lastUpdated: '2024-11-30',
    url: '/data/budget-execution-report-2024.pdf',
    tags: ['presupuesto', 'ejecución', 'informe', '2024'],
    source: 'Municipal',
    page: 'finances',
    year: 2024,
    department: 'Hacienda'
  },
  {
    id: 'pdf-sef-report-2024',
    title: 'Reporte de Situación Económico-Financiera (SEF) 2024',
    description: 'Informe trimestral de situación económico-financiera',
    category: 'Tesorería y Finanzas',
    size: '14.2 MB',
    lastUpdated: '2024-11-28',
    url: '/data/sef-report-2024.pdf',
    tags: ['sef', 'finanzas', 'informe', '2024'],
    source: 'Municipal',
    page: 'finances',
    year: 2024,
    department: 'Hacienda'
  },
  {
    id: 'pdf-cash-flow-analysis-2024',
    title: 'Análisis de Flujo de Caja 2024',
    description: 'Análisis detallado del flujo de caja municipal',
    category: 'Tesorería y Finanzas',
    size: '11.7 MB',
    lastUpdated: '2024-11-25',
    url: '/data/cash-flow-analysis-2024.pdf',
    tags: ['flujo', 'caja', 'análisis'],
    source: 'Municipal',
    page: 'finances',
    year: 2024,
    department: 'Hacienda'
  },
  {
    id: 'pdf-expenses-report-2024',
    title: 'Reporte de Gastos 2024',
    description: 'Informe detallado de erogaciones municipales 2024',
    category: 'Gastos y Errogaiones',
    size: '13.4 MB',
    lastUpdated: '2024-11-28',
    url: '/data/expenses-report-2024.pdf',
    tags: ['gastos', 'erogaciones', 'informe', '2024'],
    source: 'Municipal',
    page: 'expenses',
    year: 2024,
    department: 'Hacienda'
  },
  {
    id: 'pdf-personnel-expenses-2024',
    title: 'Gastos de Personal 2024',
    description: 'Documentación detallada de remuneraciones del personal municipal',
    category: 'Gastos y Errogaiones',
    size: '11.2 MB',
    lastUpdated: '2024-11-25',
    url: '/data/personnel-expenses-2024.pdf',
    tags: ['gastos', 'personal', 'remuneraciones'],
    source: 'Municipal',
    page: 'expenses',
    year: 2024,
    department: 'Recursos Humanos'
  },
  {
    id: 'pdf-ordinances-2024',
    title: 'Ordenanzas Municipales 2024',
    description: 'Colección de ordenanzas municipales del año 2024 - Documento Oficial',
    category: 'Legal y Reglamentario',
    size: '8.3 MB',
    lastUpdated: '2024-12-01',
    url: '/data/ordinances-2024.pdf',
    tags: ['ordenanzas', 'reglamentos', 'legal'],
    source: 'Municipal',
    page: 'legal',
    year: 2024,
    department: 'Secretaría Legal'
  },
  {
    id: 'pdf-audit-reports-2024',
    title: 'Reportes de Auditoría 2024',
    description: 'Informes de auditoría interna del año 2024 - Documentos Oficiales',
    category: 'Transparencia y Reportes',
    size: '15.2 MB',
    lastUpdated: '2024-11-30',
    url: '/data/audit-reports-2024.pdf',
    tags: ['auditoría', 'transparencia', 'reportes'],
    source: 'Municipal',
    page: 'transparency',
    year: 2024,
    department: 'Auditoría Interna'
  },
  {
    id: 'pdf-contracts-registry-2024',
    title: 'Registro de Contratos 2024',
    description: 'Catálogo de contratos públicos adjudicados en 2024',
    category: 'Contrataciones y Licitaciones',
    size: '16.8 MB',
    lastUpdated: '2024-11-20',
    url: '/data/contracts-registry-2024.pdf',
    tags: ['contratos', 'licitaciones', 'adjudicaciones'],
    source: 'Municipal',
    page: 'contracts',
    year: 2024,
    department: 'Contrataciones'
  },
  {
    id: 'pdf-infrastructural-works-2024',
    title: 'Obras Infraestructurales 2024',
    description: 'Informe de obras públicas ejecutadas en 2024',
    category: 'Infraestructura y Obras',
    size: '14.5 MB',
    lastUpdated: '2024-11-15',
    url: '/data/infrastructural-works-2024.pdf',
    tags: ['obras', 'infraestructura', 'proyectos'],
    source: 'Municipal',
    page: 'works',
    year: 2024,
    department: 'Obras Públicas'
  }
];

const PDFManifest: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [filteredDocuments, setFilteredDocuments] = useState<PDFDocument[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof PDFDocument; direction: 'asc' | 'desc' } | null>(null);
  const docsPerPage = 10;

  // Get unique values for filters
  const categories = Array.from(new Set(mockPDFDocuments.map(doc => doc.category)));
  const years = Array.from(new Set(mockPDFDocuments.map(doc => doc.year))).sort((a, b) => b - a);
  const departments = Array.from(new Set(mockPDFDocuments.map(doc => doc.department)));

  // Filter documents based on search and filters
  useEffect(() => {
    let result = mockPDFDocuments;

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

    if (selectedYear !== 'all') {
      result = result.filter(doc => doc.year === parseInt(selectedYear));
    }

    if (selectedDepartment !== 'all') {
      result = result.filter(doc => doc.department === selectedDepartment);
    }

    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredDocuments(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, selectedYear, selectedDepartment, sortConfig]);

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

  const handleSort = (key: keyof PDFDocument) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-3 text-red-600 dark:text-red-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
              Índice de Documentos PDF
            </h2>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredDocuments.length} de {mockPDFDocuments.length} documentos
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Catálogo completo de documentos PDF oficiales del municipio de Carmen de Areco, 
          organizados por categoría, año y departamento.
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
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
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
            aria-label="Filtrar por año"
          >
            <option value="all">Todos los años</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
            aria-label="Filtrar por departamento"
          >
            <option value="all">Todos los departamentos</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedYear('all');
              setSelectedDepartment('all');
              setSortConfig(null);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-background transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-dark-background">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  Título
                  {sortConfig?.key === 'title' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Categoría
                  {sortConfig?.key === 'category' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('year')}
              >
                <div className="flex items-center">
                  Año
                  {sortConfig?.key === 'year' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center">
                  Departamento
                  {sortConfig?.key === 'department' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tamaño
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lastUpdated')}
              >
                <div className="flex items-center">
                  Actualizado
                  {sortConfig?.key === 'lastUpdated' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
            {currentDocuments.length > 0 ? (
              currentDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-dark-background transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
                      {doc.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md truncate">
                      {doc.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary">
                    {doc.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary">
                    {doc.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {doc.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(doc.lastUpdated)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </a>
                      <a
                        href={doc.url}
                        download
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </a>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                      No se encontraron documentos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Intenta con otros términos de búsqueda o filtros
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

export default PDFManifest;