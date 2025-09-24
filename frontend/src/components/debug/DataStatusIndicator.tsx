import React from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrencyARS } from '../../utils/formatters';

interface DataStatusIndicatorProps {
  structured: any;
  documents: any;
  loading: boolean;
  error: string | null;
  selectedYear: number;
}

const DataStatusIndicator: React.FC<DataStatusIndicatorProps> = ({
  structured,
  documents,
  loading,
  error,
  selectedYear
}) => {
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-800">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Error: {error}</span>
        </div>
      </div>
    );
  }

  // Check what data is available
  const budgetData = structured?.budget?.[selectedYear];
  const salaryData = structured?.salaries?.[selectedYear];
  const debtData = structured?.debt?.[selectedYear];
  const documentCount = documents?.all?.length || 0;

  const getStatusIcon = (hasData: boolean) => {
    return hasData ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        Estado de los datos para {selectedYear}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center">
          {getStatusIcon(!!budgetData)}
          <span className="ml-1">Presupuesto</span>
        </div>
        <div className="flex items-center">
          {getStatusIcon(!!salaryData)}
          <span className="ml-1">Salarios</span>
        </div>
        <div className="flex items-center">
          {getStatusIcon(!!debtData)}
          <span className="ml-1">Deudas</span>
        </div>
        <div className="flex items-center">
          {getStatusIcon(documentCount > 0)}
          <span className="ml-1">Documentos ({documentCount})</span>
        </div>
      </div>

      {budgetData && (
        <div className="mt-3 text-xs text-gray-600">
          <strong>Presupuesto Total:</strong> {formatCurrencyARS(budgetData.totalBudget || 0)}
          {' | '}
          <strong>Ejecutado:</strong> {formatCurrencyARS(budgetData.totalExecuted || 0)}
        </div>
      )}

      {salaryData && (
        <div className="mt-1 text-xs text-gray-600">
          <strong>Empleados:</strong> {salaryData.employeeCount || 0}
          {' | '}
          <strong>Nómina Total:</strong> {formatCurrencyARS(salaryData.totalPayroll || 0)}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Datos cargados desde: organized_analysis + GitHub repository
      </div>
    </div>
  );
};

export default DataStatusIndicator;