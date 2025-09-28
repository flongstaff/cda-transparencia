// FinancialDashboard.tsx
// Main dashboard component for financial data visualization in Carmen de Areco Transparency Portal

import React from 'react';
import { useFinancialData } from '../hooks/useFinancialData';
import FinancialSummaryCard from './FinancialSummaryCard';
import RevenueBySourceChart from './RevenueBySourceChart';
import ExpenditureByProgramChart from './ExpenditureByProgramChart';

interface FinancialDashboardProps {
  year?: number;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ year = 2019 }) => {
  const { data, loading, error } = useFinancialData(year);

  if (loading) {
    return (
      <div className="financial-dashboard">
        <h1>Panel de Datos Financieros {year}</h1>
        <p>Cargando datos financieros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="financial-dashboard">
        <h1>Panel de Datos Financieros {year}</h1>
        <p>Error al cargar los datos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="financial-dashboard">
      <h1>Panel de Datos Financieros {year}</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-item">
          <FinancialSummaryCard 
            data={data.summary} 
            loading={loading} 
            error={error} 
          />
        </div>
        
        <div className="dashboard-item">
          <RevenueBySourceChart 
            data={data.revenueBySource} 
            loading={loading} 
            error={error} 
          />
        </div>
        
        <div className="dashboard-item">
          <ExpenditureByProgramChart 
            data={data.expenditureByProgram} 
            loading={loading} 
            error={error} 
          />
        </div>
      </div>
      
      <div className="dashboard-footer">
        <p>Datos extraídos del Informe Económico Financiero del Municipio de Carmen de Areco para el año {year}</p>
      </div>
    </div>
  );
};

export default FinancialDashboard;