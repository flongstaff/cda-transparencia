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
  TrendingDown, 
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
  | 'revenue'
  | 'budget-trend'  // For historical budget trends
  | 'contract-trend'  // For historical contract trends
  | 'salary-trend'  // For historical salary trends
  | 'document-trend'  // For historical document trends
  | 'debt-trend'  // For historical debt trends
  | 'treasury-trend'; // For historical treasury trends

export type ChartVariant = 'bar' | 'pie' | 'line' | 'area';

interface UnifiedChartProps {
  type: ChartType;
  year: number;
  title?: string;
  className?: string;
  variant?: ChartVariant;
  showControls?: boolean;
  height?: number;
}

import { useTheme } from '@mui/material/styles'; // Import useTheme hook

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'];

const UnifiedChart: React.FC<UnifiedChartProps> = ({
  type,
  year,
  title,
  className = '',
  variant = 'bar',
  showControls = false,
  height = 300
}) => {
  const theme = useTheme(); // Access the MUI theme
  const [currentVariant, setCurrentVariant] = useState<ChartVariant>(variant);
  
  // 🚀 Use the new comprehensive master data service that includes historical data
  const { 
    masterData, 
    currentBudget,
    currentContracts,
    currentSalaries,
    currentDocuments,
    currentTreasury,
    currentDebt,
    multiYearData,
    budgetHistoricalData,
    contractsHistoricalData,
    salariesHistoricalData,
    documentsHistoricalData,
    debtHistoricalData,
    treasuryHistoricalData,
    loading,
    error 
  } = useMasterData(year);

  // Determine current year data based on the type
  const currentYearData = useMemo(() => {
    if (!masterData) return null;
    
    if (type.includes('-trend')) {
      // For trend charts, we don't use current year data but historical
      return null;
    }
    
    return {
      budget: currentBudget,
      contracts: currentContracts,
      salaries: currentSalaries,
      documents: currentDocuments,
      treasury: currentTreasury,
      debt: currentDebt
    };
  }, [masterData, currentBudget, currentContracts, currentSalaries, currentDocuments, currentTreasury, currentDebt, type]);

  // Update COLORS to use theme palette for consistency
  const themedColors = useMemo(() => [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info?.main || '#3B82F6',
    theme.palette.warning?.main || '#F59E0B',
    theme.palette.success?.main || '#10B981',
    '#EC4899', '#6B7280', '#14B8A6' // Fallback for additional colors
  ], [theme]);

  // Transform data based on chart type using real data
  const chartData = useMemo(() => {
    // Handle historical trend charts first
    if (type === 'budget-trend' && budgetHistoricalData.length > 0) {
      return budgetHistoricalData.map((item: Record<string, unknown>) => ({
        year: item.year,
        budget_total: item.budget_total,
        executed_total: item.executed_total,
        execution_rate: item.execution_rate,
        fill: themedColors[0]
      }));
    }
    
    if (type === 'contract-trend' && contractsHistoricalData.length > 0) {
      return contractsHistoricalData.map((item: Record<string, unknown>) => ({
        year: item.year,
        total_contracts: item.total_contracts,
        total_amount: item.total_amount,
        fill: themedColors[0]
      }));
    }
    
    if (type === 'salary-trend' && salariesHistoricalData.length > 0) {
      return salariesHistoricalData.map((item: Record<string, unknown>) => ({
        year: item.year,
        total_employees: item.total_employees,
        average_salary: item.average_salary,
        total_payroll: item.total_payroll,
        fill: themedColors[0]
      }));
    }
    
    if (type === 'document-trend' && documentsHistoricalData.length > 0) {
      return documentsHistoricalData.map((item: Record<string, unknown>) => ({
        year: item.year,
        total_documents: item.total_documents,
        fill: themedColors[0]
      }));
    }
    
    if (type === 'debt-trend' && debtHistoricalData.length > 0) {
      return debtHistoricalData.map((item: Record<string, unknown>) => ({
        year: item.year,
        total_debt: item.total_debt,
        fill: themedColors[0]
      }));
    }
    
    if (type === 'treasury-trend' && treasuryHistoricalData.length > 0) {
      return treasuryHistoricalData.map((item: Record<string, unknown>) => ({
        year: item.year,
        total_revenue: item.total_revenue,
        total_expenses: item.total_expenses,
        balance: item.balance,
        fill: themedColors[0]
      }));
    }

    // Handle current year charts
    if (!currentYearData) return [];

    switch (type) {
      case 'budget': {
        const budgetData = currentYearData.budget;
        if (!budgetData) return [];

        // Handle different possible data structures for budget
        if (Array.isArray(budgetData.categories)) {
          return budgetData.categories.map((item: any, index: number) => ({
            name: item.name || item.descripcion || item.category || `Categoría ${index + 1}`,
            budgeted: parseFloat(item.budgeted || item.presupuestado || item.budget || 0),
            executed: parseFloat(item.executed || item.ejecutado || item.execution || 0),
            execution_rate: parseFloat(item.execution_rate || item.porcentaje_ejecucion || 0),
            fill: themedColors[index % themedColors.length]
          }));
        } else if (budgetData.categories) {
          // If categories is an object instead of array
          return Object.entries(budgetData.categories).map(([name, item]: [string, any], index: number) => ({
            name: name,
            budgeted: parseFloat(item.budgeted || item.presupuestado || item.budget || 0),
            executed: parseFloat(item.executed || item.ejecutado || item.execution || 0),
            execution_rate: parseFloat(item.execution_rate || item.porcentaje_ejecucion || 0),
            fill: themedColors[index % themedColors.length]
          }));
        } else {
          // If budget data is directly in budgetData object
          return [{
            name: budgetData.name || budgetData.descripcion || 'Presupuesto Total',
            budgeted: parseFloat(budgetData.total_budget || budgetData.budget || 0),
            executed: parseFloat(budgetData.total_executed || budgetData.executed || 0),
            execution_rate: budgetData.total_budget > 0 ? parseFloat((budgetData.total_executed / budgetData.total_budget) * 100) : 0,
            fill: themedColors[0]
          }];
        }
      }

      case 'document': {
        const allDocs = currentYearData.documents || [];
        const docsByCategory: Record<string, number> = {};
        
        allDocs.forEach((doc: Record<string, unknown>) => {
          const category = doc.category || 'General';
          docsByCategory[category] = (docsByCategory[category] || 0) + 1;
        });

        return Object.entries(docsByCategory).map(([category, count], index) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: count as number,
          fill: themedColors[index % themedColors.length]
        }));
      }

      case 'revenue': {
        const revenueData = currentYearData.budget?.total_revenue || currentYearData.revenue;
        if (!revenueData) return [];

        return [{
          name: 'Ingresos',
          value: revenueData,
          fill: themedColors[0]
        }];
      }

      case 'debt': {
        const debtData = currentYearData.budget?.debt || currentYearData.debt;
        if (!debtData) return [];

        if (Array.isArray(debtData)) {
          return debtData.map((item: any, index: number) => ({
            name: item.debt_type || item.descripcion || item.tipo || 'Deuda',
            value: parseFloat(item.amount || item.monto || item.value || 0),
            fill: themedColors[index % themedColors.length]
          }));
        } else {
          // If debt data is a single object
          return [{
            name: debtData.debt_type || debtData.descripcion || 'Deuda Total',
            value: parseFloat(debtData.amount || debtData.total || 0),
            fill: themedColors[0]
          }];
        }
      }

      case 'salary': {
        const salaryData = currentYearData.salaries;
        if (!salaryData) return [];

        if (Array.isArray(salaryData)) {
          const positionGroups: Record<string, any> = {};
          salaryData.forEach((pos: Record<string, unknown>) => {
            const category = pos.category || pos.area || pos.departamento || 'General';
            if (!positionGroups[category]) {
              positionGroups[category] = { employees: 0, totalSalary: 0, count: 0 };
            }
            const employees = parseFloat(pos.employeeCount || pos.cantidad || 1);
            const salary = parseFloat(pos.grossSalary || pos.sueldo_bruto || pos.salario || 0);

            positionGroups[category].employees += employees;
            positionGroups[category].totalSalary += salary * employees;
            positionGroups[category].count += employees;
          });

          return Object.entries(positionGroups).map(([category, data]: [string, any], index: number) => ({
            name: category,
            employees: data.employees,
            avgSalary: data.count > 0 ? data.totalSalary / data.count : 0,
            fill: themedColors[index % themedColors.length]
          }));
        } else if (salaryData.categories) {
          // If salary data is grouped by category
          return Object.entries(salaryData.categories).map(([name, item]: [string, any], index: number) => ({
            name: name,
            avgSalary: parseFloat(item.avg_salary || item.promedio || 0),
            employees: parseInt(item.employee_count || item.cantidad || 0),
            fill: themedColors[index % themedColors.length]
          }));
        } else {
          // Single salary data
          return [{
            name: 'Salarios',
            avgSalary: parseFloat(salaryData.avg_salary || salaryData.promedio || 0),
            employees: parseInt(salaryData.employee_count || salaryData.total_employees || 0),
            fill: themedColors[0]
          }];
        }
      }

      case 'investment': {
        const investmentData = currentYearData.budget?.investment || currentYearData.investment;
        if (!investmentData) return [];

        if (Array.isArray(investmentData)) {
          return investmentData.map((inv: any, index: number) => ({
            name: inv.description || inv.name || 'Inversión',
            value: parseFloat(inv.net_value || inv.value || 0),
            fill: themedColors[index % themedColors.length]
          }));
        } else {
          // If investment data is a single object
          return [{
            name: investmentData.description || investmentData.name || 'Inversión Total',
            value: parseFloat(investmentData.net_value || investmentData.value || 0),
            fill: themedColors[0]
          }];
        }
      }

      case 'treasury': {
        const treasuryData = currentYearData.budget?.treasury || currentYearData.treasury;
        if (!treasuryData) return [];

        if (treasuryData.movements) {
          const categories: Record<string, number> = {};
          treasuryData.movements.forEach((movement: Record<string, unknown>) => {
            const category = movement.category || movement.tipo || 'General';
            categories[category] = (categories[category] || 0) + Math.abs(parseFloat(movement.amount || movement.monto || 0));
          });

          return Object.entries(categories).map(([name, amount], index) => ({
            name: name,
            value: amount,
            fill: themedColors[index % themedColors.length]
          }));
        } else {
          // Single treasury data
          return [{
            name: 'Tesorería',
            value: parseFloat(treasuryData.amount || treasuryData.total || 0),
            fill: themedColors[0]
          }];
        }
      }

      case 'contract': {
        const contractData = currentYearData.contracts;
        if (!contractData) return [];

        if (Array.isArray(contractData)) {
          return contractData.map((item: any, index: number) => ({
            name: item.title || item.description || `Contrato ${index + 1}`,
            value: parseFloat(item.amount || 0),
            fill: themedColors[index % themedColors.length]
          }));
        } else {
          // Single contract data
          return [{
            name: 'Contratos',
            value: parseFloat(contractData.total_amount || contractData.total || 0),
            fill: themedColors[0]
          }];
        }
      }

      case 'property': {
        const propertyData = currentYearData.property_declarations;
        if (!propertyData) return [];

        if (Array.isArray(propertyData)) {
          return propertyData.map((item: any, index: number) => ({
            name: item.owner || `Declaración ${index + 1}`,
            value: 1, // Just count the declarations
            fill: themedColors[index % themedColors.length]
          }));
        } else {
          // Single property data
          return [{
            name: 'Declaraciones Patrimoniales',
            value: parseInt(propertyData.count || propertyData.total || 0),
            fill: themedColors[0]
          }];
        }
      }

      default:
        return [];
    }
  }, [type, currentYearData, themedColors, budgetHistoricalData, contractsHistoricalData, salariesHistoricalData, documentsHistoricalData, debtHistoricalData, treasuryHistoricalData]);

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No hay datos disponibles para mostrar</p>
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
                dataKey={type.includes('-trend') ? "year" : "name"} 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280"
                angle={type.includes('-trend') ? 0 : -45}
                textAnchor={type.includes('-trend') ? "middle" : "end"}
                height={type.includes('-trend') ? 40 : 60}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280"
                tickFormatter={(value) => {
                  if (type === 'salary' || type === 'salary-trend') return value.toString();
                  return value > 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`;
                }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (type === 'salary' || type === 'salary-trend') {
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
                  <Bar dataKey="budgeted" name="Presupuestado" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="executed" name="Ejecutado" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                </>
              ) : type === 'budget-trend' ? (
                <>
                  <Bar dataKey="budget_total" name="Presupuesto Total" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="executed_total" name="Ejecutado Total" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                </>
              ) : type === 'salary' ? (
                <Bar dataKey="avgSalary" name="Salario Promedio" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              ) : type === 'salary-trend' ? (
                <>
                  <Bar dataKey="total_employees" name="Total Empleados" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="average_salary" name="Salario Promedio" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                </>
              ) : type === 'treasury' ? (
                <Bar dataKey="value" name="Monto" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              ) : type === 'treasury-trend' ? (
                <>
                  <Bar dataKey="total_revenue" name="Ingresos Totales" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_expenses" name="Gastos Totales" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                </>
              ) : type === 'contract-trend' ? (
                <>
                  <Bar dataKey="total_contracts" name="Total Contratos" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_amount" name="Monto Total" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                </>
              ) : type === 'debt-trend' ? (
                <Bar dataKey="total_debt" name="Deuda Total" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              ) : type === 'document-trend' ? (
                <Bar dataKey="total_documents" name="Total Documentos" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              ) : (
                <Bar dataKey="value" name="Valor" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      } // Added closing curly brace
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
                fill={theme.palette.primary.main} // Use primary color for default pie fill
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || themedColors[index % themedColors.length]} />
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
              <XAxis 
                dataKey={type.includes('-trend') ? "year" : "name"} 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280" 
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip 
                formatter={(value, name) => {
                  if (type === 'salary' || type === 'salary-trend') {
                    return [value, name];
                  }
                  return [formatCurrencyARS(Number(value)), name];
                }} 
              />
              <Legend />
              {type === 'budget-trend' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="budget_total" 
                    name="Presupuesto Total"
                    stroke={theme.palette.primary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="executed_total" 
                    name="Ejecutado Total"
                    stroke={theme.palette.secondary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: theme.palette.secondary.main, strokeWidth: 2, fill: '#fff' }}
                  />
                </>
              ) : type === 'salary-trend' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="average_salary" 
                    name="Salario Promedio"
                    stroke={theme.palette.primary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_employees" 
                    name="Total Empleados"
                    stroke={theme.palette.secondary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: theme.palette.secondary.main, strokeWidth: 2, fill: '#fff' }}
                  />
                </>
              ) : type === 'treasury-trend' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="total_revenue" 
                    name="Ingresos Totales"
                    stroke={theme.palette.primary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_expenses" 
                    name="Gastos Totales"
                    stroke={theme.palette.secondary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: theme.palette.secondary.main, strokeWidth: 2, fill: '#fff' }}
                  />
                </>
              ) : type === 'contract-trend' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="total_contracts" 
                    name="Total Contratos"
                    stroke={theme.palette.primary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_amount" 
                    name="Monto Total"
                    stroke={theme.palette.secondary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: theme.palette.secondary.main, strokeWidth: 2, fill: '#fff' }}
                  />
                </>
              ) : type === 'debt-trend' ? (
                <Line 
                  type="monotone" 
                  dataKey="total_debt" 
                  name="Deuda Total"
                  stroke={theme.palette.primary.main} 
                  strokeWidth={3}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2, fill: '#fff' }}
                />
              ) : type === 'document-trend' ? (
                <Line 
                  type="monotone" 
                  dataKey="total_documents" 
                  name="Total Documentos"
                  stroke={theme.palette.primary.main} 
                  strokeWidth={3}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2, fill: '#fff' }}
                />
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={3}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2, fill: '#fff' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      } // Added closing curly brace
      case 'area': {
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey={type.includes('-trend') ? "year" : "name"} 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280" 
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip 
                formatter={(value, name) => {
                  if (type === 'salary' || type === 'salary-trend') {
                    return [value, name];
                  }
                  return [formatCurrencyARS(Number(value)), name];
                }}
              />
              {type === 'budget-trend' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="budget_total"
                    name="Presupuesto Total"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    fill={theme.palette.primary.light} 
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="executed_total"
                    name="Ejecutado Total"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    fill={theme.palette.secondary.light} 
                    fillOpacity={0.6}
                  />
                </>
              ) : type === 'salary-trend' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="average_salary"
                    name="Salario Promedio"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    fill={theme.palette.primary.light} 
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="total_employees"
                    name="Total Empleados"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    fill={theme.palette.secondary.light} 
                    fillOpacity={0.6}
                  />
                </>
              ) : type === 'treasury-trend' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="total_revenue"
                    name="Ingresos Totales"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    fill={theme.palette.primary.light} 
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="total_expenses"
                    name="Gastos Totales"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    fill={theme.palette.secondary.light} 
                    fillOpacity={0.6}
                  />
                </>
              ) : type === 'contract-trend' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="total_contracts"
                    name="Total Contratos"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    fill={theme.palette.primary.light} 
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="total_amount"
                    name="Monto Total"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    fill={theme.palette.secondary.light} 
                    fillOpacity={0.6}
                  />
                </>
              ) : type === 'debt-trend' ? (
                <Area
                  type="monotone"
                  dataKey="total_debt"
                  name="Deuda Total"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  fill={theme.palette.primary.light} 
                  fillOpacity={0.6}
                />
              ) : type === 'document-trend' ? (
                <Area
                  type="monotone"
                  dataKey="total_documents"
                  name="Total Documentos"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  fill={theme.palette.primary.light} 
                  fillOpacity={0.6}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  fill={theme.palette.primary.light} 
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
      } // Added closing curly brace
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
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
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
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {chartData.length} elemento{chartData.length !== 1 ? 's' : ''} • {type.includes('-trend') ? 'Serie Histórica' : `Año ${year}`}
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

export default UnifiedChart;