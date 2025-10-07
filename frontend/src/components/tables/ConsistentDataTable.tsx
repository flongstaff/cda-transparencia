import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrencyARS } from '../../utils/formatters';
import { useUnifiedData } from '../../hooks/useUnifiedData';

interface ConsistentDataTableProps {
  pageType: 'budget' | 'treasury' | 'debt' | 'contracts' | 'salaries' | 'documents';
  year: number;
  title?: string;
  description?: string;
  className?: string;
  showPagination?: boolean;
  rowsPerPage?: number;
  valueFormatter?: (value: number) => string;
  includeExternal?: boolean; // Whether to include data from multiple sources (RAFAM, GBA, etc.)
}

/**
 * Consistent Data Table Component
 * Provides standardized tabular representation across all pages using unified data sources
 * Integrates local CSV/JSON with external API data (RAFAM, GBA, AFIP, etc.)
 */
const ConsistentDataTable: React.FC<ConsistentDataTableProps> = ({
  pageType,
  year,
  title,
  description,
  className = '',
  showPagination = false,
  rowsPerPage = 10,
  valueFormatter = formatCurrencyARS,
  includeExternal = false
}) => {
  const { data, sources, externalData, loading, error, activeSources } = useUnifiedData({ 
    page: pageType, 
    year,
    includeExternal
  });

  // Define columns based on page type
  const columns = useMemo(() => {
    switch (pageType) {
      case 'budget':
        return [
          { key: 'name', label: 'Concepto', type: 'text' },
          { key: 'budgeted', label: 'Presupuestado', type: 'currency' },
          { key: 'executed', label: 'Ejecutado', type: 'currency' },
          { key: 'execution_rate', label: 'Ejecución %', type: 'percentage' },
          { key: 'difference', label: 'Diferencia', type: 'currency' }
        ];
      case 'treasury':
        return [
          { key: 'name', label: 'Categoría', type: 'text' },
          { key: 'income', label: 'Ingresos', type: 'currency' },
          { key: 'expense', label: 'Gastos', type: 'currency' },
          { key: 'balance', label: 'Saldo', type: 'currency' }
        ];
      case 'debt':
        return [
          { key: 'name', label: 'Tipo', type: 'text' },
          { key: 'amount', label: 'Monto', type: 'currency' },
          { key: 'service', label: 'Servicio', type: 'currency' }
        ];
      case 'contracts':
        return [
          { key: 'name', label: 'Contrato', type: 'text' },
          { key: 'amount', label: 'Monto', type: 'currency' },
          { key: 'status', label: 'Estado', type: 'text' },
          { key: 'date', label: 'Fecha', type: 'date' }
        ];
      case 'salaries':
        return [
          { key: 'name', label: 'Cargo', type: 'text' },
          { key: 'count', label: 'Cantidad', type: 'number' },
          { key: 'avg_salary', label: 'Promedio', type: 'currency' },
          { key: 'total', label: 'Total', type: 'currency' }
        ];
      case 'documents':
        return [
          { key: 'name', label: 'Categoría', type: 'text' },
          { key: 'count', label: 'Cantidad', type: 'number' },
          { key: 'year', label: 'Año', type: 'number' }
        ];
      default:
        return [
          { key: 'name', label: 'Concepto', type: 'text' },
          { key: 'value', label: 'Valor', type: 'currency' }
        ];
    }
  }, [pageType]);

  // Process data for display
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.slice(0, showPagination ? rowsPerPage : undefined);
  }, [data, showPagination, rowsPerPage]);

  // Format values based on type
  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';

    switch (type) {
      case 'currency':
        return valueFormatter(Number(value));
      case 'percentage':
        return `${Number(value).toFixed(2)}%`;
      case 'number':
        return Number(value).toLocaleString();
      case 'date':
        return value ? new Date(value).toLocaleDateString('es-AR') : '-';
      default:
        return String(value);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <div className="flex flex-col">
          {title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
          )}
          <div className="flex-1 flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <div className="flex flex-col">
          {title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
          )}
          <div className="flex-1 flex items-center justify-center h-64">
            <div className="text-center p-4">
              <div className="text-red-500 text-2xl mb-2">⚠️</div>
              <p className="text-gray-600">Error al cargar datos: {error}</p>
              <p className="text-sm text-gray-500 mt-1">Verificando fuentes alternativas...</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!processedData || processedData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <div className="flex flex-col">
          {title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
          )}
          <div className="flex-1 flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-2xl mb-2">📊</div>
              <p className="text-gray-600">No hay datos disponibles para mostrar</p>
              <p className="text-sm text-gray-500 mt-1">Integrando fuentes de datos...</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {description}
            </p>
          )}
          
          {/* Data source indicator */}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              📊 Datos Integrados
            </span>
            {includeExternal && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                🔗 Fuentes Múltiples
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              📅 Año {year}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {processedData.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                  >
                    {formatValue(row[column.key], column.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination and info */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {processedData.length} de {Array.isArray(data) ? data.length : 0} registros
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
          {sources && <span>Fuentes: {sources.length}</span>}
          {activeSources && <span>Activas: {activeSources.length}</span>}
          <span>Actualizado: {new Date().toLocaleDateString('es-AR')}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsistentDataTable;