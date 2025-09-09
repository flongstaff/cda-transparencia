import React, { useState } from 'react';
import { useTransparencyData } from '../../hooks/useTransparencyData';
import LoadingSpinner from '../analysis/LoadingSpinner';
import { BarChart3, PieChart, Activity, TrendingUp } from 'lucide-react';

const YearDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const {
    documents,
    categories,
    budget,
    salaries,
    contracts,
    summary,
    metrics,
    audit,
    loading,
    error,
    refetch,
    expectedDocCount,
    actualDocCount,
  } = useTransparencyData(selectedYear);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error">Error: {error} <button onClick={refetch}>Retry</button></div>;

  return (
    <div className="dashboard">
      {/* Year Selector */}
      <div className="filters mb-6">
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Warning banner for document count mismatch */}
      {expectedDocCount !== null && actualDocCount !== null && expectedDocCount > actualDocCount && (
        <div className="warning-banner bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-300 p-4 mb-6 rounded">
          Mostrando {actualDocCount} de {expectedDocCount} documentos disponibles (datos de muestra).
        </div>
      )}

      {/* All components use the SAME data slice → guaranteed consistency */}
      <div className="dashboard-content space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Transparencia - Año {selectedYear}</h2>
        
        {/* Metrics Section */}
        {metrics && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Métricas de Transparencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Puntaje General</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {metrics.overall_score}<span className="text-lg">/100</span>
                </p>
                <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">Calificación: {metrics.grade}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Estado de Cumplimiento</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-200">{metrics.compliance_status}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Tasa de Ejecución</p>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{metrics.execution_rate}%</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Documentos Verificados</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{metrics.verified_documents}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Categories Section */}
        {categories && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-purple-500" />
              Categorías de Documentos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(categories).map(([category, count]) => (
                <div key={category} className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-center border border-gray-200 dark:border-gray-600">
                  <p className="font-semibold text-gray-700 dark:text-white">{category}</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Budget Section */}
        {budget && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Datos Presupuestarios
            </h3>
            <div className="overflow-x-auto">
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-60 text-sm">
                {JSON.stringify(budget, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {/* Documents Section */}
        {documents && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-orange-500" />
              Documentos ({documents.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tamaño
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {documents.slice(0, 5).map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {doc.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {doc.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {doc.size_mb} MB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Summary Section */}
        {summary && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Resumen</h3>
            <div className="overflow-x-auto">
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-60 text-sm">
                {JSON.stringify(summary, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {/* Audit Section */}
        {audit && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Auditoría</h3>
            <div className="overflow-x-auto">
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-60 text-sm">
                {JSON.stringify(audit, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearDashboard;