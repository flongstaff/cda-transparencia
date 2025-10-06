/**
 * Carmen de Areco Transparency Dashboard Component
 * Displays transparency data for Carmen de Areco municipality
 */

import React from 'react';
import { useCarmenDeArecoData } from '../../hooks/useCarmenDeArecoData';
import StandardizedCard from '../ui/StandardizedCard';
import { BarChart3, FileText, TrendingUp, Users, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatCurrencyARS } from '../../utils/formatters';

const CarmenTransparencyDashboard: React.FC = () => {
  const { transparencyData, loading, error } = useCarmenDeArecoData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3">Cargando datos de transparencia de Carmen de Areco...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error al cargar los datos</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
      </div>
    );
  }

  if (!transparencyData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
          <h3 className="text-lg font-medium text-yellow-800">Datos no disponibles</h3>
        </div>
        <p className="mt-2 text-yellow-700">No se pudieron cargar los datos de transparencia para Carmen de Areco.</p>
      </div>
    );
  }

  const { data } = transparencyData;
  const { budget_overview, recent_licitaciones, transparency_indicators } = data;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sm:p-6 rounded-lg">
        <h1 className="text-2xl sm:text-3xl font-bold">Transparencia Municipal - {data.municipality}</h1>
        <p className="text-blue-100 mt-2 text-sm sm:text-base">
          Datos de transparencia para el municipio de {data.municipality}, {data.province}, {data.country}
        </p>
      </div>

      {/* Budget Overview */}
      <StandardizedCard
        title={`Presupuesto ${budget_overview.current_year}`}
        description="Resumen presupuestario del municipio"
        icon={<BarChart3 className="h-5 sm:h-6 w-5 sm:w-6" />}
        color="blue"
      >
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-3 sm:mt-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resumen Presupuestario</h3>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-sm sm:text-base">Presupuesto Total:</span>
                <span className="font-bold text-blue-700 mt-1 sm:mt-0 text-sm sm:text-base">
                  {formatCurrencyARS(budget_overview.total_budget)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Distribución por Área</h3>
            <div className="space-y-2 sm:space-y-3">
              {budget_overview.budget_by_area.map((area, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 hover:bg-gray-50 rounded">
                  <span className="font-medium text-sm sm:text-base">{area.area}</span>
                  <div className="text-right mt-1 sm:mt-0">
                    <div className="font-semibold text-sm sm:text-base">{area.percentage}%</div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {formatCurrencyARS(area.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StandardizedCard>

      {/* Transparency Indicators */}
      <StandardizedCard
        title="Indicadores de Transparencia"
        description="Métricas de transparencia y acceso a la información"
        icon={<ShieldCheck className="h-5 sm:h-6 w-5 sm:w-6" />}
        color="green"
      >
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xl sm:text-2xl font-bold text-green-700">{transparency_indicators.budget_accessibility}%</div>
            <div className="text-xs sm:text-sm text-green-600">Accesibilidad</div>
          </div>
          
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xl sm:text-2xl font-bold text-blue-700">{transparency_indicators.document_availability}%</div>
            <div className="text-xs sm:text-sm text-blue-600">Documentos</div>
          </div>
          
          <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-xl sm:text-2xl font-bold text-purple-700">{transparency_indicators.public_engagement}%</div>
            <div className="text-xs sm:text-sm text-purple-600">Participación</div>
          </div>
          
          <div className="p-3 sm:p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div className="text-xl sm:text-2xl font-bold text-teal-700">{transparency_indicators.info_quality}%</div>
            <div className="text-xs sm:text-sm text-teal-600">Calidad</div>
          </div>
        </div>
      </StandardizedCard>

      {/* Recent Licitaciones */}
      <StandardizedCard
        title="Últimas Licitaciones"
        description="Procesos de contratación pública recientes"
        icon={<TrendingUp className="h-5 sm:h-6 w-5 sm:w-6" />}
        color="purple"
      >
        {recent_licitaciones && recent_licitaciones.length > 0 ? (
          <div className="overflow-x-auto mt-3 sm:mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Objeto
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recent_licitaciones.map((licitacion, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 text-sm font-medium text-gray-900">
                      {licitacion['Número de Licitación'] || licitacion.numero}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-gray-500 max-w-[80px] sm:max-w-xs truncate" title={licitacion.Objeto || licitacion.objeto}>
                      {licitacion.Objeto || licitacion.objeto}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-gray-500">
                      {licitacion['Fecha de Apertura'] || licitacion.fecha_apertura}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm font-medium text-gray-900">
                      {formatCurrencyARS(
                        parseFloat(
                          licitacion['Monto Presupuestado'] || 
                          licitacion.monto_presupuestado || 
                          '0'
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-500 mt-3 sm:mt-4">
            <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <p className="mt-2 text-sm sm:text-base">No hay licitaciones recientes disponibles</p>
          </div>
        )}
      </StandardizedCard>

      {/* Documents */}
      <StandardizedCard
        title="Documentos Disponibles"
        description="Documentos oficiales disponibles para consulta"
        icon={<FileText className="h-5 sm:h-6 w-5 sm:w-6" />}
        color="gray"
      >
        {data.documents && data.documents.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-3 sm:mt-4">
            {data.documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{doc.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 capitalize">{doc.category}</p>
                <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span className="text-xs text-gray-400">{doc.date}</span>
                  <a 
                    href={doc.url} 
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium mt-1 sm:mt-0"
                  >
                    Ver documento →
                  </a>
                </div>
                
                {/* Show source verification badge if available */}
                {doc.source_verification && (
                  <div className="mt-2 flex items-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      doc.source_verification.verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {doc.source_verification.verified ? 'Verificado' : 'No verificado'}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      Calidad: {doc.source_verification.data_quality}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-500 mt-3 sm:mt-4">
            <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <p className="mt-2 text-sm sm:text-base">No hay documentos disponibles</p>
          </div>
        )}
      </StandardizedCard>
    </div>
  );
};

export default CarmenTransparencyDashboard;