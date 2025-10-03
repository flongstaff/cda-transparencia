/**
 * ComplianceChart Component
 * Visualizes compliance status with AAIP guidelines and data protection laws
 * Following AAIP guidelines for transparency and data protection
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ComplianceChartProps {
  complianceData: any;
}

const ComplianceChart: React.FC<ComplianceChartProps> = ({ complianceData }) => {
  // Prepare data for pie chart
  const pieChartData = [
    { name: 'Cumplido', value: complianceData.overallCompliance.compliantCriteria, color: '#10B981' },
    { name: 'No Cumplido', value: complianceData.overallCompliance.totalCriteria - complianceData.overallCompliance.compliantCriteria, color: '#EF4444' }
  ];

  // Prepare data for bar chart
  const barChartData = [
    { name: 'AAIP', 
      compliance: complianceData.aaipCompliance.itaAlignment ? 100 : 0,
      accessibility: complianceData.aaipCompliance.accessibility ? 100 : 0,
      usability: complianceData.aaipCompliance.usability ? 100 : 0,
      findability: complianceData.aaipCompliance.findability ? 100 : 0,
      selfAssessment: complianceData.aaipCompliance.selfAssessment ? 100 : 0,
      publicReporting: complianceData.aaipCompliance.publicReporting ? 100 : 0
    },
    { name: 'Protección de Datos',
      ley25326: complianceData.dataProtectionCompliance.ley25326 ? 100 : 0,
      arcoRights: complianceData.dataProtectionCompliance.arcoRights ? 100 : 0
    },
    { name: 'Monitoreo',
      dashboard: complianceData.monitoring.dashboardImplementation ? 100 : 0,
      continuousImprovement: complianceData.monitoring.continuousImprovement ? 100 : 0
    }
  ];

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-surface p-3 rounded-lg shadow-lg border border-gray-200 dark:border-dark-border">
          <p className="font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {payload[0].value} criterios
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-surface p-3 rounded-lg shadow-lg border border-gray-200 dark:border-dark-border">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
              <span>{entry.dataKey}: {entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-600" />
          Estado de Cumplimiento
        </h3>
        <div className="flex items-center">
          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            complianceData.overallCompliance.status === 'compliant' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : complianceData.overallCompliance.status === 'partially-compliant'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}>
            {complianceData.overallCompliance.status === 'compliant' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Cumplido
              </>
            ) : complianceData.overallCompliance.status === 'partially-compliant' ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-1" />
                Parcialmente cumplido
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                No cumplido
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overall Compliance Pie Chart */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 text-center">
            Cumplimiento General
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {complianceData.overallCompliance.score}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Puntaje de cumplimiento
            </p>
          </div>
        </div>

        {/* Detailed Compliance Bar Chart */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 text-center">
            Detalles por Categoría
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#6B7280" 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="compliance" name="Cumplimiento" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="accessibility" name="Accesibilidad" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="usability" name="Usabilidad" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="findability" name="Facilidad de búsqueda" fill="#EC4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey="selfAssessment" name="Autoevaluación" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="publicReporting" name="Informe público" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ley25326" name="Ley 25.326" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="arcoRights" name="Derechos ARCO" fill="#84CC16" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dashboard" name="Dashboard" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="continuousImprovement" name="Mejora continua" fill="#64748B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Resumen de Cumplimiento
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">AAIP</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
              {complianceData.aaipCompliance.overallCompliant ? '100%' : '0%'}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {complianceData.aaipCompliance.overallCompliant ? 'Cumplido' : 'No cumplido'}
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">Protección de Datos</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
              {complianceData.dataProtectionCompliance.overallCompliant ? '100%' : '0%'}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {complianceData.dataProtectionCompliance.overallCompliant ? 'Cumplido' : 'No cumplido'}
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Monitoreo</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-2">
              {complianceData.monitoring.overallCompliant ? '100%' : '0%'}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              {complianceData.monitoring.overallCompliant ? 'Cumplido' : 'No cumplido'}
            </p>
          </div>
        </div>
      </div>

      {/* AAIP Compliance Information */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h5 className="font-medium text-blue-800 dark:text-blue-200 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Cumplimiento AAIP
          </h5>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            Este panel de cumplimiento se adhiere a las directrices de la Agencia de Acceso a la Información Pública (AAIP) 
            y sigue la metodología del Índice de Transparencia Activa (ITA).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
              ITA Index Alignment
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
              Transparencia Activa
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
              Autoevaluación
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceChart;