import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { unifiedDataService } from '../../services/UnifiedDataService';

interface SalaryPosition {
  code: string;
  name: string;
  category: string;
  modules: number;
  grossSalary: number;
  netSalary: number;
  somaDeduction: number;
  ipsDeduction: number;
  employeeCount: number;
}

interface SalaryData {
  year: number;
  month: number;
  moduleValue: number;
  totalPayroll: number;
  averageSalary: number;
  positions: SalaryPosition[];
}

const SalaryScaleVisualization: React.FC = () => {
  const [salaryData, setSalaryData] = useState<SalaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadSalaryData();
  }, [selectedYear]);

  const loadSalaryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from your API
      // For now, using simulated data based on your PDF analysis
      const mockData: SalaryData = {
        year: selectedYear,
        month: 9, // September
        moduleValue: 257.01,
        totalPayroll: 2150670000,
        averageSalary: 1300000,
        positions: [
          {
            code: "01.59.01",
            name: "INTENDENTE",
            category: "SUPERIOR",
            modules: 4480,
            grossSalary: 1151404.80,
            netSalary: 946454.75,
            somaDeduction: 55267.43,
            ipsDeduction: 149682.62,
            employeeCount: 1
          },
          {
            code: "01.50.09",
            name: "CONCEJALES/AS",
            category: "SUPERIOR",
            modules: 933.3,
            grossSalary: 239876.00,
            netSalary: 197178.07,
            somaDeduction: 11514.05,
            ipsDeduction: 31183.88,
            employeeCount: 10
          },
          {
            code: "02.53.10",
            name: "DIRECTOR",
            category: "JERARQUICO",
            modules: 1820,
            grossSalary: 467758.20,
            netSalary: 384497.24,
            somaDeduction: 22452.39,
            ipsDeduction: 60808.57,
            employeeCount: 15
          },
          {
            code: "02.45.05",
            name: "SECRETARIO/A",
            category: "JERARQUICO",
            modules: 1540,
            grossSalary: 395805.40,
            netSalary: 325362.43,
            somaDeduction: 19000.00,
            ipsDeduction: 51454.97,
            employeeCount: 8
          },
          {
            code: "03.30.15",
            name: "COORDINADOR/A",
            category: "ADMINISTRATIVO",
            modules: 1120,
            grossSalary: 287851.20,
            netSalary: 236858.02,
            somaDeduction: 13816.86,
            ipsDeduction: 37420.32,
            employeeCount: 12
          },
          {
            code: "04.25.20",
            name: "JEFE/A DE SECTOR",
            category: "ADMINISTRATIVO",
            modules: 840,
            grossSalary: 215888.40,
            netSalary: 177643.51,
            somaDeduction: 10362.64,
            ipsDeduction: 28066.75,
            employeeCount: 20
          },
          {
            code: "05.20.25",
            name: "AGENTE ADMINISTRATIVO",
            category: "GENERAL",
            modules: 560,
            grossSalary: 143925.60,
            netSalary: 118419.01,
            somaDeduction: 6908.43,
            ipsDeduction: 18710.15,
            employeeCount: 45
          },
          {
            code: "06.15.30",
            name: "AUXILIAR ADMINISTRATIVO",
            category: "GENERAL",
            modules: 420,
            grossSalary: 107944.20,
            netSalary: 88814.26,
            somaDeduction: 5181.32,
            ipsDeduction: 14032.62,
            employeeCount: 35
          }
        ]
      };

      setSalaryData(mockData);
    } catch (err) {
      setError('Error al cargar datos salariales');
      console.error('Salary data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos salariales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <Calculator className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button 
          onClick={loadSalaryData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!salaryData) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No hay datos salariales disponibles</h3>
        <p className="mt-1 text-gray-500">No se encontraron datos para el año {selectedYear}</p>
      </div>
    );
  }

  // Prepare data for charts
  const barChartData = salaryData.positions.map(position => ({
    name: position.name,
    Bruto: Math.round(position.grossSalary / 1000),
    Neto: Math.round(position.netSalary / 1000)
  }));

  const pieChartData = salaryData.positions.map(position => ({
    name: position.name,
    value: position.grossSalary,
    employees: position.employeeCount
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Escala Salarial Municipal</h1>
          <p className="mt-2 text-gray-600">
            Análisis detallado de la estructura salarial del municipio de Carmen de Areco {selectedYear}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-500 mr-2" />
            <span className="font-medium text-gray-900">
              Valor del Módulo: {formatCurrency(salaryData.moduleValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Nómina Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(salaryData.totalPayroll)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Empleados</p>
              <p className="text-2xl font-bold text-gray-900">
                {salaryData.positions.reduce((sum, pos) => sum + pos.employeeCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Salario Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(salaryData.averageSalary)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Calculator className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cargos Analizados</p>
              <p className="text-2xl font-bold text-gray-900">
                {salaryData.positions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Salary Comparison Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comparación de Salarios Brutos vs Netos (en miles de ARS)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}K`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}K ARS`, '']}
                  labelFormatter={(name) => name}
                />
                <Legend />
                <Bar dataKey="Bruto" fill="#3B82F6" name="Bruto" />
                <Bar dataKey="Neto" fill="#10B981" name="Neto" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución Salarial por Cargo
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), '']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Salary Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detalle de Escala Salarial {selectedYear}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Módulos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bruto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SOMA (4.8%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IPS (13%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Neto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaryData.positions.map((position, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{position.name}</div>
                    <div className="text-sm text-gray-500">{position.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {position.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {position.employeeCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {position.modules.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(position.grossSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(position.somaDeduction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(position.ipsDeduction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(position.netSalary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          Análisis de la Escala Salarial
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Distribución por Categoría</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Superior: {(salaryData.positions.filter(p => p.category === 'SUPERIOR').length)} cargos</li>
              <li>• Jerárquico: {(salaryData.positions.filter(p => p.category === 'JERARQUICO').length)} cargos</li>
              <li>• Administrativo: {(salaryData.positions.filter(p => p.category === 'ADMINISTRATIVO').length)} cargos</li>
              <li>• General: {(salaryData.positions.filter(p => p.category === 'GENERAL').length)} cargos</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Rangos Salariales</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Más alto: {formatCurrency(Math.max(...salaryData.positions.map(p => p.grossSalary)))}</li>
              <li>• Más bajo: {formatCurrency(Math.min(...salaryData.positions.map(p => p.grossSalary)))}</li>
              <li>• Promedio: {formatCurrency(salaryData.averageSalary)}</li>
              <li>• Total empleados: {salaryData.positions.reduce((sum, pos) => sum + pos.employeeCount, 0)}</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Observaciones</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {salaryData.positions.length} cargos analizados</li>
              <li>• Valor del módulo: {formatCurrency(salaryData.moduleValue)}</li>
              <li>• Nómina total: {formatCurrency(salaryData.totalPayroll)}</li>
              <li>• Deduc. promedio: 17.8%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryScaleVisualization;