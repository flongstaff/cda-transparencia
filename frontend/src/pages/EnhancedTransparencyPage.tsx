/**
 * Enhanced Transparency Page
 * Main page integrating all transparency features with data visualization and OSINT monitoring
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import EnhancedTransparencyDashboard from '../components/dashboard/EnhancedTransparencyDashboard';

interface EnhancedTransparencyPageProps {
  year?: number;
  municipality?: string;
}

const EnhancedTransparencyPage: React.FC<EnhancedTransparencyPageProps> = ({
  year = new Date().getFullYear(),
  municipality = 'Carmen de Areco'
}) => {
  return (
    <>
      <Helmet>
        <title>Portal de Transparencia - {municipality} {year}</title>
        <meta 
          name="description" 
          content={`Portal de transparencia municipal de ${municipality} con análisis financiero, monitoreo OSINT y auditoría de datos para el año ${year}`} 
        />
        <meta name="keywords" content="transparencia, municipal, presupuesto, gastos, ingresos, auditoría, OSINT" />
        <meta property="og:title" content={`Portal de Transparencia - ${municipality} ${year}`} />
        <meta property="og:description" content={`Análisis completo de transparencia municipal con monitoreo de fuentes abiertas`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <EnhancedTransparencyDashboard
          initialYear={year}
          municipality={municipality}
        />
      </div>
    </>
  );
};

export default EnhancedTransparencyPage;
