import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, Loader2, Database, Layers } from 'lucide-react';
import { consolidatedApiService } from '../../services/ConsolidatedApiService';
import { formatCurrencyARS } from '../../utils/formatters';

interface Props {
  year: number;
}

interface SalaryData {
  official_name: string;
  role: string;
  basic_salary: number;
  net_salary: number;
  adjustments: string;
  deductions: string;
  inflation_rate: number;
}

interface SalaryAnalytics {
  totalOfficials: number;
  averageSalary: number;
  medianSalary: number;
  highestSalary: number;
  lowestSalary: number;
  totalPayroll: number;
  salaryGap: number;
  inflationImpact: number;
}

const SalaryAnalysisChart: React.FC<Props> = ({ year }) => {
  const [data, setData] = useState<SalaryData[]>([]);
  const [analytics, setAnalytics] = useState<SalaryAnalytics>({
    totalOfficials: 0,
    averageSalary: 0,
    medianSalary: 0,
    highestSalary: 0,
    lowestSalary: 0,
    totalPayroll: 0,
    salaryGap: 0,
    inflationImpact: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<'distribution' | 'roles' | 'trends'>('distribution');

  useEffect(() => {
    loadSalaryData();
  }, [year]);

  const loadSalaryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Loading salary data for year ${year}...`);
      
      const response = await consolidatedApiService.getSalaries(year);
      const salaries = response || [];
      console.log(`📊 Loaded ${salaries.length} salary records from integrated services`);
      
      if (salaries.length === 0) {
        setError('No hay datos de salarios disponibles para este año');
        return;
      }

      // Calculate analytics
      const sortedSalaries = salaries.sort((a, b) => b.net_salary - a.net_salary);
      const totalPayroll = salaries.reduce((sum, s) => sum + s.net_salary, 0);
      const averageSalary = totalPayroll / salaries.length;
      const medianSalary = salaries.length % 2 === 0 
        ? (sortedSalaries[Math.floor(salaries.length / 2)].net_salary + 
           sortedSalaries[Math.floor(salaries.length / 2) - 1].net_salary) / 2
        : sortedSalaries[Math.floor(salaries.length / 2)].net_salary;
      
      const highestSalary = Math.max(...salaries.map(s => s.net_salary));
      const lowestSalary = Math.min(...salaries.map(s => s.net_salary));
      const salaryGap = highestSalary / lowestSalary;
      const avgInflationRate = salaries.reduce((sum, s) => sum + s.inflation_rate, 0) / salaries.length;

      setData(salaries);
      setAnalytics({
        totalOfficials: salaries.length,
        averageSalary,
        medianSalary,
        highestSalary,
        lowestSalary,
        totalPayroll,
        salaryGap,
        inflationImpact: avgInflationRate
      });

    } catch (err) {
      console.error('Failed to load salary data:', err);
      setError('Error al cargar datos de salarios');
    } finally {
      setLoading(false);
    }
  };

  const getSalaryDistributionData = () => {
    if (data.length === 0) return [];

    // Create salary ranges
    const ranges = [
      { min: 0, max: 500000, label: 'Menos de $500K' },
      { min: 500000, max: 1000000, label: '$500K - $1M' },
      { min: 1000000, max: 1500000, label: '$1M - $1.5M' },
      { min: 1500000, max: 2000000, label: '$1.5M - $2M' },
      { min: 2000000, max: Infinity, label: 'Más de $2M' }
    ];

    return ranges.map(range => ({
      range: range.label,
      count: data.filter(s => s.net_salary >= range.min && s.net_salary < range.max).length,
      percentage: (data.filter(s => s.net_salary >= range.min && s.net_salary < range.max).length / data.length) * 100
    }));
  };

  const getRoleAnalysisData = () => {
    if (data.length === 0) return [];

    const roleStats = data.reduce((acc, salary) => {
      const role = salary.role;
      if (!acc[role]) {
        acc[role] = {
          role,
          count: 0,
          totalSalary: 0,
          averageSalary: 0,
          minSalary: Infinity,
          maxSalary: 0
        };
      }
      
      acc[role].count++;
      acc[role].totalSalary += salary.net_salary;
      acc[role].minSalary = Math.min(acc[role].minSalary, salary.net_salary);
      acc[role].maxSalary = Math.max(acc[role].maxSalary, salary.net_salary);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(roleStats).map((role: any) => ({
      ...role,
      averageSalary: role.totalSalary / role.count
    })).sort((a: any, b: any) => b.averageSalary - a.averageSalary);
  };

  const getScatterData = () => {
    return data.map((salary, index) => ({
      x: index + 1,
      y: salary.net_salary,
      name: salary.official_name,
      role: salary.role,
      salary: salary.net_salary
    }));
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === 'salary' || entry.dataKey === 'y' || entry.dataKey === 'averageSalary' 
                ? `${entry.name}: ${formatCurrencyARS(entry.value)}`
                : `${entry.name}: ${entry.value}`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando análisis salarial...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-80 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      );
    }

    switch (selectedChart) {
      case 'distribution': {
        const distributionData = getSalaryDistributionData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={distributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="range" className="text-sm" tick={{ fontSize: 12 }} />
              <YAxis className="text-sm" tick={{ fontSize: 12 }} />
              <Tooltip content={customTooltip} />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Cantidad de Funcionarios" />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'roles': {
        const roleData = getRoleAnalysisData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={roleData.slice(0, 10)} layout="horizontal" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number" 
                className="text-sm" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrencyARS(value, true)}
              />
              <YAxis 
                dataKey="role" 
                type="category" 
                className="text-sm" 
                tick={{ fontSize: 10 }}
                width={100}
              />
              <Tooltip content={customTooltip} />
              <Legend />
              <Bar dataKey="averageSalary" fill="#10B981" name="Salario Promedio" />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'trends': {
        const scatterData = getScatterData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Posición" 
                domain={[1, data.length]}
                className="text-sm"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Salario" 
                className="text-sm"
                tickFormatter={(value) => formatCurrencyARS(value, true)}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{data.role}</p>
                        <p className="text-sm text-green-600">{formatCurrencyARS(data.salary)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData} fill="#8B5CF6" />
              <ReferenceLine y={analytics.averageSalary} stroke="#EF4444" strokeDashArray="5 5" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      }

      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Análisis Salarial {year}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Distribución y análisis de salarios de funcionarios públicos
            </p>
          </div>
          
          {/* Chart selector */}
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setSelectedChart('distribution')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedChart === 'distribution'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <DollarSign size={16} className="mr-1" />
              Distribución
            </button>
            <button
              onClick={() => setSelectedChart('roles')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedChart === 'roles'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Users size={16} className="mr-1" />
              Por Cargo
            </button>
            <button
              onClick={() => setSelectedChart('trends')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedChart === 'trends'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <TrendingUp size={16} className="mr-1" />
              Dispersión
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {analytics.totalOfficials}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Funcionarios</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrencyARS(analytics.averageSalary, true)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Salario Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatCurrencyARS(analytics.medianSalary, true)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Salario Mediano</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {formatCurrencyARS(analytics.highestSalary, true)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Salario Máximo</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {analytics.salaryGap.toFixed(1)}x
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Brecha Salarial</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                {analytics.inflationImpact.toFixed(1)}%
              </p>
              {analytics.inflationImpact > 0 ? (
                <TrendingUp className="ml-1 text-red-500" size={16} />
              ) : (
                <TrendingDown className="ml-1 text-green-500" size={16} />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Inflación Promedio</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {renderChart()}
      </div>

      {/* Additional Info */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-2">Notas sobre el análisis:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Los salarios incluyen ajustes y deducciones según normativa vigente</li>
            <li>La brecha salarial indica la relación entre el salario más alto y el más bajo</li>
            <li>La línea roja en el gráfico de dispersión representa el salario promedio</li>
            <li>Los datos reflejan la estructura salarial del sector público municipal</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default SalaryAnalysisChart;
