import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  FileText, 
  TrendingUp, 
  DollarSign,
  Users,
  Building,
  Search,
  Database,
  Activity,
  Calendar,
  Target,
  Globe,
  Scale
} from 'lucide-react';

// Define types for our dashboard data
interface Project {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress: number;
  budget: number;
  spent: number;
}

interface DashboardStats {
  total_projects: number;
  completed_projects: number;
  in_progress_projects: number;
  pending_projects: number;
  total_budget: number;
  total_spent: number;
  budget_utilization_rate: number;
}

interface BudgetDistribution {
  category: string;
  amount: number;
}

interface DashboardData {
  projects: Project[];
  stats: DashboardStats;
  budget_distribution: BudgetDistribution[];
}

const DashboardVisualization: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard data from our backend API
        const response = await fetch('http://localhost:5000/api/dashboard');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    // Fetch data when component mounts
    fetchDashboardData();
    
    // Set up polling to refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error al cargar datos del dashboard</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
          <h3 className="text-lg font-medium text-yellow-800">No hay datos disponibles</h3>
        </div>
        <p className="mt-2 text-yellow-700">No se pudieron cargar los datos del dashboard</p>
      </div>
    );
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return value.toFixed(1) + '%';
  };

  const statusColor = (status: string): string => {
    switch(status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  // Process chart data
  const processedBudgetData = dashboardData.budget_distribution.map(item => ({
    name: item.category,
    amount: item.amount
  }));

  const projectStatusData = [
    { name: 'Completados', value: dashboardData.stats.completed_projects },
    { name: 'En Progreso', value: dashboardData.stats.in_progress_projects },
    { name: 'Pendientes', value: dashboardData.stats.pending_projects }
  ];

  const projectProgressData = dashboardData.projects.map(project => ({
    name: project.name,
    progress: project.progress,
    budget: project.budget
  }));

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📊 Panel de Visualización de Datos</h1>
        <p className="text-blue-100">
          Dashboard integral con visualizaciones de todos los datos disponibles desde la API
        </p>
        <div className="flex flex-wrap items-center mt-4 space-x-6 text-sm">
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Última actualización: {new Date().toLocaleString('es-AR')}
          </div>
          <div className="flex items-center text-green-400">
            <Database className="h-5 w-5 mr-2" />
            Estado: Conectado a API
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Proyectos Totales</h3>
            <Building className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {dashboardData.stats.total_projects}
          </div>
          <div className="text-sm text-gray-600">
            Proyectos activos
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Completados</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {dashboardData.stats.completed_projects}
          </div>
          <div className="text-sm text-gray-600">
            {formatPercentage((dashboardData.stats.completed_projects / dashboardData.stats.total_projects) * 100)} de proyectos
          </div>
        </div>

        {/* In Progress Projects */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">En Progreso</h3>
            <Users className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {dashboardData.stats.in_progress_projects}
          </div>
          <div className="text-sm text-gray-600">
            Proyectos activos
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Utilización Presupuestaria</h3>
            <DollarSign className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatPercentage(dashboardData.stats.budget_utilization_rate)}
          </div>
          <div className="text-sm text-gray-600">
            {formatCurrency(dashboardData.stats.total_spent)} de {formatCurrency(dashboardData.stats.total_budget)}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Budget Distribution Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Distribución Presupuestaria</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedBudgetData}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value) => [`${formatCurrency(Number(value))}`, '']}
                  labelFormatter={(name) => `Categoría: ${name}`}
                />
                <Legend />
                <Bar dataKey="amount" fill="#3B82F6" name="Monto Presupuestado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Project Status */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#10B981", "#F59E0B", "#EF4444"][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} proyectos`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Progress */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Progreso de Proyectos</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={projectProgressData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, '']}
                    labelFormatter={(name) => `Proyecto: ${name}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Progreso"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Lista de Proyectos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presupuesto ($)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gastos ($)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {project.status === 'completed' ? 'Completado' : project.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span>{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(project.budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(project.spent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Enlaces de API</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Datos de Proyectos', url: '/api/projects' },
              { name: 'Dashboard API', url: '/api/dashboard' },
              { name: 'Proyecto específico', url: '/api/projects/1' }
            ].map((link, index) => {
              return (
                <a
                  key={index}
                  href={`http://localhost:5000${link.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 transition-colors"
                >
                  <Database className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">{link.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardVisualization;
