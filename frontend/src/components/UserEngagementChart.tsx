/**
 * UserEngagementChart Component
 * Displays user engagement and interaction metrics
 * Following AAIP guidelines for transparency and data protection
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Users, Activity, Search, Download, Eye, TrendingUp, TrendingDown, Minus, PieChart as PieChartIcon } from 'lucide-react';
import { monitoringService } from '../services/monitoringService';

interface UserEngagementChartProps {
  period?: string; // '1d' | '7d' | '30d' | '90d'
}

const UserEngagementChart: React.FC<UserEngagementChartProps> = ({ period = '30d' }) => {
  const [engagementData, setEngagementData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'pageViews' | 'searches' | 'downloads'>('overview');

  useEffect(() => {
    const loadEngagementData = async () => {
      try {
        setLoading(true);
        const data = await monitoringService.getAnalyticsSummary(period);
        setEngagementData(data);
      } catch (err) {
        console.error('Error loading engagement data:', err);
        setError('Error al cargar datos de participación ciudadana');
      } finally {
        setLoading(false);
      }
    };

    loadEngagementData();
  }, [period]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-700 dark:text-gray-300">Cargando métricas de participación...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!engagementData) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Sin datos de participación disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No hay métricas de participación ciudadana para el período seleccionado
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const chartData = [
    { name: 'Lun', pageViews: 120, searches: 45, downloads: 12, engagement: 65 },
    { name: 'Mar', pageViews: 190, searches: 65, downloads: 18, engagement: 78 },
    { name: 'Mié', pageViews: 150, searches: 55, downloads: 15, engagement: 72 },
    { name: 'Jue', pageViews: 220, searches: 80, downloads: 25, engagement: 85 },
    { name: 'Vie', pageViews: 180, searches: 70, downloads: 20, engagement: 79 },
    { name: 'Sáb', pageViews: 90, searches: 30, downloads: 8, engagement: 45 },
    { name: 'Dom', pageViews: 110, searches: 40, downloads: 10, engagement: 55 }
  ];

  // Prepare device stats for pie chart
  const deviceStats = [
    { name: 'Escritorio', value: 65, color: '#3B82F6' },
    { name: 'Celular', value: 35, color: '#10B981' },
    { name: 'Tableta', value: 10, color: '#F59E0B' }
  ];

  // Get trend indicators
  const pageViewsTrend = engagementData.pageViews.growthRate || 0;
  const searchesTrend = engagementData.searches.growthRate || 0;
  const downloadsTrend = engagementData.documentDownloads.growthRate || 0;

  const getTrendIcon = (rate: number) => {
    if (rate > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (rate < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Participación Ciudadana
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Métricas de uso y engagement del portal
              </p>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="flex bg-gray-100 dark:bg-dark-surface-alt rounded-lg p-1">
            {['1d', '7d', '30d', '90d'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => window.location.reload()} // In a real app, you'd update the data
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeframe === period
                    ? 'bg-white dark:bg-dark-surface text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {timeframe === '1d' ? 'Hoy' : timeframe === '7d' ? '7D' : timeframe === '30d' ? '30D' : '90D'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-border">
        <nav className="flex px-6">
          {[
            { id: 'overview', name: 'Vista General', icon: PieChartIcon },
            { id: 'pageViews', name: 'Vistas', icon: Eye },
            { id: 'searches', name: 'Búsquedas', icon: Search },
            { id: 'downloads', name: 'Descargas', icon: Download }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium flex items-center border-b-2 -mb-px transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Page Views */}
              <div className="bg-gray-50 dark:bg-dark-surface-alt p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vistas de página</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {engagementData.pageViews.totalViews?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {getTrendIcon(pageViewsTrend)}
                  <span className={`text-sm ml-1 ${
                    pageViewsTrend > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : pageViewsTrend < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {pageViewsTrend > 0 ? '+' : ''}{pageViewsTrend}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {period === '7d' ? 'vs semana anterior' : period === '30d' ? 'vs mes anterior' : 'vs período anterior'}
                  </span>
                </div>
              </div>

              {/* Searches */}
              <div className="bg-gray-50 dark:bg-dark-surface-alt p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Búsquedas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {engagementData.searches.totalSearches?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {getTrendIcon(searchesTrend)}
                  <span className={`text-sm ml-1 ${
                    searchesTrend > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : searchesTrend < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {searchesTrend > 0 ? '+' : ''}{searchesTrend}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {period === '7d' ? 'vs semana anterior' : period === '30d' ? 'vs mes anterior' : 'vs período anterior'}
                  </span>
                </div>
              </div>

              {/* Downloads */}
              <div className="bg-gray-50 dark:bg-dark-surface-alt p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Descargas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {engagementData.documentDownloads.totalDownloads?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {getTrendIcon(downloadsTrend)}
                  <span className={`text-sm ml-1 ${
                    downloadsTrend > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : downloadsTrend < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {downloadsTrend > 0 ? '+' : ''}{downloadsTrend}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {period === '7d' ? 'vs semana anterior' : period === '30d' ? 'vs mes anterior' : 'vs período anterior'}
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Page Views Over Time */}
              <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-blue-600" />
                  Vistas de página (últimos 7 días)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          borderColor: '#E5E7EB',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        formatter={(value, name) => [value.toLocaleString(), 'Vistas']}
                      />
                      <Area
                        type="monotone"
                        dataKey="pageViews"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#colorPageViews)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Device Distribution */}
              <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-purple-600" />
                  Distribución por dispositivo
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Porcentaje']}
                        contentStyle={{
                          backgroundColor: 'white',
                          borderColor: '#E5E7EB',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Eye className="h-4 w-4 mr-2 text-green-600" />
                Páginas más vistas
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Página
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vistas
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        % del total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                    {engagementData.topPages.slice(0, 5).map((page: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-surface-alt">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {page.page}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {page.views?.toLocaleString() || '0'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                          {engagementData.pageViews.totalViews ? 
                            `${((page.views || 0) / engagementData.pageViews.totalViews * 100).toFixed(1)}%` : 
                            '0%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Page Views Tab */}
        {selectedTab === 'pageViews' && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    borderColor: '#E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  formatter={(value) => [value.toLocaleString(), 'Vistas']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pageViews" 
                  name="Vistas de página"
                  stroke="#3B82F6" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Searches Tab */}
        {selectedTab === 'searches' && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    borderColor: '#E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  formatter={(value) => [value.toLocaleString(), 'Búsquedas']}
                />
                <Legend />
                <Bar 
                  dataKey="searches" 
                  name="Búsquedas"
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Downloads Tab */}
        {selectedTab === 'downloads' && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    borderColor: '#E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  formatter={(value) => [value.toLocaleString(), 'Descargas']}
                />
                <Area
                  type="monotone"
                  dataKey="downloads"
                  name="Descargas"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorDownloads)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-dark-surface-alt border-t border-gray-200 dark:border-dark-border text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <Activity className="h-4 w-4 mr-2 text-blue-600" />
          <span>Actualizado: {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

export default UserEngagementChart;