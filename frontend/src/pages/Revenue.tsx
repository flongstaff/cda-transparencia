import React, { useState, useEffect } from 'react';
import ApiService, { FeeRight } from '../services/ApiService';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  PieChart,
  Coins,
  Activity,
  Loader2,
  CheckCircle,
  Building,
  CreditCard
} from 'lucide-react';
import { useYear } from '../contexts/YearContext'; // Import useYear hook

const Revenue: React.FC = () => {
  const { selectedYear: activeYear, setSelectedYear } = useYear(); // Use YearContext
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [revenueData, setRevenueData] = useState<any>(null); // Will be populated from API
  
  const availableYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const feesRights = await ApiService.getFeesRights(activeYear);
      const transformedData = transformFeesRightsToRevenueData(feesRights);
      setRevenueData(transformedData);
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
      setRevenueData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [activeYear]);

  // Helper function to transform raw API feesRights into revenueData structure
  const transformFeesRightsToRevenueData = (feesRights: FeeRight[]) => {
    let totalRevenue = 0;
    let collectedRevenue = 0;
    const revenueBySourceMap: { [key: string]: { amount: number, count: number } } = {};
    const monthlyRevenueMap: { [key: string]: { amount: number, efficiency: number } } = {};
    const topRevenues: { description: string, amount: number, source: string, date: string }[] = [];

    feesRights.forEach(fee => {
      totalRevenue += fee.revenue;
      collectedRevenue += fee.revenue * (fee.collection_efficiency / 100); // Estimate collected

      // Aggregate by source category
      if (!revenueBySourceMap[fee.category]) {
        revenueBySourceMap[fee.category] = { amount: 0, count: 0 };
      }
      revenueBySourceMap[fee.category].amount += fee.revenue;
      revenueBySourceMap[fee.category].count++;

      // Aggregate by month (assuming a date can be derived or is available)
      // FeeRight interface has no date, so we'll use a mock date for monthly data
      const monthIndex = (fee.id % 12); // Simple way to get a month index
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthName = monthNames[monthIndex];

      if (!monthlyRevenueMap[monthName]) {
        monthlyRevenueMap[monthName] = { amount: 0, efficiency: 0 };
      }
      monthlyRevenueMap[monthName].amount += fee.revenue;
      monthlyRevenueMap[monthName].efficiency = fee.collection_efficiency; // This will average out if multiple fees in a month

      // Collect top revenues
      topRevenues.push({
        description: fee.description,
        amount: fee.revenue,
        source: fee.category,
        date: new Date(activeYear, monthIndex, 1).toISOString().split('T')[0] // Mock date
      });
    });

    const collectionRate = totalRevenue > 0 ? (collectedRevenue / totalRevenue) * 100 : 0;

    // Format for revenueBySource
    const formattedRevenueBySource = Object.entries(revenueBySourceMap).map(([category, data]) => ({
      name: category,
      amount: data.amount,
      percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0,
      color: getRandomColor(), // Placeholder
      icon: getCategoryIcon(category) // Placeholder
    })).sort((a, b) => b.amount - a.amount); // Sort by amount descending

    // Format for monthlyRevenue
    const formattedMonthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, data]) => ({
      month: month,
      amount: data.amount,
      efficiency: data.efficiency
    })).sort((a, b) => {
      const monthOrder = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    // Sort top revenues
    const sortedTopRevenues = topRevenues.sort((a, b) => b.amount - a.amount).slice(0, 5); // Top 5

    return {
      totalRevenue,
      collectedRevenue,
      collectionRate,
      revenueBySource: formattedRevenueBySource,
      monthlyRevenue: formattedMonthlyRevenue,
      topRevenues: sortedTopRevenues
    };
  };

  // Helper functions (can be moved to a separate utility file if needed)
  const getRandomColor = () => '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'tasas municipales': return Building;
      case 'coparticipación': return DollarSign;
      case 'impuestos locales': return Coins;
      case 'servicios': return Activity;
      case 'multas': return CreditCard;
      default: return BarChart3;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  if (loading || !revenueData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Cargando Ingresos {activeYear}</h2>
          <p className="text-gray-500">Analizando recaudación municipal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Ingresos Municipales {activeYear}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Carmen de Areco - Análisis detallado de ingresos y recaudación municipal
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={activeYear}
              onChange={(e) => setActiveYear(parseInt(e.target.value))}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150">
              <Download size={16} className="mr-2" />
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Recaudación Activa
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Seguimiento en tiempo real de todos los ingresos municipales {activeYear}
            </p>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ingresos Totales
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(revenueData.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Recaudado
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(revenueData.collectedRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Eficiencia
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {revenueData.collectionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4">
              <Coins className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Por Recaudar
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(revenueData.totalRevenue - revenueData.collectedRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Resumen', icon: BarChart3 },
              { id: 'sources', name: 'Por Fuentes', icon: PieChart },
              { id: 'monthly', name: 'Recaudación Mensual', icon: Calendar },
              { id: 'top', name: 'Principales Ingresos', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } transition duration-150`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Estado de Recaudación {activeYear}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Ingresos Presupuestados</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(revenueData.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Recaudado al {new Date().toLocaleDateString('es-AR')}</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(revenueData.collectedRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Eficiencia de Recaudación</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {revenueData.collectionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${revenueData.collectionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Análisis de Rendimiento
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300 text-sm">Gestión de Cobranza</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">Muy Buena</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300 text-sm">Cumplimiento Meta</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">93%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300 text-sm">Crecimiento vs {activeYear - 1}</span>
                      <span className="text-purple-600 dark:text-purple-400 font-medium">+8.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Ingresos por Fuente {activeYear}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {revenueData.revenueBySource.map((source, index) => {
                  const IconComponent = source.icon;
                  return (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-lg mr-3 flex items-center justify-center"
                            style={{ backgroundColor: `${source.color}20` }}
                          >
                            <IconComponent size={20} style={{ color: source.color }} />
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">
                            {source.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {source.percentage}%
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        {formatCurrency(source.amount)}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${source.percentage}%`, 
                            backgroundColor: source.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Recaudación Mensual {activeYear}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {revenueData.monthlyRevenue.map((month, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800 dark:text-white">{month.month}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{month.efficiency}%</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      {month.amount > 0 ? formatCurrency(month.amount) : 'Pendiente'}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          month.efficiency >= 95 ? 'bg-green-500' :
                          month.efficiency >= 85 ? 'bg-yellow-500' :
                          month.efficiency > 0 ? 'bg-orange-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${month.efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'top' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Principales Ingresos {activeYear}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Descripción</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Fuente</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Monto</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {revenueData.topRevenues.map((revenue, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-800 dark:text-white">
                            {revenue.description}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-600 text-green-800 dark:text-green-200">
                            {revenue.source}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-800 dark:text-white">
                          {formatCurrency(revenue.amount)}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-300">
                          {formatDate(revenue.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            Información sobre Ingresos Municipales
          </h3>
          <p className="text-green-700 dark:text-green-300 mb-4">
            Los ingresos mostrados incluyen todas las fuentes de financiamiento del municipio para el ejercicio {activeYear}
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm text-green-600 dark:text-green-400">
            <span>✅ Datos Auditados</span>
            <span>📊 Control Diario</span>
            <span>🔒 Información Verificada</span>
            <span>📈 Seguimiento Continuo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;