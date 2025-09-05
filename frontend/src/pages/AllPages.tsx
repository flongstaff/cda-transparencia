import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building, 
  PiggyBank, 
  FileSearch, 
  Shield, 
  Scale, 
  AlertTriangle, 
  Phone, 
  Info,
  Activity,
  Target
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AllPages: React.FC = () => {
  const pages = [
    {
      category: "Dashboard Principal",
      items: [
        { path: "/", name: "Dashboard Principal", icon: BarChart, description: "Vista general del sistema de transparencia" },
        { path: "/comprehensive", name: "Dashboard Integral", icon: Shield, description: "Sistema completo anti-corrupción con OSINT" }
      ]
    },
    {
      category: "Finanzas Públicas",
      items: [
        { path: "/budget", name: "Presupuesto Municipal", icon: FileText, description: "Análisis presupuestario 2018-2025" },
        { path: "/revenue", name: "Ingresos Municipales", icon: DollarSign, description: "Fuentes de ingresos y recursos" },
        { path: "/spending", name: "Gastos Públicos", icon: TrendingUp, description: "Ejecución del gasto público" },
        { path: "/debt", name: "Deuda Municipal", icon: PiggyBank, description: "Análisis de endeudamiento" },
        { path: "/investments", name: "Inversiones", icon: Building, description: "Proyectos de inversión pública" }
      ]
    },
    {
      category: "Contrataciones y Personal",
      items: [
        { path: "/contracts", name: "Contratos y Licitaciones", icon: FileSearch, description: "Transparencia en contrataciones públicas" },
        { path: "/salaries", name: "Salarios Públicos", icon: Users, description: "Información salarial del sector público" },
        { path: "/declarations", name: "Declaraciones Patrimoniales", icon: Scale, description: "Declaraciones de funcionarios públicos" }
      ]
    },
    {
      category: "Sistema y Análisis",
      items: [
        { path: "/financial-dashboard", name: "Panel Financiero", icon: Activity, description: "Dashboard financiero avanzado" },
        { path: "/audit", name: "Auditoría", icon: Target, description: "Sistema de auditoría y control" },
        { path: "/documents", name: "Repositorio de Documentos", icon: FileText, description: "Búsqueda y acceso a documentos" },
        { path: "/reports", name: "Reportes", icon: BarChart, description: "Reportes y análisis diversos" }
      ]
    },
    {
      category: "Transparencia y Denuncias",
      items: [
        { path: "/whistleblower", name: "Canal de Denuncias", icon: AlertTriangle, description: "Sistema seguro para denuncias ciudadanas" }
      ]
    },
    {
      category: "Información Institucional",
      items: [
        { path: "/about", name: "Acerca del Portal", icon: Info, description: "Información sobre el sistema de transparencia" },
        { path: "/contact", name: "Contacto", icon: Phone, description: "Información de contacto institucional" }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Portal de Transparencia - Todas las Secciones
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sistema integral de transparencia municipal para Carmen de Areco
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{pages.reduce((acc, cat) => acc + cat.items.length, 0)}</div>
            <div className="text-sm text-blue-800">Páginas Disponibles</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-green-800">Años de Datos</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-purple-800">Sistema Operacional</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">2</div>
            <div className="text-sm text-red-800">Casos Activos</div>
          </div>
        </div>
      </div>

      {/* Page Categories */}
      {pages.map((category, index) => (
        <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {category.category}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.items.map((page, pageIndex) => (
              <Link
                key={pageIndex}
                to={page.path}
                className="flex items-start p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <page.icon className="h-6 w-6 text-gray-400 group-hover:text-blue-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                    {page.name}
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-gray-700">
                    {page.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* API Links Section */}
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">API y Enlaces Técnicos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">APIs Principales</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href={`${API_BASE}/`} target="_blank" className="hover:text-white">
                  • API Principal - Documentación completa
                </a>
              </li>
              <li>
                <a href={`${API_BASE}/anti-corruption/dashboard`} target="_blank" className="hover:text-white">
                  • Dashboard Anti-Corrupción
                </a>
              </li>
              <li>
                <a href={`${API_BASE}/advanced-fraud/system-status`} target="_blank" className="hover:text-white">
                  • Estado Sistema Avanzado
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Enlaces Oficiales</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="https://carmendeareco.gob.ar/transparencia/" target="_blank" className="hover:text-white">
                  • Portal Oficial Carmen de Areco
                </a>
              </li>
              <li>
                <a href="https://www.gba.gob.ar/transparencia_fiscal/" target="_blank" className="hover:text-white">
                  • Transparencia Fiscal Provincia BA
                </a>
              </li>
              <li>
                <a href="https://www.argentina.gob.ar/anticorrupcion" target="_blank" className="hover:text-white">
                  • Oficina Anticorrupción Nacional
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPages;