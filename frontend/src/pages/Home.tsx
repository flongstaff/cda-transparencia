/**
 * Home Page Component
 * Main landing page for the transparency portal
 */

import React, { useState, useEffect } from 'react';
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
  Search,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Github,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

// OPTIMIZED navigation showcasing ALL your components
const quickLinks = [
  {
    title: 'Master Dashboard',
    description: 'Vista completa de TODOS los componentes y datos del sistema',
    path: '/master',
    icon: <LayoutDashboard className="w-6 h-6 text-purple-500" />,
    color: 'bg-purple-50 border-purple-200',
    highlight: true
  },
  {
    title: 'Presupuesto Anual',
    description: 'Ver el presupuesto municipal con análisis completo',
    path: '/budget',
    icon: <DollarSign className="w-6 h-6 text-green-500" />,
    color: 'bg-green-50 border-green-200'
  },
  {
    title: 'Dashboard Principal',
    description: 'Resumen ejecutivo y métricas principales',
    path: '/dashboard',
    icon: <Calculator className="w-6 h-6 text-blue-500" />,
    color: 'bg-blue-50 border-blue-200'
  },
  {
    title: 'Contratos y Licitaciones',
    description: 'Acceder a contratos firmados y licitaciones públicas',
    path: '/contracts',
    icon: <Briefcase className="w-6 h-6 text-orange-500" />,
    color: 'bg-orange-50 border-orange-200'
  },
  {
    title: 'Todos los Documentos',
    description: 'Explorar todos los documentos disponibles en el portal',
    path: '/documents',
    icon: <FileText className="w-6 h-6 text-gray-500" />,
    color: 'bg-gray-50 border-gray-200'
  },
  {
    title: 'Dashboard General',
    description: 'Resumen general de datos financieros y de transparencia',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-6 h-6 text-purple-500" />,
    color: 'bg-purple-50 border-purple-200'
  },
  {
    title: 'Datos por Año',
    description: 'Análisis detallado de datos por año fiscal',
    path: '/dashboard',
    icon: <Calendar className="w-6 h-6 text-blue-500" />,
    color: 'bg-blue-50 border-blue-200'
  }
];

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // In a real implementation, this would navigate to search results
      alert(`Buscando: ${searchTerm}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl overflow-hidden mb-12">
        <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Portal de Transparencia Municipal
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Acceso ciudadano a la información financiera y administrativa del Municipio de Carmen de Areco
              </p>
              <div className="flex flex-wrap gap-3">
                <Link 
                  to="/dashboard" 
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Ver Resumen General
                </Link>
                <Link 
                  to="/documents" 
                  className="px-6 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors inline-flex items-center"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Explorar Documentos
                </Link>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6">
                <Shield className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Buscar información en el portal
          </h2>
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar documentos, presupuestos, contratos, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-24 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Acceso Rápido a Información</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className={`${link.color} border rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 rounded-lg bg-white shadow-sm">
                  {link.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                  <p className="text-gray-600 text-sm">{link.description}</p>
                  <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                    <span>Acceder</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen del Portal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-8 h-8 text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Indicadores Financieros</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Visualización de indicadores clave de la gestión financiera municipal
            </p>
            <Link 
              to="/dashboard" 
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              Ver indicadores
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <PieChart className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Distribución de Gastos</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Análisis de cómo se distribuyen los gastos municipales por categoría
            </p>
            <Link 
              to="/spending" 
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              Ver distribución
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <LineChart className="w-8 h-8 text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Evolución Temporal</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Seguimiento de la evolución de ingresos y gastos a lo largo del tiempo
            </p>
            <Link 
              to="/year/2025" 
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              Ver evolución
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-3/4 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sistema de Transparencia Activo
            </h3>
            <p className="text-gray-700">
              Este portal proporciona acceso libre y gratuito a la información pública del Municipio 
              de Carmen de Areco, cumpliendo con las normativas de transparencia activa.
            </p>
          </div>
          <div className="md:w-1/4 flex justify-center">
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full border border-green-200">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-green-700">
                Sistema Activo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;