import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import FinancialOverview from './FinancialOverview';
import { useMasterData } from '../hooks/useMasterData';
import { Document, Page } from 'react-pdf';

interface YearlyData {
  year: number;
  total_budget: number;
  revenues: number;
  expenses: number;
  executed_infra: number;
  personnel: number;
  execution_rate: number;
}

const YearlyFinancesPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('execution_rate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  
  // Use unified master data service
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    loading,
    error,
    totalDocuments,
    availableYears: dataAvailableYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // Available years for selection
  const availableYears = dataAvailableYears.length > 0 ? dataAvailableYears : [2020, 2021, 2022, 2023, 2024, 2025];

  // Get yearly data from masterData
  const yearlyData = Object.entries(masterData?.multiYearData || {}).map(([year, data]) => ({
    year: parseInt(year),
    total_budget: data.budget?.total_budget || 0,
    revenues: data.budget?.revenues || 0,
    expenses: data.budget?.expenses || 0,
    executed_infra: data.budget?.executed_infra || 0,
    personnel: data.budget?.personnel || 0,
    execution_rate: data.budget?.execution_rate || 0,
  }));

  // Mock data for demonstration
  const mockYearlyData: Record<number, { markdown: string; pdfUrls: string[] }> = {
    2020: {
      markdown: `# Resumen Financiero 2020

Presupuesto: $1,200,000,000
Ejecutado: $1,100,000,000
Tasa de ejecución: 91.7%`,
      pdfUrls: [
        "/data/organized_documents/pdfs/estado-ejecucion-gastos-2020.pdf",
        "/data/organized_documents/pdfs/presupuesto-2020.pdf"
      ]
    },
    2021: {
      markdown: `# Resumen Financiero 2021

Presupuesto: $1,350,000,000
Ejecutado: $1,250,000,000
Tasa de ejecución: 92.6%`,
      pdfUrls: [
        "/data/organized_documents/pdfs/estado-ejecucion-gastos-2021.pdf",
        "/data/organized_documents/pdfs/presupuesto-2021.pdf"
      ]
    },
    2022: {
      markdown: `# Resumen Financiero 2022

Presupuesto: $1,500,000,000
Ejecutado: $1,400,000,000
Tasa de ejecución: 93.3%`,
      pdfUrls: [
        "/data/organized_documents/pdfs/estado-ejecucion-gastos-2022.pdf",
        "/data/organized_documents/pdfs/presupuesto-2022.pdf"
      ]
    },
    2023: {
      markdown: `# Resumen Financiero 2023

Presupuesto: $1,800,000,000
Ejecutado: $1,700,000,000
Tasa de ejecución: 94.4%`,
      pdfUrls: [
        "/data/organized_documents/pdfs/estado-ejecucion-gastos-2023.pdf",
        "/data/organized_documents/pdfs/presupuesto-2023.pdf"
      ]
    },
    2024: {
      markdown: `# Resumen Financiero 2024

Presupuesto: $2,100,000,000
Ejecutado: $2,000,000,000
Tasa de ejecución: 95.2%`,
      pdfUrls: [
        "/data/organized_documents/pdfs/estado-ejecucion-gastos-2024.pdf",
        "/data/organized_documents/pdfs/presupuesto-2024.pdf"
      ]
    },
    2025: {
      markdown: `# Resumen Financiero 2025

Presupuesto: $2,400,000,000
Ejecutado: $2,300,000,000
Tasa de ejecución: 95.8%`,
      pdfUrls: [
        "/data/organized_documents/pdfs/estado-ejecucion-gastos-2025.pdf",
        "/data/organized_documents/pdfs/presupuesto-2025.pdf"
      ]
    }
  };

  // Filter and sort yearly data
  let filteredData = yearlyData;
  
  if (filterCategory !== 'all') {
    // For now, we'll keep all data since we don't have categories in YearlyData
    // In a real implementation, you would filter by category
  }
  
  if (searchTerm) {
    filteredData = filteredData.filter(data => 
      data.year.toString().includes(searchTerm.toLowerCase())
    );
  }
  
  filteredData.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'year') {
      comparison = a.year - b.year;
    } else if (sortBy === 'total_budget') {
      comparison = a.total_budget - b.total_budget;
    } else if (sortBy === 'expenses') {
      comparison = a.expenses - b.expenses;
    } else {
      comparison = a.execution_rate - b.execution_rate;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Prepare data for charts
  const chartData = filteredData.map(data => ({
    name: `Año ${data.year}`,
    Presupuestado: data.total_budget,
    Ejecutado: data.expenses,
    Tasa: data.execution_rate
  }));

  // Function to format currency
  const formatCurrency = (amount: number): _string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle PDF loading
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Toggle year expansion
  const toggleYear = (year: number) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Finanzas Anuales
        </h1>
        <p className="text-gray-600">
          Análisis detallado del presupuesto municipal por año fiscal
        </p>
      </div>

      {/* Financial Overview for All Years */}
      <div className="mb-8">
        <FinancialOverview />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            <option value="executed">Ejecutado</option>
            <option value="budgeted">Presupuestado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="execution_rate">Tasa de Ejecución</option>
            <option value="year">Año</option>
            <option value="total_budget">Presupuestado</option>
            <option value="expenses">Ejecutado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setSortOrder('asc')}
              className={`flex-1 px-3 py-2 border rounded-lg ${
                sortOrder === 'asc' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Asc
            </button>
            <button
              onClick={() => setSortOrder('desc')}
              className={`flex-1 px-3 py-2 border rounded-lg ${
                sortOrder === 'desc' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Desc
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar años..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Presupuestado vs Ejecutado</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                  labelFormatter={(label) => `Año: ${label}`}
                />
                <Legend />
                <Bar dataKey="Presupuestado" name="Presupuestado" fill="#3B82F6" />
                <Bar dataKey="Ejecutado" name="Ejecutado" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Tasa de Ejecución por Año</h3>
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
                  dataKey="Tasa" 
                  name="Tasa de Ejecución" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Yearly Comparison Accordion */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Comparación por Año</h3>
        <div className="space-y-4">
          {availableYears.map(year => (
            <div key={year} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleYear(year)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                <span className="text-lg font-medium">Año {year}</span>
                {expandedYear === year ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedYear === year && (
                <div className="p-4">
                  <h4 className="text-md font-medium mb-2">Resumen de {year}</h4>
                  <div className="h-64 overflow-y-auto">
                    {mockYearlyData[year as keyof typeof mockYearlyData]?.markdown && (
                      <div className="prose max-w-none">
                        <ReactMarkdown>
                          {mockYearlyData[year as keyof typeof mockYearlyData].markdown}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  
                  {/* PDF Viewers for the year */}
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Documentos PDF</h5>
                    <div className="space-y-4">
                      {mockYearlyData[year as keyof typeof mockYearlyData]?.pdfUrls.map((pdfUrl, idx) => (
                        <div key={idx} className="border rounded p-2">
                          <a 
                            href={pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center mb-2"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Documento {idx + 1} - {year}
                          </a>
                          
                          {/* PDF Preview using react-pdf */}
                          <div className="h-96 border rounded">
                            <Document
                              file={pdfUrl}
                              onLoadSuccess={onDocumentLoadSuccess}
                              error={<div className="h-full flex items-center justify-center text-red-500">Error al cargar el PDF</div>}
                              loading={<div className="h-full flex items-center justify-center">Cargando PDF...</div>}
                            >
                              <Page 
                                pageNumber={pageNumber} 
                                width={600}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                              />
                            </Document>
                            {numPages && (
                              <div className="flex items-center justify-between mt-2">
                                <button
                                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                                  disabled={pageNumber <= 1}
                                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                >
                                  Anterior
                                </button>
                                <span>Página {pageNumber} de {numPages}</span>
                                <button
                                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                                  disabled={pageNumber >= numPages}
                                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                >
                                  Siguiente
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <h3 className="text-xl font-semibold p-4 border-b">Desglose Detallado</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presupuestado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejecutado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa Ejecución</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Infraestructura</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((data, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.total_budget)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.expenses)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">{data.execution_rate}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            data.execution_rate >= 90 ? 'bg-green-500' :
                            data.execution_rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(data.execution_rate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.executed_infra)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.personnel)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default YearlyFinancesPage;