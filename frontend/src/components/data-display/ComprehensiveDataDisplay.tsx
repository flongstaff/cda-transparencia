import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  BarChart3,
  PieChart,
  TrendingUp,
  Database,
  FileSpreadsheet,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatCurrencyARS, formatDateARS } from '../../utils/formatters';

interface DataFile {
  name: string;
  type: 'csv' | 'json' | 'pdf';
  path: string;
  category: string;
  year?: number;
  description: string;
  size?: string;
  lastModified?: string;
}

interface DataDisplayProps {
  showAllFiles?: boolean;
  category?: string;
  year?: number;
  className?: string;
}

const ComprehensiveDataDisplay: React.FC<DataDisplayProps> = ({
  showAllFiles = false,
  category,
  year,
  className = ''
}) => {
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [selectedType, setSelectedType] = useState<'all' | 'csv' | 'json' | 'pdf'>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['csv', 'json', 'pdf']));

  // Comprehensive list of all data files in the project
  const allDataFiles: DataFile[] = [
    // CSV Files from charts directory
    {
      name: 'Financial_Reserves_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Financial_Reserves_consolidated_2019-2025.csv',
      category: 'Finanzas',
      description: 'Reservas financieras consolidadas 2019-2025',
      year: 2024
    },
    {
      name: 'Health_Statistics_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Health_Statistics_consolidated_2019-2025.csv',
      category: 'Salud',
      description: 'Estadísticas de salud consolidadas 2019-2025',
      year: 2024
    },
    {
      name: 'Personnel_Expenses_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Personnel_Expenses_consolidated_2019-2025.csv',
      category: 'Recursos Humanos',
      description: 'Gastos de personal consolidados 2019-2025',
      year: 2024
    },
    {
      name: 'Budget_Execution_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Budget_Execution_consolidated_2019-2025.csv',
      category: 'Presupuesto',
      description: 'Ejecución presupuestaria consolidada 2019-2025',
      year: 2024
    },
    {
      name: 'Education_Data_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Education_Data_consolidated_2019-2025.csv',
      category: 'Educación',
      description: 'Datos de educación consolidados 2019-2025',
      year: 2024
    },
    {
      name: 'Expenditure_Report_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Expenditure_Report_consolidated_2019-2025.csv',
      category: 'Gastos',
      description: 'Reporte de gastos consolidados 2019-2025',
      year: 2024
    },
    {
      name: 'Investment_Report_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Investment_Report_consolidated_2019-2025.csv',
      category: 'Inversiones',
      description: 'Reporte de inversiones consolidadas 2019-2025',
      year: 2024
    },
    {
      name: 'Fiscal_Balance_Report_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Fiscal_Balance_Report_consolidated_2019-2025.csv',
      category: 'Balance Fiscal',
      description: 'Balance fiscal consolidado 2019-2025',
      year: 2024
    },
    {
      name: 'Debt_Report_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Debt_Report_consolidated_2019-2025.csv',
      category: 'Deuda',
      description: 'Reporte de deuda consolidado 2019-2025',
      year: 2024
    },
    {
      name: 'Revenue_Report_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Revenue_Report_consolidated_2019-2025.csv',
      category: 'Ingresos',
      description: 'Reporte de ingresos consolidados 2019-2025',
      year: 2024
    },
    {
      name: 'Economic_Report_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Economic_Report_consolidated_2019-2025.csv',
      category: 'Economía',
      description: 'Reporte económico consolidado 2019-2025',
      year: 2024
    },
    {
      name: 'Infrastructure_Projects_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Infrastructure_Projects_consolidated_2019-2025.csv',
      category: 'Infraestructura',
      description: 'Proyectos de infraestructura consolidados 2019-2025',
      year: 2024
    },
    {
      name: 'Revenue_Sources_consolidated_2019-2025.csv',
      type: 'csv',
      path: '/data/charts/Revenue_Sources_consolidated_2019-2025.csv',
      category: 'Ingresos',
      description: 'Fuentes de ingresos consolidadas 2019-2025',
      year: 2024
    },
    // JSON API Files
    {
      name: 'categories.json',
      type: 'json',
      path: '/api/categories.json',
      category: 'Configuración',
      description: 'Categorías de documentos y datos'
    },
    {
      name: 'audit.json',
      type: 'json',
      path: '/api/audit.json',
      category: 'Auditoría',
      description: 'Datos de auditoría y verificación'
    },
    {
      name: 'pdf_manifest.json',
      type: 'json',
      path: '/api/pdf_manifest.json',
      category: 'Documentos',
      description: 'Manifest de archivos PDF disponibles'
    },
    {
      name: 'document_references.json',
      type: 'json',
      path: '/api/website_data/document_references.json',
      category: 'Referencias',
      description: 'Referencias a documentos oficiales'
    },
    {
      name: 'chart_data.json',
      type: 'json',
      path: '/api/website_data/chart_data.json',
      category: 'Gráficos',
      description: 'Datos para visualización de gráficos'
    },
    {
      name: 'dashboard_metrics.json',
      type: 'json',
      path: '/api/website_data/dashboard_metrics.json',
      category: 'Dashboard',
      description: 'Métricas del dashboard principal'
    },
    {
      name: 'powerbi_data_20250926_205041.json',
      type: 'json',
      path: '/api/powerbi_extraction/powerbi_data_20250926_205041.json',
      category: 'Power BI',
      description: 'Datos extraídos de Power BI'
    }
  ];

  useEffect(() => {
    setDataFiles(allDataFiles);
    setLoading(false);
  }, []);

  // Filter files based on search term, category, type, and year
  const filteredFiles = dataFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesType = selectedType === 'all' || file.type === selectedType;
    const matchesYear = !year || !file.year || file.year === year;

    return matchesSearch && matchesCategory && matchesType && matchesYear;
  });

  // Group files by type
  const filesByType = {
    csv: filteredFiles.filter(f => f.type === 'csv'),
    json: filteredFiles.filter(f => f.type === 'json'),
    pdf: filteredFiles.filter(f => f.type === 'pdf')
  };

  const categories = Array.from(new Set(allDataFiles.map(f => f.category))).sort();

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'json':
        return <Database className="w-5 h-5 text-blue-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const downloadFile = async (file: DataFile) => {
    try {
      const response = await fetch(file.path);
      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const viewFile = (file: DataFile) => {
    if (file.type === 'csv' || file.type === 'json') {
      // Open in new tab for viewing
      window.open(file.path, '_blank');
    } else if (file.type === 'pdf') {
      // Navigate to document viewer
      window.location.href = `/documents?file=${encodeURIComponent(file.path)}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-dark-text-secondary">Cargando archivos de datos...</span>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            Archivos de Datos
          </h2>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            {filteredFiles.length} archivos disponibles • CSV, JSON y PDF organizados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
            Datos en tiempo real
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar archivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-surface-alt text-gray-900 dark:text-dark-text-primary"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-surface-alt text-gray-900 dark:text-dark-text-primary"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as 'all' | 'csv' | 'json' | 'pdf')}
          className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-surface-alt text-gray-900 dark:text-dark-text-primary"
        >
          <option value="all">Todos los tipos</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      {/* File sections */}
      <div className="space-y-4">
        {Object.entries(filesByType).map(([type, files]) => {
          if (files.length === 0 && selectedType !== 'all') return null;

          const isExpanded = expandedSections.has(type);
          const typeConfig = {
            csv: {
              title: 'Archivos CSV (Datos Estructurados)',
              color: 'text-green-600',
              bgColor: 'bg-green-50 dark:bg-green-900/20',
              borderColor: 'border-green-200 dark:border-green-700'
            },
            json: {
              title: 'Archivos JSON (APIs y Configuración)',
              color: 'text-blue-600',
              bgColor: 'bg-blue-50 dark:bg-blue-900/20',
              borderColor: 'border-blue-200 dark:border-blue-700'
            },
            pdf: {
              title: 'Documentos PDF (Oficiales)',
              color: 'text-red-600',
              bgColor: 'bg-red-50 dark:bg-red-900/20',
              borderColor: 'border-red-200 dark:border-red-700'
            }
          }[type as keyof typeof filesByType];

          return (
            <div key={type} className={`border rounded-lg ${typeConfig.borderColor}`}>
              <button
                onClick={() => toggleSection(type)}
                className={`w-full px-4 py-3 ${typeConfig.bgColor} flex items-center justify-between hover:opacity-80 transition-opacity`}
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(type)}
                  <span className={`font-semibold ${typeConfig.color}`}>
                    {typeConfig.title}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                    ({files.length} archivos)
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 dark:border-dark-border"
                >
                  <div className="p-4 space-y-3">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-alt rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary truncate">
                              {file.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                              {file.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
                              <span className="px-2 py-1 bg-gray-200 dark:bg-dark-surface rounded">
                                {file.category}
                              </span>
                              {file.year && (
                                <span>{file.year}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewFile(file)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Ver archivo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadFile(file)}
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-colors"
                            title="Descargar archivo"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {files.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-dark-text-tertiary">
                        No hay archivos {type.toUpperCase()} que coincidan con los filtros
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
            No se encontraron archivos
          </h3>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Intente ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveDataDisplay;