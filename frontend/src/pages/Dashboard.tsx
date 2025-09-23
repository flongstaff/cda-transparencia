/**
 * Dashboard Page Component
 * Main dashboard showing key financial and transparency indicators
 */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign,
  TrendingUp,
  Users,
  Building,
  FileText,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Download,
  ExternalLink,
  BarChart3,
  PieChart,
  LineChart,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for dashboard
const mockDashboardData = {
  financialOverview: {
    totalBudget: 125000000,
    totalExecuted: 98500000,
    executionRate: 78.8,
    totalRevenue: 85000000,
    totalDebt: 25000000,
    transparencyScore: 85
  },
  recentDocuments: [
    {
      id: 'doc-001',
      title: 'Presupuesto Municipal 2024',
      category: 'Presupuesto',
      date: '2024-01-15',
      type: 'pdf',
      size: '2.4 MB'
    },
    {
      id: 'doc-002',
      title: 'Informe de Ejecución de Gastos - 4to Trimestre',
      category: 'Finanzas',
      date: '2024-12-31',
      type: 'pdf',
      size: '1.8 MB'
    },
    {
      id: 'doc-003',
      title: 'Licitaciones Públicas 2025',
      category: 'Contratos',
      date: '2025-01-10',
      type: 'pdf',
      size: '3.2 MB'
    },
    {
      id: 'doc-004',
      title: 'Declaraciones Juradas 2024',
      category: 'Funcionarios',
      date: '2024-02-28',
      type: 'pdf',
      size: '4.1 MB'
    }
  ],
  keyMetrics: [
    {
      title: 'Presupuesto Ejecutado',
      value: '78.8%',
      change: '+2.3%',
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      title: 'Transparencia',
      value: '85%',
      change: '+5%',
      icon: <Shield className="w-5 h-5 text-blue-500" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'doc-005',
      title: 'Sueldos de Empleados',
      category: 'Recursos Humanos',
      date: '2024-03-15',
      type: 'xlsx',
      size: '1.2 MB'
    },
    {
      id: 'doc-006',
      title: 'Estado de Tesorería - Marzo 2024',
      category: 'Tesorería',
      date: '2024-03-31',
      type: 'pdf',
      size: '0.8 MB'
    }
  ],
  alerts: [
    {
      id: 'alert-001',
      title: 'Nuevo documento disponible',
      message: 'Presupuesto Municipal 2024 ha sido publicado',
      type: 'info',
      date: '2024-01-15'
    },
    {
      id: 'alert-002',
      title: 'Actualización de datos',
      message: 'Informe de Ejecución de Gastos - 4to Trimestre actualizado',
      type: 'success',
      date: '2024-12-31'
    }
  ]
};

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<typeof mockDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch from the API
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDashboardData(mockDashboardData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resumen General</h1>
        <p className="text-gray-600">
          Indicadores clave de transparencia y finanzas municipales
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Presupuesto Total</h3>
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(dashboardData.financialOverview.totalBudget)}
          </p>
          <p className="text-sm text-gray-500">
            Ejercicio 2024
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ejecutado</h3>
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(dashboardData.financialOverview.totalExecuted)}
          </p>
          <div className="flex items-center">
            <span className="text-sm font-medium text-green-600">
              {dashboardData.financialOverview.executionRate.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">
              del presupuesto
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Índice de Transparencia</h3>
            <Shield className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {dashboardData.financialOverview.transparencyScore}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${dashboardData.financialOverview.transparencyScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ejecución Presupuestaria</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Gráfico de barras</p>
              <p className="text-sm text-gray-400 mt-1">Ingresos vs Gastos</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Distribución de Gastos</h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Gráfico circular</p>
              <p className="text-sm text-gray-400 mt-1">Por categorías</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Documents */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Documentos Recientes</h3>
              <Link 
                to="/documents" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todos
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.recentDocuments.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4 mt-1">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {doc.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {doc.category} • {doc.date} • {doc.size}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link 
                      to={`/documents/${doc.id}`} 
                      className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Ver documento"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link 
                      to={`/documents/${doc.id}`} 
                      className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Descargar documento"
                    >
                      <Download className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-6 ${getAlertClass(alert.type)} border-l-4 border-current`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <p className="text-xs mt-2 opacity-75">{alert.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas Clave</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.keyMetrics.map((metric, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-4 ${metric.color} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{metric.title}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
                <div className="p-2 bg-white bg-opacity-50 rounded-lg">
                  {metric.icon}
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{metric.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;