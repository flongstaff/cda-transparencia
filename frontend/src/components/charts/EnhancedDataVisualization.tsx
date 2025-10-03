/**
 * Enhanced Data Visualization Component
 * Comprehensive chart system that properly integrates with your financial data
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  ScatterChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  AlertTriangle,
  Loader2,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Calendar,
  DollarSign,
  Users,
  Building,
  FileText,
  TrendingDown,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import dataIntegrationService from '../../services/DataIntegrationService';
import chartDataService from '../../services/charts/ChartDataService';

// Types
interface FinancialData {
  category: string;
  budgeted: number;
  executed: number;
  percentage: number;
  variance?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface ChartConfig {
  type: 'bar' | 'pie' | 'line' | 'area' | 'composed' | 'scatter' | 'radar';
  title: string;
  description: string;
  dataKey: string;
  color: string;
  height: number;
}

interface EnhancedDataVisualizationProps {
  year: number;
  dataType: 'budget' | 'revenue' | 'expenditure' | 'debt' | 'personnel' | 'contracts' | 'infrastructure';
  variant?: 'dashboard' | 'detailed' | 'comparison';
  className?: string;
  showControls?: boolean;
  showExport?: boolean;
  showFilters?: boolean;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#84CC16'
];

const CHART_CONFIGS: Record<string, ChartConfig[]> = {
  budget: [
    { type: 'bar', title: 'Presupuesto vs Ejecutado', description: 'Comparación presupuestaria', dataKey: 'budgeted', color: '#3B82F6', height: 400 },
    { type: 'pie', title: 'Distribución por Categoría', description: 'Distribución del presupuesto', dataKey: 'budgeted', color: '#10B981', height: 350 },
    { type: 'line', title: 'Tendencia de Ejecución', description: 'Evolución temporal', dataKey: 'percentage', color: '#F59E0B', height: 300 }
  ],
  revenue: [
    { type: 'bar', title: 'Ingresos por Fuente', description: 'Análisis de ingresos', dataKey: 'amount', color: '#10B981', height: 400 },
    { type: 'pie', title: 'Composición de Ingresos', description: 'Distribución porcentual', dataKey: 'amount', color: '#3B82F6', height: 350 }
  ],
  expenditure: [
    { type: 'bar', title: 'Gastos por Categoría', description: 'Análisis de gastos', dataKey: 'amount', color: '#EF4444', height: 400 },
    { type: 'area', title: 'Evolución de Gastos', description: 'Tendencia temporal', dataKey: 'amount', color: '#8B5CF6', height: 300 }
  ]
};

const EnhancedDataVisualization: React.FC<EnhancedDataVisualizationProps> = ({
  year,
  dataType,
  variant = 'dashboard',
  className = '',
  showControls = true,
  showExport = true,
  showFilters = true
}) => {
  const [selectedChart, setSelectedChart] = useState(0);
  const [data, setData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    minAmount: 0,
    maxAmount: Infinity,
    sortBy: 'budgeted'
  });

  // Load data based on dataType and year
  useEffect(() => {
    loadData();
  }, [year, dataType]);

  // Helper function to map data types to chart type names
  const getChartTypeName = (dataType: string): string => {
    const typeMap: Record<string, string> = {
      'budget': 'Budget_Execution',
      'revenue': 'Revenue_Sources',
      'expenditure': 'Expenditure_Report',
      'debt': 'Debt_Report',
      'personnel': 'Personnel_Expenses',
      'contracts': 'Infrastructure_Projects',
      'infrastructure': 'Infrastructure_Projects'
    };
    return typeMap[dataType] || 'Budget_Execution';
  };

  // Process raw chart data from CSV files
  const processRawChartData = (rawData: any[], type: string): FinancialData[] => {
    switch (type) {
      case 'budget':
        return rawData.map((item: any, index: number) => ({
          category: item.category || item.Category || item.sector || item.Sector || `Category ${index + 1}`,
          budgeted: parseFloat(item.budgeted || item.Budgeted || item.presupuestado || '0'),
          executed: parseFloat(item.executed || item.Executed || item.ejecutado || '0'),
          percentage: parseFloat(item.percentage || item.Percentage || item.execution_rate || '0'),
          variance: parseFloat(item.variance || item.Variance || '0'),
          trend: item.trend || item.Trend || (Math.random() > 0.5 ? 'up' : 'down')
        }));
      
      case 'revenue':
        return rawData.map((item: any, index: number) => ({
          category: item.source || item.Source || item.category || item.Category || `Source ${index + 1}`,
          budgeted: parseFloat(item.budgeted || item.Budgeted || item.presupuestado || '0'),
          executed: parseFloat(item.executed || item.Executed || item.ejecutado || item.amount || '0'),
          percentage: parseFloat(item.percentage || item.Percentage || item.execution_rate || '0'),
          variance: parseFloat(item.variance || item.Variance || '0'),
          trend: item.trend || item.Trend || (Math.random() > 0.5 ? 'up' : 'down')
        }));
      
      case 'expenditure':
        return rawData.map((item: any, index: number) => ({
          category: item.category || item.Category || item.sector || item.Sector || `Category ${index + 1}`,
          budgeted: parseFloat(item.budgeted || item.Budgeted || item.presupuestado || '0'),
          executed: parseFloat(item.executed || item.Executed || item.ejecutado || item.amount || '0'),
          percentage: parseFloat(item.percentage || item.Percentage || item.execution_rate || '0'),
          variance: parseFloat(item.variance || item.Variance || '0'),
          trend: item.trend || item.Trend || (Math.random() > 0.5 ? 'up' : 'down')
        }));
      
      default:
        return rawData.map((item: any, index: number) => ({
          category: item.category || item.Category || item.name || item.Name || `Item ${index + 1}`,
          budgeted: parseFloat(item.budgeted || item.Budgeted || item.presupuestado || '0'),
          executed: parseFloat(item.executed || item.Executed || item.ejecutado || item.amount || '0'),
          percentage: parseFloat(item.percentage || item.Percentage || item.execution_rate || '0'),
          variance: parseFloat(item.variance || item.Variance || '0'),
          trend: item.trend || item.Trend || (Math.random() > 0.5 ? 'up' : 'down')
        }));
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to load data from the chart data service first (highest priority)
      const chartTypeName = getChartTypeName(dataType);
      const rawData = await chartDataService.loadChartData(chartTypeName as any);
      
      if (rawData && rawData.length > 0) {
        // Process the raw chart data directly
        const processedData = processRawChartData(rawData, dataType);
        setData(processedData);
      } else {
        // Fallback to data integration service
        const integratedData = await dataIntegrationService.loadIntegratedData(year);
        const processedData = processDataForType(integratedData, dataType);
        setData(processedData);
      }
    } catch (chartDataError) {
      console.warn('Failed to load data from chart data service:', chartDataError);
      
      try {
        // Fallback to data integration service
        const integratedData = await dataIntegrationService.loadIntegratedData(year);
        const processedData = processDataForType(integratedData, dataType);
        setData(processedData);
      } catch (integrationError) {
        console.warn('Failed to load data from integration service:', integrationError);
        
        try {
          // Fallback to loading from local JSON if service fails
          const response = await fetch(`/data/processed/${year}/consolidated_data.json`);
          if (!response.ok) {
            throw new Error(`Failed to load data for ${year}`);
          }

          const consolidatedData = await response.json();
          const processedData = processDataForType(consolidatedData, dataType);
          setData(processedData);
        } catch (localError) {
          console.error('Error loading data from local JSON:', localError);
          setError(localError instanceof Error ? localError.message : 'Error loading data');
          // Fallback to sample data only as last resort
          setData(generateSampleData(dataType));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const processDataForType = (consolidatedData: any, type: string): FinancialData[] => {
    // Check if the input is from the data integration service
    if (consolidatedData.budget || consolidatedData.metadata) {
      // Handle integrated data format
      switch (type) {
        case 'budget':
          return processIntegratedBudgetData(consolidatedData);
        case 'revenue':
          return processIntegratedRevenueData(consolidatedData);
        case 'expenditure':
          return processIntegratedExpenditureData(consolidatedData);
        case 'debt':
          return processIntegratedDebtData(consolidatedData);
        case 'personnel':
          return processIntegratedPersonnelData(consolidatedData);
        case 'contracts':
          return processIntegratedContractsData(consolidatedData);
        case 'infrastructure':
          return processIntegratedInfrastructureData(consolidatedData);
        default:
          return [];
      }
    } else {
      // Handle original consolidated data format
      switch (type) {
        case 'budget':
          return processBudgetData(consolidatedData);
        case 'revenue':
          return processRevenueData(consolidatedData);
        case 'expenditure':
          return processExpenditureData(consolidatedData);
        case 'debt':
          return processDebtData(consolidatedData);
        case 'personnel':
          return processPersonnelData(consolidatedData);
        case 'contracts':
          return processContractsData(consolidatedData);
        case 'infrastructure':
          return processInfrastructureData(consolidatedData);
        default:
          return [];
      }
    }
  };

  const processBudgetData = (data: any): FinancialData[] => {
    const budgetData = data.financial_data_files?.find((file: any) => 
      file.filename.includes('Budget_Execution') || file.filename.includes('Expenditure_Report')
    );

    if (!budgetData?.sample_rows) return generateSampleData('budget');

    return budgetData.sample_rows.slice(1).map((row: any[], index: number) => ({
      category: row[0] || `Categoría ${index + 1}`,
      budgeted: parseFloat(String(row[1] || 0).replace(/[$,]/g, '')),
      executed: parseFloat(String(row[2] || 0).replace(/[$,]/g, '')),
      percentage: parseFloat(String(row[3] || 0).replace('%', '')),
      variance: parseFloat(String(row[2] || 0).replace(/[$,]/g, '')) - parseFloat(String(row[1] || 0).replace(/[$,]/g, '')),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));
  };

  const processRevenueData = (data: any): FinancialData[] => {
    const revenueData = data.revenue_by_source || data.financial_data_files?.find((file: any) => 
      file.filename.includes('Revenue')
    );

    if (!revenueData) return generateSampleData('revenue');

    const sourceData = Array.isArray(revenueData) ? revenueData : revenueData.sample_rows?.slice(1) || [];
    
    return sourceData.map((item: any, index: number) => ({
      category: item.Source || item[0] || `Fuente ${index + 1}`,
      budgeted: parseFloat(String(item.Amount || item[1] || 0).replace(/[$,]/g, '')),
      executed: parseFloat(String(item.Amount || item[1] || 0).replace(/[$,]/g, '')),
      percentage: parseFloat(String(item['% of Total'] || item[2] || 0).replace('%', '')),
      variance: parseFloat(String(item.Variation || item[3] || 0).replace('%', '')),
      trend: parseFloat(String(item.Variation || item[3] || 0).replace('%', '')) > 0 ? 'up' : 'down'
    }));
  };

  const processExpenditureData = (data: any): FinancialData[] => {
    const expenditureData = data.financial_data_files?.find((file: any) => 
      file.filename.includes('Expenditure_Report')
    );

    if (!expenditureData?.sample_rows) return generateSampleData('expenditure');

    return expenditureData.sample_rows.slice(1).map((row: any[], index: number) => ({
      category: row[0] || `Gasto ${index + 1}`,
      budgeted: parseFloat(String(row[1] || 0).replace(/[$,]/g, '')),
      executed: parseFloat(String(row[2] || 0).replace(/[$,]/g, '')),
      percentage: parseFloat(String(row[3] || 0).replace('%', '')),
      variance: parseFloat(String(row[2] || 0).replace(/[$,]/g, '')) - parseFloat(String(row[1] || 0).replace(/[$,]/g, '')),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));
  };

  const processDebtData = (data: any): FinancialData[] => {
    const debtData = data.financial_data_files?.find((file: any) => 
      file.filename.includes('Debt_Report')
    );

    if (!debtData?.sample_rows) return generateSampleData('debt');

    return debtData.sample_rows.slice(1).map((row: any[], index: number) => ({
      category: row[0] || `Deuda ${index + 1}`,
      budgeted: parseFloat(String(row[1] || 0).replace(/[$,]/g, '')),
      executed: parseFloat(String(row[1] || 0).replace(/[$,]/g, '')),
      percentage: 100,
      variance: 0,
      trend: 'stable'
    }));
  };

  const processPersonnelData = (data: any): FinancialData[] => {
    const personnelData = data.financial_data_files?.find((file: any) => 
      file.filename.includes('Personnel_Expenses')
    );

    if (!personnelData?.sample_rows) return generateSampleData('personnel');

    return personnelData.sample_rows.slice(1).map((row: any[], index: number) => ({
      category: row[0] || `Personal ${index + 1}`,
      budgeted: parseFloat(String(row[1] || 0).replace(/[$,]/g, '')),
      executed: parseFloat(String(row[2] || 0).replace(/[$,]/g, '')),
      percentage: parseFloat(String(row[3] || 0).replace('%', '')),
      variance: parseFloat(String(row[2] || 0).replace(/[$,]/g, '')) - parseFloat(String(row[1] || 0).replace(/[$,]/g, '')),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));
  };

  const processContractsData = (data: any): FinancialData[] => {
    const contractsData = data.financial_data_files?.find((file: any) => 
      file.filename.includes('Infrastructure_Projects')
    );

    if (!contractsData?.sample_rows) return generateSampleData('contracts');

    return contractsData.sample_rows.slice(1).map((row: any[], index: number) => ({
      category: row[0] || `Proyecto ${index + 1}`,
      budgeted: parseFloat(String(row[2] || 0).replace(/[$,]/g, '')),
      executed: parseFloat(String(row[3] || 0).replace(/[$,]/g, '')),
      percentage: parseFloat(String(row[4] || 0).replace('%', '')),
      variance: parseFloat(String(row[3] || 0).replace(/[$,]/g, '')) - parseFloat(String(row[2] || 0).replace(/[$,]/g, '')),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));
  };

  const processInfrastructureData = (data: any): FinancialData[] => {
    return processContractsData(data); // Same structure as contracts
  };

  // Functions to process integrated data from DataIntegrationService
  const processIntegratedBudgetData = (data: any): FinancialData[] => {
    if (!data.budget || !data.budget.quarterly_data) {
      // If no quarterly data, create a basic budget entry
      return [{
        category: 'Total Budget',
        budgeted: data.budget?.total_budget || 0,
        executed: data.budget?.total_executed || 0,
        percentage: data.budget?.execution_rate || 0,
        variance: (data.budget?.total_executed || 0) - (data.budget?.total_budget || 0),
        trend: (data.budget?.total_executed || 0) >= (data.budget?.total_budget || 0) ? 'up' : 'down'
      }];
    }

    // Process quarterly data if available
    return data.budget.quarterly_data.map((item: any, index: number) => ({
      category: item.name || item.category || `Categoría ${index + 1}`,
      budgeted: item.budgeted || item.total_budget || 0,
      executed: item.executed || item.total_executed || 0,
      percentage: item.execution_rate || item.executionRate || 0,
      variance: (item.executed || item.total_executed || 0) - (item.budgeted || item.total_budget || 0),
      trend: ((item.executed || item.total_executed || 0) >= (item.budgeted || item.total_budget || 0)) ? 'up' : 'down'
    }));
  };

  const processIntegratedRevenueData = (data: any): FinancialData[] => {
    // Extract revenue data from treasury section
    if (data.treasury?.income || data.treasury?.total_revenue) {
      return [{
        category: 'Ingresos Totales',
        budgeted: data.treasury.total_revenue || data.treasury.income || 0,
        executed: data.treasury.total_revenue || data.treasury.income || 0,
        percentage: 100, // Placeholder
        variance: 0, // Placeholder
        trend: 'stable'
      }];
    }

    // If no specific revenue data, return empty
    return [];
  };

  const processIntegratedExpenditureData = (data: any): FinancialData[] => {
    // Extract expenditure data from treasury section
    if (data.treasury?.expenses || data.treasury?.total_expenses) {
      return [{
        category: 'Gastos Totales',
        budgeted: data.treasury.total_expenses || data.treasury.expenses || 0,
        executed: data.treasury.total_expenses || data.treasury.expenses || 0,
        percentage: 100, // Placeholder
        variance: 0, // Placeholder
        trend: 'stable'
      }];
    }

    // If no specific expenditure data, return empty
    return [];
  };

  const processIntegratedDebtData = (data: any): FinancialData[] => {
    if (data.debt?.total_debt) {
      return [{
        category: 'Deuda Total',
        budgeted: data.debt.total_debt || 0,
        executed: data.debt.total_debt || 0,
        percentage: 100, // Placeholder
        variance: 0, // Placeholder
        trend: 'stable'
      }];
    }

    return [];
  };

  const processIntegratedPersonnelData = (data: any): FinancialData[] => {
    if (data.salaries) {
      return [{
        category: 'Costo de Personal',
        budgeted: data.salaries.totalPayroll || 0,
        executed: data.salaries.totalPayroll || 0,
        percentage: 100, // Placeholder
        variance: 0, // Placeholder
        trend: 'stable'
      }];
    }

    return [];
  };

  const processIntegratedContractsData = (data: any): FinancialData[] => {
    if (data.contracts && Array.isArray(data.contracts)) {
      return data.contracts.map((contract: any, index: number) => ({
        category: contract.name || contract.description || `Contrato ${index + 1}`,
        budgeted: contract.budgeted || contract.total || 0,
        executed: contract.executed || contract.total || 0,
        percentage: 100, // Placeholder
        variance: 0, // Placeholder
        trend: 'stable'
      }));
    }

    return [];
  };

  const processIntegratedInfrastructureData = (data: any): FinancialData[] => {
    // Use the same approach as contracts for infrastructure
    return processIntegratedContractsData(data);
  };

  const generateSampleData = (type: string): FinancialData[] => {
    const sampleData: Record<string, FinancialData[]> = {
      budget: [
        { category: 'Gastos Corrientes', budgeted: 180000000, executed: 175000000, percentage: 97.2, variance: -5000000, trend: 'down' },
        { category: 'Gastos de Capital', budgeted: 120000000, executed: 118000000, percentage: 98.3, variance: -2000000, trend: 'down' },
        { category: 'Pago de Intereses', budgeted: 15000000, executed: 14500000, percentage: 96.7, variance: -500000, trend: 'down' }
      ],
      revenue: [
        { category: 'Impuesto Inmobiliario', budgeted: 100000000, executed: 100000000, percentage: 30.3, variance: 5200000, trend: 'up' },
        { category: 'Impuesto a las Actividades', budgeted: 75000000, executed: 75000000, percentage: 22.7, variance: 6100000, trend: 'up' },
        { category: 'Tasas y Contribuciones', budgeted: 55000000, executed: 55000000, percentage: 16.7, variance: 4300000, trend: 'up' }
      ],
      expenditure: [
        { category: 'Personal', budgeted: 80000000, executed: 79000000, percentage: 98.8, variance: -1000000, trend: 'down' },
        { category: 'Cargas Sociales', budgeted: 25000000, executed: 24500000, percentage: 98.0, variance: -500000, trend: 'down' },
        { category: 'Jubilaciones', budgeted: 15000000, executed: 14800000, percentage: 98.7, variance: -200000, trend: 'down' }
      ],
      debt: [
        { category: 'Bonos Municipales', budgeted: 100000000, executed: 100000000, percentage: 100, variance: 0, trend: 'stable' },
        { category: 'Préstamos Bancarios', budgeted: 50000000, executed: 50000000, percentage: 100, variance: 0, trend: 'stable' },
        { category: 'Banco de Desarrollo', budgeted: 30000000, executed: 30000000, percentage: 100, variance: 0, trend: 'stable' }
      ],
      personnel: [
        { category: 'Salarios', budgeted: 80000000, executed: 79000000, percentage: 98.8, variance: -1000000, trend: 'down' },
        { category: 'Cargas Sociales', budgeted: 25000000, executed: 24500000, percentage: 98.0, variance: -500000, trend: 'down' },
        { category: 'Jubilaciones', budgeted: 15000000, executed: 14800000, percentage: 98.7, variance: -200000, trend: 'down' }
      ],
      contracts: [
        { category: 'Expansión de Carreteras', budgeted: 15000000, executed: 12000000, percentage: 80, variance: -3000000, trend: 'down' },
        { category: 'Renovación Escolar', budgeted: 8000000, executed: 8000000, percentage: 100, variance: 0, trend: 'stable' },
        { category: 'Sistema de Agua', budgeted: 20000000, executed: 0, percentage: 0, variance: -20000000, trend: 'down' }
      ],
      infrastructure: [
        { category: 'Infraestructura Vial', budgeted: 40000000, executed: 38500000, percentage: 96.3, variance: -1500000, trend: 'down' },
        { category: 'Infraestructura Educativa', budgeted: 25000000, executed: 24000000, percentage: 96.0, variance: -1000000, trend: 'down' },
        { category: 'Infraestructura Sanitaria', budgeted: 20000000, executed: 19500000, percentage: 97.5, variance: -500000, trend: 'down' }
      ]
    };

    return sampleData[type] || [];
  };

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category.toLowerCase().includes(filters.category.toLowerCase()));
    }

    filtered = filtered.filter(item => 
      item.budgeted >= filters.minAmount && item.budgeted <= filters.maxAmount
    );

    // Sort data
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'budgeted':
          return b.budgeted - a.budgeted;
        case 'executed':
          return b.executed - a.executed;
        case 'percentage':
          return b.percentage - a.percentage;
        case 'variance':
          return Math.abs(b.variance || 0) - Math.abs(a.variance || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [data, filters]);

  const currentConfig = CHART_CONFIGS[dataType] || CHART_CONFIGS.budget;
  const chartConfig = currentConfig[selectedChart] || currentConfig[0];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando datos...</span>
        </div>
      );
    }

    if (error || filteredData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {error || 'No hay datos disponibles para mostrar'}
            </p>
            <button
              onClick={loadData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartConfig.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280"
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(Number(value)), name]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="budgeted" name="Presupuestado" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="executed" name="Ejecutado" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} ${formatPercentage(percentage)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="budgeted"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor']} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={formatPercentage} />
              <Tooltip formatter={(value) => [formatPercentage(Number(value)), 'Porcentaje']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor']} />
              <Area
                type="monotone"
                dataKey="executed"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="rgba(59, 130, 246, 0.1)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={chartConfig.height}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={formatCurrency} />
              <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name]} />
              <Legend />
              <Bar dataKey="budgeted" name="Presupuestado" fill="#3B82F6" />
              <Line type="monotone" dataKey="executed" name="Ejecutado" stroke="#10B981" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Categoría', 'Presupuestado', 'Ejecutado', 'Porcentaje', 'Varianza', 'Tendencia'],
      ...filteredData.map(item => [
        item.category,
        item.budgeted.toString(),
        item.executed.toString(),
        item.percentage.toString(),
        (item.variance || 0).toString(),
        item.trend || 'stable'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataType}_${year}_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {chartConfig.title} - {year}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {chartConfig.description}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {showExport && (
            <button
              onClick={exportData}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </button>
          )}
          
          <button
            onClick={loadData}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            {/* Chart Type Selector */}
            <div className="flex items-center space-x-2">
              {currentConfig.map((config, index) => {
                const icons = {
                  bar: <BarChart3 size={16} />,
                  pie: <PieIcon size={16} />,
                  line: <TrendingUp size={16} />,
                  area: <Activity size={16} />,
                  composed: <BarChart3 size={16} />
                };
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedChart(index)}
                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      selectedChart === index
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={config.title}
                  >
                    {icons[config.type]}
                    <span className="ml-1 capitalize">{config.type}</span>
                  </button>
                );
              })}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex items-center space-x-4">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Ordenar datos por"
                >
                  <option value="budgeted">Ordenar por Presupuesto</option>
                  <option value="executed">Ordenar por Ejecutado</option>
                  <option value="percentage">Ordenar por Porcentaje</option>
                  <option value="variance">Ordenar por Varianza</option>
                </select>

                <input
                  type="text"
                  placeholder="Filtrar categoría..."
                  value={filters.category === 'all' ? '' : filters.category}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    category: e.target.value || 'all' 
                  }))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-6">
        {renderChart()}
      </div>

      {/* Summary Stats */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {formatCurrency(filteredData.reduce((sum, item) => sum + item.budgeted, 0))}
              </div>
              <div className="text-gray-600">Total Presupuestado</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {formatCurrency(filteredData.reduce((sum, item) => sum + item.executed, 0))}
              </div>
              <div className="text-gray-600">Total Ejecutado</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {formatPercentage(
                  filteredData.reduce((sum, item) => sum + item.executed, 0) / 
                  filteredData.reduce((sum, item) => sum + item.budgeted, 0) * 100
                )}
              </div>
              <div className="text-gray-600">Ejecución Promedio</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {filteredData.length}
              </div>
              <div className="text-gray-600">Categorías</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedDataVisualization;
