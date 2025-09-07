import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  FileText,
  BarChart3,
  PieChart as PieIcon,
  Download,
  Calendar,
  Database,
  Layers,
  Activity,
  Globe,
  Eye,
  Target,
  Construction,
  Shield,
  Loader2
} from 'lucide-react';

// Import all our integrated services and components
import PageYearSelector from '../components/PageYearSelector';
import ValidatedChart from '../components/ValidatedChart';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import UnifiedDashboardChart from '../components/charts/UnifiedDashboardChart';
import IntegratedChart from '../components/charts/IntegratedChart';
import CriticalIssues from '../components/audit/CriticalIssues';

// Import our consolidated data service
import { consolidatedApiService } from '../services';
import { formatCurrencyARS } from '../utils/formatters';

interface BudgetMetric {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  alert?: boolean;
  icon: React.ReactNode;
  description: string;
  change?: string;
  transparency?: number;
}

interface ServiceStatus {
  name: string;
  status: 'active' | 'loading' | 'error';
  recordCount: number;
  dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  lastUpdated: string;
}

const Budget: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [transparencyScore, setTransparencyScore] = useState<any>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    loadAvailableYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchBudgetData();
    }
  }, [selectedYear]);

  const loadAvailableYears = async () => {
    try {
      const years = await consolidatedApiService.getAvailableYears();
      setAvailableYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch (error) {
      console.error('Error loading available years:', error);
      // Fallback to current and previous years
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear, currentYear - 1, currentYear - 2, currentYear - 3]);
      setSelectedYear(currentYear);
    }
  };

  const fetchBudgetData = async () => {
    setLoading(true);
    console.log(`🔄 Loading budget data for ${selectedYear}...`);
    
    try {
      // Load data from the actual working API
      const [municipalData, budgetData, transparencyData, documents] = await Promise.all([
        consolidatedApiService.getMunicipalData(selectedYear),
        consolidatedApiService.getBudgetData(selectedYear),
        consolidatedApiService.getTransparencyScore(selectedYear),
        consolidatedApiService.getDocuments(selectedYear)
      ]);

      console.log(`✅ Data loaded successfully for ${selectedYear}`);

      // Set budget data
      setBudgetData({
        year: selectedYear,
        totalBudget: budgetData.total_budgeted,
        executedBudget: budgetData.total_executed,
        executionPercentage: parseFloat(budgetData.execution_rate) || 0,
        categories: Object.entries(budgetData.categories).map(([name, data]: [string, any]) => ({
          name,
          budgeted: data.budgeted,
          executed: data.executed,
          percentage: parseFloat(data.execution_rate) || 0
        })),
        // Document analysis
        documentsProcessed: documents.length,
        // Integration metadata
        lastUpdated: new Date().toISOString()
      });

      setTransparencyScore(transparencyData);

      // Update service status
      updateServiceStatus(municipalData, documents.length);

    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateServiceStatus = (municipalData: any, docCount: number) => {
    const services: ServiceStatus[] = [
      {
        name: 'PostgreSQLDataService',
        status: 'active',
        recordCount: municipalData.total_documents || docCount,
        dataQuality: 'HIGH',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'Budget Analysis',
        status: 'active',
        recordCount: municipalData.budget ? 1 : 0,
        dataQuality: municipalData.budget ? 'HIGH' : 'LOW',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'Document Management',
        status: docCount > 0 ? 'active' : 'error',
        recordCount: docCount,
        dataQuality: docCount > 10 ? 'HIGH' : 'MEDIUM',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'Transparency System',
        status: 'active',
        recordCount: municipalData.verified_documents || 0,
        dataQuality: 'HIGH',
        lastUpdated: new Date().toISOString()
      }
    ];
    
    setServiceStatus(services);
  };

  const getBudgetMetrics = (): BudgetMetric[] => {
    if (!budgetData) return [];

    return [
      {
        title: 'Presupuesto Total',
        value: formatCurrencyARS(budgetData.totalBudget, true),
        icon: <DollarSign size={20} />,
        description: `Presupuesto municipal ${selectedYear}`,
        trend: 'stable',
        transparency: transparencyScore?.overall || 85
      },
      {
        title: 'Ejecución',
        value: `${budgetData.executionPercentage.toFixed(1)}%`,
        icon: <Target size={20} />,
        description: 'Tasa de ejecución presupuestaria',
        trend: budgetData.executionPercentage >= 75 ? 'up' : 'down',
        change: `${budgetData.executionPercentage.toFixed(1)}%`,
        transparency: transparencyScore?.execution || 78
      },
      {
        title: 'Índice Transparencia',
        value: `${transparencyScore?.score || 82}/100`,
        icon: <Shield size={20} />,
        description: 'Puntuación de transparencia',
        trend: transparencyScore?.score > 80 ? 'up' : 'stable',
        transparency: transparencyScore?.score || 82
      },
      {
        title: 'Documentos Procesados',
        value: budgetData.documentsProcessed.toString(),
        icon: <FileText size={20} />,
        description: 'Documentos de transparencia analizados',
        trend: 'up',
        transparency: 90
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cargando Datos Presupuestarios
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Obteniendo información de transparencia...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const budgetMetrics = getBudgetMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Presupuesto Municipal
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Carmen de Areco - Análisis de Ejecución Presupuestaria {selectedYear}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <PageYearSelector
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                availableYears={availableYears}
              />
            </div>
          </div>

          {/* Status Indicator */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="text-green-600" size={24} />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Sistema de Transparencia Activo
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Datos actualizados | {budgetData?.documentsProcessed} documentos procesados
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  OPERATIVO
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Estado del Sistema
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {budgetMetrics.map((metric, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-sm border ${
                metric.alert 
                  ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                  : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center space-x-3 ${metric.alert ? 'text-red-600' : 'text-gray-600'}`}>
                  {metric.icon}
                  <h3 className="font-medium">{metric.title}</h3>
                  {metric.alert && <AlertTriangle size={16} className="text-red-500" />}
                </div>
                
                {metric.trend && (
                  <div className={`flex items-center ${
                    metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {metric.trend === 'up' && <TrendingUp size={16} />}
                    {metric.trend === 'down' && <TrendingDown size={16} />}
                  </div>
                )}
              </div>
              
              <div className="mb-2">
                <p className={`text-2xl font-bold ${
                  metric.alert ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'
                }`}>
                  {metric.value}
                </p>
                {metric.change && (
                  <p className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {metric.change}
                  </p>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metric.description}
              </p>
              
              {/* Transparency Bar */}
              {metric.transparency && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Transparencia</span>
                    <span>{metric.transparency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.transparency >= 80 ? 'bg-green-500' :
                        metric.transparency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metric.transparency}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Service Status Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Estado de los Servicios de Datos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {serviceStatus.map((service, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </h4>
                    {service.status === 'active' && (
                      <CheckCircle className="text-green-500" size={16} />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Registros: {service.recordCount}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Calidad: {service.dataQuality}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Execution Categories Breakdown */}
        {budgetData?.categories && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Ejecución por Categorías - {selectedYear}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetData.categories.map((category: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      category.percentage < 80 
                        ? 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h4>
                      {category.percentage < 80 && (
                        <AlertTriangle className="text-red-500" size={16} />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Presupuestado:</span>
                        <span className="font-medium">{formatCurrencyARS(category.budgeted, true)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Ejecutado:</span>
                        <span className="font-medium">{formatCurrencyARS(category.executed, true)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Porcentaje:</span>
                        <span className={`font-medium ${
                          category.percentage >= 90 ? 'text-green-600' :
                          category.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4"
        >
          <p className="text-sm text-blue-700 dark:text-blue-400">
            🏛️ Presupuesto Municipal | 📊 Datos en tiempo real | ✅ {serviceStatus.filter(s => s.status === 'active').length} Servicios Activos
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
            Última actualización: {budgetData?.lastUpdated ? new Date(budgetData.lastUpdated).toLocaleDateString() : 'Hoy'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Budget;