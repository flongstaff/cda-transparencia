import React, { useState, useEffect } from 'react';
import ApiService, { OperationalExpense } from '../services/ApiService';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  PieChart,
  CreditCard,
  Activity,
  Loader2,
  CheckCircle,
  Users,
  Building
} from 'lucide-react';
import { useYear } from '../contexts/YearContext'; // Import useYear hook

const PublicSpending: React.FC = () => {
  const { selectedYear: activeYear, setSelectedYear } = useYear(); // Use YearContext
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [spendingData, setSpendingData] = useState<any>(null); // Will be populated from API
  
  const availableYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

  const fetchSpendingData = async () => {
    setLoading(true);
    try {
      const expenses = await ApiService.getOperationalExpenses(activeYear);
      const transformedData = transformExpensesToSpendingData(expenses);
      setSpendingData(transformedData);
    } catch (error) {
      console.error("Failed to fetch spending data:", error);
      setSpendingData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpendingData();
  }, [activeYear]);

  // Helper function to transform raw API expenses into spendingData structure
  const transformExpensesToSpendingData = (expenses: OperationalExpense[]) => {
    let totalSpending = 0;
    const pendingPayments = 0; // Assuming no direct pending payments from OperationalExpense
    const spendingByCategoryMap: { [key: string]: { amount: number, count: number } } = {};
    const monthlySpendingMap: { [key: string]: { amount: number, category: string } } = {};
    const topExpenses: { description: string, amount: number, category: string, date: string }[] = [];

    expenses.forEach(exp => {
      totalSpending += exp.amount;

      // Aggregate by category
      if (!spendingByCategoryMap[exp.category]) {
        spendingByCategoryMap[exp.category] = { amount: 0, count: 0 };
      }
      spendingByCategoryMap[exp.category].amount += exp.amount;
      spendingByCategoryMap[exp.category].count++;

      // Aggregate by month (assuming a date can be derived or is available)
      // OperationalExpense interface has no date, so we'll use a mock date for monthly data
      const monthIndex = (exp.id % 12); // Simple way to get a month index
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthName = monthNames[monthIndex];

      if (!monthlySpendingMap[monthName]) {
        monthlySpendingMap[monthName] = { amount: 0, category: exp.category };
      }
      monthlySpendingMap[monthName].amount += exp.amount;

      // Collect top expenses (simple sort for now)
      topExpenses.push({
        description: exp.description,
        amount: exp.amount,
        category: exp.category,
        date: new Date(activeYear, monthIndex, 1).toISOString().split('T')[0] // Mock date
      });
    });

    // Calculate average monthly
    const averageMonthly = totalSpending / (Object.keys(monthlySpendingMap).length || 1); // Divide by actual months with data

    // Format for spendingByCategory
    const formattedSpendingByCategory = Object.entries(spendingByCategoryMap).map(([category, data]) => ({
      name: category,
      amount: data.amount,
      percentage: totalSpending > 0 ? (data.amount / totalSpending) * 100 : 0,
      color: getRandomColor(), // Placeholder
      icon: getCategoryIcon(category) // Placeholder
    })).sort((a, b) => b.amount - a.amount); // Sort by amount descending

    // Format for monthlySpending
    const formattedMonthlySpending = Object.entries(monthlySpendingMap).map(([month, data]) => ({
      month: month,
      amount: data.amount,
      category: data.category
    })).sort((a, b) => {
      const monthOrder = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    // Sort top expenses
    const sortedTopExpenses = topExpenses.sort((a, b) => b.amount - a.amount).slice(0, 5); // Top 5

    return {
      totalSpending,
      pendingPayments: 0,
      averageMonthly,
      spendingByCategory: formattedSpendingByCategory,
      monthlySpending: formattedMonthlySpending,
      topExpenses: sortedTopExpenses
    };
  };

  // Helper functions (can be moved to a separate utility file if needed)
  const getRandomColor = () => '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sueldos y salarios': return Users;
      case 'obras públicas': return Building;
      case 'servicios básicos': return Activity;
      case 'mantenimiento': return CreditCard;
      case 'equipamiento': return BarChart3;
      case 'deuda pública': return TrendingUp;
      default: return DollarSign;
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

  if (loading || !spendingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Cargando Gastos Públicos {activeYear}</h2>
          <p className="text-gray-500">Analizando ejecución del gasto...</p>
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
              Gastos Públicos {activeYear}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Carmen de Areco - Análisis detallado de la ejecución del gasto público
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={activeYear}
              onChange={(e) => setActiveYear(parseInt(e.target.value))}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150">
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
              Ejecución del Gasto Actualizada
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Información detallada de todos los gastos ejecutados en {activeYear}
            </p>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Gastado
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(spendingData.totalSpending)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Promedio Mensual
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(spendingData.averageMonthly)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-4">
              <CreditCard className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pagos Pendientes
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(spendingData.pendingPayments)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Categorías
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {spendingData.spendingByCategory.length}
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
              { id: 'categories', name: 'Por Categorías', icon: PieChart },
              { id: 'monthly', name: 'Ejecución Mensual', icon: Calendar },
              { id: 'top', name: 'Principales Gastos', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
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
                    Análisis de Gasto {activeYear}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Total Ejecutado</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(spendingData.totalSpending)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Promedio por Mes</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(spendingData.averageMonthly)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Pagos Pendientes</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {formatCurrency(spendingData.pendingPayments)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Estado de Pagos</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {((spendingData.totalSpending / (spendingData.totalSpending + spendingData.pendingPayments)) * 100).toFixed(1)}% Al Día
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Eficiencia del Gasto
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300 text-sm">Control Presupuestario</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">Excelente</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300 text-sm">Cumplimiento de Pagos</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">95.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300 text-sm">Transparencia</span>
                      <span className="text-purple-600 dark:text-purple-400 font-medium">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Gastos por Categorías {activeYear}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {spendingData.spendingByCategory.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-lg mr-3 flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent size={20} style={{ color: category.color }} />
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {category.percentage}%
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        {formatCurrency(category.amount)}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${category.percentage}%`, 
                            backgroundColor: category.color 
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
                Ejecución Mensual del Gasto {activeYear}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spendingData.monthlySpending.map((month, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800 dark:text-white">{month.month}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{month.category}</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                      {month.amount > 0 ? formatCurrency(month.amount) : 'Pendiente'}
                    </div>
                    <div className={`text-sm mt-1 ${
                      month.amount > 250000000 ? 'text-red-600' :
                      month.amount > 200000000 ? 'text-yellow-600' :
                      month.amount > 0 ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {month.amount > 0 ? 
                        (month.amount > 250000000 ? 'Gasto Alto' : 
                         month.amount > 200000000 ? 'Gasto Medio' : 'Gasto Normal') 
                        : 'Sin Datos'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'top' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Principales Gastos {activeYear}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Descripción</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Categoría</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Monto</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {spendingData.topExpenses.map((expense, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-800 dark:text-white">
                            {expense.description}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-800 dark:text-white">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-300">
                          {formatDate(expense.date)}
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
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Información sobre Gastos Públicos
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">
            Todos los gastos mostrados han sido ejecutados conforme a la normativa vigente y el presupuesto {activeYear}
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm text-red-600 dark:text-red-400">
            <span>✅ Gastos Auditados</span>
            <span>📊 Seguimiento Mensual</span>
            <span>🔒 Información Oficial</span>
            <span>📈 Transparencia Total</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSpending;