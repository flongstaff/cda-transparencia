import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { formatCurrencyARS } from '../utils/formatters';
import PageYearSelector from '../components/selectors/PageYearSelector';
import { useDocumentAnalysis, useFinancialOverview } from '../hooks/useComprehensiveData';
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

  // Hooks
  const { documents, loading: docsLoading, error: docsError } = useDocumentAnalysis({
    year: selectedYear,
    category,
  });
  const { data: financial, loading: financialLoading, error: financialError } = useFinancialOverview(selectedYear);

  const loading = docsLoading || financialLoading;
  const error = docsError || financialError;

  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const categoryData = React.useMemo(() => {
    if (!financial || !documents) return null;

    const categoryDocuments = documents.filter(
      (doc) =>
        doc.category?.toLowerCase().includes(category.toLowerCase()) ||
        doc.type?.toLowerCase().includes(category.toLowerCase())
    );

    return {
      name: title,
      total_documents: categoryDocuments.length,
      total_size_mb: categoryDocuments.reduce(
        (sum, doc) => sum + (parseFloat(doc.size_mb?.toString() || '0')),
        0
      ),
      financial_data: {
        budgeted: financial?.totalBudget ?? 0,
        executed: financial?.totalExecuted ?? 0,
        execution_rate: financial?.executionRate ?? 0,
        category_breakdown: financial?.categoryBreakdown ?? [],
      },
      documents: categoryDocuments,
    };
  }, [financial, documents, category, title]);

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

  if (!categoryData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-600">Los datos para esta categoría aún no han sido cargados.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with year selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {icon} {title}
          </h1>
          <p className="text-gray-600">
            Datos de {title.toLowerCase()} para el año {selectedYear}
          </p>
        </div>
        <PageYearSelector
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
        />
      </div>

      {/* Financial summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Financiero</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{formatCurrencyARS(categoryData.financial_data.budgeted)}</p>
            <p className="text-sm text-gray-600">Presupuestado</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrencyARS(categoryData.financial_data.executed)}</p>
            <p className="text-sm text-gray-600">Ejecutado</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{categoryData.financial_data.execution_rate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Tasa de Ejecución</p>
          </div>
        </div>
      </div>

      {/* Documents summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Documentos Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{categoryData.total_documents}</p>
            <p className="text-sm text-gray-600">Total de Documentos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{categoryData.total_size_mb.toFixed(1)} MB</p>
            <p className="text-sm text-gray-600">Tamaño Total</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;