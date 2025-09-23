import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Download } from 'lucide-react';
import { useUnifiedData } from '../hooks/useUnifiedData';
import PageYearSelector from '../components/selectors/PageYearSelector';
import { formatCurrencyARS } from '../utils/formatters';

const Reports: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { documents, loading, error } = useUnifiedData({ year: selectedYear });

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
    </div>
  );
};

export default Reports;