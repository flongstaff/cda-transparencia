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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  TreeMap,
  Sankey
} from 'recharts';
import { consolidatedApiService } from '../../services';
import { formatCurrencyARS } from '../../utils/formatters';

interface PropertyDeclarationsProps {
  year: number;
}

interface DeclarationData {
  month: string;
  total_declarations: number;
  total_assets_value: number;
  avg_assets_per_official: number;
  by_position: Record<string, number>;
  by_asset_type: Record<string, number>;
  transparency_score: number;
  compliance_rate: number;
  risk_indicators: {
    unusual_increases: number;
    missing_declarations: number;
    incomplete_data: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const PropertyDeclarationsChart: React.FC<PropertyDeclarationsProps> = ({ year }) => {
  const [data, setData] = useState<DeclarationData[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'overview' | 'assets' | 'compliance' | 'risk'>('overview');

  useEffect(() => {
    loadDeclarationsAnalysis();
  }, [year]);

  const loadDeclarationsAnalysis = async () => {
    setLoading(true);
    try {
      const declarationsData = await generateDeclarationsData();
      setData(declarationsData);
      
      const summary = {
        total_declarations: declarationsData.reduce((sum, month) => sum + month.total_declarations, 0),
        total_assets_value: declarationsData.reduce((sum, month) => sum + month.total_assets_value, 0),
        avg_transparency_score: declarationsData.reduce((sum, month) => sum + month.transparency_score, 0) / declarationsData.length,
        avg_compliance_rate: declarationsData.reduce((sum, month) => sum + month.compliance_rate, 0) / declarationsData.length,
        by_position: declarationsData.reduce((acc, month) => {
          Object.entries(month.by_position).forEach(([position, value]) => {
            acc[position] = (acc[position] || 0) + value;
          });
          return acc;
        }, {} as Record<string, number>),
        total_risk_indicators: declarationsData.reduce((acc, month) => {
          acc.unusual_increases += month.risk_indicators.unusual_increases;
          acc.missing_declarations += month.risk_indicators.missing_declarations;
          acc.incomplete_data += month.risk_indicators.incomplete_data;
          return acc;
        }, { unusual_increases: 0, missing_declarations: 0, incomplete_data: 0 })
      };
      setSummaryData(summary);
    } catch (error) {
      console.error('Error loading declarations analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDeclarationsData = async (): Promise<DeclarationData[]> => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return months.map((month, index) => ({
      month,
      total_declarations: Math.floor(Math.random() * 50) + 80,
      total_assets_value: (Math.random() * 500000000) + 100000000,
      avg_assets_per_official: (Math.random() * 5000000) + 1000000,
      by_position: {
        'Intendente': 1,
        'Secretarios': Math.floor(Math.random() * 5) + 3,
        'Directores': Math.floor(Math.random() * 15) + 10,
        'Coordinadores': Math.floor(Math.random() * 20) + 15,
        'Otros Funcionarios': Math.floor(Math.random() * 30) + 20
      },
      by_asset_type: {
        'Inmuebles': Math.floor(Math.random() * 40) + 30,
        'Vehículos': Math.floor(Math.random() * 25) + 15,
        'Inversiones': Math.floor(Math.random() * 20) + 10,
        'Efectivo/Bancos': Math.floor(Math.random() * 35) + 25,
        'Otros Bienes': Math.floor(Math.random() * 15) + 5
      },
      transparency_score: Math.random() * 20 + 75,
      compliance_rate: Math.random() * 15 + 85,
      risk_indicators: {
        unusual_increases: Math.floor(Math.random() * 5),
        missing_declarations: Math.floor(Math.random() * 3),
        incomplete_data: Math.floor(Math.random() * 8) + 2
      }
    }));
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name.includes('value') || name.includes('assets') || name.includes('Value')) {
      return formatCurrencyARS(value, true);
    }
    if (name.includes('score') || name.includes('rate') || name.includes('Score') || name.includes('Rate')) {
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
        <span className="ml-2 text-gray-600">Cargando análisis de declaraciones...</span>
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
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white"
          >
            <h3 className="text-sm font-medium opacity-90">Total Declaraciones</h3>
            <p className="text-2xl font-bold">{summaryData.total_declarations}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white"
          >
            <h3 className="text-sm font-medium opacity-90">Valor Total Activos</h3>
            <p className="text-2xl font-bold">{formatCurrencyARS(summaryData.total_assets_value, true)}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white"
          >
            <h3 className="text-sm font-medium opacity-90">Transparencia Promedio</h3>
            <p className="text-2xl font-bold">{summaryData.avg_transparency_score.toFixed(1)}%</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white"
          >
            <h3 className="text-sm font-medium opacity-90">Cumplimiento Promedio</h3>
            <p className="text-2xl font-bold">{summaryData.avg_compliance_rate.toFixed(1)}%</p>
          </motion.div>
        </div>
      )}

      {/* Chart Navigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'overview', label: '📋 Resumen', icon: '📋' },
          { key: 'assets', label: '🏠 Activos', icon: '🏠' },
          { key: 'compliance', label: '✅ Cumplimiento', icon: '✅' },
          { key: 'risk', label: '⚠️ Riesgos', icon: '⚠️' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveChart(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === tab.key
                ? 'bg-purple-500 text-white'
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
          <h3 className="text-lg font-bold text-gray-900 mb-4">Declaraciones y Valor de Activos por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="total_declarations" fill="#8884d8" name="Declaraciones" />
              <Line yAxisId="right" type="monotone" dataKey="total_assets_value" stroke="#82ca9d" name="Valor Total Activos" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Assets Chart */}
      {activeChart === 'assets' && summaryData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por Cargo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(summaryData.by_position).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(summaryData.by_position).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Declaraciones']} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Valor Promedio de Activos por Funcionario</h3>
            <ResponsiveContainer width="100%" height={300}>
              <Bar dataKey="avg_assets_per_official" fill="#82ca9d">
                {data.map((entry, index) => (
                  <Bar key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Compliance Chart */}
      {activeChart === 'compliance' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Transparencia y Cumplimiento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="month" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Transparencia" dataKey="transparency_score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Cumplimiento" dataKey="compliance_rate" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Legend />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Risk Analysis */}
      {activeChart === 'risk' && summaryData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Indicadores de Riesgo Totales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    !
                  </div>
                  <div>
                    <p className="text-sm text-yellow-700">Aumentos Inusuales</p>
                    <p className="text-xl font-bold text-yellow-900">{summaryData.total_risk_indicators.unusual_increases}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    ✕
                  </div>
                  <div>
                    <p className="text-sm text-red-700">Declaraciones Faltantes</p>
                    <p className="text-xl font-bold text-red-900">{summaryData.total_risk_indicators.missing_declarations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    ?
                  </div>
                  <div>
                    <p className="text-sm text-orange-700">Datos Incompletos</p>
                    <p className="text-xl font-bold text-orange-900">{summaryData.total_risk_indicators.incomplete_data}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Evolución de Indicadores de Riesgo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="risk_indicators.unusual_increases" fill="#ffc658" name="Aumentos Inusuales" />
                <Bar dataKey="risk_indicators.missing_declarations" fill="#ff7c7c" name="Faltantes" />
                <Line type="monotone" dataKey="risk_indicators.incomplete_data" stroke="#8884d8" name="Incompletos" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PropertyDeclarationsChart;