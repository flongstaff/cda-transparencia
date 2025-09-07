/**
 * Unified Dashboard Chart - Showcases all integrated services working together
 */
import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  Activity, 
  Database, 
  Layers,
  Zap,
  Globe,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { consolidatedApiService } from '../../services/ConsolidatedApiService';
import { formatCurrencyARS } from '../../utils/formatters';

interface Props {
  year: number;
  showAllSources?: boolean;
}

interface ServiceStatus {
  name: string;
  status: 'active' | 'error' | 'loading';
  recordCount: number;
  lastUpdated: string;
  icon: React.ReactNode;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const UnifiedDashboardChart: React.FC<Props> = ({ year, showAllSources = true }) => {
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [investmentData, setInvestmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);
  const [overallMetadata, setOverallMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, [year]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    const services: ServiceStatus[] = [
      { name: 'UnifiedDataService', status: 'loading', recordCount: 0, lastUpdated: '', icon: <Database size={16} /> },
      { name: 'ComprehensiveDataService', status: 'loading', recordCount: 0, lastUpdated: '', icon: <Layers size={16} /> },
      { name: 'PowerBI Integration', status: 'loading', recordCount: 0, lastUpdated: '', icon: <BarChart3 size={16} /> },
      { name: 'Document Analysis', status: 'loading', recordCount: 0, lastUpdated: '', icon: <FileText size={16} /> },
      { name: 'Backend Services', status: 'loading', recordCount: 0, lastUpdated: '', icon: <Globe size={16} /> }
    ];

    setServiceStatus([...services]);

    try {
      console.log(`🔄 Loading unified dashboard data for year ${year}...`);
      
      // Load all data types in parallel using the integration service
      const [budgetResponse, revenueResponse, expenseResponse, investmentResponse] = await Promise.all([
        consolidatedApiService.getBudgetData(year),
        consolidatedApiService.getFinancialReports(), // Placeholder for revenue data
        consolidatedApiService.getTreasuryMovements(), // Placeholder for expense data
        consolidatedApiService.getFinancialReports() // Placeholder for investment data
      ]);

      console.log(`✅ All data loaded successfully for year ${year}`);

      // Process and set data
      setBudgetData(budgetResponse.data || []);
      setRevenueData(revenueResponse.data || []);
      setExpenseData(expenseResponse.data || []);
      setInvestmentData(investmentResponse.data || []);

      // Combine metadata
      const combinedMetadata = {
        totalRecords: (budgetResponse.metadata.totalRecords || 0) + 
                     (revenueResponse.metadata.totalRecords || 0) + 
                     (expenseResponse.metadata.totalRecords || 0) + 
                     (investmentResponse.metadata.totalRecords || 0),
        allServicesUsed: [
          ...new Set([
            ...(budgetResponse.metadata.services_used || []),
            ...(revenueResponse.metadata.services_used || []),
            ...(expenseResponse.metadata.services_used || []),
            ...(investmentResponse.metadata.services_used || [])
          ])
        ],
        avgDataQuality: calculateAverageQuality([
          budgetResponse.metadata.dataQuality,
          revenueResponse.metadata.dataQuality,
          expenseResponse.metadata.dataQuality,
          investmentResponse.metadata.dataQuality
        ]),
        lastUpdated: new Date().toISOString()
      };

      setOverallMetadata(combinedMetadata);

      // Update service status
      const updatedServices = services.map(service => {
        const isUsed = combinedMetadata.allServicesUsed.some((used: string) => 
          used.toLowerCase().includes(service.name.toLowerCase().split(' ')[0])
        );
        
        return {
          ...service,
          status: isUsed ? 'active' as const : 'error' as const,
          recordCount: isUsed ? Math.floor(combinedMetadata.totalRecords / combinedMetadata.allServicesUsed.length) : 0,
          lastUpdated: combinedMetadata.lastUpdated
        };
      });

      setServiceStatus(updatedServices);

    } catch (err) {
      console.error('Failed to load unified dashboard data:', err);
      setError('Error al cargar el dashboard unificado');
      
      // Update service status to show errors
      const errorServices = services.map(service => ({
        ...service,
        status: 'error' as const,
        lastUpdated: new Date().toISOString()
      }));
      setServiceStatus(errorServices);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageQuality = (qualities: string[]): string => {
    const qualityScores = qualities.map(q => {
      switch (q) {
        case 'HIGH': return 3;
        case 'MEDIUM': return 2;
        case 'LOW': return 1;
        default: return 1;
      }
    });
    
    const avgScore = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    
    if (avgScore >= 2.5) return 'HIGH';
    if (avgScore >= 1.5) return 'MEDIUM';
    return 'LOW';
  };

  const renderServiceStatus = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {serviceStatus.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {service.icon}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {service.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {service.recordCount} registros
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                {service.status === 'loading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                )}
                {service.status === 'active' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {service.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderCombinedChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Cargando Dashboard Unificado...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Integrando datos de todas las fuentes disponibles
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      );
    }

    // Combine all data for comprehensive visualization
    const combinedData = [
      ...budgetData.map(d => ({ ...d, type: 'Presupuesto' })),
      ...revenueData.map(d => ({ ...d, type: 'Ingresos' })),
      ...expenseData.map(d => ({ ...d, type: 'Gastos' })),
      ...investmentData.map(d => ({ ...d, type: 'Inversiones' }))
    ];

    if (combinedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles para mostrar</p>
        </div>
      );
    }

    // Create summary data for pie chart
    const summaryData = [
      { 
        name: 'Presupuesto', 
        value: budgetData.reduce((sum, d) => sum + (d.budgeted || d.amount || d.value || 0), 0),
        color: COLORS[0]
      },
      { 
        name: 'Ingresos', 
        value: revenueData.reduce((sum, d) => sum + (d.amount || d.value || 0), 0),
        color: COLORS[1]
      },
      { 
        name: 'Gastos', 
        value: expenseData.reduce((sum, d) => sum + (d.amount || d.value || 0), 0),
        color: COLORS[2]
      },
      { 
        name: 'Inversiones', 
        value: investmentData.reduce((sum, d) => sum + (d.value || d.amount || 0), 0),
        color: COLORS[3]
      }
    ].filter(d => d.value > 0);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resumen Financiero {year}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summaryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {summaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrencyARS(value as number, true), 'Monto']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Data Integration Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estado de Integración
          </h3>
          
          {overallMetadata && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total de Registros:</span>
                <span className="font-medium">{overallMetadata.totalRecords}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Servicios Activos:</span>
                <span className="font-medium">{overallMetadata.allServicesUsed.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Calidad de Datos:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  overallMetadata.avgDataQuality === 'HIGH' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  overallMetadata.avgDataQuality === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {overallMetadata.avgDataQuality === 'HIGH' ? 'Alta' :
                   overallMetadata.avgDataQuality === 'MEDIUM' ? 'Media' : 'Básica'}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Servicios Integrados:</p>
                <div className="flex flex-wrap gap-1">
                  {overallMetadata.allServicesUsed.map((service: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Dashboard Unificado {year}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Integración completa de todos los servicios y conectores disponibles
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Sistema Integrado
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {showAllSources && renderServiceStatus()}
        {renderCombinedChart()}
      </div>
    </motion.div>
  );
};

export default UnifiedDashboardChart;