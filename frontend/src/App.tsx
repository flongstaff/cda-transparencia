import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Budget from './pages/Budget';
import PublicSpending from './pages/PublicSpending';
import Revenue from './pages/Revenue';
import Contracts from './pages/Contracts';
import PropertyDeclarations from './pages/PropertyDeclarations';
import Salaries from './pages/Salaries';
import Database from './pages/Database';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Contact from './pages/Contact';
import Whistleblower from './pages/Whistleblower';
import ApiExplorer from './pages/ApiExplorer';
import FinancialDashboard from './pages/FinancialDashboard';
import Debt from './pages/Debt';
import Investments from './pages/Investments';
import Treasury from './pages/Treasury';
import DataIntegrityDashboard from './components/DataIntegrityDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/dashboard" element={<FinancialDashboard />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/spending" element={<PublicSpending />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/debt" element={<Debt />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/treasury" element={<Treasury />} />
                <Route path="/property-declarations" element={<PropertyDeclarations />} />
                <Route path="/salaries" element={<Salaries />} />
                <Route path="/database" element={<Database />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/whistleblower" element={<Whistleblower />} />
                <Route path="/api-explorer" element={<ApiExplorer />} />
                <Route path="/data-integrity" element={<DataIntegrityDashboard />} />
              </Routes>
            </Layout>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;