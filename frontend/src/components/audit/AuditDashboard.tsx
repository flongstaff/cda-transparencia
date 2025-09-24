// AuditDashboard.tsx - Dashboard to visualize audit findings and potential malversations
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { auditFinancialSystem, FinancialIrregularity } from '../services/auditFinancialSystem';

const AuditDashboard: React.FC = () => {
  const [auditResults, setAuditResults] = useState<any[]>([]);
  const [irregularities, setIrregularities] = useState<FinancialIrregularity[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuditData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load all audit data in parallel
        const [results, irregs, summ] = await Promise.all([
          auditFinancialSystem.performFinancialAudit(),
          auditFinancialSystem.getIrregularities(),
          auditFinancialSystem.getAuditSummary()
        ]);
        
        setAuditResults(results);
        setIrregularities(irregs);
        setSummary(summ);
        console.log('Audit data loaded:', { results, irregs, summ });
      } catch (err) {
        console.error('Error loading audit data:', err);
        setError('Error al cargar los datos de auditoría financiera');
      } finally {
        setLoading(false);
      }
    };

    loadAuditData();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Cargando análisis de auditoría financiera...</div>;
  }

  if (error) {
    return <div className="bg-red-50 border-l-4 border-red-500 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>;
  }

  // Formatter for ARS (handles commas/dots correctly)
  const formatARS = (num: number) => new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(num);

  // Prepare data for charts
  const chartData = auditResults.map(result => ({
    ...result,
    totalBudgetFormatted: formatARS(result.totalBudget),
    totalExecutedFormatted: formatARS(result.totalExecuted),
    executedInfraFormatted: formatARS(result.executedInfra),
    executedPersonnelFormatted: formatARS(result.executedPersonnel),
    contractValueFormatted: formatARS(result.contractValue)
  }));

  // Prepare severity data for pie chart
  const severityData = [
    { name: 'Alta', value: summary.highSeverity, color: '#ef4444' },
    { name: 'Media', value: summary.mediumSeverity, color: '#f59e0b' },
    { name: 'Baja', value: summary.lowSeverity, color: '#10b981' }
  ];

  // Prepare type data for pie chart
  const typeData = Object.entries(summary.byType).map(([type, count]) => ({
    name: type,
    value: count,
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  }));

  // Prepare year data for bar chart
  const yearData = Object.entries(summary.byYear).map(([year, count]) => ({
    year: parseInt(year),
    count: count as number
  })).sort((a, b) => a.year - b.year);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Panel de Auditoría Financiera</h2>
      <p className="text-gray-600 mb-8">
        Análisis automatizado de posibles malversaciones y desvíos de fondos (2017–2025).
        Sistema diseñado para ciudadanos que quieren entender el destino del dinero público.
      </p>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Irregularidades</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalIrregularities}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Alta Severidad</p>
              <p className="text-2xl font-bold text-gray-900">{summary.highSeverity}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Media Severidad</p>
              <p className="text-2xl font-bold text-gray-900">{summary.mediumSeverity}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Baja Severidad</p>
              <p className="text-2xl font-bold text-gray-900">{summary.lowSeverity}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Años Analizados</p>
              <p className="text-2xl font-bold text-gray-900">{auditResults.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alert Banner for High Severity Issues */}
      {summary.highSeverity > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Alerta de Malversación Potencial
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Se han detectado {summary.highSeverity} irregularidades de alta severidad que podrían indicar malversación de fondos.
                  Se recomienda revisar detalladamente los documentos oficiales y considerar presentar denuncias ante las autoridades competentes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Severity Distribution */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Distribución por Severidad</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, 'Cantidad']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Type Distribution */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Distribución por Tipo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, 'Cantidad']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Yearly Distribution */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Irregularidades por Año</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={yearData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}`, 'Cantidad']} />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Irregularidades" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Detailed Irregularities Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Irregularidades Detectadas (2017–2025)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 bg-white shadow-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Año</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Monto</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Porcentaje</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Severidad</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Recomendación</th>
              </tr>
            </thead>
            <tbody>
              {irregularities.map((irreg, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">{irreg.year}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      irreg.type === 'high_personnel_costs' ? 'bg-red-100 text-red-800' :
                      irreg.type === 'infrastructure_under_execution' ? 'bg-yellow-100 text-yellow-800' :
                      irreg.type === 'contract_diversion' ? 'bg-purple-100 text-purple-800' :
                      irreg.type === 'budget_reallocation' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {irreg.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{irreg.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-green-600">{formatARS(irreg.amount)}</td>
                  <td className="border border-gray-300 px-4 py-2">{irreg.percentage}%</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      irreg.severity === 'high' ? 'bg-red-100 text-red-800' :
                      irreg.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {irreg.severity === 'high' ? 'Alta' : irreg.severity === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{irreg.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {irregularities.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 text-sm text-gray-500 border-t border-gray-200">
            Total irregularidades: {irregularities.length} | Total monto afectado: {formatARS(irregularities.reduce((sum, i) => sum + i.amount, 0))}
          </div>
        )}
      </div>
      
      {/* Evidence and Action Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Evidencia Disponible
          </h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-2">
            <li>Documentos oficiales del municipio (PDFs, JSONs, Markdown)</li>
            <li>Estados de ejecución de gastos por carácter económico</li>
            <li>Informes financieros trimestrales</li>
            <li>Contratos y licitaciones públicas</li>
            <li>Declaraciones juradas patrimoniales</li>
            <li>Archivos extraídos de fuentes gubernamentales oficiales</li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Acciones Ciudadanas
          </h3>
          <ul className="list-disc pl-5 text-yellow-700 space-y-2">
            <li>Revisar documentos oficiales en el portal del municipio</li>
            <li>Contactar al Concejo Deliberante para solicitar información</li>
            <li>Presentar denuncias ante la Oficina Anticorrupción</li>
            <li>Utilizar el canal de denuncias del municipio</li>
            <li>Participar en audiencias públicas sobre presupuesto</li>
            <li>Compartir hallazgos con organizaciones civiles</li>
          </ul>
        </div>
      </div>
      
      {/* Legal Framework */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Marco Legal</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Ley de Acceso a la Información Pública</h4>
            <p className="text-sm text-gray-600">
              Garantiza el derecho de los ciudadanos a acceder a información pública.
              Los municipios deben publicar presupuestos y ejecuciones.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Ley de Responsabilidad Fiscal</h4>
            <p className="text-sm text-gray-600">
              Establece límites para el gasto público y obliga a transparencia.
              Requiere informes periódicos de ejecución presupuestaria.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Oficina Anticorrupción</h4>
            <p className="text-sm text-gray-600">
              Canal oficial para denunciar irregularidades.
              Protección para denunciantes bajo Ley 27.401.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;