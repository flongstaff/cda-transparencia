import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AnomalyDashboard from './components/anomaly/AnomalyDashboard';
import About from './pages/About';
import Budget from './pages/Budget';
import PublicSpending from './pages/PublicSpending';
import Revenue from './pages/Revenue';
import Contracts from './pages/Contracts';
import FinancialDashboard from './pages/FinancialDashboard';
import Debt from './pages/Debt';
import Investments from './pages/Investments';
import Audit from './pages/Audit';
import PowerBIData from './pages/PowerBIData';
import FinancialHistory from './pages/FinancialHistory';
import ComprehensiveFinancialAnalysis from './pages/ComprehensiveFinancialAnalysis';
import DataIntegrityDashboard from './components/DataIntegrityDashboard';
import VisualizationTestPage from './pages/VisualizationTestPage';
import AllDocuments from './pages/AllDocuments';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  // Update document title - using current year as default
  useEffect(() => {
    document.title = `Portal de Transparencia | Carmen de Areco`;
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
    <main style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px 16px',
      backgroundColor: 'white',
      minHeight: '500px',
      borderRadius: '8px',
      marginTop: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
          <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
          <Route path="/dashboard" element={<ErrorBoundary><FinancialDashboard /></ErrorBoundary>} />
          <Route path="/budget" element={<ErrorBoundary><Budget /></ErrorBoundary>} />
          <Route path="/spending" element={<ErrorBoundary><PublicSpending /></ErrorBoundary>} />
          <Route path="/revenue" element={<ErrorBoundary><Revenue /></ErrorBoundary>} />
          <Route path="/contracts" element={<ErrorBoundary><Contracts /></ErrorBoundary>} />
          <Route path="/debt" element={<ErrorBoundary><Debt /></ErrorBoundary>} />
          <Route path="/investments" element={<ErrorBoundary><Investments /></ErrorBoundary>} />
          <Route path="/audit" element={<ErrorBoundary><Audit /></ErrorBoundary>} />
          <Route path="/powerbi-data" element={<ErrorBoundary><PowerBIData /></ErrorBoundary>} />
          <Route path="/financial-history" element={<ErrorBoundary><FinancialHistory /></ErrorBoundary>} />
          <Route path="/financial-analysis" element={<ErrorBoundary><ComprehensiveFinancialAnalysis /></ErrorBoundary>} />
          <Route path="/data-integrity" element={<ErrorBoundary><DataIntegrityDashboard /></ErrorBoundary>} />
          <Route path="/visualization-test" element={<ErrorBoundary><VisualizationTestPage /></ErrorBoundary>} />
          <Route path="/anomalies" element={<ErrorBoundary><AnomalyDashboard /></ErrorBoundary>} />
          <Route path="/all-documents" element={<ErrorBoundary><AllDocuments /></ErrorBoundary>} />
        </Routes>
      </ErrorBoundary>
    </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;