/**
 * DASHBOARD DIRECTORY
 *
 * Central hub for accessing all specialized dashboards and analytics tools
 * in the Carmen de Areco Transparency Portal
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  BarChart3,
  DollarSign,
  FileText,
  Shield,
  Database,
  TrendingUp,
  Calendar,
  Download,
  CheckCircle,
  AlertTriangle,
  Users,
  Building,
  ChevronDown,
  ChevronUp,
  Activity,
  Loader2,
  CreditCard,
  Archive,
  Search,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useMasterData } from '../hooks/useMasterData';
import YearSelector from '../components/navigation/YearSelector';

// Dashboard categories configuration
const DASHBOARD_CATEGORIES = [
  {
    id: 'main',
    title: 'Dashboards Principales',
    description: 'Acceso a los dashboards más utilizados y completos',
    color: 'blue',
    dashboards: [
      {
        id: 'completo',
        title: 'Dashboard Completo',
        description: 'Vista integral con todos los datos financieros y documentos organizados',
        path: '/completo',
        icon: Eye,
        featured: true,
        stats: 'Todos los datos unificados',
        color: 'bg-blue-500'
      },
      {
        id: 'master',
        title: 'Dashboard Maestro',
        description: 'Vista general del sistema de transparencia con accesos rápidos',
        path: '/finances',
        icon: BarChart3,
        stats: 'Vista general',
        color: 'bg-indigo-500'
      }
    ]
  },
  {
    id: 'financial',
    title: 'Análisis Financiero',
    description: 'Dashboards especializados en datos financieros y presupuestarios',
    color: 'green',
    dashboards: [
      {
        id: 'budget',
        title: 'Presupuesto Municipal',
        description: 'Análisis detallado del presupuesto municipal y su ejecución',
        path: '/budget',
        icon: CreditCard,
        stats: 'Presupuesto 2024',
        color: 'bg-green-500'
      },
      {
        id: 'treasury',
        title: 'Tesorería',
        description: 'Estados financieros y movimientos de tesorería municipal',
        path: '/treasury',
        icon: DollarSign,
        stats: 'Flujo de caja',
        color: 'bg-emerald-500'
      },
      {
        id: 'expenses',
        title: 'Ejecución de Gastos',
        description: 'Seguimiento detallado de la ejecución de gastos municipales',
        path: '/expenses',
        icon: TrendingUp,
        stats: 'Gastos ejecutados',
        color: 'bg-green-600'
      },
      {
        id: 'debt',
        title: 'Deuda Pública',
        description: 'Análisis de la deuda municipal y perfil de vencimientos',
        path: '/debt',
        icon: AlertTriangle,
        stats: 'Stock de deuda',
        color: 'bg-orange-500'
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operaciones y Gestión',
    description: 'Dashboards para contratos, recursos humanos y operaciones',
    color: 'purple',
    dashboards: [
      {
        id: 'contracts',
        title: 'Contratos y Licitaciones',
        description: 'Seguimiento de contratos públicos y procesos de licitación',
        path: '/contracts',
        icon: Building,
        stats: 'Contratos activos',
        color: 'bg-purple-500'
      },
      {
        id: 'salaries',
        title: 'Sueldos y Salarios',
        description: 'Información sobre la estructura salarial del personal municipal',
        path: '/salaries',
        icon: Users,
        stats: 'Personal municipal',
        color: 'bg-violet-500'
      }
    ]
  },
  {
    id: 'transparency',
    title: 'Transparencia y Control',
    description: 'Herramientas de auditoría, documentos y verificación',
    color: 'indigo',
    dashboards: [
      {
        id: 'audits',
        title: 'Auditorías',
        description: 'Informes de auditoría interna y externa del municipio',
        path: '/audits',
        icon: Shield,
        stats: 'Informes de auditoría',
        color: 'bg-indigo-500'
      },
      {
        id: 'documents',
        title: 'Biblioteca de Documentos',
        description: 'Acceso a todos los documentos públicos organizados',
        path: '/documents',
        icon: Archive,
        stats: '171 documentos',
        color: 'bg-blue-600'
      },
      {
        id: 'verification',
        title: 'Verificación de Datos',
        description: 'Herramientas para verificar la consistencia de los datos',
        path: '/data-verification',
        icon: Search,
        stats: 'Validación automática',
        color: 'bg-cyan-500'
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Análisis y Visualización',
    description: 'Herramientas avanzadas de análisis y visualización de datos',
    color: 'pink',
    dashboards: [
      {
        id: 'all-charts',
        title: 'Todas las Visualizaciones',
        description: 'Galería completa con todas las 13 visualizaciones disponibles',
        path: '/all-charts',
        icon: PieChart,
        stats: '13 gráficos',
        color: 'bg-pink-500'
      },
      {
        id: 'database',
        title: 'Base de Datos',
        description: 'Explorador de la base de datos con filtros por año',
        path: '/database',
        icon: Database,
        stats: 'Datos históricos',
        color: 'bg-rose-500'
      }
    ]
  }
];

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Centro de Dashboards
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Acceso organizado a todos los dashboards y herramientas de análisis
              del Portal de Transparencia de Carmen de Areco
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Access to Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <Link to="/completo">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center">
                    <Zap className="h-8 w-8 mr-3" />
                    Dashboard Completo
                  </h2>
                  <p className="text-blue-100 text-lg mb-4">
                    Acceso rápido al dashboard integral con todos los datos unificados
                  </p>
                  <div className="flex items-center text-blue-200">
                    <Eye className="h-5 w-5 mr-2" />
                    <span>Vista completa • Datos en tiempo real • Análisis integrado</span>
                  </div>
                </div>
                <ArrowRight className="h-8 w-8 opacity-80" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Dashboard Categories */}
        <div className="space-y-12">
          {DASHBOARD_CATEGORIES.map((category, categoryIndex) => (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + categoryIndex * 0.1, duration: 0.6 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {category.title}
                </h2>
                <p className="text-gray-600">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.dashboards.map((dashboard, dashboardIndex) => {
                  const IconComponent = dashboard.icon;

                  return (
                    <motion.div
                      key={dashboard.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.4 + categoryIndex * 0.1 + dashboardIndex * 0.05,
                        duration: 0.5
                      }}
                    >
                      <Link to={dashboard.path}>
                        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 h-full ${
                          dashboard.featured ? 'ring-2 ring-blue-500' : ''
                        }`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${dashboard.color} bg-opacity-10`}>
                              <IconComponent className={`h-6 w-6 text-white`} style={{color: dashboard.color.replace('bg-', '#').replace('-500', '')} as any} />
                            </div>
                            {dashboard.featured && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                                Destacado
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {dashboard.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {dashboard.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {dashboard.stats}
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Recursos Adicionales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Documentación</h3>
              <p className="text-sm text-gray-600 mb-3">
                Guías y manuales para usar los dashboards
              </p>
              <Link
                to="/about"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver Documentación →
              </Link>
            </div>

            <div className="text-center">
              <Activity className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Estado del Sistema</h3>
              <p className="text-sm text-gray-600 mb-3">
                Monitoreo en tiempo real del sistema
              </p>
              <div className="flex items-center justify-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Sistema Activo</span>
              </div>
            </div>

            <div className="text-center">
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Soporte Ciudadano</h3>
              <p className="text-sm text-gray-600 mb-3">
                Canal seguro para reportes y consultas
              </p>
              <Link
                to="/contact"
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Contactar →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;