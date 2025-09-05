import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Home, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Users, 
  Building, 
  Search, 
  BarChart3, 
  AlertTriangle, 
  Settings, 
  Menu, 
  X, 
  ChevronDown,
  Activity,
  Eye,
  Scale,
  Phone,
  Info,
  Target,
  Database,
  PieChart,
  Loader2
} from 'lucide-react';
import { integratedBackendService } from '../services/IntegratedBackendService';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  path: string;
  icon: any;
  category: string;
  description?: string;
}

const UnifiedDashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['main']);

  // Complete navigation structure - ensuring NO pages are lost
  const navigation: NavigationItem[] = [
    // Main Dashboard
    { name: 'Dashboard Principal', path: '/', icon: Home, category: 'main', description: 'Vista general del sistema' },
    { name: 'Dashboard Integral', path: '/comprehensive', icon: Shield, category: 'main', description: 'Sistema anti-corrupción completo' },
    { name: 'Todas las Páginas', path: '/all-pages', icon: Database, category: 'main', description: 'Índice completo de secciones' },

    // Financial Analysis
    { name: 'Presupuesto', path: '/budget', icon: DollarSign, category: 'financial', description: 'Análisis presupuestario municipal' },
    { name: 'Ingresos', path: '/revenue', icon: TrendingUp, category: 'financial', description: 'Fuentes de ingresos municipales' },
    { name: 'Gastos Públicos', path: '/spending', icon: BarChart3, category: 'financial', description: 'Ejecución del gasto público' },
    { name: 'Deuda Municipal', path: '/debt', icon: Building, category: 'financial', description: 'Análisis de endeudamiento' },
    { name: 'Inversiones', path: '/investments', icon: Target, category: 'financial', description: 'Proyectos de inversión pública' },
    { name: 'Panel Financiero', path: '/financial-dashboard', icon: PieChart, category: 'financial', description: 'Dashboard financiero avanzado' },

    // Transparency & Compliance
    { name: 'Contratos', path: '/contracts', icon: FileText, category: 'transparency', description: 'Licitaciones y contrataciones' },
    { name: 'Salarios', path: '/salaries', icon: Users, category: 'transparency', description: 'Información salarial pública' },
    { name: 'Declaraciones', path: '/declarations', icon: Scale, category: 'transparency', description: 'Declaraciones patrimoniales' },
    { name: 'Documentos', path: '/documents', icon: Search, category: 'transparency', description: 'Repositorio documental' },

    // Analysis & Audit
    { name: 'Auditoría', path: '/audit', icon: Activity, category: 'analysis', description: 'Sistema de auditoría' },
    { name: 'Reportes', path: '/reports', icon: FileText, category: 'analysis', description: 'Reportes y análisis' },
    { name: 'Test Visualización', path: '/visualization-test', icon: BarChart3, category: 'analysis', description: 'Pruebas de visualización' },

    // System & Admin
    { name: 'Denuncias', path: '/whistleblower', icon: AlertTriangle, category: 'system', description: 'Canal de denuncias ciudadanas' },
    { name: 'Acerca de', path: '/about', icon: Info, category: 'system', description: 'Información del sistema' },
    { name: 'Contacto', path: '/contact', icon: Phone, category: 'system', description: 'Información de contacto' },
  ];

  const categories = [
    { id: 'main', name: 'Principal', icon: Home, color: 'blue' },
    { id: 'financial', name: 'Finanzas', icon: DollarSign, color: 'green' },
    { id: 'transparency', name: 'Transparencia', icon: Scale, color: 'purple' },
    { id: 'analysis', name: 'Análisis', icon: BarChart3, color: 'indigo' },
    { id: 'system', name: 'Sistema', icon: Settings, color: 'gray' },
  ];

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      const [health, dashboard] = await Promise.all([
        integratedBackendService.getSystemHealth().catch(() => null),
        integratedBackendService.getAntiCorruptionDashboard().catch(() => null)
      ]);
      
      setSystemStatus({ health, dashboard });
    } catch (error) {
      console.error('Error loading system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const isCurrentPage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
          <div className="flex items-center">
            <Shield className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-lg font-bold">Portal Transparencia</h1>
              <p className="text-xs text-blue-200">Carmen de Areco</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-blue-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* System Status */}
        <div className="px-4 py-3 bg-gray-50 border-b">
          {loading ? (
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Cargando estado...
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  systemStatus?.health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-gray-600">
                  Sistema {systemStatus?.health?.status === 'healthy' ? 'Operacional' : 'Mantenimiento'}
                </span>
              </div>
              {systemStatus?.dashboard?.transparency_metrics?.overall_score && (
                <span className="text-blue-600 font-medium">
                  {systemStatus.dashboard.transparency_metrics.overall_score}/100
                </span>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {categories.map((category) => {
            const categoryItems = navigation.filter(item => item.category === category.id);
            const isExpanded = expandedCategories.includes(category.id);
            
            return (
              <div key={category.id} className="mb-6">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors`}
                >
                  <div className="flex items-center">
                    <category.icon className={`h-5 w-5 mr-3 text-${category.color}-600`} />
                    {category.name}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="mt-2 space-y-1 ml-4">
                    {categoryItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          isCurrentPage(item.path)
                            ? `bg-${category.color}-100 text-${category.color}-700 border-r-2 border-${category.color}-500`
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className={`h-4 w-4 mr-3 ${
                          isCurrentPage(item.path) ? `text-${category.color}-600` : 'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* External Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Enlaces Externos
            </h3>
            <div className="space-y-2">
              <a
                href="http://localhost:3001/api/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <Database className="h-4 w-4 mr-3 text-gray-400" />
                API Principal
              </a>
              <a
                href="http://localhost:3001/api/advanced-fraud/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <Eye className="h-4 w-4 mr-3 text-gray-400" />
                Fraud Dashboard
              </a>
              <a
                href="https://carmendeareco.gob.ar/transparencia/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <Shield className="h-4 w-4 mr-3 text-gray-400" />
                Portal Oficial
              </a>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">
              Carmen de Areco | Sistema Anti-Corrupción
            </div>
            <div className="text-xs text-gray-400">
              {navigation.length} páginas disponibles
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-lg font-semibold text-gray-900">Portal Transparencia</span>
            </div>
            
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div>
              Portal de Transparencia Municipal - Carmen de Areco
            </div>
            <div className="mt-2 sm:mt-0 flex items-center space-x-4">
              <span>Sistema Anti-Corrupción Activo</span>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                Online
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default UnifiedDashboardLayout;