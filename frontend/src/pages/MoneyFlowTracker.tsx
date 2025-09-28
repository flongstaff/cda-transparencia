import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dataService from '../services/dataService';

interface MoneyFlowData {
  year: number;
  totalBudget: number;
  totalExecuted: number;
  totalContracts: number;
  executedInfra: number;
  executedPersonnel: number;
  personnelPercentage: number;
  infraPercentage: number;
  hasPotentialDiversion: boolean;
  personnelOverrun: number;
  contractCount: number;
  executionRate: number;
}

const MoneyFlowTracker: React.FC = () => {
  const [moneyFlowData, setMoneyFlowData] = useState<MoneyFlowData[]>([]);
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load all data in parallel using the data service
        const [yearlyData, contractData] = await Promise.all([
          dataService.getAllYears(),
          dataService.getContractsFromBoletin(2023) // Using 2023 as default year, could be dynamic
        ]);
        
        // Process yearly data to match MoneyFlowData interface
        const processedMoneyFlow = yearlyData.map(data => ({
          year: data.year,
          totalBudget: data.total_budget || 0,
          totalExecuted: data.expenses || 0,
          totalContracts: contractData.length, // Approximate total
          executedInfra: data.executed_infra || 0,
          executedPersonnel: data.personnel || 0,
          personnelPercentage: data.personnel && data.expenses ? 
            (data.personnel / data.expenses) * 100 : 0,
          infraPercentage: data.executed_infra && data.expenses ? 
            (data.executed_infra / data.expenses) * 100 : 0,
          hasPotentialDiversion: (data.personnel && data.expenses) ? 
            (data.personnel / data.expenses) > 0.6 : false, // High personnel cost as potential diversion
          personnelOverrun: 0, // Placeholder
          contractCount: contractData.length,
          executionRate: data.execution_rate || 0
        }));
        
        setMoneyFlowData(processedMoneyFlow);
        setContracts(contractData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos de flujo financiero');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Cargando análisis de flujo de dinero...</div>;
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
  const chartData = moneyFlowData.map(d => ({
    ...d,
    totalBudgetFormatted: formatARS(d.totalBudget),
    totalExecutedFormatted: formatARS(d.totalExecuted),
    totalContractsFormatted: formatARS(d.totalContracts),
    executedInfraFormatted: formatARS(d.executedInfra),
    executedPersonnelFormatted: formatARS(d.executedPersonnel)
  }));

  // Prepare category data for pie chart
  const categoryData = contracts.reduce((acc: Record<string, { count: number; amount: number }>, contract) => {
    if (!acc[contract.category]) {
      acc[contract.category] = { count: 0, amount: 0 };
    }
    acc[contract.category].count += 1;
    acc[contract.category].amount += contract.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryData).map(([category, data]) => ({
    name: category,
    value: data.amount,
    count: data.count
  }));

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Get years with potential diversions
  const yearsWithDiversions = moneyFlowData.filter(d => d.hasPotentialDiversion);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Rastreador Integral de Flujo de Dinero (2017–2025)</h2>
      <p className="text-gray-600 mb-8">
        Seguimiento completo de dinero desde licitaciones hasta ejecución presupuestaria. 
        Datos extraídos de documentos oficiales del municipio de Carmen de Areco.
      </p>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Contratos</p>
              <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monto Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatARS(contracts.reduce((sum, c) => sum + c.amount, 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Años Analizados</p>
              <p className="text-2xl font-bold text-gray-900">{moneyFlowData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Años con Desvíos</p>
              <p className="text-2xl font-bold text-gray-900">{yearsWithDiversions.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Money Flow Summary Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Flujo de Dinero: Contratos → Presupuesto → Ejecución</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Contratos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejecutado Infra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gastos Personal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Personal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desvío Potencial</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {moneyFlowData.map((data) => (
                <tr key={data.year} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatARS(data.totalContracts)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatARS(data.executedInfra)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatARS(data.executedPersonnel)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={data.personnelPercentage > 45 ? 'text-red-600 font-bold' : 'text-gray-500'}>
                      {data.personnelPercentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {data.hasPotentialDiversion ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ⚠️ Alto
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Money Flow Trends Chart */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Tendencias de Flujo Financiero</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => formatARS(Number(value)).replace('ARS', '').trim()} />
                <Tooltip 
                  formatter={(value) => [formatARS(Number(value)), 'Monto']} 
                  labelFormatter={(label) => `Año: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="totalContracts" stroke="#3b82f6" name="Contratos" strokeWidth={2} />
                <Line type="monotone" dataKey="executedInfra" stroke="#10b981" name="Infraestructura" strokeWidth={2} />
                <Line type="monotone" dataKey="executedPersonnel" stroke="#ef4444" name="Personal" strokeWidth={2} />
                <Line type="monotone" dataKey="totalExecuted" stroke="#8b5cf6" name="Total Ejecutado" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Contracts by Category Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Distribución de Contratos por Categoría</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatARS(Number(value)), 'Monto']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Detailed Contracts Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Detalle de Contrataciones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.slice(0, 15).map((contract, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{contract.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.year}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{contract.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contract.category === 'infra' ? 'bg-blue-100 text-blue-800' :
                      contract.category === 'services' ? 'bg-green-100 text-green-800' :
                      contract.category === 'equipment' ? 'bg-purple-100 text-purple-800' :
                      contract.category === 'vehicles' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contract.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.vendor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatARS(contract.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contract.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {contracts.length > 15 && (
          <div className="px-6 py-4 bg-gray-50 text-sm text-gray-500">
            Mostrando 15 de {contracts.length} contratos. Total: {formatARS(contracts.reduce((sum, c) => sum + c.amount, 0))}
          </div>
        )}
      </div>
      
      {/* Data Sources Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">Fuentes de Datos Integradas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Documentos Oficiales</h4>
            <ul className="list-disc pl-5 text-blue-700 space-y-1">
              <li>Estados de ejecución de gastos por carácter económico (PDFs)</li>
              <li>Estados de ejecución de recursos por procedencia (PDFs)</li>
              <li>Estados financieros trimestrales (PDFs)</li>
              <li>Licitaciones públicas (PDFs)</li>
              <li>Declaraciones juradas patrimoniales (PDFs)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Datos Estructurados</h4>
            <ul className="list-disc pl-5 text-blue-700 space-y-1">
              <li>JSONs de ejecución presupuestaria (2017-2025)</li>
              <li>CSVs de documentos organizados por categoría y año</li>
              <li>Base de datos de documentos (documents.db)</li>
              <li>Reportes de análisis financiero estructurado</li>
              <li>Metadatos de verificación y calidad</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
          <p className="text-blue-700">
            Todos los datos provienen de fuentes oficiales del municipio de Carmen de Areco. 
            Los contratos se extraen de los documentos de licitaciones, y el seguimiento financiero 
            se realiza comparando con los estados de ejecución de gastos y recursos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoneyFlowTracker;