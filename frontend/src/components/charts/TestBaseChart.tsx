import React from 'react';
import BaseChart from './BaseChart';

const TestBaseChart: React.FC = () => {
  // Sample data for testing
  const testData = [
    { month: 'ENE', budgeted: 1000000, executed: 950000 },
    { month: 'FEB', budgeted: 1200000, executed: 1100000 },
    { month: 'MAR', budgeted: 1100000, executed: 1050000 },
    { month: 'ABR', budgeted: 1300000, executed: 1250000 },
    { month: 'MAY', budgeted: 1250000, executed: 1200000 },
    { month: 'JUN', budgeted: 1400000, executed: 1350000 }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test BaseChart Component</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Bar Chart Test</h3>
        <div className="h-64">
          <BaseChart
            data={testData}
            chartType="bar"
            xAxisKey="month"
            yAxisKeys={['budgeted', 'executed']}
            title="Presupuesto vs Ejecutado"
            height={300}
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Line Chart Test</h3>
        <div className="h-64">
          <BaseChart
            data={testData}
            chartType="line"
            xAxisKey="month"
            yAxisKeys={['budgeted', 'executed']}
            title="Tendencia de Ejecución"
            height={300}
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Pie Chart Test</h3>
        <div className="h-64">
          <BaseChart
            data={testData}
            chartType="pie"
            xAxisKey="month"
            yAxisKeys={['executed']}
            title="Distribución por Mes"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default TestBaseChart;