import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Database,
  Download,
  RefreshCw,
  Maximize2,
  Filter,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';

// Chart components
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Services
import PowerBIDataService from '../../services/PowerBIDataService';
import { consolidatedApiService } from '../../services/ConsolidatedApiService';

interface PowerBIData {
  financial: any;
  municipal: any;
  budget: any;
  revenue: any;
  expenses: any;
  contracts: any;
  transparency: any;
}

interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed';
  data: any[];
  config: any;
  size: 'small' | 'medium' | 'large' | 'full';
  category: string;
}

const PowerBIIntegrationDashboard: React.FC = () => {
  const [data, setData] = useState<PowerBIData>({
    financial: null,
    municipal: null,
    budget: null,
    revenue: null,
    expenses: null,
    contracts: null,
    transparency: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [activeCategory, setActiveCategory] = useState('financial');
  const [chartsConfig, setChartsConfig] = useState<ChartConfig[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'expenses', 'budget', 'contracts']);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Load PowerBI data
  const loadPowerBIData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all PowerBI datasets
      const [
        financialData,
        municipalData,
        budgetData,
        documentsData
      ] = await Promise.allSettled([
        PowerBIDataService.getFinancialDataset(selectedYear),
        PowerBIDataService.getMunicipalDataset(selectedYear),
        consolidatedApiService.getBudgetData(selectedYear),
        consolidatedApiService.getDocuments(selectedYear)
      ]);

      const powerBIData: PowerBIData = {
        financial: financialData.status === 'fulfilled' ? financialData.value : null,
        municipal: municipalData.status === 'fulfilled' ? municipalData.value : null,
        budget: budgetData.status === 'fulfilled' ? budgetData.value : null,
        revenue: generateRevenueData(),
        expenses: generateExpensesData(),
        contracts: generateContractsData(documentsData.status === 'fulfilled' ? documentsData.value : []),
        transparency: generateTransparencyMetrics()
      };

      setData(powerBIData);
      generateChartsConfiguration(powerBIData);
    } catch (err) {
      console.error('Error loading PowerBI data:', err);
      setError(err instanceof Error ? err.message : 'Error loading PowerBI data');
    } finally {
      setLoading(false);
    }
  };

  // Generate sample revenue data
  const generateRevenueData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months.map((month, index) => ({
      month,
      ingresos_propios: Math.round(50000 + Math.random() * 30000),
      transferencias: Math.round(80000 + Math.random() * 20000),
      otros_ingresos: Math.round(10000 + Math.random() * 15000),
      total: 0
    })).map(item => ({
      ...item,
      total: item.ingresos_propios + item.transferencias + item.otros_ingresos
    }));
  };

  // Generate sample expenses data
  const generateExpensesData = () => {
    const categories = ['Personal', 'Servicios', 'Bienes', 'Transferencias', 'Inversión', 'Deuda'];
    return categories.map(category => ({
      category,
      presupuestado: Math.round(100000 + Math.random() * 200000),
      ejecutado: Math.round(80000 + Math.random() * 150000),
      porcentaje: 0
    })).map(item => ({
      ...item,
      porcentaje: Math.round((item.ejecutado / item.presupuestado) * 100)
    }));
  };

  // Generate contracts data
  const generateContractsData = (documents: any[]) => {
    const contracts = documents.filter(doc => doc.category === 'Contratos');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    return months.map(month => ({
      month,
      contratos_nuevos: Math.round(Math.random() * 10) + 1,
      valor_total: Math.round(500000 + Math.random() * 1000000),
      licitaciones: Math.round(Math.random() * 5) + 1
    }));
  };

  // Generate transparency metrics
  const generateTransparencyMetrics = () => {
    return [
      { metric: 'Publicación', value: 95, max: 100 },
      { metric: 'Accesibilidad', value: 88, max: 100 },
      { metric: 'Completitud', value: 92, max: 100 },
      { metric: 'Oportunidad', value: 85, max: 100 },
      { metric: 'Exactitud', value: 90, max: 100 }
    ];
  };

  // Generate charts configuration
  const generateChartsConfiguration = (powerBIData: PowerBIData) => {
    const charts: ChartConfig[] = [
      // Revenue Charts
      {
        id: 'revenue-trend',
        title: 'Evolución de Ingresos',
        type: 'composed',
        data: powerBIData.revenue,
        config: {
          bars: [
            { dataKey: 'ingresos_propios', fill: '#3B82F6', name: 'Ingresos Propios' },
            { dataKey: 'transferencias', fill: '#10B981', name: 'Transferencias' },
            { dataKey: 'otros_ingresos', fill: '#F59E0B', name: 'Otros Ingresos' }
          ],
          lines: [
            { dataKey: 'total', stroke: '#EF4444', strokeWidth: 3, name: 'Total' }
          ]
        },
        size: 'large',
        category: 'financial'
      },
      
      // Expenses Chart
      {
        id: 'expenses-execution',
        title: 'Ejecución Presupuestaria por Categoría',
        type: 'bar',
        data: powerBIData.expenses,
        config: {
          bars: [
            { dataKey: 'presupuestado', fill: '#8B5CF6', name: 'Presupuestado' },
            { dataKey: 'ejecutado', fill: '#EC4899', name: 'Ejecutado' }
          ],
          xAxisKey: 'category'
        },
        size: 'medium',
        category: 'budget'
      },

      // Execution Percentage Pie
      {
        id: 'execution-pie',
        title: 'Distribución de Ejecución',
        type: 'pie',
        data: powerBIData.expenses.map((item, index) => ({
          name: item.category,
          value: item.porcentaje,
          fill: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index]
        })),
        config: {},
        size: 'medium',
        category: 'budget'
      },

      // Contracts Trend
      {
        id: 'contracts-trend',
        title: 'Tendencia de Contrataciones',
        type: 'area',
        data: powerBIData.contracts,
        config: {
          areas: [
            { dataKey: 'valor_total', fill: '#3B82F6', fillOpacity: 0.6, name: 'Valor Total' }
          ],
          xAxisKey: 'month'
        },
        size: 'large',
        category: 'contracts'
      },

      // Transparency Radar
      {
        id: 'transparency-radar',
        title: 'Métricas de Transparencia',
        type: 'radar',
        data: powerBIData.transparency,
        config: {
          dataKey: 'value',
          angleKey: 'metric'
        },
        size: 'medium',
        category: 'transparency'
      },

      // Revenue vs Expenses Scatter
      {
        id: 'revenue-expenses-scatter',
        title: 'Ingresos vs Gastos (Mensual)',
        type: 'scatter',
        data: powerBIData.revenue.map((item, index) => ({
          ingresos: item.total,
          gastos: powerBIData.expenses.reduce((sum, exp) => sum + (exp.ejecutado / 12), 0),
          month: item.month
        })),
        config: {
          xAxisKey: 'ingresos',
          yAxisKey: 'gastos'
        },
        size: 'medium',
        category: 'financial'
      }
    ];

    setChartsConfig(charts);
  };

  useEffect(() => {
    loadPowerBIData();
  }, [selectedYear]);

  // Color palette
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Render chart based on type
  const renderChart = (chart: ChartConfig) => {
    const height = chart.size === 'small' ? 200 : chart.size === 'medium' ? 300 : chart.size === 'large' ? 400 : 500;

    switch (chart.type) {
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.config.xAxisKey || 'month'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.config.bars?.map((bar: any) => (
                <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.fill} name={bar.name} />
              ))}
              {chart.config.lines?.map((line: any) => (
                <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} stroke={line.stroke} strokeWidth={line.strokeWidth} name={line.name} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.config.xAxisKey || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.config.bars?.map((bar: any) => (
                <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.fill} name={bar.name} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {chart.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.config.xAxisKey || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.config.areas?.map((area: any) => (
                <Area key={area.dataKey} type="monotone" dataKey={area.dataKey} fill={area.fill} fillOpacity={area.fillOpacity} name={area.name} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chart.data}>
              <PolarGrid />
              <PolarAngleAxis dataKey={chart.config.angleKey} />
              <PolarRadiusAxis />
              <Radar name="Puntuación" dataKey={chart.config.dataKey} stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey={chart.config.xAxisKey} name="Ingresos" />
              <YAxis type="number" dataKey={chart.config.yAxisKey} name="Gastos" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter fill="#3B82F6" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Tipo de gráfico no soportado</div>;
    }
  };

  // Filter charts by category and selected metrics
  const filteredCharts = chartsConfig.filter(chart => 
    (activeCategory === 'all' || chart.category === activeCategory) &&
    selectedMetrics.some(metric => chart.id.includes(metric) || chart.category === metric)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Cargando datos de PowerBI...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
              PowerBI Integration Dashboard
            </h2>
            <p className="text-gray-600 mt-1">Visualizaciones avanzadas de todos los datos financieros</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[2025, 2024, 2023, 2022, 2021, 2020].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="financial">Financiero</option>
              <option value="budget">Presupuesto</option>
              <option value="contracts">Contratos</option>
              <option value="transparency">Transparencia</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadPowerBIData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Selector */}
        <div className="mt-4 flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Mostrar métricas:</span>
          {['revenue', 'expenses', 'budget', 'contracts', 'transparency'].map(metric => (
            <label key={metric} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMetrics([...selectedMetrics, metric]);
                  } else {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">{metric}</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCharts.map((chart) => (
            <motion.div
              key={chart.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg shadow-md p-6 ${
                chart.size === 'large' ? 'lg:col-span-2' :
                chart.size === 'full' ? 'lg:col-span-3' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {renderChart(chart)}
            </motion.div>
          ))}
        </div>

        {filteredCharts.length === 0 && (
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay gráficos disponibles</h3>
            <p className="text-gray-600">
              Ajusta los filtros para ver las visualizaciones
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 border-t border-gray-200 p-6 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.revenue?.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-AR') || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Total Ingresos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.expenses?.reduce((sum, item) => sum + item.ejecutado, 0).toLocaleString('es-AR') || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Total Ejecutado</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.contracts?.reduce((sum, item) => sum + item.contratos_nuevos, 0) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Contratos Nuevos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.transparency?.reduce((sum, item) => sum + item.value, 0) / data.transparency?.length || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Score Promedio</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerBIIntegrationDashboard;