import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Calendar, AlertTriangle, CheckCircle, Wallet, CreditCard } from 'lucide-react';
import { unifiedDataService } from '../../services/UnifiedDataService';

interface DebtRecord {
  id: string;
  year: number;
  quarter: string;
  amount: number;
  type: string;
  creditor: string;
  interest_rate: number;
  maturity_date: string;
  status: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface DebtAnalysis {
  total_debt: number;
  debt_to_budget_ratio: number;
  debt_service: number;
  debt_service_to_revenue_ratio: number;
  debt_evolution: Array<{
    year: number;
    total_debt: number;
    debt_service: number;
    ratio_to_budget: number;
  }>;
  debt_by_type: Array<{
    type: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  debt_by_creditor: Array<{
    creditor: string;
    amount: number;
    percentage: number;
  }>;
  risk_assessment: {
    overall_risk: 'low' | 'medium' | 'high' | 'critical';
    risk_factors: Array<{
      factor: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
    }>;
  };
}

const DebtAnalysisDashboard: React.FC = () => {
  const [debtData, setDebtData] = useState<DebtAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadDebtData();
  }, [selectedYear]);

  const loadDebtData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate debt data based on your analysis
      const mockData: DebtAnalysis = {
        total_debt: 85000000,
        debt_to_budget_ratio: 1.7, // 85M / 5B = 1.7%
        debt_service: 45000000,
        debt_service_to_revenue_ratio: 2.1, // 45M / 2.15B = 2.1%
        debt_evolution: [
          { year: 2018, total_debt: 45000000, debt_service: 25000000, ratio_to_budget: 3.0 },
          { year: 2019, total_debt: 52000000, debt_service: 28000000, ratio_to_budget: 2.8 },
          { year: 2020, total_debt: 65000000, debt_service: 32000000, ratio_to_budget: 2.5 },
          { year: 2021, total_debt: 72000000, debt_service: 38000000, ratio_to_budget: 2.2 },
          { year: 2022, total_debt: 78000000, debt_service: 41000000, ratio_to_budget: 2.0 },
          { year: 2023, total_debt: 82000000, debt_service: 43000000, ratio_to_budget: 1.9 },
          { year: 2024, total_debt: 85000000, debt_service: 45000000, ratio_to_budget: 1.7 }
        ],
        debt_by_type: [
          { type: 'Banco Nación', amount: 52000000, percentage: 61.2, color: '#3B82F6' },
          { type: 'Banco Provincia', amount: 28000000, percentage: 32.9, color: '#10B981' },
          { type: 'Otros Acreedores', amount: 5000000, percentage: 5.9, color: '#F59E0B' }
        ],
        debt_by_creditor: [
          { creditor: 'Banco de la Nación Argentina', amount: 52000000, percentage: 61.2 },
          { creditor: 'Banco Provincia de Buenos Aires', amount: 28000000, percentage: 32.9 },
          { creditor: 'Otros', amount: 5000000, percentage: 5.9 }
        ],
        risk_assessment: {
          overall_risk: 'low',
          risk_factors: [
            {
              factor: 'Proporción de Deuda',
              severity: 'low',
              description: 'La deuda representa solo 1.7% del presupuesto total'
            },
            {
              factor: 'Servicio de Deuda',
              severity: 'medium',
              description: 'El servicio de deuda consume 2.1% de los ingresos totales'
            },
            {
              factor: 'Crecimiento Controlado',
              severity: 'low',
              description: 'El crecimiento de la deuda ha sido moderado y controlado'
            }
          ]
        }
      };

      setDebtData(mockData);
    } catch (err) {
      setError('Error al cargar datos de deuda');
      console.error('Debt data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return value.toFixed(1) + '%';
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string): JSX.Element => {
    switch (risk) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high': return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'medium': return <TrendingDown className="h-5 w-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Wallet className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando análisis de deuda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button 
          onClick={loadDebtData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!debtData) {
    return (
      <div className="text-center py-12">
        <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No hay datos de deuda disponibles</h3>
        <p className="text-gray-500">No se encontraron datos de deuda para el año {selectedYear}</p>
      </div>
    );
  }

  // Prepare data for charts
  const debtEvolutionChartData = debtData.debt_evolution.map(year => ({
    name: year.year.toString(),
    'Deuda Total': year.total_debt / 1000000,
    'Servicio de Deuda': year.debt_service / 1000000,
    'Ratio al Presupuesto': year.ratio_to_budget
  }));

  const debtByTypeChartData = debtData.debt_by_type.map(type => ({
    name: type.type,
    value: type.amount / 1000000,
    percentage: type.percentage,
    color: type.color
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💳 Análisis de Deuda Municipal</h1>
          <p className="mt-2 text-gray-600">
            Evaluación detallada de la deuda y obligaciones financieras del municipio
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Deuda Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(debtData.total_debt)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <PieChartIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">% Deuda/Presupuesto</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(debtData.debt_to_budget_ratio)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Servicio de Deuda</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(debtData.debt_service)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">% Servicio/Ingresos</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(debtData.debt_service_to_revenue_ratio)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Debt Evolution Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Evolución Histórica de la Deuda (Millones ARS)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={debtEvolutionChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Deuda Total' || name === 'Servicio de Deuda') {
                    return [`${value}M`, ''];
                  }
                  return [`${value}%`, ''];
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Deuda Total" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Servicio de Deuda" 
                stroke="#10B981" 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Ratio al Presupuesto" 
                stroke="#F59E0B" 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Debt Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Composición de la Deuda por Tipo
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={debtByTypeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percentage }) => `${name}: ${formatPercentage(percentage)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {debtByTypeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}M ARS`, '']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Creditor */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Deuda por Acreedor
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acreedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {debtData.debt_by_creditor.map((creditor, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {creditor.creditor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(creditor.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {formatPercentage(creditor.percentage)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Evaluación de Riesgo de Deuda
        </h3>
        <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            {getRiskIcon(debtData.risk_assessment.overall_risk)}
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">
                Nivel de Riesgo General: {debtData.risk_assessment.overall_risk.toUpperCase()}
              </h4>
              <p className="text-sm text-gray-600">
                Basado en {debtData.risk_assessment.risk_factors.length} factores de riesgo evaluados
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(debtData.risk_assessment.overall_risk)}`}>
            {debtData.risk_assessment.overall_risk.toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          {debtData.risk_assessment.risk_factors.map((factor, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border ${getRiskColor(factor.severity)}`}
            >
              <div className="flex items-start">
                {getRiskIcon(factor.severity)}
                <div className="ml-3 flex-1">
                  <h5 className="font-medium text-gray-900">{factor.factor}</h5>
                  <p className="mt-1 text-sm text-gray-700">{factor.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(factor.severity)}`}>
                  {factor.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debt Service Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Análisis del Servicio de Deuda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Costo Anual</h4>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(debtData.debt_service)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Representa {formatPercentage(debtData.debt_service_to_revenue_ratio)} de los ingresos totales
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Deuda Total</h4>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(debtData.total_debt)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {formatPercentage(debtData.debt_to_budget_ratio)} del presupuesto total
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Crecimiento</h4>
            <p className="text-2xl font-bold text-gray-900">
              {debtData.debt_evolution[debtData.debt_evolution.length - 1].total_debt > debtData.debt_evolution[0].total_debt ? '+' : ''}
              {formatPercentage(((debtData.debt_evolution[debtData.debt_evolution.length - 1].total_debt - debtData.debt_evolution[0].total_debt) / debtData.debt_evolution[0].total_debt) * 100)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              En {debtData.debt_evolution.length - 1} años
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtAnalysisDashboard;