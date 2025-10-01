/**
 * MonitoringPage Component
 * Main page for the monitoring and evaluation dashboard
 * Following AAIP guidelines for transparency and data protection
 */

import React from 'react';
import { BarChart3, Shield, Users, Database, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import MonitoringDashboard from '../components/MonitoringDashboard';
import KpiCards from '../components/KpiCards';
import ComplianceChart from '../components/ComplianceChart';
import DataQualityReport from '../components/DataQualityReport';
import UserEngagementChart from '../components/UserEngagementChart';
import RealtimeMetrics from '../components/RealtimeMetrics';

const MonitoringPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                Panel de Monitoreo y Evaluación
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Seguimiento en tiempo real del cumplimiento y rendimiento del portal de transparencia
              </p>
            </div>
            
            {/* AAIP Compliance Badges */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm px-3 py-1.5 rounded-full">
                <Shield className="h-4 w-4 mr-1" />
                Cumple AAIP
              </div>
              <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm px-3 py-1.5 rounded-full">
                <Shield className="h-4 w-4 mr-1" />
                ITA Método
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mt-6 flex space-x-8">
            {[
              { id: 'dashboard', name: 'Panel Principal', icon: BarChart3 },
              { id: 'kpis', name: 'Indicadores KPI', icon: TrendingUp },
              { id: 'compliance', name: 'Cumplimiento', icon: Shield },
              { id: 'quality', name: 'Calidad de Datos', icon: Database },
              { id: 'engagement', name: 'Participación', icon: Users },
              { id: 'realtime', name: 'Métricas en Vivo', icon: Activity }
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center px-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <section id="dashboard" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
              Vista General del Portal
            </h2>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Activity className="h-4 w-4 mr-1 text-green-500 animate-pulse" />
              <span>Actualizado en tiempo real</span>
            </div>
          </div>
          
          <MonitoringDashboard />
        </section>

        {/* KPI Indicators */}
        <section id="kpis" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
              Indicadores de Rendimiento Clave (KPI)
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Basado en metodología AAIP ITA
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
            <KpiCards 
              kpis={[
                {
                  id: 'data-availability',
                  name: 'Disponibilidad de Datos',
                  category: 'Calidad de Datos',
                  currentValue: 95.2,
                  targetValue: 100,
                  unit: 'porcentaje',
                  status: 'healthy'
                },
                {
                  id: 'update-timeliness',
                  name: 'Actualización Oportuna',
                  category: 'Calidad de Datos',
                  currentValue: 87.5,
                  targetValue: 95,
                  unit: 'porcentaje',
                  status: 'warning'
                },
                {
                  id: 'data-completeness',
                  name: 'Integridad de Datos',
                  category: 'Calidad de Datos',
                  currentValue: 92.8,
                  targetValue: 98,
                  unit: 'porcentaje',
                  status: 'healthy'
                },
                {
                  id: 'accessibility-compliance',
                  name: 'Cumplimiento de Accesibilidad',
                  category: 'Experiencia del Usuario',
                  currentValue: 98.1,
                  targetValue: 100,
                  unit: 'porcentaje',
                  status: 'healthy'
                }
              ]} 
            />
          </div>
        </section>

        {/* Compliance Status */}
        <section id="compliance" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Estado de Cumplimiento
            </h2>
            <div className="flex items-center">
              <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm px-3 py-1 rounded-full">
                <CheckCircle className="h-4 w-4 mr-1" />
                94.2% Cumplimiento
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
            <ComplianceChart 
              complianceData={{
                overallCompliance: {
                  score: 94.2,
                  status: 'compliant',
                  compliantCriteria: 47,
                  totalCriteria: 50
                },
                aaipCompliance: {
                  overallCompliant: true,
                  itaAlignment: true,
                  accessibility: true,
                  usability: true,
                  findability: true,
                  selfAssessment: true,
                  publicReporting: true
                },
                dataProtectionCompliance: {
                  overallCompliant: true,
                  ley25326: true,
                  arcoRights: true
                },
                monitoring: {
                  overallCompliant: true,
                  dashboardImplementation: true,
                  continuousImprovement: true
                }
              }} 
            />
          </div>
        </section>

        {/* Data Quality */}
        <section id="quality" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Database className="h-6 w-6 mr-2 text-blue-600" />
              Calidad de los Datos Publicados
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Evaluación continua
            </div>
          </div>
          
          <DataQualityReport />
        </section>

        {/* User Engagement */}
        <section id="engagement" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Participación Ciudadana
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Métricas de uso y engagement
            </div>
          </div>
          
          <UserEngagementChart />
        </section>

        {/* Real-time Metrics */}
        <section id="realtime" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Activity className="h-6 w-6 mr-2 text-blue-600" />
              Métricas en Tiempo Real
            </h2>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Activity className="h-4 w-4 mr-1 text-green-500 animate-pulse" />
              <span>Actualización automática</span>
            </div>
          </div>
          
          <RealtimeMetrics />
        </section>

        {/* AAIP Compliance Statement */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Compromiso con la Transparencia Activa
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
            Este panel de monitoreo y evaluación se adhiere a las directrices de la Agencia de Acceso a la Información Pública (AAIP) 
            y sigue la metodología del Índice de Transparencia Activa (ITA).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-blue-700 dark:text-blue-300">
                Evaluación continua de indicadores de transparencia según ITA
              </span>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-blue-700 dark:text-blue-300">
                Reportes automáticos de cumplimiento y autoevaluación
              </span>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2 mt-0.5">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-blue-700 dark:text-blue-300">
                Protección de datos personales garantizada (sin seguimiento individual)
              </span>
            </div>
          </div>
        </div>

        {/* Data Protection Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Protección de Datos Personales
          </h3>
          <p className="text-green-700 dark:text-green-300 text-sm">
            Todas las métricas y análisis presentados en este panel se realizan de manera completamente anonimizada 
            y agregada, sin procesar ni almacenar datos personales identificables. El sistema cumple con la Ley 25.326 
            de Protección de Datos Personales y las directrices de la AAIP.
          </p>
          <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Ningún dato personal es procesado o almacenado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;