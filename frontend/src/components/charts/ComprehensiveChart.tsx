import React, { useMemo, useState } from 'react';
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
  Area
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  Loader2
} from 'lucide-react';
import { formatCurrencyARS } from '../../utils/formatters';
import { useMasterData } from '../../hooks/useMasterData';

export type ChartType = 
  | 'budget' 
  | 'debt' 
  | 'treasury' 
  | 'salary' 
  | 'contract' 
  | 'property' 
  | 'document'
  | 'investment'
  | 'revenue';

export type ChartVariant = 'bar' | 'pie' | 'line' | 'area';

interface ComprehensiveChartProps {
  type: ChartType;
  year: number;
  title?: string;
  className?: string;
  variant?: ChartVariant;
  showControls?: boolean;
  height?: number;
}

interface BudgetItem {
  name?: string;
  descripcion?: string;
  category?: string;
  budgeted?: string | number;
  presupuestado?: string | number;
  budget?: string | number;
  executed?: string | number;
  ejecutado?: string | number;
  execution?: string | number;
  execution_rate?: string | number;
  porcentaje_ejecucion?: string | number;
}

interface DebtItem {
  debt_type?: string;
  descripcion?: string;
  tipo?: string;
  amount?: string | number;
  monto?: string | number;
  value?: string | number;
}

interface PositionGroup {
  employees: number;
  totalSalary: number;
  count: number;
}

interface SalaryCategoryItem {
  avg_salary?: string | number;
  promedio?: string | number;
  employee_count?: string | number;
  cantidad?: string | number;
}

interface InvestmentItem {
  description?: string;
  name?: string;
  net_value?: string | number;
  value?: string | number;
}

interface ContractItem {
  title?: string;
  description?: string;
  amount?: string | number;
  budget?: string | number;
}

interface PropertyItem {
  owner?: string;
  count?: string | number;
  total?: string | number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'];

const ComprehensiveChart: React.FC<ComprehensiveChartProps> = ({
  type,
  year,
  title,
  className = '',
  variant = 'bar',
  showControls = false,
  height = 300
}) => {
  const [currentVariant, setCurrentVariant] = useState<ChartVariant>(variant);
  
  // 🚀 Use the most comprehensive data service - CompleteFinalDataService
  const { currentYearData, loading, error } = useMasterData(year);

  // Transform data based on chart type using real data
  const chartData = useMemo(() => {
    if (!currentYearData) return [];

    switch (type) {
      case 'budget': {
        const budgetData = currentYearData.budget;
        if (!budgetData) return [];

        // Handle different possible data structures for budget
        if (Array.isArray(budgetData.categories)) {
          return budgetData.categories.map((item: BudgetItem, index: number) => ({
            name: item.name || item.descripcion || item.category || `Categoría ${index + 1}`,
            budgeted: parseFloat(String(item.budgeted || item.presupuestado || item.budget || 0)),
            executed: parseFloat(String(item.executed || item.ejecutado || item.execution || 0)),
            execution_rate: parseFloat(String(item.execution_rate || item.porcentaje_ejecucion || 0)),
            fill: COLORS[index % COLORS.length]
          }));
        } else if (budgetData.categories) {
          // If categories is an object instead of array
          return Object.entries(budgetData.categories).map(([name, item]: [string, BudgetItem], index: number) => ({
            name: name,
            budgeted: parseFloat(String(item.budgeted || item.presupuestado || item.budget || 0)),
            executed: parseFloat(String(item.executed || item.ejecutado || item.execution || 0)),
            execution_rate: parseFloat(String(item.execution_rate || item.porcentaje_ejecucion || 0)),
            fill: COLORS[index % COLORS.length]
          }));
        } else {
          // If budget data is directly in budgetData object
          return [{
            name: budgetData.name || budgetData.descripcion || 'Presupuesto Total',
            budgeted: parseFloat(String(budgetData.total_budget || budgetData.budget || 0)),
            executed: parseFloat(String(budgetData.total_executed || budgetData.executed || 0)),
            execution_rate: budgetData.total_budget > 0 ? parseFloat(String((budgetData.total_executed / budgetData.total_budget) * 100)) : 0,
            fill: COLORS[0]
          }];
        }
      }

      case 'document': {
        const allDocs = currentYearData.documents || [];
        const docsByCategory: Record<string, number> = {};
        
        allDocs.forEach((doc: Record<string, unknown>) => {
          const category = (doc.category as string) || 'General';
          docsByCategory[category] = (docsByCategory[category] || 0) + 1;
        });

        return Object.entries(docsByCategory).map(([category, count], index) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: count as number,
          fill: COLORS[index % COLORS.length]
        }));
      }

      case 'revenue': {
        const revenueData = currentYearData.budget?.total_revenue || 0;
        if (!revenueData) return [];

        return [{
          name: 'Ingresos',
          value: revenueData,
          fill: COLORS[0]
        }];
      }

      case 'debt': {
        const debtData = currentYearData.budget?.debt || currentYearData.debt;
        if (!debtData) return [];

        if (Array.isArray(debtData)) {
          return debtData.map((item: DebtItem, index: number) => ({
            name: item.debt_type || item.descripcion || item.tipo || 'Deuda',
            value: parseFloat(String(item.amount || item.monto || item.value || 0)),
            fill: COLORS[index % COLORS.length]
          }));
        } else {
          // If debt data is a single object
          return [{
            name: debtData.debt_type || debtData.descripcion || 'Deuda Total',
            value: parseFloat(String(debtData.amount || debtData.total || 0)),
            fill: COLORS[0]
          }];
        }
      }

      case 'salary': {
        const salaryData = currentYearData.salaries;
        if (!salaryData) return [];

        if (Array.isArray(salaryData)) {
          const positionGroups: Record<string, PositionGroup> = {};
          salaryData.forEach((pos: Record<string, unknown>) => {
            const category = (pos.category as string) || (pos.area as string) || (pos.departamento as string) || 'General';
            if (!positionGroups[category]) {
              positionGroups[category] = { employees: 0, totalSalary: 0, count: 0 };
            }
            const employees = parseFloat(String(pos.employeeCount || pos.cantidad || 1));
            const salary = parseFloat(String(pos.grossSalary || pos.sueldo_bruto || pos.salario || 0));

            positionGroups[category].employees += employees;
            positionGroups[category].totalSalary += salary * employees;
            positionGroups[category].count += employees;
          });

          return Object.entries(positionGroups).map(([category, data]: [string, PositionGroup], index: number) => ({
            name: category,
            employees: data.employees,
            avgSalary: data.count > 0 ? data.totalSalary / data.count : 0,
            fill: COLORS[index % COLORS.length]
          }));
        } else if (salaryData.categories) {
          // If salary data is grouped by category
          return Object.entries(salaryData.categories).map(([name, item]: [string, SalaryCategoryItem], index: number) => ({
            name: name,
            avgSalary: parseFloat(String(item.avg_salary || item.promedio || 0)),
            employees: parseInt(String(item.employee_count || item.cantidad || 0)),
            fill: COLORS[index % COLORS.length]
          }));
        } else {
          // Single salary data
          return [{
            name: 'Salarios',
            avgSalary: parseFloat(String(salaryData.avg_salary || salaryData.promedio || 0)),
            employees: parseInt(String(salaryData.employee_count || salaryData.total_employees || 0)),
            fill: COLORS[0]
          }];
        }
      }

      case 'investment': {
        const investmentData = currentYearData.budget?.investment || currentYearData.investment;
        if (!investmentData) return [];

        if (Array.isArray(investmentData)) {
          return investmentData.map((inv: InvestmentItem, index: number) => ({
            name: inv.description || inv.name || 'Inversión',
            value: parseFloat(String(inv.net_value || inv.value || 0)),
            fill: COLORS[index % COLORS.length]
          }));
        } else {
          // If investment data is a single object
          return [{
            name: investmentData.description || investmentData.name || 'Inversión Total',
            value: parseFloat(String(investmentData.net_value || investmentData.value || 0)),
            fill: COLORS[0]
          }];
        }
      }

      case 'contract': {
        const contractData = currentYearData.contracts;
        if (!contractData) return [];

        if (Array.isArray(contractData)) {
          return contractData.map((item: ContractItem, index: number) => ({
            name: item.title || item.description || `Contrato ${index + 1}`,
            value: parseFloat(String(item.amount || 0)),
            fill: COLORS[index % COLORS.length]
          }));
        } else if (contractData.documents) {
          // Handle contracts stored as documents
          return (contractData.documents as ContractItem[]).map((item: ContractItem, index: number) => ({
            name: item.title || item.description || `Contrato ${index + 1}`,
            value: parseFloat(String(item.amount || item.budget || 0)),
            fill: COLORS[index % COLORS.length]
          }));
        } else {
          // Single contract data
          return [{
            name: contractData.title || contractData.description || 'Contratos',
            value: parseFloat(String(contractData.amount || contractData.total_amount || 0)),
            fill: COLORS[0]
          }];
        }
      }

      case 'treasury': {
        const treasuryData = currentYearData.budget?.treasury || currentYearData.treasury;
        if (!treasuryData) return [];

        if (treasuryData.movements) {
          const categories: Record<string, number> = {};
          treasuryData.movements.forEach((movement: Record<string, unknown>) => {
            const category = (movement.category as string) || (movement.tipo as string) || 'General';
            categories[category] = (categories[category] || 0) + Math.abs(parseFloat(String(movement.amount || movement.monto || 0)));
          });

          return Object.entries(categories).map(([name, amount], index) => ({
            name: name,
            value: amount,
            fill: COLORS[index % COLORS.length]
          }));
        } else {
          // Single treasury data
          return [{
            name: 'Tesorería',
            value: parseFloat(String(treasuryData.amount || treasuryData.total || 0)),
            fill: COLORS[0]
          }];
        }
      }

      case 'property': {
        const propertyData = currentYearData.contracts?.property_declarations || currentYearData.property_declarations;
        if (!propertyData) return [];

        if (Array.isArray(propertyData)) {
          return propertyData.map((item: PropertyItem, index: number) => ({
            name: item.owner || `Declaración ${index + 1}`,
            value: 1, // Just count the declarations
            fill: COLORS[index % COLORS.length]
          }));
        } else {
          // Single property data
          return [{
            name: 'Declaraciones Patrimoniales',
            value: parseInt(String(propertyData.count || propertyData.total || 0)),
            fill: COLORS[0]
          }];
        }
      }


      default:
        return [];
    }
  }, [type, currentYearData]);

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      );
    }

    if (error || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">No hay datos disponibles para mostrar</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (currentVariant) {
      case 'bar': {
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280"
                tickFormatter={(value) => {
                  if (type === 'salary') return value.toString();
                  return formatCurrencyARS(Number(value));
                }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (type === 'salary') {
                    return [value, name];
                  }
                  return [formatCurrencyARS(Number(value)), name];
                }}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              {type === 'budget' ? (
                <>
                  <Bar dataKey="budgeted" name="Presupuestado" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="executed" name="Ejecutado" fill="#10B981" radius={[4, 4, 0, 0]} />
                </>
              ) : type === 'salary' ? (
                <Bar dataKey="avgSalary" name="Salario Promedio" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              ) : type === 'treasury' ? (
                <Bar dataKey="amount" name="Monto" radius={[4, 4, 0, 0]} />
              ) : (
                <Bar dataKey="value" name="Valor" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'pie': {
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [
                  typeof value === 'number' && value > 100000 ? formatCurrencyARS(value) : value, 
                  'Valor'
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      } // Added closing curly brace
      case 'line': {
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip formatter={(value) => [formatCurrencyARS(Number(value)), 'Valor']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      } // Added closing curly brace
      case 'area': {
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip formatter={(value) => [formatCurrencyARS(Number(value)), 'Valor']} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="rgba(59, 130, 246, 0.1)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      } // Added closing curly brace
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      {(title || showControls) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{title}</h3>
          )}
          
          {showControls && (
            <div className="flex items-center space-x-2">
              {(['bar', 'pie', 'line', 'area'] as ChartVariant[]).map((chartType) => {
                const icons = {
                  bar: <BarChart3 size={16} />,
                  pie: <PieIcon size={16} />,
                  line: <Activity size={16} />,
                  area: <TrendingUp size={16} />
                };
                
                return (
                  <button
                    key={chartType}
                    onClick={() => setCurrentVariant(chartType)}
                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      currentVariant === chartType
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:text-dark-text-primary hover:bg-gray-100 dark:bg-dark-background'
                    }`}
                    title={`Vista ${chartType}`}
                  >
                    {icons[chartType]}
                    <span className="ml-1 capitalize">{chartType}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="p-4">
        {renderChart()}
      </div>

      {/* Footer Stats */}
      {!loading && !error && chartData.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-dark-background dark:bg-dark-background border-t border-gray-100 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
            <span>
              {chartData.length} elemento{chartData.length !== 1 ? 's' : ''} • Año {year}
            </span>
            <span className="flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              Datos actualizados
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ComprehensiveChart;