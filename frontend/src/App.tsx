import React from 'react';
/**
 * Complete Routing Configuration - All Pages Properly Named and Routed
 * This file contains comprehensive routing for the transparency portal
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import GovernmentHeader from './components/layout/GovernmentHeader';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Core Pages
import Budget from './pages/BudgetUnified';
import Treasury from './pages/TreasuryUnified';
import ExpensesPage from './pages/ExpensesPage';
import DebtPage from './pages/DebtUnified';
import InvestmentsPage from './pages/InvestmentsPage';
import Salaries from './pages/Salaries';
import ContractsAndTendersPage from './pages/ContractsAndTendersPage';
import Documents from './pages/DocumentsUnified';
import Reports from './pages/Reports';
import Database from './pages/Database';
import SearchPage from './pages/SearchPage';
import About from './pages/About';
import Contact from './pages/Contact';
import PropertyDeclarations from './pages/PropertyDeclarations';
import TestAllChartsPage from './pages/TestAllChartsPage';
import DataVerificationPage from './pages/DataVerificationPage';
import DashboardCompleto from './pages/DashboardCompleto';
import NotFoundPage from './pages/NotFoundPage';
import MonitoringDashboard from './pages/MonitoringDashboard';

// Demo Components
import YearSelectorDemo from './components/demos/YearSelectorDemo';
import AnomalyDashboard from './pages/AnomalyDashboard';
import AuditAnomaliesExplainer from './pages/AuditAnomaliesExplainer';
import AllChartsDashboard from './pages/AllChartsDashboard';
import Audits from './pages/Audits';
import AuditsAndDiscrepanciesPage from './pages/AuditsAndDiscrepanciesPage';
import AntiCorruptionDashboard from './pages/AntiCorruptionDashboard';
import EnhancedTransparencyDashboard from './pages/EnhancedTransparencyDashboard';
import TransparencyPage from './pages/TransparencyPage';
import InfrastructureTracker from './pages/InfrastructureTracker';
import DataVisualizationHub from './pages/DataVisualizationHub';
import MultiYearRevenue from './pages/MultiYearRevenue';
import SectoralStatsDashboard from './pages/SectoralStatsDashboard';
import CorruptionMonitoringDashboard from './pages/CorruptionMonitoringDashboard';
import MetaTransparencyDashboard from './pages/MetaTransparencyDashboard';
import Home from './pages/Home';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <DataProvider>
          <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-background text-gray-900 dark:text-dark-text-primary transition-colors duration-300">
          <GovernmentHeader />
          <div className="flex flex-1 pt-16">
            <Sidebar />
            <main className="flex-grow ml-4 lg:ml-20">
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <Routes>
                  {/* Main Dashboard Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<DashboardCompleto />} />
                  <Route path="/completo" element={<DashboardCompleto />} />

                  {/* Financial Management Routes - All redirected to Dashboard Completo */}
                  <Route path="/finances" element={<DashboardCompleto />} />
                  <Route path="/financial" element={<DashboardCompleto />} />
                  <Route path="/financial-analysis" element={<DashboardCompleto />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/treasury" element={<Treasury />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/debt" element={<DebtPage />} />
                  <Route path="/investments" element={<InvestmentsPage />} />
                  <Route path="/infrastructure" element={<InfrastructureTracker />} />
                  <Route path="/revenue" element={<MultiYearRevenue />} />
                  <Route path="/multi-year-revenue" element={<MultiYearRevenue />} />
                  <Route path="/sectoral" element={<SectoralStatsDashboard />} />
                  <Route path="/sectoral-stats" element={<SectoralStatsDashboard />} />
                  <Route path="/sectors" element={<SectoralStatsDashboard />} />

                  {/* Human Resources Routes */}
                  <Route path="/salaries" element={<Salaries />} />

                  {/* Procurement Routes */}
                  <Route path="/contracts" element={<ContractsAndTendersPage />} />

                  {/* Documents & Transparency Routes */}
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/reports" element={<Reports />} />

                  {/* Analysis & Audit Routes - All redirected to Dashboard Completo */}
                  <Route path="/audits" element={<Audits />} />
                  <Route path="/audit-dashboard" element={<AnomalyDashboard />} />
                  <Route path="/audit-anomalies" element={<AuditAnomaliesExplainer />} />
                  <Route path="/financial-audit" element={<AuditsAndDiscrepanciesPage />} />
                  <Route path="/transparency" element={<TransparencyPage />} />
                  <Route path="/enhanced-transparency" element={<EnhancedTransparencyDashboard />} />
                  <Route path="/analysis" element={<AntiCorruptionDashboard />} />
                  <Route path="/corruption-monitoring" element={<CorruptionMonitoringDashboard />} />
                  <Route path="/integrity" element={<CorruptionMonitoringDashboard />} />
                  <Route path="/anticorruption" element={<CorruptionMonitoringDashboard />} />
                  <Route path="/property-declarations" element={<PropertyDeclarations />} />

                  {/* Data & Charts Routes - All redirected to Dashboard Completo */}
                  <Route path="/database" element={<Database />} />
                  <Route path="/all-charts" element={<AllChartsDashboard />} />
                  <Route path="/data-hub" element={<DataVisualizationHub />} />
                  <Route path="/data-visualization" element={<DataVisualizationHub />} />
                  <Route path="/search" element={<SearchPage />} />

                  {/* Information Pages */}
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  {/* Data Verification */}
                  <Route path="/data-verification" element={<DataVerificationPage />} />

                  {/* Monitoring Routes */}
                  <Route path="/monitoring" element={<MonitoringDashboard />} />
                  <Route path="/meta-transparency" element={<MetaTransparencyDashboard />} />
                  <Route path="/data-quality" element={<MetaTransparencyDashboard />} />

                  {/* Demo Components */}
                  <Route path="/demo/year-selector" element={<YearSelectorDemo />} />

                  {/* Test Page */}
                  <Route path="/test-charts" element={<TestAllChartsPage />} />

                  {/* Catch-all route for 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
            </main>
          </div>
          <Footer />
          </div>
          </BrowserRouter>
        </DataProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;