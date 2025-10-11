/**
 * Complete Routing Configuration - All Pages Properly Named and Routed
 * This file contains comprehensive routing for the transparency portal
 */

import React, { useEffect } from 'react';

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { QueryProvider } from './providers/QueryProvider';
import { register as registerServiceWorker } from './utils/serviceWorkerRegistration';
import smartDataLoader from '@services/SmartDataLoader';
import productionDataManager from '@services/ProductionDataManager';
import GovernmentHeader from '@components/layout/GovernmentHeader';
import Sidebar from '@components/layout/Sidebar';
import Footer from '@components/layout/Footer';

// Core Pages
import Budget from './pages/BudgetUnified';
import Treasury from './pages/TreasuryUnified';
import ExpensesPage from './pages/ExpensesPage';
import DebtPage from './pages/Debt';
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
import DataVerificationPage from './pages/DataVerificationPage';
import DashboardCompleto from './pages/DashboardCompleto';
import NotFoundPage from './pages/NotFoundPage';
import MonitoringDashboard from './pages/MonitoringDashboard';
import OpenDataPage from './pages/OpenDataPage';
import OpenDataCatalogPage from './pages/OpenDataCatalogPage';
import DocumentAnalysisPage from './pages/DocumentAnalysisPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DataRightsPage from './pages/DataRightsPage';
import StandardizedDashboard from './pages/StandardizedDashboard';
import Home from './pages/Home';

// Dashboards & Analytics 
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import MetaTransparencyDashboard from './pages/MetaTransparencyDashboard';
import DataVisualizationHub from './pages/DataVisualizationHub';
import AnomalyDashboard from './pages/AnomalyDashboard';
import AntiCorruptionDashboard from './pages/AntiCorruptionDashboard';
import CorruptionMonitoringDashboard from './pages/CorruptionMonitoringDashboard';
import MultiYearRevenue from './pages/MultiYearRevenue';
import SectoralStatsDashboard from './pages/SectoralStatsDashboard';

// Audit & Transparency
import Audits from './pages/Audits';
import AuditAnomaliesExplainer from './pages/AuditAnomaliesExplainer';
import AuditsAndDiscrepanciesPage from './pages/AuditsAndDiscrepanciesPage';
import TransparencyPage from './pages/TransparencyPage';
import TransparencyPortal from './pages/TransparencyPortal';
import EnhancedTransparencyDashboard from './pages/EnhancedTransparencyDashboard';
import InfrastructureTracker from './pages/InfrastructureTracker';

// Demo Components
import YearSelectorDemo from '@components/demos/YearSelectorDemo';

// Carmen de Areco Specific Page
import CarmenDeArecoPage from './pages/CarmenDeArecoPage';

// Test Components
import TestAllChartsPage from './pages/TestAllChartsPage';
import DataConnectivityTest from './pages/DataConnectivityTest';
import TestDataLoader from './pages/TestDataLoader';
import APITestPage from './pages/APITestPage';

// Advanced Analysis & Visualization Pages
import GeographicVisualizationPage from './pages/GeographicVisualizationPage';
import TimeSeriesAnalysisPage from './pages/TimeSeriesAnalysisPage';
import CustomizableReportingPage from './pages/CustomizableReportingPage';
import FlaggedAnalysisPage from './pages/FlaggedAnalysisPage';
import InteractiveDashboard from './pages/InteractiveDashboard';

