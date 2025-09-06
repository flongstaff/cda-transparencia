import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { YearProvider } from './contexts/YearContext';
import { 
  Shield, 
  BarChart, 
  FileText, 
  Search, 
  AlertTriangle, 
  Eye, 
  DollarSign,
  Users,
  Building,
  TrendingUp,
  Activity,
  Menu,
  X,
  Home as HomeIcon,
  ChevronRight
} from 'lucide-react';

// Import ALL pages - comprehensive coverage
import HomeIntegrated from './pages/HomeIntegrated';
import Budget from './pages/Budget';
import PublicSpending from './pages/PublicSpending';
import Revenue from './pages/Revenue';
import Contracts from './pages/Contracts';
import Salaries from './pages/Salaries';
import PropertyDeclarations from './pages/PropertyDeclarations';
import Debt from './pages/Debt';
import Investments from './pages/Investments';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import FinancialDashboard from './pages/FinancialDashboard';
import Audit from './pages/Audit';
import Reports from './pages/Reports';
import ComprehensiveDashboard from './pages/ComprehensiveDashboard';
import ComprehensiveFinancialAnalysis from './pages/ComprehensiveFinancialAnalysis';
import FinancialHistory from './pages/FinancialHistory';
import PowerBIData from './pages/PowerBIData';
import AllPages from './pages/AllPages';
import About from './pages/About';
import Contact from './pages/Contact';
import Whistleblower from './pages/Whistleblower';
import SystemDiagnostic from './pages/SystemDiagnostic';
import DataDashboard from './pages/DataDashboard';
import ApiTestPage from './pages/ApiTestPage';
import CitizenTransparency from './pages/CitizenTransparency';
import TransparencyPortal from './pages/TransparencyPortal';
import ErrorBoundary from './components/ErrorBoundary';

// Navigation items with improved organization and icons
const navigationSections = [
  {
    title: 'Principal',
    items: [
      { path: '/', label: '🏠 Inicio', icon: <HomeIcon className="w-4 h-4" /> },
      { path: '/comprehensive', label: '📊 Dashboard', icon: <BarChart className="w-4 h-4" /> },
      { path: '/system-diagnostic', label: '🔧 Diagnóstico', icon: <Activity className="w-4 h-4" /> },
      { path: '/data-dashboard', label: '📊 Data Dashboard', icon: <BarChart className="w-4 h-4" /> },
      { path: '/api-test', label: '🧪 API Test', icon: <Activity className="w-4 h-4" /> }
    ]
  },
  {
    title: 'Análisis Financiero',
    items: [
      { path: '/budget', label: '💰 Presupuesto Integral', icon: <DollarSign className="w-4 h-4" /> },
      { path: '/revenue', label: '💵 Recursos', icon: <DollarSign className="w-4 h-4" /> },
      { path: '/spending', label: '💸 Gastos', icon: <DollarSign className="w-4 h-4" /> },
      { path: '/debt', label: '📉 Deuda', icon: <TrendingUp className="w-4 h-4" /> },
      { path: '/investments', label: '📈 Inversiones', icon: <TrendingUp className="w-4 h-4" /> }
    ]
  },
  {
    title: 'Transparencia',
    items: [
      { path: '/citizen-transparency', label: '🏛️ Portal Ciudadano', icon: <Eye className="w-4 h-4" /> },
      { path: '/transparency-portal', label: '🔍 Anticorrupción', icon: <Shield className="w-4 h-4" /> },
      { path: '/contracts', label: '📋 Contratos', icon: <FileText className="w-4 h-4" /> },
      { path: '/salaries', label: '👥 Salarios', icon: <Users className="w-4 h-4" /> },
      { path: '/declarations', label: '🏛️ Declaraciones', icon: <Building className="w-4 h-4" /> },
      { path: '/documents', label: '📄 Documentos', icon: <FileText className="w-4 h-4" /> }
    ]
  },
  {
    title: 'Herramientas',
    items: [
      { path: '/audit', label: '🔍 Auditoría', icon: <Search className="w-4 h-4" /> },
      { path: '/reports', label: '📊 Reportes', icon: <BarChart className="w-4 h-4" /> },
      { path: '/whistleblower', label: '🚨 Denuncias', icon: <AlertTriangle className="w-4 h-4" /> },
      { path: '/financial-dashboard', label: '💹 Dashboard Fin.', icon: <TrendingUp className="w-4 h-4" /> }
    ]
  }
];

