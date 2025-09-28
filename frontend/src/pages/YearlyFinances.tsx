import React from 'react';
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTable } from 'react-table';
import { useMasterData } from '../hooks/useMasterData';

const YearlyFinances = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
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
    availableYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // Define columns for the table
  const columns = [
    { Header: 'Año', accessor: 'year' },
    { 
      Header: 'Planificado (ARS)', 
      accessor: 'planificado',
      Cell: ({ value }: { value: number }) => value ? `${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'
    },
    { 
      Header: 'Ejecutado (ARS)', 
      accessor: 'ejecutado',
      Cell: ({ value }: { value: number }) => value ? `${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'
    },
    { 
      Header: '% Ejecución', 
      accessor: 'ejecucionPorcentaje',
      Cell: ({ value }: { value: string }) => `${value}%`
    },
  ];

  // Prepare data for charts and tables
  const financialData = availableYears.map(year => {
    const yearData = masterData?.multiYearData[year] || {};
    const budget = yearData.budget || {};
    const executed = budget.expenses || 0;
    const planned = budget.total_budget || 0;
    const executionPercentage = planned > 0 ? ((executed / planned) * 100).toFixed(2) : '0.00';
    
    return {
      year,
      ejecutado: executed,
      planificado: planned,
      ejecucionPorcentaje: executionPercentage,
    };
  });

  // Create table instance
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: financialData,
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const BAR_COLORS = ['#0088FE', '#FF8042'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando datos financieros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Finanzas Anuales</h1>
      <p className="text-gray-600 mb-8">Resumen de ejecución presupuestaria por año</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Execution vs Planning Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ejecutado vs Planificado</h2>
          {financialData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString('es-AR')}`, 'Monto']}
                  labelFormatter={(value) => `Año: ${value}`}
                />
                <Legend />
                <Bar dataKey="planificado" name="Planificado" fill={BAR_COLORS[0]} />
                <Bar dataKey="ejecutado" name="Ejecutado" fill={BAR_COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>

        {/* Execution Rate Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tasa de Ejecución Anual (%)</h2>
          {financialData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Tasa']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ejecucionPorcentaje" 
                  name="% Ejecución" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Financial Data Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Datos Financieros Detallados</h2>
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps()}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td
                        {...cell.getCellProps()}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Financial Indicators */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Indicadores Financieros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-lg font-semibold text-green-600">
              {financialData.length > 0 
                ? `${financialData[financialData.length - 1].ejecutado?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : 'N/A'}
            </p>
            <p className="text-gray-600">Ejecución Último Año</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-lg font-semibold text-blue-600">
              {financialData.length > 0 
                ? `${financialData[financialData.length - 1].ejecucionPorcentaje}%` 
                : 'N/A'}
            </p>
            <p className="text-gray-600">Tasa de Ejecución</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-lg font-semibold text-purple-600">
              {financialData.length > 0 
                ? `${(financialData[financialData.length - 1].planificado - financialData[financialData.length - 1].ejecutado).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : 'N/A'}
            </p>
            <p className="text-gray-600">Diferencia Planificado vs Ejecutado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyFinances;