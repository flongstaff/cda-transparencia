import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  DollarSign,
  Building,
  Search,
  Shield,
  Gavel,
  FileX,
  User,
  ChevronRight,
  Home,
  Database,
  PieChart,
  LineChart
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import key dashboard components
import BudgetExecutionDashboard from '../components/dashboard/BudgetExecutionDashboard';
import FinancialOverview from '../components/dashboard/FinancialOverview';
import RecentUpdatesList from '../components/dashboard/RecentUpdatesList';

// Import key charts
import IntegratedChart from '../components/charts/IntegratedChart';
import YearlyDataChart from '../components/charts/YearlyDataChart';

const UnifiedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState(2024);

  // Key metrics data
  const keyMetrics = [
    {
      id: 'budget',
      title: 'Presupuesto Ejecutado',
      value: '75%',
      change: '+2.3%',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'transparency',
      title: 'Índice de Transparencia',
      value: '85%',
      change: '+5.1%',
      icon: <Eye className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'documents',
      title: 'Documentos Verificados',
      value: '173',
      change: '+12',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'alerts',
      title: 'Alertas Activas',
      value: '3',
      change: '-2',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  // Navigation sections
  const navigationSections = [
    {
      title: 'Principal',
      items: [
        { path: '/', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
        { path: '/dashboard', label: 'Panel Principal', icon: <BarChart3 className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Análisis Financiero',
      items: [
        { path: '/budget', label: 'Presupuesto', icon: <DollarSign className="w-4 h-4" /> },
        { path: '/revenue', label: 'Recursos', icon: <TrendingUp className="w-4 h-4" /> },
        { path: '/spending', label: 'Gastos', icon: <TrendingUp className="w-4 h-4" /> },
        { path: '/debt', label: 'Deuda', icon: <TrendingUp className="w-4 h-4" /> },
        { path: '/investments', label: 'Inversiones', icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Transparencia',
      items: [
        { path: '/citizen-transparency', label: 'Portal Ciudadano', icon: <Eye className="w-4 h-4" /> },
        { path: '/transparency-portal', label: 'Anticorrupción', icon: <Shield className="w-4 h-4" /> },
        { path: '/contracts', label: 'Contratos', icon: <FileText className="w-4 h-4" /> },
        { path: '/salaries', label: 'Salarios', icon: <Users className="w-4 h-4" /> },
        { path: '/declarations', label: 'Declaraciones', icon: <Building className="w-4 h-4" /> },
        { path: '/documents', label: 'Documentos', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Herramientas',
      items: [
        { path: '/audit', label: 'Auditoría', icon: <Search className="w-4 h-4" /> },
        { path: '/reports', label: 'Reportes', icon: <BarChart3 className="w-4 h-4" /> },
        { path: '/whistleblower', label: 'Denuncias', icon: <AlertTriangle className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Portal de Transparencia</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-4 flex items-center md:ml-6">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {[2024, 2023, 2022, 2021, 2020, 2019].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {keyMetrics.map((metric) => (
                <div key={metric.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`rounded-md p-3 ${metric.bgColor}`}>
                        {metric.icon}
                      </div>
                      <div className="ml-4">
                        <dt className="text-sm font-medium text-gray-500 truncate">{metric.title}</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${metric.color}`}>
                            {metric.change}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Tabs */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5 inline mr-2" />
                    Vista General
                  </button>
                  <button
                    onClick={() => setActiveTab('budget')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'budget'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 inline mr-2" />
                    Presupuesto
                  </button>
                  <button
                    onClick={() => setActiveTab('transparency')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'transparency'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Eye className="w-5 h-5 inline mr-2" />
                    Transparencia
                  </button>
                </nav>
              </div>
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Financiero</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Ejecución Presupuestaria</h3>
                        <IntegratedChart 
                          type="budget"
                          data={[]}
                          onYearChange={() => {}}
                          selectedYear={selectedYear}
                        />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Ingresos vs Gastos</h3>
                        <IntegratedChart 
                          type="comprehensive"
                          data={[]}
                          onYearChange={() => {}}
                          selectedYear={selectedYear}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'budget' && (
                  <BudgetExecutionDashboard selectedYear={selectedYear} />
                )}
                {activeTab === 'transparency' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Índice de Transparencia</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Evolución de Transparencia</h3>
                        <YearlyDataChart 
                          data={[]}
                          selectedYear={selectedYear}
                          onYearChange={() => {}}
                        />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Documentos Verificados</h3>
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                          <p className="text-lg font-semibold">173 documentos</p>
                          <p className="text-sm text-gray-500">Verificados y disponibles</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Actualizaciones Recientes</h2>
              </div>
              <RecentUpdatesList />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Navegación</h2>
              </div>
              <div className="p-4">
                <nav className="space-y-1">
                  {navigationSections.map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">
                        {section.title}
                      </h3>
                      {section.items.map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          to={item.path}
                          className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          {item.icon}
                          <span className="ml-3">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Acceso Rápido</h2>
              </div>
              <div className="p-4 space-y-3">
                <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <span>Buscar Documentos</span>
                  <Search className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <span>Reporte Personalizado</span>
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <span>Denunciar Irregularidad</span>
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;