import React from 'react';
/**
 * Complete Routing Configuration - All Pages Properly Named and Routed
 * This file contains comprehensive routing for the transparency portal
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import GovernmentHeader from './components/layout/GovernmentHeader';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Core Pages
import Budget from './pages/Budget';
import Treasury from './pages/Treasury';
import ExpensesPage from './pages/ExpensesPage';
import DebtPage from './pages/DebtPage';
import InvestmentsPage from './pages/InvestmentsPage';
import Salaries from './pages/Salaries';
import ContractsAndTendersPage from './pages/ContractsAndTendersPage';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Database from './pages/Database';
import SearchPage from './pages/SearchPage';
import About from './pages/About';
import Contact from './pages/Contact';
import PropertyDeclarations from './pages/PropertyDeclarations';
import EnhancedHome from './pages/EnhancedHome';
import TestAllChartsPage from './pages/TestAllChartsPage';
import DataVerificationPage from './pages/DataVerificationPage';
import DashboardCompleto from './pages/DashboardCompleto';
import NotFoundPage from './pages/NotFoundPage';
import MonitoringDashboard from './pages/MonitoringDashboard';

// Demo Components
import YearSelectorDemo from './components/demos/YearSelectorDemo';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-background text-gray-900 dark:text-dark-text-primary transition-colors duration-300">
          <GovernmentHeader />
          <div className="flex flex-1 pt-16">
            <Sidebar />
            <main className="flex-grow ml-4 lg:ml-20">
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <Routes>
                  {/* Main Dashboard Routes */}
                  <Route path="/" element={<EnhancedHome />} />
                  <Route path="/dashboard" element={<DashboardCompleto />} />

                  {/* Financial Management Routes - All redirected to Dashboard Completo */}
                  <Route path="/finances" element={<DashboardCompleto />} />
                  <Route path="/financial" element={<DashboardCompleto />} />
                  <Route path="/financial-analysis" element={<DashboardCompleto />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/treasury" element={<Treasury />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/debt" element={<DebtPage />} />
                  <Route path="/investments" element={<InvestmentsPage />} />

                  {/* Human Resources Routes */}
                  <Route path="/salaries" element={<Salaries />} />

                  {/* Procurement Routes */}
                  <Route path="/contracts" element={<ContractsAndTendersPage />} />

                  {/* Documents & Transparency Routes */}
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/reports" element={<Reports />} />

                  {/* Analysis & Audit Routes - All redirected to Dashboard Completo */}
                  <Route path="/audits" element={<DashboardCompleto />} />
                  <Route path="/audit-dashboard" element={<DashboardCompleto />} />
                  <Route path="/audit-anomalies" element={<DashboardCompleto />} />
                  <Route path="/financial-audit" element={<DashboardCompleto />} />
                  <Route path="/transparency" element={<DashboardCompleto />} />
                  <Route path="/enhanced-transparency" element={<DashboardCompleto />} />
                  <Route path="/unified-transparency" element={<DashboardCompleto />} />
                  <Route path="/analysis" element={<DashboardCompleto />} />
                  <Route path="/property-declarations" element={<PropertyDeclarations />} />

                  {/* Data & Charts Routes - All redirected to Dashboard Completo */}
                  <Route path="/database" element={<Database />} />
                  <Route path="/all-charts" element={<DashboardCompleto />} />
                  <Route path="/charts" element={<DashboardCompleto />} />
                  <Route path="/completo" element={<DashboardCompleto />} />
                  <Route path="/search" element={<SearchPage />} />

                  {/* Information Pages */}
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  {/* Data Verification */}
                  <Route path="/data-verification" element={<DataVerificationPage />} />

                  {/* Monitoring Routes */}
                  <Route path="/monitoring" element={<MonitoringDashboard />} />
                  <Route path="/system-health" element={<MonitoringDashboard />} />

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
    </ThemeProvider>
  );
}

export default App;