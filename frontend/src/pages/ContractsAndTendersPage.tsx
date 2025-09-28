import React, { useState } from 'react';
import { 
  Building, 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  Download,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import SankeyDiagram from '../components/data-display/SankeyDiagram';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMasterData } from '../hooks/useMasterData';

// Mock data for demonstration
const mockTendersData = [
  {
    id: 1,
    title: 'Licitación Obras Viales 2023',
    vendor: 'Construcciones S.A.',
    amount: 50000000,
    category: 'Obras Públicas',
    year: 2023,
    status: 'completed',
    startDate: '2023-03-15',
    endDate: '2023-12-20',
    execution: 47500000,
    executionRate: 95
  },
  {
    id: 2,
    title: 'Mantenimiento Parques y Plazas',
    vendor: 'Verde Urbano S.R.L.',
    amount: 15000000,
    category: 'Servicios Públicos',
    year: 2023,
    status: 'in-progress',
    startDate: '2023-05-10',
    endDate: '2024-02-15',
    execution: 8500000,
    executionRate: 56.7
  },
  {
    id: 3,
    title: 'Suministro de Equipamiento Médico',
    vendor: 'Salud Técnica S.A.',
    amount: 25000000,
    category: 'Salud y Acción Social',
    year: 2023,
    status: 'completed',
    startDate: '2023-01-20',
    endDate: '2023-08-30',
    execution: 25000000,
    executionRate: 100
  },
  {
    id: 4,
    title: 'Software Gestión Municipal',
    vendor: 'Tech Solutions S.A.',
    amount: 8000000,
    category: 'Administración',
    year: 2023,
    status: 'pending',
    startDate: '2023-10-05',
    endDate: '2024-05-15',
    execution: 0,
    executionRate: 0
  }
];

// Sankey data
const sankeyData = {
  nodes: [
    { id: 'contratos', name: 'Contratos 2023' },
    { id: 'obras', name: 'Obras Públicas' },
    { id: 'servicios', name: 'Servicios Públicos' },
    { id: 'salud', name: 'Salud' },
    { id: 'admin', name: 'Administración' },
    { id: 'ejecutado', name: 'Total Ejecutado' }
  ],
  links: [
    { source: 'contratos', target: 'obras', value: 50000000 }, // Obras Viales
    { source: 'contratos', target: 'servicios', value: 15000000 }, // Parques
    { source: 'contratos', target: 'salud', value: 25000000 }, // Equipamiento Médico
    { source: 'contratos', target: 'admin', value: 8000000 },  // Software
    { source: 'obras', target: 'ejecutado', value: 47500000 }, // Obras Ejecutado
    { source: 'servicios', target: 'ejecutado', value: 8500000 },  // Parques Ejecutado
    { source: 'salud', target: 'ejecutado', value: 25000000 }, // Salud Ejecutado
    { source: 'admin', target: 'ejecutado', value: 0 }         // Software Ejecutado
  ]
};

const ContractsAndTendersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('amount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // 🚀 Use master data service that includes all contract sources
  const {
    currentContracts,
    loading,
    error,
    refetch
  } = useMasterData(selectedYear);

  // Format currency function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Use real contract data if available, fallback to mock data for demo
  const contractsData = currentContracts && currentContracts.length > 0 ? currentContracts : mockTendersData;

  // Filter and sort data
  let filteredData = [...contractsData];
  
  if (searchTerm) {
    filteredData = filteredData.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
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
    
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'vendor') {
      comparison = a.vendor.localeCompare(b.vendor);
    } else if (sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortBy === 'year') {
      comparison = a.year - b.year;
    } else if (sortBy === 'executionRate') {
      comparison = a.executionRate - b.executionRate;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  // Prepare data for charts
  const categoryTotals = filteredData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { category: item.category, total: 0, executed: 0 };
    }
    acc[item.category].total += item.amount;
    acc[item.category].executed += item.execution;
    return acc;
  }, {} as Record<string, { category: string; total: number; executed: number }>);

  const categoryData = Object.values(categoryTotals).map(cat => ({
    name: cat.category,
    total: cat.total,
    executed: cat.executed
  }));

  // Get unique years and categories for filters
  const uniqueYears = Array.from(new Set(contractsData.map(item => item.year))).sort((a, b) => b - a);
  const uniqueCategories = Array.from(new Set(contractsData.map(item => item.category)));

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando contratos y licitaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar los datos</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Contratos y Licitaciones
        </h1>
        <p className="text-gray-600">
          Seguimiento de contratos y licitaciones municipales
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar contratos, proveedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="in-progress">En Progreso</option>
            <option value="completed">Completado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="amount">Monto</option>
            <option value="title">Título</option>
            <option value="vendor">Proveedor</option>
            <option value="year">Año</option>
            <option value="executionRate">Tasa Ejecución</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Contratos por Categoría</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Monto']}
                  labelFormatter={(label) => `Categoría: ${label}`}
                />
                <Legend />
                <Bar dataKey="total" name="Total Contratado" fill="#3B82F6" />
                <Bar dataKey="executed" name="Total Ejecutado" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Flujo de Contratos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {mockTendersData && mockTendersData.length > 0 ? (
                <SankeyDiagram
                  data={sankeyData}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No hay datos suficientes para mostrar el diagrama Sankey
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <h3 className="text-xl font-semibold p-4 border-b">Lista de Contratos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejecutado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa Ejecución</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((contract) => (
                <tr key={contract.id} className={contract.id % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                    <div className="text-sm text-gray-500">ID: {contract.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.vendor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(contract.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(contract.execution)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">{contract.executionRate}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            contract.executionRate >= 90 ? 'bg-green-500' :
                            contract.executionRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(contract.executionRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contract.status === 'completed' ? 'bg-green-100 text-green-800' :
                      contract.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {contract.status === 'completed' ? 'Completado' : 
                       contract.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
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

      {/* Contract Details Panel */}
      <div className="mt-8 bg-white rounded-lg shadow border p-6">
        <h3 className="text-xl font-semibold mb-4">Análisis de Contratos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Contratos</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Monto Total</p>
                <p className="text-2xl font-bold">{formatCurrency(filteredData.reduce((sum, c) => sum + c.amount, 0))}</p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Tasa Promedio</p>
                <p className="text-2xl font-bold">
                  {filteredData.length > 0 
                    ? (filteredData.reduce((sum, c) => sum + c.executionRate, 0) / filteredData.length).toFixed(1) 
                    : '0'}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium mb-2">Contratos con Anomalías</h4>
          <div className="space-y-2">
            {filteredData.filter(c => c.executionRate < 75).map(contract => (
              <div key={`anomaly-${contract.id}`} className="flex items-center p-3 bg-red-50 border border-red-200 rounded">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-sm">
                  <span className="font-medium">{contract.title}</span> - Solo {contract.executionRate}% ejecutado
                </span>
              </div>
            ))}
            {filteredData.filter(c => c.executionRate < 75).length === 0 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm">No se encontraron contratos con ejecución crítica</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsAndTendersPage;