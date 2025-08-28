import React, { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign, Clock, TrendingUp, Building, Users, FileText, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import PowerBIEmbed from '../powerbi/PowerBIEmbed';

interface SalaryIrregularity {
  official_name: string;
  role: string;
  declared_salary: number;
  estimated_fair_salary: number;
  discrepancy_ratio: number;
  year: number;
  evidence: string;
}

interface ProjectIrregularity {
  project_name: string;
  budgeted_amount: number;
  actual_spent: number;
  delay_days: number;
  irregularity_type: string;
  evidence: string;
}

interface BudgetDiscrepancy {
  category: string;
  budgeted_amount: number;
  actual_spent: number;
  difference: number;
  difference_percentage: number;
  year: number;
  evidence: string;
}

interface AuditReport {
  total_irregularities: number;
  salary_irregularities: number;
  project_irregularities: number;
  budget_discrepancies: number;
  summary: string;
}

interface AuditData {
  financial_irregularities: {
    salary_irregularities: SalaryIrregularity[];
    budget_discrepancies: BudgetDiscrepancy[];
    summary: {
      total_irregularities: number;
      high_salary_cases: number;
      budget_discrepancies: number;
    };
  };
  infrastructure_projects: {
    flags: ProjectIrregularity[];
    summary: {
      flagged_projects: number;
      total_budget: number;
    };
  };
  key_findings: Array<{
    finding_type: string;
    severity: string;
    description: string;
    amount: number;
    related_entity: string;
  }>;
  timestamp: string;
}

const FinancialAuditDashboard: React.FC = () => {
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from your API
      // For now, we'll use mock data to demonstrate the UI
      const mockData: AuditData = {
        timestamp: new Date().toISOString(),
        financial_irregularities: {
          salary_irregularities: [
            {
              official_name: "Dr. Juan Pérez",
              role: "Intendente",
              declared_salary: 8500000,
              estimated_fair_salary: 1700000,
              discrepancy_ratio: 5.0,
              year: 2024,
              evidence: "Salary 5.0x higher than average for executive roles"
            },
            {
              official_name: "María González",
              role: "Secretaria de Finanzas",
              declared_salary: 4200000,
              estimated_fair_salary: 1200000,
              discrepancy_ratio: 3.5,
              year: 2024,
              evidence: "Salary 3.5x higher than average for senior_admin roles"
            }
          ],
          budget_discrepancies: [
            {
              category: "Income",
              budgeted_amount: 250000000,
              actual_spent: 180000000,
              difference: 70000000,
              difference_percentage: 0.28,
              year: 2024,
              evidence: "Income 28.0% different from planned"
            },
            {
              category: "Expenses",
              budgeted_amount: 220000000,
              actual_spent: 280000000,
              difference: 60000000,
              difference_percentage: 0.273,
              year: 2024,
              evidence: "Expenses 27.3% different from planned"
            }
          ],
          summary: {
            total_irregularities: 4,
            high_salary_cases: 2,
            budget_discrepancies: 2
          }
        },
        infrastructure_projects: {
          flags: [
            {
              project_name: "Pavimentación Avenida Principal",
              budgeted_amount: 25000000,
              actual_spent: 25000000,
              delay_days: 420,
              irregularity_type: "delayed_completion",
              evidence: "Project delayed by 420 days with early payment"
            },
            {
              project_name: "Parque Municipal Nuevo",
              budgeted_amount: 18000000,
              actual_spent: 18000000,
              delay_days: 365,
              irregularity_type: "delayed_completion",
              evidence: "Project delayed by 365 days with early payment"
            }
          ],
          summary: {
            flagged_projects: 2,
            total_budget: 150000000
          }
        },
        key_findings: [
          {
            finding_type: "High Salary",
            severity: "high",
            description: "Dr. Juan Pérez salary 5.0x average",
            amount: 8500000,
            related_entity: "Dr. Juan Pérez"
          },
          {
            finding_type: "Budget Discrepancy",
            severity: "medium",
            description: "Income 28.0% off budget",
            amount: 70000000,
            related_entity: "Income"
          },
          {
            finding_type: "Project Delay",
            severity: "high",
            description: "Project delayed by 420 days with early payment",
            amount: 25000000,
            related_entity: "Pavimentación Avenida Principal"
          }
        ]
      };
      
      setAuditData(mockData);
    } catch (err) {
      setError('Error al cargar los datos de auditoría');
      console.error('Audit data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de auditoría...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={loadAuditData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            No hay datos de auditoría disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Los datos de auditoría aún no han sido generados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
          🏛️ Panel de Auditoría Financiera
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Seguimiento de irregularidades financieras en el municipio de Carmen de Areco
        </p>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {new Date(auditData.timestamp).toLocaleDateString('es-AR')}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Irregularidades</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {auditData.financial_irregularities.summary.total_irregularities +
                  auditData.infrastructure_projects.summary.flagged_projects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Altos Salarios</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {auditData.financial_irregularities.summary.high_salary_cases}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos Atrasados</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {auditData.infrastructure_projects.summary.flagged_projects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Presupuesto Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(auditData.infrastructure_projects.summary.total_budget)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: <FileText className="h-4 w-4 mr-2" /> },
            { id: 'salaries', label: 'Altos Salarios', icon: <Users className="h-4 w-4 mr-2" /> },
            { id: 'projects', label: 'Proyectos Atrasados', icon: <Building className="h-4 w-4 mr-2" /> },
            { id: 'budget', label: 'Discrepancias Presupuestarias', icon: <TrendingUp className="h-4 w-4 mr-2" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {activeTab === 'overview' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Hallazgos Clave</h2>
            
            <div className="space-y-4">
              {auditData.key_findings.map((finding, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getSeverityColor(finding.severity)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{finding.description}</h3>
                      <p className="text-sm mt-1">{finding.related_entity}</p>
                    </div>
                    <span className="font-semibold">{formatCurrency(finding.amount)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'salaries' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Funcionarios con Altos Salarios</h2>
            
            {auditData.financial_irregularities.salary_irregularities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Funcionario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Salario Declarado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Salario Esperado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Diferencia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {auditData.financial_irregularities.salary_irregularities.map((irregularity, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {irregularity.official_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {irregularity.role}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(irregularity.declared_salary)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(irregularity.estimated_fair_salary)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            {irregularity.discrepancy_ratio.toFixed(1)}x
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No se encontraron altos salarios
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se identificaron funcionarios con salarios significativamente superiores al promedio.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Proyectos de Infraestructura Atrasados</h2>
            
            {auditData.infrastructure_projects.flags.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Proyecto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Presupuesto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Gastado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Atraso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tipo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {auditData.infrastructure_projects.flags.map((project, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {project.project_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(project.budgeted_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(project.actual_spent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            {project.delay_days} días
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {project.irregularity_type === 'delayed_completion' ? 'Atraso' : 'Otro'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No hay proyectos atrasados
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Todos los proyectos de infraestructura están dentro del cronograma previsto.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Discrepancias Presupuestarias</h2>
            
            {auditData.financial_irregularities.budget_discrepancies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Presupuestado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Real
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Diferencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Porcentaje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {auditData.financial_irregularities.budget_discrepancies.map((discrepancy, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {discrepancy.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(discrepancy.budgeted_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(discrepancy.actual_spent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            discrepancy.difference > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {formatCurrency(Math.abs(discrepancy.difference))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            Math.abs(discrepancy.difference_percentage) > 0.2 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {Math.abs(discrepancy.difference_percentage * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No hay discrepancias presupuestarias significativas
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  La ejecución presupuestaria se encuentra dentro de los márgenes aceptables.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Power BI Data Integration */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Datos de Power BI</h2>
        <PowerBIEmbed 
          title="Reporte de Transparencia Municipal" 
          height={400}
          showDataDashboardLink={true}
        />
      </div>

      {/* Information Banner */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Información Importante
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Esta información es generada automáticamente mediante análisis de documentos oficiales del municipio.
                Los hallazgos presentados son indicadores de posibles irregularidades que requieren investigación adicional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAuditDashboard;