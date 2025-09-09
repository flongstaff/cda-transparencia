import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, FileText, BarChart3, Eye, DollarSign, TrendingUp, Coins, Users } from 'lucide-react';
import { consolidatedApiService } from '../services';
import { formatCurrencyARS } from '../utils/formatters';
import ValidatedChart from '../components/charts/ValidatedChart';
import DocumentViewer from '../components/DocumentViewer';
import PageYearSelector from '../components/selectors/PageYearSelector';
import UnifiedFinancialDashboard from '../components/dashboard/UnifiedFinancialDashboard';

interface Document {
  id: string;
  title: string;
  filename: string;
  year: number;
  category: string;
  type: string;
  size_mb: number;
  url: string;
  official_url: string;
  verification_status: string;
  processing_date: string;
}

interface FinancialData {
  budgeted: number;
  executed: number;
  execution_rate: number;
  category_breakdown: Array<{
    name: string;
    budgeted: number;
    executed: number;
    execution_rate: number;
  }>;
}

interface CategoryData {
  name: string;
  total_documents: number;
  total_size_mb: number;
  financial_data: FinancialData;
  documents: Document[];
  // Debt-specific data
  debt_data?: {
    total_debt: number;
    debt_breakdown: Array<{
      type: string;
      amount: number;
      interest_rate: number;
      due_date: string;
    }>;
  };
}

interface CategoryPageProps {
  category?: string;
  title?: string;
  icon?: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ category = 'budget', title = 'Presupuesto', icon = '💰' }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'documents' | 'data' | 'charts' | 'debt'>('overview');

  // Category definitions
  const categories = [
    { id: 'budget', name: 'Presupuesto', icon: '💰' },
    { id: 'expenses', name: 'Gastos', icon: '💸' },
    { id: 'revenue', name: 'Ingresos', icon: '📈' },
    { id: 'debt', name: 'Deuda', icon: '💳' },
    { id: 'salaries', name: 'Salarios', icon: '👥' },
    { id: 'contracts', name: 'Contratos', icon: '📋' },
    { id: 'infrastructure', name: 'Infraestructura', icon: '🏗️' },
    { id: 'services', name: 'Servicios', icon: '公共服务' }
  ];

  useEffect(() => {
    loadAvailableYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadCategoryData();
    }
  }, [selectedYear, category]);

  const loadAvailableYears = async () => {
    try {
      const years = await consolidatedApiService.getAvailableYears();
      setAvailableYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch (error) {
      console.error('Error loading available years:', error);
      // Fallback to recent years
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear, currentYear - 1, currentYear - 2, currentYear - 3]);
      setSelectedYear(currentYear);
    }
  };

  const loadCategoryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create category data from consolidated API service
      let documents: Document[] = [];
      let financial_data: FinancialData = {
        budgeted: 0,
        executed: 0,
        execution_rate: 0,
        category_breakdown: []
      };

      // Load documents for this category
      documents = await consolidatedApiService.getDocuments(selectedYear, category);
      
      // Load financial data based on category
      if (category === 'budget' || category === 'expenses' || category === 'revenue') {
        const budgetData = await consolidatedApiService.getBudgetData(selectedYear);
        financial_data = {
          budgeted: budgetData.total_budgeted,
          executed: budgetData.total_executed,
          execution_rate: parseFloat(budgetData.execution_rate) || 0,
          category_breakdown: Object.entries(budgetData.categories || {}).map(([name, data]) => ({
            name,
            budgeted: data.budgeted || 0,
            executed: data.executed || 0,
            execution_rate: parseFloat(data.execution_rate) || 0
          }))
        };
      }

      const data: CategoryData = {
        name: title,
        total_documents: documents.length,
        total_size_mb: documents.reduce((sum, doc) => sum + (parseFloat(doc.size_mb?.toString() || '0')), 0),
        financial_data,
        documents
      };
      setCategoryData(data);
    } catch (err) {
      console.error('Error loading category data:', err);
      setError('Error al cargar los datos de la categoría');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = categoryData?.documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de la categoría...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            No hay datos disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Los datos para esta categoría aún no han sido cargados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with year selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {icon} {title}
            </h1>
            <p className="text-gray-600">
              Datos de {title.toLowerCase()} para el año {selectedYear}
            </p>
          </div>
          <PageYearSelector
            years={availableYears}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Simple financial summary */}
      {categoryData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Financiero</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrencyARS(categoryData.financial_data.budgeted)}
              </p>
              <p className="text-sm text-gray-600">Presupuestado</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrencyARS(categoryData.financial_data.executed)}
              </p>
              <p className="text-sm text-gray-600">Ejecutado</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {categoryData.financial_data.execution_rate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Tasa de Ejecución</p>
            </div>
          </div>
        </div>
      )}

      {/* Documents summary */}
      {categoryData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documentos Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {categoryData.total_documents}
              </p>
              <p className="text-sm text-gray-600">Total de Documentos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {categoryData.total_size_mb.toFixed(1)} MB
              </p>
              <p className="text-sm text-gray-600">Tamaño Total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;