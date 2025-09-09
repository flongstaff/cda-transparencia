import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Filter, Share2, PieChart, Settings, Eye } from 'lucide-react';
import AdvancedChartLoader, { AdvancedChartType, useAdvancedChartPreloader } from './AdvancedChartLoader';

interface AdvancedChartsShowcaseProps {
  year?: number;
  locale?: string;
  enablePreloading?: boolean;
}

const AdvancedChartsShowcase: React.FC<AdvancedChartsShowcaseProps> = ({
  year = 2024,
  locale = 'es',
  enablePreloading = true
}) => {
  const { t } = useTranslation();
  const [activeChart, setActiveChart] = useState<AdvancedChartType>('treemap');
  const [showSettings, setShowSettings] = useState(false);
  
  const { preloadMultipleCharts, preloadedCharts, isPreloading } = useAdvancedChartPreloader();

  // Preload all charts on mount
  React.useEffect(() => {
    if (enablePreloading) {
      preloadMultipleCharts(['treemap', 'waterfall', 'funnel', 'sankey', 'debt', 'budget']);
    }
  }, [enablePreloading, preloadMultipleCharts]);

  // Sample data for each chart type
  const chartData = useMemo(() => ({
    // Treemap data - hierarchical budget breakdown
    treemap: [
      {
        name: 'Secretaría de Obras Públicas',
        value: 15000000,
        category: 'infrastructure',
        children: [
          { name: 'Pavimentación Calle Principal', value: 7000000 },
          { name: 'Construcción Parque Central', value: 5000000 },
          { name: 'Sistema de Drenaje', value: 3000000 }
        ]
      },
      {
        name: 'Secretaría de Educación',
        value: 12000000,
        category: 'education',
        children: [
          { name: 'Refacción Escuela Norte', value: 6000000 },
          { name: 'Programa Becas Estudiantiles', value: 4000000 },
          { name: 'Equipamiento Tecnológico', value: 2000000 }
        ]
      },
      {
        name: 'Secretaría de Salud',
        value: 8000000,
        category: 'health',
        children: [
          { name: 'Ampliación Centro de Salud', value: 5000000 },
          { name: 'Equipamiento Médico', value: 3000000 }
        ]
      }
    ],

    // Waterfall data - budget evolution
    waterfall: [
      { name: 'Presupuesto Inicial', value: 35000000, type: 'start' as const, description: 'Presupuesto aprobado para el año' },
      { name: 'Ajuste Legislativo', value: 3000000, type: 'increase' as const, description: 'Incremento aprobado por el concejo' },
      { name: 'Recorte Federal', value: -2000000, type: 'decrease' as const, description: 'Reducción por cambios federales' },
      { name: 'Fondos de Emergencia', value: 1500000, type: 'increase' as const, description: 'Asignación especial por emergencia' },
      { name: 'Reasignaciones', value: -500000, type: 'decrease' as const, description: 'Optimización entre áreas' },
      { name: 'Presupuesto Final', value: 37000000, type: 'end' as const, description: 'Presupuesto definitivo ejecutable' }
    ],

    // Funnel data - contract process stages
    funnel: [
      { id: 'propuestos', label: 'Contratos Propuestos', value: 150, description: 'Contratos ingresados al sistema' },
      { id: 'evaluacion', label: 'En Evaluación', value: 120, description: 'Contratos bajo análisis técnico' },
      { id: 'aprobados', label: 'Aprobados', value: 85, description: 'Contratos aprobados por comisión' },
      { id: 'adjudicados', label: 'Adjudicados', value: 72, description: 'Contratos formalmente adjudicados' },
      { id: 'ejecutandose', label: 'En Ejecución', value: 58, description: 'Contratos en proceso de ejecución' },
      { id: 'finalizados', label: 'Finalizados', value: 45, description: 'Contratos completados exitosamente' }
    ],

    // Sankey data - fund flows
    sankey: {
      nodes: [
        { id: 'presupuesto-general', label: 'Presupuesto General', category: 'source' },
        { id: 'obras-publicas', label: 'Obras Públicas', category: 'department' },
        { id: 'educacion', label: 'Educación', category: 'department' },
        { id: 'salud', label: 'Salud', category: 'department' },
        { id: 'proyecto-pavimentacion', label: 'Pavimentación', category: 'project' },
        { id: 'proyecto-parque', label: 'Parque Central', category: 'project' },
        { id: 'escuela-refaccion', label: 'Refacción Escuela', category: 'project' },
        { id: 'centro-salud', label: 'Centro de Salud', category: 'project' },
        { id: 'proveedor-construccion', label: 'Constructora ABC', category: 'vendor' },
        { id: 'proveedor-equipamiento', label: 'Equipos SA', category: 'vendor' }
      ],
      links: [
        { source: 'presupuesto-general', target: 'obras-publicas', value: 15000000, category: 'budget-allocation' },
        { source: 'presupuesto-general', target: 'educacion', value: 12000000, category: 'budget-allocation' },
        { source: 'presupuesto-general', target: 'salud', value: 8000000, category: 'budget-allocation' },
        { source: 'obras-publicas', target: 'proyecto-pavimentacion', value: 8000000, category: 'project-funding' },
        { source: 'obras-publicas', target: 'proyecto-parque', value: 7000000, category: 'project-funding' },
        { source: 'educacion', target: 'escuela-refaccion', value: 8000000, category: 'project-funding' },
        { source: 'salud', target: 'centro-salud', value: 6000000, category: 'project-funding' },
        { source: 'proyecto-pavimentacion', target: 'proveedor-construccion', value: 8000000, category: 'vendor-payment' },
        { source: 'proyecto-parque', target: 'proveedor-construccion', value: 5000000, category: 'vendor-payment' },
        { source: 'escuela-refaccion', target: 'proveedor-equipamiento', value: 3000000, category: 'vendor-payment' }
      ]
    },

    // Debt data
    debt: { year },

    // Budget data  
    budget: { year, locale }
  }), [year, locale]);

  const chartConfigs = [
    {
      id: 'treemap' as AdvancedChartType,
      title: 'Distribución Jerárquica',
      description: 'Visualización proporcional del presupuesto por secretaría y proyecto',
      icon: BarChart3,
      color: 'blue'
    },
    {
      id: 'waterfall' as AdvancedChartType,
      title: 'Evolución Presupuestaria',
      description: 'Seguimiento de cambios secuenciales en el presupuesto municipal',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'funnel' as AdvancedChartType,
      title: 'Embudo de Procesos',
      description: 'Análisis de etapas y tasas de conversión en procesos municipales',
      icon: Filter,
      color: 'orange'
    },
    {
      id: 'sankey' as AdvancedChartType,
      title: 'Flujo de Fondos',
      description: 'Diagrama de flujo de recursos entre áreas y proyectos',
      icon: Share2,
      color: 'purple'
    },
    {
      id: 'debt' as AdvancedChartType,
      title: 'Análisis de Deuda',
      description: 'Visualización comprehensiva de la deuda municipal',
      icon: PieChart,
      color: 'red'
    },
    {
      id: 'budget' as AdvancedChartType,
      title: 'Presupuesto Avanzado',
      description: 'Análisis presupuestario con métricas avanzadas y comparativas',
      icon: BarChart3,
      color: 'indigo'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: {
        bg: isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800',
        border: isActive ? 'border-blue-300 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700',
        text: isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300',
        icon: 'text-blue-600 dark:text-blue-400'
      },
      green: {
        bg: isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800',
        border: isActive ? 'border-green-300 dark:border-green-600' : 'border-gray-200 dark:border-gray-700',
        text: isActive ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300',
        icon: 'text-green-600 dark:text-green-400'
      },
      orange: {
        bg: isActive ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-50 dark:bg-gray-800',
        border: isActive ? 'border-orange-300 dark:border-orange-600' : 'border-gray-200 dark:border-gray-700',
        text: isActive ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300',
        icon: 'text-orange-600 dark:text-orange-400'
      },
      purple: {
        bg: isActive ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-50 dark:bg-gray-800',
        border: isActive ? 'border-purple-300 dark:border-purple-600' : 'border-gray-200 dark:border-gray-700',
        text: isActive ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300',
        icon: 'text-purple-600 dark:text-purple-400'
      },
      red: {
        bg: isActive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-800',
        border: isActive ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-700',
        text: isActive ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300',
        icon: 'text-red-600 dark:text-red-400'
      },
      indigo: {
        bg: isActive ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-50 dark:bg-gray-800',
        border: isActive ? 'border-indigo-300 dark:border-indigo-600' : 'border-gray-200 dark:border-gray-700',
        text: isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300',
        icon: 'text-indigo-600 dark:text-indigo-400'
      }
    };
    
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Visualizaciones Avanzadas de Transparencia
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Suite completa de gráficos especializados para análisis municipal
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Preloading status */}
            {enablePreloading && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isPreloading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isPreloading ? 'Cargando...' : `${preloadedCharts.size}/6 listos`}
                </span>
              </div>
            )}
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Año
                </label>
                <select 
                  value={year}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                  <option value={2022}>2022</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Idioma
                </label>
                <select 
                  value={locale}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enablePreloading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Precarga automática
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {chartConfigs.map(chart => {
          const isActive = activeChart === chart.id;
          const colorClasses = getColorClasses(chart.color, isActive);
          const IconComponent = chart.icon;
          const isPreloaded = preloadedCharts.has(chart.id);

          return (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${colorClasses.bg} ${colorClasses.border} ${colorClasses.text}`}
            >
              <div className="text-center">
                <div className={`mx-auto mb-3 p-2 rounded-lg w-fit ${isActive ? 'bg-white dark:bg-gray-700' : ''}`}>
                  <IconComponent className={`h-6 w-6 ${colorClasses.icon}`} />
                </div>
                
                <h3 className="font-semibold text-sm mb-1">
                  {chart.title}
                </h3>
                
                <p className="text-xs opacity-75 leading-tight">
                  {chart.description}
                </p>
                
                {/* Preload status indicator */}
                <div className="flex items-center justify-center mt-2 space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isPreloaded ? 'bg-green-400' : isPreloading ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-xs opacity-60">
                    {isPreloaded ? 'Listo' : isPreloading ? 'Cargando...' : 'Pendiente'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active chart display */}
      <div className="min-h-[600px]">
        <AdvancedChartLoader
          chartType={activeChart}
          chartProps={chartData[activeChart]}
          showChartInfo={true}
          enablePerformanceMonitoring={true}
        />
      </div>

      {/* Chart information panel */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Acerca de {chartConfigs.find(c => c.id === activeChart)?.title}
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed mb-3">
              {chartConfigs.find(c => c.id === activeChart)?.description}
            </p>
            
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p><strong>Casos de uso:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {activeChart === 'treemap' && (
                  <>
                    <li>Distribución jerárquica del presupuesto por áreas y proyectos</li>
                    <li>Análisis de inversiones por categoría de activos</li>
                    <li>Visualización de gastos por departamento y sub-área</li>
                  </>
                )}
                {activeChart === 'waterfall' && (
                  <>
                    <li>Seguimiento de evolución presupuestaria: inicial → ajustes → final</li>
                    <li>Análisis de depreciación de activos a lo largo del tiempo</li>
                    <li>Tracking de cambios en deuda municipal</li>
                  </>
                )}
                {activeChart === 'funnel' && (
                  <>
                    <li>Procesos de licitación: propuesta → evaluación → adjudicación</li>
                    <li>Pipeline de inversiones: propuesto → aprobado → ejecutado</li>
                    <li>Análisis de conversión en tramites municipales</li>
                  </>
                )}
                {activeChart === 'sankey' && (
                  <>
                    <li>Flujo de fondos: presupuesto → departamentos → proyectos → proveedores</li>
                    <li>Origen y destino de la deuda municipal</li>
                    <li>Distribución de recursos entre programas sociales</li>
                  </>
                )}
                {activeChart === 'debt' && (
                  <>
                    <li>Análisis comprehensivo de deuda por tipo y vencimiento</li>
                    <li>Métricas de riesgo financiero y carga de intereses</li>
                    <li>Comparación histórica de niveles de endeudamiento</li>
                  </>
                )}
                {activeChart === 'budget' && (
                  <>
                    <li>Análisis presupuestario con métricas de ejecución</li>
                    <li>Comparación presupuesto vs. ejecución por categoría</li>
                    <li>Indicadores de eficiencia y varianza presupuestaria</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedChartsShowcase;