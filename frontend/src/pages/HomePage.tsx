import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  DollarSign,
  Building,
  Search,
  Shield,
  Gavel
} from 'lucide-react';

const HomePage: React.FC = () => {
  const mainSections = [
    {
      title: 'Portal Ciudadano',
      description: 'Accede a información financiera adaptada para ciudadanos',
      icon: <Eye className="w-8 h-8" />,
      path: '/citizen-transparency',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'transparency',
      title: 'Anticorrupción',
      description: 'Sistema de seguimiento de casos de corrupción y transparencia',
      icon: <Shield className="w-8 h-8" />,
      path: '/transparency-portal',
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'budget',
      title: 'Presupuesto',
      description: 'Análisis detallado del presupuesto municipal y su ejecución',
      icon: <DollarSign className="w-8 h-8" />,
      path: '/budget',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'documents',
      title: 'Documentos',
      description: 'Acceso a todos los documentos oficiales de transparencia',
      icon: <FileText className="w-8 h-8" />,
      path: '/documents',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'contracts',
      title: 'Contratos',
      description: 'Información sobre licitaciones y contrataciones públicas',
      icon: <FileText className="w-8 h-8" />,
      path: '/contracts',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'salaries',
      title: 'Salarios',
      description: 'Datos sobre remuneraciones del personal municipal',
      icon: <Users className="w-8 h-8" />,
      path: '/salaries',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const quickStats = [
    { label: 'Documentos Verificados', value: '173', change: '+12 este mes' },
    { label: 'Presupuesto Ejecutado', value: '75%', change: '+2.3%' },
    { label: 'Índice de Transparencia', value: '85%', change: '+5.1%' },
    { label: 'Alertas Activas', value: '3', change: '-2' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-blue-200" />
            <h1 className="text-4xl font-bold mb-4">Portal de Transparencia Municipal</h1>
            <p className="text-xl text-blue-100 mb-8">
              Carmen de Areco - Accede a información verificada sobre la gestión pública
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/citizen-transparency" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Portal Ciudadano
              </Link>
              <Link 
                to="/transparency-portal" 
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Anticorrupción
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-sm text-green-600 mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Main Sections */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Acceso Directo a Secciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainSections.map((section, index) => (
              <Link 
                key={index}
                to={section.path}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className={`inline-flex p-3 rounded-lg ${section.color} mb-4`}>
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600">{section.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre este Portal</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Este portal proporciona acceso transparente a la información financiera y administrativa 
              del municipio de Carmen de Areco. Todos los datos provienen de fuentes oficiales y son 
              verificados para garantizar su precisión y actualidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentos Oficiales</h3>
              <p className="text-gray-600">
                Accede a todos los documentos de transparencia publicados por el municipio
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-full mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Análisis Financiero</h3>
              <p className="text-gray-600">
                Visualiza datos financieros mediante gráficos y análisis detallados
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Anticorrupción</h3>
              <p className="text-gray-600">
                Sistema de seguimiento de irregularidades y casos documentados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;