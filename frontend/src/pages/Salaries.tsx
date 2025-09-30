import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Eye,
  AlertCircle,
  Building,
  BarChart3,
  Loader2,
  Download
} from 'lucide-react';
import SalaryAnalysisChart from '../components/charts/SalaryAnalysisChart';
import SalaryScaleVisualization from '../components/data-display/SalaryScaleVisualization';
import PageYearSelector from '../components/forms/PageYearSelector';
import { formatCurrencyARS } from '../utils/formatters';
import { useMasterData } from '../hooks/useMasterData';

interface SalaryPosition {
  code: string;
  name: string;
  category: string;
  modules: number;
  grossSalary: number;
  somaDeduction: number;
  ipsDeduction: number;
  netSalary: number;
  employeeCount: number;
}

interface SalaryData {
  year: number;
  month: number;
  moduleValue: number;
  totalPayroll: number;
  employeeCount: number;
  positions: SalaryPosition[];
}

const Salaries: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Use unified master data service
  const {
    masterData,
    currentBudget,
    currentDocuments,
    currentTreasury,
    currentContracts,
    currentSalaries,
    loading,
    error,
    totalDocuments,
    availableYears,
    categories,
    dataSourcesActive,
    refetch,
    switchYear
  } = useMasterData(selectedYear);

  // Process salary data from comprehensive data service
  const salaryData: SalaryData | null = useMemo(() => {
    const yearSalaryData = currentSalaries;
    if (!yearSalaryData) return null;

    // Extract data from real data structure
    const totalPayroll = yearSalaryData.totalPayroll || 0;
    const employeeCount = yearSalaryData.employeeCount || 0;
    const moduleValue = yearSalaryData.moduleValue || 0;
    const allPositions: SalaryPosition[] = [];

    if (yearSalaryData.positions && Array.isArray(yearSalaryData.positions)) {
      yearSalaryData.positions.forEach((props: Record<string, unknown>) => {
        const position: SalaryPosition = {
          code: pos.code || pos.codigo || 'N/A',
          name: pos.name || pos.nombre || pos.puesto || 'Posición sin nombre',
          category: pos.category || pos.categoria || pos.area || 'General',
          modules: parseFloat(pos.modules || pos.modulos || 0),
          grossSalary: parseFloat(pos.grossSalary || pos.sueldo_bruto || pos.salario_bruto || 0),
          somaDeduction: parseFloat(pos.somaDeduction || pos.descuento_soma || 0),
          ipsDeduction: parseFloat(pos.ipsDeduction || pos.descuento_ips || 0),
          netSalary: parseFloat(pos.netSalary || pos.sueldo_neto || pos.salario_neto || 0),
          employeeCount: parseFloat(pos.employeeCount || pos.cantidad_empleados || pos.employees || 1)
        };
        allPositions.push(position);
      });
    }

    return {
      year: selectedYear,
      month: yearSalaryData.month || new Date().getMonth() + 1,
      moduleValue,
      totalPayroll,
      employeeCount,
      positions: allPositions
    };
  }, [currentSalaries, selectedYear]);

  // Filter salary-related documents from comprehensive data
  const salaryDocuments = useMemo(() => {
    if (!currentDocuments) return [];
    const allDocs = currentDocuments;
    return allDocs.filter(doc =>
      doc.category?.toLowerCase().includes('recursos') ||
      doc.category?.toLowerCase().includes('humanos') ||
      doc.category?.toLowerCase().includes('salario') ||
      doc.title?.toLowerCase().includes('salarial') ||
      doc.title?.toLowerCase().includes('escala') ||
      doc.title?.toLowerCase().includes('salarios') ||
      doc.title?.toLowerCase().includes('sueldo') ||
      doc.category === 'salaries'
    );
  }, [currentDocuments]);

  // Process salary data from organized files
  const processedSalaryData = useMemo(() => {
    if (!salaryData) return null;

    // Group positions by category
    const categoryGroups = salaryData.positions.reduce((acc, position) => {
      if (!acc[position.category]) {
        acc[position.category] = {
          category: position.category,
          positions: [],
          totalEmployees: 0,
          totalGross: 0,
          avgSalary: 0,
          minSalary: Number.MAX_SAFE_INTEGER,
          maxSalary: 0
        };
      }
      
      acc[position.category].positions.push(position);
      acc[position.category].totalEmployees += position.employeeCount;
      acc[position.category].totalGross += (position.grossSalary * position.employeeCount);
      acc[position.category].minSalary = Math.min(acc[position.category].minSalary, position.grossSalary);
      acc[position.category].maxSalary = Math.max(acc[position.category].maxSalary, position.grossSalary);
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(categoryGroups).forEach((props: Record<string, unknown>) => {
      group.avgSalary = group.totalGross / group.totalEmployees;
    });

    return {
      ...salaryData,
      categoryGroups: Object.values(categoryGroups)
    };
  }, [salaryData]);

  // Calculate total statistics from comprehensive data
  const totalStats = useMemo(() => {
    if (!processedSalaryData) {
      return {
        totalEmployees: 0,
        averageSalary: 0,
        totalMonthlyCost: 0,
        totalAnnualCost: 0,
        moduleValue: 0
      };
    }

    const totalEmployees = processedSalaryData.employeeCount;
    const averageSalary = processedSalaryData.totalPayroll / totalEmployees;
    
    return {
      totalEmployees,
      averageSalary,
      totalMonthlyCost: processedSalaryData.totalPayroll,
      totalAnnualCost: processedSalaryData.totalPayroll * 13, // Including aguinaldo
      moduleValue: processedSalaryData.moduleValue
    };
  }, [processedSalaryData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">Cargando información salarial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2">
              👥 Sueldos y Salarios Municipales
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
              Información sobre escalas salariales y remuneraciones del personal municipal para {selectedYear}
              {processedSalaryData && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Datos reales de {processedSalaryData.year}/{processedSalaryData.month}
                </span>
              )}
            </p>
          </div>
          <PageYearSelector
            availableYears={availableYears}
            selectedYear={selectedYear}
            onYearChange={switchYear}
          />
        </div>
      </div>

      {/* General Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Total Empleados</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{totalStats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Salario Promedio</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {formatCurrencyARS(totalStats.averageSalary)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Costo Mensual</p>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {formatCurrencyARS(totalStats.totalMonthlyCost)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">Costo Anual</p>
              <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
                {formatCurrencyARS(totalStats.totalAnnualCost)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Value Information */}
      {totalStats.moduleValue > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-medium text-blue-900">Valor del Módulo</span>
            </div>
            <span className="text-lg font-semibold text-blue-700">
              ${totalStats.moduleValue.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Base de cálculo para las remuneraciones municipales
          </p>
        </div>
      )}

      {/* Salary Scales by Category - Real Data */}
      {processedSalaryData && (
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Escalas Salariales por Categoría</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processedSalaryData.categoryGroups.map((group: any, index: number) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 dark:border-dark-border rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{group.category}</h3>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
                      {group.positions.length} cargo{group.positions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{group.totalEmployees}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">empleados</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary">Salario Promedio:</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrencyARS(group.avgSalary)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary">Rango Salarial:</span>
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
                      {formatCurrencyARS(group.minSalary)} - {formatCurrencyARS(group.maxSalary)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary">Costo Mensual:</span>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      {formatCurrencyARS(group.totalGross)}
                    </span>
                  </div>
                </div>

                {/* Visual progress bar for salary range */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mb-1">
                    <span>Mín</span>
                    <span>Promedio</span>
                    <span>Máx</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-surface-alt dark:bg-dark-border rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${((group.avgSalary - group.minSalary) / (group.maxSalary - group.minSalary)) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Individual Positions */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary dark:text-dark-text-secondary mb-2">Cargos:</h4>
                  <div className="space-y-2">
                    {group.positions.map((position: SalaryPosition) => (
                      <div key={position.code} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{position.name}</span>
                          <span className="text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary ml-2">({position.employeeCount})</span>
                        </div>
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          {formatCurrencyARS(position.grossSalary)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Position Information */}
      {processedSalaryData && (
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Detalle de Cargos y Remuneraciones</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Sueldo Bruto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Sueldo Neto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                    Módulos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
                {processedSalaryData.positions.map((position) => (
                  <tr key={position.code} className="hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                      {position.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
                      {position.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {position.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
                      {position.employeeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrencyARS(position.grossSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                      {formatCurrencyARS(position.netSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary">
                      {position.modules.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Salary Documents */}
      {salaryDocuments.length > 0 && (
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-6">Documentos de Escalas Salariales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salaryDocuments.map((doc) => (
              <motion.div
                key={doc.id || doc.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl">📄</div>
                  <span className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt px-2 py-1 rounded">
                    {doc.type?.toUpperCase() || 'DOC'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-2 line-clamp-2">
                  {doc.title}
                </h3>
                
                <div className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary space-y-1 mb-4">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    <span>{selectedYear}</span>
                  </div>
                  {doc.size_mb && (
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{doc.size_mb.toFixed(1)} MB</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </a>
                  <a
                    href={doc.url}
                    download
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-background dark:bg-dark-background rounded-lg hover:bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Salary Analysis Chart */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary mb-4">Análisis Salarial</h2>
        <SalaryAnalysisChart year={selectedYear} />
      </div>

      {/* Advanced Salary Scale Visualization with Real Data */}
      <div className="space-y-8">
        <SalaryScaleVisualization />
      </div>

      {/* Legal Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <div className="flex items-start">
          <Building className="h-6 w-6 text-blue-500 mt-1 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Información Legal sobre Salarios Municipales
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                • Los salarios municipales se ajustan según las paritarias establecidas por la provincia de Buenos Aires.
              </p>
              <p>
                • Las escalas salariales incluyen básico, adicionales por antigüedad, zona, y otros conceptos según convenio.
              </p>
              <p>
                • Los funcionarios políticos perciben sus remuneraciones según lo establecido en las ordenanzas municipales.
              </p>
              <p>
                • Toda la información salarial está disponible según la Ley de Acceso a la Información Pública.
              </p>
              <p>
                • Las deducciones incluyen aportes jubilatorios (IPS) y obra social municipal (SOMA).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salaries;