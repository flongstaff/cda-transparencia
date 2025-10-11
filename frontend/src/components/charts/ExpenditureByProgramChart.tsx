// ExpenditureByProgramChart.tsx
// Component to display expenditure by program data in chart form for Carmen de Areco Transparency Portal

import React from 'react';
import { ExpenditureByProgram } from '../../services/FinancialDataService';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

interface ExpenditureByProgramChartProps {
  data: ExpenditureByProgram;
  loading: boolean;
  error: Error | null;
}

const ExpenditureByProgramChart: React.FC<ExpenditureByProgramChartProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="expenditure-chart">
        <h2>Cargando datos de gastos por programa...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expenditure-chart">
        <h2>Error al cargar datos de gastos por programa</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="expenditure-chart">
        <h2>No hay datos de gastos por programa disponibles</h2>
      </div>
    );
  }

  // Sort programs by executed amount (descending) and take top 10
  const topPrograms = [...data.programs]
    .filter(program => program.program_name !== 'Total General')
    .sort((a, b) => b.executed - a.executed)
    .slice(0, 10);

  return (
    <div className="expenditure-chart">
      <h2>Gastos por Programa - {data.year}</h2>
      <div className="chart-container">
        <table className="expenditure-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Programa</th>
              <th>Presupuestado</th>
              <th>Ejecutado</th>
              <th>Pagado</th>
            </tr>
          </thead>
          <tbody>
            {topPrograms.map((program, index) => (
              <tr key={index}>
                <td>{program.program_code}</td>
                <td>{program.program_name}</td>
                <td>${program.budgeted.toLocaleString()}</td>
                <td>${program.executed.toLocaleString()}</td>
                <td>${program.paid.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenditureByProgramChart;