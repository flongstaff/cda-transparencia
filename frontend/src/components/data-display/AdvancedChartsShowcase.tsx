import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TreemapChart,
  WaterfallChart,
  FunnelChart,
  SankeyDiagram,
  GanttChart,
  HeatmapCalendar,
  RadarChart
} from './index';

// Sample data for all charts
const sampleTreemapData = [
  {
    name: 'Secretaría de Obras Públicas',
    children: [
      { name: 'Calle Principal', value: 5000000 },
      { name: 'Parque Central', value: 3000000 },
      { name: 'Sistema de Drenaje', value: 7000000 }
    ]
  },
  {
    name: 'Secretaría de Educación',
    children: [
      { name: 'Escuela Norte', value: 2000000 },
      { name: 'Becas Estudiantiles', value: 1500000 }
    ]
  }
];

const sampleWaterfallData = [
  { name: 'Presupuesto Inicial', value: 10000000, type: 'start' },
  { name: 'Ajuste Positivo', value: 2000000, type: 'increase' },
  { name: 'Recorte', value: -1500000, type: 'decrease' },
  { name: 'Ejecución Adicional', value: 3000000, type: 'increase' },
  { name: 'Total Final', value: 13500000, type: 'end' }
];

const sampleFunnelData = [
  { id: 'Propuestos', value: 120, label: 'Propuestos' },
  { id: 'Aprobados', value: 80, label: 'Aprobados' },
  { id: 'Adjudicados', value: 60, label: 'Adjudicados' },
  { id: 'En Ejecución', value: 45, label: 'En Ejecución' },
  { id: 'Finalizados', value: 35, label: 'Finalizados' }
];

const sampleSankeyData = {
  nodes: [
    { id: 'Presupuesto General' },
    { id: 'Obras Públicas' },
    { id: 'Educación' },
    { id: 'Salud' },
    { id: 'Proyecto A' },
    { id: 'Proyecto B' },
    { id: 'Proveedor X' },
    { id: 'Proveedor Y' }
  ],
  links: [
    { source: 'Presupuesto General', target: 'Obras Públicas', value: 5000000 },
    { source: 'Presupuesto General', target: 'Educación', value: 3000000 },
    { source: 'Presupuesto General', target: 'Salud', value: 2000000 },
    { source: 'Obras Públicas', target: 'Proyecto A', value: 3000000 },
    { source: 'Obras Públicas', target: 'Proyecto B', value: 2000000 },
    { source: 'Proyecto A', target: 'Proveedor X', value: 3000000 },
    { source: 'Proyecto B', target: 'Proveedor Y', value: 2000000 }
  ]
};

const sampleGanttTasks = [
  {
    id: 'Task 1',
    name: 'Construcción Plaza Central',
    start: '2024-01-01',
    end: '2024-06-30',
    progress: 75,
    dependencies: ''
  },
  {
    id: 'Task 2',
    name: 'Reforma Escuela Primaria',
    start: '2024-03-01',
    end: '2024-09-30',
    progress: 40,
    dependencies: 'Task 1'
  }
];

const sampleCalendarData = [
  { day: '2024-01-01', value: 12 },
  { day: '2024-01-02', value: 5 },
  { day: '2024-01-03', value: 8 },
  { day: '2024-01-04', value: 15 },
  { day: '2024-01-05', value: 7 },
  { day: '2024-01-06', value: 3 },
  { day: '2024-01-07', value: 9 }
];

const sampleRadarData = [
  { subject: 'Ejecución Presupuestaria', A: 120, B: 90, fullMark: 150 },
  { subject: 'Cumplimiento de Plazos', A: 98, B: 86, fullMark: 150 },
  { subject: 'Calidad de Obra', A: 86, B: 110, fullMark: 150 },
  { subject: 'Satisfacción Ciudadana', A: 99, B: 85, fullMark: 150 },
  { subject: 'Eficiencia de Costos', A: 85, B: 90, fullMark: 150 }
];

const AdvancedChartsShowcase: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Visualizaciones Avanzadas</h1>
        <p className="text-gray-600 mb-6">
          Demostración de todos los tipos de gráficos avanzados disponibles en el portal de transparencia
        </p>
        
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Año:</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TreemapChart 
            data={sampleTreemapData}
            title="🌳 Treemap: Distribución Presupuestaria"
            height={400}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WaterfallChart 
            data={sampleWaterfallData}
            title="💧 Waterfall: Evolución del Presupuesto"
            height={400}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FunnelChart 
            data={sampleFunnelData}
            title="漏 Funnel: Proceso de Contratación"
            height={400}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SankeyDiagram 
            data={sampleSankeyData}
            title="🔗 Sankey: Flujo de Fondos"
            height={400}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <GanttChart 
            tasks={sampleGanttTasks}
            title="⏱️ Gantt: Cronograma de Proyectos"
            height={400}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <HeatmapCalendar 
            data={sampleCalendarData}
            from="2024-01-01"
            to="2024-01-07"
            title="🗓️ Heatmap: Actividad Diaria"
            height={400}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <RadarChart 
            data={sampleRadarData}
            title="🎯 Radar: Comparativa de Desempeño"
            height={400}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedChartsShowcase;