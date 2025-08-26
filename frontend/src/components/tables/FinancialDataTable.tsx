import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Sort,
  ChevronUp,
  ChevronDown,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { formatCurrencyARS, formatDateARS } from '../../utils/formatters';

interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  format?: 'currency' | 'date' | 'text' | 'number' | 'percentage';
  className?: string;
}

interface Props {
  data: any[];
  columns: Column[];
  title: string;
  loading?: boolean;
  error?: string | null;
  onRowClick?: (row: any) => void;
  onExport?: () => void;
  searchable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  itemsPerPage?: number;
}

const FinancialDataTable: React.FC<Props> = ({
  data,
  columns,
  title,
  loading = false,
  error = null,
  onRowClick,
  onExport,
  searchable = true,
  filterable = true,
  paginated = true,
  itemsPerPage = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filter
    if (filterColumn && filterValue) {
      result = result.filter(row => {
        const value = row[filterColumn];
        if (value == null) return false;
        return String(value).toLowerCase().includes(filterValue.toLowerCase());
      });
    }

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Convert to appropriate types for comparison
        const column = columns.find(col => col.key === sortColumn);
        if (column?.format === 'currency' || column?.format === 'number') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        } else if (column?.format === 'date') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else {
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, filterColumn, filterValue, columns]);

  const paginatedData = useMemo(() => {
    if (!paginated) return filteredAndSortedData;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage, paginated]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (row: any, selected: boolean) => {
    const newSelected = new Set(selectedRows);
    if (selected) {
      newSelected.add(row);
    } else {
      newSelected.delete(row);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(paginatedData));
    } else {
      setSelectedRows(new Set());
    }
  };

  const formatCellValue = (value: any, format?: string) => {
    if (value == null || value === '') return '-';

    switch (format) {
      case 'currency':
        return formatCurrencyARS(parseFloat(value) || 0);
      case 'date':
        return formatDateARS(new Date(value));
      case 'percentage':
        return `${parseFloat(value).toFixed(2)}%`;
      case 'number':
        return parseFloat(value).toLocaleString('es-AR');
      default:
        return String(value);
    }
  };

  const getCellIcon = (format?: string) => {
    switch (format) {
      case 'currency':
        return <DollarSign size={14} className="text-green-500 mr-1" />;
      case 'date':
        return <Calendar size={14} className="text-blue-500 mr-1" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredAndSortedData.length} registros encontrados
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download size={16} className="mr-1" />
                Exportar
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        {(searchable || filterable) && (
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            {searchable && (
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en todos los campos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}

            {filterable && (
              <div className="flex gap-2">
                <select
                  value={filterColumn}
                  onChange={(e) => setFilterColumn(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Filtrar por columna</option>
                  {columns.map(column => (
                    <option key={column.key} value={column.key}>{column.header}</option>
                  ))}
                </select>
                
                {filterColumn && (
                  <div className="relative">
                    <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Valor del filtro..."
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {/* Select all checkbox */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && (
                      <div className="ml-2 flex flex-col">
                        <ChevronUp 
                          size={12} 
                          className={`${sortColumn === column.key && sortDirection === 'asc' ? 'text-primary-500' : 'text-gray-300'}`}
                        />
                        <ChevronDown 
                          size={12} 
                          className={`${sortColumn === column.key && sortDirection === 'desc' ? 'text-primary-500' : 'text-gray-300'}`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {/* Actions column */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedRows.has(row) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                {/* Select row checkbox */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row)}
                    onChange={(e) => handleRowSelect(row, e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      column.className || 'text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      {getCellIcon(column.format)}
                      {formatCellValue(row[column.key], column.format)}
                    </div>
                  </td>
                ))}
                
                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    {onRowClick && (
                      <button
                        onClick={() => onRowClick(row)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    
                    {row.official_url && (
                      <a
                        href={row.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Ver documento original"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {paginatedData.length === 0 && (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {filteredAndSortedData.length === 0 ? 'No hay datos disponibles' : 'No se encontraron resultados'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Anterior
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      pageNum === currentPage
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FinancialDataTable;