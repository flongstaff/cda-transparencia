// RevenueBySourceChart.tsx
// Component to display revenue by source data in chart form for Carmen de Areco Transparency Portal

import React from 'react';
import { RevenueBySource } from '../services/FinancialDataService';

interface RevenueBySourceChartProps {
  data: RevenueBySource;
  loading: boolean;
  error: Error | null;
}

const RevenueBySourceChart: React.FC<RevenueBySourceChartProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="revenue-chart">
        <h2>Cargando datos de ingresos por fuente...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="revenue-chart">
        <h2>Error al cargar datos de ingresos por fuente</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="revenue-chart">
        <h2>No hay datos de ingresos por fuente disponibles</h2>
      </div>
    );
  }

  // Sort sources by executed amount (descending)
  const sortedSources = [...data.sources].sort((a, b) => b.executed - a.executed);

  return (
    <div className="revenue-chart">
      <h2>Ingresos por Fuente - {data.year}</h2>
      <div className="chart-container">
        <table className="revenue-table">
          <thead>
            <tr>
              <th>Fuente</th>
              <th>Descripción</th>
              <th>Ejecutado</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {sortedSources.map((source, index) => (
              <tr key={index}>
                <td>{source.source}</td>
                <td>{source.description}</td>
                <td>${source.executed.toLocaleString()}</td>
                <td>{source.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueBySourceChart;