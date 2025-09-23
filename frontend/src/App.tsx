/**
 * Main App Component
 * Entry point for the transparency portal application
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  FileText,
  DollarSign,
  Users,
  Building,
  TrendingUp,
  Activity,
  Menu,
  X,
  Home as HomeIcon,
  ChevronRight,
  BookOpen,
  Calculator,
  Briefcase,
  LayoutDashboard,
  Calendar,
  PieChart as PieIcon,
  Coins,
  CreditCard,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  GitBranch
} from 'lucide-react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import notification system
import { NotificationProvider, NotificationContainer } from './components/notifications';

// Import error boundary
import ErrorBoundary from './components/ErrorBoundary';

// Define your MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Corresponds to Tailwind's blue-600
    },
    secondary: {
      main: '#f97316', // Corresponds to Tailwind's orange-500
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

// Import essential pages - consolidated approach
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Contracts from './pages/Contracts';
import Salaries from './pages/Salaries';
import PropertyDeclarations from './pages/PropertyDeclarations';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Audit from './pages/Audit';
import Reports from './pages/Reports';
import About from './pages/About';
import Contact from './pages/Contact';
import CategoryPage from './pages/CategoryPage';
import Spending from './pages/Spending';
import Treasury from './pages/Treasury';
import DatabasePage from './pages/Database';
import Whistleblower from './pages/Whistleblower';
import AntiCorruptionDashboard from './pages/AntiCorruptionDashboard';
import Budget from './pages/Budget';

// Import yearly components
import YearDashboard from './components/yearly/YearDashboard';
import TransparencyDashboard from './components/dashboard/TransparencyDashboard';

// Import test pages
import ComprehensiveTestPage from './pages/ComprehensiveTestPage';
import GitHubResourcesTestPage from './pages/GitHubResourcesTestPage';
import ImplementationVerificationPage from './pages/ImplementationVerificationPage';

// Simple navigation for citizens
const navigationSections = [
  {
    title: 'Principal',
    items: [
      { path: '/', label: 'Inicio', icon: <HomeIcon className="w-4 h-4" /> },
      { path: '/dashboard', label: 'Resumen General', icon: <LayoutDashboard className="w-4 h-4" /> }
    ]
  },
  {
    title: 'Finanzas Municipales',
    items: [
      { path: '/budget', label: 'Presupuesto Anual', icon: <DollarSign className="w-4 h-4" /> },
      { path: '/expenses', label: 'Gastos y Erogaciones', icon: <Calculator className="w-4 h-4" /> },
      { path: '/spending', label: 'Gastos Públicos', icon: <TrendingUp className="w-4 h-4" /> },
      { path: '/investments', label: 'Inversiones', icon: <Building className="w-4 h-4" /> },
      { path: '/treasury', label: 'Tesorería', icon: <DollarSign className="w-4 h-4" /> },
      { path: '/revenue', label: 'Ingresos y Recursos', icon: <TrendingUp className="w-4 h-4" /> },
      { path: '/year/2025', label: 'Datos por Año', icon: <Calendar className="w-4 h-4" /> }
    ]
  },
  {
    title: 'Información Pública',
    items: [
      { path: '/salaries', label: 'Sueldos de Empleados', icon: <Users className="w-4 h-4" /> },
      { path: '/contracts', label: 'Contratos y Licitaciones', icon: <Briefcase className="w-4 h-4" /> },
      { path: '/declarations', label: 'Declaraciones de Funcionarios', icon: <Building className="w-4 h-4" /> },
      { path: '/documents', label: 'Todos los Documentos', icon: <FileText className="w-4 h-4" /> },
      { path: '/database', label: 'Base de Datos', icon: <FileText className="w-4 h-4" /> }
    ]
  },
  {
    title: 'Herramientas',
    items: [
      { path: '/audit', label: 'Auditoría y Análisis', icon: <Activity className="w-4 h-4" /> },
      { path: '/reports', label: 'Reportes', icon: <FileText className="w-4 h-4" /> },
      { path: '/anticorruption', label: 'Lucha contra la Corrupción', icon: <Shield className="w-4 h-4" /> },
      { path: '/transparency', label: 'Transparency Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { path: '/whistleblower', label: 'Canal de Denuncias', icon: <Shield className="w-4 h-4" /> }
    ]
  },
  {
    title: 'Pruebas',
    items: [
      { path: '/test/viewers', label: 'Visores de Documentos', icon: <FileText className="w-4 h-4" /> },
      { path: '/test/comprehensive', label: 'Pruebas Integrales', icon: <Activity className="w-4 h-4" /> },
      { path: '/test/github-resources', label: 'Recursos de GitHub', icon: <GitBranch className="w-4 h-4" /> },
      { path: '/test/implementation', label: 'Verificación de Implementación', icon: <Shield className="w-4 h-4" /> },
      { path: '/test/real-github', label: 'Prueba de Recursos Reales', icon: <GitBranch className="w-4 h-4" /> },
      { path: '/test/github-integration', label: 'Integración con GitHub', icon: <GitBranch className="w-4 h-4" /> }
    ]
  },
  {
    title: 'Contacto',
    items: [
      { path: '/about', label: 'Sobre este sitio', icon: <BookOpen className="w-4 h-4" /> },
      { path: '/contact', label: 'Contactar al Municipio', icon: <Activity className="w-4 h-4" /> }
    ]
  }
];

// Breadcrumb component
const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return null;
  
  return (
    <nav className="flex items-center space-x-2 text-sm bg-white rounded-xl px-4 py-3 mb-6 shadow-sm border border-gray-100">
      <Link to="/" className="hover:text-blue-600 flex items-center text-gray-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all">
        <HomeIcon className="w-4 h-4 mr-1" />
        Inicio
      </Link>
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
        
        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-4 h-4 text-orange-400" />
            {isLast ? (
              <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-lg">{label}</span>
            ) : (
              <Link to={path} className="hover:text-blue-600 text-gray-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all">{label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// System Status interface
interface SystemStatus {
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  transparency: number;
  dataQuality: 'BAJO' | 'MEDIO' | 'ALTO';
}

// Main App component
const App: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic basename based on environment
  const getBasename = () => {
    const basePath = import.meta.env.VITE_BASE_PATH;
    if (basePath && basePath !== '/') return basePath;
    // For custom domain with GitHub Pages, use root path
    return '/';
  };

  useEffect(() => {
    document.title = 'Portal de Transparencia | Carmen de Areco';
    
    // Set simple system status for citizens
    setSystemStatus({
      riskLevel: 'BAJO',
      transparency: 85,
      dataQuality: 'ALTO'
    });
  }, []);

  return (
    <ErrorBoundary>
      <Router basename={getBasename()}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NotificationProvider>
            {/* Notification container */}
            <NotificationContainer />
            
            <div className="min-h-screen bg-white">
              {/* Modern Header - Enhanced with new color scheme */}
              <header className="bg-white shadow-md border-b-2 border-orange-200">
                <div className="flex justify-between items-center h-18">
                  {/* Logo and Title */}
                  <div className="flex items-center">
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="md:hidden p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-orange-50 mr-2 transition-colors"
                    >
                      {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <Link to="/" className="flex items-center group">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-md group-hover:from-blue-600 group-hover:to-blue-700 transition-all mr-4">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          Portal de Transparencia
                        </h1>
                        <p className="text-sm text-orange-600 font-medium">Carmen de Areco</p>
                      </div>
                    </Link>
                  </div>

                  {/* Simple Status - Citizens focused */}
                  {systemStatus && (
                    <div className="hidden md:flex items-center">
                      <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-700">
                          Sistema Activo
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Simple Actions */}
                  <div className="hidden sm:flex items-center space-x-3">
                    <Link 
                      to="/dashboard" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Ver Resumen
                    </Link>
                    <Link 
                      to="/documents" 
                      className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Documentos
                    </Link>
                  </div>
                </div>
              </header>

              <div className="flex">
                {/* Sidebar Navigation - Enhanced */}
                <aside className={`
                  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r-2 border-orange-100 transition-transform duration-300 ease-in-out
                `}>
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto pt-6 pb-4">
                      <nav className="px-4 space-y-8">
                        {navigationSections.map((section, sectionIndex) => (
                          <div key={sectionIndex}>
                            <h3 className="px-3 text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">
                              {section.title}
                            </h3>
                            <div className="space-y-1">
                              {section.items.map((item, itemIndex) => (
                                <Link
                                  key={itemIndex}
                                  to={item.path}
                                  onClick={() => setSidebarOpen(false)}
                                  className="group flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 transform hover:translate-x-1"
                                >
                                  <div className="mr-3 text-gray-500 group-hover:text-blue-600 transition-colors">
                                    {item.icon}
                                  </div>
                                  <span className="truncate">{item.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </nav>
                    </div>
                    
                    {/* Footer - Enhanced */}
                    <div className="flex-shrink-0 border-t-2 border-orange-100 p-4 bg-gradient-to-r from-orange-50 to-blue-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-2 rounded-lg shadow-sm">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900">Carmen de Areco</p>
                          <p className="text-xs text-orange-600 font-medium">Municipalidad</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                  <div 
                    className="md:hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-40"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}

                {/* Main Content - Enhanced */}
                <main className="flex-1 min-w-0 bg-gray-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ErrorBoundary>
                      <Breadcrumb />
                    </ErrorBoundary>
                    
                    <Routes>
                      {/* Main Routes - All dashboards consolidated into main pages */}
                      <Route path="/" element={<Home />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Financial Analysis Routes - Using specific category pages */}
                      <Route path="/budget" element={<Budget />} />
                      <Route path="/expenses" element={<CategoryPage category="expenses" title="Gastos" icon="💸" />} />
                      <Route path="/spending" element={<Spending />} />
                      <Route path="/investments" element={<CategoryPage category="investments" title="Inversiones" icon="🏗️" />} />
                      <Route path="/revenue" element={<Treasury />} />
                      <Route path="/debt" element={<CategoryPage category="debt" title="Deuda" icon="💳" />} />
                      
                      {/* Transparency Routes */}
                      <Route path="/contracts" element={<Contracts />} />
                      <Route path="/salaries" element={<Salaries />} />
                      <Route path="/declarations" element={<PropertyDeclarations />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/documents/:id" element={<DocumentDetail />} />
                      
                      {/* Tools Routes */}
                      <Route path="/audit" element={<Audit />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/database" element={<DatabasePage />} />
                      <Route path="/whistleblower" element={<Whistleblower />} />
                      <Route path="/anticorruption" element={<AntiCorruptionDashboard />} />
                      
                      {/* Information Routes */}
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      
                      {/* Yearly Dashboard Route */}
                      <Route path="/year/:year" element={<YearDashboard />} />
                      <Route path="/transparency" element={<TransparencyDashboard />} />
                      
                      {/* Test Routes - Temporarily disabled due to compilation issues */}
                      <Route path="/test/viewers" element={<div className="p-8 text-center"><h2 className="text-xl font-bold">Document Viewers Test</h2><p>Temporarily unavailable</p></div>} />
                      <Route path="/test/comprehensive" element={<ComprehensiveTestPage />} />
                      <Route path="/test/github-resources" element={<GitHubResourcesTestPage />} />
                      <Route path="/test/implementation" element={<ImplementationVerificationPage />} />
                      <Route path="/test/real-github" element={<div className="p-8 text-center"><h2 className="text-xl font-bold">Real GitHub Test</h2><p>Temporarily unavailable</p></div>} />
                      <Route path="/test/github-integration" element={<div className="p-8 text-center"><h2 className="text-xl font-bold">GitHub Integration Test</h2><p>Temporarily unavailable</p></div>} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          </NotificationProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;