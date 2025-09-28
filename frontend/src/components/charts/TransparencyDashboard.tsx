/**
 * Transparency & Accountability Dashboard Component
 * Combines multiple data sources into an interactive dashboard with tabs
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building, 
  Shield, 
  FileText,
  Calendar,
  Eye
} from 'lucide-react';
import BudgetExecutionChartWrapper from './BudgetExecutionChartWrapper';
import QuarterlyExecutionChart from './QuarterlyExecutionChart';
import ProgrammaticPerformanceChart from './ProgrammaticPerformanceChart';
import GenderBudgetingChart from './GenderBudgetingChart';
import WaterfallExecutionChart from './WaterfallExecutionChart';

// Dashboard section interface
interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Props for the Transparency Dashboard component
interface TransparencyDashboardProps {
  height?: number;
  width?: number | string;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  year?: number;
}

const TransparencyDashboard: React.FC<TransparencyDashboardProps> = ({
  height = 600,
  width = '100%',
  showTitle = true,
  showDescription = true,
  className = '',
  year
}) => {
  const [activeSection, setActiveSection] = useState<string>('execution');
  
  // Dashboard sections configuration
  const dashboardSections: DashboardSection[] = [
    {
      id: 'execution',
      title: 'Budget Execution',
      description: 'Annual budget execution trends',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'blue'
    },
    {
      id: 'quarterly',
      title: 'Quarterly Trends',
      description: 'Quarterly budget execution trends',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'green'
    },
    {
      id: 'programmatic',
      title: 'Program Performance',
      description: 'Programmatic performance indicators',
      icon: <Calendar className="h-6 w-6" />,
      color: 'purple'
    },
    {
      id: 'gender',
      title: 'Gender Perspective',
      description: 'Gender balance in public employment',
      icon: <Users className="h-6 w-6" />,
      color: 'red'
    },
    {
      id: 'waterfall',
      title: 'Cumulative Execution',
      description: 'Waterfall visualization of execution',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'orange'
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'execution':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[500px]"
          >
            <BudgetExecutionChartWrapper 
              year={year}
              height={450}
              className="h-full"
            />
          </motion.div>
        );
      case 'quarterly':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[500px]"
          >
            <QuarterlyExecutionChart 
              year={year}
              height={450}
            />
          </motion.div>
        );
      case 'programmatic':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[500px]"
          >
            <ProgrammaticPerformanceChart 
              year={year}
              height={450}
            />
          </motion.div>
        );
      case 'gender':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[500px]"
          >
            <GenderBudgetingChart 
              year={year}
              height={450}
            />
          </motion.div>
        );
      case 'waterfall':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[500px]"
          >
            <WaterfallExecutionChart 
              year={year}
              height={450}
            />
          </motion.div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-[500px]">
            <p className="text-gray-500">Select a section to view data visualization</p>
          </div>
        );
    }
  };

  return (
    <div className={`dashboard-container ${className}`}>
      {showTitle && <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transparency & Accountability Dashboard</h2>}
      {showDescription && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Combined visualization of budget execution, program performance, gender equity, and transparency metrics
        </p>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Dashboard Sections</h3>
          <div className="space-y-2">
            {dashboardSections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="mr-3">{section.icon}</span>
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {renderActiveSection()}
          
          {/* Additional Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Budget Execution Rate</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">94.2%</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Consistently high execution</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-200">Families Supported</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">2,350</p>
              <p className="text-sm text-green-600 dark:text-green-400">Through social programs</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200">Gender Equity</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">54%</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">Female representation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransparencyDashboard;