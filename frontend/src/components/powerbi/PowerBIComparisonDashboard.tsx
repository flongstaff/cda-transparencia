import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Filter,
  Search,
  Download,
  BarChart3
} from 'lucide-react';
import PowerBIDataService from '../../services/PowerBIDataService';

interface ComparisonDataPoint {
  category: string;
  subcategory: string;
  powerbi_amount: number;
  pdf_amount: number;
  difference: number;
  percentage_diff: number;
  year: number;
  quarter: string;
  status: 'match' | 'discrepancy' | 'missing';
  source_document?: string;
}

const PowerBIComparisonDashboard: React.FC = () => {
  const [comparisonData, setComparisonData] = useState<ComparisonDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'match' | 'discrepancy' | 'missing'>('all');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');

  // Available years for filtering
  const availableYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if Power BI data is available
      const isAvailable = await PowerBIDataService.isDataAvailable();
      
      if (!isAvailable) {
        setError('Los datos de Power BI aún no han sido extraídos. Por favor, ejecute el proceso de extracción primero.');
        return;
      }
      
      // Load comparison data from the backend service
      const comparison = await PowerBIDataService.fetchComparisonData();
      
      setComparisonData(comparison);
    } catch (err) {
      setError('Error al cargar los datos de comparación');
      console.error('Comparison data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search and filters
  const filteredData = comparisonData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesYear = yearFilter === 'all' || item.year === yearFilter;
    
    return matchesSearch && matchesStatus && matchesYear;
  });

  // Calculate summary statistics
  const matchCount = comparisonData.filter(item => item.status === 'match').length;
  const discrepancyCount = comparisonData.filter(item => item.status === 'discrepancy').length;
  const missingCount = comparisonData.filter(item => item.status === 'missing').length;
  const totalItems = comparisonData.length;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(2)}%`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'match':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'discrepancy':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'missing':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <GitCompare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'match':
        return 'Coincide';
      case 'discrepancy':
        return 'Discrepancia';
      case 'missing':
        return 'Falta';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de comparación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
              🔄 Comparación de Datos Financieros
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Análisis comparativo entre Power BI y documentos PDF oficiales
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Exportar Datos
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Coincidencias</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {matchCount} <span className="text-sm font-normal">({totalItems > 0 ? ((matchCount/totalItems)*100).toFixed(1) : 0}%)</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Discrepancias</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {discrepancyCount} <span className="text-sm font-normal">({totalItems > 0 ? ((discrepancyCount/totalItems)*100).toFixed(1) : 0}%)</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faltantes</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {missingCount} <span className="text-sm font-normal">({totalItems > 0 ? ((missingCount/totalItems)*100).toFixed(1) : 0}%)</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {totalItems}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Buscar por categoría o subcategoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'match' | 'discrepancy' | 'missing')}
                aria-label="Filtrar por estado"
              >
                <option value="all">Todos los estados</option>
                <option value="match">Coincide</option>
                <option value="discrepancy">Discrepancia</option>
                <option value="missing">Falta</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                aria-label="Filtrar por año"
              >
                <option value="all">Todos los años</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Análisis Detallado de Comparación</h2>
        </div>
        
        {filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subcategoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Power BI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PDF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Diferencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">% Diferencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Documento Fuente</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <span className="ml-2 text-sm font-medium text-gray-800 dark:text-white">
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {item.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.subcategory}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(item.powerbi_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {item.pdf_amount > 0 ? formatCurrency(item.pdf_amount) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.difference !== 0 ? (
                        <span className={item.difference > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {formatCurrency(item.difference)}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.percentage_diff !== 0 ? (
                        <span className={item.percentage_diff > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {formatPercentage(item.percentage_diff)}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {item.source_document ? (
                        <a 
                          href={`http://carmendeareco.gob.ar/wp-content/uploads/${item.year}/${item.source_document}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 flex items-center"
                        >
                          <GitCompare className="h-4 w-4 mr-1" />
                          Ver documento
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <GitCompare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              No hay datos que coincidan con los filtros
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intente ajustar los filtros de búsqueda para ver más resultados.
            </p>
          </div>
        )}
      </div>

      {/* Discrepancy Analysis */}
      {discrepancyCount > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Análisis de Discrepancias</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-4">Principales Discrepancias</h3>
                <div className="space-y-3">
                  {comparisonData
                    .filter(item => item.status === 'discrepancy')
                    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">{item.category}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{item.subcategory}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-yellow-700 dark:text-yellow-300">
                            {formatPercentage(item.percentage_diff)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(item.difference)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
                <h3 className="font-medium text-red-800 dark:text-red-200 mb-4">Datos Faltantes</h3>
                <div className="space-y-3">
                  {comparisonData
                    .filter(item => item.status === 'missing')
                    .map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">{item.category}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{item.subcategory}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-red-700 dark:text-red-300">
                            {formatCurrency(item.powerbi_amount)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            No encontrado en PDF
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Banner */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Información Importante
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Esta comparación identifica posibles inconsistencias entre los datos presentados en el dashboard de Power BI 
                y los documentos oficiales PDF del municipio. Las discrepancias pueden deberse a diferentes fechas de corte, 
                metodologías de cálculo o errores en la publicación de datos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerBIComparisonDashboard;
