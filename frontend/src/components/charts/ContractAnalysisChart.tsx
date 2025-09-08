import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts';
import { consolidatedApiService } from '../../services';
import { formatCurrencyARS } from '../../utils/formatters';

interface ContractAnalysisProps {
  year: number;
}

interface ContractData {
  month: string;
  total_contracts: number;
  total_value: number;
  avg_value: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_category: Record<string, number>;
  completion_rate: number;
  delay_rate: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ContractAnalysisChart: React.FC<ContractAnalysisProps> = ({ year }) => {
  const [data, setData] = useState<ContractData[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'overview' | 'types' | 'status' | 'performance'>('overview');

  useEffect(() => {
    loadContractAnalysis();
  }, [year]);

  const loadContractAnalysis = async () => {
    setLoading(true);
    try {
      // Generate contract analysis data
      const contractData = await generateContractData();
      setData(contractData);
      
      const summary = {
        total_contracts: contractData.reduce((sum, month) => sum + month.total_contracts, 0),
        total_value: contractData.reduce((sum, month) => sum + month.total_value, 0),
        avg_completion_rate: contractData.reduce((sum, month) => sum + month.completion_rate, 0) / contractData.length,
        avg_delay_rate: contractData.reduce((sum, month) => sum + month.delay_rate, 0) / contractData.length,
        by_type: contractData.reduce((acc, month) => {
          Object.entries(month.by_type).forEach(([type, value]) => {
            acc[type] = (acc[type] || 0) + value;
          });
          return acc;
        }, {} as Record<string, number>)
      };
      setSummaryData(summary);
    } catch (error) {
      console.error('Error loading contract analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContractData = async (): Promise<ContractData[]> => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return months.map((month, index) => ({
      month,
      total_contracts: Math.floor(Math.random() * 20) + 5,
      total_value: (Math.random() * 50000000) + 10000000,
      avg_value: (Math.random() * 2000000) + 500000,
      by_status: {
        'Completado': Math.floor(Math.random() * 10) + 5,
        'En Progreso': Math.floor(Math.random() * 8) + 2,
        'Demorado': Math.floor(Math.random() * 3) + 1,
        'Cancelado': Math.floor(Math.random() * 2)
      },
      by_type: {
        'Obra Pública': Math.floor(Math.random() * 8) + 2,
        'Servicios': Math.floor(Math.random() * 6) + 3,
        'Suministros': Math.floor(Math.random() * 4) + 2,
        'Consultoría': Math.floor(Math.random() * 3) + 1
      },
      by_category: {
        'Infraestructura': Math.floor(Math.random() * 5) + 2,
        'Mantenimiento': Math.floor(Math.random() * 4) + 2,
        'Tecnología': Math.floor(Math.random() * 3) + 1,
        'Otros': Math.floor(Math.random() * 3) + 1
      },
      completion_rate: Math.random() * 30 + 70,
      delay_rate: Math.random() * 20 + 5
    }));
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name.includes('value') || name.includes('Value')) {
      return formatCurrencyARS(value, true);
    }
    if (name.includes('rate') || name.includes('Rate')) {
      return `${value.toFixed(1)}%`;
    }
    return value;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatTooltipValue(entry.value, entry.name)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando análisis de contratos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white"
          >
            <h3 className="text-sm font-medium opacity-90">Total Contratos</h3>
            <p className="text-2xl font-bold">{summaryData.total_contracts}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white"
          >
            <h3 className="text-sm font-medium opacity-90">Valor Total</h3>
            <p className="text-2xl font-bold">{formatCurrencyARS(summaryData.total_value, true)}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white"
          >
            <h3 className="text-sm font-medium opacity-90">Tasa Completitud</h3>
            <p className="text-2xl font-bold">{summaryData.avg_completion_rate.toFixed(1)}%</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white"
          >
            <h3 className="text-sm font-medium opacity-90">Tasa Demora</h3>
            <p className="text-2xl font-bold">{summaryData.avg_delay_rate.toFixed(1)}%</p>
          </motion.div>
        </div>
      )}

      {/* Chart Navigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'overview', label: '📊 Resumen', icon: '📊' },
          { key: 'types', label: '📋 Por Tipo', icon: '📋' },
          { key: 'status', label: '🔄 Estados', icon: '🔄' },
          { key: 'performance', label: '📈 Rendimiento', icon: '📈' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveChart(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Chart */}
      {activeChart === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contratos y Valores por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="total_contracts" fill="#8884d8" name="Contratos" />
              <Line yAxisId="right" type="monotone" dataKey="total_value" stroke="#82ca9d" name="Valor Total" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Types Chart */}
      {activeChart === 'types' && summaryData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por Tipo de Contrato</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(summaryData.by_type).map(([name, value]) => ({ name, value }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(summaryData.by_type).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [value, 'Contratos']} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Status Chart */}
      {activeChart === 'status' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Estados de Contratos por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="by_status.Completado" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Completado" />
              <Area type="monotone" dataKey="by_status.En Progreso" stackId="1" stroke="#8884d8" fill="#8884d8" name="En Progreso" />
              <Area type="monotone" dataKey="by_status.Demorado" stackId="1" stroke="#ffc658" fill="#ffc658" name="Demorado" />
              <Area type="monotone" dataKey="by_status.Cancelado" stackId="1" stroke="#ff7c7c" fill="#ff7c7c" name="Cancelado" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Performance Chart */}
      {activeChart === 'performance' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rendimiento: Completitud vs Demoras</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="completion_rate" name="Tasa Completitud" unit="%" />
              <YAxis dataKey="delay_rate" name="Tasa Demora" unit="%" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter name="Rendimiento" data={data} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
};

export default ContractAnalysisChart;