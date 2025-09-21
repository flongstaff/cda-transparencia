import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Eye,
  AlertCircle,
  Calendar,
  Building,
  BarChart3,
  Loader2
} from 'lucide-react';
import { useComprehensiveData, useDocumentAnalysis, useFinancialOverview } from '../hooks/useComprehensiveData';
import SalaryAnalysisChart from '../components/charts/SalaryAnalysisChart';
import SalaryScaleVisualization from '../components/salaries/SalaryScaleVisualization';
import PageYearSelector from '../components/selectors/PageYearSelector';
import { formatCurrencyARS } from '../utils/formatters';
import { getBestYearForPage, getAvailableYears } from '../utils/yearConfig';

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
  const [selectedYear, setSelectedYear] = useState<number>(
    getBestYearForPage(new Date().getFullYear(), ['salary'])
  );
  
  // Use comprehensive data hooks with effective year
  const effectiveYear = getBestYearForPage(selectedYear, ['salary']);
  const { loading, error } = useComprehensiveData({ year: effectiveYear });
  const documentData = useDocumentAnalysis({ category: 'Recursos_Humanos' });
  const financialData = useFinancialOverview(selectedYear);

  // Extract salary data from comprehensive sources
  const salaryData: SalaryData | null = financialData?.analysis?.salaryData || null;

  // Generate available years dynamically to match available data
  const availableYears = getAvailableYears();

  // Filter salary-related documents from comprehensive data
  const salaryDocuments = useMemo(() => {
    return (documentData.documents || []).filter(doc => 
      doc.category === 'Recursos_Humanos' || 
      doc.title?.toLowerCase().includes('salarial') ||
      doc.title?.toLowerCase().includes('escala') ||
      doc.title?.toLowerCase().includes('sueldo') ||
      doc.category === 'salaries'
    );
  }, [documentData.documents]);

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
    Object.values(categoryGroups).forEach((group: any) => {
      group.avgSalary = group.totalGross / group.totalEmployees;
    });

    return {
      ...salaryData,
      categoryGroups: Object.values(categoryGroups)
    };
  }, [salaryData]);

  // Calculate total statistics from real data
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
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información salarial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👥 Sueldos y Salarios Municipales
            </h1>
            <p className="text-gray-600">
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
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      {/* General Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Empleados</p>
              <p className="text-2xl font-semibold text-blue-600">{totalStats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Salario Promedio</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrencyARS(totalStats.averageSalary)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Costo Mensual</p>
              <p className="text-2xl font-semibold text-purple-600">
                {formatCurrencyARS(totalStats.totalMonthlyCost)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Costo Anual</p>
              <p className="text-2xl font-semibold text-orange-600">
                {formatCurrencyARS(totalStats.totalAnnualCost)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Value Information */}
      {totalStats.moduleValue > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Escalas Salariales por Categoría</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processedSalaryData.categoryGroups.map((group: any, index: number) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.category}</h3>
                    <p className="text-sm text-gray-600">
                      {group.positions.length} cargo{group.positions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{group.totalEmployees}</p>
                    <p className="text-xs text-gray-500">empleados</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Salario Promedio:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrencyARS(group.avgSalary)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Rango Salarial:</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrencyARS(group.minSalary)} - {formatCurrencyARS(group.maxSalary)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Costo Mensual:</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {formatCurrencyARS(group.totalGross)}
                    </span>
                  </div>
                </div>

                {/* Visual progress bar for salary range */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Mín</span>
                    <span>Promedio</span>
                    <span>Máx</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Cargos:</h4>
                  <div className="space-y-2">
                    {group.positions.map((position: SalaryPosition) => (
                      <div key={position.code} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{position.name}</span>
                          <span className="text-gray-500 ml-2">({position.employeeCount})</span>
                        </div>
                        <span className="text-green-600 font-semibold">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detalle de Cargos y Remuneraciones</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sueldo Bruto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sueldo Neto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Módulos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedSalaryData.positions.map((position) => (
                  <tr key={position.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {position.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {position.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {position.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {position.employeeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrencyARS(position.grossSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatCurrencyARS(position.netSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Documentos de Escalas Salariales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salaryDocuments.map((doc) => (
              <motion.div
                key={doc.id || doc.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl">📄</div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {doc.type?.toUpperCase() || 'DOC'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {doc.title}
                </h3>
                
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
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
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </a>
                  <a
                    href={doc.url}
                    download
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Análisis Salarial</h2>
        <SalaryAnalysisChart year={selectedYear} />
      </div>

      {/* Advanced Salary Scale Visualization with Real Data */}
      <div className="space-y-8">
        <SalaryScaleVisualization />
      </div>

      {/* Legal Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
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