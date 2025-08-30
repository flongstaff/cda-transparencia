import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Database,
  Download,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  Calendar,
  MapPin,
  Users,
  Building,
  Loader,
  RefreshCw,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import PowerBIDataService from '../../services/PowerBIDataService';

interface PowerBIFinancialData {
  category: string;
  subcategory: string;
  budgeted: number;
  executed: number;
  difference: number;
  percentage: number;
  year: number;
  quarter: string;
  department: string;
  project?: string;
}

interface PowerBIReport {
  report_date: string;
  summary: {
    datasets_extracted: number;
    tables_extracted: number;
    records_extracted: number;
    records_saved: number;
  };
}

const PowerBIFinancialDashboard: React.FC = () => {
  const [financialData, setFinancialData] = useState<PowerBIFinancialData[]>([]);
  const [report, setReport] = useState<PowerBIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string | 'all'>('all');
  const [extracting, setExtracting] = useState(false);

  // Available years for filtering
  const availableYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019];
  const availableDepartments = [
    'Salud', 'Educación', 'Infraestructura', 'Servicios Públicos', 
    'Administración General', 'Desarrollo Social', 'Seguridad', 'Cultura'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Power BI data is available
      const isAvailable = await PowerBIDataService.isDataAvailable();
      
      if (!isAvailable) {
        setError('Los datos de Power BI aún no han sido extraídos. Por favor, ejecute el proceso de extracción primero.');
        return;
      }
      
      // Load financial data and report
      const [financialData, reportData] = await Promise.all([
        PowerBIDataService.fetchFinancialData(),
        PowerBIDataService.fetchReport()
      ]);
      
      setFinancialData(financialData);
      setReport(reportData);
    } catch (err) {
      setError('Error al cargar los datos de Power BI');
      console.error('Power BI data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerExtraction = async () => {
    try {
      setExtracting(true);
      setError(null);
      
      const result = await PowerBIDataService.triggerExtraction();
      
      if (result.success) {
        // Reload data after successful extraction
        loadData();
      } else {
        setError(result.message || 'Error al ejecutar la extracción de datos de Power BI');
      }
    } catch (err) {
      setError('Error al conectar con el servidor para la extracción de datos');
      console.error('Extraction error:', err);
    } finally {
      setExtracting(false);
    }
  };

  // Filter financial data based on search and filters
  const filteredFinancialData = financialData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = yearFilter === 'all' || item.year === yearFilter;
    const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;
    
    return matchesSearch && matchesYear && matchesDepartment;
  });

  // Calculate totals for summary cards
  const totalBudgeted = financialData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalExecuted = financialData.reduce((sum, item) => sum + item.executed, 0);
  const totalDifference = totalBudgeted - totalExecuted;
  const overallPercentage = totalBudgeted > 0 ? (totalExecuted / totalBudgeted) * 100 : 0;

  // Group data by category for charts
  const categoryData = financialData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { budgeted: 0, executed: 0 };
    }
    acc[item.category].budgeted += item.budgeted;
    acc[item.category].executed += item.executed;
    return acc;
  }, {} as Record<string, { budgeted: number, executed: number }>);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de Power BI...</p>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={triggerExtraction}
              disabled={extracting}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                extracting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              <Play className={`h-4 w-4 mr-2 ${extracting ? 'animate-spin' : ''}`} />
              {extracting ? 'Extrayendo...' : 'Ejecutar Extracción'}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
              📊 Análisis Financiero Detallado
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Distribución y ejecución presupuestaria del municipio de Carmen de Areco
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={triggerExtraction}
              disabled={extracting}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                extracting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              <Play className={`h-4 w-4 mr-2 ${extracting ? 'animate-spin' : ''}`} />
              {extracting ? 'Extrayendo...' : 'Ejecutar Extracción'}
            </button>
            <button
              onClick={loadData}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
            <button className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Exportar Datos
            </button>
            {report && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Última actualización: {new Date(report.report_date).toLocaleDateString('es-AR')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Presupuestado</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(totalBudgeted)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ejecutado</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(totalExecuted)}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Diferencia</p>
              <p className={`text-2xl font-bold ${totalDifference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(totalDifference)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ejecución</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatPercentage(overallPercentage)}
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
                placeholder="Buscar por categoría, departamento o proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              >
                <option value="all">Todos los años</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">Todos los departamentos</option>
                {availableDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
            { id: 'categories', label: 'Categorías', icon: <PieChart className="h-4 w-4 mr-2" /> },
            { id: 'departments', label: 'Departamentos', icon: <Building className="h-4 w-4 mr-2" /> },
            { id: 'detailed', label: 'Datos Detallados', icon: <FileText className="h-4 w-4 mr-2" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {activeTab === 'overview' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Resumen Financiero</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget vs Execution Chart */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Ejecución Presupuestaria por Categoría</h3>
                <div className="space-y-4">
                  {Object.entries(categoryData).map(([category, data], index) => {
                    const percentage = data.budgeted > 0 ? (data.executed / data.budgeted) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatPercentage(percentage)} ({formatCurrency(data.executed)} / {formatCurrency(data.budgeted)})
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              percentage >= 95 ? 'bg-green-500' : 
                              percentage >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Top Categories Table */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Principales Categorías</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-100 dark:bg-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Presupuestado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ejecutado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">% Ejecución</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {Object.entries(categoryData)
                        .sort((a, b) => b[1].budgeted - a[1].budgeted)
                        .slice(0, 5)
                        .map(([category, data], index) => {
                          const percentage = data.budgeted > 0 ? (data.executed / data.budgeted) * 100 : 0;
                          return (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{category}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(data.budgeted)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(data.executed)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`font-medium ${
                                  percentage >= 95 ? 'text-green-600 dark:text-green-400' : 
                                  percentage >= 90 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {formatPercentage(percentage)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Distribución por Categorías</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(categoryData).map(([category, data], index) => {
                const percentage = data.budgeted > 0 ? (data.executed / data.budgeted) * 100 : 0;
                const budgetPercentage = (data.budgeted / totalBudgeted) * 100;
                
                return (
                  <div 
                    key={index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md mr-3">
                        <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h3 className="font-medium text-gray-800 dark:text-white">{category}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Presupuesto</span>
                          <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(data.budgeted)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${budgetPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Ejecutado</span>
                          <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(data.executed)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage >= 95 ? 'bg-green-500' : 
                              percentage >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Ejecución</span>
                        <span className={`font-medium ${
                          percentage >= 95 ? 'text-green-600 dark:text-green-400' : 
                          percentage >= 90 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatPercentage(percentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Distribución por Departamentos</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Departamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Presupuestado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ejecutado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Diferencia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">% Ejecución</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {availableDepartments.map((department, index) => {
                    const deptData = financialData.filter(item => item.department === department);
                    const budgeted = deptData.reduce((sum, item) => sum + item.budgeted, 0);
                    const executed = deptData.reduce((sum, item) => sum + item.executed, 0);
                    const difference = budgeted - executed;
                    const percentage = budgeted > 0 ? (executed / budgeted) * 100 : 0;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md mr-3">
                              <Building className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="text-sm font-medium text-gray-800 dark:text-white">
                              {department}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(budgeted)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(executed)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {formatCurrency(difference)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${
                            percentage >= 95 ? 'text-green-600 dark:text-green-400' : 
                            percentage >= 90 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatPercentage(percentage)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Datos Financieros Detallados</h2>
            
            {filteredFinancialData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subcategoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Departamento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Presupuestado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ejecutado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Diferencia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">% Ejecución</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredFinancialData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {item.department}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(item.budgeted)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(item.executed)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={item.difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {formatCurrency(item.difference)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${
                            item.percentage >= 95 ? 'text-green-600 dark:text-green-400' : 
                            item.percentage >= 90 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatPercentage(item.percentage)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No hay datos que coincidan con los filtros
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Intente ajustar los filtros de búsqueda para ver más resultados.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Information Banner */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Análisis Comparativo
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Estos datos se extraen directamente del reporte de Power BI del municipio de Carmen de Areco 
                y se comparan con los documentos oficiales PDF para identificar posibles discrepancias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerBIFinancialDashboard;