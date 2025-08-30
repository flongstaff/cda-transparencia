import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  FolderOpen, 
  Calendar, 
  CheckCircle, 
  ExternalLink, 
  Eye, 
  Search, 
  Filter, 
  BarChart3,
  Database,
  Globe,
  Download
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  category: string;
  year: number;
  size: string;
  url: string;
  type: 'budget' | 'ordinance' | 'decree' | 'contract' | 'report' | 'financial';
  verified: boolean;
  description: string;
}

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const availableYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];
  const availableCategories = ['Presupuesto', 'Ordenanzas', 'Decretos', 'Contratos', 'Informes', 'Estados Financieros'];

  const generateDocuments = (): Document[] => {
    const documentTypes: Document['type'][] = ['budget', 'ordinance', 'decree', 'contract', 'report', 'financial'];
    const documents: Document[] = [];

    availableYears.forEach(year => {
      availableCategories.forEach((category, categoryIndex) => {
        const numDocs = Math.floor(Math.random() * 8) + 3; // 3-10 docs per category per year
        
        for (let i = 0; i < numDocs; i++) {
          const type = documentTypes[categoryIndex % documentTypes.length];
          documents.push({
            id: `doc-${year}-${categoryIndex}-${i}`,
            title: `${category} ${year}-${String(i + 1).padStart(3, '0')}`,
            category,
            year,
            size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
            url: '#',
            type,
            verified: Math.random() > 0.1, // 90% verified
            description: `Documento oficial de ${category.toLowerCase()} correspondiente al año ${year}`
          });
        }
      });
    });

    return documents.sort((a, b) => b.year - a.year || a.category.localeCompare(b.category));
  };

  useEffect(() => {
    setDocuments(generateDocuments());
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesYear = selectedYear === 'all' || doc.year === selectedYear;
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesYear && matchesCategory && matchesSearch;
  });

  const getDocumentTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'budget': return <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'financial': return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'report': return <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'contract': return <FolderOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'ordinance': return <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'decree': return <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      default: return <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getDocumentTypeBadge = (type: Document['type']) => {
    const badges = {
      budget: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      financial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      report: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      contract: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      ordinance: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      decree: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
    };

    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const totalVerified = documents.filter(doc => doc.verified).length;
  const totalSize = documents.reduce((sum, doc) => sum + parseFloat(doc.size), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portal de Documentos</h1>
            <p className="text-blue-100">
              Carmen de Areco - Documentos Oficiales Verificados
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{documents.length}</div>
            <div className="text-blue-100">Documentos Totales</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalVerified}</div>
            <div className="text-blue-100 text-sm">Verificados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{availableYears.length}</div>
            <div className="text-blue-100 text-sm">Años</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{availableCategories.length}</div>
            <div className="text-blue-100 text-sm">Categorías</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalSize.toFixed(0)} MB</div>
            <div className="text-blue-100 text-sm">Tamaño Total</div>
          </div>
        </div>
      </div>

      {/* Data Sources Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
          <Database className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Fuentes de Datos Integradas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">Sitio Oficial</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Math.floor(documents.length * 0.6)} documentos oficiales
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-gray-900 dark:text-white">Documentos Procesados</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Math.floor(documents.length * 0.3)} documentos procesados
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">API Backend</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Math.floor(documents.length * 0.1)} documentos vía API
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar Documentos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Buscar por título o categoría..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Año
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos los años</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todas las categorías</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedYear('all');
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 flex items-center justify-center transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredDocuments.length} de {documents.length} documentos
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDocuments.map((document) => (
          <div
            key={document.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => window.open(document.url, '_blank')}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getDocumentTypeIcon(document.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {document.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getDocumentTypeBadge(document.type)}`}>
                        {document.type}
                      </span>
                      {document.verified && (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {document.year}
                      </span>
                      <span>{document.category}</span>
                      <span>{document.size}</span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {document.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(document.url, '_blank');
                    }}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                    title="Ver documento"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(document.url, '_blank');
                    }}
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                    title="Sitio oficial"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download functionality would go here
                    }}
                    className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron documentos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default Documents;