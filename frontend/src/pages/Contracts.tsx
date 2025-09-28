import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useTable } from 'react-table';
import { sankey, sankeyLinkHorizontal, sankeyLeft } from 'd3-sankey';
import { select, schemeCategory10 } from 'd3';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMasterData } from '../hooks/useMasterData';

const Contracts = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  
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

  // Filter data based on search term
  const filteredData = currentContracts.filter(contract => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      contract.id?.toLowerCase().includes(term) ||
      contract.contractor?.toLowerCase().includes(term) ||
      contract.description?.toLowerCase().includes(term) ||
      contract.amount?.toString().includes(term)
    );
  });

  // Render Sankey diagram when data is available
  useEffect(() => {
    if (!filteredData.length || !svgRef.current) return;

    // Prepare Sankey data
    const nodesMap = new Map();
    const links: unknown[] = [];

    // Create nodes for sources, contracts, and contractors
    filteredData.forEach(contract => {
      const sourceId = `Origen: ${contract.source || 'Municipio'}`;
      const contractId = `Contrato: ${contract.id}`;
      const contractorId = `Contratista: ${contract.contractor}`;

      // Add nodes if they don't exist
      if (!nodesMap.has(sourceId)) nodesMap.set(sourceId, { id: sourceId, name: sourceId });
      if (!nodesMap.has(contractId)) nodesMap.set(contractId, { id: contractId, name: contractId });
      if (!nodesMap.has(contractorId)) nodesMap.set(contractorId, { id: contractorId, name: contractorId });

      // Add links
      links.push({
        source: sourceId,
        target: contractId,
        value: contract.amount,
      });

      links.push({
        source: contractId,
        target: contractorId,
        value: contract.amount,
      });
    });

    const nodes = Array.from(nodesMap.values());

    // Create the Sankey diagram
    const svg = select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous diagram

    const width = 800;
    const height = 400;

    // Set up Sankey layout
    const sankeyLayout = sankey()
      .nodeId((props: Record<string, unknown>) => d.id)
      .nodeAlign(sankeyLeft)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [width - 1, height - 6]]);

    // Compute the Sankey layout
    const { nodes: computedNodes, links: computedLinks } = sankeyLayout({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(l => ({ ...l }))
    });

    // Add links
    svg.append("g")
      .selectAll("path")
      .data(computedLinks)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", "rgba(0, 0, 0, 0.15)")
      .attr("stroke-width", d => Math.max(1, d.width));

    // Add nodes
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(computedNodes)
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    nodeGroup.append("rect")
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", (d, i) => schemeCategory10[i % 10])
      .attr("opacity", 0.8);

    nodeGroup.append("text")
      .attr("x", d => (d.x1 - d.x0) / 2)
      .attr("y", d => (d.y1 - d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(d => d.id.split(': ')[1]) // Display only the name after the category
      .attr("fill", "white")
      .attr("pointer-events", "none");

  }, [filteredData]);

  // Define columns for the table
  const columns = [
    { Header: 'ID Contrato', accessor: 'id' },
    { Header: 'Contratista', accessor: 'contractor' },
    { 
      Header: 'Monto (ARS)', 
      accessor: 'amount',
      Cell: ({ value }: { value: number }) => value ? `${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'
    },
    { 
      Header: 'Fecha Inicio', 
      accessor: 'startDate',
      Cell: ({ value }: { value: string }) => value ? format(parseISO(value), 'dd/MM/yyyy', { locale: es }) : 'N/A'
    },
    { 
      Header: 'Fecha Fin', 
      accessor: 'endDate',
      Cell: ({ value }: { value: string }) => value ? format(parseISO(value), 'dd/MM/yyyy', { locale: es }) : 'N/A'
    },
    { Header: 'Estado', accessor: 'status' },
  ];

  // Create table instance
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: filteredData,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando datos de contratos...</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Contratos y Licitaciones</h1>
      <p className="text-gray-600 mb-8">Datos de contratos celebrados por el municipio</p>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar contratos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sankey Diagram */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Flujo de Contratos</h2>
        {filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <svg 
              ref={svgRef} 
              width="100%" 
              height="400" 
              viewBox="0 0 800 400"
              preserveAspectRatio="xMidYMid meet"
            />
          </div>
        ) : (
          <p className="text-gray-500">No hay datos suficientes para mostrar el diagrama Sankey</p>
        )}
      </div>

      {/* Contracts Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Lista de Contratos</h2>
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

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Contratos</h3>
          <p className="text-3xl font-bold text-blue-600">{currentContracts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Monto Total (ARS)</h3>
          <p className="text-3xl font-bold text-green-600">
            $ {(currentContracts.reduce((sum, contract) => sum + (contract.amount || 0), 0)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Contratistas Únicos</h3>
          <p className="text-3xl font-bold text-purple-600">
            {new Set(currentContracts.map(c => c.contractor)).size}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contracts;