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
  BarChart3
} from 'lucide-react';
import { useTransparencyData } from '../hooks/useTransparencyData';
import SalaryAnalysisChart from '../components/charts/SalaryAnalysisChart';
import PageYearSelector from '../components/selectors/PageYearSelector';
import { formatCurrencyARS } from '../utils/formatters';

interface SalaryScale {
  id: string;
  title: string;
  category: string;
  filename: string;
  url: string;
  size_mb: number;
  period: string;
}

const Salaries: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Use unified data hook
  const {
    loading,
    error,
    documents,
    financialOverview
  } = useTransparencyData(selectedYear);

  // Generate available years dynamically to match available data
  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // Filter salary-related documents
  const salaryDocuments = useMemo(() => {
    return (documents || []).filter(doc => 
      doc.category === 'salaries' || 
      doc.title.toLowerCase().includes('salarial') ||
      doc.title.toLowerCase().includes('escala')
    );
  }, [documents]);

  // Mock salary scale data based on typical Argentine municipal structure
  const salaryScales = [
    {
      category: 'Planta Permanente',
      description: 'Personal de planta permanente del municipio',
      employees: 180,
      avgSalary: 450000,
      minSalary: 280000,
      maxSalary: 850000
    },
    {
      category: 'Planta Transitoria',
      description: 'Personal contratado transitoriamente',
      employees: 45,
      avgSalary: 320000,
      minSalary: 250000,
      maxSalary: 480000
    },
    {
      category: 'Funcionarios',
      description: 'Funcionarios políticos y de confianza',
      employees: 12,
      avgSalary: 680000,
      minSalary: 450000,
      maxSalary: 1200000
    },
    {
      category: 'Contratados',
      description: 'Personal contratado por servicios específicos',
      employees: 28,
      avgSalary: 380000,
      minSalary: 220000,
      maxSalary: 560000
    }
  ];

  // Calculate total statistics
  const totalStats = useMemo(() => {
    const totalEmployees = salaryScales.reduce((sum, scale) => sum + scale.employees, 0);
    const totalSalaries = salaryScales.reduce((sum, scale) => sum + (scale.avgSalary * scale.employees), 0);
    
    return {
      totalEmployees,
      averageSalary: totalSalaries / totalEmployees,
      totalMonthlyCost: totalSalaries,
      totalAnnualCost: totalSalaries * 13 // Including aguinaldo
    };
  }, [salaryScales]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

      {/* Salary Scales by Category */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Escalas Salariales por Categoría</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {salaryScales.map((scale, index) => (
            <motion.div
              key={scale.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{scale.category}</h3>
                  <p className="text-sm text-gray-600">{scale.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{scale.employees}</p>
                  <p className="text-xs text-gray-500">empleados</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Salario Promedio:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrencyARS(scale.avgSalary)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Rango Salarial:</span>
                  <span className="text-sm text-gray-600">
                    {formatCurrencyARS(scale.minSalary)} - {formatCurrencyARS(scale.maxSalary)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Costo Mensual:</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {formatCurrencyARS(scale.avgSalary * scale.employees)}
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
                      width: `${((scale.avgSalary - scale.minSalary) / (scale.maxSalary - scale.minSalary)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Salary Documents */}
      {salaryDocuments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Documentos de Escalas Salariales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salaryDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl">📄</div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {doc.type.toUpperCase()}
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
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{doc.size_mb.toFixed(1)} MB</span>
                  </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salaries;