/**
 * COMPONENT SHOWCASE - ALL YOUR COMPONENTS IN ONE PLACE
 *
 * This component systematically displays ALL your existing components:
 * - 24+ Chart components
 * - Multiple viewers (PDF, JSON, Markdown, Office, etc.)
 * - Dashboards and analysis tools
 * - Interactive data visualization
 *
 * Dynamically loads components based on available data
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Eye,
  Settings,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Import ALL your chart components
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import BudgetAnalysisChartEnhanced from '../components/charts/BudgetAnalysisChartEnhanced';
import TreasuryAnalysisChart from '../components/charts/TreasuryAnalysisChart';
import ContractAnalysisChart from '../components/charts/ContractAnalysisChart';
import DebtAnalysisChart from '../components/charts/DebtAnalysisChart';
import UnifiedChart from '../components/charts/UnifiedChart';
import ComprehensiveChart from '../components/charts/ComprehensiveChart';
import YearlyComparisonChart from '../components/charts/YearlyComparisonChart';

// Import advanced charts
import FunnelChart from '../components/charts/FunnelChart';
import RadarChart from '../components/charts/RadarChart';
import TreemapChart from '../components/charts/TreemapChart';
import WaterfallChart from '../components/charts/WaterfallChart';

// Import viewers
// PDFViewer component not found - comment out import
// import PDFViewer from './viewers/PDFViewer';
import JSONViewer from '../components/viewers/JSONViewer';
import MarkdownViewer from '../components/viewers/MarkdownViewer';
import OfficeViewer from '../components/viewers/OfficeViewer';
import UniversalDocumentViewer from '../components/viewers/UniversalDocumentViewer';

// Import dashboards
import TransparencyDashboard from './TransparencyDashboard';
import FinancialDashboard from './FinancialDashboard';
import EnhancedFinancialDashboard from './EnhancedFinancialDashboard';

// Import specialized components
import SalaryScaleVisualization from '../components/data-display/SalaryScaleVisualization';
import FinancialAuditDashboard from './FinancialAuditDashboard';
import AnomalyDashboard from './AnomalyDashboard';

import { useMasterData } from '../hooks/useMasterData';

interface ComponentCategory {
  name: string;
  icon: React.ReactNode;
  components: ComponentInfo[];
}

interface ComponentInfo {
  name: string;
  component: React.ComponentType<any>;
  description: string;
  dataRequirements: string[];
  status: 'ready' | 'loading' | 'error';
}

const ComponentShowcase: React.FC<{ selectedYear: number }> = ({ selectedYear }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['charts']);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  // 🚀 Use the unified master data service
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

  // Extract data from masterData for component showcase
  const completeData = masterData;
  const data = currentBudget;
  const metrics = {
    totalDocuments: totalDocuments,
    availableYears: availableYears,
    categories: categories,
    dataSourcesActive: dataSourcesActive,
    // Add other metrics as needed
  };

  const _clearCache = () => {
    refetch();
  };

  // Organize ALL your components by category
  const componentCategories: ComponentCategory[] = useMemo(() => {
    const hasData = !!data;
    const hasBudget = !!data?.budget;
    const hasSalaries = !!data?.salaries;
    const hasContracts = !!data?.contracts?.length;
    const hasDocuments = !!data?.documents?.length;

    return [
      {
        name: 'Financial Charts',
        icon: <BarChart3 className="w-5 h-5" />,
        components: [
          {
            name: 'BudgetAnalysisChart',
            component: BudgetAnalysisChart,
            description: 'Comprehensive budget analysis with execution rates',
            dataRequirements: ['budget'],
            status: hasBudget ? 'ready' : 'error'
          },
          {
            name: 'BudgetAnalysisChartEnhanced',
            component: BudgetAnalysisChartEnhanced,
            description: 'Enhanced budget visualization with trends',
            dataRequirements: ['budget'],
            status: hasBudget ? 'ready' : 'error'
          },
          {
            name: 'TreasuryAnalysisChart',
            component: TreasuryAnalysisChart,
            description: 'Revenue and treasury analysis',
            dataRequirements: ['budget'],
            status: hasBudget ? 'ready' : 'error'
          },
          {
            name: 'ContractAnalysisChart',
            component: ContractAnalysisChart,
            description: 'Contract and procurement analysis',
            dataRequirements: ['contracts'],
            status: hasContracts ? 'ready' : 'error'
          },
          {
            name: 'DebtAnalysisChart',
            component: DebtAnalysisChart,
            description: 'Municipal debt analysis',
            dataRequirements: ['budget'],
            status: hasBudget ? 'ready' : 'error'
          }
        ]
      },
      {
        name: 'Advanced Charts',
        icon: <PieChart className="w-5 h-5" />,
        components: [
          {
            name: 'UnifiedChart',
            component: UnifiedChart,
            description: 'Unified visualization system',
            dataRequirements: ['any'],
            status: hasData ? 'ready' : 'error'
          },
          {
            name: 'ComprehensiveChart',
            component: ComprehensiveChart,
            description: 'Multi-dimensional data visualization',
            dataRequirements: ['any'],
            status: hasData ? 'ready' : 'error'
          },
          {
            name: 'FunnelChart',
            component: FunnelChart,
            description: 'Budget execution funnel analysis',
            dataRequirements: ['budget'],
            status: hasBudget ? 'ready' : 'error'
          },
          {
            name: 'TreemapChart',
            component: TreemapChart,
            description: 'Hierarchical budget visualization',
            dataRequirements: ['budget'],
            status: hasBudget ? 'ready' : 'error'
          },
          {
            name: 'WaterfallChart',
            component: WaterfallChart,
            description: 'Budget flow waterfall analysis',
            dataRequirements: ['budget'],
            status: hasBudget ? 'ready' : 'error'
          },
          {
            name: 'RadarChart',
            component: RadarChart,
            description: 'Multi-metric performance radar',
            dataRequirements: ['budget', 'salaries'],
            status: hasBudget && hasSalaries ? 'ready' : 'error'
          }
        ]
      },
      {
        name: 'Document Viewers',
        icon: <FileText className="w-5 h-5" />,
        components: [
          {
            name: 'JSONViewer',
            component: JSONViewer,
            description: 'JSON data structure viewer',
            dataRequirements: ['any'],
            status: hasData ? 'ready' : 'error'
          },
          {
            name: 'MarkdownViewer',
            component: MarkdownViewer,
            description: 'Markdown document renderer',
            dataRequirements: ['documents'],
            status: hasDocuments ? 'ready' : 'error'
          },
          {
            name: 'OfficeViewer',
            component: OfficeViewer,
            description: 'Office document viewer (Excel, Word)',
            dataRequirements: ['documents'],
            status: hasDocuments ? 'ready' : 'error'
          },
          {
            name: 'UniversalDocumentViewer',
            component: UniversalDocumentViewer,
            description: 'Universal document viewer for all formats',
            dataRequirements: ['documents'],
            status: hasDocuments ? 'ready' : 'error'
          }
        ]
      },
      {
        name: 'Dashboards',
        icon: <TrendingUp className="w-5 h-5" />,
        components: [
          {
            name: 'TransparencyDashboard',
            component: TransparencyDashboard,
            description: 'Complete transparency overview',
            dataRequirements: ['any'],
            status: hasData ? 'ready' : 'error'
          },
          {
            name: 'FinancialDashboard',
            component: FinancialDashboard,
            description: 'Financial analysis dashboard',
            dataRequirements: ['budget'],
            status: hasBudget ? 'ready' : 'error'
          },
          {
            name: 'EnhancedFinancialDashboard',
            component: EnhancedFinancialDashboard,
            description: 'Advanced financial analytics',
            dataRequirements: ['budget', 'salaries'],
            status: hasBudget ? 'ready' : 'error'
          },
          {
            name: 'FinancialAuditDashboard',
            component: FinancialAuditDashboard,
            description: 'Financial audit and compliance',
            dataRequirements: ['budget', 'contracts'],
            status: hasBudget ? 'ready' : 'error'
          },
          {
            name: 'AnomalyDashboard',
            component: AnomalyDashboard,
            description: 'Anomaly detection and analysis',
            dataRequirements: ['budget', 'contracts'],
            status: hasBudget ? 'ready' : 'error'
          }
        ]
      },
      {
        name: 'Specialized Components',
        icon: <Settings className="w-5 h-5" />,
        components: [
          {
            name: 'SalaryScaleVisualization',
            component: SalaryScaleVisualization,
            description: 'Interactive salary scale visualization',
            dataRequirements: ['salaries'],
            status: hasSalaries ? 'ready' : 'error'
          },
          {
            name: 'YearlyComparisonChart',
            component: YearlyComparisonChart,
            description: 'Multi-year comparison analysis',
            dataRequirements: ['budget'],
            status: hasBudget ? 'ready' : 'error'
          }
        ]
      }
    ];
  }, [selectedYear]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const renderComponent = (componentInfo: ComponentInfo) => {
    const { component: Component, status } = componentInfo;

    if (status === 'error') {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
          <p className="text-red-700">No hay datos disponibles para este componente</p>
          <p className="text-sm text-red-600">Requires: {componentInfo.dataRequirements.join(', ')}</p>
        </div>
      );
    }

    try {
      return (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <Component
            year={selectedYear}
            data={data}
            completeData={completeData}
          />
        </div>
      );
    } catch (error) {
      return (
        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <AlertCircle className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-yellow-700">Component rendering error</p>
          <p className="text-sm text-yellow-600">{error.message}</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
        <p>Loading component showcase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
        <p className="text-red-700">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🎯 Muestra Completa de Componentes - {selectedYear}
        </h2>
        <p className="text-gray-600 mb-4">
          Mostrando todos los {componentCategories.reduce((acc, cat) => acc + cat.components.length, 0)} componentes
          de tu sistema integral
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {componentCategories.map(category => {
            const readyCount = category.components.filter(c => c.status === 'ready').length;
            const totalCount = category.components.length;
            return (
              <div key={category.name} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-2">
                  {category.icon}
                  <span className="ml-2 font-medium">{category.name}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {readyCount}/{totalCount} ready
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Component Categories */}
      {componentCategories.map((category) => (
        <div key={category.name} className="bg-white rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => toggleCategory(category.name)}
            className="w-full flex items-center justify-between p-4 border-b border-gray-200"
          >
            <div className="flex items-center">
              {category.icon}
              <span className="ml-3 text-lg font-semibold">{category.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({category.components.filter(c => c.status === 'ready').length}/{category.components.length})
              </span>
            </div>
            {expandedCategories.includes(category.name) ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          <AnimatePresence>
            {expandedCategories.includes(category.name) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 space-y-4"
              >
                {category.components.map((componentInfo) => (
                  <div key={componentInfo.name} className="border border-gray-200 rounded-lg">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold flex items-center">
                            {componentInfo.name}
                            {componentInfo.status === 'ready' && (
                              <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                            )}
                            {componentInfo.status === 'error' && (
                              <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">{componentInfo.description}</p>
                          <p className="text-xs text-gray-500">
                            Requires: {componentInfo.dataRequirements.join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setSelectedComponent(
                              selectedComponent === componentInfo.name ? null : componentInfo.name
                            )
                          }
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          {selectedComponent === componentInfo.name ? 'Ocultar' : 'Mostrar'}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedComponent === componentInfo.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="p-4"
                        >
                          {renderComponent(componentInfo)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default ComponentShowcase;