// Breadcrumb component
const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return null;
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link to="/" className="hover:text-blue-600 flex items-center">
        <HomeIcon className="w-4 h-4 mr-1" />
        Inicio
      </Link>
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
        
        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{label}</span>
            ) : (
              <Link to={path} className="hover:text-blue-600">{label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Main App component
const App: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = 'Portal de Transparencia | Carmen de Areco';
    
    // Fetch system status
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/anti-corruption/dashboard');
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data.data);
        }
      } catch (error) {
        console.log('Backend not available - using fallback status');
        setSystemStatus({
          riskLevel: 'BAJO',
          transparency: 85,
          dataQuality: 'ALTO'
        });
      }
    };

    fetchSystemStatus();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Modern Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Title */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-2"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <Link to="/" className="flex items-center">
                  <Shield className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Portal de Transparencia</h1>
                    <p className="text-sm text-gray-500">Carmen de Areco</p>
                  </div>
                </Link>
              </div>

              {/* System Status Indicators */}
              {systemStatus && (
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      systemStatus.riskLevel === 'BAJO' ? 'bg-green-400' :
                      systemStatus.riskLevel === 'MEDIO' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      Riesgo: {systemStatus.riskLevel}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      Transparencia: {systemStatus.transparency}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Calidad: {systemStatus.dataQuality}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="hidden sm:flex items-center space-x-3">
                <Link 
                  to="/citizen-transparency" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Portal Ciudadano</span>
                </Link>
                <Link 
                  to="/transparency-portal" 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <Shield className="w-4 h-4" />
                  <span>Anticorrupción</span>
                </Link>
                <Link 
                  to="/budget" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Presupuesto
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 ease-in-out
          `}>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto pt-5 pb-4">
                <nav className="px-3 space-y-6">
                  {navigationSections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {section.title}
                      </h3>
                      <div className="mt-2 space-y-1">
                        {section.items.map((item, itemIndex) => (
                          <Link
                            key={itemIndex}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
              
              {/* Footer */}
              <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-900">Carmen de Areco</p>
                    <p className="text-xs text-gray-500">Municipalidad</p>
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

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Breadcrumb />
              
              <ErrorBoundary>
                <Routes>
                  {/* Main Routes */}
                  <Route path="/" element={<HomeIntegrated />} />
                  <Route path="/comprehensive" element={<ComprehensiveDashboard />} />
                  <Route path="/system-diagnostic" element={<SystemDiagnostic />} />
                  
                  {/* Financial Analysis Routes */}
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/revenue" element={<Revenue />} />
                  <Route path="/spending" element={<PublicSpending />} />
                  <Route path="/debt" element={<Debt />} />
                  <Route path="/investments" element={<Investments />} />
                  
                  {/* Transparency Routes */}
                  <Route path="/citizen-transparency" element={<CitizenTransparency />} />
                  <Route path="/transparency-portal" element={<TransparencyPortal />} />
                  <Route path="/contracts" element={<Contracts />} />
                  <Route path="/salaries" element={<Salaries />} />
                  <Route path="/declarations" element={<PropertyDeclarations />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/documents/:id" element={<DocumentDetail />} />
                  
                  {/* Tools Routes */}
                  <Route path="/audit" element={<Audit />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/whistleblower" element={<Whistleblower />} />
                  <Route path="/financial-dashboard" element={<FinancialDashboard />} />
                  
                  {/* Additional Routes */}
                  <Route path="/financial-analysis" element={<ComprehensiveFinancialAnalysis />} />
                  <Route path="/financial-history" element={<FinancialHistory />} />
                  <Route path="/powerbi" element={<PowerBIData />} />
                  <Route path="/all-pages" element={<AllPages />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/data-dashboard" element={<DataDashboard />} />
                  <Route path="/api-test" element={<ApiTestPage />} />
                </Routes>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;