// Component to handle hash routing for DashboardCompleto
function DashboardWithHash() {
  const location = useLocation();
  
  useEffect(() => {
    // Handle hash navigation for dashboard sections
    const handleHashNavigation = () => {
      if (location.hash) {
        const elementId = location.hash.replace('#', '');
        // Wait for content to load, then scroll to element
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };
    
    // Handle initial load with hash
    handleHashNavigation();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, [location]);

  return <DashboardCompleto />;
}

function App() {
  useEffect(() => {
    // Register service worker for offline support and caching
    registerServiceWorker({
      onSuccess: () => {
        console.log('[App] Service worker registered successfully');
      },
      onUpdate: () => {
        console.log('[App] New content available, please refresh');
        // Optionally show a notification to the user
      },
      onError: (error) => {
        console.error('[App] Service worker registration failed:', error);
      }
    });

    // Initialize production data manager
    productionDataManager.initialize().catch(error => {
      console.error('[App] Production data manager initialization failed:', error);
    });

    // Warm up cache with essential data
    smartDataLoader.warmUpCache().catch(error => {
      console.error('[App] Cache warm-up failed:', error);
    });

    // Log stats periodically
    const statsInterval = setInterval(() => {
      const loaderStats = smartDataLoader.getStats();
      const managerStats = productionDataManager.getStats();

      if (loaderStats.requestsCompleted > 0 || managerStats.activeSources > 0) {
        console.log('[App] System Stats:', {
          loader: loaderStats,
          dataManager: managerStats
        });
      }
    }, 60000); // Every minute

    return () => {
      clearInterval(statsInterval);
      productionDataManager.stopBackgroundSync();
    };
  }, []);

  // Check if we're running on GitHub Pages vs other environments
  const isGitHubPages = window.location.hostname === 'flongstaff.github.io';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Handle redirects for GitHub Pages vs other environments
  useEffect(() => {
    // On GitHub Pages, ensure we're serving from the correct base path
    if (isGitHubPages && window.location.pathname === '/') {
      // When on GitHub Pages and accessing root, redirect to the proper subpath
      window.location.replace('/cda-transparencia/');
    }
    // On GitHub Pages, redirect from GitHub Pages base subpath back to root when accessing custom domain
    // This handles the case when the custom domain is set but still points to the GitHub Pages path
    else if (window.location.pathname.startsWith('/cda-transparencia/') && 
             !isGitHubPages && 
             !isLocalhost &&
             window.location.hostname === 'cda-transparencia.org') {
      const newPath = window.location.pathname.replace('/cda-transparencia/', '/');
      window.location.replace(newPath + window.location.search + window.location.hash);
    }
  }, [isGitHubPages, isLocalhost]);

  return (
    <QueryProvider>
      <HelmetProvider>
        <ThemeProvider>
          <DataProvider>
            <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-background text-gray-900 dark:text-dark-text-primary transition-colors duration-300">
            <GovernmentHeader />
            <div className="flex flex-1 pt-16">
              <Sidebar />
              <main className="flex-grow ml-0 md:ml-4 lg:ml-20 transition-all duration-300">
              <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                  <Routes>
                  {/* Main Dashboard Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<DashboardWithHash />} />
                  <Route path="/completo" element={<DashboardWithHash />} />

                  {/* Financial Management Routes - All redirected to Dashboard Completo */}
                  <Route path="/finances" element={<DashboardWithHash />} />
                  <Route path="/financial" element={<DashboardWithHash />} />
                  <Route path="/financial-analysis" element={<DashboardWithHash />} />
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
                  <Route path="/transparency-portal" element={<TransparencyPortal />} />
                  <Route path="/enhanced-transparency" element={<EnhancedTransparencyDashboard />} />
                  <Route path="/analysis" element={<AntiCorruptionDashboard />} />
                  <Route path="/corruption-monitoring" element={<CorruptionMonitoringDashboard />} />
                  <Route path="/integrity" element={<CorruptionMonitoringDashboard />} />
                  <Route path="/anticorruption" element={<CorruptionMonitoringDashboard />} />
                  <Route path="/property-declarations" element={<PropertyDeclarations />} />

                  {/* Data & Charts Routes - All redirected to Dashboard Completo */}
                  <Route path="/database" element={<Database />} />
                  <Route path="/data-hub" element={<DataVisualizationHub />} />
                  <Route path="/search" element={<SearchPage />} />

                  {/* Information Pages */}
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  {/* Data Verification */}
                  <Route path="/data-verification" element={<DataVerificationPage />} />
                  
                  {/* Open Data Catalog */}
                  <Route path="/open-data" element={<OpenDataPage />} />
                  <Route path="/open-data-catalog" element={<OpenDataCatalogPage />} />
                  <Route path="/catalog" element={<OpenDataCatalogPage />} />

                  {/* Standardized Dashboard */}
                  <Route path="/standardized" element={<StandardizedDashboard />} />
                  <Route path="/standardized-dashboard" element={<StandardizedDashboard />} />

                  {/* Document Analysis */}
                  <Route path="/document-analysis" element={<DocumentAnalysisPage />} />
                  
                  {/* Privacy and Data Protection */}
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/data-rights" element={<DataRightsPage />} />
                  
                  {/* Monitoring and Evaluation - CONSOLIDATED to use MonitoringDashboard only */}
                  <Route path="/monitoring" element={<MonitoringDashboard />} />
                  <Route path="/monitoring-dashboard" element={<MonitoringDashboard />} />
                  <Route path="/meta-transparency" element={<MetaTransparencyDashboard />} />
                  <Route path="/data-quality" element={<MetaTransparencyDashboard />} />
                  <Route path="/data-sources" element={<MetaTransparencyDashboard />} />

                  {/* Analytics Dashboard */}
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />

                  {/* Demo Components */}
                  <Route path="/demo/year-selector" element={<YearSelectorDemo />} />

                  {/* Carmen de Areco Specific Route */}
                  <Route path="/carmen" element={<CarmenDeArecoPage />} />

                  {/* Advanced Analysis & Visualization Routes */}
                  <Route path="/geographic" element={<GeographicVisualizationPage />} />
                  <Route path="/geographic-viz" element={<GeographicVisualizationPage />} />
                  <Route path="/time-series" element={<TimeSeriesAnalysisPage />} />
                  <Route path="/custom-reports" element={<CustomizableReportingPage />} />
                  <Route path="/flagged" element={<FlaggedAnalysisPage />} />
                  <Route path="/interactive" element={<InteractiveDashboard />} />
                  <Route path="/interactive-dashboard" element={<InteractiveDashboard />} />

                  {/* Test Pages */}
                  <Route path="/all-charts" element={<TestAllChartsPage />} />
                  <Route path="/data-connectivity-test" element={<DataConnectivityTest />} />
                  <Route path="/test-data-loader" element={<TestDataLoader />} />
                  <Route path="/api-test" element={<APITestPage />} />

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
</QueryProvider>
  );
}

export default App;