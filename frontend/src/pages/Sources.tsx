import React from 'react';
import { useState } from 'react';
import { useTable } from 'react-table';
import MarkdownRenderer from '../components/data-display/MarkdownRenderer';
import { useMasterData } from '../hooks/useMasterData';

const Sources = () => {
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

  // Get sources data from masterData
  const sourcesData = masterData?.metadata?.sources || [
    {
      id: 1,
      name: 'Boletín Oficial',
      description: 'Publicación oficial del gobierno local donde se publican contratos y licitaciones',
      type: 'Boletín',
      url: 'https://example.com/boletin',
      lastUpdated: '2024-01-15',
      accessibility: 'Alta'
    },
    {
      id: 2,
      name: 'Portal de Transparencia Nacional',
      description: 'Datos oficiales del gobierno nacional sobre contratos y gastos',
      type: 'Portal',
      url: 'https://datos.gob.ar',
      lastUpdated: '2024-01-14',
      accessibility: 'Media'
    },
    {
      id: 3,
      name: 'Presupuesto Municipal',
      description: 'Documentos oficiales del presupuesto municipal',
      type: 'Documento',
      url: 'https://example.com/presupuesto',
      lastUpdated: '2024-01-10',
      accessibility: 'Alta'
    },
    {
      id: 4,
      name: 'Reporte de Auditoría Externa',
      description: 'Reporte anual de auditoría realizada por firma externa',
      type: 'Reporte',
      url: 'https://example.com/auditoria',
      lastUpdated: '2024-01-05',
      accessibility: 'Baja'
    },
    {
      id: 5,
      name: 'Cuentas Públicas',
      description: 'Documentos detallando el uso de fondos públicos',
      type: 'Documento',
      url: 'https://example.com/cuentas',
      lastUpdated: '2024-01-01',
      accessibility: 'Alta'
    }
  ];

  // Define columns for the table
  const columns = [
    { Header: 'Nombre', accessor: 'name' },
    { Header: 'Tipo', accessor: 'type' },
    { Header: 'Descripción', accessor: 'description' },
    { 
      Header: 'Última Actualización', 
      accessor: 'lastUpdated',
      Cell: ({ value }: { value: string }) => {
        const date = new Date(value);
        return date.toLocaleDateString('es-AR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    },
    { Header: 'Accesibilidad', accessor: 'accessibility' },
    { 
      Header: 'Enlace', 
      accessor: 'url',
      Cell: ({ value }: { value: string }) => (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          Ver Fuente
        </a>
      )
    }
  ];

  // Create table instance
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: sourcesData,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando datos de fuentes...</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Fuentes de Datos</h1>
      <p className="text-gray-600 mb-8">
        Listado de fuentes de datos utilizadas para recopilar y verificar la información del portal de transparencia.
        Todas las fuentes son verificadas regularmente para asegurar la calidad y precisión de los datos.
      </p>

      {/* Sources Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Fuentes Oficiales</h2>
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

      {/* Data Verification Info */}
      <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Verificación de Datos</h2>
        <p className="mb-4">
          Nuestro portal compara datos locales con fuentes externas para garantizar la transparencia y exactitud de la información.
          Cada fuente es revisada regularmente y marcada con un indicador de calidad.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Fuentes Locales</h3>
            <p>Datos provenientes de sistemas oficiales del municipio</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Fuentes Externas</h3>
            <p>Datos verificados con instituciones nacionales y organismos reguladores</p>
          </div>
        </div>
      </div>

      {/* Data Categories */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Categorías de Datos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Finanzas</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Presupuesto municipal</li>
              <li>Ejecución presupuestaria</li>
              <li>Contratos y licitaciones</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Transparencia</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Declaraciones juradas</li>
              <li>Informes de auditoría</li>
              <li>Proyectos de inversión</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Obras Públicas</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Proyectos en ejecución</li>
              <li>Empresas contratadas</li>
              <li>Avance de obras</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Documentación del Portal</h2>
        <MarkdownRenderer content={`
## Documentación del Portal de Transparencia

### Objetivo
El Portal de Transparencia del Municipio de Carmen de Areco tiene como objetivo principal garantizar el acceso libre y gratuito a la información pública, promoviendo la rendición de cuentas y la participación ciudadana.

### Metodología
- Recolección de datos de fuentes oficiales locales y nacionales
- Validación cruzada de información
- Actualización periódica de datos
- Presentación clara y accesible de la información

### Fuentes de Información
- Boletín Oficial Municipal
- Portal de Datos Abiertos del Gobierno Nacional
- Sistemas Internos de Gestión Financiera
- Contraloría General del Municipio

### Calidad de Datos
- Actualización: Datos actualizados mensualmente
- Verificación: Comparación con fuentes externas
- Exactitud: Revisión por personal especializado
        `} />
      </div>
    </div>
  );
};

export default Sources;