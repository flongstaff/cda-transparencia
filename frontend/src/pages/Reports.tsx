import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Download, FileText } from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';
import PageYearSelector from '../components/forms/PageYearSelector';

const Reports: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');

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
  
  // Get documents from the master data
  const documents = currentDocuments;

  // Load reports data (placeholder – replace with real API call if needed)
  const loadReportsDataForYear = async (year: number) => {
    // Simulate async load
    return new Promise<void>((resolve) => setTimeout(resolve, 200));
  };

  useEffect(() => {
    loadReportsDataForYear(selectedYear);
  }, [selectedYear, loadReportsDataForYear]);

  const filtered = documents?.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const memoizedCount = useMemo(() => filtered?.length ?? 0, [filtered]);

  if (loadingMulti) return <p className="text-center py-8">Cargando reporte…</p>;
  if (errorMulti) return <p className="text-center text-red-600 py-8">Error: {errorMulti}</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📄 Informes Municipales</h1>
          <p className="text-gray-600">Informes disponibles para el año {selectedYear}</p>
        </div>

        {/* The PageYearSelector already renders a <select>. Forward a label for accessibility. */}
        <PageYearSelector
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)}
          label="Año del informe"
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
        <Search className="mr-2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar informes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {loading && <p className="text-gray-600">Cargando informes…</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && (
          <>
            <p className="mb-4 text-gray-700">
              Se encontraron <strong>{memoizedCount}</strong> informes.
            </p>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Título</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Categoría</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered?.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-2">{doc.title}</td>
                    <td className="px-4 py-2">{doc.category}</td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Export button */}
            <div className="mt-4">
              <button
                title="Exportar informe"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Reporte Consolidado */}
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-indigo-600" />
          Reporte Consolidado
        </h1>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-sm text-gray-600">Documentos Totales</p>
            <p className="text-2xl font-semibold">{metrics.totalDocuments}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-sm text-gray-600">Fuentes de Datos</p>
            <p className="text-2xl font-semibold">{metrics.dataSources}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-sm text-gray-600">Años Cubiertos</p>
            <p className="text-2xl font-semibold">{metrics.yearsCovered.join(', ')}</p>
          </div>
        </div>

        {/* Lista de documentos principales */}
        <ul className="space-y-4">
          {report?.documents?.slice(0, 10).map((props: Record<string, unknown>) => (
            <li key={doc.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{doc.title}</p>
                <p className="text-sm text-gray-500">{doc.category}</p>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href={`/documents/${doc.id}`}
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </a>
                {doc.url && (
                  <a
                    href={doc.url}
                    download
                    className="text-green-600 hover:underline flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Reports;