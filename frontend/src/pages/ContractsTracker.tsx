import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMasterData } from '../hooks/useMasterData';

interface ContractData {
  id: string;
  year: number;
  title: string;
  amount: number;
  category: string;
  vendor: string;
  status: string;
  source: string;
}

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

const ContractsTracker: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
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

  // Extract contract data from master data
  const contracts = currentContracts.map((contract: any, index: number) => ({
    id: contract.id || `contract-${index}`,
    year: contract.year || selectedYear,
    title: contract.title || contract.description || 'Contrato sin título',
    amount: contract.amount || contract.budget || 0,
    category: contract.category || contract.type || 'General',
    vendor: contract.vendor || contract.awarded_to || contract.contractor || 'Proveedor desconocido',
    status: contract.status || 'active',
    source: contract.source || 'Municipal'
  }));

  // Extract money flow data from master data
  const yearlyFlow = Object.entries(masterData?.multiYearData || {}).map(([year, data]) => ({
    year: parseInt(year),
    totalBudget: data.budget?.total_budget || 0,
    totalExecuted: data.budget?.expenses || 0,
    totalContracts: data.contracts?.length || 0,
    executedInfra: data.budget?.executed_infra || 0,
    executedPersonnel: data.budget?.personnel || 0,
    personnelPercentage: data.budget?.personnel && data.budget?.expenses ? 
      (data.budget.personnel / data.budget.expenses * 100) : 0,
    infraPercentage: data.budget?.executed_infra && data.budget?.expenses ? 
      (data.budget.executed_infra / data.budget.expenses * 100) : 0,
    hasPotentialDiversion: (data.budget?.personnel || 0) / (data.budget?.expenses || 1) > 0.6,
    personnelOverrun: Math.max(0, (data.budget?.personnel || 0) - (data.budget?.expenses || 0) * 0.6),
    contractCount: data.contracts?.length || 0,
    executionRate: data.budget?.execution_rate || 0
  }));

  if (loading) {
    return <div className="text-center p-4">Cargando datos de contrataciones y ejecución presupuestaria...</div>;
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

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">Rastreador de Contratos: De Licitaciones a Gastos (2017–2025)</h2>
      <p className="mb-6">
        Integración de todas las fuentes de datos: Contratos de PDFs → Ejecución de JSONs → Flujo anual. 
        Todos los datos reales extraídos de fuentes oficiales del municipio.
      </p>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-700">Total Contratos</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatARS(contracts.reduce((sum, c) => sum + c.amount, 0))}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-700">Años Cubiertos</h3>
          <p className="text-2xl font-bold text-green-600">
            {yearlyFlow.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-700">Contratos Totales</h3>
          <p className="text-2xl font-bold text-purple-600">
            {contracts.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-700">Años con Flags</h3>
          <p className="text-2xl font-bold text-red-600">
            {yearlyFlow.filter(y => y.potentialDiversion).length}
          </p>
        </div>
      </div>
      
      {/* Table: Contracts & Where Money Went */}
      <div className="mb-8 overflow-x-auto">
        <table className="min-w-full border-collapse border mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Año</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Total Contratos ($)</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Gastos Infra ($ / %)</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Gastos Personal ($ / %)</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Desviación Flag</th>
            </tr>
          </thead>
          <tbody>
            {yearlyFlow.map(y => (
              <tr key={y.year} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">{y.year}</td>
                <td className="border border-gray-300 px-4 py-2">{formatARS(y.totalContractValue)}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {formatARS(y.infraExecuted)} / {y.infraPercentage}%
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {formatARS(y.executedPersonnel)} / {y.personnelPercentage}%
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${y.potentialDiversion ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                  {y.potentialDiversion ? '⚠️ Alto' : 'OK'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Chart: Money Flow Trends */}
      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h3 className="text-xl font-semibold mb-4">Tendencias de Flujo de Dinero</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={yearlyFlow}
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
              <Line type="monotone" dataKey="totalContractValue" stroke="#82ca9d" name="Contratos" strokeWidth={2} />
              <Line type="monotone" dataKey="infraExecuted" stroke="#8884d8" name="Infraestructura" strokeWidth={2} />
              <Line type="monotone" dataKey="executedPersonnel" stroke="#ef4444" name="Personal" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Contract Details */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-xl font-semibold mb-4">Detalles de Contrataciones</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Año</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Título</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Categoría</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Proveedor</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Monto</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.slice(0, 10).map((contract, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-mono text-sm">{contract.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{contract.year}</td>
                  <td className="border border-gray-300 px-4 py-2">{contract.title}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      contract.category === 'infra' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {contract.category}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{contract.vendor}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatARS(contract.amount)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
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
        {contracts.length > 10 && (
          <p className="mt-4 text-gray-600">Mostrando 10 de {contracts.length} contratos. Total: {formatARS(contracts.reduce((sum, c) => sum + c.amount, 0))}</p>
        )}
      </div>
      
      {/* Data Sources Note */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Fuentes de Datos Integradas</h3>
        <ul className="list-disc pl-5 text-blue-700 space-y-1">
          <li>JSONs: multi_source_report.json, budget_data_2024.json y otros archivos estructurados</li>
          <li>PDFs: Estados de ejecución de gastos, informes financieros trimestrales</li>
          <li>Markdown: Resúmenes de licitaciones, ordenanzas presupuestarias</li>
          <li>CSVs: Extractos detallados de documentos por categoría y año</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractsTracker;