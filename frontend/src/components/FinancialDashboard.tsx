import React from 'react';
import ImprovedBarChartComponent from './charts/ImprovedBarChartComponent';
import ImprovedBudgetExecutionChart from './charts/ImprovedBudgetExecutionChart';
import ChartWrapper from './charts/ChartWrapper';

interface FinancialDashboardProps {
  className?: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ className = '' }) => {
  return (
    <div className={`p-4 ${className}`}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Dashboard Financiero</h1>
        <p className="text-gray-600 dark:text-dark-text-secondary">
          Visualización de datos financieros del municipio de Carmen de Areco
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartWrapper 
          title="Ejecución Presupuestaria"
          description="Comparación entre presupuesto aprobado y ejecutado"
        >
          <ImprovedBarChartComponent 
            csvUrl="/data/ejecucion-presupuestaria.csv" 
            compareMode={true}
          />
        </ChartWrapper>

        <ChartWrapper 
          title="Distribución Presupuestaria por Área"
          description="Distribución del presupuesto entre diferentes áreas del gobierno"
        >
          <ImprovedBarChartComponent 
            csvUrl="/data/distribucion-area.csv" 
            dataKey="budgeted"
          />
        </ChartWrapper>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartWrapper 
          title="Ejecución Anual por Sector"
          description="Comparación detallada del presupuesto vs ejecución por sector"
        >
          <ImprovedBudgetExecutionChart 
            data={[
              { sector: 'Educación', budget: 10000000, execution: 8500000 },
              { sector: 'Salud', budget: 8000000, execution: 7200000 },
              { sector: 'Infraestructura', budget: 15000000, execution: 13500000 },
              { sector: 'Seguridad', budget: 5000000, execution: 4800000 },
            ]}
            year={2024}
          />
        </ChartWrapper>
      </div>
    </div>
  );
};

export default FinancialDashboard;