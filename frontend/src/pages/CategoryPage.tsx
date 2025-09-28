import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { formatCurrencyARS } from '../utils/formatters';
import PageYearSelector from '../components/forms/PageYearSelector';
import { useMasterData } from '../hooks/useMasterData';
import { Link } from 'react-router-dom';

interface CategoryPageProps {
  category?: string;
  title?: string;
  icon?: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({
  category = 'budget',
  title = 'Presupuesto',
  icon = '💰',
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // 🚀 Use unified master data
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
    availableYears,
    categories: allCategories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);
  
  // Get data specific to the category
  const _categoryData = React.useMemo(() => {
    switch(category.toLowerCase()) {
      case 'budget':
        return currentBudget;
      case 'contracts':
        return currentContracts;
      case 'documents':
        return currentDocuments;
      case 'salaries':
        return currentSalaries;
      case 'treasury':
        return currentTreasury;
      default:
        return masterData?.yearData?.[category as keyof typeof masterData.yearData] || {};
    }
  }, [category, currentBudget, currentContracts, currentDocuments, currentSalaries, currentTreasury, masterData]);

  // Filter documents by category
  const categoryDocuments = React.useMemo(() => {
    if (!currentYearData?.documents) return [];
    
    return currentYearData.documents.filter(
      (doc) =>
        doc.category?.toLowerCase().includes(category.toLowerCase()) ||
        doc.type?.toLowerCase().includes(category.toLowerCase()) ||
        doc.title?.toLowerCase().includes(category.toLowerCase()) ||
        doc.filename?.toLowerCase().includes(category.toLowerCase())
    );
  }, [currentYearData?.documents, category]);

  // Extract financial data for this category
  const categoryFinancialData = React.useMemo(() => {
    if (!currentYearData?.budget) return null;
    
    // Try to find category-specific financial data
    const categories = currentYearData.budget.categories || [];
    const matchingCategory = categories.find(
      (props: Record<string, unknown>) => 
        cat.name?.toLowerCase().includes(category.toLowerCase()) ||
        cat.category?.toLowerCase().includes(category.toLowerCase())
    );
    
    return matchingCategory || {
      name: title,
      budgeted: currentYearData.budget.total_budget || 0,
      executed: currentYearData.budget.total_executed || 0,
      execution_rate: currentYearData.budget.execution_rate || 0,
      category_breakdown: categories
    };
  }, [currentYearData?.budget, category, title]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de la categoría…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-700">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {icon} {title}
            </h1>
            <p className="text-gray-600">
              Análisis detallado de {title.toLowerCase()} para el año {selectedYear}
            </p>
          </div>
          <PageYearSelector
            availableYears={metrics.availableYears}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documentos</p>
              <p className="text-2xl font-bold text-gray-900">{categoryDocuments.length}</p>
            </div>
          </div>
        </div>

        {categoryFinancialData && (
          <>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Presupuestado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrencyARS(categoryFinancialData.budgeted || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ejecutado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrencyARS(categoryFinancialData.executed || 0)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Documentos de {title}</h2>
        
        {categoryDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryDocuments.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{doc.title}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {doc.type?.toUpperCase() || 'DOC'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{doc.category}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{doc.size_mb?.toFixed(1)} MB</span>
                  <Link
                    to={`/document/${doc.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron documentos para la categoría "{title}" en el año {selectedYear}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;