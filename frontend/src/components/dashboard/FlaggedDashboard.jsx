import React from 'react'
import useRedFlags from '../../hooks/useRedFlags'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

/**
 * Flagged Dashboard Component
 * Displays budget vs execution, execution rate bars (colored by flag), and procurement timeline
 * Based on anomaly detection results from red_flags_report.json
 */

export default function FlaggedDashboard({selectedYear}){
  // Use red flags hook to load data
  const { flags, loading, error } = useRedFlags(selectedYear)
  
  if (loading) return <div className="p-4 text-center">Cargando datos de alertas...</div>
  if (error) return <div className="p-4 text-center text-red-500">Error cargando datos de alertas: {error.message}</div>
  if (!flags || flags.length === 0) return <div className="p-4 text-center">No hay datos de alertas disponibles</div>
  
  // Filter for financial execution flags
  const executionFlags = flags.filter(f => 
    f.type === 'programmatic_gap' || 
    f.type === 'budget_execution_anomaly' || 
    f.source === 'budget_analysis' ||
    f.source === 'financial_analysis'
  )
  
  // Prepare data for charts
  const executionData = executionFlags.map(flag => {
    const metadata = flag.metadata || {}
    return {
      name: metadata.indicator || flag.message.substring(0, 30) + '...',
      planned: metadata.planned || 0,
      executed: metadata.executed || 0,
      executionRate: metadata.gap_percentage ? 100 + metadata.gap_percentage : 0,
      flagSeverity: flag.severity || 'medium'
    }
  })
  
  // Prepare procurement flags
  const procurementFlags = flags.filter(f => 
    f.type === 'procurement_clustering' || 
    f.source === 'procurement_analysis' ||
    f.type === 'contract_irregularity'
  )
  
  // Colors for different severity levels
  const getColorBySeverity = (severity) => {
    switch(severity) {
      case 'high': return '#e53e3e'  // Red
      case 'medium': return '#dd6b20'  // Orange
      case 'low': return '#38a169'  // Green
      default: return '#3182ce'  // Blue
    }
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📊 Ejecución Presupuestaria vs Planificación</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={executionData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <XAxis 
                dataKey="name" 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString()}`, 'Monto']}
                labelFormatter={(label) => `Indicador: ${label}`}
              />
              <Legend />
              <Bar dataKey="planned" name="Planificado" fill="#8884d8" />
              <Bar dataKey="executed" name="Ejecutado">
                {executionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColorBySeverity(entry.flagSeverity)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">⚠️ Indicadores con Alertas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {executionFlags.slice(0, 6).map((flag, index) => (
            <div 
              key={index} 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              style={{ borderColor: getColorBySeverity(flag.severity) }}
            >
              <div className="flex items-start">
                <span className="text-xl mr-2">
                  {flag.severity === 'high' ? '🔴' : flag.severity === 'medium' ? '🟡' : '🟢'}
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{flag.message}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {flag.recommendation}
                  </p>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Fuente: {flag.source}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {procurementFlags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📋 Concentración de Licitaciones</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Alerta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Severidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Recomendación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {procurementFlags.map((flag, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {flag.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{ 
                          backgroundColor: getColorBySeverity(flag.severity) + '20',
                          color: getColorBySeverity(flag.severity)
                        }}
                      >
                        {flag.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {flag.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}