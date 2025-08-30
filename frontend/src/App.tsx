import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Budget from './pages/Budget';
import PublicSpending from './pages/PublicSpending';
import Revenue from './pages/Revenue';
import Contracts from './pages/Contracts';
import PropertyDeclarations from './pages/PropertyDeclarations';
import Salaries from './pages/Salaries';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Reports from './pages/Reports';
import Contact from './pages/Contact';
import Whistleblower from './pages/Whistleblower';
import FinancialDashboard from './pages/FinancialDashboard';
import Debt from './pages/Debt';
import Investments from './pages/Investments';
import Audit from './pages/Audit';
import PowerBIData from './pages/PowerBIData';
import FinancialHistory from './pages/FinancialHistory';
import ComprehensiveFinancialAnalysis from './pages/ComprehensiveFinancialAnalysis';
import DataIntegrityDashboard from './components/DataIntegrityDashboard';
import ErrorBoundary from './components/ErrorBoundary';

// All components are now imported from their respective files

function App() {
  return (
    <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Simple Header */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <Link to="/" className="flex items-center">
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">CA</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-blue-600 text-lg">Portal de Transparencia</h1>
                    <p className="text-gray-600 text-xs">Carmen de Areco</p>
                  </div>
                </Link>
                
                {/* Navigation */}
                <nav className="hidden md:flex space-x-4">
                  <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Inicio</Link>
                  <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Dashboard</Link>
                  <Link to="/budget" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Presupuesto</Link>
                  <Link to="/spending" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Gastos</Link>
                  <Link to="/revenue" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Ingresos</Link>
                  <Link to="/contracts" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Contratos</Link>
                  <Link to="/salaries" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Salarios</Link>
                  <Link to="/documents" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Documentos</Link>
                </nav>
              </div>
            </div>
          </header>

        {/* Main Content */}
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
              <Route path="/property-declarations" element={<ErrorBoundary><PropertyDeclarations /></ErrorBoundary>} />
              <Route path="/salaries" element={<ErrorBoundary><Salaries /></ErrorBoundary>} />
              <Route path="/documents" element={<ErrorBoundary><Documents /></ErrorBoundary>} />
              <Route path="/documents/:id" element={<ErrorBoundary><DocumentDetail /></ErrorBoundary>} />
              <Route path="/reports" element={<ErrorBoundary><Reports /></ErrorBoundary>} />
              <Route path="/contact" element={<ErrorBoundary><Contact /></ErrorBoundary>} />
              <Route path="/whistleblower" element={<ErrorBoundary><Whistleblower /></ErrorBoundary>} />
              <Route path="/audit" element={<ErrorBoundary><Audit /></ErrorBoundary>} />
              <Route path="/powerbi-data" element={<ErrorBoundary><PowerBIData /></ErrorBoundary>} />
              <Route path="/financial-history" element={<ErrorBoundary><FinancialHistory /></ErrorBoundary>} />
              <Route path="/financial-analysis" element={<ErrorBoundary><ComprehensiveFinancialAnalysis /></ErrorBoundary>} />
              <Route path="/data-integrity" element={<ErrorBoundary><DataIntegrityDashboard /></ErrorBoundary>} />
            </Routes>
          </ErrorBoundary>
        </main>
        </div>
    </Router>
  );
}

export default App;