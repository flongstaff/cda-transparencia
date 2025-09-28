// TransparencyPage.tsx
// Main transparency page component for Carmen de Areco Transparency Portal

import React, { useState } from 'react';
import FinancialDashboard from '../components/FinancialDashboard';

const TransparencyPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2019);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(event.target.value));
  };

  return (
    <div className="transparency-page">
      <header className="page-header">
        <h1>Portal de Transparencia del Municipio de Carmen de Areco</h1>
        <div className="year-selector">
          <label htmlFor="year-select">Seleccionar Año:</label>
          <select id="year-select" value={selectedYear} onChange={handleYearChange}>
            <option value={2019}>2019</option>
            <option value={2020}>2020</option>
            <option value={2021}>2021</option>
            <option value={2022}>2022</option>
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </header>

      <main className="page-main">
        <FinancialDashboard year={selectedYear} />
      </main>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} Municipio de Carmen de Areco - Todos los derechos reservados</p>
        <p>Los datos presentados son extraídos directamente de los informes oficiales del municipio</p>
      </footer>
    </div>
  );
};

export default TransparencyPage;