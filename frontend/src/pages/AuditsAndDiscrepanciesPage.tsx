import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileSearch,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for demonstration
const mockAuditData = [
  {
    id: 1,
    type: 'Presupuesto',
    year: 2022,
    category: 'Personal',
    localValue: 1425000000,
    externalValue: 1450000000,
    variance: -25000000,
    variancePercent: -1.72,
    status: 'minor-discrepancy',
    description: 'Ligeramente inferior al reporte provincial'
  },
  {
    id: 2,
    type: 'Presupuesto',
    year: 2022,
    category: 'Obras Públicas',
    localValue: 285440000,
    externalValue: 280000000,
    variance: 5440000,
    variancePercent: 1.94,
    status: 'minor-discrepancy',
    description: 'Ligeramente superior al reporte provincial'
  },
  {
    id: 3,
    type: 'Contratos',
    year: 2022,
    category: 'Contrataciones',
    localValue: 387425000,
    externalValue: 380000000,
    variance: 7425000,
    variancePercent: 1.95,
    status: 'major-discrepancy',
    description: 'Diferencia significativa en reporte de contratos'
  },
  {
    id: 4,
    type: 'Presupuesto',
    year: 2023,
    category: 'Personal',
    localValue: 1450000000,
    externalValue: 1430000000,
    variance: 20000000,
    variancePercent: 1.40,
    status: 'minor-discrepancy',
    description: 'Incremento en nómina de personal'
  },
  {
    id: 5,
    type: 'Ingresos',
    year: 2023,
    category: 'Coparticipación',
    localValue: 450000000,
    externalValue: 450000000,
    variance: 0,
    variancePercent: 0,
    status: 'matched',
    description: 'Valores coinciden perfectamente'
  }
];

const AuditsAndDiscrepanciesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('variancePercent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  
  // Format currency function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Filter and sort data
  let filteredData = [...mockAuditData];
  
  if (searchTerm) {
    filteredData = filteredData.filter(item => 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (filterCategory !== 'all') {
    filteredData = filteredData.filter(item => item.category === filterCategory);
  }
  
  if (filterStatus !== 'all') {
    filteredData = filteredData.filter(item => item.status === filterStatus);
  }
  
  if (filterYear !== 'all') {
    filteredData = filteredData.filter(item => item.year === parseInt(filterYear));
  }
  
  filteredData.sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    } else if (sortBy === 'type') {
      comparison = a.type.localeCompare(b.type);
    } else if (sortBy === 'year') {
      comparison = a.year - b.year;
    } else if (sortBy === 'variancePercent') {
      comparison = Math.abs(a.variancePercent) - Math.abs(b.variancePercent);
    } else if (sortBy === 'variance') {
      comparison = Math.abs(a.variance) - Math.abs(b.variance);
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  // Prepare data for charts
  const chartData = filteredData.map(item => ({
    name: `${item.category} ${item.year}`,
    local: item.localValue,
    external: item.externalValue,
    variance: Math.abs(item.variancePercent)
  }));
  
  // Prepare data for heatmap
  const _heatmapData = filteredData.map(item => ({
    category: item.category,
    year: item.year.toString(),
    variance: Math.abs(item.variancePercent),
    status: item.status
  }));
  
  // Get unique years and categories for filters
  const uniqueYears = Array.from(new Set(mockAuditData.map(item => item.year))).sort((a, b) => b - a);
  const uniqueCategories = Array.from(new Set(mockAuditData.map(item => item.category)));
  const _uniqueStatuses = ['all', 'matched', 'minor-discrepancy', 'major-discrepancy'];

  // Calculate summary statistics
  const summaryStats = {
    totalItems: filteredData.length,
    matchedItems: filteredData.filter(item => item.status === 'matched').length,
    minorDiscrepancies: filteredData.filter(item => item.status === 'minor-discrepancy').length,
    majorDiscrepancies: filteredData.filter(item => item.status === 'major-discrepancy').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">
          Audits y Discrepancies
        </h1>
        <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
          Análisis comparativo entre datos locales y fuentes externas
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Total Items</p>
              <p className="text-2xl font-bold">{summaryStats.totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Coincidencias</p>
              <p className="text-2xl font-bold">{summaryStats.matchedItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Discrepancias Menores</p>
              <p className="text-2xl font-bold">{summaryStats.minorDiscrepancies}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Discrepancias Mayores</p>
              <p className="text-2xl font-bold">{summaryStats.majorDiscrepancies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar en auditorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-1">Categoría</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-1">Estado</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="matched">Coincidente</option>
            <option value="minor-discrepancy">Discrepancia Menor</option>
            <option value="major-discrepancy">Discrepancia Mayor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-1">Año</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-1">Ver</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'table' | 'chart' | 'heatmap')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="table">Tabla</option>
            <option value="chart">Gráficos</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      {viewMode === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Comparación Local vs Externa</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Monto']}
                    labelFormatter={(label) => `Categoría: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="local" name="Local" fill="#3B82F6" />
                  <Bar dataKey="external" name="Externa" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Discrepancias por Categoría</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="variance" 
                    name="% Discrepancia" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow border overflow-hidden mb-8">
          <h3 className="text-xl font-semibold p-4 border-b">Detalles de Audits</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Año</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Valor Local</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Valor Externo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Diferencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
                {filteredData.map((audit) => (
                  <tr 
                    key={audit.id} 
                    className={`${audit.id % 2 === 0 ? 'bg-white' : 'bg-gray-50 dark:bg-dark-background'} ${
                      Math.abs(audit.variancePercent) > 10 ? 'bg-red-50' : 
                      Math.abs(audit.variancePercent) > 5 ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{audit.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{audit.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{audit.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{formatCurrency(audit.localValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">{formatCurrency(audit.externalValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${
                        audit.variancePercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {audit.variancePercent > 0 ? '+' : ''}{audit.variancePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        audit.status === 'matched' ? 'bg-green-100 text-green-800' :
                        audit.status === 'minor-discrepancy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {audit.status === 'matched' ? 'Coincidente' : 
                         audit.status === 'minor-discrepancy' ? 'Discrepancia Menor' : 'Discrepancia Mayor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 dark:text-green-400 hover:text-green-900">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      

      {/* Discrepancies Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Major Discrepancies */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow border p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Discrepancias Mayores
          </h3>
          <div className="space-y-4">
            {mockAuditData
              .filter(item => item.status === 'major-discrepancy')
              .slice(0, 5)
              .map(audit => (
                <div key={`major-${audit.id}`} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">{audit.category} - {audit.year}</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {audit.variancePercent > 0 ? '+' : ''}{audit.variancePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-1">{audit.description}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                      <span>Local: {formatCurrency(audit.localValue)}</span>
                      <span>Externa: {formatCurrency(audit.externalValue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            {mockAuditData.filter(item => item.status === 'major-discrepancy').length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                No se encontraron discrepancias mayores
              </div>
            )}
          </div>
        </div>

        {/* Validation Reports */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow border p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Reportes de Validación
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
              <div className="flex justify-between">
                <span className="font-medium">Integridad de Datos</span>
                <span className="font-semibold text-green-600 dark:text-green-400">98.7%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-1">Coincidencia entre fuentes locales y externas</p>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
              <div className="flex justify-between">
                <span className="font-medium">Actualización de Datos</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">2025-09-25</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-1">Última sincronización con datos oficiales</p>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex justify-between">
                <span className="font-medium">Fuente de Datos</span>
                <span className="font-semibold text-yellow-600">Provincial</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-1">Fuente oficial de datos para validación</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditsAndDiscrepanciesPage;